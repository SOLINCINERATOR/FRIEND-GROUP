"use strict";

/* ==========================================================================
   FRIENDS GROUP
   --------------------------------------------------------------------------
   HIER stellst du ein:
     CONFIG – Musik, Aktualisierung, Admin-Code
   Die Freunde verwaltest du im Admin-Panel (Link oben links) → members.js
   Alles darunter musst du nicht anfassen.
   ========================================================================== */

/* -------------------------------- 1) CONFIG ------------------------------ */

const CONFIG = {
  music: {
    file: "music/song.mp3", // Datei im Ordner "music" (Name hier anpassen)
    volume: 0.35            // 0 = still, 1 = volle Lautstärke
  },
  refreshSeconds: 30,       // wie oft der Discord-Status neu geladen wird
  adminHash: "eac5dd226643dd4199bd476c935ac3adfd5713c194869047f645db41dddbcb38", // Hash des Admin-Codes

  /* Online-Datenbank (Supabase), damit Änderungen im Admin Panel für ALLE sofort sichtbar sind.
     Einrichtung: siehe README.txt (dauert ca. 5 Minuten). Leer lassen = alte Methode mit members.js. */
  supabase: {
    url: "https://zqmbjsofhnjoueqottpy.supabase.co",      // z. B. "https://abcdefgh.supabase.co"
    anonKey: "sb_publishable_morrdcWn-FewdKWwYJdp4A_x68YWt27"   // der "anon"- bzw. "publishable"-Key (der ist öffentlich, das ist normal)
  }
};

/* Die Freunde stehen NICHT mehr hier, sondern in members.js
   (wird vom Admin-Panel erzeugt – siehe README). */

let MEMBERS = [];

/* ==========================================================================
   Ab hier: Code
   ========================================================================== */

const STATUS = {
  online:    { label: "Online" },
  idle:      { label: "Abwesend" },
  dnd:       { label: "Bitte nicht stören" },
  offline:   { label: "Offline" },
  invisible: { label: "Unsichtbar" }
};

/* Logos (Simple Icons, 24×24) */
const ICONS = {
  discord:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>',
  tiktok:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>',
  x:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>',
  snapchat:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301.165-.088.344-.104.464-.104.182 0 .359.029.509.09.45.149.734.479.734.838.015.449-.39.839-1.213 1.168-.089.029-.209.075-.344.119-.45.135-1.139.36-1.333.81-.09.224-.061.524.12.868l.015.015c.06.136 1.526 3.475 4.791 4.014.255.044.435.27.42.509 0 .075-.015.149-.045.225-.24.569-1.273.988-3.146 1.271-.059.091-.12.375-.164.57-.029.179-.074.36-.134.553-.076.271-.27.405-.555.405h-.03c-.135 0-.313-.031-.538-.074-.36-.075-.765-.135-1.273-.135-.3 0-.599.015-.913.074-.6.104-1.123.464-1.723.884-.853.599-1.826 1.288-3.294 1.288-.06 0-.119-.015-.18-.015h-.149c-1.468 0-2.427-.675-3.279-1.288-.599-.42-1.107-.779-1.707-.884-.314-.045-.629-.074-.928-.074-.54 0-.958.089-1.272.149-.211.043-.391.074-.54.074-.374 0-.523-.224-.583-.42-.061-.192-.09-.389-.135-.567-.046-.181-.105-.494-.166-.57-1.918-.222-2.95-.642-3.189-1.226-.031-.063-.052-.15-.055-.225-.015-.243.165-.465.42-.509 3.264-.54 4.73-3.879 4.791-4.02l.016-.029c.18-.345.224-.645.119-.869-.195-.434-.884-.658-1.332-.809-.121-.029-.24-.074-.346-.119-1.107-.435-1.257-.93-1.197-1.273.09-.479.674-.793 1.168-.793.146 0 .27.029.383.074.42.194.789.3 1.104.3.234 0 .384-.06.465-.105l-.046-.569c-.098-1.626-.225-3.651.307-4.837C7.392 1.077 10.739.807 11.727.807l.419-.015h.06z"/></svg>',
  telegram:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>'
};

const SCRIPT_NAME_STYLE =
  "font-family:'Kaushan Script',cursive;font-style:italic;font-weight:400;letter-spacing:.16em;font-size:20px;";

const strip = (v) => String(v).trim().replace(/^@/, "");

