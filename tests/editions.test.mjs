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
    collections: ["form", "flow"],
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

test('collection interests reach the studio and acquisition enquiries send directly', async () => {
  const s = setup(), admin = await auth(s);
  const data = {name:'Collector',email:'collector@example.com',collections:['form','flow','invalid'],message:'Interested in a pair.'};
  assert.equal((await s.call('request',data)).status,200);
  assert.match(s.emails.find(e=>e.to==='ctalmon@gmail.com').text,/FORM, FLOW/);
  assert.match(s.emails.find(e=>e.to==='ctalmon@gmail.com').text,/Interested in a pair/);
  const requests = (await (await s.call('studio-data',null,admin)).json()).requests;
  assert.deepEqual(requests[0].collections,['form','flow']);
  const work = catalog.find(w=>w.formats.length);
  assert.equal((await s.call('enquiry',{...data,work:work.id,format:work.formats[0].key})).status,200);
  assert.match(s.emails.at(-1).subject,/Acquisition enquiry/);
  assert.ok(s.emails.at(-1).text.includes(work.title));
  assert.equal((await s.call('enquiry',{...data,work:'missing'})).status,400);
});

test('all collector locales receive localized confirmation and invitation links', async()=>{
 for(const locale of ['en','fr','es','it','de','ja','zh']) {
  const s=setup(), admin=await auth(s);
  await s.call('request',{name:'Collector',email:'test@example.com',collections:['form'],locale,consent:true});
  const confirmation=s.emails.at(-1);
  assert.ok(confirmation.text.includes(`/${locale}/mailing-list/?confirm=`));
  const link=new URL(confirmation.text.match(/https:\/\/\S+/)[0]);
  assert.equal((await s.call('confirm-subscription',{subscriber:link.searchParams.get('subscriber'),token:link.searchParams.get('confirm')})).status,200);
  const data=await (await s.call('studio-data',null,admin)).json();
  assert.equal(data.subscribers[0].locale,locale);
  await s.call('studio-approve',{id:data.requests[0].id},admin);
  assert.ok(s.emails.at(-1).text.includes(`/${locale}/editions/`));
  if(locale!=='en') assert.notEqual(confirmation.subject,'Confirm your studio updates subscription');
 }
});
test('unsubscribe requires an emailed valid token, preserves collector access, and expires after 48 hours',async()=>{
 const s=setup(), admin=await auth(s), invitation=await invite(s,admin);
 await s.call('subscribe',{email:'collector@example.com',consent:true,locale:'fr'});
 const confirm=new URL(s.emails.at(-1).text.match(/https:\/\/\S+/)[0]);
 const subscriber=confirm.searchParams.get('subscriber');
 await s.call('confirm-subscription',{subscriber,token:confirm.searchParams.get('confirm')});
 const before=s.emails.length;
 assert.equal((await s.call('request-unsubscribe',{email:'unknown@example.com'})).status,200);
 assert.equal(s.emails.length,before);
 await s.call('request-unsubscribe',{email:'collector@example.com',locale:'fr'});
 const url=new URL(s.emails.at(-1).text.match(/https:\/\/\S+/)[0]), token=url.searchParams.get('unsubscribe');
 assert.ok(url.pathname.startsWith('/fr/mailing-list/'));
 assert.equal((await s.call('unsubscribe',{subscriber,token:'wrong'})).status,400);
 assert.equal((await s.call('unsubscribe',{subscriber,token})).status,200);
 assert.equal(s.values.has('subscriber/'+subscriber),false);
 assert.equal((await s.call('catalog',null,invitation.cookie)).status,200);
 assert.equal((await s.call('unsubscribe',{subscriber,token})).status,400);
 await s.call('subscribe',{email:'collector@example.com',consent:true});
 await s.call('request-unsubscribe',{email:'collector@example.com'});
 const expired=new URL(s.emails.at(-1).text.match(/https:\/\/\S+/)[0]);
 s.advance(2*86400000);
 assert.equal((await s.call('unsubscribe',{subscriber,token:expired.searchParams.get('unsubscribe')})).status,400);
 assert.equal(s.values.has('subscriber/'+subscriber),true);
});

