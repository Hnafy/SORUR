import React, { useEffect, useRef, useState } from 'react';
import { sendChatMessage, getFallbackMessage } from '../../services/chatService';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';

const HISTORY_KEY = 'sorur_chat_history';

const readHistory = () => {
  try {
    const raw = sessionStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeHistory = (messages) => {
  try {
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(messages));
  } catch {
    
  }
};

export default function ChatWindow({ onClose }) {
  const [history, setHistory] = useState(readHistory);
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    writeHistory(history);
  }, [history]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [history, isLoading]);

  const handleSend = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || isLoading) return;

    const userMessage = { role: 'user', content: text };
    const nextHistory = [...history, userMessage];
    setHistory(nextHistory);
    setDraft('');
    setError('');
    setIsLoading(true);

    try {
      const reply = await sendChatMessage({ message: text, history });
      setHistory((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError(getFallbackMessage());
      setHistory((prev) => [
        ...prev,
        { role: 'assistant', content: getFallbackMessage() },
      ]);
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend(event);
    }
  };

  return (
    <div className="chat-window" role="dialog" aria-label="SRORUR Assistant">
      <div className="chat-header">
        <div className="d-flex align-items-center gap-2">
          <span className="chat-avatar material-symbols-outlined">chat</span>
          <div>
            <div className="chat-title">SRORUR Assistant</div>
            <div className="chat-status d-flex align-items-center gap-1">
              <span className="chat-live-dot" />
              <span className="text-muted small">متصل الآن</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="chat-close-btn"
          onClick={onClose}
          aria-label="إغلاق المحادثة"
          title="إغلاق"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="chat-messages">
        {history.length === 0 && (
          <div className="chat-welcome">
            <span className="material-symbols-outlined">shopping_bag</span>
            <h5>مرحباً بك في متجر سرور</h5>
            <p className="text-muted small mb-0">
              اسألني عن المنتجات، العروض، أو اطلب اقتراحات! سأساعدك في العثور على ما يناسبك.
            </p>
          </div>
        )}
        {history.map((m, i) => (
          <ChatMessage key={i} message={m} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={endRef} />
      </div>

      <form className="chat-inputbar" onSubmit={handleSend}>
        <textarea
          ref={textareaRef}
          className="chat-input"
          rows="1"
          placeholder="اكتب رسالتك هنا..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          aria-label="رسالتك"
        />
        <button
          type="submit"
          className="chat-send-btn"
          disabled={isLoading || !draft.trim()}
          aria-label="إرسال"
          title="إرسال"
        >
          <span className="material-symbols-outlined">send</span>
        </button>
      </form>
    </div>
  );
}
