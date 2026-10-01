import { collectorText } from "../i18n/collector.mjs";
const $ = (id) => document.getElementById(id),
  params = new URLSearchParams(location.search),
  locale = document.documentElement.lang.split("-")[0];
const t = (text, values) => collectorText(locale, text, values);
const publicCatalog = JSON.parse($("public-catalog").textContent);
const requestedWork = publicCatalog.find(w => w.id === params.get("work"));
for (const input of document.querySelectorAll('[name="collections"]')) {
  input.checked = input.value === (requestedWork?.collection || params.get("collection"));
}
let works = [],
  active,
  selected = "standard",
  timer;
const notice = (text, error = false) => {
  $("notice").textContent = text;
  $("notice").classList.toggle("error", error);
};
let previewApi;
async function api(action, data) {
  if (document.getElementById('collector-preview')) {
    previewApi ||= import('./collector-preview-api.js').then(module=>module.createPreviewApi());
    return (await previewApi)(action,data);
  }
  const r = await fetch("/.netlify/functions/editions?locale=" + locale + "&action=" + action, {
    method: data ? "POST" : "GET",
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify({...data,locale}) : undefined,
    cache: "no-store",
  });
  if (r.status === 404 || r.status >= 500) {
    const error = new Error(t("The request service is temporarily unavailable. Please try again shortly."));
    error.unavailable = true;
    throw error;
  }
  const result = await r.json();
  if (!r.ok) throw Error(t(result.error || t("Please try again.")));
  return result;
}
function lock() {
  clearTimeout(timer);
  works = [];
  active = null;
  $("collection").hidden = true;
  $("gate").hidden = false;
  $("price").textContent = "";
  $("availability").textContent = "";
}
function option(value, label) {
  const o = document.createElement("option");
  o.value = value;
  o.textContent = label;
  return o;
}
function populate() {
  const list = works.filter(
    (w) => w.collection === $("collection-select").value,
  );
  $("work-select").replaceChildren(...list.map((w) => option(w.id, w.title)));
  const requested = params.get("work");
  if (list.some((w) => w.id === requested)) $("work-select").value = requested;
  render();
}
function render() {
  active = works.find((w) => w.id === $("work-select").value);
  if (!active) return;
  const encoded = active.id.split("/").map(encodeURIComponent).join("/");
  $("artwork").src = "/_images/work/" + encoded + "-640.webp";
  $("artwork").alt = active.title;
  $("work-title").textContent = active.title;
  $("collection-name").textContent = active.collection.toUpperCase();
  $("print-type").textContent = t(active.printType);
  $("acquisition-request").hidden = true;

  $("view-artwork").href = "/" + locale + "/work/" + active.collection + "/";
  if (!active.formats.some((f) => f.key === selected))
    selected = active.formats[0]?.key;
  $("formats").replaceChildren(
    ...active.formats.map((f) => {
      const b = document.createElement("button");
      b.textContent = t(f.label);
      const edition = document.createElement("span");
      edition.className = "format-edition";
      edition.textContent = t("Edition of {edition}", {edition:f.editionLabel});
      b.append(edition);
      b.setAttribute("aria-pressed", String(selected === f.key));
      b.onclick = () => {
        selected = f.key;
        render();
      };
      return b;
    }),
  );
  const f = active.formats.find((f) => f.key === selected);
  $("dimensions").replaceChildren();
  if (!f) {
    $("price").textContent = t("Price on enquiry");
    $("availability").textContent =
      t("Availability confirmed by the studio.");
    $("edition-description").textContent = "";
    $("edition-proofs").textContent = "";
    return;
  }
  const fmt = (n) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(n);
  for (const [label, w, h] of [
    [t("Image"), f.width, f.height],
    [t("Finished paper"), f.width + 14, f.height + 17],
    [t("Framed · estimated"), f.width + 20, f.height + 23],
  ]) {
    const div = document.createElement("div"),
      dt = document.createElement("dt"),
      dd = document.createElement("dd"),
      inch = document.createElement("span");
    dt.textContent = label;
    dd.textContent = fmt(w) + " × " + fmt(h) + " cm";
    inch.className = "inches";
    inch.textContent = fmt(w / 2.54) + " × " + fmt(h / 2.54) + " in";
    dd.append(inch);
    div.append(dt, dd);
    $("dimensions").append(div);
  }
  $("edition-description").textContent =
    t("Edition of {edition}", {edition:f.editionLabel});
  $("edition-proofs").textContent = t("Artist’s proofs are separate and available on enquiry.");
  $("price").textContent = f.soldOut
    ? t("Edition sold out")
    : f.price === null
      ? t("Price on enquiry")
      : new Intl.NumberFormat(locale, {
          style: "currency",
          currency: f.currency,
          maximumFractionDigits: 0,
        }).format(f.price) +
        " " +
        f.currency;
  $("availability").textContent = f.soldOut
    ? t("Please enquire about other formats.")
    : f.sold === null
      ? t("Edition number to be confirmed by the studio.")
      : t("Next available edition: {next} / {total}", {next:f.sold+1,total:f.edition});
}
async function load() {
  const data = await api("catalog");
  works = data.works;
  $("enquiry-identity").textContent = [data.collector?.name, data.collector?.email].filter(Boolean).join(" · ");
  if (!works.length) throw Error(t("Please request new access."));
  $("gate").hidden = true;
  $("collection").hidden = false;
  $("expires").textContent =
    t("Your private access expires {date}.", {date:new Date(data.expires).toLocaleString(locale)});
  $("collection-select").replaceChildren(
    ...[...new Set(works.map((w) => w.collection))].map((c) =>
      option(c, c.toUpperCase()),
    ),
  );
  const work = works.find((w) => w.id === params.get("work"));
  if (work) $("collection-select").value = work.collection;
  else if (works.some(w=>w.collection===params.get("collection"))) $("collection-select").value=params.get("collection");
  populate();
  clearTimeout(timer);
  timer = setTimeout(
    () => {
      lock();
      notice(
        t("Your 24-hour access has expired. You may request a new invitation."),
      );
    },
    Math.max(0, data.expires - Date.now()),
  );
}
$("collection-select").onchange = populate;
$("work-select").onchange = render;
for (const [id, action] of [
  ["access-request", "request"],
  ["subscribe", "subscribe"],
  ["unlock", "unlock"],
])
  $(id).onsubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget,
      button = form.querySelector("button"),
      data = Object.fromEntries(new FormData(form));
    data.consent = form.elements.namedItem("consent")?.checked === true;
    data.work = params.get("work") || "";
    data.collections = new FormData(form).getAll("collections");
    if (action === "request" && !data.collections.length) {
      notice(t("Please select at least one collection."), true);
      return;
    }
    button.disabled = true;
    try {
      await api(action, data);
      if (action === "unlock") {
        await load();
        form.reset();
        notice(t("Welcome to the editions."));
      } else {
        form.reset();
        notice(
          action === "request"
            ? t("Your request has reached the studio. If you selected studio updates, look for a separate confirmation email.")
            : t("Please check your email to confirm your subscription."),
        );
      }
    } catch (e) {
      notice(e.message, true);
    } finally {
      button.disabled = false;
    }
  };
