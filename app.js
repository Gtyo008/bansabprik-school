/* หน้าไหนไม่มีองค์ประกอบนั้น ให้ใช้ตัวว่าง (ไม่ error) เพราะเว็บแยกเป็นหลายหน้า */
const NIL = new Proxy(function () {}, {
  get: (t, k) => (typeof k === "symbol" ? (k === Symbol.toPrimitive ? () => "" : undefined) : k === "length" ? 0 : NIL),
  set: () => true, apply: () => NIL
});
const $ = (s) => document.querySelector(s) || NIL;
const PAGE = document.body.dataset.page || "home";
const PARAMS = new URLSearchParams(location.search);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const safeUrl = (u) => (/^https?:\/\//i.test(u || "") ? u : "");

/* ---------- สี ---------- */
function hexOk(h) { return /^#[0-9a-fA-F]{6}$/.test(h || ""); }
function rgb(h) { return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); }
function toHex(a) { return "#" + a.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join(""); }
function mix(a, b, t) { const x = rgb(a), y = rgb(b); return toHex(x.map((v, i) => v * t + y[i] * (1 - t))); }
function lum(h) { const c = rgb(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
function themeVars(s) {
  const D = { green: "#556b2f", bg: "#eef2da" };
  const c = (k) => (hexOk(s["c_" + k]) ? s["c_" + k] : null);
  const g = c("green"), y = c("yellow"), k = c("sky"), bg = c("bg"), su = c("surface"), ink = c("ink"), o = {};
  if (g) { o["--green"] = g; o["--green-soft"] = mix(g, bg || D.bg, 0.12); o["--green-mid"] = mix(g, bg || D.bg, 0.35); o["--on-green"] = lum(g) > 0.45 ? "#1b2410" : "#ffffff"; }
  if (g || bg) o["--line"] = mix(g || D.green, bg || D.bg, 0.2);
  if (y) { o["--yellow"] = y; o["--yellow-soft"] = mix(y, "#ffffff", 0.3); o["--on-yellow"] = lum(y) > 0.3 ? "#3a3000" : "#ffffff"; }
  if (k) { o["--sky"] = k; o["--sky-soft"] = mix(k, "#ffffff", 0.18); }
  if (bg) o["--bg"] = bg;
  if (su) o["--surface"] = su;
  if (ink) { o["--ink"] = ink; o["--muted"] = mix(ink, bg || D.bg, 0.68); }
  return o;
}
function styleEl(id) {
  let el = document.getElementById(id);
  if (!el) { el = document.createElement("style"); el.id = id; document.head.appendChild(el); }
  return el;
}
function applyTheme(s) {
  const v = themeVars(s), keys = Object.keys(v);
  styleEl("themeStyle").textContent = keys.length ? ":root{" + keys.map((k) => k + ":" + v[k]).join(";") + "}" : "";
  styleEl("customCss").textContent = s.custom_css || "";
}

/* ---------- ข้อมูลตัวอย่าง (ใช้เมื่อยังไม่เชื่อมหลังบ้าน) ---------- */
const DEF = {
  school_name: "โรงเรียนบ้านซับพริก", school_sub: "Ban Sap Phrik School · อำเภอมวกเหล็ก จังหวัดสระบุรี",
  ticker: "ประกาศปฏิทินการศึกษาภาคเรียนที่ 2 ปีการศึกษา 2569 ดูได้ที่ศูนย์เอกสาร",
  address: "โรงเรียนบ้านซับพริก อ.มวกเหล็ก จ.สระบุรี", phone: "0X-XXXX-XXXX", email: "example@school.ac.th", hours: "จันทร์ ถึง ศุกร์ 08.00 ถึง 16.30 น.",
  dir_name: "ชื่อ-สกุล", dir_role: "ผู้อำนวยการโรงเรียน", dep_name: "ชื่อ-สกุล", dep_role: "รองผู้อำนวยการโรงเรียน",
  slide1_tag: "ประกาศ", slide1_title: "ยินดีต้อนรับสู่เว็บไซต์โรงเรียนบ้านซับพริก", slide1_text: "ข่าวสาร เอกสาร และบริการของโรงเรียน รวมไว้ที่เดียว",
  slide2_tag: "ศูนย์เอกสาร", slide2_title: "เปิดอ่านเอกสารออนไลน์ได้ทันที", slide2_text: "ตารางเรียน ประกาศ และแบบฟอร์ม ค้นหาและดูได้โดยไม่ต้องดาวน์โหลด",
  slide3_tag: "กิจกรรม", slide3_title: "ติดตามกิจกรรมของนักเรียนและคณะครู", slide3_text: "ภาพและข่าวกิจกรรมล่าสุดจากโรงเรียน"
};
const DOCS = [
  { id: 1, title: "ปฏิทินการศึกษา ภาคเรียนที่ 2/2569", cat: "ตารางเรียน", year: 2569, type: "PDF",
    sample: { h: "ปฏิทินการศึกษา ภาคเรียนที่ 2 ปีการศึกษา 2569", rows: [["เปิดภาคเรียน", "ตามประกาศโรงเรียน"], ["สอบกลางภาค", "ตามประกาศโรงเรียน"], ["สอบปลายภาค", "ตามประกาศโรงเรียน"], ["ปิดภาคเรียน", "ตามประกาศโรงเรียน"]] } },
  { id: 2, title: "ตารางเรียนประจำภาคเรียน ป.1 ถึง ป.6", cat: "ตารางเรียน", year: 2569, type: "PDF",
    sample: { h: "ตารางเรียน ชั้นประถมศึกษา", rows: [["คาบ 1", "ภาษาไทย"], ["คาบ 2", "คณิตศาสตร์"], ["คาบ 3", "วิทยาศาสตร์"], ["คาบ 4", "ภาษาอังกฤษ"]] } },
  { id: 3, title: "ประกาศโรงเรียน เรื่อง การมาเรียนและการลา", cat: "ประกาศ", year: 2569, type: "PDF",
    sample: { h: "ประกาศโรงเรียนบ้านซับพริก", p: ["เรื่อง แนวปฏิบัติการมาเรียนและการลาของนักเรียน", "ผู้ปกครองแจ้งการลาต่อครูประจำชั้นก่อนหรือภายในวันที่นักเรียนขาดเรียน และแนบใบรับรองแพทย์เมื่อลาป่วยเกินสามวัน"] } },
  { id: 4, title: "แบบขออนุญาตลา (ครู)", cat: "แบบฟอร์ม", year: 2569, type: "Word",
    sample: { h: "แบบขออนุญาตลา", p: ["เรียน ผู้อำนวยการโรงเรียนบ้านซับพริก", "ข้าพเจ้า ............................ ตำแหน่ง ............................ ขออนุญาตลา ............................ ตั้งแต่วันที่ ............ ถึงวันที่ ............"] } },
  { id: 5, title: "รายงานผลการประเมินตนเอง (SAR) ปี 2568", cat: "รายงาน", year: 2568, type: "PDF",
    sample: { h: "รายงานผลการประเมินตนเองของสถานศึกษา", p: ["ปีการศึกษา 2568", "สรุปผลการดำเนินงานตามมาตรฐานการศึกษาของสถานศึกษา และแนวทางพัฒนาในปีถัดไป"] } }
];
let NEWS = [
  { date: "2026-11-19", cat: "ข่าวประชาสัมพันธ์", title: "ประกาศปฏิทินการศึกษาภาคเรียนที่ 2", text: "ผู้ปกครองและนักเรียนดูกำหนดการสำคัญของภาคเรียนได้ที่ศูนย์เอกสาร" },
  { date: "2026-11-12", cat: "ข่าวประชาสัมพันธ์", title: "แจ้งการประชุมผู้ปกครองห้องเรียน", text: "โรงเรียนเชิญผู้ปกครองร่วมรับฟังผลการเรียนและแนวทางพัฒนานักเรียน" },
  { date: "2026-11-14", cat: "กิจกรรมนักเรียน", title: "กิจกรรมวันลอยกระทงของโรงเรียน", text: "นักเรียนร่วมทำกระทงจากวัสดุธรรมชาติ และประกวดกระทงรายห้อง" },
  { date: "2026-11-07", cat: "สำหรับครู", title: "อบรมการใช้ระบบเช็คชื่อออนไลน์", text: "ครูทุกท่านเข้าร่วมอบรมการใช้งานระบบใหม่ ก่อนเริ่มใช้จริงสัปดาห์หน้า" }
];
let STAFF = [
  { name: "ชื่อ-สกุล", role: "รองผู้อำนวยการโรงเรียน", photo: "" }, { name: "ชื่อ-สกุล", role: "ครูชำนาญการ", photo: "" },
  { name: "ชื่อ-สกุล", role: "ครู", photo: "" }, { name: "ชื่อ-สกุล", role: "ครู", photo: "" }
];
let SETTINGS = {};
let live = false;
const get = (k) => (Object.prototype.hasOwnProperty.call(SETTINGS, k) ? String(SETTINGS[k]) : (DEF[k] || ""));

const ICONS = {
  doc: "M6 3h8l4 4v14H6z M14 3v4h4 M9 12h6 M9 16h6",
  cal: "M4 6h16v14H4z M4 10h16 M8 3v4 M16 3v4",
  users: "M9 11a3 3 0 100-6 3 3 0 000 6z M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6 M17 11a2.5 2.5 0 100-5 M18 14c2 .5 3.5 2.4 3.5 5",
  check: "M4 4h16v16H4z M8 12l3 3 5-6",
  book: "M4 5c3-1 6-1 8 1 2-2 5-2 8-1v14c-3-1-6-1-8 1-2-2-5-2-8-1z M12 6v14",
  mail: "M3 6h18v12H3z M3 7l9 7 9-7",
  chart: "M4 20V4 M4 20h16 M8 16v-5 M12 16V8 M16 16v-3",
  folder: "M3 6h6l2 2h10v11H3z",
  link: "M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1 M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"
};
const QUICK = [
  { t: "ศูนย์เอกสาร", s: "ค้นหาและเปิดดูออนไลน์", i: "doc", href: "docs.html" },
  { t: "ปฏิทินการศึกษา", s: "กำหนดการภาคเรียน", i: "cal", href: "docs.html?cat=" + encodeURIComponent("ตารางเรียน") },
  { t: "แบบฟอร์มต่าง ๆ", s: "ครูและนักเรียน", i: "folder", href: "docs.html?cat=" + encodeURIComponent("แบบฟอร์ม") },
  { t: "ทำเนียบบุคลากร", s: "ผู้บริหารและคณะครู", i: "users", href: "staff.html" },
  { t: "เช็คชื่อออนไลน์", s: "ระบบสำหรับครู", i: "check", soon: true },
  { t: "ผลการเรียน", s: "ผู้ปกครองตรวจสอบได้", i: "chart", soon: true },
  { t: "ส่งงานออนไลน์", s: "นักเรียนและครู", i: "book", soon: true },
  { t: "ติดต่อโรงเรียน", s: "โทร อีเมล ส่งข้อความ", i: "mail", href: "contact.html" }
];
const icon = (k) => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[k]}"/></svg>`;

/* ---------- วันที่ ---------- */
const TH_MON = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
function parseDate(s) {
  s = String(s || "").trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/), y, mo, d;
  if (m) { y = +m[1]; mo = +m[2]; d = +m[3]; }
  else if ((m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/))) { d = +m[1]; mo = +m[2]; y = +m[3]; }
  else return null;
  if (y > 2400) y -= 543;
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return { y, mo, d, key: y * 10000 + mo * 100 + d };
}

