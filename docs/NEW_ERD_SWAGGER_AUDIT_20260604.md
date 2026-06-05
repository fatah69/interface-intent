# New ERD and Swagger Audit - 2026-06-04

Audit ini membandingkan state frontend saat ini dengan ERD baru dari `C:\Users\User\Downloads\erd.pdf` dan Swagger baru di `http://194.233.79.180:8080/swagger/index.html`.

Scope audit ini read-only terhadap API. Tidak ada request `POST`, `PUT`, atau `DELETE` yang dijalankan.

Update 2026-06-05: login test dilakukan dengan akun admin yang diberikan mentor. Credential tidak disimpan di repo. `POST /api/auth/login` berhasil dan response berisi field `token` serta `user`.

## Sumber

- Swagger UI: `http://194.233.79.180:8080/swagger/index.html`
- Swagger JSON: `http://194.233.79.180:8080/swagger/doc.json`
- ERD PDF: `C:\Users\User\Downloads\erd.pdf`
- Frontend current API target: `http://194.233.79.180:8080`
- Frontend current n8n target: `http://103.140.90.131:5678`

## Temuan Paling Penting

1. API baru sudah reachable, tetapi endpoint data utama mengembalikan `401 Unauthorized` tanpa token.
2. Swagger baru menambahkan auth, role, usecase, dan user-management endpoints: `/api/auth/login`, `/api/auth/register`, `/api/auth/me`, `/api/roles`, `/api/usecases`, `/api/users`, dan `/api/users/{id}/role`.
3. ERD baru menambahkan tabel `user`, `role`, `usecase`, dan `user_usecase`.
4. Endpoint native Vector Collections sekarang tersedia di Swagger: `GET /api/vector-collections`, `POST /api/vector-collections`, dan `POST /api/vector-collections/{uuid}/upload`.
5. Current migration decision tetap memakai Semantic Search sebagai registry action target. Upload Text/PDF sekarang memakai Swagger Vector Collection untuk menyimpan file asli/readable dan n8n `/vector-webhook` untuk indexing vector.
6. Enum `protocol_request` berubah atau terkoreksi menjadi `http_get`, `https_post`, dan `grpc`.
7. Intent sekarang punya `usecase_id` di ERD/Swagger. Migration branch menambahkan dropdown Usecase dari `/api/usecases/`.

Update Swagger 2026-06-05: Swagger sekarang juga menampilkan `GET /api/vector-collections/{uuid}` dengan summary `Mengalirkan file dari vector collection cmetadata`.

Update runtime 2026-06-05: response list API baru memakai wrapper `{ "data": [...] }`. Current frontend sudah punya `normalizeList()` yang mendukung wrapper ini. Migration branch juga sudah menambahkan auth/Bearer token handling.

Update Swagger/runtime 2026-06-05 setelah backend refresh: authenticated `GET /api/usecases/` dan `GET /api/users/` sudah `200`, sehingga Usecase Management dan admin-only User Management bisa mulai diimplementasikan di frontend.

## Keputusan Migrasi Sementara

Keputusan ini perlu dipakai sebagai batas implementasi agar flow tidak tertukar:

- API Swagger yang dituju migration branch adalah `http://194.233.79.180:8080`, bukan lagi legacy `http://172.16.210.244:8080`.
- Auth wajib: login dulu lewat `/api/auth/login`, lalu kirim `Authorization: Bearer <token>` untuk semua CRUD Swagger.
- Endpoint Swagger `/api/vector-collections` dipakai untuk read/list/inspect collection yang sudah ada.
- Upload knowledge Text/PDF sekarang memakai dua jalur: Swagger Vector Collection untuk menyimpan file asli/readable, lalu n8n `/vector-webhook` untuk chunking/vector indexing.
- Jika collection yang dipilih belum ada di Swagger Vector Collection, frontend membuatnya lewat `POST /api/vector-collections`, lalu upload file asli lewat `POST /api/vector-collections/{uuid}/upload`.
- Semantic Search tetap diperlakukan sebagai action target registry (`semantic_search_id`) selama ERD/API belum memberi relasi FK langsung ke `n8n_vector_collections`.

## Runtime Check GET-Only

Base API baru: `http://194.233.79.180:8080`.

