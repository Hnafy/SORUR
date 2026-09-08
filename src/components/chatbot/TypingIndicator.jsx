import React from 'react';

export default function TypingIndicator() {
  return (
    <div className="chat-msg chat-msg-ai">
      <div className="chat-bubble chat-bubble-ai typing-indicator" aria-label="SRORUR Assistant is typing">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  );
}
