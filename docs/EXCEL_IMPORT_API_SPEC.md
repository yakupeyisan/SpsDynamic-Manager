# Excel ile Personel İçe Aktarım API Spesifikasyonu

Frontend, Excel dosyasından okunan satırları bu dokmandaki formatta **POST** ile backend'e gönderir. Backend bu isteği alıp personel ve (varsa) kart kayıtlarını oluşturmalı/güncellemeli.

---

## Endpoint

```
POST /api/Employees/ImportXls
```

**Content-Type:** `application/json`

---

## İstek gövdesi (Request Body)

```json
{
  "records": [
    {
      "Employee.Name": "HÜLYA",
      "Employee.SurName": "ADAŞ YAĞIZ",
      "Employee.IdentificationNumber": "47536692248",
      "Employee.Company": "ABC Şirketi",
      "Employee.Kadro": "Tam Zamanlı",
      "Employee.Department": "YENİ, İK",
      "Employee.AccessGroup": "Kampüs Giriş, Otopark",
      "CustomField.CustomField01": "25520100006",
      "CustomField.CustomField02": "FEN BİLİMLERİ ENSTİTÜSÜ",
      "CustomField.CustomField03": "BAHÇE BİTKİLERİ (YL)",
      "Employee.WebClientAuthorizationId": "SanalPOS",
      "Card.CardTypeID": "MIFARESECTOR",
      "Card.CafeteriaGroupID": "OGRENCI",
      "Card.CardCodeType": "Wiegand26",
      "Card.Status": "1",
      "Card.CardUID": ""
    }
  ],
  "addUnknownCompanyToCheck": false,
  "addUnknownDepartmentToCheck": false,
  "addUnknownKadroToCheck": false,
  "addUnknownAccessGroupToCheck": false
}
```

| Alan | Tip | Açıklama |
|------|-----|----------|
| **records** | `object[]` | Her eleman tek bir Excel satırından üretilmiş kayıt. Anahtarlar **önekli** (aşağıda açıklandı). |
| **addUnknownCompanyToCheck** | `boolean` | Firma listede yoksa "kontrol edilecek" grubuna eklensin mi. |
| **addUnknownDepartmentToCheck** | `boolean` | Departman yoksa "kontrol edilecek"e eklensin mi. |
| **addUnknownKadroToCheck** | `boolean` | Kadro yoksa "kontrol edilecek"e eklensin mi. |
| **addUnknownAccessGroupToCheck** | `boolean` | Erişim grubu yoksa "kontrol edilecek"e eklensin mi. |

---

## Records içindeki anahtar formatı (önekler)

Frontend her eşlenen alanı şu öneklerle gönderir. Backend bu öneklere göre alanı **Personel**, **Özel Alan** veya **Kart** tarafına yazmalıdır.

### 1. `Employee.*` — Kişi (Personel) alanları

- Anahtarlar: `Employee.{AlanAdi}` (örn. `Employee.Name`, `Employee.SurName`, `Employee.IdentificationNumber`, `Employee.Company`, `Employee.Kadro`, `Employee.Department`, `Employee.AccessGroup`, `Employee.WebClientAuthorizationId` vb.)
- İşlem: Değerler **Employee** (personel) entity’sine yazılır. Alan adı önekten sonraki kısımdır (örn. `Employee.Name` → `Name`).
- **Firma:** `Employee.Company` — **Her zaman firma adı (metin)** gelir; ID hiç gönderilmez. Kullanıcı Excel’de sadece firma adını girer. Backend bu metni firma listesinde (örn. PdksCompanyName) eşleyip ilgili PdksCompanyID’yi atamalıdır. `addUnknownCompanyToCheck` true ise listede yoksa “kontrol edilecek”e eklenir.
- **Kadro:** `Employee.Kadro` — **Her zaman kadro adı (metin)** gelir; ID hiç gönderilmez. Kullanıcı Excel’de sadece kadro adını girer. Backend bu metni kadro listesinde eşleyip ilgili ID’yi atamalıdır. `addUnknownKadroToCheck` true ise bilinmeyen kadro “kontrol edilecek”e eklenir.
- **Departman:** `Employee.Department` — Departman adı veya adları. **Birden fazla departman virgül (,) ile ayrılarak** tek string içinde gönderilebilir (örn. `"YENİ, İK, Muhasebe"`). Backend virgüle göre ayırdıktan sonra **her parçanın sağındaki ve solundaki boşlukları trim etmelidir**; böylece `"YENİ , İK , Muhasebe"` gibi yazımlar da doğru eşlenir. Sonrasında her bir değeri listeden eşleyerek personel–departman ilişkisini kurmalıdır. `addUnknownDepartmentToCheck` true ise listede yoksa “kontrol edilecek”e eklenir.
- **Erişim Grubu:** `Employee.AccessGroup` — Erişim grubu adı veya adları. **Birden fazla erişim grubu virgül (,) ile ayrılarak** tek string içinde gönderilebilir (örn. `"Kampüs Giriş, Otopark"`). Backend virgüle göre ayırdıktan sonra **her parçanın sağındaki ve solundaki boşlukları trim etmelidir**; böylece `"Kampüs Giriş , Otopark"` gibi yazımlar da doğru eşlenir. Sonrasında her bir değeri listeden eşleyerek personel–erişim grubu ilişkisini kurmalıdır. `addUnknownAccessGroupToCheck` true ise listede yoksa “kontrol edilecek”e eklenir.

