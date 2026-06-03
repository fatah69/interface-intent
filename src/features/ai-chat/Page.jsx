import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Send } from 'lucide-react';
import { modules } from '../../config/resources';
import { PageHeader, StatusStrip } from '../../templates/components/PageHeader';
import { chatStore, useChatStore } from './chatStore';

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
  const [copied, setCopied] = useState(false);
  const { draft, loading, messages, sessionId } = useChatStore();
  const threadEndRef = useRef(null);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, loading]);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(timer);
  }, [copied]);

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
    chatStore.sendMessage();
  }

  return (
    <>
      <PageHeader config={modules.chat} countLabel="chat session" onRefresh={chatStore.resetChat} refreshTitle="Reset chat" />
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
              value={draft}
              placeholder="Tulis pesan untuk AI"
              onChange={(event) => chatStore.setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form.requestSubmit();
                }
              }}
            />
            <button type="submit" className="primary-button" disabled={loading || !draft.trim()}>
              <Send size={18} />
              Send
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
