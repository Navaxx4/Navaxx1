
"use strict";
// ======================= DATOS =======================
const RAW = window.PDT_DATA;
const DEX = RAW.dex.map(([name, types], i) => ({ id: i + 1, name, types }));
const WILD = new Set(RAW.wild);
const WILD_LIST = RAW.wild;
const KANTO_SIZE = 150;                       // Mew (151) no cuenta
const LEGENDARY = [144, 145, 146, 150];
const TYPES = ["normal","fire","water","grass","electric","ice","fighting","poison","ground","flying","psychic","bug","rock","ghost","dragon","steel"];
const TYPE_ES = {normal:"Normal",fire:"Fuego",water:"Agua",grass:"Planta",electric:"Eléctrico",ice:"Hielo",fighting:"Lucha",poison:"Veneno",ground:"Tierra",flying:"Volador",psychic:"Psíquico",bug:"Bicho",rock:"Roca",ghost:"Fantasma",dragon:"Dragón",steel:"Acero"};
const TYPE_COLOR = {normal:"#9E9E7A",fire:"#E8692A",water:"#4A7FE0",grass:"#5BA84A",electric:"#D9A400",ice:"#5AB8C0",fighting:"#B03A2E",poison:"#9447A0",ground:"#C2A15A",flying:"#8E7FE0",psychic:"#E64A7B",bug:"#8FA020",rock:"#A88E3A",ghost:"#6A5694",dragon:"#6A3CF0",steel:"#9A9AB5"};
const TYPE_NOUN = {normal:"lo Normal",fire:"Fuego",water:"Agua",grass:"Planta",electric:"Electricidad",ice:"Hielo",fighting:"Lucha",poison:"Veneno",ground:"Tierra",flying:"los Cielos",psychic:"la Mente",bug:"Bichos",rock:"Roca",ghost:"Fantasmas",dragon:"Dragones",steel:"Acero"};
const TYPE_MANIAC = {normal:"Normalmaníaco",fire:"Fuegomaníaco",water:"Aguamaníaco",grass:"Plantamaníaco",electric:"Electromaníaco",ice:"Hielomaníaco",fighting:"Luchamaníaco",poison:"Venenomaníaco",ground:"Tierramaníaco",flying:"Cielomaníaco",psychic:"Psicomaníaco",bug:"Bichomaníaco",rock:"Rocamaníaco",ghost:"Fantasmamaníaco",dragon:"Dragomaníaco",steel:"Aceromaníaco"};
const BP_TITLES = ["Recién salido de Pueblo Paleta","Rastreador del Bosque Verde","Espeleólogo del Monte Moon","Tripulante del S.S. Anne","Valiente de la Torre Pokémon","Explorador de la Zona Safari","Navegante de las Islas Espuma","Superviviente de Calle Victoria","Aspirante de la Meseta Añil","Conquistador de la Cueva Celeste"];
const DAILY_POINTS = 100, WEEKLY_POINTS = 500, POINTS_PER_LEVEL = 1000, MAX_LEVEL = 10;

// ======================= LOGROS (mismo catálogo que la app Android) =======================
const TIERS = [20, 40, 60, 80, 100];
const thr = (total, p) => Math.ceil(total * p / 100);
const ACH = [];
(() => {
  const dexT = ["Novato de Kanto","Aventurero de Kanto","Líder de Gimnasio de Kanto","Alto Mando de Kanto","Campeón de Kanto"];
  const shT = ["Destello de Kanto","Buscador de brillos de Kanto","Cazador variocolor de Kanto","Leyenda brillante de Kanto","Rey de Kanto"];
  TIERS.forEach((p, i) => { const t = thr(KANTO_SIZE, p); ACH.push({id:"kanto_"+t, cat:"Pokédex", title:dexT[i], desc:`Captura ${t} Pokémon de Kanto`, kind:"dex", target:t}); });
  TIERS.forEach((p, i) => { const t = thr(KANTO_SIZE, p); ACH.push({id:"kanto_shiny_"+t, cat:"Variocolor", title:shT[i], desc:`Captura ${t} Pokémon variocolor de Kanto`, kind:"shiny", target:t, requires:"kanto_150"}); });
  const fmt = ["Novato de %s","Aprendiz de %s","Experto en %s","Maestro de %s"];
  TYPES.forEach(type => {
    const total = DEX.slice(0, KANTO_SIZE).filter(m => m.types.includes(type)).length * 2;
    TIERS.forEach((p, i) => {
      const t = thr(total, p);
      const title = i < 4 ? fmt[i].replace("%s", TYPE_NOUN[type]) : TYPE_MANIAC[type];
      ACH.push({id:`type_${type}_${i+1}`, cat:"Tipos", title, desc:`Captura ${t} Pokémon de tipo ${TYPE_ES[type]} (normales y variocolor)`, kind:"type", type, target:t, total});
    });
  });
  const legT = {144:"Señor del Hielo",145:"Señor del Trueno",146:"Señor del Fuego",150:"Domador de Mewtwo"};
  LEGENDARY.forEach(id => ACH.push({id:"legendary_"+id, cat:"Legendarios", title:legT[id], desc:`Captura a ${DEX[id-1].name}`, kind:"legendary", pokemonId:id}));
  ACH.push({id:"platinum_frlg", cat:"Platino", title:"Platino de Rojo Fuego / Verde Hoja", reward:"Maestro Pokémon de Kanto", desc:"Consigue todos los logros de Rojo Fuego / Verde Hoja", kind:"platinum"});
})();

function computeAchievements(caps) {
  const valid = caps.filter(c => c.pokemonId >= 1 && c.pokemonId <= KANTO_SIZE).sort((a, b) => a.capturedAt - b.capturedAt);
  const dex = new Set(), shiny = new Set(), tN = {}, tS = {}, leg = new Set(); const unlocked = {};
  TYPES.forEach(t => { tN[t] = new Set(); tS[t] = new Set(); });
  const typeCount = t => tN[t].size + tS[t].size;
  const check = ts => {
    for (const a of ACH) {
      if (unlocked[a.id]) continue;
      let ok = false;
      if (a.kind === "dex") ok = dex.size >= a.target;
      else if (a.kind === "shiny") ok = shiny.size >= a.target;
      else if (a.kind === "type") ok = typeCount(a.type) >= a.target;
      else if (a.kind === "legendary") ok = leg.has(a.pokemonId);
      else if (a.kind === "platinum") ok = ACH.every(b => b.kind === "platinum" || unlocked[b.id]);
      if (ok) unlocked[a.id] = ts;
    }
  };
  for (const c of valid) {
    dex.add(c.pokemonId); if (c.isShiny) shiny.add(c.pokemonId);
    for (const t of DEX[c.pokemonId - 1].types) (c.isShiny ? tS : tN)[t]?.add(c.pokemonId);
    if (LEGENDARY.includes(c.pokemonId)) leg.add(c.pokemonId);
    check(c.capturedAt); check(c.capturedAt);
  }
  const progress = a => a.kind === "dex" ? dex.size : a.kind === "shiny" ? shiny.size : a.kind === "type" ? typeCount(a.type) : a.kind === "legendary" ? (leg.has(a.pokemonId) ? 1 : 0) : Object.keys(unlocked).filter(k => k !== "platinum_frlg").length;
  const target = a => a.kind === "legendary" ? 1 : a.kind === "platinum" ? ACH.length - 1 : a.target;
  return { unlocked, progress, target, dexCount: dex.size, shinyCount: shiny.size, legCount: leg.size };
}

