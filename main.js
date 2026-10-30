import "./style.css";
import {
  createIcons,
  Fingerprint,
  ScanSearch,
  TrendingUp,
  Radio,
  Flag,
  FlagTriangleRight,
  FileText,
  LockKeyhole,
  ShieldCheck,
  PanelsTopLeft,
  FolderLock,
  BookOpen,
  RotateCcw,
  Zap,
  Hourglass,
  RadioTower,
  ChevronRight,
  Info,
  ArrowUpRight,
  EyeOff,
  ArrowRight,
  HardDrive,
  CloudOff,
  X,
} from "lucide";
const icons = {
  Fingerprint,
  ScanSearch,
  TrendingUp,
  Radio,
  Flag,
  FlagTriangleRight,
  FileText,
  LockKeyhole,
  ShieldCheck,
  PanelsTopLeft,
  FolderLock,
  BookOpen,
  RotateCcw,
  Zap,
  Hourglass,
  RadioTower,
  ChevronRight,
  Info,
  ArrowUpRight,
  EyeOff,
  ArrowRight,
  HardDrive,
  CloudOff,
  X,
};
import {
  ministers,
  briefings,
  actions,
  fresh,
  act,
  nextDay,
  reason,
  outcome,
  score,
  relation,
  caseData, DAYS, commandInfo, forecast, canImproveRelation, validSave, personalities, containmentCost,
} from "./game.js";
import { applyLanguage, currentLanguage, toggleLanguage } from "./languages.js";
import { connectFirebase, firebaseConfigFromEnv } from "./firebase.js";
let state = fresh();
let cloud = null;
let cloudUser = null;
let firebaseMessage = "";
let firebaseMode = "login";
let sidebarCollapsed = localStorage.getItem("golge-sef-sidebar") === "collapsed";
try {
  const config = firebaseConfigFromEnv();
  if (config) cloud = connectFirebase(config);
} catch {}
let initialSaveMessage = "";
try {
  const v = JSON.parse(localStorage.getItem("golge-sef-v4"));
  if (validSave(v)) state = v;
  else if (v) initialSaveMessage = "Kayıt uyumsuz; yeni operasyon başlatıldı";
  else if (localStorage.getItem("golge-sef-v3")) initialSaveMessage = "Yeni kurallar için yeni operasyon · önceki kayıt korunuyor";
} catch {}
let selected = "demir",
  fileIndex = 0,
  tab = "desk",
  modal = null,
  checked = [],
  saveStatus = initialSaveMessage || "Bu cihazda otomatik kayıt";
let dialogTrigger = null;
let reviewDecision = null;
function focusSelector(element) {
  if (!element?.attributes) return null;
  let selector = "";
  for (const attribute of element.attributes) {
    if (attribute.name.startsWith("data-")) {
      selector += `[${attribute.name}="${attribute.value}"]`;
    }
  }
  return selector || null;
}
const el = document.querySelector("#app"),
  icon = (n) => `<i data-lucide="${n}" aria-hidden="true"></i>`;
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const firebaseError = (error) => ({
  "auth/email-already-in-use": "Bu e-posta zaten kullanılıyor.",
  "auth/invalid-email": "Geçerli bir e-posta adresi gir.",
  "auth/weak-password": "Şifre en az 6 karakter olmalı.",
  "auth/invalid-credential": "E-posta veya şifre hatalı.",
  "auth/too-many-requests": "Çok fazla deneme yapıldı. Biraz sonra tekrar dene.",
}[error?.code] || `Firebase işlemi başarısız oldu${error?.code ? ` (${error.code})` : ""}. Bilgilerini ve Firebase ayarlarını kontrol et.`);
const person = () => state.people.find((p) => p.id === selected),
  minister = () => ministers.find((m) => m.id === selected);
