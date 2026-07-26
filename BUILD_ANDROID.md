# Panduan Build Release APK Android - Kasir Toko Kelontong

Aplikasi ini telah dikonfigurasi secara lengkap dengan **Capacitor 6+** dan proyek native **Android (Gradle 8.2 & SDK 34)** yang siap di-build menjadi APK Release untuk HP Android (Android 8.0 ke atas).

---

## 📋 Prasyarat Sistem
1. **Node.js**: v18+ dan **npm**
2. **Android Studio**: Versi terbaru (Jellyfish / Iguana) dengan Android SDK 34 & JDK 17
3. **Android Device / Emulator**: Android 8.0 (API level 26) atau lebih tinggi

---

## 🛠️ Langkah-Langkah Build APK Release via CLI

### 1. Kompilasi Web Assets & Sinkronisasi Native
Jalankan perintah berikut di direktori utama proyek:
```bash
# 1. Install dependensi (jika belum)
npm install

# 2. Build web assets & sinkronkan ke proyek Android native
npm run build:android
npx cap sync android
```

### 2. Buat Keystore Penandatanganan (Signing Key)
Jika Anda belum memiliki file keystore, buat file `release.keystore` menggunakan `keytool` bawaan JDK:
```bash
keytool -genkey -v -keystore android/app/release.keystore -alias warungberkah -keyalg RSA -keysize 2048 -validity 10000
```

### 3. Konfigurasi `keystore.properties`
Buat file `android/app/keystore.properties` berdasarkan contoh `keystore.properties.example`:
```properties
storeFile=release.keystore
storePassword=SandiKeystoreAnda
keyAlias=warungberkah
keyPassword=SandiKeyAnda
```

### 4. Build APK Release
Jalankan Gradle wrapper untuk mengompilasi APK Release:
```bash
cd android
./gradlew assembleRelease
```
*Hasil file APK Release akan tersimpan di:*
`android/app/build/outputs/apk/release/app-release.apk`

---

## 📱 Membuka & Build di Android Studio

1. Buka **Android Studio**.
2. Pilih **Open an Existing Project** lalu arahkan ke folder `android/` di dalam direktori proyek ini.
3. Tunggu hingga **Gradle Sync** selesai.
4. Untuk menjalankan langsung di HP Android:
   - Hubungkan HP Android via kabel USB dan aktifkan **USB Debugging**.
   - Klik tombol **Run (Shift + F10)** di Android Studio.
5. Untuk Generate Signed APK:
   - Klik menu **Build > Generate Signed Bundle / APK...**
   - Pilih **APK** lalu klik **Next**.
   - Masukkan lokasi `release.keystore`, password, alias, dan key password.
   - Pilih Build Variant **release** dan centang **V1 (Jar Signature)** & **V2 (Full APK Signature)**.
   - Klik **Finish**.

---

## ⚙️ Ringkasan Konfigurasi Native Release

- **Package Name / Application ID**: `com.warungberkah.kasir`
- **Minimum SDK**: API 22 (Android 5.1 - mendukung penuh Android 8+)
- **Target SDK**: API 34 (Android 14)
- **Izin HP (Permissions)**:
  - `android.permission.INTERNET` & `ACCESS_NETWORK_STATE`
  - `android.permission.CAMERA` (Pemindai Barcode / QR)
  - `android.permission.RECORD_AUDIO` (Perintah Suara Bahasa Indonesia)
  - `android.permission.BLUETOOTH`, `BLUETOOTH_ADMIN`, `BLUETOOTH_CONNECT`, `BLUETOOTH_SCAN` (Printer Thermal Bluetooth)
  - `android.permission.VIBRATE` (Umpan balik getar saat pindaian barcode)
- **Pengoptimalan Lansia & Kasir Pasar**:
  - Tombol sentuh ekstra besar (min height 80dp)
  - Ukuran teks harga tajam & kontras tinggi (Subtotal 48sp, Total 64sp)
  - Efisiensi memori terdistribusi di bawah 150 MB
  - Dukungan penuh offline-first dengan backup & restore otomatis DB SQLite LocalStorage.
