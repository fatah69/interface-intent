# Employee Usecase Access and Assignment Plan

Tanggal: 2026-06-11

## Keputusan Terbaru

Setelah diskusi dengan mentor, employee tidak membuat usecase sendiri. Usecase dibuat dan di-assign oleh admin melalui User Management.

Frontend tetap menjaga UX dan RBAC:

- Employee tidak melihat menu `Users`, `Roles`, dan `Usecases` CRUD.
- Employee yang membuka `/users`, `/roles`, atau `/usecases` lewat URL langsung mendapat UI standar `403 Access Forbidden`.
- Setelah login baru, user diarahkan ke route aman `/intents`, bukan route admin dari sesi sebelumnya.
- Employee yang belum di-assign usecase tetap masuk dashboard, tetapi semua halaman konfigurasi non-admin menampilkan state jelas bahwa akun belum punya usecase assignment.
- Tidak ada public self-register dan tidak ada employee self-create usecase.

## Flow Login

### Admin

1. Login berhasil.
2. Redirect ke `/intents`.
3. Admin tetap melihat `Usecases`, `Roles`, dan `Users` di sidebar.
4. Admin membuat/menentukan usecase dan assign user lewat menu `Users`.

### Employee Sudah Punya Usecase

1. Login berhasil.
2. Redirect ke `/intents`.
3. Sidebar tidak menampilkan `Usecases`, `Roles`, dan `Users`.
4. Intent form memakai usecase dari assignment user atau data yang diizinkan API.

### Employee Belum Punya Usecase

1. Login berhasil.
2. Redirect ke `/intents`.
3. Sidebar tetap menyembunyikan `Usecases`, `Roles`, dan `Users`.
4. Semua halaman konfigurasi yang biasanya bisa dibuka employee menampilkan state `Akun belum di-assign ke usecase`.
5. Copy mengarahkan user untuk meminta admin menambahkan usecase dari User Management.
6. Tidak ada tombol create usecase untuk employee.

## Behavior Route Terlarang

Route admin-only untuk non-admin harus render UI standar `403 Access Forbidden`, bukan table kosong atau raw error.

Route yang termasuk admin-only saat ini:

- `/users`
- `/roles`
- `/usecases`

Komponen 403 harus menampilkan:

- Judul `403 Access Forbidden`.
- Pesan bahwa akun tidak punya izin.
- Role user saat ini.
- Tombol balik ke main menu `/intents`.
- Tombol logout sekunder.

## Implementasi Kode

File utama:

- `src/features/auth/access.js`: helper role, usecase assignment detection, dan module access.
- `src/templates/components/ForbiddenState.jsx`: UI standar 403.
- `src/templates/components/AssignmentRequiredState.jsx`: UI standar untuk employee tanpa usecase assignment.
- `src/App.jsx`: route guard admin-only dan default route `/intents`.
- `src/templates/components/Sidebar.jsx`: menu visibility memakai helper access yang sama dengan route guard.
- `src/features/usecases/config.js`: `adminOnly: true`.
- `src/features/intents/Page.jsx`: halaman Intent normal; state assignment diblokir dari route guard global.

## Test Plan

Jalankan:

```bash
npm run build
```

Manual test admin:

- Admin melihat `Usecases`, `Roles`, dan `Users`.
- Admin bisa membuka `/usecases`, `/roles`, dan `/users`.
- Admin bisa assign usecase ke user dari `Users` page.

Manual test employee dengan usecase:

- Sidebar tidak menampilkan `Usecases`, `Roles`, dan `Users`.
- Root `/` dan login baru masuk `/intents`.
- Direct URL `/usecases`, `/roles`, atau `/users` menampilkan `403 Access Forbidden`.

Manual test employee tanpa usecase:

- Login masuk `/intents`, bukan create usecase.
- Halaman Intents, Actions, External Data, AI Agents, Agent Utilities, Semantic Search, Utilities, Vector Collections, dan AI Chat menampilkan state bahwa akun belum di-assign usecase.
- Tidak ada tombol create usecase.
- Direct URL `/usecases`, `/roles`, atau `/users` tetap menampilkan `403 Access Forbidden`.

Manual test pergantian akun admin ke employee:

- Admin berada di `/users`, lalu logout.
- Login sebagai employee di browser/tab yang sama.
- Employee masuk `/intents`, bukan kembali ke `/users`.

## Acceptance Criteria

- Employee tidak melihat `Users`, `Roles`, dan `Usecases` CRUD di sidebar.
- Employee tidak bisa create usecase dari UI.
- Employee tanpa usecase melihat state assignment di semua route konfigurasi non-admin.
- Employee direct URL ke route admin-only mendapat UI `403 Access Forbidden`.
- Admin behavior untuk `Usecases`, `Roles`, dan `Users` tidak berubah.
- Login baru selalu mengarah ke `/intents`.
- `npm run build` berhasil.