### 2. `CustomField.*` — Özel alanlar

- Anahtarlar: `CustomField.CustomField01` … `CustomField.CustomField20`
- İşlem: Değerler personelin **özel alan** (CustomField) kolonlarına yazılır. `CustomField.CustomField01` → CustomField01 alanı.

### 3. `Card.*` — Kart alanları

- Anahtarlar: `Card.{AlanAdi}` (örn. `Card.CardTypeID`, `Card.CafeteriaGroupID`, `Card.CardCodeType`, `Card.CardCode`, `Card.CardUID`, `Card.Plate`, `Card.Status`, `Card.CardDesc`, `Card.FacilityCode`, `Card.CardStatusId` vb.)
- İşlem: Bu satırda bir **kart** kaydı da oluşturulacaksa (veya güncellenecekse), değerler o kart kaydına yazılır. Alan adı önekten sonraki kısımdır (örn. `Card.CardUID` → `CardUID`).
- Bir Excel satırı = bir personel + isteğe bağlı olarak **bir kart**. Kart alanları doluysa backend ilgili personel için kart kaydı oluşturmalı/güncellemeli.

---

## Örnek tek kayıt (açıklamalı)

```json
{
  "Employee.Name": "HÜLYA",
  "Employee.SurName": "ADAŞ YAĞIZ",
  "Employee.IdentificationNumber": "47536692248",
  "Employee.Company": "ABC Şirketi",
  "Employee.Kadro": "Tam Zamanlı",
  "Employee.Department": "YENİ, İK",
  "Employee.AccessGroup": "Kampüs Giriş, Otopark",
  "CustomField.CustomField01": "25520100006",
  "CustomField.CustomField02": "FEN BİLİMLERİ ENSTİTÜSÜ",
  "CustomField.CustomField03": "BAHÇE BİTKİLERİ (YL)",
  "Employee.WebClientAuthorizationId": "SanalPOS",
  "Card.CardTypeID": "MIFARESECTOR",
  "Card.CafeteriaGroupID": "OGRENCI",
  "Card.CardCodeType": "Wiegand26",
  "Card.Status": "1",
  "Card.CardUID": ""
}
```

- **Employee.** → Personel: Ad, Soyad, TC No, **Firma (Company)** ve **Kadro** yalnızca **ad (metin)** olarak gelir, ID gönderilmez. **Departman** ve **Erişim Grubu** virgül (,) ile ayrılmış çoklu değer olabilir.
- **CustomField.** → Özel alan 01, 02, 03.
- **Card.** → Bu personel için kart: Kart tipi, Kafeterya grubu, Kart kullanım tipi, Durum, CardUID vb.

---

## Veri tipleri

- Gönderilen değerler çoğunlukla **string** (Excel’den metin olarak okunur).
- Checkbox/boolean alanlar frontend’de şu değerlere çevrilir: `"1"`, `"true"`, `"evet"`, `"Evet"` → `true`; aksi halde → `false`. Backend boolean alanları buna göre işleyebilir.
- Boş hücreler **boş string** (`""`) olarak gelir.

---

## Backend’in yapması gerekenler (kısa özet)

1. **POST /api/Employees/ImportXls** ile gelen `records` dizisini işle.
2. Her kayıt için:
   - `Employee.*` anahtarlarını personel entity’sine yaz. `Company` ve `Kadro` **her zaman ad (string)** gelir; backend isimden ID çözümlemelidir. `Department` ve `AccessGroup` virgül (,) ile ayrılmış çoklu değer olabilir; backend virgüle göre bölüp **her parçanın başındaki ve sonundaki boşlukları trim ederek** her birini eşleyecektir.
   - `CustomField.CustomField01` … `CustomField.CustomField20` değerlerini personelin özel alanlarına yaz.
   - `Card.*` anahtarları varsa bu personel için kart kaydı oluştur/güncelle; anahtarları önek sonrası alan adıyla (CardTypeID, CardUID, Plate, Status vb.) kart entity’sine yaz.
3. `addUnknownCompanyToCheck`, `addUnknownDepartmentToCheck`, `addUnknownKadroToCheck`, `addUnknownAccessGroupToCheck` bayraklarını kullanarak “yoksa kontrol edilecek” mantığını uygula (mevcut iş kuralına göre).
4. Hata durumunda uygun HTTP status ve `message` ile cevap ver; frontend `err?.error?.message` veya `err?.message` gösterir.

Bu dokmanı backend’e vererek Excel içe aktarım işlemini doğrudan bu spesifikasyona göre implemente edebilirler.
