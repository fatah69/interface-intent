# Routing and AI Chat State Plan

Tanggal: 2026-06-02

## Tujuan

Meningkatkan navigasi dashboard dari state-based navigation menjadi route-based navigation memakai `react-router-dom`, sekaligus memastikan state AI Chat tidak hilang saat user pindah halaman.

Perubahan ini ditujukan untuk presentasi dan skalabilitas jangka panjang, berdasarkan kondisi codebase React/Vite saat ini, Swagger CRUD API `:8080`, ERD lokal, workflow n8n AI Chat, dan workflow n8n Vector Collections:

- URL berubah sesuai halaman aktif.
- Browser Back/Forward bekerja normal.
- Refresh tetap membuka halaman yang sama.
- AI Chat conversation tetap tersimpan saat pindah page.
- Customer tidak memilih collection secara manual; n8n menentukan collection dari prompt/chat logic.

## Masalah Saat Ini

Navigasi app saat ini disimpan di React state:

```jsx
const [active, setActive] = useState('intents');
```

Dampaknya:

- URL tetap `/` walaupun user pindah ke Actions, Semantic Search, Vector Collections, atau AI Chat.
- Browser Back/Forward tidak merepresentasikan halaman dashboard.
- Refresh selalu kembali ke initial active page.
- `ChatPage` unmount saat user pindah page, sehingga `messages`, `sessionId`, dan draft input hilang.

Di `App.jsx`, page aktif juga dirender dengan `key={active}`:

```jsx
<ActivePage key={active} ... />
```

Ini memperkuat perilaku reset karena React membuat instance page baru setiap active berubah.

## Target Routing

Gunakan `react-router-dom` dengan route bersih, bukan hash route.

Target route minimal:

| Route | Page |
| --- | --- |
| `/` | redirect ke `/intents` |
| `/intents` | Intents |
| `/actions` | Actions |
| `/external-data` | External Data |
| `/agents` | AI Agents |
| `/agent-utilities` | Agent Utilities |
| `/semantic-search` | Semantic Search |
| `/utilities` | Utilities |
| `/vector-collections` | Vector Collections |
| `/chat` | AI Chat |

Route map harus tetap terhubung ke key resource lama agar count, config, dan feature registry tetap stabil.

Contoh mapping:

```js
export const routeByModule = {
  intents: '/intents',
  actions: '/actions',
  externalData: '/external-data',
  agents: '/agents',
  mappings: '/agent-utilities',
  semanticSearches: '/semantic-search',
  utilities: '/utilities',
  vectorCollections: '/vector-collections',
  chat: '/chat',
};
```

## Target AI Chat State

AI Chat harus menyimpan conversation per browser session agar tidak hilang saat pindah page.

Untuk scope sekarang, gunakan `sessionStorage`, bukan backend chat history.

Key yang disarankan:

```text
intent-agent-ai-chat-session
```

Shape data:

```json
{
  "sessionId": "uuid-session",
  "messages": [
    { "role": "assistant", "content": "Halo, silakan kirim pesan untuk menguji AI." },
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

Payload chat tetap sederhana:

```json
{
  "chatInput": "pesan user",
  "message": "pesan user",
  "sessionId": "uuid-session"
}
```

Tidak ada `collection_name` atau `semantic_search_id` dari frontend AI Chat. Workflow n8n menentukan alur dari prompt/chat logic dan `action_id`.

Berdasarkan `Workflow AI Chatbot_Simple.json`, AI Chat workflow membaca tabel `intent` dan `action`:

```sql
SELECT 
    i.context, 
    i.action_id, 
    a.action_type,
    a.parameter_needed
