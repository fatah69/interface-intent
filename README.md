# Intent & Agent Management Console

React/Vite dashboard for configuring AI chatbot resources from an existing REST API. The app is built around the provided ERD and Swagger API, with no local backend and no mock data.

## Stack

- React `^19.2.6`
- Vite `^8.0.14`
- `lucide-react` for icons
- REST API backend provided externally at `http://194.233.79.180:8080`
- n8n chat webhook provided externally at `http://103.140.90.131:5678`
- n8n VectorDB webhook provided externally at `http://103.140.90.131:5678`

## Architecture

```text
Browser
  -> React/Vite frontend
  -> /api/... via Vite proxy
  -> http://194.233.79.180:8080/api/...
  -> Existing backend API
  -> PostgreSQL handled by backend

Browser
  -> React/Vite frontend
  -> /chat-webhook via Vite proxy
  -> http://103.140.90.131:5678/webhook/.../chat
  -> Existing n8n chat workflow
```

This repository contains only the frontend. It does not contain backend controllers, database migrations, ORM models, or PostgreSQL connection code.

## Frontend Structure

```text
src/App.jsx                         Application shell and page router
src/features/<feature-name>/        Sidebar page feature folders
src/features/*/config.js            Feature-specific resource config
src/features/*/Page.jsx             Feature page entry point
src/features/ai-chat/Page.jsx       AI Chat webhook workflow
src/features/vector-collections/Page.jsx Vector Collections upload workflow
src/templates/hooks/useResourceCrud.js Shared CRUD behavior
src/templates/components/           Shared sidebar, forms, modal, drawer, table, toolbar pieces
src/config/resources.js             Feature registry, route map, and nav grouping
src/config/resourceOptions.js       Shared enum and relation maps
src/utils/resourceUtils.jsx         Labels, validation, payload transforms, table values
src/api/client.js                   REST endpoint map and request helper
```

Each sidebar page is treated as a feature. New CRUD-style features should get a folder under `src/features/`, define `Page.jsx` and `config.js`, then be registered through `resources.js` and `src/features/index.js`. Feature pages own layout and reuse shared hooks/components from `src/templates/` to avoid copy-pasting CRUD behavior.

Navigation uses `react-router-dom` with clean dashboard routes such as `/intents`, `/actions`, `/semantic-search`, `/vector-collections`, and `/chat`. The production server falls back to `index.html`, so direct refresh on those routes is supported.

Use this rule of thumb when changing the app:

- Page-specific layout: edit `src/features/<feature-name>/Page.jsx`.
- Field, column, label, or icon config: edit `src/features/<feature-name>/config.js`.
- Shared CRUD behavior: edit `src/templates/hooks/useResourceCrud.js`.
- Shared UI pieces: edit `src/templates/components/`.
- API paths and method availability: edit `src/api/client.js`.
- Route paths and sidebar grouping: edit `src/config/resources.js`.

## Getting Started

Install dependencies:

```bash
nvm install
nvm use
npm install
```

Run the development server:

```bash
npm run dev
```

The `dev` script runs Vite on `0.0.0.0:5173`, so it can be opened by teammates on the same WiFi.

Use the Network URL printed by Vite, for example:

```text
http://192.168.77.163:5173/
```

Do not share `localhost` or `127.0.0.1`; those only work on your own machine.

Build for production validation:

```bash
npm run build
```

Run the lightweight test command:

```bash
npm test
```

`npm test` currently runs `vite build`.

## Push to GitHub

This workspace is prepared for:

```text
https://github.com/fatah69/interface-intent
```

First push from this machine:

```bash
git add .
git commit -m "Initial intent management console"
git push -u origin main
```

If GitHub asks for login, use your GitHub credential flow or a personal access token.

## Production on Internal Server

Recommended internal deployment uses the production server in `server-setup/prod-server.mjs`. It serves the built React files from `dist` and proxies `/api`, `/chat-webhook`, and `/vector-webhook` to the existing REST API and n8n services.

```bash
git clone https://github.com/fatah69/interface-intent.git
cd interface-intent
nvm install
nvm use
npm ci
cp .env.production.example .env.production
npm run build
npm start
```

Default runtime config:

```text
App URL:           http://0.0.0.0:5173
REST API proxy:    /api -> http://194.233.79.180:8080
Chat webhook:      /chat-webhook -> http://103.140.90.131:5678/webhook/.../chat
Vector webhook:    /vector-webhook -> http://103.140.90.131:5678/webhook/update-intent
```

Open the app from another device with the server IP, for example `http://192.168.77.10:5173/`. For long-running Linux deployment, use PM2 or Nginx; see `server-setup/README.md`.

## API Configuration

During local development, requests use Vite proxy from `/api/*` to the backend server. See `vite.config.js`.

Keep `VITE_API_BASE_URL` empty during development unless you intentionally want direct browser calls to the backend:

```env
VITE_API_BASE_URL=
```

Direct calls to `http://194.233.79.180:8080` may hit CORS issues in the browser, so the proxy is preferred.

