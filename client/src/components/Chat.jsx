import { useState, useEffect, useRef } from 'react';
import './Chat.css';

function Chat({ messages, onSendMessage, playerName }) {
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat">
      <div className="chat-tabs">
        <button
          className={`chat-tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          Chat
        </button>
        <button
          className={`chat-tab ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          AI DM
        </button>
      </div>

      <div className="chat-content">
        {activeTab === 'chat' && (
          <>
            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`chat-message chat-message-${msg.type}`}
                >
                  {msg.type === 'chat' && (
                    <div className="message-header">
                      <span className="message-player">{msg.player}</span>
                      <span className="message-time">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  )}
                  {msg.type === 'system' && (
                    <div className="message-header">
                      <span className="message-system">System</span>
                      <span className="message-time">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  )}
                  {msg.type === 'dice' && (
                    <div className="message-header">
                      <span className="message-dice">🎲 {msg.player}</span>
                      <span className="message-time">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  )}
                  <div className="message-body">{msg.message}</div>
                  {msg.type === 'dice' && (
                    <div className="dice-result">
                      {msg.count > 1 ? `${msg.count}${msg.dice}` : msg.dice}: [
                      {msg.rolls.join(', ')}] = <strong>{msg.total}</strong>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form className="chat-input-form" onSubmit={handleSubmit}>
              <input
                type="text"
                className="chat-input"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={200}
              />
              <button type="submit" className="chat-send-button">
                Send
              </button>
            </form>
          </>
        )}

        {activeTab === 'ai' && (
          <div className="ai-panel">
            <div className="ai-info">
              <h3>AI Dungeon Master</h3>
              <p>
                The AI DM can help with area descriptions, NPC dialogue, and
                session summaries.
              </p>
              <p className="ai-note">
                Note: AI is for narration only and never affects game logic.
              </p>
            </div>
            <div className="ai-features">
              <p>AI features coming soon...</p>
              <ul>
                <li>Area descriptions</li>
                <li>NPC dialogue</li>
                <li>Session summaries</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;