| Endpoint | Method | Status tanpa token | Catatan |
| --- | --- | --- | --- |
| `/api/actions/` | `GET` | `401` | Auth diperlukan |
| `/api/ai-agents/` | `GET` | `401` | Auth diperlukan |
| `/api/external-data/` | `GET` | `401` | Auth diperlukan |
| `/api/intents/` | `GET` | `401` | Auth diperlukan |
| `/api/semantic-searches/` | `GET` | `401` | Auth diperlukan |
| `/api/utilities` | `GET` | `401` | Auth diperlukan |
| `/api/vector-collections` | `GET` | `401` | Auth diperlukan |
| `/api/usecases/` | `GET` | `401` | Auth diperlukan |
| `/api/users/` | `GET` | `401` | Auth diperlukan |
| `/api/roles/` | `GET` | `401` | Auth diperlukan |
| `/api/auth/me` | `GET` | `401` | Expected tanpa token |

Swagger mendefinisikan `BearerAuth` sebagai header `Authorization: Bearer <token>`. Runtime terlihat menerapkan auth ke semua endpoint data, walaupun security annotation di Swagger tidak muncul di semua operation.

## Auth Test 2026-06-05

Login endpoint:

```text
POST /api/auth/login
```

Payload shape:

```json
{
  "username": "admin",
  "password": "***"
}
```

Response shape:

```json
{
  "message": "Login successful",
  "token": "<jwt>",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "password": "",
    "role_id": 1
  }
}
```

Authenticated request header:

```text
Authorization: Bearer <jwt>
```

`GET /api/auth/me` response shape:

```json
{
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "password": "",
    "role_id": 1,
    "role": {
      "id": 1,
      "name": "admin",
      "description": "Administrator with full access"
    }
  }
}
```

### Authenticated GET Results

| Endpoint | Status with Bearer token | Response shape / note |
| --- | --- | --- |
| `/api/auth/me` | `200` | `{ data: user }` |
| `/api/actions/` | `200` | `{ data: [] }` |
| `/api/ai-agents/` | `200` | `{ data: [] }` |
| `/api/external-data/` | `200` | `{ data: [] }` |
| `/api/intents/` | `200` | `{ data: [] }` |
| `/api/semantic-searches/` | `200` | `{ data: [] }` |
| `/api/vector-collections` | `200` | `{ data: [] }` |
| `/api/usecases/` | `200` | `{ data: usecases[] }`; available after backend update |
| `/api/users/` | `200` | `{ data: users[] }`; available after backend update |
| `/api/roles` | `401` | Runtime path mismatch; see note below |
| `/api/roles/` | `200` | `{ data: roles[] }` |
| `/api/utilities/` | `401` | Runtime path mismatch; see note below |
| `/api/utilities` | `200` | `{ data: [] }` |
| `/api/vector-collections/` | `401` | Runtime expects no trailing slash |

Runtime path caveat: Swagger path slash behavior is inconsistent with live routing for some endpoints. Use exact working runtime paths during migration:

- Roles read works with `/api/roles/`, while Swagger lists `/api/roles`.
- Usecases read works with `/api/usecases/`, while `/api/usecases` returned `401` during latest routing checks.
- Users read works with `/api/users/`, while `/api/users` returned `401` during latest routing checks.
- Utilities read works with `/api/utilities`, while Swagger lists `/api/utilities/`.
- Vector Collections read works with `/api/vector-collections`, not `/api/vector-collections/`.

Do not assume all trailing slash variants are interchangeable on the new API.

### Additional Probes 2026-06-05

Initial usecase and user-management probes returned `404` before the backend refresh. After mentor updated the backend, latest authenticated probes confirm:

- `/api/usecases/` returns `200`.
- `/api/users/` returns `200`.

Conclusion: Usecase and User Management can be implemented from Swagger now. The join table `user_usecase` is represented through user payload field `usecase_ids`; there is no separate user-usecase CRUD page needed at this point.

JSON-like payload fields are defined as `string` in Swagger for the new API:

- `models.Action.parameter_needed`
- `models.AIAgent.header`
- `models.AIAgent.default_param`
- `models.ExternalData.header`
- `models.ExternalData.default_param`
- `models.N8nVectorCollection.cmetadata`

Current frontend already validates JSON text but sends it as a string. That matches the new Swagger model shape. ERD still labels those columns as `json/jsonb`, so backend likely parses or stores JSON-compatible string payloads.

Register behavior probe: `POST /api/auth/register` is public enough to accept requests without Bearer token. A malformed/empty payload returned `400`, but a payload without `role_id` unexpectedly returned `201` and created user `probe_no_create` with `role_id: null` and `id: 2`. Swagger now exposes user delete, but do not clean up probe rows without explicit approval because it is a write/delete action.

