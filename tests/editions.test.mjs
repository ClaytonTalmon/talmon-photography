import test from "node:test";
import assert from "node:assert/strict";
import { createHandler } from "../netlify/lib/editions.mjs";
import catalog from "../src/data/edition-catalog.mjs";
function setup() {
  let clock = 1000000;
  const values = new Map(),
    emails = [];
  let sequence = 0;
  const store = {
    get: async (k) => structuredClone(values.get(k)?.data ?? null),
    getWithMetadata: async (k) => structuredClone(values.get(k) ?? null),
    setJSON: async (k, v, o = {}) => {
      const old = values.get(k);
      if (
        (o.onlyIfNew && old) ||
        (o.onlyIfMatch && old?.etag !== o.onlyIfMatch)
      )
        return { modified: false };
      values.set(k, { data: structuredClone(v), etag: String(++sequence) });
      return { modified: true };
    },
    delete: async (k) => values.delete(k),
    list: async ({ prefix }) => ({
      blobs: [...values.keys()]
        .filter((k) => k.startsWith(prefix))
        .map((key) => ({ key })),
    }),
  };
  const handler = createHandler({
    store,
    now: () => clock,
    send: async (message) => emails.push(message),
    github: async (url) =>
      Response.json(
        url.endsWith("/user")
          ? { login: "ClaytonTalmon" }
          : { full_name: "ClaytonTalmon/talmon-photography" },
      ),
  });
  const call = (action, data, cookie = "", origin = "https://example.com") =>
    handler(
      new Request(
        "https://example.com/.netlify/functions/editions?action=" + action,
        {
          method: data ? "POST" : "GET",
          headers: {
            origin,
            cookie,
            "Content-Type": "application/json",
            "x-nf-client-connection-ip": "127.0.0.1",
          },
          body: data ? JSON.stringify(data) : undefined,
        },
      ),
    );
  return { call, values, emails, advance: (n) => (clock += n) };
}
const auth = async (s) =>
  (await s.call("studio-login", { token: "owner-token" })).headers
    .get("set-cookie")
    .split(";")[0];
async function invite(s, admin) {
  await s.call("request", {
    name: "Test Collector",
    email: "collector@example.com",
  });
  const data = await (await s.call("studio-data", null, admin)).json();
  const id = data.requests[0].id;
  assert.equal((await s.call("studio-approve", { id }, admin)).status, 200);
  const password = s.emails.at(-1).text.match(/Password: (\S+)/)[1];
  const r = await s.call("unlock", { password });
  return { id, password, cookie: r.headers.get("set-cookie").split(";")[0] };
}
test("private prices require authenticated access, including direct API requests", async () => {
  const s = setup();
  assert.equal((await s.call("catalog")).status, 401);
  assert.equal((await s.call("studio-data")).status, 401);
  assert.equal((await s.call("studio-save", {})).status, 401);
  assert.equal((await s.call("unlock", { password: "wrong" })).status, 401);
  assert.equal(
    (
      await s.call(
        "request",
        { name: "A", email: "a@b.com" },
        "",
        "https://evil.test",
      )
    ).status,
    403,
  );
});
test("24-hour grant expires regardless of later login; revocation ends existing sessions", async () => {
  const s = setup(),
    admin = await auth(s),
    invite1 = await invite(s, admin);
  assert.equal((await s.call("catalog", null, invite1.cookie)).status, 200);
  s.advance(86399000);
  assert.equal(
    (await s.call("unlock", { password: invite1.password })).status,
    200,
  );
  s.advance(1000);
  assert.equal((await s.call("catalog", null, invite1.cookie)).status, 401);
  assert.equal(
    (await s.call("unlock", { password: invite1.password })).status,
    401,
  );
  const admin2 = await auth(s),
    invite2 = await invite(s, admin2);
  await s.call("studio-revoke", { id: invite2.id }, admin2);
  assert.equal((await s.call("catalog", null, invite2.cookie)).status, 401);
});
test("brackets advance after every two sales; no demo or future prices leak; stale edits rejected", async () => {
  const s = setup(),
    admin = await auth(s),
    inv = await invite(s, admin),
    w = catalog.find((w) => w.collection === "form" && w.formats.length),
    f = w.formats[0],
    bands = Array.from(
      { length: Math.ceil(f.edition / 2) },
      (_, i) => 1000 + i * 500,
    );
  let r = await s.call(
    "studio-save",
    { id: w.id, format: f.key, sold: 2, currency: "USD", bands, version: 0 },
    admin,
  );
  assert.equal(r.status, 200);
  const data = await (await s.call("catalog", null, inv.cookie)).json(),
    format = data.works.find((a) => a.id === w.id).formats[0];
  assert.equal(format.price, 1500);
  assert.equal(format.sold, 2);
  assert.equal(format.bands, undefined);
  const other = data.works.find((a) => a.id !== w.id && a.formats.length);
  assert.equal(other.formats[0].price, null);
  assert.equal(other.formats[0].sold, null);
  assert.equal(
    (
      await s.call(
        "studio-save",
        {
          id: w.id,
          format: f.key,
          sold: 1,
          currency: "USD",
          bands,
          version: 0,
        },
        admin,
      )
    ).status,
    409,
  );
  assert.equal(
    (
      await s.call(
        "studio-save",
        {
          id: w.id,
          format: f.key,
          sold: f.edition,
          currency: "USD",
          bands,
          version: 1,
        },
        admin,
      )
    ).status,
    200,
  );
  const out = await (await s.call("catalog", null, inv.cookie)).json();
  assert.equal(out.works.find((a) => a.id === w.id).formats[0].soldOut, true);
});
test("mailing list requires explicit consent and confirmation; access request does not subscribe", async () => {
  const s = setup();
  await s.call("request", { name: "A", email: "a@example.com" });
  assert.equal(
    [...s.values.keys()].filter((k) => k.startsWith("subscriber/")).length,
    0,
  );
  assert.equal(
    (await s.call("subscribe", { email: "a@example.com" })).status,
    400,
  );
  assert.equal(
    (await s.call("subscribe", { email: "a@example.com", consent: true }))
      .status,
    200,
  );
  const link = s.emails.at(-1).text.match(/https:\/\/\S+/)[0],
    url = new URL(link);
  assert.equal(
    (
      await s.call("confirm-subscription", {
        subscriber: url.searchParams.get("subscriber"),
        token: url.searchParams.get("confirm"),
      })
    ).status,
    200,
  );
  const record = [...s.values].find(([k]) => k.startsWith("subscriber/"))[1]
    .data;
  assert.equal(record.status, "confirmed");
});
test("reissue invalidates previous invitation and logout destroys session", async () => {
  const s = setup(),
    admin = await auth(s),
    a = await invite(s, admin),
    b = await invite(s, admin);
  assert.equal((await s.call("catalog", null, a.cookie)).status, 401);
  await s.call("logout", {}, b.cookie);
  assert.equal((await s.call("catalog", null, b.cookie)).status, 401);
});
test("catalog respects portrait and landscape FORM sizes", () => {
  const portrait = catalog.find((w) => w.title === "Current Change"),
    landscape = catalog.find((w) => w.title === "The Tempest");
  assert.deepEqual(
    [portrait.formats[0].width, portrait.formats[0].height],
    [75, 105],
  );
  assert.deepEqual(
    [landscape.formats[0].width, landscape.formats[0].height],
    [105, 75],
  );
  assert.deepEqual(
    [portrait.formats[1].width + 14, portrait.formats[1].height + 17],
    [114.45, 167],
  );
});
