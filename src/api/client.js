const baseUrl = import.meta.env.VITE_API_BASE_URL || '';

export const endpoints = {
  agents: { path: '/api/ai-agents/', read: true, detail: true, create: true, update: true, remove: true },
  actions: { path: '/api/actions/', read: true, detail: true, create: true, update: true, remove: true },
  intents: { path: '/api/intents/', read: true, detail: true, create: true, update: true, remove: true },
  externalData: { path: '/api/external-data/', read: true, detail: true, create: true, update: true, remove: true },
  semanticSearches: { path: '/api/semantic-searches/', read: true, detail: true, create: true, update: true, remove: true },
  utilities: { path: '/api/utilities/', read: true, detail: false, create: true, update: false, remove: false },
  mappings: { path: '/api/ai-agent-utilities/', read: false, detail: false, create: true, update: false, remove: false },
};

function getEndpoint(resource, action) {
  const endpoint = endpoints[resource];
  if (!endpoint?.path || !endpoint[action]) {
    throw new Error(`Endpoint ${action} untuk ${resource} belum tersedia di Swagger.`);
  }
  return endpoint.path;
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(message || response.statusText);
  }

  if (response.status === 204) return null;
  return response.json().catch(() => null);
}

export const api = {
  can: (resource, action) => Boolean(endpoints[resource]?.path && endpoints[resource]?.[action]),
  list: (resource) => request(getEndpoint(resource, 'read')),
  detail: (resource, id) => request(`${getEndpoint(resource, 'detail')}${id}`),
  create: (resource, payload) => request(getEndpoint(resource, 'create'), {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  update: (resource, id, payload) => request(`${getEndpoint(resource, 'update')}${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),
  remove: (resource, id) => request(`${getEndpoint(resource, 'remove')}${id}`, { method: 'DELETE' }),
};
