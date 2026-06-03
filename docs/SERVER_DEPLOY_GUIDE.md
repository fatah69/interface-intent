# Server Deploy Guide

Panduan ini dipakai untuk update app di server `172.16.210.244` yang dijalankan dengan PM2.

## Konteks Server

- Default Node server bisa v18.
- Project ini perlu Node v22.
- Gunakan `nvm use` atau `nvm use 22` sebelum install/build/restart PM2.
- PM2 process name: `interface-intent`.
- Folder project server:

```bash
~/interface-intent/interface-intent
```

## Urutan Deploy Yang Disarankan

Masuk server:

```bash
ssh litmas@172.16.210.244
```

Masuk folder project:

```bash
cd ~/interface-intent/interface-intent
```

Aktifkan Node versi project. Ini dilakukan sebelum install/build. Boleh sebelum atau sesudah `git pull`, tetapi paling aman dijalankan di awal sesi deploy supaya semua command setelahnya jelas pakai Node v22.

```bash
nvm use
node -v
npm -v
```

Kalau `nvm use` tidak memilih Node v22, jalankan:

```bash
nvm use 22
node -v
```

Pastikan `node -v` menampilkan v22 sebelum lanjut.

Cek working tree:

```bash
git status
```

Kalau hanya `package-lock.json` yang modified di server, biasanya itu hasil beda npm install di server. Karena source of truth ada di GitHub, restore lockfile server dulu:

```bash
git restore package-lock.json
```

Pull update terbaru:

```bash
git pull origin main
```

Install dependency sesuai lockfile. Untuk server/deploy, pakai `npm ci`, bukan `npm install`, supaya `package-lock.json` tidak ditulis ulang:

```bash
npm ci
```

Build production:

```bash
npm run build
```

Restart PM2:

```bash
pm2 restart interface-intent --update-env
```

Cek status dan log:

```bash
pm2 list
pm2 logs interface-intent --lines 50
```

Keluar dari logs:

```bash
Ctrl + C
```

## Command Ringkas

Kalau sudah yakin cuma deploy biasa:

```bash
cd ~/interface-intent/interface-intent
nvm use
node -v
git status
git restore package-lock.json
git pull origin main
npm ci
npm run build
pm2 restart interface-intent --update-env
pm2 list
```

## Kenapa `nvm use` di Awal?

`git pull` sendiri tidak butuh Node. Tetapi dependency install, build, dan PM2 environment butuh Node yang benar. Menjalankan `nvm use` di awal mengurangi risiko lupa dan membuat `npm ci`, `npm run build`, serta `pm2 restart --update-env` memakai Node v22.

## Kenapa `npm ci`, Bukan `npm install`?

Untuk server production/deployment:

- `npm ci` install persis dari `package-lock.json`.
- `npm ci` tidak mengubah lockfile.
- Hasil install lebih deterministic.
- Cocok untuk server, CI, dan deployment.

Gunakan `npm install` di lokal saat menambah dependency baru. Setelah dependency baru dipush, server cukup `npm ci`.

## Kalau `git pull` Gagal Karena `package-lock.json`

Error yang umum:

```text
Your local changes to the following files would be overwritten by merge:
  package-lock.json
```

Solusi untuk server deploy:

```bash
git restore package-lock.json
git pull origin main
```

Jangan commit perubahan `package-lock.json` dari server kecuali memang sengaja development di server, yang sebaiknya dihindari.

## Kalau Ada File Modified Selain `package-lock.json`

Jangan langsung restore semua. Cek dulu:

```bash
git status
git diff --stat
```

Kalau file selain `package-lock.json` berubah, pastikan itu bukan perubahan penting dari mentor/tim sebelum dihapus.

## Setelah Deploy

Buka web dan cek flow utama:

- Semantic Search list/load.
- Vector Collections pilih collection dan upload text/PDF.
- AI Chat kirim pesan.
- Saat AI Chat sedang loading, pindah page lalu balik; response dan draft harus tetap ada.