const NETWORKS = {
  discord: {
    name: "Discord",
    icon: ICONS.discord,
    label: (v) => v,
    copy: true // Discord-Namen kann man nicht direkt verlinken → Klick kopiert den Namen
  },
  tiktok: {
    name: "TikTok",
    icon: ICONS.tiktok,
    label: (v) => strip(v),
    href: (v) => "https://www.tiktok.com/@" + encodeURIComponent(strip(v))
  },
  x: {
    name: "X",
    icon: ICONS.x,
    label: (v) => "@" + strip(v),
    href: (v) => "https://x.com/" + encodeURIComponent(strip(v))
  },
  snapchat: {
    name: "Snapchat",
    icon: ICONS.snapchat,
    label: (v) => strip(v),
    href: (v) => "https://www.snapchat.com/add/" + encodeURIComponent(strip(v))
  },
  telegram: {
    name: "Telegram",
    icon: ICONS.telegram,
    label: (v) => "@" + strip(v),
    href: (v) => "https://t.me/" + encodeURIComponent(strip(v))
  }
};

/* ------------------------------ kleine Helfer ----------------------------- */

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

async function getJSON(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}

/* Discord-CDN: Hash beginnt mit "a_" → animiertes GIF */
function cdnUrl(kind, id, hash, size) {
  const ext = hash.startsWith("a_") ? "gif" : "png";
  return "https://cdn.discordapp.com/" + kind + "/" + id + "/" + hash + "." + ext + "?size=" + size;
}

function defaultAvatar(id) {
  try {
    return "https://cdn.discordapp.com/embed/avatars/" + Number((BigInt(id) >> 22n) % 6n) + ".png";
  } catch (_) {
    return null;
  }
}

/* --------------------------------- Toast ---------------------------------- */

const toastEl = document.getElementById("toast");
let toastTimer;

function toast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1800);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (_) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (_) { /* ignorieren */ }
    ta.remove();
    return ok;
  }
}

/* ------------------------------ Karten bauen ------------------------------ */

const membersEl = document.getElementById("members");

function buildChip(social) {
  const net = NETWORKS[social.type];
  if (!net) return null;

  const isLink = Boolean(net.href);
  const chip = el(isLink ? "a" : "button", "chip");
  if (isLink) {
    chip.href = net.href(social.value);
    chip.target = "_blank";
    chip.rel = "noopener noreferrer";
  } else {
    chip.type = "button";
    chip.title = "Klicken zum Kopieren";
    chip.addEventListener("click", async () => {
      const ok = await copyText(social.value);
      toast(ok ? "Discord-Name kopiert" : "Kopieren nicht möglich");
    });
  }

  chip.insertAdjacentHTML("afterbegin", net.icon); // feste, eigene SVGs
  chip.appendChild(el("span", null, net.label(social.value)));
  return chip;
}

function buildCard(member) {
  const card = el("article", "card");

  /* Kopf: Avatar + Name + Status */
  const head = el("button", "card-head");
  head.type = "button";
  head.setAttribute("aria-expanded", "false");

  const avatar = el("div", "avatar");
  const avatarImg = document.createElement("img");
  avatarImg.alt = "";
  avatarImg.hidden = true;
  avatarImg.decoding = "async";
  avatar.appendChild(avatarImg);

  const info = el("div", "info");
  const name = el("div", "name", member.name || "");
  if (member.font === "script") name.style.cssText = SCRIPT_NAME_STYLE;
  else if (member.nameStyle) name.style.cssText = member.nameStyle;

  const status = el("div", "status");
  const dot = el("span", "dot offline");
  const statusText = el("span", null, STATUS.offline.label);
  status.append(dot, statusText);

  const custom = el("div", "custom");
  custom.hidden = true;

  info.append(name, status, custom);
  head.append(avatar, info);
  card.appendChild(head);

  if (member.role) card.appendChild(el("span", "role", member.role));

  /* Aufklappbereich: Banner + Social Links */
  const more = el("div", "card-more");
  const inner = el("div", "card-more-inner");
  const content = el("div", "more-content");

  const banner = el("div", "banner");
  banner.hidden = true;
  content.appendChild(banner);

  const chips = [];
  (member.socials || []).forEach((s) => {
    const chip = buildChip(s);
    if (chip) chips.push(chip);
  });

  if (chips.length) {
    content.appendChild(el("div", "socials-label", "Social Links"));
    const row = el("div", "chips");
    chips.forEach((c) => row.appendChild(c));
    content.appendChild(row);
  } else {
    content.appendChild(el("p", "empty-hint", "Noch keine Social Links."));
  }

  inner.appendChild(content);
  more.appendChild(inner);
  card.appendChild(more);

  /* Klick auf die Karte (Name/Profilbild) klappt auf/zu */
  head.addEventListener("click", () => {
    const open = !card.classList.contains("open");
    card.classList.toggle("open", open);
    head.setAttribute("aria-expanded", String(open));
    if (open) showBanner(member); // Banner (auch GIF) startet erst beim Aufklappen
  });

  member.els = { avatarImg, dot, statusText, custom, banner, nameEl: name };
  member.state = { status: "offline", customStatus: null, avatarUrl: null };
  membersEl.appendChild(card);
}

