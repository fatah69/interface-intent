# Vector Knowledge Backend

Backend Go untuk vector collection indexing: validasi input, ekstraksi PDF, chunking, Gemini embedding, dan replace isi knowledge di PostgreSQL PGVector.

Frontend memanggil backend ini melalui proxy `/vector-webhook`. Backend juga expose path API baru untuk pengujian langsung.

## Prasyarat

- Go 1.23+.
- PostgreSQL dengan extension `pgvector`.
- Akses ke database PGVector yang menyimpan tabel legacy `n8n_vector_collections` dan `n8n_vectors`.
- Google Gemini API key untuk embedding.

## Setup

```bash
cd backend
cp .env.example .env
```

Isi minimal:

```env
DB_HOST=<postgres host>
DB_PORT=5432
DB_USER=<postgres user>
DB_PASSWORD=<postgres password>
DB_NAME=<database name>
GEMINI_API_KEY=<Google Gemini API key>
```

Install dependency dan validasi:

```bash
go mod tidy
go test ./...
```

Jalankan server:

```bash
go run cmd/server/main.go
```

Default server: `http://localhost:8082`.

## Endpoints

### Health Check

```text
GET /health
```

### Upload Knowledge

```text
POST /api/vector-knowledge
POST /webhook/update-intent
```

Path `/webhook/update-intent` disediakan sebagai path runtime yang dipakai proxy frontend `/vector-webhook`.

Upload knowledge bersifat replace per `collection_name`: backend mempertahankan row `n8n_vector_collections`, menghapus semua row lama di `n8n_vectors` untuk collection tersebut, lalu memasukkan chunk/vector terbaru dalam satu transaksi.

Text JSON:

```bash
curl -X POST http://localhost:8082/api/vector-knowledge \
  -H "Content-Type: application/json" \
  -d '{
    "type": "text",
    "text": "isi knowledge yang akan diindex",
    "collection_name": "nama_collection"
  }'
```

PDF multipart:

```bash
curl -X POST http://localhost:8082/api/vector-knowledge \
  -F "type=pdf" \
  -F "collection_name=nama_collection" \
  -F "file=@dokumen.pdf;type=application/pdf"
```

### Sync Intent ke VectorDB

```text
PUT /api/vector-knowledge
PUT /webhook/update-intent
```

```bash
curl -X PUT http://localhost:8082/api/vector-knowledge \
  -H "Content-Type: application/json" \
  -d '{
    "collection_name": "nama_collection"
  }'
```

## Konfigurasi Indexing

Nilai default backend mengikuti konfigurasi workflow lama yang sudah dikonversi ke Go, dengan satu override dari arahan migrasi terbaru: PDF max size menjadi 20 MB.

| Setting | Backend default |
| --- | --- |
| Gemini model | `gemini-embedding-2` (`models/gemini-embedding-2` juga diterima) |
| Embedding batch size | `10` |
| Chunk size | `1000` |
| Chunk overlap | `200` |
| Text max length | `50000` karakter |
| PDF MIME | `application/pdf` |
| PDF max size | `20 MB` (`20971520` bytes) |
| PDF max pages | `50` |

`GEMINI_OUTPUT_DIMENSIONALITY` boleh dibiarkan `0` untuk default Gemini. Set nilainya jika dimensi kolom `n8n_vectors.embedding` perlu dicocokkan secara eksplisit.

## Response Format

Sukses POST:

```json
{
  "error_code": 0,
  "message": "berhasil menambahkan intent"
}
```

Sukses PUT:

```json
{
  "error_code": 0,
  "message": "berhasil mengupdate intent dari database ke VectorDB"
}
```

Error mengikuti bentuk kompatibel webhook lama:

```json
{
  "error_code": 400,
  "message": "deskripsi error"
}
```

## Struktur Folder

```text
backend/
  cmd/server/main.go
  internal/
    config/config.go
    handler/vector_knowledge.go
    middleware/auth.go
    service/
      chunker/chunker.go
      embedding/embedding.go
      pdf/pdf.go
      vectorstore/vectorstore.go
```

## Integrasi Proxy Nanti

Frontend memakai `/vector-webhook`, lalu proxy mengarah ke backend Go:

```text
/vector-webhook -> http://<go-backend-host>:8082/webhook/update-intent
```

Swagger `/api/vector-collections` tetap terpisah dari migrasi ini kecuali nanti diputuskan untuk ikut dipindahkan.
