# UI/UX Audit and Presentation Improvement Plan

Dokumen ini mencatat audit UI/UX dashboard Intent & Agent Management untuk persiapan presentasi ke koperasi atau calon pengguna web. Fokusnya adalah membuat aplikasi terlihat siap dipakai secara operasional, mudah dijelaskan saat demo, dan tidak menampilkan kontrol yang berisiko atau membingungkan pengguna non-teknis.

## Konteks Produk

Web ini adalah dashboard operasional untuk mengatur sistem AI chatbot, bukan landing page atau halaman marketing. Pengguna utama yang perlu dipikirkan:

- Admin/operator koperasi yang mengelola intent, action, sumber data, agent, semantic search, dan upload knowledge.
- Tim teknis internal yang perlu mengecek konfigurasi API, n8n workflow, dan session chat.
- Calon pengguna/customer yang melihat demo alur chatbot tanpa perlu tahu detail teknis collection/vector.

Karena itu UI harus terasa rapi, tenang, dan fungsional. Prioritasnya adalah navigasi jelas, tabel mudah dibaca, form tidak membingungkan, status error/success mudah dipahami, dan fitur berisiko tidak ditampilkan ke pengguna umum.

## Status UI Saat Ini

Hal yang sudah kuat:

- Routing sudah menggunakan `react-router-dom`, sehingga URL sesuai halaman dan lebih scalable.
- AI Chat menyimpan session dan pesan di `sessionStorage`, sehingga chat tidak hilang saat pindah halaman atau refresh di sesi browser yang sama.
- AI Chat tidak lagi meminta user memilih collection. Collection routing ditentukan oleh n8n/prompt logic, sesuai kebutuhan customer-facing chat.
- Vector Collections sudah disederhanakan menjadi upload Text/PDF saja.
- Tombol Sync Data sudah dihapus dari UI karena berisiko membuat duplicate vector rows.
- Form register collection sudah dihapus dari Vector Collections. Collection dibuat dari halaman Semantic Search.
- Tabel sudah memakai pagination client-side dengan opsi `10`, `25`, dan `50` rows per page.
- Confirmation delete sudah memakai modal custom, bukan default browser confirm.
- Struktur code sudah feature-based dan shared components cukup rapi.

## Masalah UX Yang Masih Terlihat

### 1. Beberapa wording masih terlalu teknis atau sudah tidak akurat

Contoh: deskripsi Semantic Search masih mengarah ke chat webhook, padahal AI Chat sudah tidak mengirim collection dari frontend. Untuk presentasi, wording yang tidak selaras bisa membuat mentor atau calon pengguna bingung.

Rekomendasi:

- Semantic Search dijelaskan sebagai registry collection untuk Action bertipe semantic search.
- AI Chat dijelaskan sebagai simulasi customer conversation yang routing collection-nya otomatis dari workflow.
- Vector Collections dijelaskan sebagai tempat mengisi knowledge ke collection yang sudah terdaftar.

Prioritas: tinggi.

### 2. AI Chat masih terlihat terlalu teknis di header

Session ID sekarang ditampilkan sebagai kode mentah. Untuk presentasi teknis ini berguna, tetapi perlu label yang jelas agar tidak terlihat seperti angka random.

Rekomendasi:

- Tambahkan label `Session ID`.
- Tambahkan tombol copy session ID.
- Pertahankan tombol reset chat, tetapi pastikan tooltip/label jelas bahwa reset membuat sesi baru.
- Tambahkan auto-scroll ke pesan terbaru setelah user mengirim pesan atau AI membalas.

Prioritas: tinggi untuk demo.

### 3. Vector Collections butuh empty state yang lebih jelas

Jika belum ada Semantic Search collection, user hanya melihat dropdown kosong. Untuk operator, ini bisa membingungkan.

Rekomendasi:

- Saat collection kosong, tampilkan pesan: `Belum ada collection. Buat collection dari halaman Semantic Search terlebih dahulu.`
- Tambahkan tombol navigasi ke Semantic Search.
- Disable upload Text/PDF sampai collection tersedia.
- Setelah upload berhasil, status success perlu menyebut collection tujuan agar user yakin data masuk ke tempat yang benar.

Prioritas: tinggi.

### 4. Tabel sudah berfungsi, tetapi bisa dibuat lebih company-grade

Tabel adalah komponen yang paling sering terlihat di semua halaman. Pagination sudah bagus, tetapi masih ada ruang polish.

Rekomendasi:

- Sticky table header saat isi tabel panjang.
- Konsistensi lebar kolom ID di semua resource.
- Empty state dibedakan antara data benar-benar kosong dan filter search tidak menemukan hasil.
- Action buttons tetap icon-based, dengan tooltip yang konsisten.
- Pertahankan rows per page `10`, `25`, `50`. Jangan tambahkan opsi `All` karena bisa berat kalau data membesar.

Prioritas: tinggi sampai sedang.

### 5. Modal form perlu polish kecil

