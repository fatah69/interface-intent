import { useEffect, useMemo, useState } from 'react';
import { Send } from 'lucide-react';
import { modules } from '../../config/resources';
import { PageHeader, StatusStrip } from '../../templates/components/PageHeader';

function getSessionId() {
  return globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : String(Date.now());
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

export function ChatPage({ data, loadData }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(getSessionId);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Halo, silakan kirim pesan untuk menguji AI.' },
  ]);

  const semanticSearches = data.semanticSearches || [];
  const selectedSearch = useMemo(
    () => semanticSearches.find((item) => item.collection_name === selectedCollection),
    [semanticSearches, selectedCollection],
  );

  useEffect(() => {
    if (!selectedCollection && semanticSearches[0]?.collection_name) {
      setSelectedCollection(semanticSearches[0].collection_name);
    }
  }, [selectedCollection, semanticSearches]);

  function resetChat() {
    setInput('');
    setSessionId(getSessionId());
    setMessages([{ role: 'assistant', content: 'Halo, silakan kirim pesan untuk menguji AI.' }]);
  }

  async function sendChatMessage(event) {
    event.preventDefault();
    const message = input.trim();
    if (!message || loading) return;

    setInput('');
    setMessages((current) => [...current, { role: 'user', content: message }]);
    setLoading(true);

    try {
      const response = await fetch('/chat-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatInput: message,
          message,
          sessionId,
          collection_name: selectedCollection || null,
          semantic_search_id: selectedSearch?.id ?? null,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        throw new Error(errorText || response.statusText);
      }

      const contentType = response.headers.get('content-type') || '';
      const payload = contentType.includes('application/json') ? await response.json() : await response.text();
      setMessages((current) => [...current, { role: 'assistant', content: extractChatReply(payload) }]);
    } catch (error) {
      setMessages((current) => [...current, { role: 'assistant', content: `Gagal menghubungi AI: ${error.message || 'request gagal'}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader config={modules.chat} countLabel="webhook chat" onRefresh={resetChat} refreshTitle="Reset chat" />
      <StatusStrip>{loading ? 'Mengirim pesan ke webhook n8n...' : 'Webhook chat aktif melalui /chat-webhook proxy.'}</StatusStrip>

      <section className="chat-panel">
        <div className="chat-layout">
          <div className="chat-meta">
            <div>
              <p className="eyebrow">n8n webhook</p>
              <strong>AI conversation test</strong>
            </div>
            <label className="chat-collection">
              <span>Semantic Search Collection</span>
              <select value={selectedCollection} onChange={(event) => setSelectedCollection(event.target.value)}>
                <option value="">No collection</option>
                {semanticSearches.map((item) => (
                  <option key={item.id} value={item.collection_name}>{item.collection_name}</option>
                ))}
              </select>
            </label>
            <code>{sessionId}</code>
          </div>

          <div className="chat-thread" aria-live="polite">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`chat-message ${message.role}`}>
                <span>{message.role === 'user' ? 'You' : 'AI'}</span>
                <p>{message.content}</p>
              </div>
            ))}
            {loading && (
              <div className="chat-message assistant">
                <span>AI</span>
                <p>Mengambil respons...</p>
              </div>
            )}
          </div>

          <form className="chat-composer" onSubmit={sendChatMessage}>
            <textarea
              rows={3}
              value={input}
              placeholder="Tulis pesan untuk AI"
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form.requestSubmit();
                }
              }}
            />
            <button type="submit" className="primary-button" disabled={loading || !input.trim()}>
              <Send size={18} />
              Send
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
