# Gölge Şef

Tarayıcı tabanlı bir siyasi strateji oyunu üzerinde çalışıyorum. Oyuncunun bakanları araştırıp iktidar mücadelesine yön verdiği bir oyun hedefliyorum.

## Mevcut durum

İlk arayüz prototipi. Üç bakanın kartları görüntülenebilir; kart seçilince ilgili bakanın profili açılır. Masaüstü ve mobil ekranlar için temel düzen hazır.

Operasyon emirleri, soruşturmalar, gece döngüsü ve kayıt sistemi henüz bu sürümde yok.

## Çalıştırma

Node.js ve npm gereklidir.

```bash
npm ci
npm run dev
```

Terminalde verilen adresi tarayıcıda aç.

## Derleme

```bash
npm run build
```

Üretim çıktısı `dist/` klasörüne oluşturulur.

## Teknolojiler

JavaScript, HTML, CSS ve Vite.