Form modal sudah cukup usable, tetapi pengalaman input masih bisa dibuat lebih matang.

Rekomendasi:

- Selesai: autofocus ke field pertama saat modal dibuka.
- Selesai: tombol submit lebih spesifik, misalnya `Create Action` atau `Update Action`, bukan hanya `Save`.
- Selesai: disable field dan submit saat proses create/update sedang berjalan.
- Selesai: Escape key untuk close modal saat form tidak sedang menyimpan.
- Follow-up: relation dropdown yang panjang nanti bisa dibuat searchable select.

Prioritas: sedang. Status: implemented untuk polish inti.

### 6. Detail drawer masih basic

Detail drawer berguna untuk view cepat, tetapi bisa lebih informatif khususnya untuk demo relasi Intent -> Action -> Target.

Rekomendasi:

- Untuk Intent, tampilkan context dan action summary dengan layout yang lebih mudah dibaca.
- Untuk Action, tampilkan action type dan target semantic/external/agent secara jelas.
- Untuk JSON field, tampilkan format code block yang rapi.

Prioritas: sedang.

### 7. Loading dan error state masih perlu dibedakan lebih baik

Saat API gagal, user perlu tahu apakah masalahnya data kosong, API tidak tersedia, atau endpoint memang tidak didukung.

Rekomendasi:

- Loading table memakai skeleton row atau overlay tipis.
- Error API tampil sebagai status strip yang jelas, bukan sekadar teks umum.
- Unavailable endpoint tetap ditampilkan sebagai unsupported feature, bukan dianggap data kosong.

Prioritas: sedang.

## Rekomendasi Untuk Presentasi Besok

### Wajib sebelum presentasi

1. Rapikan wording Semantic Search, AI Chat, dan Vector Collections agar sesuai flow terbaru.
2. Tambahkan label `Session ID` di AI Chat dan pertahankan session ID untuk penjelasan memory chat.
3. Tambahkan auto-scroll chat ke pesan terbaru.
4. Tambahkan empty state Vector Collections saat belum ada collection.
5. Polish tabel ringan: sticky header dan empty state yang lebih jelas.

### Bagus kalau waktu cukup

1. Tambahkan copy session ID di AI Chat.
2. Tambahkan submit loading state di modal create/update.
3. Buat tombol submit modal lebih spesifik per resource.
4. Rapikan detail drawer untuk relasi Intent dan Action.

### Tunda setelah presentasi

1. Searchable relation dropdown.
2. Server-side pagination.
3. Role-based UI permission.
4. Audit log aktivitas user.
5. Dedicated knowledge viewer untuk melihat isi `n8n_vectors`, karena saat ini belum ada read endpoint resmi dari Swagger.

## Hal Yang Sebaiknya Tidak Diubah Dulu

- Jangan kembalikan collection selector di AI Chat. Untuk calon customer, AI harus otomatis menentukan knowledge/action dari prompt dan workflow.
- Jangan kembalikan Sync Data di UI. Tombol ini berisiko karena bisa membuat duplicate vector rows.
- Jangan buat halaman `n8n_vectors` palsu memakai mock data. Kalau belum ada endpoint, lebih baik jujur bahwa data knowledge detail belum bisa dibaca dari web.
- Jangan remake seluruh layout jadi analytics dashboard. Produk ini lebih cocok sebagai operational console.
- Jangan ubah terlalu banyak alignment tabel sebelum presentasi. Table pagination sudah cukup baik; polish harus kecil dan terukur.

## Narasi Demo Yang Disarankan

Alur demo untuk koperasi atau calon pengguna:

1. Buka halaman Intents untuk menunjukkan sistem bisa memetakan konteks pertanyaan user.
2. Buka Actions untuk menunjukkan setiap intent diarahkan ke target, misalnya Semantic Search, External Data, atau AI Agent.
3. Buka Semantic Search untuk menunjukkan registry collection knowledge.
4. Buka Vector Collections untuk upload knowledge Text/PDF ke collection yang dipilih.
5. Buka AI Chat untuk menunjukkan user cukup bertanya natural language tanpa memilih collection manual.
6. Jelaskan bahwa session chat dipisahkan dengan Session ID agar memory percakapan tidak bercampur.

Poin penting saat menjelaskan ke non-teknis:

- Customer tidak perlu memilih collection.
- Admin/operator yang mengatur knowledge dan intent dari dashboard.
- Workflow n8n menjalankan routing AI di belakang layar.
- Web tidak menampilkan tombol berisiko seperti Sync Data agar data vector tidak dobel.

## Target UX Akhir

Dashboard ini idealnya terasa seperti internal admin console yang siap dipakai:

- Navigasi jelas.
- Tabel ringkas dan tidak membuat halaman terlalu panjang.
- Form mudah dipahami.
- Error dan success state eksplisit.
- Chat demo terasa natural untuk customer.
- Fitur teknis tetap tersedia untuk tim internal, tetapi tidak mengganggu user umum.