/* -------------------------------- Banner ---------------------------------- */

function showBanner(member) {
  const p = member.profile;
  const banner = member.els.banner;
  if (!p) return;

  if (p.bannerHash) {
    const url = cdnUrl("banners", member.discordId, p.bannerHash, 600);
    banner.style.backgroundImage = 'url("' + url + '")';
    banner.style.backgroundColor = p.bannerColor || "";
    banner.hidden = false;
  } else if (p.bannerColor) {
    banner.style.backgroundImage = "none";
    banner.style.backgroundColor = p.bannerColor;
    banner.hidden = false;
  }
}

/* --------------------------- Anzeige aktualisieren ------------------------- */

function paint(member) {
  const { avatarImg, dot, statusText, custom, nameEl } = member.els;
  const s = member.state;

  nameEl.textContent = member.name || s.displayName || "Mitglied";

  if (s.avatarUrl && avatarImg.dataset.src !== s.avatarUrl) {
    avatarImg.dataset.src = s.avatarUrl;
    avatarImg.src = s.avatarUrl;
    avatarImg.onload = () => { avatarImg.hidden = false; };
    avatarImg.onerror = () => { avatarImg.hidden = true; };
  }

  const key = STATUS[member.status] ? member.status : (STATUS[s.status] ? s.status : "offline");
  dot.className = "dot " + key;
  statusText.textContent = STATUS[key].label;

  custom.textContent = "";
  const cs = s.customStatus;
  if (cs && (cs.text || cs.emoji)) {
    if (cs.emoji && cs.emoji.id) {
      const img = document.createElement("img");
      img.alt = "";
      img.src = "https://cdn.discordapp.com/emojis/" + cs.emoji.id + "." + (cs.emoji.animated ? "gif" : "png") + "?size=32";
      custom.appendChild(img);
    } else if (cs.emoji && cs.emoji.name) {
      custom.appendChild(el("span", null, cs.emoji.name));
    }
    if (cs.text) custom.appendChild(el("span", null, cs.text));
    custom.hidden = false;
  } else {
    custom.hidden = true;
  }
}

/* ------------------------------ Discord-Daten ----------------------------- */

/* Live-Status, Custom-Status, Avatar → Lanyard (kostenlos, https://lanyard.rest) */
async function loadPresence(member) {
  try {
    const json = await getJSON("https://api.lanyard.rest/v1/users/" + member.discordId);
    if (!json.success) throw new Error("nicht bei Lanyard");
    const d = json.data;
    const custom = (d.activities || []).find((a) => a.type === 4);

    member.state.status = d.discord_status || "offline";
    member.state.customStatus = custom ? { text: custom.state || "", emoji: custom.emoji || null } : null;

    const u = d.discord_user;
    if (u) {
      member.state.displayName = u.global_name || u.username || "";
      if (u.avatar) member.state.avatarUrl = cdnUrl("avatars", u.id, u.avatar, 256);
    }
  } catch (_) {
    member.state.status = "offline";
    member.state.customStatus = null;
  }
  if (!member.state.avatarUrl) {
    const p = member.profile;
    member.state.avatarUrl = p && p.avatarHash
      ? cdnUrl("avatars", member.discordId, p.avatarHash, 256)
      : defaultAvatar(member.discordId);
  }
  paint(member);
}