$("logout").onclick = async () => {
  try {
    await api("logout", {});
    lock();
    notice(t("Your private view is closed."));
  } catch (e) {
    notice(e.message, true);
  }
};
if (params.has("confirm")) {
  $("confirmation").hidden = false;
  $("confirm-subscription").onclick = async () => {
    try {
      await api("confirm-subscription", {
        subscriber: params.get("subscriber"),
        token: params.get("confirm"),
      });
      $("confirmation").hidden = true;
      history.replaceState({}, "", location.pathname);
      notice(t("You are on the studio mailing list. Thank you."));
    } catch (e) {
      notice(e.message, true);
    }
  };
}
load().catch(error => {
  lock();
  if (error.unavailable) {
    $("gate").hidden = true;
    $("service-unavailable").hidden = false;
    $("subscribe").hidden = true;
    const p = document.createElement("p");
    p.className = "small";
    p.textContent = t("The request service is temporarily unavailable. Please try again shortly.");
    $("subscribe").after(p);
  }
});
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && works.length)
    load().catch(() => {
      lock();
      notice(t("Please enter your password again."));
    });
});

$("enquire").onclick = () => {
  $("acquisition-request").hidden = false;
  $("enquiry-work").textContent = active.title + " · " + active.collection.toUpperCase() + " · " + t(active.formats.find(f=>f.key===selected)?.label || "Format on enquiry");
  $("enquiry-notice").textContent = "";
  $("acquisition-request").scrollIntoView({behavior:"smooth",block:"center"});
};
$("acquisition-request").onsubmit = async event => {
  event.preventDefault();
  const form = event.currentTarget, button = form.querySelector("button");
  button.disabled = true;
  try {
    const format = active.formats.find(f => f.key === selected);
    await api("enquiry", {...Object.fromEntries(new FormData(form)), work:active.id, format:selected, quote:{price:format.price,sold:format.sold,currency:format.currency}});
    form.reset();
    $("enquiry-notice").textContent = t("Your enquiry has reached the studio. We’ll be in touch shortly.");
  } catch(error) { $("enquiry-notice").textContent = error.message; }
  finally { button.disabled = false; }
};
