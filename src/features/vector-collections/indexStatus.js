const indexFailureStorageKey = 'intent-agent-vector-index-failures';

function storage() {
  try {
    return globalThis.sessionStorage;
  } catch {
    return null;
  }
}

function normalizeCollectionName(name) {
  return String(name || '').trim().toLowerCase();
}

function readFailures() {
  const store = storage();
  if (!store) return {};

  try {
    return JSON.parse(store.getItem(indexFailureStorageKey) || '{}') || {};
  } catch {
    return {};
  }
}

function writeFailures(failures) {
  const store = storage();
  if (!store) return;

  const keys = Object.keys(failures);
  if (!keys.length) {
    store.removeItem(indexFailureStorageKey);
    return;
  }
  store.setItem(indexFailureStorageKey, JSON.stringify(failures));
}

export function getVectorIndexFailure(collectionName) {
  const key = normalizeCollectionName(collectionName);
  if (!key) return null;
  return readFailures()[key] || null;
}

export function setVectorIndexFailure(collectionName, message) {
  const key = normalizeCollectionName(collectionName);
  if (!key) return;

  const failures = readFailures();
  failures[key] = {
    message: message || 'Indexing terakhir gagal. Upload ulang supaya search sinkron dengan file terbaru.',
    at: new Date().toISOString(),
  };
  writeFailures(failures);
}

export function clearVectorIndexFailure(collectionName) {
  const key = normalizeCollectionName(collectionName);
  if (!key) return;

  const failures = readFailures();
  if (!failures[key]) return;
  delete failures[key];
  writeFailures(failures);
}
