# Publishing Guide

## Prerequisites

1. **npm hesabınız olmalı**: https://www.npmjs.com/signup
2. **npm'de giriş yapmış olmalısınız**: `npm login`
3. **Scoped package için**: `@customizer` scope'una erişiminiz olmalı veya yeni bir scope oluşturmalısınız

## Yayınlama Adımları

### 1. npm'de Giriş Yapın

```bash
npm login
```

Kullanıcı adı, şifre ve email adresinizi girin.

### 2. Paket Adını Kontrol Edin

`@customizer/ui` adı zaten alınmış olabilir. Eğer öyleyse, `package.json` içindeki `name` alanını değiştirin:

```json
{
  "name": "@your-username/ui"  // veya "customizer-ui-placeholders"
}
```

### 3. Version Kontrolü

Yeni bir versiyon yayınlamadan önce version'ı artırın:

```bash
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

### 4. Build ve Test

```bash
npm run build
```

### 5. Yayınlama

**Scoped package için (önerilen):**
```bash
npm publish --access public
```

**Normal package için:**
```bash
npm publish
```

### 6. Yayınlama Sonrası Kontrol

```bash
npm view @customizer/ui
```

veya npmjs.com'da paketinizi kontrol edin:
https://www.npmjs.com/package/@customizer/ui

## Otomatik Yayınlama Scriptleri

### Windows için:
```bash
.\publish.bat
```

### Linux/Mac için:
```bash
chmod +x publish.sh
./publish.sh
```

## Sorun Giderme

### "Package name already exists" hatası
- Paket adını değiştirin veya scope kullanın

### "You must verify your email" hatası
- npm hesabınızdaki email'i doğrulayın

### "Insufficient permissions" hatası
- Scope için gerekli izinlere sahip olduğunuzdan emin olun
- Veya kendi scope'unuzu kullanın

## Paket Güncelleme

Yeni bir versiyon yayınlamak için:

1. Değişiklikleri yapın
2. Version'ı artırın: `npm version patch`
3. Yayınlayın: `npm publish --access public`

## Unpublish (Sadece 72 saat içinde)

Eğer yanlışlıkla yayınladıysanız:

```bash
npm unpublish @customizer/ui@1.0.0
```

**Not:** 72 saat sonra unpublish yapılamaz!
