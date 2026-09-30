export {};
const $ = (id) => document.getElementById(id),
  catalog = JSON.parse($("catalog").textContent);
let state, version;
let publishingToken = '', frameReady = false, requestedCollection = '';
let priceDirty = false;
const frame = $('collection-editor-frame');
if (['talmonphoto.com','www.talmonphoto.com'].includes(location.hostname)) {
  location.replace('https://willowy-pika-c392c9.netlify.app' + location.pathname + location.hash);
}
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
  history.replaceState({},'',location.pathname+'#'+section);
  if (section==='collections') {
    if (!frame.getAttribute('src')) frame.src='/editor/collections.html';
    connectCollectionFrame();
  }
}
for (const button of document.querySelectorAll('[data-section]')) button.onclick=()=>showSection(button.dataset.section);
window.addEventListener('message',event=>{
  if (event.origin!==location.origin || event.source!==frame.contentWindow) return;
  const data=event.data;
  if(data?.type==='studio-collection-ready') {frameReady=true;connectCollectionFrame();}
  if(data?.type==='studio-collection-height' && Number.isFinite(data.height)) frame.style.height=Math.max(500,Math.min(100000,data.height+10))+'px';
  if(data?.type==='studio-edit-prices') {
    const work=catalog.find(w=>w.id===data.work);
    if(!work) {status('Publish the new photograph first, then reload the Studio Editor after the website rebuild finishes.');return;}
    if(priceDirty && !confirm('Discard unsaved price edits and open this photograph?')) return;
    $('price-collection').value=work.collection;
    populateWorks(work.id);
    showSection('prices');
    $('panel-prices').scrollIntoView({block:'start',behavior:'smooth'});
  }
});
$('edit-collection-details').onclick=()=>{
  requestedCollection=catalog.find(w=>w.id===$('work').value)?.collection || '';
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
      headers: data ? { "Content-Type": "application/json" } : {},
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
function formats() {
  const w = catalog.find((w) => w.id === $("work").value);
  if (!w) return;
  $("format").replaceChildren(...w.formats.map((f) => option(f.key, f.label)));
  pricing();
}
function pricing() {
  if (!state) return;
  priceDirty=false;
  const w = catalog.find((w) => w.id === $("work").value),
    f = w.formats.find((f) => f.key === $("format").value);
  $('pricing').dataset.collection=w.collection;
  $('pricing').dataset.work=w.id;
  $('pricing').dataset.format=$('format').value;
  $("pricing").hidden = !f;
  $("missing").hidden = !!f;
  if (!f) return;
  const p = state.prices.items[w.id + "::" + f.key];
  version = state.prices.version;
  $("currency").value = p?.currency || "USD";
  $("sold").value = p?.sold ?? 0;
  $("sold").max = f.edition;
  $("size-summary").textContent =
    `${f.width} × ${f.height} cm image · ${f.width + 14} × ${f.height + 17} cm paper · Edition ${f.editionLabel}`;
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
    work.textContent = [r.collections?.join(", ").toUpperCase(), r.work, r.message].filter(Boolean).join(" · ") || "All collections";
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
    await api("login", { token });
    publishingToken=token;
    await load();
    populateWorks();
    showSection(location.hash.slice(1));
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
  $('price-collection').value=$('pricing').dataset.collection;
  $('work').value=$('pricing').dataset.work;
  $('format').value=$('pricing').dataset.format;
  return false;
}
$('price-collection').onchange=()=>{if(mayChangeSelection()) populateWorks();};
$('work').onchange=()=>{if(mayChangeSelection()) formats();};
$('format').onchange=()=>{if(mayChangeSelection()) pricing();};
$('pricing').oninput=()=>{priceDirty=true;preview();};
$("pricing").onsubmit = async (e) => {
  e.preventDefault();
  const b = e.currentTarget.querySelector("button");
  b.disabled = true;
  try {
    const result = await api("save", {
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
    version = state.prices.version;
    status("Saved. New collector page requests use these prices immediately.");
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
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    if (!r.ok) throw Error("Sign-out failed. Please try again.");
    clearPublishingConnection();
    frameReady=false;
    frame.removeAttribute("src");
    priceDirty=false;
    state = null;
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
  .then(()=>{populateWorks();showSection(location.hash.slice(1));})
  .catch(e => {if(e.message!=="Please sign in to the Editions Editor.") status(e.message,true);});
