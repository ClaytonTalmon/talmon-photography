export {};
const $ = (id) => document.getElementById(id),
  params = new URLSearchParams(location.search),
  locale = location.pathname.split("/")[1];
const publicCatalog = JSON.parse($("public-catalog").textContent);
let works = [],
  active,
  selected = "standard",
  timer;
const notice = (text, error = false) => {
  $("notice").textContent = text;
  $("notice").classList.toggle("error", error);
};
async function api(action, data) {
  const r = await fetch("/.netlify/functions/editions?action=" + action, {
    method: data ? "POST" : "GET",
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    cache: "no-store",
  });
  const result = await r.json();
  if (!r.ok) throw Error(result.error || "Please try again.");
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
  $("print-type").textContent = active.printType;

  $("view-artwork").href = "/" + locale + "/work/" + active.collection + "/";
  $("enquire").href =
    "mailto:ctalmon@gmail.com?subject=" +
    encodeURIComponent("Acquisition enquiry — " + active.title) +
    "&body=" +
    encodeURIComponent(
      "I would like to enquire about " +
        active.title +
        " from " +
        active.collection.toUpperCase() +
        ".",
    );
  if (!active.formats.some((f) => f.key === selected))
    selected = active.formats[0]?.key;
  $("formats").replaceChildren(
    ...active.formats.map((f) => {
      const b = document.createElement("button");
      b.textContent = f.label;
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
    $("price").textContent = "On enquiry";
    $("availability").textContent =
      "Please contact the studio for sizes and availability.";
    $("edition-description").textContent = "";
    return;
  }
  const fmt = (n) =>
    new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(n);
  for (const [label, w, h] of [
    ["Image", f.width, f.height],
    ["Finished paper", f.width + 14, f.height + 17],
    ["Framed · estimated", f.width + 20, f.height + 23],
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
    "Edition of " +
    f.editionLabel +
    ". Artist’s proofs are separate and available on enquiry.";
  $("price").textContent = f.soldOut
    ? "Edition sold out"
    : f.price === null
      ? "Price on enquiry"
      : new Intl.NumberFormat("en", {
          style: "currency",
          currency: f.currency,
          maximumFractionDigits: 0,
        }).format(f.price) +
        " " +
        f.currency;
  $("availability").textContent = f.soldOut
    ? "Please enquire about other formats."
    : f.sold === null
      ? "Availability confirmed by the studio."
      : "Next available: " + (f.sold + 1) + " of " + f.edition;
  $("enquire").href =
    "mailto:ctalmon@gmail.com?subject=" +
    encodeURIComponent("Acquisition enquiry — " + active.title) +
    "&body=" +
    encodeURIComponent(
      "I would like to enquire about " +
        active.title +
        " from " +
        active.collection.toUpperCase() +
        ", " +
        f.label +
        ".",
    );
}
async function load() {
  const data = await api("catalog");
  works = data.works;
  $("gate").hidden = true;
  $("collection").hidden = false;
  $("expires").textContent =
    "Your private access expires " +
    new Date(data.expires).toLocaleString() +
    ".";
  $("collection-select").replaceChildren(
    ...[...new Set(works.map((w) => w.collection))].map((c) =>
      option(c, c.toUpperCase()),
    ),
  );
  const work = works.find((w) => w.id === params.get("work"));
  if (work) $("collection-select").value = work.collection;
  populate();
  clearTimeout(timer);
  timer = setTimeout(
    () => {
      lock();
      notice(
        "Your 24-hour access has expired. You may request a new invitation.",
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
    button.disabled = true;
    try {
      await api(action, data);
      if (action === "unlock") {
        await load();
        form.reset();
        notice("Welcome to the editions.");
      } else {
        form.reset();
        notice(
          action === "request"
            ? "Your request has reached the studio. If you selected studio updates, look for a separate confirmation email."
            : "Please check your email to confirm your subscription.",
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
    notice("Your private view is closed.");
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
      notice("You are on the studio mailing list. Thank you.");
    } catch (e) {
      notice(e.message, true);
    }
  };
}
load().catch(() => lock());
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && works.length)
    load().catch(() => {
      lock();
      notice("Please enter your password again.");
    });
});