// ======================= RETOS Y PASE (deterministas por semilla) =======================
function hashStr(s) { let h = 2166136261 >>> 0; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const epochDay = ms => { const d = new Date(ms); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); };
const dayStart = day => { const u = new Date(day * 864e5); return new Date(u.getUTCFullYear(), u.getUTCMonth(), u.getUTCDate()).getTime(); };
const mondayOf = day => day - (((day + 3) % 7) + 7) % 7;
function dailyChallenge(uid, day) {
  const r = rng(hashStr(uid + "|d|" + day)); const pool = WILD_LIST;
  const s1 = pool[Math.floor(r() * pool.length)]; const sh1 = r() < 0.05;
  const targets = [{ id: s1, shiny: sh1 }];
  if (!sh1) { const sh2 = r() < 0.15; const vp = pool.filter(id => !(id === s1 && !sh2)); targets.push({ id: vp[Math.floor(r() * vp.length)], shiny: sh2 }); }
  return { type: "daily", key: "d" + day, start: dayStart(day), end: dayStart(day + 1), targets, points: DAILY_POINTS };
}
function weeklyChallenge(uid, day) {
  const mon = mondayOf(day); const r = rng(hashStr(uid + "|w|" + mon)); const pool = WILD_LIST;
  const g = Math.floor(r() * 5); const targets = [];
  for (let i = 0; i < 5; i++) {
    const shiny = i === g || r() < 0.05;
    const vp = pool.filter(id => !targets.some(t => t.id === id && t.shiny === shiny));
    targets.push({ id: vp[Math.floor(r() * vp.length)], shiny });
  }
  return { type: "weekly", key: "w" + mon, start: dayStart(mon), end: dayStart(mon + 7), targets, points: WEEKLY_POINTS };
}
function challengeProgress(ch, caps) {
  const unused = caps.filter(c => c.capturedAt >= ch.start && c.capturedAt < ch.end);
  const done = ch.targets.map(() => false);
  ch.targets.forEach((t, i) => { if (t.shiny) { const k = unused.findIndex(c => c.pokemonId === t.id && c.isShiny); if (k >= 0) { done[i] = true; unused.splice(k, 1); } } });
  ch.targets.forEach((t, i) => { if (!t.shiny) { const k = unused.findIndex(c => c.pokemonId === t.id); if (k >= 0) { done[i] = true; unused.splice(k, 1); } } });
  return { done, completed: done.every(Boolean) };
}
function challengePoints(uid, caps) {
  if (!caps.length) return { points: 0, completed: [] };
  const first = epochDay(Math.min(...caps.map(c => c.capturedAt))), today = epochDay(Date.now());
  let points = 0; const completed = [];
  for (let d = first; d <= today; d++) { const ch = dailyChallenge(uid, d); if (challengeProgress(ch, caps).completed) { points += ch.points; completed.push(ch.key); } }
  for (let m = mondayOf(first); m <= mondayOf(today); m += 7) { const ch = weeklyChallenge(uid, m); if (challengeProgress(ch, caps).completed) { points += ch.points; completed.push(ch.key); } }
  return { points, completed };
}
function passProgress(points) {
  const lvl = Math.floor(Math.max(0, points) / POINTS_PER_LEVEL);
  return lvl >= MAX_LEVEL ? { level: MAX_LEVEL, into: 0, max: true } : { level: lvl, into: points % POINTS_PER_LEVEL, max: false };
}


