import { incidents, drawCases, buildCase } from "./cases.js";
import { personalities } from "./personalities.js";
import { randomGenerator, shuffled } from "./random.js";
export { personalities };
import { ministers } from "./characters.js";
export { ministers };
export const DAYS = 7;
export const briefings = [
  [
    "Sessizlik bir emir değildir.",
    "Başkanın odasına kimse alınmıyor. Yedi gün sonra kabine toplanacak. Bir ihbar kanıt değildir; bir müttefik de sonsuza kadar sadık kalmaz.",
  ],
  [
    "Koridorlarda fısıltılar.",
    "Bakanlar dün verdiğiniz emirlere karşı hamle yaptı. Gece raporunu inceleyin. Takip ekipleri sahadan döndü.",
  ],
  [
    "Herkes bir şey biliyor.",
    "Soruşturmalar fark ediliyor. Baskı altındaki bakanlar birbirine yaklaşıyor. Aynı kişiye sürekli destek vermenin etkisi azalıyor.",
  ],
  [
    "Dostlukların fiyatı değişti.",
    "Güç dengeleri kayıyor. Bir bakanın yanında duran kişi, yarın sizin karşınıza çıkabilir.",
  ],
  ["Sessiz pazarlıklar.", "Geriye düşen müttefikler desteklerini güçlü ortağa aktarabilir. Kontrol ettiğiniz bakanın ilişkilerini kullanın."],
  ["Son iki gün.", "İz temizlemek açık soruşturmaları kapatmaz. Kaynakları çekmek için ayrı emir verin."],
  [
    "Son geceye hazırlan.",
    "Dört emir kaldı. Kabine toplanmadan önce son bir karşı hamle gecesi yaşanacak. Nüfuz tek başına yetmez.",
  ],
];
export const actions = {
  investigate: {
    name: "Soruşturma aç",
    icon: "scan-search",
    desc: "Yöntem seç · 1 aksiyon. Kanıt için ayrıca inceleme gerekir.",
  },
  support: {
    name: "Kulis desteği",
    icon: "trending-up",
    desc: "Nüfuz +9 / +5 / +2 · Kontrol −3 · Şüphe +3",
  },
  blackmail: {
    name: "Şantaj uygula",
    icon: "fingerprint",
    desc: "Doğrulanmış özel belge · Kontrol +24 · Öfke +24 · Şüphe +10",
  },
  leak: {
    name: "Basına sızdır",
    icon: "radio",
    desc: "Kanıt: nüfuz −17. Ham dosya: geri teper. Şüphe +8.",
  },
  negotiate: {
    name: "Güvence ver",
    icon: "shield-check",
    desc: "Öfke −24 · Kontrol +5 · Nüfuz +3 · Şüphe +1",
  },
};
export const DAYS_LIMIT = DAYS * 4;
export const clamp = (n) => Math.max(0, Math.min(100, n));
const name = (id) => ministers.find((m) => m.id === id).name;
export const relationKey = (a, b) => [a, b].sort().join(":");
export function relation(s, a, b) {
  return s.relations[relationKey(a, b)];
}
export function canImproveRelation(s, a, b) {
  return (s.brokenUntil[relationKey(a, b)] || 0) < s.day;
}
function improveRelation(s, a, b, amount) {
  if (!canImproveRelation(s, a, b)) return false;
  const key = relationKey(a, b);
  s.relations[key] = clamp(s.relations[key] + amount);
  return true;
}
function log(s, text, type = "info") {
  s.log.unshift({ day: s.day, text, type });
}
export function fresh(seed = Math.floor(Math.random() * 1000000)) {
  const random = randomGenerator(seed);
  const number = (min, max) => min + Math.floor(random() * (max - min + 1));
  const traits = shuffled(Object.keys(personalities), random);
  const s = {
    version: 4, seed, day: 1, ap: 4, apSpent: 0, suspicion: 12,
    backed: null, ended: false, orders: 0, brokenUntil: {},
    relations: {
      "arin:demir": number(20, 75),
      "demir:koray": number(20, 75),
      "arin:koray": number(20, 75),
    },
    people: ministers.map((m, index) => ({
      id: m.id,
      personality: traits[index],
      power: number(30, 56),
      control: number(12, 24),
      anger: 10,
      files: drawCases(m.id, random).map((caseId) => ({
        caseId, stage: "sealed", pressured: false, public: false,
        exposed: false, retryDay: 0,
      })),
      supports: 0, attacked: 0, promiseDay: 0, commandDay: 0,
      trail: 0, trailOpenedDay: 0, hunt: 0, identified: false, donated: false,
    })),
    log: [{ day: 1, text: "Kabine dengeleri değişti. Kişilikleri, ilişkileri ve ihbarları inceleyin; her ihbar suç değildir.", type: "info" }],
    night: [],
  };
  for (const p of s.people) {
    p.power -= s.people.filter((q) => q.id !== p.id && relation(s, p.id, q.id) >= 60).length * 6;
  }
  return s;
}
export function score(s, p) {
  return p.power + s.people.filter((q) => q.id !== p.id && relation(s, q.id, p.id) >= 60).length * 6;
}
export function caseData(s, id, index) {
  const file = s.people.find((p) => p.id === id)?.files[index];
  return file ? buildCase(s.seed, file.caseId) : null;
}
export function containmentCost(s, p) {
  const age = p.trail > 0 ? Math.max(0, s.day - p.trailOpenedDay) : 0;
  return Math.min(4, 2 + Math.floor(age / 2));
}
export function actionCost(s, id, action) {
  const p = s.people.find((p) => p.id === id);
  return action === "contain" && p ? containmentCost(s, p) : 1;
}
export function validSave(s) {
  const integer = (n, min, max) => Number.isInteger(n) && n >= min && n <= max;
  const object = (value) => value && typeof value === "object" && !Array.isArray(value);
  const ids = ministers.map((m) => m.id);
  if (!object(s) || s.version !== 4 || !integer(s.seed, 0, Number.MAX_SAFE_INTEGER)) return false;
  if (!integer(s.day, 1, DAYS) || !integer(s.ap, 0, 4)) return false;
  if (!integer(s.orders, 0, DAYS_LIMIT) || !integer(s.apSpent, 0, DAYS_LIMIT)) return false;
  if (s.orders > s.apSpent || s.apSpent !== (s.day - 1) * 4 + 4 - s.ap) return false;
  if (!integer(s.suspicion, 0, 100) || typeof s.ended !== "boolean") return false;
  if (s.backed !== null && !ids.includes(s.backed)) return false;
  if (!object(s.relations) || !object(s.brokenUntil)) return false;
  for (const key of ["arin:demir", "arin:koray", "demir:koray"]) {
    if (!integer(s.relations[key], 0, 100)) return false;
  }
  if (!Object.values(s.brokenUntil).every((day) => integer(day, 1, DAYS + 1))) return false;
  if (!Array.isArray(s.people) || s.people.length !== 3) return false;
  if (new Set(s.people.map((p) => p?.personality)).size !== 3) return false;
  for (const [index, p] of s.people.entries()) {
    if (!object(p) || p.id !== ids[index] || !Object.hasOwn(personalities, p.personality)) return false;
    if (![p.power, p.control, p.anger, p.trail].every((n) => integer(n, 0, 100))) return false;
    if (![p.supports, p.attacked].every((n) => integer(n, 0, DAYS_LIMIT))) return false;
    if (![p.promiseDay, p.commandDay].every((n) => integer(n, 0, s.day))) return false;
    if (!integer(p.hunt, 0, 2) || typeof p.identified !== "boolean") return false;
    if (!integer(p.trailOpenedDay, 0, s.day)) return false;
    if (p.trail > 0 && (p.trailOpenedDay === 0 || !p.identified || p.hunt !== 0)) return false;
    if (p.trail === 0 && p.trailOpenedDay !== 0) return false;
    if (p.hunt > 0 && p.identified) return false;
    if (typeof p.donated !== "boolean" || !Array.isArray(p.files) || p.files.length !== 3) return false;
    if (new Set(p.files.map((f) => f?.caseId)).size !== 3) return false;
    for (const f of p.files) {
      if (!object(f) || !["sealed", "pending", "raw", "verified", "cleared"].includes(f.stage)) return false;
      const event = incidents.find((event) => event.id === f.caseId && event.minister === p.id);
      if (!event || (f.stage === "verified" && event.verdict !== "guilty")) return false;
      if (f.stage === "cleared" && event.verdict !== "clear") return false;
      if (![f.pressured, f.public, f.exposed].every((value) => typeof value === "boolean")) return false;
      if (!integer(f.retryDay, 0, DAYS + 1)) return false;
      if (f.stage === "pending" && !integer(f.readyDay, 2, DAYS)) return false;
    }
  }
  if (!Array.isArray(s.night) || !s.night.every((line) => typeof line === "string")) return false;
  if (!Array.isArray(s.log) || s.log.length === 0) return false;
  return s.log.every((entry) => object(entry) && integer(entry.day, 1, DAYS)
    && typeof entry.text === "string" && typeof entry.type === "string");
}
export function reason(s, id, action, index = 0) {
  if (s.ended) return "Operasyon sona erdi.";
  const p = s.people.find((p) => p.id === id);
  if (!p) return "Geçersiz hedef.";
  if (s.ap < actionCost(s, id, action)) return `Bu emir için ${actionCost(s, id, action)} AP gerekli. Kalan: ${s.ap}.`;
  const f = p.files[index];
  if (["investigate", "follow", "blackmail", "leak", "review"].includes(action) && !f) return "Dosya seçmelisiniz.";
  if (["investigate", "follow"].includes(action) && f.stage !== "sealed") return "Bu dosyada soruşturma zaten açıldı.";
  if (action === "follow" && s.day === DAYS) return "Takip ertesi gün döner; artık zaman yok.";
  if (action === "review" && (f.stage !== "raw" || f.public)) return "İncelenebilir özel belge gerekli.";
  if (action === "review" && f.retryDay > s.day) return "Kaynak bugün sustu. Yarın yeniden deneyin.";
  if (action === "blackmail" && (f.stage !== "verified" || f.public || f.exposed)) return "Doğrulanmış, kamuya açılmamış bir suç kanıtı gerekli.";
  if (action === "blackmail" && f.pressured) return "Bu belgeyle zaten baskı kurdunuz.";
  if (action === "leak" && (!["raw", "verified"].includes(f.stage) || f.public || f.exposed)) return "Sızdırılabilir özel bir dosya gerekli.";
  if (action === "negotiate" && p.promiseDay === s.day) return "Bugün zaten güvence verdiniz.";
  if (action === "contain" && p.trail <= 0) return "Bu bakanın açık soruşturması yok.";
  if (action === "command" && p.commandDay === s.day) return "Bu bakana bugün zaten özel emir verdiniz.";
  if (action === "command" && p.control < 35) return "Özel emir için en az 35 kontrol gerekli.";
  return "";
}
function openTrail(s, p, amount) {
  if (p.trail === 0) p.trailOpenedDay = s.day;
  p.trail = clamp(p.trail + amount);
  p.identified = true;
  p.hunt = 0;
}
function finish(s, cost) {
  s.orders++;
  s.ap -= cost;
  s.apSpent += cost;
  s.suspicion = clamp(s.suspicion);
  for (const p of s.people) {
    for (const key of ["power", "control", "anger"]) p[key] = clamp(p[key]);
  }
  if (s.suspicion >= 100 || s.people.some((p) => p.trail >= 100)) s.ended = true;
  return s;
}
export function act(state, id, action, index = 0, payload = null) {
  if (!["investigate", "follow", "review", "support", "blackmail", "leak", "negotiate", "hide", "contain", "command"].includes(action)) return state;
  if (reason(state, id, action, index)) return state;
  if (action === "command" && !commandInfo(state, id, payload?.target, payload?.kind).ok) return state;
  const cost = actionCost(state, id, action);
  const s = structuredClone(state);
  const p = s.people.find((p) => p.id === id);
  const f = p.files[index];
  if (action === "investigate" || action === "follow") {
    f.stage = action === "follow" ? "pending" : "raw";
    f.readyDay = s.day + 1;
    f.method = action;
    s.suspicion += action === "follow" ? 2 : 6;
    p.anger += action === "follow" ? 1 : 5;
    if (p.hunt > 0) {
      p.hunt = Math.min(2, p.hunt + 1);
      log(s, `${name(id)} yeni belge erişimini sızıntıyla ilişkilendirdi. Kaynak arayışı bağlantı şüphesine dönüştü.`, "hunt");
    }
    log(s, `${name(id)} / ${caseData(s, id, index).title}: ${action === "follow" ? "Takip ekibi gönderildi; belgeler yarın gelir." : "Arşiv kayıtları alındı. İhbar henüz kanıtlanmadı."}`, action);
  }
  if (action === "review") {
    const event = caseData(s, id, index);
    if (!Array.isArray(payload?.docs) || !["guilty", "clear"].includes(payload?.verdict)) return state;
    const answer = [...payload.docs].sort();
    if (answer.length !== 2 || new Set(answer).size !== 2 || !answer.every((id) => event.docs.some((d) => d.id === id))) return state;
    const right = answer.join(",") === [...event.answer].sort().join(",") && payload.verdict === event.verdict;
    if (right) {
      f.stage = event.verdict === "guilty" ? "verified" : "cleared";
      if (event.verdict === "clear") {
        s.suspicion -= 2;
        p.anger -= 4;
      }
      log(s, `${name(id)} / ${event.title}: ${event.verdict === "guilty" ? "İddia doğrulandı." : "İhbar desteklenmiyor; dosya kapatıldı. Şüphe −2, öfke −4."} ${event.explanation}`, "review");
    } else {
      f.retryDay = s.day + 1;
      p.anger += 9;
      s.suspicion += 7;
      log(s, `${name(id)}: Seçilen belgeler bu sonucu desteklemiyor. Şüphe +7, öfke +9. Tekrar inceleme yarın.`, "review");
    }
  }
  if (action === "support") {
    const boost = p.supports === 0 ? 9 : p.supports === 1 ? 5 : 2;
    p.supports++;
    p.power += boost;
    p.control -= 3;
    s.suspicion += 3;
    log(s, `${name(id)} için kulis: nüfuz +${boost}, kontrol −3, şüphe +3.`, "support");
  }
  if (action === "blackmail") {
    f.pressured = true;
    p.control += 24;
    p.anger += 24;
    p.attacked++;
    s.suspicion += 10;
    openTrail(s, p, 12);
    log(s, `${name(id)} tehdidin kaynağını biliyor. Kontrol +24, öfke +24, şüphe +10. Karşı dosya +12; müdahale bedeli ${containmentCost(s, p)} AP.`, "blackmail");
  }
  if (action === "leak") {
    f.public = true;
    p.attacked++;
    s.suspicion += 8;
    if (p.identified) {
      openTrail(s, p, 18);
      log(s, `${name(id)} kimliğinizi önceki temaslardan biliyor; sızıntıyı size bağladı. Karşı dosya +18.`, "hunt");
    } else {
      p.hunt = Math.min(2, p.hunt + 1);
      log(s, `${name(id)} sızıntının kaynağını arıyor. ${p.hunt === 2 ? "Tekrarlanan saldırı bağlantı şüphesini güçlendirdi." : "Kimliğiniz henüz bilinmiyor; henüz karşı dosya açılmadı."}`, "hunt");
    }
    if (f.stage === "verified") {
      const protectors = s.people.filter((q) => q.id !== id && relation(s, id, q.id) >= 60);
      const damage = Math.max(5, 17 - protectors.length * 6);
      p.power -= damage;
      for (const q of protectors) {
        q.power -= 3;
        q.anger += 6;
        log(s, `${name(q.id)} müttefikini savundu: hasar 6 azaldı; kendi nüfuzu −3, öfkesi +6.`, "alliance");
      }
      p.anger += 22;
      log(s, `${name(id)}: Kanıt yayımlandı. Nüfuz −${damage}, öfke +22, şüphe +8. Belge artık özel koz değil.`, "leak");
    } else {
      p.power += 8;
      p.anger += 15;
      s.suspicion += 10;
      log(s, `${name(id)} doğrulanmamış suçlamayı çürüttü. Nüfuz +8, öfke +15, toplam şüphe +18.`, "leak");
    }
  }
  if (action === "negotiate") {
    const relief = p.personality === "conciliatory" ? 32 : 24;
    p.anger -= relief;
    p.control += 5;
    p.power += 3;
    p.promiseDay = s.day;
    s.suspicion += 1;
    log(s, `${name(id)} ile güvence: öfke −${relief}, kontrol +5, nüfuz +3, şüphe +1. Bugün tekrar verilemez.`, "negotiate");
  }
  if (action === "command") {
    const q = s.people.find((q) => q.id === payload.target);
    const key = relationKey(id, q.id);
    p.commandDay = s.day;
    p.control -= 10;
    p.anger += 8;
    p.power += 3;
    s.suspicion += 2;
    if (payload.kind === "break") {
      s.relations[key] = Math.min(35, s.relations[key]);
      s.brokenUntil[key] = s.day + 1;
      log(s, `${name(id)}, ${name(q.id)} ile bağını kesti. İlişki en fazla 35; bugün ve yarın yakınlaşma engelli. Nüfuz +3, kontrol −10, öfke +8, şüphe +2.`, "command");
    } else {
      p.power -= 10;
      q.power += 10;
      const improved = improveRelation(s, id, q.id, 8);
      log(s, `${name(id)}, ${name(q.id)} için 10 nüfuz aktardı. ${improved ? "İlişki +8." : "Bağ kesme emri ilişki artışını engelledi."} Taviz: nüfuz +3, kontrol −10, öfke +8, şüphe +2.`, "command");
    }
  }
  if (action === "contain") {
    p.trail = Math.max(0, p.trail - 30);
    if (p.trail === 0) p.trailOpenedDay = 0;
    s.suspicion += 2;
    log(s, `${name(id)} dosyasındaki kaynaklar çekildi: ${cost} AP, dosya −30 (şimdi ${p.trail}/100), şüphe +2. ${p.trail === 0 ? "Dosya kapandı; hedef kimliğinizi unutmadı." : "Dosyanın yaşı sıfırlanmadı."}`, "contain");
  }
  if (action === "hide") {
    s.suspicion -= 14;
    log(s, "İzler temizlendi: şüphe −14. Kaynak arayışları ve somut soruşturmalar değişmedi.", "hide");
  }
  return finish(s, cost);
}
function personalityNight(s, p, say, strengths) {
  const others = s.people.filter((q) => q.id !== p.id);
  const closest = [...others].sort((a, b) => relation(s, p.id, b.id) - relation(s, p.id, a.id))[0];
  if (p.personality === "authoritarian") {
    if (p.anger >= 30) {
      s.suspicion += 7;
      say(`${name(p.id)} otoriter karşı istihbarat baskısı kurdu. Şüphe +7.`);
    } else {
      p.power += 3;
      say(`${name(p.id)} otoritesini güçlendirdi. Nüfuz +3.`);
    }
  }
  if (p.personality === "opportunist") {
    const leader = [...others].sort((a, b) => strengths[b.id] - strengths[a.id])[0];
    const improved = improveRelation(s, p.id, leader.id, 8);
    p.power += 2;
    say(`${name(p.id)} fırsatçı olarak ${name(leader.id)} ile yakınlaşmak istedi. ${improved ? "İlişki +8." : "Bağ kesme emri yakınlaşmayı engelledi."} Nüfuz +2.`);
  }
  if (p.personality === "loyal") {
    if (relation(s, p.id, closest.id) >= 60) {
      closest.power += 2;
      p.power += 1;
      say(`${name(p.id)} sadık müttefiki ${name(closest.id)} için çalıştı. Dostuna +2, kendine +1 nüfuz.`);
    } else {
      improveRelation(s, p.id, closest.id, 6);
      p.power += 2;
      say(`${name(p.id)} en yakın temasını güçlendirmeye çalıştı. Bağ kesme yoksa ilişki +6; kendi nüfuzu +2.`);
    }
  }
  if (p.personality === "suspicious") {
    p.power += 1;
    say(`${name(p.id)} kuşkucu olarak bağlantıları denetledi. Nüfuz +1; sızıntı arayışında her gece iki aşama ilerler.`);
  }
  if (p.personality === "conciliatory") {
    const distant = [...others].sort((a, b) => relation(s, p.id, a.id) - relation(s, p.id, b.id))[0];
    const improved = improveRelation(s, p.id, distant.id, 8);
    p.power += 2;
    say(`${name(p.id)} uzlaşmak için ${name(distant.id)} ile görüştü. ${improved ? "İlişki +8." : "Bağ kesme emri ilişki artışını engelledi."} Nüfuz +2.`);
  }
  if (p.personality === "ambitious") {
    const behind = others.some((q) => strengths[q.id] > strengths[p.id]);
    p.power += behind ? 5 : 3;
    say(`${name(p.id)} kendi adaylığına yüklendi. ${behind ? "Geride olduğu için nüfuz +5." : "Nüfuz +3."}`);
  }
}
export function nextDay(state) {
  if (state.ended || state.ap > 0) return state;
  const s = structuredClone(state);
  const events = [];
  const say = (text) => { events.push(text); log(s, text, "night"); };
  for (const p of s.people) {
    if (p.attacked) {
      const other = s.people.filter((q) => q.id !== p.id)
        .sort((a, b) => relation(s, p.id, b.id) - relation(s, p.id, a.id))[0];
      const improved = improveRelation(s, p.id, other.id, 14);
      say(`${name(p.id)} baskıdan sonra ${name(other.id)} ile yakınlaşmak istedi. ${improved ? "İlişki +14." : "Bağ kesme emri bunu engelledi."}`);
    }
  }
  const transfers = transferPlans(s);
  for (const plan of transfers) {
    const donor = s.people.find((p) => p.id === plan.from);
    const receiver = s.people.find((p) => p.id === plan.to);
    donor.power -= 8;
    receiver.power += 8;
    donor.donated = true;
    say(`${name(donor.id)} müttefiki ${name(receiver.id)} için bir kez 8 nüfuz aktardı.`);
  }
  const strengths = Object.fromEntries(s.people.map((p) => [p.id, score(s, p)]));
  const openAtNight = new Set(s.people.filter((p) => p.trail > 0).map((p) => p.id));
  for (const p of s.people) {
    if (p.trail > 0) {
      const coalition = s.people.some((q) => q.id !== p.id && openAtNight.has(q.id) && relation(s, p.id, q.id) >= 60);
      const advance = coalition ? 14 : 8;
      p.trail = clamp(p.trail + advance);
      say(`${name(p.id)} somut soruşturması +${advance}: ${p.trail}/100.${coalition ? " Müttefikleriyle bilgi paylaşıyor." : ""}`);
    } else if (p.hunt > 0) {
      const progress = p.hunt + (p.personality === "suspicious" ? 2 : 1);
      if (progress >= 3) {
        openTrail(s, p, 12);
        say(`${name(p.id)} sızıntı bağlantısını kimliğinize kadar izledi. Somut dosya 12/100 açıldı; müdahale şu an 2 AP. Yeni dosya bu gece ayrıca ilerlemez.`);
      } else {
        p.hunt = progress;
        say(`${name(p.id)} gazetecilerin bağlantılarında size uzanan izlerden şüpheleniyor. Bir sonraki gece somut dosya açılabilir.`);
      }
    }
    personalityNight(s, p, say, strengths);
    if (p.anger >= 45) {
      p.control -= 8;
      say(`${name(p.id)} baskıya direniyor. Kontrol −8.`);
    }
    if (p.anger >= 65) {
      const f = p.files.find((f) => f.pressured && !f.exposed && !f.public);
      if (f) {
        f.exposed = true;
        p.control -= 12;
        say(`${name(p.id)} şantaj dosyasını kendisi açıkladı. Ek kontrol −12.`);
      }
    }
    p.anger = clamp(p.anger - 4);
    p.attacked = 0;
  }
  for (const p of s.people) {
    p.power = clamp(p.power);
    p.control = clamp(p.control);
  }
  s.suspicion = clamp(s.suspicion);
  s.night = events;
  if (s.day === DAYS || s.suspicion >= 100 || s.people.some((p) => p.trail >= 100)) {
    s.ended = true;
    return s;
  }
  s.day++;
  s.ap = 4;
  for (const p of s.people) {
    for (const f of p.files) {
      if (f.stage === "pending" && f.readyDay <= s.day) {
        f.stage = "raw";
        say(`${name(p.id)} / ${buildCase(s.seed, f.caseId).title}: takip belgeleri ulaştı.`);
      }
    }
  }
  return s;
}
export function commandInfo(s, id, target, kind) {
  const p = s.people.find((p) => p.id === id);
  const q = s.people.find((p) => p.id === target);
  if (!p || !q || id === target || !["break", "endorse"].includes(kind)) return { ok: false, reason: "Bir başka bakanı hedef seçin.", threshold: 0 };
  const personalCost = (kind === "break" && p.personality === "loyal") || (kind === "endorse" && p.personality === "ambitious") ? 10 : 0;
  const base = kind === "break" ? 35 + relation(s, id, target) / 2 : 45;
  const threshold = Math.min(95, Math.ceil(base + p.anger / 4 + personalCost));
  const blocked = reason(s, id, "command");
  if (blocked) return { ok: false, reason: blocked, threshold };
  if (kind === "break" && relation(s, id, target) <= 35) return { ok: false, reason: "Zaten uzaklar; bu emre gerek yok.", threshold };
  if (p.control < threshold) return { ok: false, reason: `Bu emir için kontrol en az ${threshold} olmalı. Mevcut: ${p.control}.`, threshold };
  if (kind === "endorse" && p.power < 15) return { ok: false, reason: "En az 15 nüfuz gerekli.", threshold };
  return { ok: true, reason: personalCost ? "Kişiliği nedeniyle eşik +10. Yine de emri kabul edecek." : "Emri kabul edecek.", threshold };
}
export function transferPlans(s) {
  if (s.day < 4) return [];
  return s.people.filter((p) => !p.donated && p.power >= 20 && p.personality !== "ambitious").flatMap((p) => {
    const target = s.people.filter((q) => q.id !== p.id && relation(s, p.id, q.id) >= 60 && score(s, q) - score(s, p) >= 18)
      .sort((a, b) => score(s, b) - score(s, a))[0];
    return target ? [{ from: p.id, to: target.id }] : [];
  });
}
export function forecast(s) {
  return s.ended ? [] : nextDay({ ...structuredClone(s), ap: 0 }).night;
}
export function outcome(s) {
  const investigator=s.people.find(p=>p.trail>=100);
  if(investigator)return {title:"Kaynağınız konuştu.",text:`${name(investigator.id)} soruşturmayı tamamladı. Şüphe seviyeniz %${s.suspicion} olsa da somut delil sizi açığa çıkardı.`,win:false};
  if (s.suspicion >= 100)
    return {
      title: "Gölge açığa çıktı.",
      text: "Karşı istihbarat sizi buldu. Kabine sizi görevden aldı.",
      win: false,
    };
  const top = Math.max(...s.people.map((p) => score(s, p))),
    leaders = s.people.filter((p) => score(s, p) === top);
  if (leaders.length > 1)
    return {
      title: "Kilitlenen kabine.",
      text: "İttifaklar dahil seçim güçleri eşit kaldı. Geçici yönetim kuruldu.",
      win: false,
    };
  const p = leaders[0];
  if (p.id !== s.backed)
    return {
      title: "Koltuk başkasının.",
      text: `${name(p.id)}, ${score(s, p)} seçim gücüyle başkan oldu. Desteklediğiniz isim kazanamadı.`,
      win: false,
    };
  if (p.control < 50 || p.anger >= 60)
    return {
      title: "Sizi geride bıraktı.",
      text: `${name(p.id)} başkan oldu; kontrolünüz %${p.control}, öfkesi %${p.anger}. İktidarı size bırakmadı. Kontrol en az 50, öfke 60'ın altında olmalı.`,
      win: false,
    };
  return {
    title: "İmzası onun. Kararı sizin.",
    text: `${name(p.id)}, ${score(s, p)} seçim gücüyle başkan. Kontrol %${p.control}, öfke %${p.anger}. Bu kez gölgede kalmayı başardınız.`,
    win: true,
  };
}