## Endpoint Swagger Baru

Endpoint yang terlihat di Swagger baru:

| Method | Endpoint | Status di current UI |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Implemented di migration branch |
| `POST` | `/api/auth/register` | Endpoint tersedia, tetapi tidak diekspos di UI dashboard agar create user tetap satu pintu lewat `/api/users` |
| `GET` | `/api/auth/me` | Implemented di migration branch |
| `GET` | `/api/roles` | Dipakai sebagai Roles page dan relation data Users; exact runtime path `/api/roles/` |
| `POST` | `/api/roles` | Dipakai dari admin-only Roles page |
| `GET/POST` | `/api/usecases` | Implemented sebagai Usecases page; exact runtime path `/api/usecases/` |
| `GET/PUT/DELETE` | `/api/usecases/{id}` | Implemented sebagai Usecases page |
| `GET/POST` | `/api/users` | Implemented sebagai admin-only Users page; exact runtime path `/api/users/` |
| `GET/PUT/DELETE` | `/api/users/{id}` | Implemented sebagai admin-only Users page |
| `PUT` | `/api/users/{id}/role` | Dipakai saat admin mengubah role user dari Users edit form |
| `GET/POST` | `/api/actions/` | Ada di UI, perlu token |
| `GET/PUT/DELETE` | `/api/actions/{id}` | Ada di UI, perlu token |
| `GET/POST` | `/api/ai-agents/` | Ada di UI, perlu token |
| `GET/PUT/DELETE` | `/api/ai-agents/{id}` | Ada di UI, perlu token |
| `POST` | `/api/ai-agent-utilities/` | Ada create-only di UI, perlu token |
| `GET/POST` | `/api/external-data/` | Ada di UI, perlu token |
| `GET/PUT/DELETE` | `/api/external-data/{id}` | Ada di UI, perlu token |
| `GET/POST` | `/api/intents/` | Ada di UI, perlu token, migration branch menambahkan `usecase_id` |
| `GET/PUT/DELETE` | `/api/intents/{id}` | Ada di UI, perlu token |
| `GET/POST` | `/api/semantic-searches/` | Ada di UI, perlu token |
| `GET/PUT/DELETE` | `/api/semantic-searches/{id}` | Ada di UI, perlu token |
| `GET/POST` | `/api/utilities/` | Ada di UI, perlu token |
| `GET` | `/api/vector-collections` | Dipakai UI untuk read/list/inspect collection |
| `GET` | `/api/vector-collections/{uuid}` | Dipakai tombol View File untuk membuka/download file asli |
| `POST` | `/api/vector-collections` | Dipakai saat upload ke collection yang belum punya row native Vector Collection |
| `POST` | `/api/vector-collections/{uuid}/upload` | Dipakai untuk upload original TXT/PDF file ke backend Swagger sebelum n8n indexing |

## Schema Baru dari Swagger

### Auth

`controllers.LoginInput`:

- `username: string`
- `password: string`

`controllers.RegisterInput`:

- `username: string`
- `email: string`
- `password: string`
- `role_id: integer`

`controllers.CreateRoleInput`:

- `name: string`
- `description: string`

`controllers.AssignRoleInput`:

- `role_id: integer`

### Existing Core Models

`models.Action`:

- `id: integer`
- `action_type: semantic_search | external_data | ai_agent`
- `semantic_search_id: integer`
- `external_data_id: integer`
- `ai_agent_id: integer`
- `parameter_needed: string` in Swagger, but ERD says `json`

`models.AIAgent`:

- `id: integer`
- `agent_name: string`
- `protocol_request: http_get | https_post | grpc`
- `host: string`
- `header: string` in Swagger, but ERD says `json`
- `default_param: string` in Swagger, but ERD says `json`

`models.ExternalData`:

- `id: integer`
- `protocol_request: http_get | https_post | grpc`
- `host: string`
- `header: string` in Swagger, but ERD says `json`
- `default_param: string` in Swagger, but ERD says `json`

`models.Intent`:

- `id: integer`
- `usecase_id: integer`
- `context: string`
- `action_id: integer`

`models.SemanticSearch`:

- `id: integer`
- `collection_name: string`

`models.Utility`:

- `id: integer`
- `key: string`
- `value: string`

`models.AIAgentUtility`:

- `id: integer`
- `ai_agent_id: integer`
- `utility_id: integer`
- `client_id: string`

### New / More Explicit Models

`models.Usecase`:

- `id: integer`
- `name: string`
- `description: string`
- `created_at: string`