// ======================= ALMACENAMIENTO (IndexedDB en este navegador) =======================
const idb = {
  db: null,
  open() {
    return new Promise((res, rej) => {
      const r = indexedDB.open("pdt", 1);
      r.onupgradeneeded = () => { const d = r.result; d.createObjectStore("captures", { keyPath: "id" }); d.createObjectStore("kv"); };
      r.onsuccess = () => { this.db = r.result; res(); }; r.onerror = () => rej(r.error);
    });
  },
  tx(store, mode, fn) {
    return new Promise((res, rej) => { const t = this.db.transaction(store, mode); const s = t.objectStore(store); const out = fn(s); t.oncomplete = () => res(out && out.result !== undefined ? out.result : out); t.onerror = () => rej(t.error); });
  },
  all(store) { return new Promise((res, rej) => { const r = this.db.transaction(store).objectStore(store).getAll(); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); },
  get(key) { return new Promise((res, rej) => { const r = this.db.transaction("kv").objectStore("kv").get(key); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); },
  put(store, val, key) { return this.tx(store, "readwrite", s => s.put(val, key)); },
  clear(store) { return this.tx(store, "readwrite", s => s.clear()); }
};
const store = {
  uid: "local", caps: [], profile: { name: "", seen: [], seenLevel: 0, title: null, posts: {} },
  async init() {
    try {
      await idb.open();
      this.caps = await idb.all("captures");
      this.profile = { ...this.profile, ...((await idb.get("profile")) || {}) };
      if (!this.profile.uid) { this.profile.uid = "t" + Math.random().toString(36).slice(2, 10); await idb.put("kv", this.profile, "profile"); }
      this.uid = this.profile.uid;
      try { navigator.storage?.persist?.(); } catch (_) {}
    } catch (e) { state.syncNote = "Este navegador no permite guardar datos (¿modo privado?). Las capturas se perderán al cerrar."; }
    state.loaded = true;
  },
  async addCapture(c) { c.id = "c" + Date.now() + Math.random().toString(36).slice(2, 6); this.caps = [...this.caps, c]; try { await idb.put("captures", c); } catch (_) { toast("No se ha podido guardar en este navegador."); } return c.id; },
  async saveProfile(patch) { this.profile = { ...this.profile, ...patch }; try { await idb.put("kv", this.profile, "profile"); } catch (_) {} },
  async replaceAll(caps, profile) { await idb.clear("captures"); for (const c of caps) await idb.put("captures", c); this.caps = caps; await this.saveProfile(profile); }
};

// ======================= POKÉAPI =======================
const API = "https://pokeapi.co/api/v2/";
const SPR = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/firered-leafgreen/";
const spriteUrl = (id, shiny) => SPR + (shiny ? "shiny/" : "") + id + ".png";
const SPR_FALLBACK = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/";
async function apiCached(path) {
  const key = "api:" + path;
  try { const c = localStorage.getItem(key); if (c) return JSON.parse(c); } catch (_) {}
  const r = await fetch(API + path); if (!r.ok) throw new Error(r.status === 404 ? "No encontrado" : "Error del servidor");
  const j = await r.json(); return j;
}
const saveCache = (path, v) => { try { localStorage.setItem("api:" + path, JSON.stringify(v)); } catch (_) {} };
async function getDetails(id) {
  const path = "detail/" + id;
  try { const c = localStorage.getItem("api:" + path); if (c) return JSON.parse(c); } catch (_) {}
  const [p, sp, enc] = await Promise.all([apiCached("pokemon/" + id), apiCached("pokemon-species/" + id), apiCached("pokemon/" + id + "/encounters")]);
  const flav = sp.flavor_text_entries || [];
  const pick = (lang, vers) => flav.find(f => f.language.name === lang && (!vers || vers.includes(f.version.name)));
  const ft = pick("es", ["firered", "leafgreen"]) || pick("es") || pick("en", ["firered", "leafgreen"]) || pick("en");
  const genus = (sp.genera || []).find(g => g.language.name === "es")?.genus || "";
  const places = [];
  for (const e of enc) {
    const vd = e.version_details.filter(v => v.version.name === "firered" || v.version.name === "leafgreen");
    if (!vd.length) continue;
    const vers = [...new Set(vd.map(v => v.version.name === "firered" ? "RF" : "VH"))].join("/");
    const methods = [...new Set(vd.flatMap(v => v.encounter_details.map(d => d.method.name)))].filter(m => !/colosseum|xd|bonus/.test(m));
    if (!methods.length) continue;
    places.push({ area: prettyArea(e.location_area.name), vers, methods: methods.map(methodEs).join(", ") });
  }
  const out = { height: p.height, weight: p.weight, flavor: ft ? ft.flavor_text.replace(/[\f\n­]+/g, " ").replace(/\s+/g, " ").trim() : "", flavorLang: ft?.language.name, genus, places, cr: sp.capture_rate };
  saveCache(path, out); return out;
}
const METHOD = { walk: "hierba", "old-rod": "caña vieja", "good-rod": "caña buena", "super-rod": "supercaña", surf: "surf", "rock-smash": "golpe roca", gift: "regalo", "only-one": "único", "pokeflute": "Poké Flauta", "headbutt": "golpe cabeza" };
const methodEs = m => METHOD[m] || m.replace(/-/g, " ");
const PLACE_ES = { "viridian forest": "Bosque Verde", "power plant": "Central Energía", "mt moon": "Monte Moon", "rock tunnel": "Túnel Roca", "safari zone": "Zona Safari", "seafoam islands": "Islas Espuma", "victory road": "Calle Victoria", "cerulean cave": "Cueva Celeste", "pokemon tower": "Torre Pokémon", "digletts cave": "Cueva Diglett", "pokemon mansion": "Mansión Pokémon", "pallet town": "Pueblo Paleta", "viridian city": "Ciudad Verde", "pewter city": "Ciudad Plateada", "cerulean city": "Ciudad Celeste", "vermilion city": "Ciudad Carmín", "lavender town": "Pueblo Lavanda", "celadon city": "Ciudad Azulona", "fuchsia city": "Ciudad Fucsia", "saffron city": "Ciudad Azafrán", "cinnabar island": "Isla Canela", "one island": "Isla Prima", "two island": "Isla Secunda", "three island": "Isla Tera", "four island": "Isla Quarta", "five island": "Isla Quinta", "six island": "Isla Sexta", "seven island": "Isla Séptima", "sea route": "Ruta marina", "route": "Ruta", "silph co": "Silph S.A." };
const prettyArea = s => { let t = s.replace(/^kanto-/, "").replace(/-area$/, "").replace(/-/g, " "); for (const [en, es] of Object.entries(PLACE_ES)) t = t.replace(new RegExp("\\b" + en + "\\b"), es); return t.replace(/\b([a-z])/g, c => c.toUpperCase()).replace(/\b(\d+)f\b/gi, "planta $1").replace(/\bB(\d+)f\b/gi, "sótano $1"); };

// ======================= ESTADO E INTERFAZ =======================
const state = { tab: "pokedex", loaded: false, syncNote: "", camError: "", f: { q: "", status: "all", variant: "all", type: "", leg: false, big: false, shinySprites: false }, pending: null, stream: null };
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmtDate = ms => new Date(ms).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
const fmtDT = ms => new Date(ms).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const pad = n => String(n).padStart(3, "0");
function toast(msg) { const t = document.createElement("div"); t.className = "toast pop"; t.setAttribute("role", "status"); t.textContent = msg; document.body.append(t); setTimeout(() => t.remove(), 3200); }
const ICON = {
  ball: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#fff" stroke="#222" stroke-width="1.6"/><path d="M2 12a10 10 0 0 1 20 0z" fill="#e53935" stroke="#222" stroke-width="1.6"/><circle cx="12" cy="12" r="3.2" fill="#fff" stroke="#222" stroke-width="1.6"/></svg>',
  star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6z" fill="#F9A825" stroke="#a66f00" stroke-width="1"/></svg>',
  dex: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="3"/><circle cx="9" cy="8" r="2"/><path d="M8 14h8M8 17h5"/></svg>',
  trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/></svg>',
  cam: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>'
};
const TABS = [["pokedex", "Pokédex", "dex"], ["logros", "Logros", "trophy"], ["camara", "Capturar", "cam"], ["posts", "Posts", "chat"], ["perfil", "Perfil", "user"]];

function derived() {
  const caps = store.caps; const byId = {};
  for (const c of caps) (byId[c.pokemonId] ||= []).push(c);
  Object.values(byId).forEach(l => l.sort((a, b) => a.capturedAt - b.capturedAt));
  const ach = computeAchievements(caps); const cp = challengePoints(store.uid, caps); const pass = passProgress(cp.points);
  const seen = store.profile.seen || [];
  const pendingAch = Object.keys(ach.unlocked).filter(id => !seen.includes(id));
  const pendingCh = cp.completed.filter(k => !seen.includes(k));
  const pendingLvl = Math.max(0, pass.level - (store.profile.seenLevel || 0));
  return { caps, byId, ach, cp, pass, pendingAch, pendingCh, pendingLvl, badge: pendingAch.length + pendingCh.length + pendingLvl };
}

function render() {
  if (state.tab !== "camara") stopCamera();
  const D = derived();
  $("#who").innerHTML = store.profile.name ? esc(store.profile.name) + (store.profile.title ? `<br><span style="opacity:.8">${esc(store.profile.title)}</span>` : "") : "";
  $("#tabs").innerHTML = TABS.map(([id, label, ic]) => `<button role="tab" aria-selected="${state.tab === id}" data-tab="${id}">${ICON[ic]}<span>${label}</span>${id === "logros" && D.badge ? `<span class="badge" aria-label="${D.badge} novedades">${D.badge}</span>` : ""}</button>`).join("");
  const m = $("#main");
  if (!state.loaded) { m.innerHTML = `<div class="card" style="text-align:center;margin-top:40px"><div class="pixel" style="font-size:10px">Cargando…</div></div>`; return; }
  if (!store.profile.name) { m.innerHTML = viewWelcome(); return; }
  const note = state.syncNote ? `<div class="note" style="margin-bottom:10px">${esc(state.syncNote)}</div>` : "";
  m.innerHTML = note + ({ pokedex: viewDex, logros: viewLogros, camara: viewCam, posts: viewPosts, perfil: viewPerfil }[state.tab])(D);
  if (state.tab === "logros") celebrate(D);
  if (state.tab === "camara" && state.camMode === "live") startCamera();
  if (state.tab === "camara" && state.pending) drawAdjust();
}
function viewWelcome() {
  return `<div class="card" style="max-width:460px;margin:30px auto;text-align:center">
    <h2 class="pixel" style="font-size:12px;line-height:1.7">¡Bienvenido a PokeDexTracker!</h2>
    <p class="muted">Registra los Pokémon que captures en Rojo Fuego / Verde Hoja con una foto de la pantalla del juego.</p>
    <form id="welcome"><label for="tname"><b>¿Cómo te llamas, entrenador?</b></label>
    <input id="tname" class="search" style="width:100%;margin:10px 0" maxlength="20" required autocomplete="nickname" placeholder="Tu nombre">
    <button class="btn" style="width:100%">Empezar</button></form>
    <p class="muted" style="font-size:13px">Tus datos se guardan solo en este navegador. Desde el Perfil puedes exportarlos e importarlos en otro dispositivo.</p></div>`;
}

// ---------- Pokédex (cajas de 30 como la app Android: 6 columnas x 5 filas) ----------
function matchesFilters(mn, cs) {
  const f = state.f, q = f.q.trim().toLowerCase();
  if (q && !(mn.name.toLowerCase().includes(q) || String(mn.id) === q.replace(/^0+/, "") || pad(mn.id).startsWith(q))) return false;
  if (f.status === "got" && !cs.length) return false;
  if (f.status === "miss" && cs.length) return false;
  if (f.variant === "normal" && !cs.some(c => !c.isShiny)) return false;
  if (f.variant === "shiny" && !cs.some(c => c.isShiny)) return false;
  if (f.type && !mn.types.includes(f.type)) return false;
  if (f.leg && !LEGENDARY.includes(mn.id)) return false;
  return true;
}
function viewDex(D) {
  const f = state.f;
  const anyF = f.q.trim() || f.status !== "all" || f.variant !== "all" || f.type || f.leg;
  const dexN = Object.keys(D.byId).filter(id => id <= KANTO_SIZE).length;
  const shN = Object.entries(D.byId).filter(([id, l]) => id <= KANTO_SIZE && l.some(c => c.isShiny)).length;
  const chip = (k, v, label) => `<button class="chip" aria-pressed="${f[k] === v}" data-f="${k}" data-v="${v}">${label}</button>`;
  const boxes = []; for (let a = 1; a <= 151; a += 30) boxes.push([a, Math.min(a + 29, 151)]);
  return `
  <div class="card">
    <div class="progress pixel"><span>Pokédex</span><span title="Capturados">◓ ${dexN}/${KANTO_SIZE}</span><span title="Variocolor" style="color:var(--gold)">★ ${shN}/${KANTO_SIZE}</span></div>
    <div class="bar" style="margin-top:8px" role="progressbar" aria-valuenow="${dexN}" aria-valuemax="${KANTO_SIZE}" aria-label="Progreso de la Pokédex"><i style="width:${dexN / KANTO_SIZE * 100}%"></i></div>
  </div>
  <div class="filters">
    <input class="search" id="q" type="search" placeholder="Buscar por nombre o número" value="${esc(f.q)}" aria-label="Buscar Pokémon">
    <button class="chip" id="sizeBtn" aria-pressed="${f.big}" title="También puedes pellizcar la cuadrícula">${f.big ? "Vista grande" : "Vista de cajas"}</button>
    <button class="chip" data-f="shinySprites" data-v="toggle" aria-pressed="${f.shinySprites}">★ Sprites variocolor</button>
  </div>
  <div class="filters">
    ${chip("status", "all", "Todos")}${chip("status", "got", "Capturados")}${chip("status", "miss", "Sin capturar")}
    ${chip("variant", "normal", "Normal")}${chip("variant", "shiny", "★ Variocolor")}
    <button class="chip" aria-pressed="${f.leg}" data-f="leg" data-v="toggle">Legendarios</button>
    <select id="typeSel" aria-label="Filtrar por tipo"><option value="">Todos los tipos</option>${TYPES.map(t => `<option value="${t}" ${f.type === t ? "selected" : ""}>${TYPE_ES[t]}</option>`).join("")}</select>
    ${anyF ? `<button class="chip" id="clearF">Limpiar filtros</button>` : ""}
  </div>
  <div class="pc ${f.big ? "large" : "boxmode"}" id="pc">
  ${boxes.map(([a, b], i) => {
    const mons = DEX.slice(a - 1, b);
    const reg = mons.filter(m => m.id <= KANTO_SIZE);
    const got = reg.filter(m => D.byId[m.id]).length, sh = reg.filter(m => (D.byId[m.id] || []).some(c => c.isShiny)).length;
    return `<section class="pcbox" aria-label="Caja ${i + 1}">
      <h3 class="pcbox-h"><span>Caja ${i + 1} · #${pad(a)}–#${pad(b)}</span><span class="cnt"><span title="Capturados">${ICON.ball} ${got}/${reg.length}</span><span title="Variocolor">${ICON.star} ${sh}/${reg.length}</span></span></h3>
      <div class="pcgrid">${mons.map(mn => cell(mn, D.byId[mn.id] || [])).join("")}</div></section>`;
  }).join("")}
  </div>`;
}
function cell(mn, cs) {
  const got = cs.length > 0, sh = cs.some(c => c.isShiny), match = matchesFilters(mn, cs);
  const label = `${pad(mn.id)} ${mn.name}, ${got ? "capturado" : "sin capturar"}${sh ? ", variocolor capturado" : ""}${match ? "" : ", no coincide con el filtro"}`;
  return `<button class="mon ${got ? "got" : "miss"} ${match ? "" : "dim"}" data-mon="${mn.id}" ${match ? "" : 'tabindex="-1" aria-disabled="true"'} aria-label="${esc(label)}">
    <span class="ind"><span class="i-ball">${got ? ICON.ball : ""}</span><span class="i-star">${sh ? ICON.star : ""}</span></span>
    <img class="sp" loading="lazy" src="${spriteUrl(mn.id, state.f.shinySprites)}" alt="" onerror="this.onerror=null;this.src='${SPR_FALLBACK}${mn.id}.png'">
    <span class="num pixel">#${pad(mn.id)}</span>${state.f.big ? `<span class="nm">${esc(mn.name)}</span>` : ""}</button>`;
}
// Al buscar, desplazar hasta la primera coincidencia (como en Android)
function scrollToFirstMatch() {
  if (!state.f.q.trim()) return; const el = document.querySelector(".pc .mon:not(.dim)"); if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
}
// Pellizcar para cambiar entre vista de cajas (6 columnas) y vista grande (3 columnas)
let pinch = null;
document.addEventListener("touchstart", e => { if (e.touches.length === 2 && e.target.closest("#pc")) { const [a, b] = e.touches; pinch = { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), done: false }; } }, { passive: true });
document.addEventListener("touchmove", e => {
  if (!pinch || e.touches.length !== 2 || pinch.done) return; const [a, b] = e.touches; const r = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) / pinch.d;
  if (r > 1.25 && !state.f.big) { state.f.big = true; pinch.done = true; render(); } else if (r < 0.8 && state.f.big) { state.f.big = false; pinch.done = true; render(); }
}, { passive: true });
document.addEventListener("touchend", () => { pinch = null; });
async function openMon(id) {
  const mn = DEX[id - 1], D = derived(), cs = D.byId[id] || [];
  const firstN = cs.find(c => !c.isShiny), firstS = cs.find(c => c.isShiny);
  const boxv = (label, c, star) => `<div class="card" style="padding:10px"><div class="row" style="justify-content:space-between"><b>${star ? "★ " : ""}${label}</b>${c ? '<span class="muted" style="font-size:12px" aria-label="validada">✓✓</span>' : ""}</div>
    ${c ? `<div class="muted" style="font-size:12px">Primera captura: ${fmtDate(c.capturedAt)}</div>${c.photo ? `<img class="photo sprite" style="margin-top:6px;cursor:zoom-in" src="${c.photo}" alt="Foto de la captura" data-zoom="1">` : ""}` : `<div class="muted" style="font-size:13px;margin-top:6px">Sin capturar</div>`}</div>`;
  sheet(`<button class="close" data-close aria-label="Cerrar">×</button>
    <div class="pixel muted" style="font-size:10px">${pad(id)}</div><h2 style="margin:6px 0">${esc(mn.name)} <span class="muted" id="genus" style="font-size:14px;font-weight:400"></span></h2>
    <div class="row">${mn.types.map(t => `<span class="type" style="background:${TYPE_COLOR[t]}">${TYPE_ES[t]}</span>`).join("")}${LEGENDARY.includes(id) ? '<span class="type" style="background:#b8860b">Legendario</span>' : ""}</div>
    <div class="ficha-sprites" style="margin:14px 0"><figure><img src="${spriteUrl(id, false)}" alt="Sprite normal de ${esc(mn.name)}"><figcaption>Normal</figcaption></figure><figure><img src="${spriteUrl(id, true)}" alt="Sprite variocolor de ${esc(mn.name)}"><figcaption>★ Variocolor</figcaption></figure></div>
    <div id="det" class="muted" style="font-size:14px">Cargando datos de la PokéAPI…</div>
    ${id === 151 ? '<p class="note">Mew no cuenta para la Pokédex de Rojo Fuego / Verde Hoja.</p>' : ""}
    <h3 class="pixel section-title">Tus capturas</h3>
    <div class="two">${boxv("Normal", firstN, false)}${boxv("Variocolor", firstS, true)}</div>
    ${cs.length > 1 ? `<p class="muted" style="font-size:13px">${cs.length} capturas registradas.</p>` : ""}`);
  try {
    const d = await getDetails(id); const el = $("#det"); if (!el) return;
    $("#genus").textContent = d.genus ? "· " + d.genus : "";
    el.classList.remove("muted");
    el.innerHTML = `${d.flavor ? `<p style="margin:0 0 10px">${esc(d.flavor)}${d.flavorLang === "en" ? ' <span class="muted">(en inglés)</span>' : ""}</p>` : ""}
      <dl class="kv"><dt>Altura</dt><dd>${(d.height / 10).toLocaleString("es-ES")} m</dd><dt>Peso</dt><dd>${(d.weight / 10).toLocaleString("es-ES")} kg</dd></dl>
      <h3 class="pixel section-title">Dónde conseguirlo en RF/VH</h3>
      ${d.places.length ? `<ul style="margin:0;padding-left:18px">${d.places.map(p => `<li>${esc(p.area)} <span class="muted">(${p.vers} · ${esc(p.methods)})</span></li>`).join("")}</ul>` : `<p class="muted" style="margin:0">No aparece en estado salvaje: se consigue por evolución, regalo, intercambio o evento.</p>`}`;
  } catch (e) { const el = $("#det"); if (el) el.innerHTML = `Sin conexión con la PokéAPI. <button class="chip" data-mon="${id}">Reintentar</button>`; }
}

