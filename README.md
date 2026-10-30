# Gölge Şef

Türkçe | [English](README_EN.md)

Türkçe, tarayıcı tabanlı siyasi strateji oyunu. Üç bakan arasındaki iktidar mücadelesinde bilgi topla, belgeleri incele ve destekleyeceğin adayı belirle. Oyun yedi gün sürer; her gün dört aksiyon puanın (AP) vardır.

## Kullanılan teknolojiler

JavaScript, Vite, HTML ve CSS. Testler için Node.js test runner kullanılır.

## Çalıştırma

Node.js ve npm kurulu olmalıdır.

```bash
npm ci
npm run dev
```

Terminalde verilen adresi tarayıcıda aç.

## Test ve derleme

```bash
npm test
npm run build
```

Derleme dosyaları `dist/` klasörüne oluşturulur.

## Oynanış

Her operasyonda başlangıç seçim güçleri 30–56, ilişkiler 20–75 arasında belirlenir. Bakanlara altı kişilik arketipinden üçü dağıtılır. On sekiz olaydan bakan başına üç farklı dosya gelir. Belgeleri eşleştirip ihbarın desteklenip desteklenmediğine karar verirsin.

Sızıntı önce kaynak arayışı başlatır. Şantaj kimliğini doğrudan açık eder. Somut soruşturmayı bastırmak dosyanın yaşına göre 2, 3 veya 4 AP harcar.

v0.4 kayıtları ayrı tutulur; önceki sürümlerin kayıtları silinmez.

## Mevcut durum

Proje geliştirme aşamasındadır. Oyun bu tarayıcıda otomatik kaydedilir. Firebase bağlantı adaptörü ve Firestore kuralları hazırdır; Firebase projesi oluşturulmadığı için bulut kayıt özelliği henüz etkin değildir.
