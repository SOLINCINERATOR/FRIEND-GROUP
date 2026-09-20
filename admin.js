"use strict";

/* ==========================================================================
   Admin Panel
   --------------------------------------------------------------------------
   Wird erst geladen, wenn jemand auf "Admin Panel" klickt.
   Zugang: Code (in script.js als Hash gespeichert, nicht im Klartext).

   Wichtig: Änderungen im Panel siehst zuerst nur DU (in deinem Browser).
   Damit alle sie sehen: "members.js herunterladen" und die Datei im
   Website-Ordner ersetzen bzw. hochladen.
   ========================================================================== */

(function () {
  const FG = window.FG;

  const SESSION_KEY = "fg-admin-session";
  const DRAFT_KEY = "fg-draft";
  const NET_ORDER = ["discord", "tiktok", "x", "snapchat", "telegram"];
  const NET_HINT = {
    discord: "Discord-Name (z. B. 68rz)",
    tiktok: "TikTok-Name",
    x: "X-Name",
    snapchat: "Snapchat-Name",
    telegram: "Telegram-Name"
  };

  let overlay = null;
  let draft = [];

  /* ------------------------------ Helfer ---------------------------------- */

  function h(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  const clone = (x) => JSON.parse(JSON.stringify(x));
  const validId = (v) => /^\d{15,25}$/.test(String(v || "").trim());

  function ensureCss() {
    if (document.getElementById("admin-css")) return;
    const link = document.createElement("link");
    link.id = "admin-css";
    link.rel = "stylesheet";
    link.href = "admin.css";
    document.head.appendChild(link);
  }

  function isAuthed() {
    try { return sessionStorage.getItem(SESSION_KEY) === FG.CONFIG.adminHash; }
    catch (_) { return false; }
  }

  function close() {
    if (overlay) overlay.remove();
    overlay = null;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKey);
  }

  function onKey(e) {
    if (e.key === "Escape") close();
  }

  function mountOverlay(node) {
    close();
    overlay = h("div", "adm-overlay");
    overlay.appendChild(node);
    overlay.addEventListener("mousedown", (e) => {
      if (e.target === overlay) close();
    });
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
  }

  /* ------------------------------ Code-Eingabe ---------------------------- */

  function openGate() {
    const box = h("div", "adm-gate");
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Admin Panel Zugang");

    box.appendChild(h("h2", "adm-title", "Admin Panel"));
    box.appendChild(h("p", "adm-sub", "Gib den Code ein, um reinzukommen."));

    const input = h("input", "adm-input");
    input.type = "password";
    input.placeholder = "Code";
    input.autocomplete = "off";
    input.spellcheck = false;

    const error = h("p", "adm-error");
    error.hidden = true;

    const btn = h("button", "adm-btn primary", "Öffnen");
    btn.type = "button";

    const submit = () => {
      if (FG.sha256("friends-group:" + input.value.trim()) === FG.CONFIG.adminHash) {
        try { sessionStorage.setItem(SESSION_KEY, FG.CONFIG.adminHash); } catch (_) { /* egal */ }
        openPanel();
      } else {
        error.textContent = "Falscher Code.";
        error.hidden = false;
        input.select();
      }
    };

    btn.addEventListener("click", submit);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });

    box.append(input, error, btn);
    mountOverlay(box);
    input.focus();
  }

  /* ------------------------------ Speichern ------------------------------- */

  function save() {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch (_) { /* egal */ }
  }

  /* speichert + zeigt die Änderung sofort auf der Seite (nur bei dir) */
  function apply() {
    save();
    FG.start(clone(draft));
    FG.markDraft();
  }

  function exportList() {
    return draft.map((m) => {
      const o = {};
      if (m.name && m.name.trim()) o.name = m.name.trim();
      if (m.discordId && String(m.discordId).trim()) o.discordId = String(m.discordId).trim();
      if (m.role && m.role.trim()) o.role = m.role.trim();
      if (m.status) o.status = m.status;
      if (m.font) o.font = m.font;
      o.socials = (m.socials || [])
        .filter((s) => s.value && s.value.trim())
        .map((s) => ({ type: s.type, value: s.value.trim() }));
      return o;
    });
  }

  function exportText() {
    return "/* Vom Admin Panel erzeugt – diese Datei ersetzt members.js */\n" +
           "window.MEMBERS_DATA = " + JSON.stringify(exportList(), null, 2) + ";\n";
  }

  function download() {
    const blob = new Blob([exportText()], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "members.js";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    FG.toast("members.js heruntergeladen");
  }

  /* ------------------------------ Panel ----------------------------------- */

  function getSocial(member, type) {
    const s = (member.socials || []).find((x) => x.type === type);
    return s ? s.value : "";
  }

  function setSocials(member, values) {
    member.socials = NET_ORDER
      .filter((t) => values[t] && values[t].trim())
      .map((t) => ({ type: t, value: values[t].trim() }));
  }

  function field(labelText, input) {
    const wrap = h("label", "adm-field");
    wrap.appendChild(h("span", "adm-label", labelText));
    wrap.appendChild(input);
    return wrap;
  }

  function textInput(value, placeholder) {
    const i = h("input", "adm-input");
    i.type = "text";
    i.value = value || "";
    i.placeholder = placeholder || "";
    i.autocomplete = "off";
    i.spellcheck = false;
    return i;
  }

  function select(options, value) {
    const s = h("select", "adm-input");
    options.forEach(([val, label]) => {
      const o = document.createElement("option");
      o.value = val;
      o.textContent = label;
      s.appendChild(o);
    });
    s.value = value || "";
    return s;
  }

  function memberEditor(member, index) {
    const card = h("div", "adm-member");

    /* Kopf */
    const top = h("div", "adm-member-top");
    const title = h("strong", null, member.name || ("Mitglied " + (index + 1)));
    top.appendChild(title);

    const actions = h("div", "adm-actions");
    const mk = (label, title, fn, disabled) => {
      const b = h("button", "adm-icon", label);
      b.type = "button";
      b.title = title;
      b.disabled = Boolean(disabled);
      b.addEventListener("click", fn);
      return b;
    };
    actions.append(
      mk("↑", "Nach oben", () => move(index, -1), index === 0),
      mk("↓", "Nach unten", () => move(index, 1), index === draft.length - 1),
      mk("✕", "Löschen", () => remove(index))
    );
    top.appendChild(actions);
    card.appendChild(top);

    /* Grunddaten */
    const grid = h("div", "adm-grid");

    const idInput = textInput(member.discordId, "Discord-ID (nur Zahlen)");
    idInput.inputMode = "numeric";
    const idNote = h("span", "adm-note");
    const checkId = () => {
      const v = idInput.value.trim();
      const bad = v !== "" && !validId(v);
      idInput.classList.toggle("bad", bad);
      idNote.textContent = bad ? "Die ID muss aus 15–25 Ziffern bestehen." : "";
    };
    idInput.addEventListener("input", checkId);
    idInput.addEventListener("change", () => { member.discordId = idInput.value.trim(); apply(); });
    checkId();

    const nameInput = textInput(member.name, "leer = Discord-Name");
    nameInput.addEventListener("change", () => { member.name = nameInput.value; title.textContent = member.name || ("Mitglied " + (index + 1)); apply(); });

    const roleInput = textInput(member.role, "z. B. Founder");
    roleInput.addEventListener("change", () => { member.role = roleInput.value; apply(); });

    const statusSel = select(
      [["", "Automatisch (Discord)"], ["invisible", "Immer „Unsichtbar“"], ["offline", "Immer „Offline“"],
       ["online", "Immer „Online“"], ["idle", "Immer „Abwesend“"], ["dnd", "Immer „Bitte nicht stören“"]],
      member.status
    );
    statusSel.addEventListener("change", () => { member.status = statusSel.value; apply(); });

    const fontSel = select([["", "Normal"], ["script", "Schreibschrift"]], member.font);
    fontSel.addEventListener("change", () => { member.font = fontSel.value; apply(); });

    const idField = field("Discord-ID", idInput);
    idField.appendChild(idNote);

    grid.append(idField, field("Name", nameInput), field("Rolle", roleInput),
                field("Status", statusSel), field("Schrift des Namens", fontSel));
    card.appendChild(grid);

    /* Social Links: alle Plattformen */
    card.appendChild(h("div", "adm-sep", "Social Links"));
    const socialGrid = h("div", "adm-grid");
    const inputs = {};

    NET_ORDER.forEach((type) => {
      const net = FG.NETWORKS[type];
      const row = h("label", "adm-social");
      const icon = h("span", "adm-social-icon");
      icon.innerHTML = net.icon; // feste, eigene SVGs
      const input = textInput(getSocial(member, type), NET_HINT[type]);
      inputs[type] = input;
      input.addEventListener("change", () => {
        const values = {};
        NET_ORDER.forEach((t) => { values[t] = inputs[t].value; });
        setSocials(member, values);
        apply();
      });
      row.append(icon, input);
      socialGrid.appendChild(row);
    });

    card.appendChild(socialGrid);
    return card;
  }

  /* Struktur-Änderungen */
  function move(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= draft.length) return;
    [draft[i], draft[j]] = [draft[j], draft[i]];
    apply();
    renderList();
  }

  function remove(i) {
    const name = draft[i].name || draft[i].discordId || "dieses Mitglied";
    if (!confirm(name + " wirklich löschen?")) return;
    draft.splice(i, 1);
    apply();
    renderList();
  }

  let listEl = null;

  function renderList() {
    if (!listEl) return;
    listEl.textContent = "";
    if (!draft.length) {
      listEl.appendChild(h("p", "adm-empty", "Noch niemand drin. Trag oben eine Discord-ID ein und klick auf „Hinzufügen“."));
      return;
    }
    draft.forEach((m, i) => listEl.appendChild(memberEditor(m, i)));
  }

  function openPanel() {
    ensureCss();

    /* Ausgangsbasis: dein Entwurf, sonst die echte members.js */
    draft = FG.loadList();

    const panel = h("aside", "adm-panel");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-label", "Admin Panel");

    /* Kopf */
    const head = h("div", "adm-head");
    head.appendChild(h("h2", "adm-title", "Admin Panel"));
    const x = h("button", "adm-icon", "✕");
    x.type = "button";
    x.title = "Schließen";
    x.addEventListener("click", close);
    head.appendChild(x);
    panel.appendChild(head);

    /* Inhalt */
    const body = h("div", "adm-body");

    /* Hinzufügen per Discord-ID */
    const add = h("div", "adm-add");
    add.appendChild(h("div", "adm-label", "Neues Mitglied"));
    const row = h("div", "adm-add-row");
    const idInput = textInput("", "Discord-ID einfügen");
    idInput.inputMode = "numeric";
    const addBtn = h("button", "adm-btn primary", "Hinzufügen");
    addBtn.type = "button";
    row.append(idInput, addBtn);
    const addNote = h("p", "adm-note");
    addNote.textContent = "Profilbild, Banner, Name und Status holt sich die Seite selbst von Discord.";
    add.append(row, addNote);

    const doAdd = () => {
      const id = idInput.value.trim();
      if (!validId(id)) {
        addNote.textContent = "Das ist keine gültige Discord-ID (15–25 Ziffern).";
        addNote.classList.add("err");
        return;
      }
      if (draft.some((m) => String(m.discordId).trim() === id)) {
        addNote.textContent = "Diese ID ist schon in der Liste.";
        addNote.classList.add("err");
        return;
      }
      draft.push({ name: "", discordId: id, socials: [] });
      idInput.value = "";
      addNote.classList.remove("err");
      addNote.textContent = "Hinzugefügt. Unten kannst du Social Links und mehr ergänzen.";
      apply();
      renderList();
      listEl.lastElementChild && listEl.lastElementChild.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    addBtn.addEventListener("click", doAdd);
    idInput.addEventListener("keydown", (e) => { if (e.key === "Enter") doAdd(); });

    listEl = h("div", "adm-list");
    body.append(add, listEl);
    panel.appendChild(body);

    /* Fuß */
    const foot = h("div", "adm-foot");
    const hint = h("p", "adm-note");
    hint.textContent = "Deine Änderungen siehst erst nur du. Damit alle sie sehen: members.js herunterladen und im Website-Ordner ersetzen bzw. hochladen.";
    foot.appendChild(hint);

    const btns = h("div", "adm-foot-btns");

    const dl = h("button", "adm-btn primary", "members.js herunterladen");
    dl.type = "button";
    dl.addEventListener("click", download);

    const copy = h("button", "adm-btn", "Kopieren");
    copy.type = "button";
    copy.addEventListener("click", async () => {
      const ok = await FG.copyText(exportText());
      FG.toast(ok ? "Kopiert" : "Kopieren nicht möglich");
    });

    const reset = h("button", "adm-btn", "Entwurf verwerfen");
    reset.type = "button";
    reset.addEventListener("click", () => {
      if (!confirm("Deinen Entwurf verwerfen und wieder members.js anzeigen?")) return;
      try { localStorage.removeItem(DRAFT_KEY); } catch (_) { /* egal */ }
      draft = FG.loadList();
      FG.start(clone(draft));
      FG.markDraft();
      renderList();
      FG.toast("Entwurf verworfen");
    });

    const out = h("button", "adm-btn", "Abmelden");
    out.type = "button";
    out.addEventListener("click", () => {
      try { sessionStorage.removeItem(SESSION_KEY); } catch (_) { /* egal */ }
      close();
    });

    btns.append(dl, copy, reset, out);
    foot.appendChild(btns);
    panel.appendChild(foot);

    mountOverlay(panel);
    overlay.classList.add("side");
    renderList();
    idInput.focus();
  }

  /* ------------------------------ Einstieg -------------------------------- */

  window.FG_ADMIN = {
    open() {
      ensureCss();
      if (isAuthed()) openPanel();
      else openGate();
    }
  };
})();
