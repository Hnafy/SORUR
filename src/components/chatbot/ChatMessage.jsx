import React from 'react';

// Renders a small, safe subset of markdown: bold, italic, inline code, and
// bullet/numbered lists. Content is text-only; links become plain text.
const renderInline = (text) => {
  const escaped = String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
};

const renderLine = (line, key) => {
  const trimmed = line.trim();

  const ul = trimmed.match(/^[-*•]\s+(.*)$/);
  if (ul) {
    return (
      <li key={key} dangerouslySetInnerHTML={{ __html: renderInline(ul[1]) }} />
    );
  }

  const ol = trimmed.match(/^\d+[.)]\s+(.*)$/);
  if (ol) {
    return (
      <li key={key} dangerouslySetInnerHTML={{ __html: renderInline(ol[1]) }} />
    );
  }

  return <p key={key} dangerouslySetInnerHTML={{ __html: renderInline(line) }} />;
};

export default function ChatMessage({ message }) {
  const isUser = message?.role === 'user';
  const content = String(message?.content || '');

  const listJustOpened = { ul: false, ol: false };

  const blocks = content.split('\n').reduce((acc, lineRaw) => {
    const line = lineRaw;
    const trimmed = line.trim();

    const isUlItem = /^[-*•]\s+/.test(trimmed);
    const isOlItem = /^\d+[.)]\s+/.test(trimmed);

    if (isUlItem && !listJustOpened.ul) {
      acc.push(<ul key={acc.length}>{renderLine(trimmed, `${acc.length}-${listJustOpened.ul}`)}</ul>);
      listJustOpened.ul = true;
      return acc;
    }
    if (isUlItem && listJustOpened.ul) {
      const target = acc[acc.length - 1];
      acc[acc.length - 1] = React.cloneElement(target, {}, [
        ...target.props.children,
        renderLine(trimmed, target.props.children.length),
      ]);
      return acc;
    }
    if (isOlItem && !listJustOpened.ol) {
      acc.push(<ol key={acc.length}>{renderLine(trimmed, `${acc.length}-ol0`)}</ol>);
      listJustOpened.ol = true;
      return acc;
    }
    if (isOlItem && listJustOpened.ol) {
      const target = acc[acc.length - 1];
      acc[acc.length - 1] = React.cloneElement(target, {}, [
        ...target.props.children,
        renderLine(trimmed, target.props.children.length),
      ]);
      return acc;
    }

    listJustOpened.ul = false;
    listJustOpened.ol = false;
    if (line === '' || /^\s*$/.test(line)) return acc;
    acc.push(renderLine(line, acc.length));
    return acc;
  }, []);

  return (
    <div className={`chat-msg ${isUser ? 'chat-msg-user' : 'chat-msg-ai'}`}>
      <div className={`chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
        {blocks.length ? blocks : <p>{content}</p>}
      </div>
    </div>
  );
}