function save() {
  try {
    localStorage.setItem("golge-sef-v4", JSON.stringify(state));
    saveStatus = "Bu cihazda otomatik kayıt";
  } catch {
    saveStatus = "Tarayıcı kaydı kullanılamıyor";
  }
  if (cloud && cloudUser) cloud.saveGame(state).then(() => { saveStatus = "Buluta kaydedildi"; }).catch(() => { saveStatus = "Yerel kayıt kullanılıyor"; });
}
function meter(label, value, kind = "") {
  return `<div class="meter-label"><span>${label}</span><strong>${value}<small>/100</small></strong></div><div class="meter ${kind}"><span style="width:${value}%"></span></div>`;
}
function stageName(file) {
  if (file.stage === "cleared") return "İHBAR DESTEKLENMİYOR";
  if (file.exposed) return "İFŞA EDİLDİ";
  if (file.public) return "KAMUYA AÇIK";
  if (file.stage === "verified") {
    if (file.pressured) return "BASKI KURULDU";
    return "DOĞRULANDI";
  }
  if (file.stage === "raw") return "İNCELEME BEKLİYOR";
  if (file.stage === "pending") return "EKİP SAHADA";
  return "İHBAR";
}
function dossier() {
  const p = person();
  const m = minister();
  const f = p.files[fileIndex];
  const event = caseData(state, selected, fileIndex);
  const trait = personalities[p.personality];
  const threat = p.anger >= 60 ? "İHANET EŞİĞİ: Kazansa da sana bağlı kalmayacak."
    : p.anger >= 45 ? "DİRENİŞ: Gece kontrolün 8 azalacak."
    : p.identified ? "KİMLİĞİNİ BİLİYOR: Yeni sızıntıları doğrudan sana bağlayabilir."
    : "KİMLİĞİN GİZLİ: Sızıntılar önce kaynak arayışı başlatır; şantaj kimliğini açık eder.";
  const detail = ["verified", "cleared"].includes(f.stage) ? event.explanation
    : f.stage === "pending" ? "Takip ekibi yarın rapor verecek."
    : f.stage === "raw" ? "İki bağlantılı belgeyi seç ve ihbar hakkında karar ver."
    : event.claim;
  return `<section class="dossier">
    <div class="section-label"><span>ŞAHIS DOSYASI / 0${ministers.indexOf(m) + 1}</span><span class="stamp">ÇOK GİZLİ</span></div>
    <div class="profile"><div class="portrait"><img src="${m.portrait}" alt="${m.name} portresi" width="96" height="120"><span>${m.initials}</span><b>GÖZETİM ALTINDA</b></div>
    <div><span class="eyebrow">${trait.name}</span><h2>${m.name}</h2><p>${m.role}</p></div></div>
    <p class="bio">${trait.description}</p>
    <div class="stats">${meter("Siyasi nüfuz", p.power)}${meter("Üzerindeki kontrolün", p.control, "gold")}${meter("Sana karşı öfkesi", p.anger, "danger")}</div>
    <div class="threat-note">${threat}</div>
    <button class="back ${state.backed === m.id ? "active" : ""}" data-back="${m.id}" ${state.ended ? "disabled" : ""}>${icon("flag")}${state.backed === m.id ? "Desteklediğin aday" : "Adayım olarak belirle"}<span>Ücretsiz</span></button>
    <div class="intel-head"><h3>Soruşturma dosyaları</h3><span>HER İHBAR SUÇ DEĞİLDİR</span></div>
    <div class="intel">${p.files.map((file, index) => `<button class="case-button ${index === fileIndex ? "case-active" : ""}" data-case="${index}" aria-pressed="${index === fileIndex}"><span class="case-id">0${index + 1}</span><span><strong>${caseData(state, selected, index).title}</strong><small>${stageName(file)}</small></span>${icon(file.stage === "sealed" ? "lock-keyhole" : "file-text")}</button>`).join("")}</div>
    <div class="case-detail"><span class="eyebrow">${event.type} / DOSYA 0${fileIndex + 1}</span><p>${detail}</p>
    ${f.stage === "raw" ? `<button class="review-btn" data-review ${reason(state, selected, "review", fileIndex) ? "disabled" : ""}>${icon("scan-search")} Belgeleri incele <span>1 AP</span></button>${f.retryDay > state.day ? '<small class="error-text">Kaynak bugün sustu. Yarın yeniden dene.</small>' : ""}` : ""}
    ${f.stage === "cleared" ? "<small>Belgeler iddiayı desteklemiyor. Bu dosyayla şantaj veya sızıntı yapılamaz.</small>" : ""}
    ${f.pressured && !f.public && !f.exposed ? "<small>Bu dosyayla ikinci şantaj yok. Yayımlarsan gizli koz olmaktan çıkar.</small>" : ""}</div>
  </section>`;
}
function relationsHTML() {
  return `<section class="relations"><div class="relation-heading"><span class="eyebrow">KABİNE / İLİŞKİ AĞI</span><p>60+ ilişki: seçim desteği, sızıntıda koruma ve ortak soruşturma. Bakan kartından özel emir ver.</p></div>${[
    [0, 1],
    [0, 2],
    [1, 2],
  ]
    .map(([a, b]) => {
      const x = ministers[a],
        y = ministers[b],
        v = relation(state, x.id, y.id);
      return `<div class="relation-pair ${v >= 60 ? "allied" : ""}"><span>${x.name.split(" ").at(-1)} <b>${v >= 60 ? "İTTİFAK" : "TEMAS"}</b> ${y.name.split(" ").at(-1)}</span><div class="relation-line"><i style="width:${v}%"></i></div><small>Yakınlık ${v}/100</small></div>`;
    })
    .join("")}</section>`;
}
function intelligenceHTML() {
  const active = state.people.filter((p) => p.trail > 0 || p.hunt > 0 || p.identified);
  const projected = forecast(state);
  const cards = active.map((p) => {
    const name = ministers.find((m) => m.id === p.id).name;
    if (p.trail > 0) {
      const cost = containmentCost(state, p);
      const age = state.day - p.trailOpenedDay;
      const untilIncrease = cost < 4 ? 2 - (age % 2) : 0;
      return `<article>${meter(name, p.trail, "danger")}<small>Somut dosya · Her gece +8; açık dosyalı müttefikle +14. 100'de yakalanırsın.</small>
        <small>Müdahale ${cost} AP.${cost < 4 ? ` ${untilIncrease} gün sonra ${cost + 1} AP olacak.` : " Bedel üst sınırda."}</small>
        <button class="review-btn" data-contain="${p.id}" ${reason(state, p.id, "contain") ? "disabled" : ""} title="${esc(reason(state, p.id, "contain"))}">Kaynakları çek <span>−30 DOSYA · +2 ŞÜPHE · ${cost} AP</span></button></article>`;
    }
    if (p.hunt > 0) return `<article><h3>${name}</h3><span class="eyebrow">${p.hunt === 1 ? "KAYNAK ARAYIŞI" : "BAĞLANTI ŞÜPHESİ"}</span>
      <small>${p.hunt === 1 ? "Sızıntının kaynağını arıyor. Kimliğin henüz bilinmiyor." : "İzler sana yaklaşıyor. Bir sonraki gece somut dosya açılabilir."}</small>
      <small>${p.personality === "suspicious" ? "Kuşkucu: iki aşama ilerler; bu gece kimliğini bulabilir." : "Her gece bir aşama ilerler. Yeni belge erişimi ve tekrar sızıntı süreci hızlandırır."}</small></article>`;
    return `<article><h3>${name}</h3><span class="eyebrow">DOSYA KAPALI</span><small>Kimliğini biliyor. Kaynakları çekmek önceki temasları unutturmaz; yeni sızıntı doğrudan dosya açabilir.</small></article>`;
  }).join("");
  return `<section class="counterintel"><div class="section-label">KARŞI İSTİHBARAT <span>KAYNAK ARAYIŞI → ŞÜPHE → SOMUT DOSYA</span></div>
    ${active.length ? `<div class="trail-grid">${cards}</div>` : '<p class="quiet-line">Kimliğin gizli. Sızıntı kaynak arayışı başlatır; şantaj doğrudan somut dosya açar.</p>'}
    <details class="forecast"><summary>GECE ÖNGÖRÜSÜ <span>Mevcut duruma göre ${projected.length} gelişme</span></summary><p>Yeni emirler öngörüyü değiştirir. Okumak ücretsizdir.</p><ul>${projected.map((text) => `<li>${esc(text)}</li>`).join("")}</ul></details>
  </section>`;
}
function desk() {
  return `<section class="briefing"><div class="briefing-icon">${icon("radio-tower")}</div><div><div class="eyebrow">ŞİFRELİ BRİFİNG · GÜN 0${state.day}</div><h3>${briefings[state.day - 1][0]}</h3><p>${briefings[state.day - 1][1]}</p>${state.night.length ? '<button class="text-btn" data-modal="night">Son gece raporunu aç →</button>' : ""}</div><span class="briefing-number">0${state.day}</span></section>${relationsHTML()}${intelligenceHTML()}<div class="workspace"><section class="candidates"><div class="section-label">GÖZETİMDEKİ İSİMLER <span>03</span></div>${ministers
    .map((m, i) => {
      const p = state.people[i];
      return `<button class="candidate ${selected === m.id ? "chosen" : ""}" data-select="${m.id}"><div class="candidate-top"><img class="candidate-portrait" src="${m.portrait}" alt="" width="44" height="55"><span class="candidate-title"><strong>${m.name}</strong><small>${personalities[p.personality].name} · ${m.role}</small></span>${icon(state.backed === m.id ? "flag" : "chevron-right")}</div><div class="candidate-stat"><span>Seçim gücü <b>${score(state, p)}</b></span><span>Kontrol <b>%${p.control}</b></span></div><div class="mini-meter"><span style="width:${Math.min(100, score(state, p))}%"></span></div><div class="candidate-foot">Nüfuz ${p.power} + ittifak ${score(state, p) - p.power}<span>Öfke ${p.anger}</span></div></button>`;
    })
    .join(
      "",
    )}<div class="field-note">${icon("info")}<p>Son gece de karşı hamle yapılır. Seçim gücü lideri kazanır; kontrol ≥50 ve öfke &lt;60 olmadıkça sana bağlı kalmaz.</p></div><div class="terminal-note"><span>MERKEZ / 23:47</span><p>Duvarların kulağı var.<br>Bu odanın da.</p><div class="waveform">${Array.from({ length: 26 }, (_, i) => `<i style="height:${8 + ((i * 17) % 31)}px"></i>`).join("")}</div></div></section>${dossier()}<section class="operations"><div class="section-label">OPERASYON EMİRLERİ <span>HEDEF / ${minister().name.split(" ").at(-1).toUpperCase()}</span></div>${Object.entries(
    actions,
  )
    .map(([a, v]) => {
      const why = reason(state, selected, a, fileIndex);
      const description = a === "negotiate" && person().personality === "conciliatory"
        ? v.desc.replace("−24", "−32") : v.desc;
      return `<button class="operation" data-action="${a}" ${why ? "disabled" : ""} title="${esc(why || description)}"><span class="op-icon">${icon(v.icon)}</span><span><strong>${v.name}</strong><small>${why || description}</small></span>${icon("arrow-up-right")}</button>`;
    })
    .join(
      "",
    )}<button class="hide" data-action="hide" ${state.ap === 0 || state.ended ? "disabled" : ""}>${icon("eye-off")}<span><strong>İzleri temizle</strong><small>Şüphe −14 · Soruşturmayı kapatmaz · 1 aksiyon</small></span></button><button class="operation special-order" data-modal="command" ${reason(state,selected,'command')?'disabled':''}><span class="op-icon">${icon('flag')}</span><span><strong>Özel emir ver</strong><small>Bağını kestir veya nüfuz aktar. Kabul koşullarını gör · 1 aksiyon</small></span></button><div class="latest"><span class="eyebrow">SON GELİŞME</span><p aria-live="polite">${esc(state.log[0].text)}</p></div><button class="end-day" data-next ${state.ap > 0 || state.ended ? "disabled" : ""}>${state.day === DAYS ? "Son gece · Kabineyi topla" : "Geceye geç"}${icon("arrow-right")}</button><p class="day-hint">${state.ap > 0 ? "Günü bitirmek için kalan AP'lerini kullan." : "Bakanların karşı hamleleri şimdi işlenecek."}</p></section></div>`;
}
function render() {
  const hadDialog = !!el.querySelector(".modal");
  const previousFocus = focusSelector(document.activeElement);
  if (!hadDialog && (modal || state.ended)) dialogTrigger = previousFocus;
  el.innerHTML = `<div class="shell"><aside class="sidebar"><a class="brand" href="#">${icon("fingerprint")}<span>GÖLGE ŞEF<small>MİLLÎ İSTİHBARAT DAİRESİ</small></span></a><div class="classification"><span></span> HAT DİNLENİYOR OLABİLİR</div><div class="nav-caption">YETKİ / OMEGA</div><nav><button data-tab="desk" class="${tab === "desk" ? "selected" : ""}" aria-label="Operasyon masası">${icon("panels-top-left")}Operasyon masası<span>01</span></button><button data-tab="archive" class="${tab === "archive" ? "selected" : ""}" aria-label="İşlem arşivi">${icon("folder-lock")}İşlem arşivi<span>${state.log.length}</span></button><button data-modal="help" aria-label="Operasyon rehberi">${icon("book-open")}Operasyon rehberi</button></nav><div class="mission"><span class="eyebrow">EMİR / 001</span><h3>İktidarın<br>ışığı yoktur.</h3><p>Birini başa getir.<br>Sana bağlı kalmasını sağla.<br>Adını geride bırakma.</p><span class="redacted">YETKİLİ PERSONEL DIŞINDA</span></div><div class="sidebar-bottom"><span class="avatar">Ş</span><div>İstihbarat Şefi<small>Kimlik: gizlenmiş</small></div>${icon("shield-check")}</div></aside><main><header><div class="breadcrumb">BAŞKENT / YER ALTI KATI <span>—</span> ERİŞİM KISITLI</div><div class="header-tools"><span class="prototype">OPERASYON v0.4</span><button class="icon-btn" data-modal="reset" aria-label="Yeni oyun">${icon("rotate-ccw")}</button></div></header><div class="content"><div class="heading"><div><div class="eyebrow">OPERASYON: BOŞ KOLTUK</div><h1>${tab === "desk" ? "Kimse masum kalmayacak." : "Her emir bir iz bırakır."}</h1><p>${tab === "desk" ? "Başkan susuyor. Kabine bekliyor. Siz karar veriyorsunuz." : "Silinmemiş kayıtlar. Verilmiş emirler. Kaçınılmaz sonuçlar."}</p></div><div class="day"><span>SON TARİHE</span><strong>0${DAYS + 1 - state.day}<small>GÜN</small></strong></div></div><div class="overview"><div class="action-budget"><span class="eyebrow">GÜN 0${state.day} / KALAN AP</span><div class="budget">${[0, 1, 2, 3].map((i) => `<span class="${i < state.ap ? "filled" : ""}">${icon("zap")}</span>`).join("")}<strong>${state.ap}<small>/4</small></strong></div></div><div class="suspicion">${meter("DEŞİFRE RİSKİ", state.suspicion, "danger")}<small>${state.suspicion >= 70 ? "Kritik seviye. Karşı istihbarat yaklaşıyor." : "Şüphe 100 olursa operasyon anında biter."}</small></div><div class="countdown">${icon("hourglass")}<div><strong>${state.backed ? ministers.find((m) => m.id === state.backed).name : "Belirlenmedi"}</strong><span>Desteklediğin aday</span></div></div></div>${tab === "desk" ? desk() : `<section class="archive"><div class="section-label">ŞİFRELİ İŞLEM ARŞİVİ <span>${state.orders} EMİR</span></div>${state.log.map((l, i) => `<article><span class="log-id">${String(state.log.length - i).padStart(2, "0")}</span><span class="log-day">GÜN ${l.day}<small>${l.type === "night" ? "GECE" : "MERKEZ"}</small></span><p>${esc(l.text)}</p></article>`).join("")}</section>`}<footer><span>${icon("hard-drive")} ${saveStatus}</span><span>BU ODADA SÖYLENENLER BU ODADA KALIR.</span><button data-modal="firebase">${icon("cloud-off")} Yerel deneme</button></footer></div></main></div>${modal || state.ended ? modalHTML() : ""}`;
  const languageButton = document.createElement("button");
  const shell = el.querySelector(".shell");
  if (sidebarCollapsed) shell?.classList.add("sidebar-collapsed");
  const sidebar = el.querySelector(".sidebar");
  if (sidebar) {
    const toggle = document.createElement("button");
    toggle.className = "sidebar-toggle";
    toggle.dataset.sidebarToggle = "";
    toggle.setAttribute("aria-label", sidebarCollapsed ? "Menüyü aç" : "Menüyü daralt");
    toggle.textContent = sidebarCollapsed ? "›" : "‹";
    sidebar.prepend(toggle);
  }
  const navCaption = el.querySelector(".nav-caption");
  if (navCaption) navCaption.textContent = "YETKİ";
  const breadcrumb = el.querySelector(".breadcrumb");
  if (breadcrumb) breadcrumb.textContent = "BAŞKENT / YER ALTI KATI";
  const mission = el.querySelector(".mission");
  if (mission) {
    const missionText = mission.querySelector("p");
    if (missionText) missionText.innerHTML = "Birini başa getir.<br>İpleri sıkı tut.<br>Sana bağlı kalmasını sağla.";
    const access = mission.querySelector(".redacted");
    if (access) access.textContent = "YETKİLİ PERSONEL DIŞINDA GİRİŞ YASAKTIR";
  }
  languageButton.className = "language-toggle";
  languageButton.dataset.language = "";
  languageButton.setAttribute("aria-label", "Dil değiştir");
  languageButton.textContent = currentLanguage() === "en" ? "Türkçe" : "English";
  el.querySelector(".header-tools")?.prepend(languageButton);
  applyLanguage(el);
  createIcons({ icons });
  bind();
  if (modal || state.ended) {
    if (!hadDialog) el.querySelector(".modal button")?.focus();
    else if (previousFocus) el.querySelector(previousFocus)?.focus();
  } else {
    const target = hadDialog ? dialogTrigger : previousFocus;
    if (target) el.querySelector(target)?.focus();
  }
}
function commandHTML() {
  const targets = state.people.filter((p) => p.id !== selected);
  const options = targets.map((target) => {
    const name = ministers.find((m) => m.id === target.id).name;
    const buttons = ["break", "endorse"].map((kind) => {
      const info = commandInfo(state, selected, target.id, kind);
      const transferText = canImproveRelation(state, selected, target.id)
        ? "Bu bakana 10 nüfuz aktar; ilişkiniz +8 artar."
        : "Bu bakana 10 nüfuz aktar. Bağ kesme emri sürdüğü için ilişkiniz artmaz.";
      const description = kind === "break"
        ? "İlişki en fazla 35 olur. Bugün ve yarın gece yeniden yakınlaşma engellenir."
        : transferText;
      return `<button class="method" data-command="${kind}" data-target="${target.id}" ${info.ok ? "" : "disabled"}>
        <strong>${kind === "break" ? "Bağını kes" : "Nüfuzunu aktar"}</strong>
        <span>${description}</span>
        <b>GEREKEN KONTROL: ${info.threshold}</b><small>${info.reason}</small>
      </button>`;
    }).join("");
    return `<div class="command-target"><h3>${name} · Yakınlık ${relation(state, selected, target.id)}</h3>${buttons}</div>`;
  }).join("");
  return `<span class="eyebrow">ÖZEL EMİR / ${minister().name}</span>
    <h2>Sadakatin fiyatı.</h2>
    <p>Kontrolünüz: %${person().control}. Her emir 1 aksiyon; kontrol −10, öfke +8, şüphe +2.
    Bakan taviz olarak +3 nüfuz alır. Günde bir özel emir kabul eder.</p>${options}`;
}
function modalHTML() {
  let content = "",
    wide = false;
  if (state.ended && modal !== "reset") {
    const o = outcome(state);
    content = `<span class="eyebrow">${state.day === DAYS && state.ap === 0 && state.night.length ? "SON GECE TAMAMLANDI" : "OPERASYON SONUCU"} / ${o.win ? "GÖREV BAŞARILI" : "OPERASYON KAPANDI"}</span><h2>${o.title}</h2><p>${o.text}</p><div class="result-stats"><span>Harcanan AP<strong>${state.apSpent}/${DAYS*4}</strong></span><span>Şüphe<strong>%${state.suspicion}</strong></span></div><h3 class="report-title">${state.night.length ? "Son gece raporu" : "Operasyon kaydı"}</h3><ul class="night-list">${(state.night.length ? state.night : [state.log[0].text]).map((t) => `<li>${esc(t)}</li>`).join("")}</ul><button class="primary" data-reset>Yeni operasyon ${icon("arrow-right")}</button>`;
  } else if (modal === "command") {
    content = commandHTML();
  } else if (modal === "investigate") {
    content = `<span class="eyebrow">SORUŞTURMA / ${minister().name}</span><h2>İhbar, kanıt değildir.</h2><p>“${caseData(state, selected, fileIndex).title}” için kaynak seç. Belge toplamak ve belgeleri doğrulamak ayrı ayrı birer aksiyon harcar.</p><button class="method" data-method="investigate"><strong>${icon("file-text")} Arşiv kayıtlarını al</strong><span>Belgeler hemen gelir. Şüphe +6, öfke +5. Sonra belge inceleme gerekir.</span><b>1 AKSİYON</b></button><button class="method" data-method="follow" ${state.day === DAYS ? "disabled" : ""}><strong>${icon("eye-off")} Takip ekibi gönder</strong><span>${state.day === DAYS ? "Son gündesin. Ekibin dönüşüne zaman yok." : "Belgeler yarın gelir. Şüphe +2, öfke +1. Daha sessiz; bir gün bekletir."}</span><b>1 AKSİYON</b></button>`;
  } else if (modal === "review") {
    wide = true;
    const c = caseData(state, selected, fileIndex);
    content = `<span class="eyebrow">DELİL İNCELEME / ${minister().name}</span><h2>İhbarı tart.</h2>
      <p class="puzzle-task"><strong>${c.title}</strong><br>${c.claim}<br>${c.task}</p>
      <div class="document-grid">${c.docs.map((d, index) => `<button class="document ${checked.includes(d.id) ? "picked" : ""}" data-doc="${d.id}" aria-pressed="${checked.includes(d.id)}"><span class="doc-top">KAYIT / 0${index + 1}<b>${checked.includes(d.id) ? "SEÇİLDİ" : "İNCELE"}</b></span><h3>${d.title}</h3><p>${esc(d.body)}</p><div class="doc-mark">DAHİLİ ARŞİV · KOPYA</div></button>`).join("")}</div>
      <fieldset class="verdict-choice"><legend>Bu iki belge hangi sonucu destekliyor?</legend>
        <button data-verdict="guilty" class="${reviewDecision === "guilty" ? "active" : ""}" aria-pressed="${reviewDecision === "guilty"}">İddia destekleniyor</button>
        <button data-verdict="clear" class="${reviewDecision === "clear" ? "active" : ""}" aria-pressed="${reviewDecision === "clear"}">İhbar desteklenmiyor</button>
      </fieldset>
      <div class="puzzle-bottom"><span>${checked.length}/2 belge seçildi.<br><small>Yanlış belge veya sonuç: şüphe +7, öfke +9; tekrar deneme yarın.</small></span><button class="primary" data-submit ${checked.length !== 2 || !reviewDecision ? "disabled" : ""}>Kararı doğrula · 1 AP</button></div>`;  } else if (modal === "blackmail" || modal === "leak") {
    const f = person().files[fileIndex];
    content = `<span class="eyebrow">EMİR ONAYI / DOSYA 0${fileIndex + 1}</span><h2>${modal === "blackmail" ? "Artık bildiğinizi bilecek." : "Geri dönüşü yok."}</h2><p>${modal === "blackmail" ? "Kontrol +24, öfke +24, şüphe +10. Kimliğin açığa çıkar; somut karşı dosya +12 ilerler. Müdahale 2 AP ile başlar, dosya yaşlandıkça 3 ve 4 AP olur. Hedef gece müttefik arayacak. Öfkesi 45’i bulursa kontrol kaybedersin; 65’te belgeyi kendisi açıklayabilir." : f.stage === "verified" ? "Nüfuz kaybı 17; her müttefik 6 hasarı engeller (en az 5 hasar). Her koruyucu 3 nüfuz kaybeder, 6 öfkelenir. Öfke +22, şüphe +8. Kimliğin bilinmiyorsa kaynak arayışı başlar. Hedef seni zaten tanıyorsa somut dosya +18 ilerler. Belge kamuya açılır." : "Bu dosya DOĞRULANMADI. Eksik suçlama çürütülür: hedefin nüfuzu +8, öfkesi +15, senin şüphen +18. Kimliğin bilinmiyorsa kaynak arayışı başlar; zaten biliniyorsa somut dosya +18 ilerler. Önce belgeleri incelemek daha mantıklı."}</p><button class="primary" data-confirm="${modal}">${modal === "blackmail" ? "Baskı emrini ver" : "Yayımlama emrini ver"} · 1 aksiyon</button>`;
  } else if (modal === "night") {
    content = `<span class="eyebrow">GECE / KARŞI HAMLELER</span><h2>Siz uyurken.</h2><ul class="night-list">${state.night.map((t) => `<li>${esc(t)}</li>`).join("")}</ul><button class="primary" data-close>Masaya dön ${icon("arrow-right")}</button>`;
  } else if (modal === "help") {
    content = `<span class="eyebrow">OPERASYON EL KİTABI / v0.4</span><h2>Her ihbar suç değildir.</h2><ol>
      <li><strong>Değişen kabine.</strong> Başlangıç seçim güçleri, ittifak bonusları dahil 30–56 arasındadır. İlişkiler 20–75 arasında başlar. Altı kişilikten üçü tekrar etmeden dağıtılır; davranışlarını şahıs dosyasında okuyabilirsin.</li>
      <li><strong>18 farklı olay.</strong> Bakanların görevlerine uygun altışar olaydan üçü seçilir. Belgeleri al, ilgili iki kaydı bul ve iddianın desteklenip desteklenmediğini belirt. Doğru kapatılan ihbar şantaj kozu değildir.</li>
      <li><strong>Araştırma.</strong> Arşiv hemen belge verir: 1 AP, şüphe +6, öfke +5. Takip ertesi gün döner: 1 AP, şüphe +2, öfke +1; son gün başlatılamaz. İnceleme ayrıca 1 AP. Yanlış belge veya sonuç şüphe +7, öfke +9; yeniden deneme yarın.</li>
      <li><strong>Sızıntı.</strong> Doğrulanmış kanıt nüfuzu 17 azaltır; her müttefik 6 hasarı önler, en az 5 hasar kalır. Doğrulanmamış dosya geri teper. Kimliğin bilinmiyorsa kaynak arayışı → bağlantı şüphesi → somut dosya süreci başlar. Gece normalde bir, kuşkucuda iki aşama ilerler. Aynı hedefe yeniden erişmek veya sızdırmak arayışı hızlandırır.</li>
      <li><strong>Şantaj.</strong> Kontrol +24, öfke +24, şüphe +10; kimliğin bilindiğinden doğrudan +12 somut dosya açılır. Aynı kanıt bir kez kullanılabilir. Kimliğini bilen hedefe sonraki sızıntı dosyayı +18 ilerletir.</li>
      <li><strong>Soruşturmayı bastırma.</strong> Kaynakları çekmek dosyayı 30 azaltır, şüpheyi 2 artırır. Dosya açıldığında ve ertesi gün 2 AP; iki gün sonra 3 AP, dört gün sonra 4 AP. Kısmi müdahale dosyanın yaşını sıfırlamaz. Sıfırda kapanır, ama hedef kimliğini unutmaz. İz temizlemek yalnızca genel şüpheyi 14 azaltır.</li>
      <li><strong>İlişkiler.</strong> 60+ yakınlık iki tarafa +6 seçim gücü ve sızıntıda koruma verir. Dördüncü günden itibaren 18+ güç gerideki müttefik bir kez 8 nüfuz aktarabilir. Hırslı kişilik kendiliğinden bağış yapmaz. Özel emirlerde kişilik ek kontrol gerektirebilir; bedel önceden gösterilir.</li>
      <li><strong>Öfke.</strong> 45+ öfke gece kontrolü 8 azaltır. 65+ öfkede gizli şantaj dosyasını hedef kendisi açıklayabilir; ek kontrol −12. Güvence −24 öfke (uzlaşmacıda −32), +5 kontrol, +3 nüfuz ve +1 şüphe getirir; bakan başına günde bir kez.</li>
      <li><strong>Final.</strong> Yedi gün, günde dört AP. Pahalı emirler birden fazla AP harcar. Son gece dahil karşı hamleler işlenir. Zafer için adayın tek lider, kontrolü en az 50, öfkesi 60 altında olmalı. Şüphe veya somut dosya 100 olursa kaybedersin.</li>
      </ol>`;  } else if (modal === "reset") {
    content =
      '<span class="eyebrow">YENİ OPERASYON</span><h2>Geçmişi kapat.</h2><p>Mevcut v0.4 ilerlemesi silinir. Yeni kişilikler, güçler, ilişkiler ve farklı olaylarla ilk güne dönersin.</p><button class="primary" data-reset>Yeni oyunu başlat</button>';
  } else {
    content = `<span class="eyebrow">BULUT KAYDI</span><h2>${cloudUser ? "Bulut kaydı etkin." : firebaseMode === "register" ? "Hesap oluştur" : "Giriş yap"}</h2><p>${cloud ? "Firebase bağlantısı hazır. İlerlemeni cihazlar arasında saklayabilirsin." : "Firebase ayarları bulunamadı. İlerleme bu tarayıcıya kaydediliyor."}</p>${firebaseMessage ? `<p class="firebase-message">${esc(firebaseMessage)}</p>` : ""}${cloud && !cloudUser ? `${firebaseMode === "register" ? '<input data-username placeholder="Kullanıcı adı">' : ""}<input data-email type="email" placeholder="E-posta"><input data-password type="password" placeholder="Şifre"><div class="modal-actions">${firebaseMode === "register" ? '<button type="button" class="primary" data-register>Hesap oluştur</button><button type="button" data-switch-login>Giriş yap</button>' : '<button type="button" class="primary" data-login>Giriş yap</button><button type="button" data-switch-register>Hesap oluştur</button>'}</div>` : cloudUser ? '<button type="button" class="primary" data-cloud-load>Bulut kaydını yükle</button><button type="button" data-logout>Çıkış yap</button>' : ""}`;
  }
  return `<div class="overlay"><section class="modal ${wide ? "wide" : ""}" role="dialog" aria-modal="true" aria-label="Operasyon paneli">${!state.ended ? `<button class="close icon-btn" data-close aria-label="Kapat">${icon("x")}</button>` : ""}${content}</section></div>`;
}
function apply(a, payload = null) {
  state = act(state, selected, a, fileIndex, payload);
  modal = null;
  checked = [];
  reviewDecision = null;
  save();
  render();
}
function bind() {
  el.querySelector("[data-sidebar-toggle]")?.addEventListener("click", () => {
    sidebarCollapsed = !sidebarCollapsed;
    localStorage.setItem("golge-sef-sidebar", sidebarCollapsed ? "collapsed" : "expanded");
    render();
  });
  el.querySelector("[data-language]")?.addEventListener("click", () => {
    toggleLanguage();
    render();
  });
  el.querySelectorAll("[data-verdict]").forEach((button) => {
    button.onclick = () => { reviewDecision = button.dataset.verdict; render(); };
  });
  el.querySelectorAll('[data-command]').forEach(b=>b.onclick=()=>apply('command',{target:b.dataset.target,kind:b.dataset.command}));
  el.querySelectorAll('[data-contain]').forEach(b=>b.onclick=()=>{state=act(state,b.dataset.contain,'contain');save();render();});
  el.querySelectorAll("[data-select]").forEach(
    (b) =>
      (b.onclick = () => {
        selected = b.dataset.select;
        fileIndex = 0;
        render();
      }),
  );
  el.querySelectorAll("[data-case]").forEach(
    (b) =>
      (b.onclick = () => {
        fileIndex = Number(b.dataset.case);
        render();
      }),
  );
  el.querySelectorAll("[data-tab]").forEach(
    (b) =>
      (b.onclick = () => {
        tab = b.dataset.tab;
        render();
      }),
  );
  el.querySelectorAll("[data-modal]").forEach(
    (b) =>
      (b.onclick = () => {
        modal = b.dataset.modal;
        render();
      }),
  );
  el.querySelectorAll("[data-close]").forEach(
    (b) =>
      (b.onclick = () => {
        modal = null;
        checked = [];
  reviewDecision = null;
        render();
      }),
  );
  el.querySelector("[data-reset]")?.addEventListener("click", () => {
    state = fresh();
    selected = "demir";
    modal = null;
    fileIndex = 0;
    tab = "desk";
    save();
    render();
  });
  el.querySelector("[data-register]")?.addEventListener("click", async () => {
    try { cloudUser = (await cloud.register(el.querySelector("[data-email]").value, el.querySelector("[data-password]").value)).user; firebaseMessage = "Hesap oluşturuldu. Bulut kaydı etkin."; save(); render(); } catch (error) { firebaseMessage = firebaseError(error); render(); }
  });
  el.querySelector("[data-switch-login]")?.addEventListener("click", () => { firebaseMode = "login"; firebaseMessage = ""; render(); });
  el.querySelector("[data-switch-register]")?.addEventListener("click", () => { firebaseMode = "register"; firebaseMessage = ""; render(); });
  el.querySelector("[data-login]")?.addEventListener("click", async () => {
    try { cloudUser = (await cloud.login(el.querySelector("[data-email]").value, el.querySelector("[data-password]").value)).user; const saved = await cloud.loadGame(); if (validSave(saved)) state = saved; firebaseMessage = saved ? "Giriş başarılı. Bulut kaydı yüklendi." : "Giriş başarılı. Henüz bulut kaydı yok."; render(); } catch (error) { firebaseMessage = firebaseError(error); render(); }
  });
  el.querySelector("[data-cloud-load]")?.addEventListener("click", async () => { const saved = await cloud.loadGame(); if (validSave(saved)) state = saved; saveStatus = saved ? "Bulut kaydı yüklendi" : "Bulut kaydı bulunamadı"; modal = null; render(); });
  el.querySelector("[data-logout]")?.addEventListener("click", async () => { await cloud.logout(); cloudUser = null; modal = null; render(); });
  el.querySelector("[data-back]")?.addEventListener("click", () => {
    state.backed = selected;
    save();
    render();
  });
  el.querySelectorAll("[data-action]").forEach(
    (b) =>
      (b.onclick = () => {
        const a = b.dataset.action;
        if (["investigate", "blackmail", "leak"].includes(a)) {
          modal = a;
          render();
        } else apply(a);
      }),
  );
  el.querySelectorAll("[data-method]").forEach(
    (b) => (b.onclick = () => apply(b.dataset.method)),
  );
  el.querySelector("[data-review]")?.addEventListener("click", () => {
    checked = [];
  reviewDecision = null;
    modal = "review";
    render();
  });
  el.querySelectorAll("[data-doc]").forEach(
    (b) =>
      (b.onclick = () => {
        const id = b.dataset.doc;
        if (checked.includes(id)) checked = checked.filter((x) => x !== id);
        else if (checked.length < 2) checked.push(id);
        render();
        el.querySelector(`[data-doc="${id}"]`)?.focus();
      }),
  );
  el.querySelector("[data-submit]")?.addEventListener("click", () =>
    apply("review", { docs: checked, verdict: reviewDecision }),
  );
  el.querySelector("[data-confirm]")?.addEventListener("click", (e) =>
    apply(e.currentTarget.dataset.confirm),
  );
  el.querySelector("[data-next]")?.addEventListener("click", () => {
    state = nextDay(state);
    modal = state.ended ? null : "night";
    save();
    render();
  });
  el.querySelector(".brand")?.addEventListener("click", (e) => {
    e.preventDefault();
    tab = "desk";
    render();
  });
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal && !state.ended) {
    modal = null;
    checked = [];
  reviewDecision = null;
    render();
  }
  if (e.key === "Tab" && (modal || state.ended)) {
    const f = [...el.querySelectorAll(".modal button:not(:disabled)")];
    if (e.shiftKey && document.activeElement === f[0]) {
      e.preventDefault();
      f.at(-1)?.focus();
    } else if (!e.shiftKey && document.activeElement === f.at(-1)) {
      e.preventDefault();
      f[0]?.focus();
    }
  }
});
render();