/* ---------- สไลด์ ---------- */
let si = 0, timer = null, slides = [];
function drawDots() {
  $("#dots").innerHTML = slides.map((_, i) => `<button class="dot" type="button" data-i="${i}" aria-label="สไลด์ที่ ${i + 1}" aria-current="${i === si}"></button>`).join("");
  $("#slides").style.transform = `translateX(-${si * 100}%)`;
}
function go(i) { if (!slides.length) return; si = (i + slides.length) % slides.length; drawDots(); }
function setSlides(list) {
  const box = $("#slides");
  box.innerHTML = list.map((s, i) => `<div class="slide ${"abc"[i % 3]}${s.img ? " img" : ""}" data-img="${esc(s.img)}">${s.tag ? `<span class="tag">${esc(s.tag)}</span>` : ""}<h2>${esc(s.title)}</h2>${s.text ? `<p>${esc(s.text)}</p>` : ""}</div>`).join("");
  slides = Array.from(box.children);
  slides.forEach((el) => {
    const u = el.dataset.img;
    if (u) el.style.backgroundImage = `linear-gradient(90deg,rgba(18,26,8,.7),rgba(18,26,8,.12)),url(${JSON.stringify(u)})`;
  });
  si = 0;
  $("#slider").hidden = !slides.length;
  $(".slider .ctl").style.display = slides.length > 1 ? "flex" : "none";
  drawDots();
}
$("#prev").addEventListener("click", () => go(si - 1));
$("#next").addEventListener("click", () => go(si + 1));
$("#dots").addEventListener("click", (e) => { const b = e.target.closest("[data-i]"); if (b) go(Number(b.dataset.i)); });
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const start = () => { clearInterval(timer); timer = setInterval(() => go(si + 1), 6000); };
  const stop = () => { clearInterval(timer); };
  $("#slider").addEventListener("mouseenter", stop); $("#slider").addEventListener("mouseleave", start);
  $("#slider").addEventListener("focusin", stop); $("#slider").addEventListener("focusout", start);
  start();
}