// ---------- Logros ----------
function viewLogros(D) {
  const uid = store.uid, today = epochDay(Date.now());
  const chs = [dailyChallenge(uid, today), weeklyChallenge(uid, today)];
  const done = Object.keys(D.ach.unlocked).length;
  const groups = ["Pokédex", "Variocolor", "Legendarios", "Tipos", "Platino"];
  return `
  <h2 class="pixel section-title">Retos</h2>
  ${chs.map(ch => { const p = challengeProgress(ch, D.caps); return `<div class="card" style="margin-bottom:10px">
    <div class="row" style="justify-content:space-between"><b>${ch.type === "daily" ? "Reto diario" : "Reto semanal"}</b><span class="muted" style="font-size:13px">${p.completed ? "✓ Completado · " : ""}${ch.points} puntos</span></div>
    <div class="muted" style="font-size:12px">Hasta el ${fmtDT(ch.end - 1)}</div>
    ${ch.targets.map((t, i) => `<div class="target"><img class="sprite" width="40" height="40" src="${spriteUrl(t.id, t.shiny)}" alt="">${p.done[i] ? '<span class="ok" aria-label="hecho">✓</span>' : '<span aria-hidden="true">○</span>'}<span>Captura ${t.shiny ? "un <b>" + esc(DEX[t.id - 1].name) + " variocolor</b> ★" : "un <b>" + esc(DEX[t.id - 1].name) + "</b>"}</span></div>`).join("")}
  </div>`; }).join("")}
  <h2 class="pixel section-title">Pase de batalla</h2>
  <div class="card">
    <div class="row" style="justify-content:space-between"><b>Nivel ${D.pass.level}${D.pass.max ? " (máximo)" : ""}</b><span class="muted" style="font-size:13px">${D.cp.points} puntos</span></div>
    ${D.pass.max ? "" : `<div class="bar" style="margin:8px 0" role="progressbar" aria-valuenow="${D.pass.into}" aria-valuemax="1000" aria-label="Progreso al siguiente nivel"><i style="width:${D.pass.into / 10}%"></i></div><div class="muted" style="font-size:12px">${D.pass.into}/1000 para el nivel ${D.pass.level + 1}</div>`}
    <div class="pass" style="margin-top:10px">${BP_TITLES.map((t, i) => `<div class="lvl ${D.pass.level > i ? "done" : ""}"><div class="pixel n">Nv. ${i + 1}</div>${D.pass.level > i ? "" : "🔒 "}${esc(t)}</div>`).join("")}</div>
  </div>
  <h2 class="pixel section-title">Logros · ${done}/${ACH.length}</h2>
  ${groups.map(g => `<div class="card" style="margin-bottom:10px"><b>${g}</b>${ACH.filter(a => a.cat === g).map(a => {
    const un = D.ach.unlocked[a.id]; const hidden = a.requires && !D.ach.unlocked[a.requires] && !un;
    const pr = Math.min(D.ach.progress(a), D.ach.target(a));
    return `<div class="ach ${un ? "done" : ""}"><div class="ico">${un ? "🏆" : "🔒"}</div>
      <div style="flex:1"><div class="t">${hidden ? "Logro oculto" : esc(a.title)}</div><div class="d">${hidden ? "Completa la Pokédex de Kanto para verlo." : esc(a.desc)}${un ? " · " + fmtDate(un) : ""}</div></div>
      <div class="p">${hidden ? "" : pr + "/" + D.ach.target(a)}</div></div>`;
  }).join("")}</div>`).join("")}`;
}
function celebrate(D) {
  if (!D.badge || $("#layer").innerHTML) return;
  const items = [
    ...D.pendingCh.map(k => `<li>Reto ${k[0] === "d" ? "diario" : "semanal"} completado: <b>+${k[0] === "d" ? DAILY_POINTS : WEEKLY_POINTS} puntos</b></li>`),
    ...Array.from({ length: D.pendingLvl }, (_, i) => { const l = (store.profile.seenLevel || 0) + i + 1; return `<li>¡Nivel ${l} del pase! Título: <b>${esc(BP_TITLES[l - 1])}</b></li>`; }),
    ...D.pendingAch.map(id => { const a = ACH.find(x => x.id === id); return `<li>Logro: <b>${esc(a.title)}</b></li>`; })
  ];
  sheet(`<div class="anim pop" style="padding-top:0"><div class="ball" aria-hidden="true" style="width:auto;height:auto;font-size:64px;line-height:1">🏆</div>
    <h2 class="pixel" style="font-size:13px;margin:0">¡Novedades!</h2></div><ul style="padding-left:20px">${items.join("")}</ul>
    <button class="btn" style="width:100%" id="seenBtn">Genial</button>`);
  if (navigator.vibrate) try { navigator.vibrate(60); } catch (_) {}
  $("#seenBtn").onclick = async () => { closeSheet(); await store.saveProfile({ seen: [...new Set([...(store.profile.seen || []), ...D.pendingAch, ...D.pendingCh])], seenLevel: D.pass.level }); render(); };
}

