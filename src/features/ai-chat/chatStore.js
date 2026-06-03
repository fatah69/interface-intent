import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const chatStorageKey = 'intent-agent-ai-chat-session';
const initialMessages = [{ role: 'assistant', content: 'Halo, silakan kirim pesan untuk menguji AI.' }];

function getSessionId() {
  return globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : String(Date.now());
}

function createChatState() {
  return { sessionId: getSessionId(), messages: initialMessages, draft: '', loading: false };
}

function extractChatReply(payload) {
  if (typeof payload === 'string') return payload;
  if (Array.isArray(payload)) return payload.map((item) => extractChatReply(item)).join('\n');

  const directReply = payload?.output || payload?.text || payload?.response || payload?.message || payload?.answer;
  if (directReply) return typeof directReply === 'string' ? directReply : JSON.stringify(directReply, null, 2);

  if (payload?.executionStarted) {
    const executionId = payload.executionId ? ` Execution ID: ${payload.executionId}.` : '';
    return `Workflow n8n sudah menerima pesan.${executionId} Webhook belum mengirim teks jawaban langsung ke frontend.`;
  }

  return JSON.stringify(payload, null, 2);
}

const chatSessionStorage = {
  getItem: (name) => {
    const value = sessionStorage.getItem(name);
    if (!value) return null;

    const parsed = JSON.parse(value);
    if (parsed?.state) return parsed;

    return { state: parsed };
  },
  setItem: (name, value) => {
    sessionStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name) => {
    sessionStorage.removeItem(name);
  },
};

export const useChatStore = create(
  persist(
    (set, get) => ({
      ...createChatState(),

      setDraft: (draft) => set({ draft }),

      resetChat: () => set(createChatState()),

      sendMessage: async () => {
        const { draft, loading, messages, sessionId } = get();
        const message = draft.trim();
        if (!message || loading) return;

        set({
          draft: '',
          loading: true,
          messages: [...messages, { role: 'user', content: message }],
        });

        try {
          const response = await fetch('/chat-webhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chatInput: message,
              message,
              sessionId,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text().catch(() => response.statusText);
            throw new Error(errorText || response.statusText);
          }

          const contentType = response.headers.get('content-type') || '';
          const payload = contentType.includes('application/json') ? await response.json() : await response.text();
          set((current) => ({
            loading: false,
            messages: [...current.messages, { role: 'assistant', content: extractChatReply(payload) }],
          }));
        } catch (error) {
          set((current) => ({
            loading: false,
            messages: [...current.messages, { role: 'assistant', content: `Gagal menghubungi AI: ${error.message || 'request gagal'}` }],
          }));
        }
      },
    }),
    {
      name: chatStorageKey,
      storage: chatSessionStorage,
      partialize: ({ sessionId, messages, draft }) => ({ sessionId, messages, draft }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...persistedState,
        messages: Array.isArray(persistedState?.messages) && persistedState.messages.length
          ? persistedState.messages
          : initialMessages,
        draft: typeof persistedState?.draft === 'string' ? persistedState.draft : '',
        loading: false,
      }),
    },
  ),
);

export const chatStore = {
  resetChat: () => useChatStore.getState().resetChat(),
  sendMessage: () => useChatStore.getState().sendMessage(),
  setDraft: (draft) => useChatStore.getState().setDraft(draft),
};