/* ---------- ส่วนหัว ตัวอักษร ---------- */
try { $("#today").textContent = new Date().toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric" }); } catch (e) {}
let fs = 0;
document.querySelectorAll("[data-fs]").forEach((b) => b.addEventListener("click", () => {
  const v = Number(b.dataset.fs);
  fs = v === 0 ? 0 : Math.max(-1, Math.min(2, fs + v));
  document.documentElement.style.setProperty("--fs", String(1 + fs * 0.1));
}));

/* ---------- ปุ่มลิงก์ (เมนูบน / ปุ่มด่วน) ---------- */
const ICON_MAP = { "เอกสาร": "doc", "ปฏิทิน": "cal", "บุคลากร": "users", "เช็คชื่อ": "check", "หนังสือ": "book", "จดหมาย": "mail", "กราฟ": "chart", "โฟลเดอร์": "folder", "ลิงก์": "link" };
function safeLink(u) {
  u = String(u || "").trim();
  if (!u) return "";
  if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return /^(https?|mailto|tel):/i.test(u) ? u : "";
  if (/^(#|\/|\.)/.test(u)) return u;
  return "https://" + u;
}
const isExt = (u) => /^https?:/i.test(u);
let LINKS = [], ABOUT = [], QITEMS = [];
function drawNav() {
  const wrap = $("#navWrap");
  wrap.querySelectorAll("a[data-custom]").forEach((a) => a.remove());
  LINKS.filter((l) => l.place !== "ปุ่มด่วน").forEach((l) => {
    const href = safeLink(l.url);
    if (!href || !String(l.label || "").trim()) return;
    const a = document.createElement("a");
    a.dataset.custom = "1"; a.href = href; a.textContent = l.label.trim();
    if (isExt(href)) { a.target = "_blank"; a.rel = "noopener"; }
    wrap.appendChild(a);
  });
}
function drawQuick() {
  const hide = get("hide_soon") === "ซ่อน";
  const items = QUICK.map((q) => Object.assign({}, q));
  const extra = [];
  LINKS.filter((l) => l.place === "ปุ่มด่วน" || l.place === "ทั้งสองที่").forEach((l) => {
    const href = safeLink(l.url), label = String(l.label || "").trim();
    if (!href || !label) return;
    const slot = items.find((q) => q.soon && q.t === label);
    const plainIcon = !l.icon || l.icon === "ลิงก์";
    const it = { t: label, s: l.desc || (slot ? slot.s : ""), i: slot && plainIcon ? slot.i : (ICON_MAP[l.icon] || "link"), href: href, ext: isExt(href) };
    if (slot) Object.assign(slot, it, { soon: false }); else extra.push(it);
  });
  QITEMS = items.filter((q) => !(q.soon && hide)).concat(extra);
  $("#quick").innerHTML = QITEMS.map((q, n) => q.soon
    ? `<div class="q soon"><span class="ico">${icon(q.i)}</span><span><b>${esc(q.t)}</b><small>${esc(q.s)}</small></span><span class="badge">เร็ว ๆ นี้</span></div>`
    : `<a class="q" href="${esc(q.href)}" data-n="${n}"${q.ext ? ' target="_blank" rel="noopener"' : ""}><span class="ico">${icon(q.i)}</span><span><b>${esc(q.t)}</b><small>${esc(q.s)}</small></span></a>`).join("");
}

/* ---------- เกี่ยวกับโรงเรียน ---------- */
const ABOUT_DEF = [
  { title: "ข้อมูลทั่วไป", text: "โรงเรียนบ้านซับพริก ตั้งอยู่ที่อำเภอมวกเหล็ก จังหวัดสระบุรี เปิดสอนระดับประถมศึกษา ใส่ประวัติโรงเรียนสั้น ๆ ตรงนี้" },
  { title: "วิสัยทัศน์", text: "ใส่วิสัยทัศน์ของโรงเรียนตรงนี้ เช่น นักเรียนเรียนรู้อย่างมีความสุข มีทักษะชีวิตและทักษะดิจิทัล" },
  { title: "พันธกิจ", text: "- พัฒนาคุณภาพผู้เรียน\n- พัฒนาครูและบุคลากร\n- บริหารจัดการด้วยเทคโนโลยี" }
];
function richText(t) {
  let out = "", list = false;
  String(t || "").split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*[-•*]\s+(.*)$/);
    if (m) { if (!list) { out += "<ul>"; list = true; } out += `<li>${esc(m[1])}</li>`; }
    else { if (list) { out += "</ul>"; list = false; } if (line.trim()) out += `<p>${esc(line.trim())}</p>`; }
  });
  return out + (list ? "</ul>" : "");
}
function drawAbout() {
  const t = get("about_title") || "เกี่ยวกับโรงเรียน", off = get("about_show") === "ซ่อนทั้งส่วน";
  $("#about").hidden = off;
  if (off && PAGE === "about") location.replace("index.html");
  const nav = document.querySelector('.nav a[href="about.html"]');
  if (nav) { nav.textContent = t; nav.hidden = off; }
  $("#aboutTitle").textContent = t;
  $("#aboutGrid").innerHTML = (ABOUT.length ? ABOUT : ABOUT_DEF).map((b) => `<div class="card"><h3>${esc(b.title)}</h3>${richText(b.text)}</div>`).join("");
}

