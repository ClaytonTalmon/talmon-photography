import { createHash, randomBytes } from "node:crypto";
import catalog from "../../src/data/edition-catalog.mjs";
const DAY = 86400000,
  OWNER = "ClaytonTalmon";
const hash = (v) => createHash("sha256").update(v).digest("hex");
const token = () => randomBytes(24).toString("base64url");
const emailOK = (v) =>
  typeof v === "string" &&
  v.length <= 254 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const cookie = (name, value, seconds) =>
  `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${seconds}`;
export function createHandler({
  store,
  send,
  github = fetch,
  now = () => Date.now(),
}) {
  const read = (k) => store.get(k, { type: "json" });
  const write = (k, v) => store.setJSON(k, v);
  const response = (data, status = 200, headers = {}) =>
    Response.json(data, {
      status,
      headers: {
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        ...headers,
      },
    });
  async function session(req, kind) {
    const value = req.headers
      .get("cookie")
      ?.split("; ")
      .find((v) => v.startsWith(kind + "="))
      ?.slice(kind.length + 1);
    if (!value || value.length > 100) return null;
    const s = await read("session/" + hash(value));
    if (!s || s.kind !== kind || s.expires <= now()) return null;
    if (kind === "collector") {
      const grant = await read("grant/" + s.grant);
      if (!grant || grant.revoked || grant.expires <= now()) return null;
    }
    return s;
  }
  async function newSession(kind, expires, extra = {}) {
    const value = token();
    await write("session/" + hash(value), { kind, expires, ...extra });
    return cookie(kind, value, Math.floor((expires - now()) / 1000));
  }
  return async (req) => {
    try {
      const url = new URL(req.url),
        action = url.searchParams.get("action") || "catalog";
      if (!["GET", "POST"].includes(req.method))
        return response({ error: "Method not allowed." }, 405);
      if (req.method === "POST" && req.headers.get("origin") !== url.origin)
        return response({ error: "Origin not allowed." }, 403);
      let p = {};
      if (req.method === "POST") {
        const text = await req.text();
        if (text.length > 40000)
          return response({ error: "Request too large." }, 413);
        try {
          p = JSON.parse(text);
        } catch {
          return response({ error: "Invalid request." }, 400);
        }
      }
      const fail = (message, status = 400) =>
        response({ error: message }, status);
      if (action === "logout" && req.method === "POST") {
        for (const kind of ["collector", "studio"]) {
          const value = req.headers
            .get("cookie")
            ?.split("; ")
            .find((v) => v.startsWith(kind + "="))
            ?.slice(kind.length + 1);
          if (value) await store.delete("session/" + hash(value));
        }
        const headers = new Headers({ "Cache-Control": "no-store" });
        headers.append("Set-Cookie", cookie("collector", "", 0));
        headers.append("Set-Cookie", cookie("studio", "", 0));
        return Response.json({ ok: true }, { headers });
      }
      // Limit repeated submissions without recording visitors' raw IP addresses.
      if (req.method === "POST" && !(await session(req, "studio"))) {
        const key = "limit/" + hash(req.headers.get("x-nf-client-connection-ip") || "unknown");
        let limited = true;
        for (let attempt = 0; attempt < 5; attempt++) {
          const snapshot = await store.getWithMetadata(key, {type: "json"});
          const window = Math.floor(now() / 3600000);
          const count = snapshot?.data?.window === window ? snapshot.data.count : 0;
          if (count >= 20) break;
          const saved = await store.setJSON(key, {window, count: count + 1}, snapshot ? {onlyIfMatch: snapshot.etag} : {onlyIfNew: true});
          if (saved.modified) { limited = false; break; }
        }
        if (limited) return fail("Too many attempts. Please try again in an hour.", 429);
      }
      if (action === "studio-login" && req.method === "POST") {
        if (typeof p.token !== "string" || p.token.length > 300)
          return fail("Enter your GitHub access token.");
        const headers = {
          Authorization: `Bearer ${p.token}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "Talmon-Editions",
        };
        const user = await github("https://api.github.com/user", { headers });
        if (
          !user.ok ||
          (await user.json()).login?.toLowerCase() !== OWNER.toLowerCase()
        )
          return fail("Sign in with the website owner’s GitHub account.", 401);
        const repo = await github(
          "https://api.github.com/repos/ClaytonTalmon/talmon-photography",
          { headers },
        );
        if (!repo.ok)
          return fail("This token cannot access the website repository.", 403);
        return response({ ok: true }, 200, {
          "Set-Cookie": await newSession("studio", now() + 8 * 3600000),
        });
      }
      if (action === "unlock" && req.method === "POST") {
        if (typeof p.password !== "string" || p.password.length > 100)
          return fail("Enter the password from your invitation.");
        const id = hash(p.password.trim()),
          grant = await read("grant/" + id);
        if (!grant || grant.revoked || grant.expires <= now())
          return fail(
            "This password is invalid or has expired. Please request new access.",
            401,
          );
        return response({ ok: true, expires: grant.expires }, 200, {
          "Set-Cookie": await newSession("collector", grant.expires, {
            grant: id,
          }),
        });
      }
      if (["request", "subscribe"].includes(action) && req.method === "POST") {
        if (p.company) return response({ ok: true });
        const email = String(p.email || "")
            .trim()
            .toLowerCase(),
          name = String(p.name || "")
            .trim()
            .slice(0, 120);
        if (!emailOK(email) || (action === "request" && !name))
          return fail("Please enter your name and a valid email address.");
        if (action === "subscribe" && p.consent !== true)
          return fail(
            "Please confirm that you wish to receive studio updates.",
          );
        if (action === "request") {
          const key = "request/" + hash(email),
            old = await read(key);
          const record = {
            id: hash(email),
            email,
            name,
            work: String(p.work || "").slice(0, 250),
            created: now(),
            status: "pending",
            ...old,
          };
          await write(key, record);
          await send({
            to: "ctalmon@gmail.com",
            reply_to: email,
            subject: "Collector access request — " + name,
            text: `${name}\n${email}\nWork: ${record.work || "All collections"}\n\nReview in the Editions Editor:\n${url.origin}/editions-editor/`,
          });
        }
        if (action === "subscribe" || p.consent === true) {
          const key = "subscriber/" + hash(email),
            old = await read(key);
          if (!old || old.status !== "confirmed") {
            const confirmation = token();
            await write(key, {
              email,
              name,
              status: "pending",
              requested: now(),
              confirmation: hash(confirmation),
              expires: now() + 2 * DAY,
            });
            await send({
              to: email,
              subject: "Confirm your studio updates subscription",
              text: `Please confirm that you would like occasional news of new work and exhibitions:\n${url.origin}/en/editions/?confirm=${confirmation}&subscriber=${hash(email)}\n\nThis link expires in 48 hours. If you did not request this, no action is needed.`,
            });
          }
        }
        return response({ ok: true });
      }
      if (action === "confirm-subscription" && req.method === "POST") {
        if (
          !/^[a-f0-9]{64}$/.test(p.subscriber || "") ||
          typeof p.token !== "string"
        )
          return fail("Invalid confirmation link.");
        const key = "subscriber/" + p.subscriber,
          s = await read(key);
        if (!s || s.confirmation !== hash(p.token) || s.expires <= now())
          return fail(
            "This confirmation link has expired. Please sign up again.",
          );
        await write(key, {
          email: s.email,
          name: s.name,
          status: "confirmed",
          confirmed: now(),
          consent: "Occasional studio news and exhibitions",
        });
        return response({ ok: true });
      }
      const admin = await session(req, "studio");
      if (action.startsWith("studio-")) {
        if (!admin) return fail("Please sign in to the Editions Editor.", 401);
        if (action === "studio-data" && req.method === "GET") {
          const rows = async (prefix) => {
            const { blobs } = await store.list({ prefix });
            return Promise.all(blobs.map((b) => read(b.key)));
          };
          return response({
            prices: (await read("prices")) || { version: 0, items: {} },
            requests: await rows("request/"),
            subscribers: await rows("subscriber/"),
          });
        }
        if (action === "studio-save" && req.method === "POST") {
          const work = catalog.find((w) => w.id === p.id),
            format = work?.formats.find((f) => f.key === p.format);
          if (!format) return fail("Unknown work or format.");
          if (
            !Number.isInteger(p.sold) ||
            p.sold < 0 ||
            p.sold > format.edition
          )
            return fail("Invalid edition sales count.");
          if (!["USD", "EUR", "GBP", "CHF"].includes(p.currency))
            return fail("Choose a supported currency.");
          if (
            !Array.isArray(p.bands) ||
            p.bands.length !== Math.ceil(format.edition / 2) ||
            p.bands.some(
              (x) =>
                x !== null && (!Number.isFinite(x) || x <= 0 || x > 10000000),
            )
          )
            return fail(
              "Enter valid prices, or leave fields blank for price on enquiry.",
            );
          const snapshot = await store.getWithMetadata("prices", {
            type: "json",
          });
          const entered = p.bands.filter((x) => x !== null);
          if (entered.some((x, i) => i > 0 && x < entered[i - 1]))
            return fail(
              "Later edition brackets must not be lower than earlier brackets.",
            );
          const current = snapshot?.data || { version: 0, items: {} };
          if (p.version !== current.version)
            return fail(
              "Prices changed in another session. Reload before saving.",
              409,
            );
          current.items[p.id + "::" + p.format] = {
            sold: p.sold,
            currency: p.currency,
            bands: p.bands,
          };
          current.version++;
          const saved = await store.setJSON(
            "prices",
            current,
            snapshot ? { onlyIfMatch: snapshot.etag } : { onlyIfNew: true },
          );
          if (!saved.modified)
            return fail(
              "Prices changed in another session. Reload before saving.",
              409,
            );
          return response({ ok: true, prices: current });
        }
        if (action === "studio-approve" && req.method === "POST") {
          if (!/^[a-f0-9]{64}$/.test(p.id || ""))
            return fail("Invalid request.");
          const record = await read("request/" + p.id);
          if (!record) return fail("Request not found.", 404);
          const password = token(),
            id = hash(password),
            expires = now() + DAY;
          await write("grant/" + id, {
            email: record.email,
            expires,
            revoked: false,
          });
          try {
            await send({
              to: record.email,
              subject: "Your private editions access — 24 hours",
              text: `Dear ${record.name},\n\nYou are invited to view editions and acquisition details.\n\n${url.origin}/en/editions/\nPassword: ${password}\n\nAccess expires ${new Date(expires).toUTCString()}, 24 hours from issue.\n\nFraming and shipping are not included in print prices.\n\nClayton Talmon de l’Armée`,
            });
          } catch (e) {
            await store.delete("grant/" + id);
            throw e;
          }
          if (record.grant) await store.delete("grant/" + record.grant);
          await write("request/" + p.id, {
            ...record,
            status: "approved",
            grant: id,
            expires,
          });
          return response({ ok: true, expires });
        }
        if (action === "studio-revoke" && req.method === "POST") {
          const record = await read("request/" + String(p.id));
          if (!record) return fail("Request not found.", 404);
          if (record.grant) await store.delete("grant/" + record.grant);
          await write("request/" + p.id, { ...record, status: "revoked" });
          return response({ ok: true });
        }
        if (action === "studio-remove-subscriber" && req.method === "POST") {
          if (!/^[a-f0-9]{64}$/.test(p.id || ""))
            return fail("Invalid subscriber.");
          await store.delete("subscriber/" + p.id);
          return response({ ok: true });
        }
        return fail("Unknown action.", 404);
      }
      if (action === "catalog" && req.method === "GET") {
        const visitor = await session(req, "collector");
        if (!visitor) return fail("Private access is required.", 401);
        const prices = (await read("prices"))?.items || {};
        // Return only current prices, never the private future tier schedule.
        return response({
          expires: visitor.expires,
          works: catalog.map((w) => ({
            ...w,
            formats: w.formats.map((f) => {
              const value = prices[w.id + "::" + f.key];
              const sold = value?.sold ?? 0;
              return {
                ...f,
                sold: value ? sold : null,
                soldOut: sold >= f.edition,
                currency: value?.currency || "USD",
                price:
                  sold >= f.edition
                    ? null
                    : (value?.bands[Math.floor(sold / 2)] ?? null),
              };
            }),
          })),
        });
      }
      return fail("Unknown action.", 404);
    } catch (error) {
      console.error("Editions request failed:", error.message);
      return response(
        {
          error:
            "The service is temporarily unavailable. Please try again or contact the studio.",
        },
        503,
      );
    }
  };
}
