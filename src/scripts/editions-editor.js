import { editionSummaries } from './edition-summary.js';
const $ = (id) => document.getElementById(id),
  catalog = JSON.parse($("catalog").textContent);
let state, version;
const embedded = window.parent !== window && new URLSearchParams(location.search).get('embedded') === '1';
let embeddedSession = '', pendingPricing = null, workspaceOrigin = null;
function publishPriceSummaries() {
 const message={type:'studio-price-summaries',summaries:state?editionSummaries(catalog,state.prices):null};
 if(frameReady)frame.contentWindow.postMessage(message,location.origin);
 if(embedded && workspaceOrigin && (workspaceOrigin===location.origin || (workspaceOrigin==='null' && embeddedSession)))
  window.parent.postMessage(message,workspaceOrigin==='null'?'*':workspaceOrigin);
}
function selectRequestedPricing() {
 if(!state || !pendingPricing)return;
 const selection=pendingPricing;
 if(!catalog.some(w=>w.collection===selection.collection)){pendingPricing=null;return;}
 if(priceDirty && !confirm('Discard unsaved price edits and open the selected pricing table?')){pendingPricing=null;return;}
 if(selection.scope==='individual' && !catalog.some(w=>w.id===selection.work && w.collection===selection.collection)){
  status('Publish this photograph first, then reopen the editor after the website rebuild finishes.',true);pendingPricing=null;return;
 }
 priceDirty=false;
 $('price-scope').value=selection.scope==='individual'?'individual':'collection';
 $('price-collection').value=selection.collection;
 populateWorks(selection.work);
 showSection('prices');pendingPricing=null;
}
if (embedded) {
 document.body.classList.add('embedded-studio');
 window.addEventListener('message',event=>{
  if(event.source!==window.parent || ![location.origin,'null'].includes(event.origin))return;
  workspaceOrigin=event.origin;
  publishPriceSummaries();
  if(event.data?.type==='studio-show-section' && ['prices','requests','mailing'].includes(event.data.section))showSection(event.data.section);
  if(event.data?.type==='studio-select-pricing'){
   pendingPricing={collection:event.data.collection,scope:event.data.scope,work:event.data.work};
   showSection('prices');selectRequestedPricing();
  }
 });
}
let publishingToken = '', frameReady = false, requestedCollection = '';
let priceDirty = false;
const frame = $('collection-editor-frame');
function clearPublishingConnection() {
  publishingToken = '';
  if (frameReady) frame.contentWindow.postMessage({type:'studio-disconnect'}, location.origin);
}
function connectCollectionFrame() {
  if (!frameReady) return;
  if (publishingToken) frame.contentWindow.postMessage({type:'studio-connect',token:publishingToken},location.origin);
  if (requestedCollection) {
    frame.contentWindow.postMessage({type:'studio-select-collection',collection:requestedCollection},location.origin);
    requestedCollection='';
  }
}
function showSection(section) {
  if (!['collections','prices','requests','mailing'].includes(section)) section='collections';
  document.querySelectorAll('[data-studio-panel]').forEach(panel=>panel.hidden=panel.dataset.studioPanel!==section);
  document.querySelectorAll('[data-section]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.section===section)));
  history.replaceState({},'',location.pathname+location.search+'#'+section);
  if (section==='collections') {
    if (!frame.getAttribute('src')) frame.src='/editor/collections.html?studioChild=1';
    connectCollectionFrame();
  }
}
for (const button of document.querySelectorAll('[data-section]')) button.onclick=()=>showSection(button.dataset.section);
window.addEventListener('message',event=>{
  if (event.origin!==location.origin || event.source!==frame.contentWindow) return;
  const data=event.data;
  if(data?.type==='studio-collection-ready') {frameReady=true;connectCollectionFrame();publishPriceSummaries();}
  if(data?.type==='studio-collection-height' && Number.isFinite(data.height)) frame.style.height=Math.max(500,Math.min(100000,data.height+10))+'px';
  if(data?.type==='studio-edit-prices') {
    const work=catalog.find(w=>w.id===data.work);
    if(!work) {status('Publish the new photograph first, then reload the Studio Editor after the website rebuild finishes.');return;}
    if(priceDirty && !confirm('Discard unsaved price edits and open this photograph?')) return;
    $('price-scope').value='individual';
    $('price-collection').value=work.collection;
    populateWorks(work.id);
    showSection('prices');
    $('panel-prices').scrollIntoView({block:'start',behavior:'smooth'});
  }
});
$('edit-collection-details').onclick=()=>{
  requestedCollection=$('price-collection').value;
  showSection('collections');
};
window.addEventListener('beforeunload',event=>{
  if(priceDirty){event.preventDefault();event.returnValue='';}
});
const status = (s, error = false) => {
  $("status").textContent = s;
  $("status").classList.toggle("error", error);
};
async function api(action, data) {
  const r = await fetch(
    "/.netlify/functions/editions?action=studio-" + action,
    {
      method: data ? "POST" : "GET",
      headers: { ...(data ? { "Content-Type": "application/json" } : {}), ...(embeddedSession ? {"X-Studio-Session":embeddedSession} : {}) },
      body: data ? JSON.stringify(data) : undefined,
      cache: "no-store",
    },
  );
  if (r.status === 404 || r.status === 503) {
    throw new Error("The secure service is not connected on this host. This editor requires a Netlify deployment with Functions enabled.");
  }
  const result = await r.json();
  if (!r.ok) {
    if (r.status === 401) {
      state=null;publishPriceSummaries();
      clearPublishingConnection();
      $("studio").hidden = true;
      $("login").hidden = false;
    }
    throw Error(result.error || "Please try again.");
  }
  return result;
}
const option = (value, text) => {
  const o = document.createElement("option");
  o.value = value;
  o.textContent = text;
  return o;
};
function populateWorks(selectedId) {
  const works=catalog.filter(w=>w.collection===$('price-collection').value);
  $('work').replaceChildren(...works.map(w=>option(w.id,w.title)));
  if(works.some(w=>w.id===selectedId)) $('work').value=selectedId;
  formats();
}
function collectionPricing() { return $('price-scope').value === 'collection'; }
function priceTargets() {
  return catalog.filter(w=>w.collection===$('price-collection').value)
    .flatMap(w=>w.formats.filter(f=>f.key===$('format').value).map(f=>({work:w,format:f})));
}
function formats() {
  const previous=$('format').value;
  const works=collectionPricing()?catalog.filter(w=>w.collection===$('price-collection').value):catalog.filter(w=>w.id===$('work').value);
  const available=[...new Map(works.flatMap(w=>w.formats).map(f=>[f.key,f])).values()];
  $('format').replaceChildren(...available.map(f=>option(f.key,f.label)));
  if(available.some(f=>f.key===previous)) $('format').value=previous;
  pricing();
}
function pricing() {
  if (!state) return;
  priceDirty=false;
  const bulk=collectionPricing(), targets=priceTargets();
  const w=catalog.find(w=>w.id===$('work').value);
  const f=bulk?(targets.length ? {...targets[0].format,edition:Math.max(...targets.map(t=>t.format.edition))}:null):w?.formats.find(f=>f.key===$('format').value);
  $('pricing').dataset.collection=$('price-collection').value;
  $('pricing').dataset.work=$('work').value;
  $('pricing').dataset.format=$('format').value;
  $('pricing').dataset.scope=$('price-scope').value;
  $('work-field').hidden=bulk;
  $('sold-field').hidden=bulk;
  $('sold').disabled=bulk;
  $('pricing').hidden=!f;
  $('missing').hidden=!!f;
  if(!f) return;
  let p=state.prices.items[w.id+'::'+f.key];
  const note=$('collection-price-note');
  note.hidden=!bulk;
  if(bulk) {
    const values=targets.map(t=>state.prices.items[t.work.id+'::'+f.key]);
    const currencies=[...new Set(values.map(v=>v?.currency||'USD'))];
    const mixed=currencies.length>1 || Array.from({length:Math.ceil(f.edition/2)},(_,i)=>{
      const bands=targets.flatMap((t,j)=>i<Math.ceil(t.format.edition/2)?[values[j]?.bands[i]??null]:[]);
      return new Set(bands).size>1;
    }).some(Boolean);
    p={currency:currencies.length===1?currencies[0]:'USD',bands:Array.from({length:Math.ceil(f.edition/2)},(_,i)=>mixed?null:(values.find(v=>v?.bands.length>i)?.bands[i]??null))};
    note.textContent=mixed?'Existing prices differ between photographs. Enter a complete schedule below to replace them. Blank brackets will become “Price on enquiry”.':'This schedule applies to all existing photographs with this format. Shorter editions use only the brackets they need.';
  }
  version=state.prices.version;
  $('currency').value=p?.currency||'USD';
  $('sold').value=p?.sold??0;
  $('sold').max=f.edition;
  $('size-summary').textContent=bulk?`${$('price-collection').value.toUpperCase()} · ${f.label} · ${targets.length} photographs. Dimensions and sales counts stay individual.`:`${f.width} × ${f.height} cm image · ${f.width+14} × ${f.height+17} cm paper · Edition ${f.editionLabel}`;
  $('pricing').querySelector('button').textContent=bulk?'Apply prices to entire collection':'Save prices and availability';
  $("bands").replaceChildren(
    ...Array.from({ length: Math.ceil(f.edition / 2) }, (_, i) => {
      const label = document.createElement("label"),
        input = document.createElement("input");
      label.textContent =
        "Prints " +
        (i * 2 + 1) +
        (Math.min(i * 2 + 2, f.edition) !== i * 2 + 1
          ? "–" + Math.min(i * 2 + 2, f.edition)
          : "");
      input.type = "number";
      input.min = "0.01";
      input.max = "10000000";
      input.step = "0.01";
      input.value = p?.bands[i] ?? "";
      input.placeholder = "Price on enquiry";
      input.dataset.band = String(i);
      label.append(input);
      return label;
    }),
  );
  preview();
}
function preview() {
  if(collectionPricing()) {
    $('next-price').textContent=`Applies to ${priceTargets().length} photographs. Each photograph’s current price follows its own edition sales.`;
    return;
  }
  const f = catalog
    .find((w) => w.id === $("work").value)
    ?.formats.find((f) => f.key === $("format").value);
  if (!f) return;
  const sold = +$("sold").value,
    input = $("bands").querySelector(`[data-band="${Math.floor(sold / 2)}"]`);
  $("next-price").textContent =
    sold >= f.edition
      ? "Collector view: Edition sold out"
      : "Collector view: Print " +
        (sold + 1) +
        " — " +
        (input?.value
          ? $("currency").value + " " + input.value
          : "Price on enquiry");
}
async function load() {
  state = await api("data");
  publishPriceSummaries();
  $("studio").hidden = false;
  $("login").hidden = true;
  requests();
  subscribers();
}
function requests() {
  $("requests").replaceChildren();
  for (const r of state.requests.sort((a, b) => b.created - a.created)) {
    const row = document.createElement("div");
    row.className = "request";
    const text = document.createElement("p");
    text.textContent = `${r.name} · ${r.email} · ${r.status}${r.expires ? " · expires " + new Date(r.expires).toLocaleString() : ""}`;
    const work = document.createElement("p");
    work.className = "small";
    work.textContent = [r.collections?.join(", ").toUpperCase(), catalog.find(w=>w.id===r.work)?.title, r.message].filter(Boolean).join(" · ") || "All collections";
    row.append(text, work);
    for (const [label, action] of [
      ["Approve & email password", "approve"],
      ["Revoke access", "revoke"],
    ]) {
      const b = document.createElement("button");
      b.textContent = label;
      b.onclick = async () => {
        if (
          !confirm(
            action === "approve"
              ? `Email a new 24-hour password to ${r.email}?`
              : `Revoke ${r.email}’s access now?`,
          )
        )
          return;
        b.disabled = true;
        try {
          await api(action, { id: r.id });
          await load();
          status(
            action === "approve"
              ? "Invitation emailed. Access expires in 24 hours."
              : "Access revoked.",
          );
        } catch (e) {
          status(e.message, true);
        } finally {
          b.disabled = false;
        }
      };
      row.append(b);
    }
    $("requests").append(row);
  }
  if (!state.requests.length) $("requests").textContent = "No requests yet.";
}
async function digest(v) {
  const data = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(v),
  );
  return [...new Uint8Array(data)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}
function subscribers() {
  $("subscribers").replaceChildren();
  for (const s of state.subscribers) {
    const row = document.createElement("div");
    row.className = "request";
    const p = document.createElement("p");
    p.textContent = s.email + " · " + s.status;
    const b = document.createElement("button");
    b.textContent = "Remove subscriber";
    b.onclick = async () => {
      if (!confirm("Remove " + s.email + " from the mailing list?")) return;
      try {
        await api("remove-subscriber", { id: await digest(s.email) });
        await load();
        status("Subscriber removed.");
      } catch (e) {
        status(e.message, true);
      }
    };
    row.append(p, b);
    $("subscribers").append(row);
  }
}
$("login").onsubmit = async (e) => {
  e.preventDefault();
  const button = e.currentTarget.querySelector("button"),
    input = e.currentTarget.elements.namedItem("token"),
    token = input.value;
  input.value = "";
  button.disabled = true;
  try {
    const login = await api("login", { token, embedded });
    embeddedSession = login.session || "";
    publishingToken=token;
    await load();
    populateWorks();
    showSection(location.hash.slice(1));
    selectRequestedPricing();
    connectCollectionFrame();
    status("Studio connected.");
  } catch (e) {
    status(e.message, true);
  } finally {
    button.disabled = false;
  }
};
$('price-collection').replaceChildren(...[...new Set(catalog.map(w=>w.collection))].map(c=>option(c,c.toUpperCase())));
function mayChangeSelection() {
  if(!priceDirty || confirm('Discard unsaved price edits?')) return true;
  $('price-scope').value=$('pricing').dataset.scope;
  $('price-collection').value=$('pricing').dataset.collection;
  $('work').value=$('pricing').dataset.work;
  $('format').value=$('pricing').dataset.format;
  return false;
}
$('price-collection').onchange=()=>{if(mayChangeSelection()) populateWorks();};
$('price-scope').onchange=()=>{if(mayChangeSelection()) formats();};
$('work').onchange=()=>{if(mayChangeSelection()) formats();};
$('format').onchange=()=>{if(mayChangeSelection()) pricing();};
$('pricing').oninput=()=>{priceDirty=true;preview();};
$("pricing").onsubmit = async (e) => {
  e.preventDefault();
  const b = e.currentTarget.querySelector("button");
  const bulk=collectionPricing();
  if(bulk && !confirm(`Apply these ${$('format').selectedOptions[0].textContent} prices to all ${priceTargets().length} photographs in ${$('price-collection').value.toUpperCase()}? Existing prices for this format will be replaced. Sales counts will be preserved.`)) return;
  b.disabled = true;
  try {
    const result = await api(bulk ? "save-collection" : "save", {
      collection: $("price-collection").value,
      id: $("work").value,
      format: $("format").value,
      currency: $("currency").value,
      sold: +$("sold").value,
      bands: [...$("bands").querySelectorAll("input")].map((i) =>
        i.value === "" ? null : +i.value,
      ),
      version,
    });
    priceDirty=false;
    state.prices = result.prices;
    publishPriceSummaries();
    version = state.prices.version;
    status(bulk?`Saved prices for ${result.updated} photographs. Collector prices update immediately; sales counts are unchanged.`:"Saved. New collector page requests use these prices immediately.");
  } catch (e) {
    status(e.message, true);
  } finally {
    b.disabled = false;
  }
};
$("refresh").onclick = async () => {
  try {
    await load();
    if(!priceDirty) pricing();
    status("Updated.");
  } catch (e) {
    status(e.message, true);
  }
};
$("export").onclick = () => {
  const csv = (v) =>
    '"' +
    String(v || "")
      .replace(/^[\s=+@-]/, "'$&")
      .replaceAll('"', '""') +
    '"';
  const text = [
    "Email,Name,Confirmed,Consent",
    ...state.subscribers
      .filter((s) => s.status === "confirmed")
      .map((s) =>
        [s.email, s.name, new Date(s.confirmed).toISOString(), s.consent]
          .map(csv)
          .join(","),
      ),
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv" })),
    a = document.createElement("a");
  a.href = url;
  a.download = "studio-subscribers.csv";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
$("logout").onclick = async () => {
  try {
    const r = await fetch("/.netlify/functions/editions?action=logout", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(embeddedSession ? {"X-Studio-Session":embeddedSession} : {}) },
      body: "{}",
    });
    if (!r.ok) throw Error("Sign-out failed. Please try again.");
    clearPublishingConnection();
    state=null;publishPriceSummaries();
    embeddedSession="";
    frameReady=false;
    frame.removeAttribute("src");
    priceDirty=false;
    state = null;
    publishPriceSummaries();
    $("requests").replaceChildren();
    $("subscribers").replaceChildren();
    $("bands").replaceChildren();
    $("studio").hidden = true;
    $("login").hidden = false;
    status("Signed out.");
  } catch (e) {
    status(e.message, true);
  }
};
load()
  .then(()=>{populateWorks();showSection(location.hash.slice(1));selectRequestedPricing();})
  .catch(e => {if(e.message!=="Please sign in to the Editions Editor.") status(e.message,true);});