/* ---------- ข่าว ---------- */
let tab = "ทั้งหมด";
function drawNews() {
  const cats = ["ทั้งหมด"].concat(Array.from(new Set(NEWS.map((n) => n.cat).filter(Boolean))));
  if (!cats.includes(tab)) tab = "ทั้งหมด";
  $("#tabs").innerHTML = cats.length > 2 ? cats.map((k) => `<button class="tab" type="button" role="tab" aria-selected="${k === tab}" data-k="${esc(k)}">${esc(k)}</button>`).join("") : "";
  const list = NEWS.filter((n) => tab === "ทั้งหมด" || n.cat === tab).slice().sort((a, b) => {
    const x = parseDate(a.date), y = parseDate(b.date);
    return (y ? y.key : 0) - (x ? x.key : 0);
  });
  $("#newslist").innerHTML = list.length ? list.map((n) => {
    const p = parseDate(n.date);
    const box = p ? `<b>${p.d}</b><span>${TH_MON[p.mo - 1]}</span>` : `<b>•</b><span>${esc(String(n.date || "").slice(0, 8))}</span>`;
    return `<li><div class="date">${box}</div><div><h3>${esc(n.title)}</h3>${n.text ? `<p>${esc(n.text)}</p>` : ""}</div></li>`;
  }).join("") : `<li class="empty-note">ยังไม่มีข่าว</li>`;
}
$("#tabs").addEventListener("click", (e) => { const b = e.target.closest("[data-k]"); if (b) { tab = b.dataset.k; drawNews(); } });

