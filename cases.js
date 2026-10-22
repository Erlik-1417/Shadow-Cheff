import { randomGenerator, shuffled } from "./random.js";

function incident(id, minister, title, type, claim, verdict, explanation, records) {
  return {
    id, minister, title, type, claim, verdict, explanation,
    docs: records.map(([title, body], index) => ({ id: String.fromCharCode(97 + index), title, body })),
    answer: ["a", "b"],
  };
}

export const incidents = [
  incident("security-fund", "demir", "Kayıp operasyon ödeneği", "Para izi",
    "Operasyon bütçesi bakanın aile şirketine aktarılmış olabilir.", "guilty",
    "Ödenen K-41 hesabı, sicilde bakanın kardeşine ait olan Kuzey Güvenlik'e kayıtlı. Kamu ödeneği aile şirketine gitmiş.", [
      ["Kesinleşmiş ödeme", "11 Ekim · Operasyon fonundan K-41 hesabına 480.000 ₺ ödendi. Onay: Selim Demir."],
      ["Şirket sicili", "Kuzey Güvenlik · Tahsilat hesabı K-41 · Tek ortak Mert Demir; bakanın kardeşi."],
      ["İptal edilmiş fatura", "K-14 · 480.000 ₺ · İşlem iptal edildi. Ödeme yapılmadı."],
      ["Araç alım fişi", "Kamu garajı · K-42 · 48.000 ₺ · Farklı bütçe kalemi."],
      ["Muhbir notu", "Kuzey Güvenlik'in adını duydum. Hesap bilgisi veya işlem kaydı yok."],
    ]),
  incident("double-location", "demir", "İki yerdeki konvoy", "Zaman çelişkisi",
    "Bakanın konvoyu, resmî program dışındaki bir gözaltı merkezine gitmiş olabilir.", "guilty",
    "İmzalı program A-06 konvoyunu 21.10'da merkezde gösterirken aynı konvoyun doğrulanmış plaka kaydı gizli tesiste. Program gerçeği gizliyor.", [
      ["İmzalı konvoy programı", "12 Ekim 21.10 · A-06 konvoyu merkez binada. Beyan eden: Selim Demir."],
      ["Tesis plaka doğrulaması", "12 Ekim 21.10 · A-06 araçları Kuyu gözaltı tesisi kapısında. Saat ve plaka iki kamerayla doğrulandı."],
      ["Yakıt fişi", "A-60 · 12 Ekim 19.00 · Merkez garaj. Konvoy kodu farklı."],
      ["Eski sevk emri", "11 Ekim · A-06 için Kuyu tesisi ziyareti. Bir gün önceki kayıt."],
      ["Harita notu", "Merkez ve Kuyu tesisi arası 42 kilometre. Belirli bir yolculuğa ilişkin kayıt yok."],
    ]),
  incident("detention-edit", "demir", "Değiştirilen gözaltı emri", "Belge değişikliği",
    "Bir gazetecinin adı, onaydan sonra gözaltı listesine eklenmiş olabilir.", "guilty",
    "G-12 emrinin ilk imzalı sürümünde Ece Ural yok. Bakanın e-imzasıyla yayımlanan ikinci sürümde var; ekleme onaydan sonra yapılmış.", [
      ["G-12 / ilk sürüm", "13 Ekim 10.00 · Mahkeme onaylı liste: Ali Sarı, Bora Ak. İmza özeti 77A."],
      ["G-12 / dağıtılan sürüm", "13 Ekim 11.20 · Liste: Ali Sarı, Bora Ak, Ece Ural. Değişiklik sahibi: Selim Demir e-imzası. Ek mahkeme onayı yok."],
      ["G-21 listesi", "Ece Ural tanık olarak çağrılıyor. Gözaltı emri değil; farklı dosya."],
      ["Taslak notu", "İmzasız çalışma listesinde Ece Ural var. Dağıtım veya resmî onay bilgisi yok."],
      ["Yazıcı kaydı", "13 Ekim 11.30 · Üç sayfa yazdırıldı. İçerik ve belge numarası kayıtlı değil."],
    ]),
  incident("command-chain", "demir", "Kayıt dışı baskın", "Yetki zinciri",
    "Bakan, yetkisiz bir birime baskın talimatı vermiş olabilir.", "guilty",
    "Bakanın imzaladığı S-9 talimatı özel birime gönderilmiş; birimin aynı S-9 kodlu görev raporu talimatın uygulandığını gösteriyor.", [
      ["Özel kalem talimatı", "S-9 · Selim Demir imzalı: Denetim yetkisi olmayan Özel Birim, Birlik gazetesine gece girecek."],
      ["Birim görev raporu", "S-9 · 14 Ekim 02.00 · Özel kalemden gelen talimatla Birlik gazetesine girildi. Onay kodu ve imza doğrulandı."],
      ["Polis eğitim çizelgesi", "S-8 · Gece baskını tatbikatı. Birlik gazetesiyle bağlantısı yok."],
      ["Gazete teslim fişi", "14 Ekim · 300 gazete merkeze teslim edildi. Kolluk işlemi değil."],
      ["Telefon dökümü", "Özel kalemden birime arama var; görüşme içeriği kaydedilmemiş."],
    ]),
  incident("camera-wipe", "demir", "Silinen koridor kaydı", "Örtbas",
    "Bakanın ziyaretçi kaydını sildirdiği iddia ediliyor.", "guilty",
    "Silme emri E-72 kaydını hedefliyor. Bağımsız yedek aynı E-72 içinde bakanın kayıt dışı ziyaretçisini gösteriyor; silme emri bakanın hesabından çıkmış.", [
      ["Silme işlemi denetimi", "14 Ekim 23.05 · E-72 kaydı silindi. Talep: Selim Demir'in doğrulanmış yönetici hesabı. Gerekçe alanı boş."],
      ["Bağımsız kamera yedeği", "E-72 · 14 Ekim 22.40 · Selim Demir, ihale lobicisi Ferit Can'ı yasaklı özel koridora alıyor."],
      ["Bakım duyurusu", "Kamera bakımı 15 Ekim 08.00 için planlı. E-72 silme işlemini kapsamıyor."],
      ["E-27 kaydı", "14 Ekim 22.40 · Personel yemekhanesi. Farklı kamera ve kayıt."],
      ["Ziyaretçi dilekçesi", "Ferit Can görüşme talep etmiş. Talep tek başına görüşmenin yapıldığını kanıtlamaz."],
    ]),
  incident("public-route", "demir", "Sızdığı söylenen güzergâh", "Bilgi sızıntısı",
    "Bir güvenlik şirketinin gizli konvoy güzergâhını önceden bildiği ileri sürülüyor.", "clear",
    "Şirketin 10.00'daki mesajından önce güzergâh 09.00'da herkese açık trafik bülteninde yayımlanmış. Bu belgeler gizli bilgi sızıntısı iddiasını desteklemiyor.", [
      ["Trafik bülteni arşivi", "15 Ekim 09.00 · Güzergâh R-8 kamuya açık olarak yayımlandı. Yayın saati bağımsız arşivde doğrulandı."],
      ["Şirket mesajının aslı", "15 Ekim 10.00 · R-8 için personel görevlendirin. Mesaj başlığı ve sunucu saati doğrulanmış."],
      ["Saat bilgisi kesilmiş fotoğraf", "R-8 mesajının ekran görüntüsü. Tarih ve saat görünmüyor."],
      ["R-9 güvenlik planı", "GİZLİ · Farklı konvoyun ertesi günkü güzergâhı."],
      ["Şirket kartviziti", "Şirket sahibinin iletişim bilgileri. Bilginin ne zaman öğrenildiğini göstermiyor."],
    ]),
  incident("island-foundation", "arin", "Ada vakfı", "Para izi",
    "İhale geliri, bakanın yönettiği yurt dışı vakfına yönlendirilmiş olabilir.", "guilty",
    "Hazine dekontunun V-88 hesabı, Leyla Arın'ın kontrol ettiği Ada Eğitim Vakfı'nın sicil hesabıyla aynı. İhale geliri özel vakfa gitmiş.", [
      ["Hazine transfer dekontu", "11 Ekim · İhale teminat geliri · 720.000 ₺ · Alıcı hesap V-88. Onay: Leyla Arın."],
      ["Vakıf yararlanıcı kaydı", "Ada Eğitim Vakfı · Hesap V-88 · Nihai yararlanıcı ve tek imza yetkilisi Leyla Arın."],
      ["Bağış kampanyası", "Vakıf halka yardım çağrısı yapıyor. Belirli bir ödeme kaydı yok."],
      ["İade talimatı", "V-89 · 720.000 ₺ iade edildi. Hesap farklı."],
      ["Önceki yıl bilançosu", "V-88 · Önceki mali yıl toplamları. Bu yılın ihale transferini içermiyor."],
    ]),
  incident("bid-before-deadline", "arin", "Erken açılan teklif", "Bilgi sızıntısı",
    "Rakip teklif kapanıştan önce bakanın yakınındaki şirkete gösterilmiş olabilir.", "guilty",
    "Teklif kasası M-5 için 17.00'ye kadar kapalı olmalı. Bakanın özel hesabı M-5 içeriğini 15.20'de rakip şirkete iletmiş; tarih ve dosya aynı.", [
      ["Teklif kasası tutanağı", "12 Ekim · M-5 rakip teklifi · Kapanış 17.00. Öncesinde dış erişim yasak."],
      ["Doğrulanmış erişim günlüğü", "12 Ekim 15.20 · Leyla Arın'ın özel hesabı · M-5 teklif eki → Deniz Arın Finans. Teslim doğrulandı."],
      ["Kamu ihale ilanı", "M-5 projesinin genel tanıtımı. Rakip teklif tutarları yok."],
      ["Dosya yedeği", "M-50 · 15.20 · Farklı bir proje."],
      ["Kapanış sonrası e-posta", "12 Ekim 18.00 · Sonuç bildirimi bütün katılımcılara gönderildi."],
    ]),
  incident("tender-score", "arin", "Düzeltilen ihale puanı", "Belge değişikliği",
    "İhale tablosu, bakanın eski ortağını kazandırmak için değiştirilmiş olabilir.", "guilty",
    "İmzalı ilk tabloda Vera 61 puanda. Bakanın onayladığı son tabloda gerekçesiz 91'e yükseliyor; aynı T-16 dosyasında diğer firmalar değişmiyor.", [
      ["T-16 / komisyon tablosu", "13 Ekim · İmzalı ilk sonuç: Vera 61, Batı 84, Doruk 78. Komisyon yeniden değerlendirme istemedi."],
      ["T-16 / son onay", "13 Ekim · Leyla Arın e-imzasıyla Vera 91, Batı 84, Doruk 78. Değişiklik gerekçesi yok. Vera'nın ortağı bakanın eski iş ortağı."],
      ["T-61 değerlendirmesi", "Vera 91 puan. Ayrı ihale ve farklı hizmet."],
      ["İtiraz dilekçesi", "Batı şirketi sonuçtan memnun olmadığını yazmış. Değişiklik kanıtı yok."],
      ["Puanlama kılavuzu", "Genel değerlendirme ölçütleri. Belirli firmalara verilmiş puan içermiyor."],
    ]),
  incident("tax-intervention", "arin", "Durdurulan vergi denetimi", "Yetki zinciri",
    "Bakanın aile şirketine yönelik denetimi durdurduğu iddia ediliyor.", "guilty",
    "Leyla Arın imzalı D-33 durdurma emri, denetçinin aynı kodlu kapatma raporuna dayanak olmuş. Rapordaki şirket bakanın kardeşine ait.", [
      ["Bakanlık müdahale emri", "D-33 · Leyla Arın: Mavi Atlas denetimi gerekçe aranmadan kapatılacak. E-imza doğrulandı."],
      ["Denetçi kapanış raporu", "D-33 · Mavi Atlas, tek ortak Deniz Arın (bakanın kardeşi). Bakanlık emrine dayanılarak inceleme yapılmadan kapatıldı."],
      ["Denetim takvimi", "D-34 · Başka bir şirketin rutin incelemesi."],
      ["Muhasebeci görüşmesi", "Mavi Atlas muhasebecisi bakanlığa gelmiş. Görüşme içeriği bilinmiyor."],
      ["Vergi beyannamesi", "Şirket beyannamesini vermiş. Denetimin kimin emriyle durduğunu açıklamıyor."],
    ]),
  incident("erased-debt", "arin", "Silinen kamu alacağı", "Örtbas",
    "Bir şirketin kamu borcu kayıtlardan izinsiz silinmiş olabilir.", "guilty",
    "Yedek defter B-27 için 900.000 ₺ borç gösteriyor. Bakanın imzalı silme işlemi aynı borcu ödeme veya yasal terkin kararı olmadan kaldırmış.", [
      ["Mali defter yedeği", "14 Ekim 08.00 · B-27 · Doruk Holding kamu borcu 900.000 ₺. Tahsilat yok."],
      ["Değişiklik denetimi", "14 Ekim 10.00 · B-27 borcu silindi. Yetki: Leyla Arın e-imzası. Ödeme ve yasal terkin dayanağı bulunmuyor."],
      ["B-72 tahsilat makbuzu", "900.000 ₺ ödendi. Başka şirket ve hesap."],
      ["Af tasarısı", "Henüz oylanmamış borç affı önerisi. Yürürlükte değil."],
      ["Şirket açıklaması", "Borcumuz yoktur. Dayanak belge eklenmemiş."],
    ]),
  incident("interest-rumour", "arin", "Faiz kararı söylentisi", "Zaman çelişkisi",
    "Bakanın kardeşinin şirketi faiz kararını herkesten önce öğrenmiş olabilir.", "clear",
    "Faiz kararı 10.00'da kamuya açıklanmış; şirketin kesinleşmiş alımı 10.12'de. Erken sızıntı iddiasındaki 09.12 saati taslak emre ait, gerçekleşmiş işleme değil.", [
      ["Resmî faiz duyurusu", "15 Ekim 10.00 · Karar kamuya açıklandı. Yayın saati borsa arşiviyle doğrulandı."],
      ["Borsa gerçekleşme fişi", "Deniz Arın Finans · Kesinleşmiş alım 15 Ekim 10.12. 09.12 taslağı uygulanmamış ve iptal edilmiş."],
      ["İptal edilmiş emir taslağı", "15 Ekim 09.12 · Gerçekleşmedi. Bu belgeyi işlem fişi gibi kullanmayın."],
      ["Geçen haftaki işlem", "8 Ekim 09.12 · Farklı karar dönemi."],
      ["Anonim ihbar", "Şirket her şeyi önceden biliyordu. İşlem veya iletişim kanıtı yok."],
    ]),
  incident("port-consultant", "koray", "Liman danışmanı", "Para izi",
    "Diplomatik liman anlaşmasının komisyonu bakanın oğluna gitmiş olabilir.", "guilty",
    "L-19 anlaşma komisyonunun P-62 hesabına ödendiği dekont, Eren Koray'ın şirket siciliyle eşleşiyor. Bakanın onayıyla aile şirketine ödeme yapılmış.", [
      ["Anlaşma ödeme eki", "L-19 · Orhan Koray onaylı komisyon · 640.000 ₺ P-62 hesabına kesin olarak ödendi."],
      ["Danışmanlık sicili", "P-62 · Ufuk Danışmanlık · Tek ortak Eren Koray, bakanın oğlu."],
      ["Liman işletme faturası", "P-26 · 640.000 ₺ · Kamu işletmesinin bakım gideri."],
      ["Komisyon teklifi", "İmzasız ücret önerisi. Kesinleşmiş ödeme değil."],
      ["Gemi manifestosu", "L-19 limanına gelen yükler. Para veya şirket ortaklığı bilgisi yok."],
    ]),
  incident("secret-envoy", "koray", "Geceki büyükelçi", "Zaman çelişkisi",
    "Bakanın resmî olarak reddettiği bir görüşme yapılmış olabilir.", "guilty",
    "Bakanın imzalı beyanı 12 Ekim 22.00'de görüşme olmadığını söylüyor. Aynı saatli iki taraf imzalı tutanak görüşmeyi doğruluyor.", [
      ["Bakanın program beyanı", "12 Ekim 22.00 · Orhan Koray: Büyükelçi Soren ile hiçbir görüşme yapılmadı. E-imza doğrulandı."],
      ["Görüşme tutanağı", "12 Ekim 22.00 · Katılanlar Orhan Koray ve Büyükelçi Soren. İki imza da doğrulandı. Yer: özel konut."],
      ["Diplomatik davet", "13 Ekim 22.00 için davet. Görüşmenin gerçekleştiğini göstermiyor."],
      ["Konut ziyaretçisi", "12 Ekim 20.00 · Teknik personel girişi."],
      ["Şoförün tahmini", "Arabanın konuta gittiğini düşünüyorum. Yolcu ve saat doğrulanmadı."],
    ]),
  incident("protocol-clause", "koray", "Protokolün son maddesi", "Belge değişikliği",
    "Bakanın anlaşmaya onaysız bir üs maddesi eklediği iddia ediliyor.", "guilty",
    "Kabinenin onayladığı U-7 yalnızca ticari erişim veriyor. Bakanın imzaladığı son U-7 aynı limana askerî üs hakkı da ekliyor; ek kabine onayı yok.", [
      ["U-7 / kabine onayı", "13 Ekim · Madde 8: yalnızca ticari liman erişimi. Askerî kullanım yasak. Kabine imzaları tam."],
      ["U-7 / imzalı son metin", "13 Ekim · Orhan Koray imzalı Madde 8: ticari erişim ve askerî üs hakkı. Ek yetkilendirme kaydı yok."],
      ["U-8 taslağı", "Askerî tatbikat önerisi. İmzalanmamış farklı protokol."],
      ["Çevirmen faturası", "U-7 metni çevrildi. Madde içeriğini veya yetkiyi göstermiyor."],
      ["Gazete başlığı", "Liman anlaşması tartışılıyor. Metin karşılaştırması yok."],
    ]),
  incident("courier-abuse", "koray", "Diplomatik kurye", "Yetki zinciri",
    "Bakanın diplomatik hattı kişisel ticaret için kullandırdığı iddia ediliyor.", "guilty",
    "Orhan Koray'ın K-90 talimatı özel koleksiyonunu diplomatik hatta sokuyor. Aynı kodlu teslim kaydı, sandıkların şahsi alıcıya gümrüksüz ulaştığını doğruluyor.", [
      ["Kurye yetkilendirmesi", "K-90 · Orhan Koray e-imzası: Şahsi antika koleksiyonum diplomatik kurye olarak gönderilsin. Ticari gümrüğe bildirilmesin."],
      ["Kurye teslim defteri", "K-90 · Üç antika sandığı diplomatik mühürle özel alıcıya teslim edildi. Gümrük bildirimi yok; görevli imzası doğrulandı."],
      ["Resmî evrak çantası", "K-09 · Büyükelçiliğe gönderilen rutin resmî belgeler."],
      ["Müze envanteri", "Devlete ait antikaların listesi. K-90 sandıkları bu listede bulunmuyor; tek başına emir kanıtı değil."],
      ["Uçuş çizelgesi", "Kurye uçağının hareket saati. Yükün sahibi veya talimat veren yazmıyor."],
    ]),
  incident("missing-annex", "koray", "Kaybolan anlaşma eki", "Örtbas",
    "Bakanın bir liman taahhüdünü arşivden gizlice sildiği iddia ediliyor.", "clear",
    "A-44 kaydı silinmemiş; saklama planıyla yeni arşive taşınmış. Yeni arşivdeki aynı özetli ve eksiksiz kopya örtbas iddiasını desteklemiyor.", [
      ["Arşiv taşıma tutanağı", "14 Ekim · A-44 eski dizinden kaldırılıp yeni arşive taşındı. Yasal saklama planı 8B. Belge özeti 77DD. Silme değil taşıma işlemi; iki denetçi imzası doğrulandı."],
      ["Yeni arşiv teslim kaydı", "14 Ekim · A-44 · Özet 77DD · Bütün ekler eksiksiz. Denetçilerin erişimine açık. Taşıma planı 8B ile teslim alındı."],
      ["Eski arşiv ekranı", "A-44 bulunamadı. Ekran yalnızca eski dizini arıyor; yeni arşivi kapsamıyor."],
      ["A-45 silme talebi", "Henüz uygulanmamış farklı belge talebi. A-44 ile ilgili değil."],
      ["Diplomat notu", "Bir ekin eksik olduğu söyleniyor. Hangi arşivin kontrol edildiği yazmıyor."],
    ]),
  incident("published-draft", "koray", "Erken gönderilen anlaşma", "Bilgi sızıntısı",
    "Bakanın gizli anlaşma metnini bir lobiciye önceden verdiği ileri sürülüyor.", "guilty",
    "Z-3 metni 11.00'de kamuya açılmış. Bakanın doğrulanmış hesabı aynı özetli metni 09.30'da lobiciye göndermiş; gizlilik süresi dolmadan aktarım yapılmış.", [
      ["Kamu arşivi yayın kaydı", "15 Ekim 11.00 · Z-3 ticaret taslağı kamuya açıldı. Öncesinde gizli. Dosya özeti 9BC."],
      ["Lobici e-postasının aslı", "15 Ekim 09.30 · Gönderen: Orhan Koray'ın doğrulanmış özel hesabı. Ek Z-3, özet 9BC. Lobiciye teslim edildi."],
      ["Gizli Z-4 eki", "Dosya özeti 8AA. Z-3'ten farklı. Gönderildiğine dair kayıt yok."],
      ["Kamu bağlantısı mesajı", "15 Ekim 12.00 · Z-3 kamu bağlantısı bütün gazetelere gönderildi. Daha sonraki dağıtım."],
      ["Lobicinin kartı", "Bakanlıkla görüşme talebi var. Tek başına belge aktarımını kanıtlamaz."],
    ]),
];

export function drawCases(minister, random) {
  return shuffled(incidents.filter((event) => event.minister === minister), random)
    .slice(0, 3).map((event) => event.id);
}

export function buildCase(seed, incidentId) {
  const event = incidents.find((event) => event.id === incidentId);
  if (!event) return null;
  const salt = [...incidentId].reduce((sum, letter) => Math.imul(sum, 31) + letter.charCodeAt(0), 0);
  return {
    ...event,
    task: "İhbarı değerlendir: bağlantılı iki belgeyi seç, ardından iddianın desteklenip desteklenmediğine karar ver.",
    docs: shuffled(event.docs, randomGenerator(seed ^ salt)),
  };
}