// ======================= CÁMARA, RECORTE Y VALIDACIÓN =======================
// Mismas zonas que GameScreenLayouts.FIRE_RED_LEAF_GREEN de la app Android (pantalla de 240x160).
const LAYOUT = { w: 240, h: 160, SPRITE: [4, 33, 116, 94], DEX_NUMBER: [164, 21, 188, 33], SHINY_STAR: [100, 33, 112, 45], INFO_TEXT: [110, 10, 240, 52] };
function viewCam() {
  const p = state.pending;
  if (p) return `
  <div class="card">
    <h2 class="pixel" style="font-size:11px;margin:0 0 6px">Ajusta el recuadro</h2>
    <p class="muted" style="margin:0 0 10px;font-size:14px">Arrastra el recuadro para que coincida con el borde de la pantalla del juego. Usa la esquina inferior derecha para cambiar el tamaño.</p>
    <div class="adjust" id="adj"><canvas id="adjc"></canvas></div>
    <p class="muted" style="font-size:13px;margin:10px 0 4px">Así se verá el recorte (las zonas amarillas deben caer sobre el número, el nombre y el sprite):</p>
    <canvas id="cropPrev" class="crop-preview" width="480" height="320" aria-label="Vista previa del recorte"></canvas>
    <div class="row" style="margin-top:12px"><button class="btn" id="validate" style="flex:1">Validar captura</button><button class="btn ghost" id="retake">Repetir</button></div>
    ${state.camError ? `<div class="err" style="margin-top:12px">${state.camError}</div>` : ""}
  </div>`;
  return `
  <div class="card">
    <h2 class="pixel" style="font-size:12px;margin:0 0 8px">Registrar una captura</h2>
    <p class="muted" style="margin:0 0 12px;font-size:14px">Encuadra la pantalla de resumen («INFO. POKéMON») de Rojo Fuego o Verde Hoja dentro del marco y haz la foto.</p>
    ${state.camMode === "live" ? `<div class="cam" id="cam"><video id="video" playsinline muted autoplay></video><div class="frame" id="frame">
        <i style="left:${123 / 2.4}%;top:${19 / 1.6}%;width:${115 / 2.4}%;height:${16 / 1.6}%"></i><i style="left:${2 / 2.4}%;top:${31 / 1.6}%;width:${116 / 2.4}%;height:${65 / 1.6}%"></i></div>
        <div class="hint">Número arriba a la derecha · sprite a la izquierda</div></div>
      <div class="row" style="justify-content:center;gap:24px;margin-top:14px"><button class="btn ghost" id="camOff">Cerrar cámara</button><button class="shutter" id="shoot" aria-label="Hacer foto"></button>
      <label class="btn ghost" style="cursor:pointer">Galería<input type="file" id="file" accept="image/*" class="sr"></label></div>`
    : `<div class="row" style="gap:10px"><button class="btn" id="camOn" style="flex:1">${ICON.cam.replace("<svg", '<svg width="20" height="20"')} Abrir cámara</button>
       <label class="btn ghost" style="flex:1;cursor:pointer">Elegir foto<input type="file" id="file" accept="image/*" class="sr"></label></div>
       <div class="drop" id="drop" style="margin-top:12px"><span class="muted" style="font-size:13px">o arrastra aquí una imagen</span></div>`}
    ${state.camError ? `<div class="err" style="margin-top:12px">${state.camError}</div>` : ""}
  </div>
  <div class="card" style="margin-top:10px"><b>Consejos</b><ul class="muted" style="font-size:14px;margin:6px 0 0;padding-left:18px">
    <li>Pantalla recta, sin reflejos y ocupando todo el marco.</li><li>Página «INFO. POKéMON», con el número «No.» y el nombre visibles.</li><li>Pokédex válida: 001–150 (Mew no cuenta).</li></ul></div>`;
}
async function startCamera() {
  const v = $("#video"); if (!v) return;
  if (!navigator.mediaDevices?.getUserMedia) { state.camMode = ""; state.camError = "Este navegador no permite usar la cámara aquí. Usa «Elegir foto»."; return render(); }
  try {
    if (!state.stream) state.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1440 } }, audio: false });
    v.srcObject = state.stream; await v.play().catch(() => {});
  } catch (e) {
    state.camMode = ""; state.camError = e.name === "NotAllowedError" ? "Has denegado el permiso de la cámara. Actívalo en los ajustes del navegador (en el iPhone: Ajustes › Safari › Cámara) o usa «Elegir foto»." : "No se ha podido abrir la cámara. Usa «Elegir foto».";
    render();
  }
}
function stopCamera() { if (state.stream) { state.stream.getTracks().forEach(t => t.stop()); state.stream = null; } }
function shoot() {
  const v = $("#video"), fr = $("#frame"); if (!v || !v.videoWidth) return;
  const c = document.createElement("canvas"); c.width = v.videoWidth; c.height = v.videoHeight; c.getContext("2d").drawImage(v, 0, 0);
  // Pasar el marco (coordenadas de pantalla) a píxeles del vídeo con object-fit: cover
  const vr = v.getBoundingClientRect(), fb = fr.getBoundingClientRect();
  const scale = Math.max(vr.width / v.videoWidth, vr.height / v.videoHeight);
  const offX = (vr.width - v.videoWidth * scale) / 2, offY = (vr.height - v.videoHeight * scale) / 2;
  const x = (fb.left - vr.left - offX) / scale, y = (fb.top - vr.top - offY) / scale, w = fb.width / scale;
  stopCamera(); state.camMode = "";
  setPending(c, { x, y, w });
}
async function pickFile(file) {
  state.camError = "";
  if (!file || !file.type.startsWith("image/")) { state.camError = "Elige una imagen."; return render(); }
  try {
    const url = URL.createObjectURL(file); const img = new Image(); img.src = url; await img.decode();
    const s = Math.min(1, 2400 / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas"); c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
    c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
    const w = Math.min(c.width * .9, c.height * .9 * 1.5);
    stopCamera(); state.camMode = "";
    setPending(c, { x: (c.width - w) / 2, y: (c.height - w / 1.5) / 2, w });
  } catch (_) { state.camError = "No se ha podido abrir la imagen."; render(); }
}
function setPending(canvas, rect) { state.pending = { src: canvas, rect }; state.camError = ""; render(); }
function clampRect() {
  const p = state.pending, W = p.src.width, H = p.src.height, r = p.rect;
  r.w = Math.max(60, Math.min(r.w, W, H * 1.5)); r.x = Math.max(0, Math.min(r.x, W - r.w)); r.y = Math.max(0, Math.min(r.y, H - r.w / 1.5));
}
function drawAdjust() {
  const p = state.pending, cv = $("#adjc"); if (!cv) return;
  const W = p.src.width, H = p.src.height; const maxW = Math.min(1100, $("#adj").clientWidth * (devicePixelRatio || 1));
  const k = maxW / W; cv.width = Math.round(W * k); cv.height = Math.round(H * k);
  const g = cv.getContext("2d"); g.drawImage(p.src, 0, 0, cv.width, cv.height);
  clampRect(); const r = p.rect, rx = r.x * k, ry = r.y * k, rw = r.w * k, rh = rw / 1.5;
  g.fillStyle = "rgba(0,0,0,.5)"; g.beginPath(); g.rect(0, 0, cv.width, cv.height); g.rect(rx, ry, rw, rh); g.fill("evenodd");
  g.strokeStyle = "#fff"; g.lineWidth = 3; g.strokeRect(rx, ry, rw, rh);
  g.fillStyle = "#C62828"; const hs = Math.max(22, cv.width / 28); g.fillRect(rx + rw - hs, ry + rh - hs, hs, hs); g.strokeRect(rx + rw - hs, ry + rh - hs, hs, hs);
  p.k = k; p.hs = hs;
  // Vista previa 240x160 (x2) con las zonas de la app
  const pc = $("#cropPrev"); const pg = pc.getContext("2d"); pg.imageSmoothingQuality = "high";
  pg.drawImage(p.src, r.x, r.y, r.w, r.w / 1.5, 0, 0, 480, 320);
  pg.strokeStyle = "rgba(255,213,0,.95)"; pg.lineWidth = 2;
  for (const z of [LAYOUT.SPRITE, LAYOUT.INFO_TEXT, LAYOUT.SHINY_STAR]) pg.strokeRect(z[0] * 2, z[1] * 2, (z[2] - z[0]) * 2, (z[3] - z[1]) * 2);
}
let drag = null;
document.addEventListener("pointerdown", e => {
  const cv = e.target.closest("#adjc"); if (!cv || !state.pending) return;
  const p = state.pending, b = cv.getBoundingClientRect(), sx = cv.width / b.width;
  const px = (e.clientX - b.left) * sx / p.k, py = (e.clientY - b.top) * sx / p.k, r = p.rect, rh = r.w / 1.5, hs = p.hs / p.k;
  const inHandle = px > r.x + r.w - hs * 1.6 && py > r.y + rh - hs * 1.6 && px < r.x + r.w + hs && py < r.y + rh + hs;
  drag = { mode: inHandle ? "resize" : "move", px, py, r0: { ...r }, sx, b }; cv.setPointerCapture(e.pointerId); e.preventDefault();
});
document.addEventListener("pointermove", e => {
  if (!drag || !state.pending) return; const p = state.pending;
  const px = (e.clientX - drag.b.left) * drag.sx / p.k, py = (e.clientY - drag.b.top) * drag.sx / p.k;
  if (drag.mode === "move") { p.rect.x = drag.r0.x + px - drag.px; p.rect.y = drag.r0.y + py - drag.py; }
  else { const dw = Math.max(px - drag.px, (py - drag.py) * 1.5); p.rect.w = drag.r0.w + dw; }
  drawAdjust();
});
document.addEventListener("pointerup", () => { drag = null; });

// --- Píxeles y análisis (portado de la app Android) ---
function rgbToHsv(r, g, b) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let h = 0;
  if (d > 0) { if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h *= 60; if (h < 0) h += 360; }
  return [h, mx === 0 ? 0 : d / mx, mx]; }