/* ---------- บุคลากร ---------- */
const personIcon = `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" style="width:34px;height:34px"><path d="${ICONS.users}"/></svg>`;
const avatar = (photo) => (safeUrl(photo) ? `<img src="${esc(safeUrl(photo))}" alt="" referrerpolicy="no-referrer">` : personIcon);
function drawPeople() {
  const name = get("dir_name"), role = get("dir_role"), photo = get("dir_photo");
  $("#dirCard").innerHTML = `<h3>ผู้บริหารโรงเรียน</h3><div class="avatar">${avatar(photo)}</div><b>${esc(name)}</b><br><span style="color:var(--muted)">${esc(role)}</span>`;
  const dn = get("dep_name"), dr = get("dep_role"), dp = get("dep_photo");
  $("#staffTop").innerHTML = `<div class="person"><div class="avatar">${avatar(photo)}</div><b>${esc(name)}</b><span>${esc(role)}</span></div>`
    + (dn ? `<div class="person"><div class="avatar">${avatar(dp)}</div><b>${esc(dn)}</b><span>${esc(dr)}</span></div>` : "");
  $("#staffGrid").innerHTML = STAFF.length
    ? STAFF.map((p) => `<div class="person"><div class="avatar">${avatar(p.photo)}</div><b>${esc(p.name)}</b><span>${esc(p.role)}</span></div>`).join("")
    : "";
}