`models.N8nVectorCollection`:

- `uuid: string`
- `name: string`
- `cmetadata: string` in Swagger, but ERD says `jsonb`

## ERD Baru

Tables extracted from the ERD PDF:

- `action`
- `ai_agent`
- `ai_agent_utility`
- `external_data`
- `intent`
- `n8n_vector_collections`
- `n8n_vectors`
- `semantic_search`
- `utility`
- `user`
- `role`
- `usecase`
- `user_usecase`

Enums extracted from ERD:

- `action_types`: `semantic_search`, `external_data`, `ai_agent`
- `protocol_requests`: `http_get`, `https_post`, `grpc`

Important relations visible in ERD:

- `action.semantic_search_id -> semantic_search.id`
- `action.external_data_id -> external_data.id`
- `action.ai_agent_id -> ai_agent.id`
- `ai_agent_utility.ai_agent_id -> ai_agent.id`
- `ai_agent_utility.utility_id -> utility.id`
- `intent.action_id -> action.id`
- `intent.usecase_id -> usecase.id`
- `n8n_vectors.collection_id -> n8n_vector_collections.uuid`
- `user.role_id -> role.id`
- `user_usecase.user_id -> user.id`
- `user_usecase.usecase_id -> usecase.id`

## Gap terhadap Frontend dan Status Migration Branch

### 1. Auth sekarang wajib

Audit awal menemukan frontend belum punya:

- Login page
- Token storage
- Authorization header di `src/api/client.js`
- Logout/session expired handling
- Protected route behavior

Status migration branch: auth foundation sudah ditambahkan. Login menyimpan Bearer token, `GET /api/auth/me` memuat profile, request `/api/*` mengirim `Authorization`, dan `401` memicu logout/session reset.

### 2. API target migration branch

Legacy dev proxy sebelumnya ke:

```text
http://194.233.79.180:8080
```

Migration branch sudah mengarahkan dev proxy dan production proxy default ke:

Untuk API baru, target perlu menjadi:

```text
http://194.233.79.180:8080
```

n8n chat dan vector upload tetap memakai target lama/current n8n sesuai keputusan project.

### 3. Intent perlu `usecase_id`

Audit awal menemukan `src/features/intents/config.js` hanya punya:

- `context`
- `action_id`

Swagger/ERD baru punya:

- `usecase_id`
- `context`
- `action_id`

Status migration branch: backend sudah expose `/api/usecases/`, dan Intent form/table sudah ditambah `usecase_id` relation. Existing rows tanpa usecase masih bisa terlihat di table, tetapi create/update Intent akan meminta Usecase sesuai ERD baru.

### 4. Protocol enum mismatch

Legacy UI:

```js
['http_get', 'http_post', 'http_put']
```

Swagger/ERD baru:

```js
['http_get', 'https_post', 'grpc']
```

Status migration branch: enum frontend sudah diubah ke `http_get`, `https_post`, dan `grpc`.

### 5. Vector Collections punya native API baru

Current UI flow:

1. Create Semantic Search collection.
2. Page Vector Collections mengambil `semantic_search.collection_name`.
3. Upload text/PDF ke n8n `/vector-webhook` by `collection_name`.

Swagger baru flow potensial:

1. `GET /api/vector-collections` menampilkan `uuid`, `name`, `cmetadata`.
2. `POST /api/vector-collections` membuat collection native.
3. `POST /api/vector-collections/{uuid}/upload` upload file native.

Keputusan terbaru: endpoint native Vector Collections dipakai untuk read/list/inspect, create collection metadata, upload original file, dan view/download file. Upload knowledge tetap juga dikirim ke n8n `/vector-webhook` setelah upload Swagger agar workflow Text/PDF yang aktif untuk chunking dan vector indexing tetap berjalan.

### 6. Semantic Search masih ada, tapi relasinya dengan Vector Collection belum FK

ERD tetap menunjukkan `semantic_search` hanya punya `id` dan `collection_name`. `n8n_vector_collections` punya `uuid`, `name`, `cmetadata`. Tidak terlihat FK langsung dari `semantic_search` ke `n8n_vector_collections`.

Jadi product decision masih perlu jelas:

- Apakah Semantic Search tetap registry action target?
- Apakah Vector Collections native API menjadi source of truth untuk upload knowledge?
- Apakah `semantic_search.collection_name` harus disinkronkan by name dengan `n8n_vector_collections.name`?

### 7. Roles/User/Usecase UI