function whiteBalance(px, w, h) {
  const [l, t, rr, bb] = LAYOUT.SPRITE; let n = 0, sr = 0, sg = 0, sb = 0;
  for (let y = t; y < Math.min(h, bb); y++) for (let x = l; x < Math.min(w, rr); x++) { const i = (y * w + x) * 4, hsv = rgbToHsv(px[i], px[i + 1], px[i + 2]); if (hsv[1] < .25 && hsv[2] > .55) { n++; sr += px[i]; sg += px[i + 1]; sb += px[i + 2]; } }
  if (n < 200) return px; const fr = 245 / (sr / n), fg = 245 / (sg / n), fb = 245 / (sb / n); const out = new Uint8ClampedArray(px);
  for (let i = 0; i < px.length; i += 4) { out[i] = px[i] * fr; out[i + 1] = px[i + 1] * fg; out[i + 2] = px[i + 2] * fb; }
  return out;
}
function countStarPixels(px, w, h) {
  const [l, t, r, b] = LAYOUT.SHINY_STAR, m = 4; const sx = Math.max(0, l - m), ex = Math.min(w, r), sy = Math.max(0, t - m), ey = Math.min(h, b + m);
  const rw = ex - sx, rh = ey - sy; if (rw <= 0 || rh <= 0) return 0;
  const hsv = [], sats = [];
  for (let y = 0; y < rh; y++) { hsv.push([]); for (let x = 0; x < rw; x++) { const i = ((sy + y) * w + sx + x) * 4; const v = rgbToHsv(px[i], px[i + 1], px[i + 2]); hsv[y].push(v); sats.push(v[1]); } }
  sats.sort((a, b) => a - b); const req = Math.max(.12, sats[sats.length >> 1] + .10);
  const cand = hsv.map(row => row.map(([hh, s, v]) => ((hh >= 0 && hh <= 70) || hh >= 340) && s >= req && v > .35));
  const seen = hsv.map(row => row.map(() => false)); let best = 0;
  for (let y = 0; y < rh; y++) for (let x = 0; x < rw; x++) {
    if (!cand[y][x] || seen[y][x]) continue; const blob = [], q = [[x, y]]; seen[y][x] = true;
    while (q.length) { const [cx, cy] = q.shift(); blob.push([cx, cy]); for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = cx + dx, ny = cy + dy; if ((dx || dy) && nx >= 0 && ny >= 0 && nx < rw && ny < rh && cand[ny][nx] && !seen[ny][nx]) { seen[ny][nx] = true; q.push([nx, ny]); } } }
    if (blob.length < 6) continue;
    const xs = blob.map(p => p[0] + sx), ys = blob.map(p => p[1] + sy); const mnx = Math.min(...xs), mxx = Math.max(...xs), mny = Math.min(...ys), mxy = Math.max(...ys);
    const bw = mxx - mnx + 1, bh = mxy - mny + 1; if (bw > 10 || bh > 10) continue; const mind = Math.min(bw, bh), maxd = Math.max(bw, bh); if (mind < 2 || maxd > 3 * mind) continue;
    let tot = 0, neu = 0;
    for (let yy = Math.max(0, mny - 2); yy <= Math.min(h - 1, mxy + 2); yy++) for (let xx = Math.max(0, mnx - 2); xx <= Math.min(w - 1, mxx + 2); xx++) {
      if (xx >= mnx && xx <= mxx && yy >= mny && yy <= mxy) continue; tot++; const i = (yy * w + xx) * 4; if (rgbToHsv(px[i], px[i + 1], px[i + 2])[1] < .25) neu++; }
    if ((tot ? neu / tot : 1) >= .7) best = Math.max(best, blob.length);
  }
  return best;
}
const normName = t => t.toLowerCase().replace(/♀/g, "f").replace(/♂/g, "m").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/0/g, "o").replace(/1/g, "l").replace(/5/g, "s").replace(/8/g, "b").replace(/[^a-z]/g, "");
function levD(a, b) { const dp = Array.from({ length: b.length + 1 }, (_, i) => i); for (let i = 1; i <= a.length; i++) { let prev = i; for (let j = 1; j <= b.length; j++) { const cur = Math.min(dp[j] + 1, prev + 1, dp[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); dp[j - 1] = prev; prev = cur; } dp[b.length] = prev; } return dp[b.length]; }
const maxDist = n => n <= 3 ? 0 : n <= 6 ? 1 : 2;
function numberCandidates(text) {
  const out = [];
  for (const tok of text.split(/\s+/)) {
    const s = tok.replace(/^.{0,2}?(no|nº|n°|n\.)/i, "").trim(); if (!/\d/.test(s)) continue;
    const n = s.replace(/[Oo]/g, "0").replace(/[Il|]/g, "1").replace(/[Ss]/g, "5").replace(/[Bb]/g, "8").replace(/[Zz]/g, "2").replace(/[^\d]/g, "");
    if (/^\d{1,3}$/.test(n)) { const v = +n; if (v >= 1 && v <= 386 && !out.includes(v)) out.push(v); }
  }
  return out;
}
function nameMatchesText(text, expected) {
  const exp = normName(expected); if (!exp) return false; const toks = text.split(/\s+/); const cands = [];
  for (const t of toks) { const n = normName(t); if (n.length >= 3) cands.push(n); }
  for (let i = 0; i < toks.length - 1; i++) { const n = normName(toks[i] + toks[i + 1]); if (n.length >= 3 && !cands.includes(n)) cands.push(n); }
  const md = maxDist(exp.length);
  for (const c of cands) {
    if (levD(c, exp) <= md) return true;
    for (let k = 2; k < c.length; k++) { const pre = c.slice(0, k), rest = c.slice(k); if (["name", "nombre"].some(l => levD(pre, l) <= 2 && Math.abs(pre.length - l.length) <= 1) && levD(rest, exp) <= md) return true; }
  }
  return false;
}
let ocrWorker = null;
async function getWorker(onStatus) {
  if (ocrWorker) return ocrWorker;
  if (!window.Tesseract) throw new Error("ocr");
  onStatus("Descargando el lector de texto (solo la primera vez)…");
  ocrWorker = await Tesseract.createWorker("eng", 1, { logger: m => { if (m.status && m.progress != null) onStatus(m.status === "recognizing text" ? "Leyendo el texto…" : "Preparando el lector de texto… " + Math.round(m.progress * 100) + "%"); } });
  await ocrWorker.setParameters({ tessedit_pageseg_mode: "6", tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.º°/♀♂' " });
  return ocrWorker;
}
function regionCanvas(src, z, scale) {
  const c = document.createElement("canvas"); c.width = (z[2] - z[0]) * scale; c.height = (z[3] - z[1]) * scale;
  const g = c.getContext("2d"); g.imageSmoothingEnabled = false; g.drawImage(src, z[0], z[1], z[2] - z[0], z[3] - z[1], 0, 0, c.width, c.height);
  const d = g.getImageData(0, 0, c.width, c.height), p = d.data;
  for (let i = 0; i < p.length; i += 4) { const y = .299 * p[i] + .587 * p[i + 1] + .114 * p[i + 2]; p[i] = p[i + 1] = p[i + 2] = y; }
  g.putImageData(d, 0, 0); return c;
}
async function validate() {
  const p = state.pending; if (!p) return;
  sheet(`<div class="anim"><div class="grass" aria-hidden="true">${[10, 40, 70, 100, 130, 160].map((x, i) => `<i style="left:${x - 10}px;animation-delay:${i * .12}s"></i>`).join("")}<span class="walker"></span></div>
    <div class="pixel" style="font-size:10px">Buscando Pokémon…</div><div class="muted" style="font-size:13px" id="vstat">Analizando la foto</div></div>`, true);
  const status = t => { const el = $("#vstat"); if (el) el.textContent = t; };
  // 1. Recorte normalizado a 240x160
  const r = p.rect; const n = document.createElement("canvas"); n.width = 240; n.height = 160;
  const ng = n.getContext("2d", { willReadFrequently: true }); ng.imageSmoothingQuality = "high"; ng.drawImage(p.src, r.x, r.y, r.w, r.w / 1.5, 0, 0, 240, 160);
  const px = ng.getImageData(0, 0, 240, 160).data;
  // 2. OCR de las filas de número y nombre
  let text = "";
  let numText = "";
  try {
    const w = await getWorker(status); status("Leyendo el número y el nombre…");
    await w.setParameters({ tessedit_pageseg_mode: "6", tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.º°/♀♂' " });
    text = (await w.recognize(regionCanvas(n, LAYOUT.INFO_TEXT, 4))).data.text || "";
    await w.setParameters({ tessedit_pageseg_mode: "7", tessedit_char_whitelist: "0123456789" });
    numText = (await w.recognize(regionCanvas(n, [LAYOUT.DEX_NUMBER[0] - 4, LAYOUT.DEX_NUMBER[1] - 1, LAYOUT.DEX_NUMBER[2] + 4, LAYOUT.DEX_NUMBER[3] + 1], 6))).data.text || "";
  }
  catch (_) { closeSheet(); state.camError = "No se ha podido cargar el lector de texto. Comprueba la conexión a internet y vuelve a intentarlo."; return render(); }
  // 3. Número + nombre (igual que CaptureAnalyzer)
  const cands = [...new Set([...numberCandidates(numText), ...numberCandidates(text)])]; let dex = null, nameOk = null;
  for (const c of cands) { if (c >= 1 && c <= KANTO_SIZE) { if (nameMatchesText(text, DEX[c - 1].name)) { dex = c; nameOk = true; break; } if (dex == null) { dex = c; nameOk = false; } } }
  if (!nameOk) {
    // El nombre identifica a un único Pokémon y el número leído solo falla en un dígito: se acepta (error típico del OCR).
    const byName = DEX.slice(0, KANTO_SIZE).filter(m => nameMatchesText(text, m.name));
    const raw = (numText + " " + text).replace(/[Oo]/g, "0").match(/\d{2,3}/g) || [];
    if (byName.length === 1) { const want = pad(byName[0].id); if (raw.some(r => { const s = r.padStart(3, "0"); return s.length === 3 && [...s].filter((ch, i) => ch !== want[i]).length <= 1; })) { dex = byName[0].id; nameOk = true; } }
  }
  if (dex == null && cands.length) { dex = cands[0]; nameOk = false; }
  // 4. Estrella variocolor tras el balance de blancos
  const isShiny = countStarPixels(whiteBalance(px, 240, 160), 240, 160) >= 6;
  const reasons = [];
  if (dex == null) reasons.push("No se ha podido leer el número de la Pokédex.");
  else if (dex === 151) reasons.push("Mew no cuenta para la Pokédex de Rojo Fuego / Verde Hoja.");
  else if (dex > KANTO_SIZE) reasons.push(`El número ${pad(dex)} no es de la Pokédex de Kanto (001–150).`);
  else if (!nameOk) reasons.push(`El nombre no coincide con el número ${pad(dex)} (${DEX[dex - 1].name}). Si tiene mote, no se puede validar.`);
  if (reasons.length) {
    sheet(`<button class="close" data-close aria-label="Cerrar">×</button><h2 class="pixel" style="font-size:12px;line-height:1.6">No se ha encontrado ningún Pokémon</h2>
      <ul>${reasons.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
      <p class="muted" style="font-size:13px">Ajusta mejor el recuadro a la pantalla o repite la foto con más luz y sin reflejos.</p>
      <details><summary class="muted" style="font-size:13px">Texto leído</summary><div class="ocr">${esc((text.trim() + "\n" + numText.trim()).trim() || "(nada)")}</div></details>
      <div class="row" style="margin-top:12px"><button class="btn" data-close style="flex:1">Ajustar</button><button class="btn ghost" id="retake">Repetir foto</button></div>`);
    return;
  }
  const before = derived().byId[dex] || []; const isNew = !before.some(c => c.isShiny === isShiny);
  const photo = (() => { const c = document.createElement("canvas"); c.width = 480; c.height = 320; const g = c.getContext("2d"); g.imageSmoothingEnabled = false; g.drawImage(n, 0, 0, 480, 320); return c.toDataURL("image/jpeg", .85); })();
  const capId = await store.addCapture({ pokemonId: dex, isShiny, capturedAt: Date.now(), photo, status: "VALIDATED" });
  state.pending = null;
  sheet(`<div class="anim"><img class="sprite pop" width="120" height="120" src="${spriteUrl(dex, isShiny)}" alt=""><svg class="ball" style="width:56px;height:56px" viewBox="0 0 24 24" aria-hidden="true">${ICON.ball.replace(/<\/?svg[^>]*>/g, "")}</svg>
    <h2 class="pixel pop" style="font-size:12px;text-align:center;line-height:1.7">${isNew ? "¡" + esc(DEX[dex - 1].name.toUpperCase()) + " registrado!" : esc(DEX[dex - 1].name.toUpperCase()) + " ya estaba registrado"}</h2>
    <div class="muted">No.${pad(dex)}${isShiny ? " · ★ Variocolor" : ""}</div></div>
    <label for="msg"><b>Publicar en Posts</b> <span class="muted">(opcional)</span></label>
    <textarea id="msg" maxlength="280" placeholder="Escribe algo sobre tu captura"></textarea>
    <div class="row" style="margin-top:10px"><button class="btn" id="pub" style="flex:1">Publicar</button><button class="btn ghost" data-close>Ahora no</button></div>`);
  if (navigator.vibrate) try { navigator.vibrate([40, 60, 40]); } catch (_) {}
  $("#pub").onclick = async () => { await store.saveProfile({ posts: { ...(store.profile.posts || {}), [capId]: $("#msg").value.trim() } }); closeSheet(); toast("Publicado en Posts"); state.tab = "posts"; render(); };
  render();
}

// ---------- Posts ----------
function viewPosts(D) {
  const caps = [...D.caps].sort((a, b) => a.capturedAt - b.capturedAt);
  if (!caps.length) return `<div class="card" style="text-align:center"><div style="font-size:40px" aria-hidden="true">💬</div><b>Todavía no hay posts</b><p class="muted">Cada captura validada se publica aquí.</p><button class="btn" data-go="camara">Capturar</button></div>`;
  let last = ""; const today = epochDay(Date.now());
  setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 0);
  return `<div class="row" style="justify-content:space-between;margin-bottom:10px"><b>Tus capturas</b><button class="btn" data-go="camara">${ICON.cam.replace("<svg", '<svg width="18" height="18"')} Capturar</button></div>
  <div class="feed">${caps.map(c => {
    const d = epochDay(c.capturedAt); let head = "";
    if (d !== last) { last = d; head = `<div class="day">${d === today ? "Hoy" : d === today - 1 ? "Ayer" : fmtDate(c.capturedAt)}</div>`; }
    const msg = (store.profile.posts || {})[c.id]; const nm = DEX[c.pokemonId - 1].name;
    return head + `<article class="post"><div class="row" style="justify-content:space-between"><span class="row" style="gap:6px"><img class="sprite" width="40" height="40" src="${spriteUrl(c.pokemonId, c.isShiny)}" alt=""><b>${esc(nm)} ${c.isShiny ? "★" : ""}</b></span><span class="muted" style="font-size:12px">No.${pad(c.pokemonId)} · ${new Date(c.capturedAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</span></div>
      ${msg ? `<div style="margin-top:4px">${esc(msg)}</div>` : ""}${c.photo ? `<img class="sprite" src="${c.photo}" alt="Foto de la captura de ${esc(nm)}">` : ""}</article>`;
  }).join("")}</div>`;
}

// ---------- Perfil ----------
function viewPerfil(D) {
  const titles = [...ACH.filter(a => D.ach.unlocked[a.id]).map(a => a.reward || a.title), ...BP_TITLES.slice(0, D.pass.level)];
  const dexN = Object.keys(D.byId).filter(id => id <= KANTO_SIZE).length;
  const shN = Object.entries(D.byId).filter(([id, l]) => id <= KANTO_SIZE && l.some(c => c.isShiny)).length;
  const name = store.profile.name || "Entrenador";
  return `<div class="card"><div class="row" style="gap:14px"><div class="avatar pixel">${esc(name.trim()[0] || "?").toUpperCase()}</div>
    <div><h2 style="margin:0">${esc(name)}</h2><div class="muted">${store.profile.title ? esc(store.profile.title) : "Sin título equipado"}</div></div></div>
    <label style="display:block;margin-top:14px"><b>Título equipado</b><br><select id="titleSel" style="width:100%;margin-top:6px">
      <option value="">Ninguno</option>${titles.map(t => `<option ${store.profile.title === t ? "selected" : ""}>${esc(t)}</option>`).join("")}</select></label>
    ${titles.length ? "" : '<div class="muted" style="font-size:13px;margin-top:6px">Consigue logros o sube de nivel en el pase para desbloquear títulos.</div>'}
  </div>
  <h2 class="pixel section-title">Estadísticas</h2>
  <div class="stats">
    <div class="stat"><b>${D.caps.length}</b>capturas</div><div class="stat"><b>${dexN}/${KANTO_SIZE}</b>especies</div>
    <div class="stat"><b>${shN}</b>variocolor</div><div class="stat"><b>${D.ach.legCount}/4</b>legendarios</div>
    <div class="stat"><b>${Object.keys(D.ach.unlocked).length}/${ACH.length}</b>logros</div><div class="stat"><b>${D.pass.level}</b>nivel del pase</div>
  </div>
  <h2 class="pixel section-title">Regiones</h2>
  <div class="card row" style="justify-content:space-between"><b>Kanto (Rojo Fuego / Verde Hoja)</b><span>${dexN >= KANTO_SIZE ? "✓ Completada" : dexN + "/" + KANTO_SIZE}</span></div>
  <h2 class="pixel section-title">Tus datos</h2>
  <div class="card"><p class="muted" style="margin:0 0 10px;font-size:14px">Se guardan solo en este navegador. Para pasarlos a otro dispositivo (por ejemplo del ordenador al iPhone), exporta aquí e importa allí.</p>
    <div class="row"><button class="btn ghost" id="exportBtn">Exportar copia</button><label class="btn ghost" style="cursor:pointer">Importar copia<input type="file" id="importFile" accept="application/json,.json" class="sr"></label></div></div>
  <p class="muted" style="font-size:13px;margin-top:16px">Datos de la PokéAPI. Versión web de PokeDexTracker (Daniel Navarro y Jorge Gil). Proyecto no oficial, sin relación con Nintendo ni The Pokémon Company.</p>`;
}
function exportData() {
  const blob = new Blob([JSON.stringify({ app: "pdt", v: 1, exportedAt: Date.now(), profile: store.profile, captures: store.caps })], { type: "application/json" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "pokedex-copia-" + new Date().toISOString().slice(0, 10) + ".json"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
async function importData(file) {
  try {
    const j = JSON.parse(await file.text()); if (j.app !== "pdt" || !Array.isArray(j.captures)) throw 0;
    const caps = j.captures.filter(c => c && Number.isInteger(c.pokemonId) && c.pokemonId >= 1 && c.pokemonId <= 151 && typeof c.capturedAt === "number").map(c => ({ id: String(c.id || ("c" + c.capturedAt)), pokemonId: c.pokemonId, isShiny: !!c.isShiny, capturedAt: c.capturedAt, photo: typeof c.photo === "string" && c.photo.startsWith("data:image/") ? c.photo : null, status: "VALIDATED" }));
    sheet(`<h2 class="pixel" style="font-size:12px">Importar copia</h2><p>La copia tiene <b>${caps.length}</b> capturas. Se sustituirán las <b>${store.caps.length}</b> que hay ahora en este navegador.</p>
      <div class="row"><button class="btn" id="doImport" style="flex:1">Sustituir</button><button class="btn ghost" data-close>Cancelar</button></div>`);
    $("#doImport").onclick = async () => { const pr = j.profile || {}; await store.replaceAll(caps, { name: String(pr.name || store.profile.name).slice(0, 20), title: pr.title || null, seen: Array.isArray(pr.seen) ? pr.seen.map(String) : [], seenLevel: +pr.seenLevel || 0, posts: pr.posts && typeof pr.posts === "object" ? pr.posts : {}, uid: typeof pr.uid === "string" ? pr.uid : store.profile.uid }); store.uid = store.profile.uid; closeSheet(); toast("Copia importada"); render(); };
  } catch (_) { toast("Ese archivo no es una copia válida."); }
}

// ---------- Hojas y eventos ----------
function sheet(html, modal) { $("#layer").innerHTML = `<div class="sheet" ${modal ? 'data-modal="1"' : ""} role="dialog" aria-modal="true"><div class="panel pop">${html}</div></div>`; }
function closeSheet() { $("#layer").innerHTML = ""; }
document.addEventListener("click", e => {
  const t = e.target.closest("[data-tab],[data-mon],[data-f],[data-close],[data-go],#clearF,#sizeBtn,#validate,#retake,[data-zoom],#camOn,#camOff,#shoot,#exportBtn");
  if (!t) { if (e.target.classList.contains("sheet") && !e.target.dataset.modal) closeSheet(); return; }
  if (t.dataset.tab) { state.tab = t.dataset.tab; closeSheet(); render(); scrollTo(0, 0); }
  else if (t.dataset.mon) { if (!t.classList.contains("dim")) openMon(+t.dataset.mon); }
  else if (t.dataset.f) { const k = t.dataset.f, v = t.dataset.v; state.f[k] = v === "toggle" ? !state.f[k] : (state.f[k] === v && k === "variant" ? "all" : v); render(); }
  else if (t.hasAttribute("data-close")) closeSheet();
  else if (t.dataset.go) { state.tab = t.dataset.go; render(); scrollTo(0, 0); }
  else if (t.id === "clearF") { state.f = { ...state.f, q: "", status: "all", variant: "all", type: "", leg: false }; render(); }
  else if (t.id === "sizeBtn") { state.f.big = !state.f.big; render(); }
  else if (t.id === "validate") validate();
  else if (t.id === "retake") { closeSheet(); state.pending = null; render(); }
  else if (t.id === "camOn") { state.camMode = "live"; state.camError = ""; render(); }
  else if (t.id === "camOff") { stopCamera(); state.camMode = ""; render(); }
  else if (t.id === "shoot") shoot();
  else if (t.id === "exportBtn") exportData();
  else if (t.dataset.zoom) sheet(`<button class="close" data-close aria-label="Cerrar">×</button><img class="photo sprite" src="${t.src}" alt="Foto de la captura ampliada" style="margin-top:44px">`);
});
document.addEventListener("submit", async e => { if (e.target.id === "welcome") { e.preventDefault(); const v = $("#tname").value.trim(); if (v) { await store.saveProfile({ name: v.slice(0, 20) }); render(); } } });
document.addEventListener("input", e => { if (e.target.id === "q") { state.f.q = e.target.value; const pos = e.target.selectionStart; render(); const q = $("#q"); q.focus(); q.setSelectionRange(pos, pos); clearTimeout(window._sq); window._sq = setTimeout(scrollToFirstMatch, 250); } });
document.addEventListener("change", async e => {
  if (e.target.id === "typeSel") { state.f.type = e.target.value; render(); }
  else if (e.target.id === "file") pickFile(e.target.files[0]);
  else if (e.target.id === "importFile") importData(e.target.files[0]);
  else if (e.target.id === "titleSel") { await store.saveProfile({ title: e.target.value || null }); render(); toast("Título actualizado"); }
});
document.addEventListener("dragover", e => { const d = $("#drop"); if (d) { e.preventDefault(); d.classList.add("over"); } });
document.addEventListener("dragleave", () => $("#drop")?.classList.remove("over"));
document.addEventListener("drop", e => { const d = $("#drop"); if (d) { e.preventDefault(); d.classList.remove("over"); pickFile(e.dataTransfer.files[0]); } });
document.addEventListener("keydown", e => { if (e.key === "Escape" && !$(".sheet[data-modal]")) closeSheet(); });
window.addEventListener("resize", () => { if (state.pending) drawAdjust(); });
document.addEventListener("visibilitychange", () => { if (document.hidden) stopCamera(); else if (state.tab === "camara" && state.camMode === "live") startCamera(); });

render();
store.init().then(render);