/* ---------- ใส่ค่าจากหลังบ้าน ---------- */
function applySettings() {
  const name = get("school_name") || DEF.school_name;
  const pt = document.body.dataset.title; document.title = pt ? pt + " | " + name : name;
  $("#schoolName").textContent = name;
  $("#schoolSub").textContent = get("school_sub");
  $("#schoolSub").hidden = !get("school_sub");
  $("#fName").textContent = name;
  $("#fAddr").textContent = get("address");
  $("#fCopy").textContent = `© ${new Date().getFullYear() + 543} ${name} สงวนลิขสิทธิ์`;
  $("#tickerText").textContent = get("ticker");
  $("#ticker").hidden = !get("ticker");
  $("#cAddr").textContent = get("address");
  $("#cPhone").textContent = get("phone"); $("#fPhone").textContent = get("phone");
  $("#cEmail").textContent = get("email"); $("#fEmail").textContent = get("email");
  $("#cHours").textContent = get("hours");
  const crest = $("#crest"), logo = safeUrl(get("logo"));
  if (logo) { crest.innerHTML = `<img src="${esc(logo)}" alt="โลโก้ ${esc(name)}" referrerpolicy="no-referrer">`; crest.classList.add("has-logo"); }
  else { crest.textContent = "ซ"; crest.classList.remove("has-logo"); }
  const list = [];
  [1, 2, 3].forEach((n) => {
    const s = { tag: get("slide" + n + "_tag"), title: get("slide" + n + "_title"), text: get("slide" + n + "_text"), img: safeUrl(get("slide" + n + "_img")) };
    if (s.title || s.img) list.push(s);
  });
  setSlides(list);
  drawPeople();
  drawNav(); drawQuick(); drawAbout();
  applyTheme(SETTINGS);
}

/* ---------- เอกสาร ---------- */
const BASE_CATS = ["ตารางเรียน", "ประกาศ", "แบบฟอร์ม", "รายงาน"];
let cat = PARAMS.get("cat") || "ทั้งหมด", query = PARAMS.get("q") || "", current = DOCS[0].id;
const visible = () => DOCS.filter((d) => (cat === "ทั้งหมด" || d.cat === cat) && d.title.includes(query.trim()));
function drawChips() {
  const cats = ["ทั้งหมด"].concat(BASE_CATS, Array.from(new Set(DOCS.map((d) => d.cat).filter((c) => c && !BASE_CATS.includes(c)))));
  $("#chips").innerHTML = cats.map((c) => `<button class="chip" type="button" aria-pressed="${c === cat}" data-c="${esc(c)}">${esc(c)}</button>`).join("");
}
function drawList() {
  const items = visible();
  if (!items.some((d) => d.id === current) && items.length) current = items[0].id;
  $("#list").innerHTML = items.length
    ? items.map((d) => `<li><button type="button" data-id="${d.id}" aria-current="${d.id === current}"><span class="t">${esc(d.title)}</span><span class="m">${esc(d.cat)} · ${esc(d.type)} · ปี ${esc(d.year)}</span></button></li>`).join("")
    : `<li class="empty">${DOCS.length ? "ไม่พบเอกสารที่ค้นหา ลองเปลี่ยนคำค้นหรือเลือกหมวดอื่น" : "ยังไม่มีเอกสารในระบบ"}</li>`;
  drawPreview();
}
function drawPreview() {
  const d = DOCS.find((x) => x.id === current), box = $("#preview");
  if (!d || !visible().length) { box.innerHTML = ""; return; }
  const id = d.driveId ? encodeURIComponent(d.driveId) : "";
  let page;
  if (id) {
    page = `<iframe class="paper" style="padding:0;border:0;min-height:380px" src="https://drive.google.com/file/d/${id}/preview" title="${esc(d.title)}"></iframe>`;
  } else {
    const s = d.sample || { h: d.title, p: ["เอกสารนี้ยังไม่มีไฟล์แนบ"] };
    const body = s.rows
      ? `<table><tr><th>รายการ</th><th>รายละเอียด</th></tr>${s.rows.map((r) => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join("")}</table>`
      : s.p.map((t) => `<p>${esc(t)}</p>`).join("");
    page = `<div class="paper"><h4>${esc(s.h)}</h4><p class="sub">${esc(get("school_name") || DEF.school_name)}</p>${body}</div>`;
  }
  box.innerHTML = `<div class="preview-bar"><b>${esc(d.title)}</b>${id ? `<a href="https://drive.google.com/file/d/${id}/view" target="_blank" rel="noopener">เปิดเต็มหน้าจอ</a>` : ""}</div>${page}${id || !d.sample ? "" : `<p class="hint">นี่คือหน้ากระดาษตัวอย่าง เมื่อใส่ไฟล์จริงจาก Google Drive ระบบจะแสดงเอกสารจริงตรงนี้</p>`}`;
}
function setFilter(c, q) { cat = c; query = q; $("#q").value = q; drawChips(); drawList(); }
$("#chips").addEventListener("click", (e) => { const b = e.target.closest("[data-c]"); if (b) { cat = b.dataset.c; drawChips(); drawList(); } });
$("#list").addEventListener("click", (e) => { const b = e.target.closest("[data-id]"); if (b) { current = Number(b.dataset.id); drawList(); } });
$("#q").addEventListener("input", (e) => { query = e.target.value; drawList(); });
$("#gsearch").addEventListener("submit", (e) => { e.preventDefault(); const v = $("#gq").value.trim(); location.href = "docs.html" + (v ? "?q=" + encodeURIComponent(v) : ""); });
$("#f").addEventListener("submit", (e) => { e.preventDefault(); $("#sent").hidden = false; });