ERD baru menambah authorization/domain scope:

- User punya role.
- User bisa punya banyak usecase lewat `user_usecase`.
- Intent terhubung ke usecase.

Status migration branch: Usecases page dan admin-only Users page sudah ditambahkan. Roles dipakai sebagai relation data untuk Users, tetapi belum dibuat sebagai sidebar page karena role CRUD biasanya lebih sensitif dan tidak diminta untuk flow presentasi saat ini.

## Rekomendasi Implementasi Bertahap

### Phase 0 - Clarification sebelum code

Tanya mentor/backend owner:

1. Credential login test untuk API baru apa? Done: admin credential diberikan mentor untuk local testing.
2. Apakah semua CRUD endpoint memang wajib Bearer token? Runtime menunjukkan iya untuk endpoint data.
3. Endpoint list `usecase` ada atau belum? Done: `/api/usecases/` sudah tersedia setelah backend update.
4. Vector upload text harus tetap lewat n8n atau akan ada native endpoint text? Decision: tetap n8n untuk Text/PDF upload.
5. Apakah `/api/vector-collections` menggantikan Semantic Search registration, atau hanya untuk knowledge storage? Decision terbaru: untuk knowledge storage/readable file, sedangkan Semantic Search tetap registry action target.
6. Apakah n8n chat target ikut pindah ke host baru atau masih target lama? Decision saat ini: AI Chat tetap pakai n8n lama/current.

### Phase 1 - Auth foundation

- Status: implemented di migration branch.

### Phase 2 - Align existing CRUD with new API

- Status: protocol enum updated.
- Status: Intent `usecase_id` relation added.
- Remaining: write smoke test create/update perlu dilakukan manual/local dengan cleanup plan karena menyentuh data API real.

### Phase 3 - Native Vector Collections decision

Keputusan sementara untuk migrasi:

- Tambah/read endpoint `/api/vector-collections` sebagai sumber inspect/list collection.
- Pakai `POST /api/vector-collections` untuk membuat row collection native saat belum ada UUID API untuk collection yang dipilih.
- Pakai `POST /api/vector-collections/{uuid}/upload` untuk menyimpan file asli/readable di backend Swagger.
- Tetap kirim upload Text/PDF ke n8n `/vector-webhook` setelah upload Swagger agar AI search tetap memakai workflow indexing existing.
- Jangan menghapus Semantic Search, karena `action.semantic_search_id` masih ada di ERD/Swagger dan dibutuhkan untuk action target.

Jika nanti backend native vector endpoint menjadi source of truth:

- Tambah endpoint config untuk `vectorCollections` di `src/api/client.js`.
- Vector Collections page ambil list dari `/api/vector-collections`, bukan dari Semantic Search.
- Upload PDF pakai `/api/vector-collections/{uuid}/upload`.
- Text upload tetap butuh keputusan: n8n lama, endpoint baru, atau disable.

Jika Semantic Search tetap source of truth:

- Keep current Semantic Search page.
- Keep Vector Collections picking `semantic_search.collection_name`.
- Native `/api/vector-collections` dipakai hanya untuk read/inspect collection jika diperlukan.

### Phase 4 - Usecase and role-aware UX

- Tambah usecase selector/filter setelah endpoint usecase tersedia.
- Intent form wajib memilih Usecase.
- Jika role membatasi data, UI perlu menampilkan state read-only/forbidden dengan copy yang jelas.

## Risiko yang Masih Perlu Dicek Manual

- Create/update/delete belum diuji otomatis karena API memakai data real. Lakukan manual smoke test dengan data disposable atau cleanup path.
- Existing Intent rows dari API lama mungkin belum punya `usecase_id`; edit row lama akan meminta Usecase agar sesuai ERD baru.
- Vector Collections upload tetap bergantung ke Semantic Search + n8n, bukan endpoint native upload Swagger.
- AI Chat tidak terdampak Swagger API, karena chat tetap lewat n8n `/chat-webhook`, bukan `/api/*`.

## Kesimpulan

Swagger dan ERD baru bukan sekadar ganti IP. Ini perubahan arsitektur kecil-menengah:

- API menjadi authenticated.
- Domain bertambah dengan role, user, dan usecase.
- Vector collection mulai diekspos sebagai API native.
- Intent mulai terikat ke Usecase.

Migration branch sudah mengerjakan urutan aman: auth dulu, enum/payload alignment, Usecase/User Management, lalu Vector Collections read-only inspect sambil menjaga upload n8n tetap berjalan.