/* Banner (auch GIF) + Profilfarbe → öffentliche Profil-API von dstn.to */
async function loadProfile(member) {
  try {
    const json = await getJSON("https://dcdn.dstn.to/profile/" + member.discordId);
    const u = json.user || json;
    let color = u.banner_color || null;
    if (!color && typeof u.accent_color === "number") {
      color = "#" + u.accent_color.toString(16).padStart(6, "0");
    }
    member.profile = {
      avatarHash: u.avatar || null,
      bannerHash: u.banner || null,
      bannerColor: color
    };
  } catch (_) {
    member.profile = null;
  }
}

async function refreshAll() {
  await Promise.all(MEMBERS.filter((m) => m.discordId).map(loadPresence));
}

/* ------------------------- Online-Datenbank (Supabase) --------------------- */

const REMOTE = Boolean(CONFIG.supabase && CONFIG.supabase.url && CONFIG.supabase.anonKey);
let remoteList = null; // zuletzt geladene Liste vom Server (null = noch nie gespeichert)

function sbHeaders() {
  const key = CONFIG.supabase.anonKey;
  const headers = { apikey: key, "Content-Type": "application/json" };
  if (key.startsWith("eyJ")) headers.Authorization = "Bearer " + key; // nur bei klassischen JWT-Keys
  return headers;
}

const sbUrl = () => CONFIG.supabase.url.replace(/\/+$/, "");

/* Liste vom Server holen. Wirft einen Fehler, wenn der Server nicht antwortet. */
async function fetchRemote() {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(sbUrl() + "/rest/v1/site_data?key=eq.members&select=value", {
      headers: sbHeaders(),
      cache: "no-store",
      signal: ctrl.signal
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const rows = await res.json();
    if (!rows.length) throw new Error("Tabelle site_data ist leer – SQL-Skript ausgeführt?");
    return rows[0].value; // Array oder null
  } finally {
    clearTimeout(timer);
  }
}

/* Liste speichern – der Server prüft den Admin-Code selbst */
async function saveRemote(code, list) {
  const res = await fetch(sbUrl() + "/rest/v1/rpc/save_members", {
    method: "POST",
    headers: sbHeaders(),
    body: JSON.stringify({ code, data: list })
  });
  if (!res.ok) {
    let msg = "HTTP " + res.status;
    try { msg = (await res.json()).message || msg; } catch (_) { /* egal */ }
    throw new Error(msg);
  }
  remoteList = JSON.parse(JSON.stringify(list));
}

async function reloadRemote() {
  const value = await fetchRemote();
  remoteList = Array.isArray(value) ? value : null;
  return remoteList;
}

/* Liste der Freunde:
   - mit Datenbank: immer die Liste vom Server (für alle gleich)
   - ohne Datenbank: members.js (und in DEINEM Browser dein Entwurf aus dem Admin Panel) */
function loadList() {
  if (REMOTE && Array.isArray(remoteList)) return JSON.parse(JSON.stringify(remoteList));

  let list = Array.isArray(window.MEMBERS_DATA) ? window.MEMBERS_DATA : [];
  if (!REMOTE) {
    try {
      const draft = localStorage.getItem("fg-draft");
      if (draft) list = JSON.parse(draft);
    } catch (_) { /* egal */ }
  }
  return JSON.parse(JSON.stringify(list));
}

async function start(list) {
  MEMBERS = list;
  membersEl.textContent = "";

  MEMBERS.forEach((m) => {
    const id = String(m.discordId || "").trim();
    m.discordId = /^\d{15,25}$/.test(id) ? id : "";
  });

  MEMBERS.forEach(buildCard);
  MEMBERS.forEach(paint); // zeigt sofort Standard-/Festwerte an

  const withId = MEMBERS.filter((m) => m.discordId);
  await Promise.all(withId.map(loadProfile));
  await refreshAll();
}

setInterval(() => refreshAll(), CONFIG.refreshSeconds * 1000);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) refreshAll();
});

/* Alle 45 s prüfen, ob du im Admin Panel etwas geändert hast – so sehen es alle ohne Neuladen */
async function pollRemote() {
  if (!REMOTE || (window.FG && window.FG.adminOpen)) return;
  try {
    const value = await fetchRemote();
    const fresh = Array.isArray(value) ? value : null;
    if (JSON.stringify(fresh) !== JSON.stringify(remoteList)) {
      remoteList = fresh;
      start(loadList());
    }
  } catch (_) { /* Server kurz nicht erreichbar → einfach so lassen */ }
}

