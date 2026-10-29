const translations = {
  "HAT DİNLENİYOR OLABİLİR": "THE LINE MAY BE MONITORED",
  "YETKİ / OMEGA": "AUTHORITY / OMEGA",
  "Operasyon masası": "Operations desk",
  "İşlem arşivi": "Action archive",
  "Operasyon rehberi": "Operations guide",
  "İktidarın": "Power has",
  "ışığı yoktur.": "no light.",
  "Birini başa getir.": "Put one of them in power.",
  "Sana bağlı kalmasını sağla.": "Make them depend on you.",
  "Adını geride bırakma.": "Leave no name behind.",
  "YETKİLİ PERSONEL DIŞINDA": "AUTHORIZED PERSONNEL ONLY",
  "İstihbarat Şefi": "Chief of Intelligence",
  "Kimlik: gizlenmiş": "Identity: hidden",
  "BAŞKENT / YER ALTI KATI": "CAPITAL / LOWER LEVEL",
  "ERİŞİM KISITLI": "RESTRICTED ACCESS",
  "OPERASYON: BOŞ KOLTUK": "OPERATION: EMPTY SEAT",
  "Kimse masum kalmayacak.": "No one stays innocent.",
  "Her emir bir iz bırakır.": "Every order leaves a trace.",
  "Başkan susuyor. Kabine bekliyor. Siz karar veriyorsunuz.": "The president is silent. The cabinet waits. You decide.",
  "Silinmemiş kayıtlar. Verilmiş emirler. Kaçınılmaz sonuçlar.": "Un erased records. Given orders. Inevitable results.",
  "SON TARİHE": "TIME LEFT",
  "GÜN": "DAY",
  "KALAN AP": "AP LEFT",
  "DEŞİFRE RİSKİ": "EXPOSURE RISK",
  "Belirlenmedi": "Not chosen",
  "ŞİFRELİ İŞLEM ARŞİVİ": "ENCRYPTED ACTION ARCHIVE",
  "GECE": "NIGHT",
  "MERKEZ": "DESK",
  "BU ODADA SÖYLENENLER BU ODADA KALIR.": "WHAT IS SAID HERE STAYS HERE.",
  "Yerel deneme": "Local mode",
  "KABİNE / İLİŞKİ AĞI": "CABINET / RELATION NETWORK",
  "GÖZETİMDEKİ İSİMLER": "NAMES UNDER WATCH",
  "SON GELİŞME": "LATEST UPDATE",
  "İzleri temizle": "Clean the traces",
  "Özel emir ver": "Give a special order",
  "Geceye geç": "Go to night",
  "Son gece · Kabineyi topla": "Final night · Gather the cabinet",
};

export function currentLanguage() {
  return localStorage.getItem("golge-sef-language") || "tr";
}

export function toggleLanguage() {
  const next = currentLanguage() === "tr" ? "en" : "tr";
  localStorage.setItem("golge-sef-language", next);
  return next;
}

export function applyLanguage(root, language = currentLanguage()) {
  if (language !== "en") return;
  const entries = Object.entries(translations).sort((a, b) => b[0].length - a[0].length);
  const translate = (value) => entries.reduce((text, [from, to]) => text.replaceAll(from, to), value);
  const walker = document.createTreeWalker(root, document.defaultView?.NodeFilter?.SHOW_TEXT || 4);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach((node) => { node.nodeValue = translate(node.nodeValue); });
  root.querySelectorAll("[aria-label]").forEach((node) => {
    node.setAttribute("aria-label", translate(node.getAttribute("aria-label")));
  });
}
