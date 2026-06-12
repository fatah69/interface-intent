# Vector Test Data Cleanup

Gunakan SQL ini hanya jika test write ke `/vector-webhook` terlanjur menambah row ke PGVector. Jalankan lewat Postgres credential yang sama dengan backend Go Vector Knowledge.

```sql
DELETE FROM n8n_vectors v
USING n8n_vector_collections c
WHERE v.collection_id = c.uuid
  AND c.name = 'peraturan'
  AND v.text IN (
'Frontend smoke test VectorDB. Abaikan dokumen ini jika terlihat di hasil retrieval.',
    'Frontend proxy smoke test VectorDB setelah page dipisah.'
  );
```

Catatan: repo frontend tidak menyimpan credential database. Jangan melakukan smoke test POST text/PDF lagi tanpa endpoint cleanup atau akses SQL untuk menghapus row test.