/* ---------- โหลดข้อมูลจริง ---------- */
function setDocs(list) {
  DOCS.length = 0;
  list.forEach((r, i) => DOCS.push({ id: i + 1, title: r.title || "", cat: r.cat || "", year: r.year || "", type: r.type || "", driveId: r.fileId || "" }));
  current = DOCS.length ? DOCS[0].id : 0; cat = PARAMS.get("cat") || "ทั้งหมด"; query = PARAMS.get("q") || ""; $("#q").value = query;
  drawChips(); drawList();
}
function applySite(data) {
  live = true; document.body.classList.add("live");
  SETTINGS = data.settings || {};
  NEWS = data.news || []; STAFF = data.staff || [];
  LINKS = data.links || []; ABOUT = data.about || [];
  applySettings(); drawNews(); setDocs(data.docs || []);
}
const CACHE_KEY = "sp_site_v1";
async function loadLive() {
  if (API_URL) {
    try { const c = localStorage.getItem(CACHE_KEY); if (c) applySite(JSON.parse(c)); } catch (e) {}
    try {
      const res = await fetch(API_URL + (API_URL.indexOf("?") >= 0 ? "&" : "?") + "api=site");
      const data = await res.json();
      if (data && data.settings) { applySite(data); try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch (e) {} }
    } catch (e) { /* ใช้ข้อมูลที่มีอยู่ต่อ */ }
    return;
  }
  loadCsv();
}
/* ตัวสำรอง: อ่านรายการเอกสารจากชีตที่เผยแพร่เป็น CSV */
function parseCSV(t) {
  const rows = []; let row = [], cur = "", q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c === '"') { if (t[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(cur); cur = ""; }
    else if (c === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; }
    else if (c !== "\r") cur += c;
  }
  if (cur !== "" || row.length) { row.push(cur); rows.push(row); }
  return rows;
}
async function loadCsv() {
  if (!SHEET_CSV_URL) return;
  try {
    const res = await fetch(SHEET_CSV_URL);
    const rows = parseCSV(await res.text()).slice(1).filter((r) => r[0] && r[0].trim());
    if (!rows.length) return;
    setDocs(rows.map((r) => ({ title: r[0].trim(), cat: (r[1] || "").trim(), year: (r[2] || "").trim(), type: (r[3] || "").trim(), fileId: (r[4] || "").trim() })));
  } catch (e) { /* ใช้รายการตัวอย่างต่อไป */ }
}

/* เริ่มต้น */
applySettings(); drawNews(); drawChips(); drawList();
loadLive();
