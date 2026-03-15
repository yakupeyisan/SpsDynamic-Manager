# Favicon dosyaları

Bu klasördeki dosyalar environment'daki `setting` değerine göre build/serve öncesi `src/favicon.ico` olarak kopyalanır.

- **Dosya adları:** `environment.ts` / `environment.prod.ts` içindeki `favicons` map'inde tanımlı (örn. `ordu.ico`, `turkAlman.ico`).
- **Varsayılan:** Ayara özel dosya yoksa `default.ico` kullanılır.
- En az bir favicon (tercihen `default.ico`) ekleyin; `npm run build` veya `npm start` öncesi script ilgili dosyayı `favicon.ico` olarak kopyalar.