if (REMOTE) {
  try { localStorage.removeItem("fg-draft"); } catch (_) { /* egal */ }
  setInterval(pollRemote, 45000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) pollRemote(); });
}

(async function boot() {
  if (REMOTE) {
    try { await reloadRemote(); } catch (_) { remoteList = null; } // Fehler → members.js als Notlösung
  }
  start(loadList());
})();

/* --------------------------------- Musik ---------------------------------- */

(function music() {
  const audio = document.getElementById("music");
  const btn = document.getElementById("sound");
  const KEY = "friends-group-muted";

  let muted = false;
  try { muted = localStorage.getItem(KEY) === "1"; } catch (_) { /* egal */ }

  audio.src = CONFIG.music.file;
  audio.volume = CONFIG.music.volume;
  audio.muted = muted;

  function syncButton() {
    btn.classList.toggle("muted", muted);
    btn.setAttribute("aria-pressed", String(muted));
    btn.setAttribute("aria-label", muted ? "Musik einschalten" : "Musik stumm schalten");
  }
  syncButton();

  const tryPlay = () => audio.play().then(() => true, () => false);

  /* Browser erlauben Ton oft erst nach dem ersten Klick → dann startet die Musik */
  tryPlay().then((ok) => {
    if (ok) return;
    const events = ["pointerdown", "keydown", "touchstart"];
    const start = (e) => {
      if (btn.contains(e.target)) return; // der Button regelt sich selbst
      tryPlay().then((played) => {
        if (played) events.forEach((ev) => window.removeEventListener(ev, start, true));
      });
    };
    events.forEach((ev) => window.addEventListener(ev, start, true));
  });

  btn.addEventListener("click", () => {
    if (audio.paused && !audio.error) {
      muted = false;
      audio.muted = false;
      tryPlay();
    } else {
      muted = !muted;
      audio.muted = muted;
    }
    try { localStorage.setItem(KEY, muted ? "1" : "0"); } catch (_) { /* egal */ }
    syncButton();
  });

  audio.addEventListener("error", () => {
    btn.classList.add("unavailable");
    btn.title = "Keine Musik gefunden – lege eine Datei in den Ordner „music“ und passe CONFIG.music.file an.";
  });
})();

/* ------------------------------ Admin-Loader ------------------------------ */

/* Kompaktes SHA-256 (funktioniert auch ohne https) */
function sha256(str) {
  const K = [
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
  ];
  const H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  const data = new TextEncoder().encode(str);
  const len = data.length;
  const total = (((len + 9 + 63) >> 6) << 6);
  const buf = new Uint8Array(total);
  buf.set(data);
  buf[len] = 0x80;
  const view = new DataView(buf.buffer);
  view.setUint32(total - 8, Math.floor((len * 8) / 4294967296));
  view.setUint32(total - 4, (len * 8) >>> 0);

  const w = new Uint32Array(64);
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));

  for (let off = 0; off < total; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(off + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0;
      d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
  }
  return H.map((x) => x.toString(16).padStart(8, "0")).join("");
}

window.FG = { CONFIG, STATUS, NETWORKS, REMOTE, adminOpen: false, sha256, start, loadList, reloadRemote, saveRemote, hasRemoteData: () => Array.isArray(remoteList), toast, copyText };

/* Link "Admin Panel" (oben links): lädt den Admin-Code erst beim Klick */
const adminLink = document.getElementById("admin-link");

function hasDraft() {
  if (REMOTE) return false; // mit Datenbank gibt es keinen lokalen Entwurf
  try { return Boolean(localStorage.getItem("fg-draft")); } catch (_) { return false; }
}

function markDraft() {
  adminLink.classList.toggle("has-draft", hasDraft());
  adminLink.title = hasDraft() ? "Entwurf aktiv – nur du siehst diese Änderungen" : "";
}
markDraft();
window.FG.markDraft = markDraft;

let adminScript = null;

adminLink.addEventListener("click", () => {
  const open = () => window.FG_ADMIN && window.FG_ADMIN.open();
  if (window.FG_ADMIN) return open();
  if (adminScript) return;
  adminScript = document.createElement("script");
  adminScript.src = "admin.js";
  adminScript.onload = open;
  adminScript.onerror = () => { adminScript = null; toast("admin.js nicht gefunden"); };
  document.body.appendChild(adminScript);
});
