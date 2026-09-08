import React, { useState } from 'react';
import ChatWindow from './ChatWindow';

export default function ChatbotContainer() {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen((prev) => !prev);

  return (
    <div className="chatbot-root">
      {isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}

      <button
        type="button"
        className="chat-fab"
        onClick={toggle}
        aria-label={isOpen ? 'إغلاق مساعد التسوق' : 'فتح مساعد التسوق'}
        title="مساعد التسوق"
      >
        {isOpen ? (
          <span className="material-symbols-outlined">close</span>
        ) : (
          <span className="material-symbols-outlined">forum</span>
        )}
      </button>
    </div>
  );
}
