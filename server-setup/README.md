# Server Setup

Panduan ini untuk menjalankan **Intent & Agent Management Console** di server internal kantor. Aplikasi ini tetap frontend React; file `prod-server.mjs` hanya bertugas serve static `dist` dan reverse proxy ke REST API/n8n.

## Prasyarat

- Node.js 20.19 atau lebih baru.
- Server berada di jaringan yang bisa akses:
  - `http://172.16.210.244:8080`
  - `http://172.16.210.244:5678`
- Port aplikasi dibuka di firewall, default `5173`.

## Deploy Cepat dengan Node

```bash
git clone https://github.com/fatah69/interface-intent.git
cd interface-intent
npm ci
cp .env.production.example .env.production
npm run build
npm start
```

Setelah jalan, buka dari komputer lain di WiFi kantor:

```text
http://IP_SERVER:5173/
```

Jangan pakai `localhost` dari komputer rekan kerja karena itu menunjuk ke laptop mereka sendiri.

## Konfigurasi Runtime

Edit `.env.production` kalau IP backend atau port berubah:

```env
HOST=0.0.0.0
PORT=5173
API_TARGET=http://172.16.210.244:8080
N8N_TARGET=http://172.16.210.244:5678
CHAT_WEBHOOK_PATH=/webhook/eb70bb74-2714-4d79-b447-de3e7cd683cb/chat
VECTOR_WEBHOOK_PATH=/webhook/update-intent
```

Biarkan `VITE_API_BASE_URL=` kosong supaya browser memanggil relative path `/api`, `/chat-webhook`, dan `/vector-webhook`. `prod-server.mjs` yang meneruskan request itu ke server tujuan.

## Jalankan Permanen

Untuk server Linux, pakai process manager seperti PM2:

```bash
npm install -g pm2
pm2 start server-setup/prod-server.mjs --name interface-intent
pm2 save
pm2 startup
```

Atau pakai systemd dengan contoh unit `systemd-interface-intent.service`:

```bash
sudo mkdir -p /opt/interface-intent
sudo cp -r . /opt/interface-intent
sudo cp server-setup/systemd-interface-intent.service /etc/systemd/system/interface-intent.service
sudo systemctl daemon-reload
sudo systemctl enable --now interface-intent
sudo systemctl status interface-intent
```

Untuk update versi baru:

```bash
git pull
npm ci
npm run build
pm2 restart interface-intent
```

## Alternatif Nginx

Kalau server sudah memakai Nginx, bisa serve folder `dist` dan pakai contoh `nginx-interface-intent.conf`. Dalam mode ini, Nginx menggantikan `prod-server.mjs` sebagai static server dan reverse proxy.

## Smoke Check Aman

Setelah deploy, cek endpoint read-only:

```bash
curl http://localhost:5173/
curl http://localhost:5173/api/intents/
curl http://localhost:5173/api/semantic-searches/
```

Jangan smoke test `POST /vector-webhook` kecuali ada rencana cleanup, karena request itu menulis row ke PGVector.
