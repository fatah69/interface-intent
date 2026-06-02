import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Send } from 'lucide-react';
import { modules } from '../../config/resources';
import { PageHeader, StatusStrip } from '../../templates/components/PageHeader';

const chatStorageKey = 'intent-agent-ai-chat-session';
const initialMessages = [{ role: 'assistant', content: 'Halo, silakan kirim pesan untuk menguji AI.' }];

function getSessionId() {
  return globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : String(Date.now());
}

function createChatState() {
  return { sessionId: getSessionId(), messages: initialMessages };
}

function loadChatState() {
  try {
    const stored = globalThis.sessionStorage?.getItem(chatStorageKey);
    if (!stored) return createChatState();

    const parsed = JSON.parse(stored);
    if (!parsed?.sessionId || !Array.isArray(parsed.messages)) return createChatState();
    return {
      sessionId: parsed.sessionId,
      messages: parsed.messages.length ? parsed.messages : initialMessages,
    };
  } catch {
    return createChatState();
  }
}

function saveChatState(chatState) {
  try {
    globalThis.sessionStorage?.setItem(chatStorageKey, JSON.stringify(chatState));
  } catch {
    // Chat remains usable even if browser storage is unavailable.
  }
}

function clearChatState() {
  try {
    globalThis.sessionStorage?.removeItem(chatStorageKey);
  } catch {
    // Ignore storage failures; reset still updates in-memory state.
  }
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

function fallbackCopyText(value) {
  const textArea = document.createElement('textarea');
  textArea.value = value;
  textArea.setAttribute('readonly', '');
  textArea.style.position = 'fixed';
  textArea.style.top = '-1000px';
  document.body.appendChild(textArea);
  textArea.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(textArea);
  return copied;
}

export function ChatPage() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [chatState, setChatState] = useState(loadChatState);
  const threadEndRef = useRef(null);
  const { messages, sessionId } = chatState;

  useEffect(() => {
    saveChatState(chatState);
  }, [chatState]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(timer);
  }, [copied]);

  function resetChat() {
    clearChatState();
    setInput('');
    setChatState(createChatState());
  }

  async function copySessionId() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(sessionId);
      } else if (!fallbackCopyText(sessionId)) {
        throw new Error('copy failed');
      }
      setCopied(true);
    } catch {
      setCopied(fallbackCopyText(sessionId));
    }
  }

  async function sendChatMessage(event) {
    event.preventDefault();
    const message = input.trim();
    if (!message || loading) return;

    setInput('');
    setChatState((current) => ({
      ...current,
      messages: [...current.messages, { role: 'user', content: message }],
    }));
    setLoading(true);

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
      setChatState((current) => ({
        ...current,
        messages: [...current.messages, { role: 'assistant', content: extractChatReply(payload) }],
      }));
    } catch (error) {
      setChatState((current) => ({
        ...current,
        messages: [...current.messages, { role: 'assistant', content: `Gagal menghubungi AI: ${error.message || 'request gagal'}` }],
      }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader config={modules.chat} countLabel="chat session" onRefresh={resetChat} refreshTitle="Reset chat" />
      <StatusStrip>{loading ? 'Mengirim pesan...' : 'AI Chat siap digunakan.'}</StatusStrip>

      <section className="chat-panel">
        <div className="chat-layout">
          <div className="chat-meta">
            <div>
              <p className="eyebrow">AI Chat</p>
              <strong>Uji percakapan</strong>
            </div>
            <div className="chat-session">
              <span>Session ID</span>
              <code>{sessionId}</code>
              <button className="ghost-button" type="button" onClick={copySessionId} title="Copy session ID">
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
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
            <div ref={threadEndRef} />
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