FROM intent i
JOIN action a ON i.action_id = a.id;
```

LLM memilih tool berdasarkan prompt dan context dari query tersebut. Untuk semantic search, workflow memanggil child workflow `action-semantic_search` dengan input:

```json
{
  "action_id": "from AI",
  "input_user": "chatInput"
}
```

Jadi frontend AI Chat tidak perlu selector collection. Collection routing semantic search seharusnya terjadi di n8n/backend melalui `action_id` dan relasi `action.semantic_search_id -> semantic_search.id`.

## Session dan Memory

Workflow n8n `Workflow AI Chatbot_Simple.json` memakai memory key:

```text
{{ $('start').item.json.sessionId }}
```

Berarti conversation tidak bercampur selama frontend mengirim `sessionId` unik per chat session.

Untuk versi internal tanpa login, `sessionId` cukup. Untuk production dengan auth, pola yang lebih kuat adalah:

```text
userId + conversationId
```

Scope perubahan saat ini tetap memakai `sessionId` karena backend chat history/user auth belum tersedia di ERD/API dashboard.

## Rencana Implementasi

### 1. Tambah dependency

Install:

```bash
npm install react-router-dom
```

### 2. Tambah route metadata

Update `src/config/resources.js` atau file config baru untuk mapping module key ke path.

Contoh data yang dibutuhkan:

```js
routeByModule
moduleByRoute
```

### 3. Update `main.jsx`

Wrap app dengan router:

```jsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
```

### 4. Update `App.jsx`

Ganti `active` state dengan `Routes`.

Prinsip:

- Data loading tetap di `App` agar semua page menerima `data`, `apiStatus`, `loading`, `loadData`, dan `setApiStatus`.
- Jangan pakai `key={active}` untuk page routing.
- Redirect `/` ke `/intents`.
- Fallback route redirect ke `/intents` atau tampilkan not found sederhana.

### 5. Update `Sidebar.jsx`

Ganti `button + onSelect` menjadi route navigation.

Pilihan implementasi:

- Pakai `NavLink` agar active class otomatis.
- Atau pakai `useLocation` + `useNavigate` agar struktur button tetap sama.

Disarankan memakai `NavLink` atau `useNavigate` dengan path dari `routeByModule`.

Count sidebar tetap diambil dari `data` seperti sekarang.

### 6. Persist AI Chat state

Update `src/features/ai-chat/Page.jsx`:

- Load initial state dari `sessionStorage`.
- Generate `sessionId` hanya kalau belum ada.
- Simpan `messages` dan `sessionId` ke `sessionStorage` setiap berubah.
- Reset chat menghapus storage dan membuat `sessionId` baru.
- Optional: simpan draft input kalau diperlukan, tapi untuk presentasi tidak wajib.

### 7. Verifikasi production fallback

`server-setup/prod-server.mjs` sudah fallback ke `dist/index.html` untuk path yang tidak ditemukan, sehingga `BrowserRouter` aman untuk PM2 `npm start`.

`server-setup/nginx-interface-intent.conf` juga sudah punya:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Jadi direct refresh route seperti `/chat` aman selama deploy memakai config tersebut atau server fallback setara.

### 8. Update dokumentasi

Update dokumen terkait:

- `README.md`
- `docs/UI_UX_PLAN.md`
- `docs/PANDUAN_PENGERJAAN.md`

Catatan yang perlu masuk:

- Navigation memakai `react-router-dom`.
- AI Chat state dipersist via `sessionStorage`.
- AI Chat tidak mengirim collection selector.

## Risiko dan Mitigasi

| Risiko | Mitigasi |
| --- | --- |
| Direct refresh `/chat` 404 di production | `prod-server.mjs` sudah fallback ke `index.html`; cek Nginx jika dipakai. |
| Sidebar active state salah | Gunakan route mapping tunggal dari module key ke path. |
| Chat state terlalu lama tersimpan | Pakai `sessionStorage`, bukan `localStorage`; reset chat clear storage. |
| Memory n8n bercampur | Pastikan `sessionId` unik dan tetap dikirim ke n8n. Workflow `Workflow AI Chatbot_Simple.json` sudah memakai `sessionId` sebagai custom memory key. |
| AI salah collection setelah selector frontend dihapus | Pastikan child workflow `action-semantic_search` lookup `action_id` ke target semantic search/collection. Frontend tidak lagi mengirim collection. |
| Tambah dependency gagal di server | Commit `package.json` dan `package-lock.json`, lalu jalankan `npm install` di server setelah pull. |

## Acceptance Criteria

- URL berubah saat klik sidebar.
- `/chat` bisa dibuka langsung dan setelah refresh tetap di AI Chat.
- Browser Back/Forward berpindah antar halaman dashboard.
- Chat tidak hilang saat pindah dari `/chat` ke page lain lalu balik ke `/chat`.
- Reset chat membuat `sessionId` baru dan menghapus conversation tersimpan.
- AI Chat payload hanya berisi `chatInput`, `message`, dan `sessionId`.
- Vector Collections tetap punya dropdown collection untuk upload Text/PDF.
- `npm run build` lolos.

## Urutan Eksekusi yang Disarankan

1. Install `react-router-dom`.
2. Implement route metadata.
3. Refactor `main.jsx`, `App.jsx`, dan `Sidebar.jsx`.
4. Implement `sessionStorage` di AI Chat.
5. Update docs.
6. Jalankan `npm run build`.
7. Test lokal dengan `npm run dev`:
   - buka `/chat`, kirim pesan, pindah page, balik lagi.
   - test refresh di `/chat`.
   - test browser Back/Forward.
8. Push.
9. Di server: pull, `npm install`, `npm run build`, restart PM2.