test('collection pricing applies atomically to one format and preserves individual sales and other collections',async()=>{
 const s=setup(), admin=await auth(s), inv=await invite(s,admin);
 const first=catalog.find(w=>w.formats.length>1), format=first.formats[0];
 const targets=catalog.filter(w=>w.collection===first.collection&&w.formats.some(f=>f.key===format.key));
 const max=Math.max(...targets.map(w=>w.formats.find(f=>f.key===format.key).edition));
 const original=Array.from({length:Math.ceil(format.edition/2)},()=>1000);
 await s.call('studio-save',{id:first.id,format:format.key,sold:2,currency:'USD',bands:original,version:0},admin);
 const otherFormat=first.formats[1];
 await s.call('studio-save',{id:first.id,format:otherFormat.key,sold:1,currency:'USD',bands:Array.from({length:Math.ceil(otherFormat.edition/2)},()=>9000),version:1},admin);
 const bands=Array.from({length:Math.ceil(max/2)},(_,i)=>2000+i*500);
 const payload={collection:first.collection,format:format.key,currency:'EUR',bands,version:2,sold:0};
 assert.equal((await s.call('studio-save-collection',payload)).status,401);
 const result=await (await s.call('studio-save-collection',payload,admin)).json();
 assert.equal(result.updated,targets.length);
 assert.equal(result.prices.version,3);
 for(const work of targets){
  const value=result.prices.items[work.id+'::'+format.key],f=work.formats.find(f=>f.key===format.key);
  assert.deepEqual(value.bands,bands.slice(0,Math.ceil(f.edition/2)));
  assert.equal(value.currency,'EUR');
  assert.equal(value.sold,work.id===first.id?2:null);
 }
 assert.equal(result.prices.items[first.id+'::'+otherFormat.key].bands[0],9000);
 assert.ok(Object.keys(result.prices.items).every(k=>k.startsWith(first.collection+'/')));
 assert.equal((await s.call('studio-save-collection',payload,admin)).status,409);
 assert.equal((await s.call('studio-save-collection',{...payload,version:3,bands:[-1]},admin)).status,400);
 assert.equal((await s.call('studio-save-collection',{...payload,version:3,collection:'missing'},admin)).status,400);
 const current=await (await s.call('catalog',null,inv.cookie)).json();
 const priced=current.works.find(w=>w.id===first.id).formats.find(f=>f.key===format.key);
 assert.equal(priced.sold,2);assert.equal(priced.price,2500);
 const untouchedSales=current.works.find(w=>w.id!==first.id&&w.collection===first.collection&&w.formats.some(f=>f.key===format.key)).formats.find(f=>f.key===format.key);
 assert.equal(untouchedSales.sold,null);assert.equal(untouchedSales.price,2000);
 const data=await (await s.call('studio-data',null,admin)).json();assert.equal(data.prices.version,3);
});

