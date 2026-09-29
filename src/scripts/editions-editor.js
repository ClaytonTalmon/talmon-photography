export {};
const $ = (id) => document.getElementById(id),
  catalog = JSON.parse($("catalog").textContent);
let state, version;
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
function formats() {
  const w = catalog.find((w) => w.id === $("work").value);
  $("format").replaceChildren(...w.formats.map((f) => option(f.key, f.label)));
  pricing();
}
function pricing() {
  const w = catalog.find((w) => w.id === $("work").value),
    f = w.formats.find((f) => f.key === $("format").value);
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
    await load();
    pricing();
    status("Studio connected.");
  } catch (e) {
    status(e.message, true);
  } finally {
    button.disabled = false;
  }
};
$("work").replaceChildren(
  ...catalog.map((w) =>
    option(w.id, w.collection.toUpperCase() + " — " + w.title),
  ),
);
$("work").onchange = formats;
$("format").onchange = pricing;
$("pricing").oninput = preview;
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
    pricing();
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
  .then(formats)
  .catch(e => status(e.message, true));