The AI Chat page uses `/chat-webhook`, proxied by Vite to the n8n webhook. The frontend sends `{ chatInput, message, sessionId }` and renders the real webhook response. The n8n chat workflow determines which collection to use from the prompt/chat logic. The browser keeps the current chat session in `sessionStorage` so conversation state survives route changes and page refreshes in the same tab session.

The Vector Collections page uses collection names from `/api/semantic-searches/`, then uses `/vector-webhook`, proxied by Vite to the n8n PGVector workflow. It supports `POST` text knowledge and `POST` PDF upload. The same `collection_name` is visible on Semantic Search and sent to n8n when upload runs.

ERD alignment: `semantic_search.collection_name` and `n8n_vector_collections.name` are different tables and have no direct foreign key. The app treats the name as the logical link: Semantic Search stores the registry row used by Actions, while n8n creates or fills the PGVector collection with the same name.

## Implemented Modules

The dashboard implements these ERD/API resources:

- AI Agents: list, detail, create, update, delete.
- Actions: list, detail, create, update, delete.
- Intents: list, detail, create, update, delete.
- External Data: list, detail, create, update, delete.
- Semantic Search: list, detail, create, update, delete.
- Vector Collections: select a Semantic Search `collection_name`, upload text, and upload PDF to the n8n PGVector workflow.
- Utilities: list and create.
- Agent Utilities: create mapping only.
- n8n vectors: handled through the Vector Collections page, not a separate empty CRUD page, because no read endpoint is exposed.
- AI Chat: sends real messages to the n8n webhook through `/chat-webhook`.

## API Coverage

Latest Swagger sources checked:

- `http://194.233.79.180:8080/swagger/doc.json`

All endpoints available in the latest Swagger are utilized by the frontend.

Available and used:

```text
GET/POST       /api/utilities/
POST           /api/ai-agent-utilities/
GET/POST       /api/actions/
GET/PUT/DELETE /api/actions/{id}
GET/POST       /api/ai-agents/
GET/PUT/DELETE /api/ai-agents/{id}
GET/POST       /api/external-data/
GET/PUT/DELETE /api/external-data/{id}
GET/POST       /api/intents/
GET/PUT/DELETE /api/intents/{id}
GET/POST       /api/semantic-searches/
GET/PUT/DELETE /api/semantic-searches/{id}
```

Additional non-Swagger endpoint used by the UI:

```text
POST /chat-webhook -> http://103.140.90.131:5678/webhook/eb70bb74-2714-4d79-b447-de3e7cd683cb/chat
POST /vector-webhook -> http://103.140.90.131:5678/webhook/update-intent
PUT  /vector-webhook -> http://103.140.90.131:5678/webhook/update-intent
```

Not exposed by Swagger/API at the time of the latest audit:

```text
GET/PUT/DELETE /api/ai-agent-utilities/
GET/PUT/DELETE /api/utilities/{id}
Read/detail CRUD endpoints for n8n_vector_collections
Read/detail CRUD endpoints for n8n_vectors
```

These ERD tables are currently populated through n8n PGVector via `/vector-webhook`, not through Swagger CRUD pages. Avoid write smoke tests unless there is a cleanup path for inserted vector rows.

## UI/UX Notes

The interface is designed as an operational dashboard, not a landing page. It uses:

- Sidebar navigation.
- Collapsible `AI-Configuration` sub-sidebar for operational resources.
- Compact page header.
- Searchable tables.
- Conditional Action form based on `action_type`.
- Detailed Action labels in Intent dropdowns, including id, type, target, and parameter summary.
- Real API dropdowns for foreign keys.
- AI Chat page for testing the n8n webhook.
- AI Chat sends `chatInput`, `message`, and `sessionId`; n8n chooses the collection from prompt/chat logic.
- Vector Collections page for `POST` text and `POST` PDF against the n8n workflow.
- Vectors are not shown as an empty page; the ERD table is populated through n8n/PGVector until a read endpoint is available.
- JSON validation and formatting controls.
- Detail drawer for row inspection.
- Clear unavailable panels for missing API endpoints.

No mock data is used. If data is empty, failed, or unavailable, the UI shows an empty/unavailable state rather than fake records.

## Documentation

Additional project documentation lives in `docs/`:

- `docs/API_REFERENCE.md` - endpoint payloads and API notes.
- `docs/API_ACCESS_STATUS.md` - latest endpoint availability audit.
- `docs/UI_UX_PLAN.md` - implemented UI/UX improvements and remaining polish.
- `docs/PANDUAN_PENGERJAAN.md` - original implementation guide.

Root-level contributor instructions are in `AGENTS.md`.

Production deployment files live in `server-setup/`.

## ERD

The ERD is available as:

- `ERD.mmd` - Mermaid source.
- `ERD_VIEW.html` - browser-viewable Mermaid renderer.

When the dev server is running, open:

```text
http://localhost:5173/ERD_VIEW.html
```

or use the WiFi Network URL printed by Vite.