test('studio notices point to requests; collectors receive separate branded receipt and password invitation',async()=>{
 const s=setup(),admin=await auth(s);
 const work=catalog.find(w=>w.collection==='flow');
 await s.call('request',{name:'<script>test</script>',email:'collector@example.com',collections:['flow'],work:work.id});
 const studio=s.emails.find(e=>e.to==='ctalmon@gmail.com');
 const receipt=s.emails.find(e=>e.to==='collector@example.com');
 assert.match(studio.text,/editions-editor\/approve\/#id=/);
 assert.match(studio.text,/no collector password has been issued/);
 assert.ok(receipt.html.includes('&lt;script&gt;test&lt;/script&gt;'));
 assert.ok(!receipt.html.includes('<script>'));
 assert.ok(!receipt.text.includes('editions-editor'));
 assert.match(receipt.text,/Once reviewed/);
 const request=(await (await s.call('studio-data',null,admin)).json()).requests[0];
 await s.call('studio-approve',{id:request.id},admin);
 const invitation=s.emails.at(-1);
 const password=invitation.text.match(/Password: (\S+)/)[1];
 assert.ok(invitation.html.includes(password));
 assert.ok(!invitation.html.includes('editions-editor'));
 assert.ok(!invitation.text.includes('willowy-pika'));
 const link=invitation.text.match(/https:\/\/\S+/)[0];
 assert.equal(new URL(link).searchParams.get('work'),work.id);
 assert.equal((await s.call('unlock',{password})).status,200);
});

const approvalCredentials = s => {
 const mail=s.emails.filter(e=>e.to==='ctalmon@gmail.com').at(-1);
 const link=mail.text.match(/https:\/\/\S+\/editions-editor\/approve\/#[^\s]+/)[0];
 return Object.fromEntries(new URLSearchParams(new URL(link).hash.slice(1)));
};
test('email approval is scoped, expires, and requires an explicit one-use POST without granting studio access',async()=>{
 const s=setup();
 await s.call('request',{name:'Collector',email:'collector@example.com',collections:['flow']});
 const credentials=approvalCredentials(s),count=s.emails.length;
 assert.equal((await s.call('email-approve')).status,404);
 for(let i=0;i<2;i++) assert.equal((await s.call('email-review',credentials)).status,200);
 assert.equal(s.emails.length,count);
 assert.equal((await s.call('email-review',{...credentials,id:'a'.repeat(64)})).status,401);
 assert.equal((await s.call('email-approve',credentials,'','https://evil.example')).status,403);
 assert.equal((await s.call('studio-data')).status,401);
 const results=await Promise.all([s.call('email-approve',credentials),s.call('email-approve',credentials)]);
 assert.equal(results.filter(r=>r.status===200).length,1);
 assert.equal(s.emails.length,count+1);
 assert.equal((await s.call('email-approve',credentials)).status,401);
 const password=s.emails.at(-1).text.match(/Password: (\S+)/)[1];
 assert.equal((await s.call('unlock',{password})).status,200);
 assert.equal((await s.call('studio-data')).status,401);
 s.advance(86400001);
 assert.equal((await s.call('unlock',{password})).status,401);
});
test('old email approval links expire or are superseded by a new request or studio approval',async()=>{
 const s=setup();
 const request={name:'Collector',email:'collector@example.com',collections:['form']};
 await s.call('request',request);const old=approvalCredentials(s);
 await s.call('request',request);const current=approvalCredentials(s);
 assert.equal((await s.call('email-review',old)).status,401);
 assert.equal((await s.call('email-review',current)).status,200);
 s.advance(2*86400000+1);
 assert.equal((await s.call('email-approve',current)).status,401);
 await s.call('request',request);const next=approvalCredentials(s);
 const admin=await auth(s);
 await s.call('studio-approve',{id:next.id},admin);
 assert.equal((await s.call('email-approve',next)).status,401);
});


test('collector catalog is restricted to approved collections, including existing legacy sessions', async()=>{
 const s=setup(), admin=await auth(s), inv=await invite(s,admin);
 const view=async()=>await (await s.call('catalog',null,inv.cookie)).json();
 assert.deepEqual([...new Set((await view()).works.map(w=>w.collection))],['form','flow']);
 // Simulate an invitation issued before collection scopes were stored.
 const grant=[...s.values].find(([key])=>key.startsWith('grant/'))[1].data;
 delete grant.collections;
 assert.deepEqual([...new Set((await view()).works.map(w=>w.collection))],['form','flow']);
 // A repeat request cannot expand an already approved invitation.
 await s.call('request',{name:'Collector',email:'collector@example.com',collections:['world']});
 assert.deepEqual([...new Set((await view()).works.map(w=>w.collection))],['form','flow']);
 await s.call('studio-approve',{id:inv.id},admin);
 assert.equal((await s.call('catalog',null,inv.cookie)).status,401);
 const password=s.emails.at(-1).text.match(/Password: (\S+)/)[1];
 const cookie=(await s.call('unlock',{password})).headers.get('set-cookie').split(';')[0];
 const current=await (await s.call('catalog',null,cookie)).json();
 assert.deepEqual([...new Set(current.works.map(w=>w.collection))],['world']);
});
test('missing or untraceable collection scopes never grant access to the whole catalog',async()=>{
 const s=setup(), admin=await auth(s);
 for(const collections of [[],['invalid']]) {
  assert.equal((await s.call('request',{name:'Collector',email:'collector@example.com',collections})).status,400);
 }
 const inv=await invite(s,admin);
 const grant=[...s.values].find(([key])=>key.startsWith('grant/'))[1].data;
 delete grant.collections;
 s.values.delete('request/'+inv.id);
 assert.equal((await s.call('catalog',null,inv.cookie)).status,401);
 assert.equal((await s.call('unlock',{password:inv.password})).status,401);
});
test('email approval stores only requested collections and ignores an unrelated work URL',async()=>{
 const s=setup();
 await s.call('request',{name:'Collector',email:'collector@example.com',collections:['flow','form'],work:catalog.find(w=>w.collection==='world').id});
 const credentials=approvalCredentials(s);
 await s.call('email-approve',credentials);
 const password=s.emails.at(-1).text.match(/Password: (\S+)/)[1];
 const cookie=(await s.call('unlock',{password})).headers.get('set-cookie').split(';')[0];
 const result=await (await s.call('catalog',null,cookie)).json();
 assert.deepEqual([...new Set(result.works.map(w=>w.collection))],['form','flow']);
 assert.ok(result.works.every(w=>w.formats.every(f=>Number.isInteger(f.edition)&&f.editionLabel)));
});
