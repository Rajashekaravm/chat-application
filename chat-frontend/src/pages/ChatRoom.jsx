import { useEffect, useState } from 'react';

import { useParams, useNavigate } from 'react-router-dom';

import {
  connectWebSocket,
  sendMessage,
  disconnectWebSocket
} from '../services/websocketService';

function ChatRoom() {

  // URL example:
  // /chat/123

  const { userId } = useParams();

  const navigate = useNavigate();

  // For now using userId as chatId
  const chatId = userId;

  const [messages, setMessages] = useState([]);

  const [message, setMessage] = useState('');

  useEffect(() => {

    connectWebSocket(
      chatId,
      (msg) => {

        setMessages(prev => [
          ...prev,
          msg
        ]);
      }
    );

    return () => {
      disconnectWebSocket();
    };

  }, [chatId]);

  const handleSend = () => {

    if (!message.trim()) {
      return;
    }

    const msgObject = {

      chatId: chatId,

      senderId: 'user1',

      content: message,

      timestamp: new Date()
    };

    sendMessage(msgObject);

    setMessage('');
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: 'var(--color-bg)'
  };

  const headerStyle = {
    padding: 'var(--space-lg)',
    background: 'var(--color-surface)',
    borderBottom: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-lg)'
  };

  const backButtonStyle = {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: 'var(--color-primary)',
    padding: 'var(--space-sm)',
    transition: 'var(--transition)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const h2Style = {
    margin: '0',
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'var(--color-text-primary)'
  };

  const messagesContainerStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: 'var(--space-lg)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)'
  };

  const messageStyle = {
    display: 'flex',
    marginBottom: 'var(--space-md)'
  };

  const messageBubbleStyle = {
    maxWidth: '60%',
    padding: 'var(--space-md)',
    borderRadius: 'var(--radius-lg)',
    wordWrap: 'break-word'
  };

  const senderBubbleStyle = {
    ...messageBubbleStyle,
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
    color: 'white',
    marginLeft: 'auto',
    borderBottomRightRadius: '0.25rem',
    boxShadow: 'var(--shadow-md)'
  };

  const receiverBubbleStyle = {
    ...messageBubbleStyle,
    background: 'var(--color-surface)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-border)',
    borderBottomLeftRadius: '0.25rem',
    boxShadow: 'var(--shadow-sm)'
  };

  const senderInfoStyle = {
    fontSize: '0.75rem',
    fontWeight: '600',
    marginBottom: 'var(--space-xs)',
    color: 'var(--color-primary)',
    textTransform: 'uppercase'
  };

  const inputAreaStyle = {
    display: 'flex',
    gap: 'var(--space-sm)',
    padding: 'var(--space-lg)',
    background: 'var(--color-surface)',
    borderTop: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-sm)'
  };

  const inputStyle = {
    flex: 1,
    padding: 'var(--space-md)',
    fontSize: '1rem',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    backgroundColor: '#f8fafc',
    color: 'var(--color-text-primary)',
    transition: 'var(--transition)',
    boxSizing: 'border-box'
  };

  const buttonStyle = {
    padding: 'var(--space-md) var(--space-lg)',
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'var(--transition)',
    boxShadow: 'var(--shadow-md)',
    whiteSpace: 'nowrap'
  };

  return (

    <div style={containerStyle}>

      <div style={headerStyle}>
        <button
          onClick={() => navigate('/dashboard')}
          style={backButtonStyle}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
          }}
          title="Go back to dashboard"
        >
          ←
        </button>
        <h2 style={h2Style}>
          Chat with User {userId}
        </h2>
      </div>

      <div style={messagesContainerStyle}>

        {
          messages.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: 'var(--color-text-secondary)',
              padding: 'var(--space-xl)'
            }}>
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => (

              <div
                key={index}
                style={{
                  ...messageStyle,
                  justifyContent: msg.senderId === 'user1' ? 'flex-end' : 'flex-start'
                }}
              >
                <div>
                  {msg.senderId !== 'user1' && (
                    <div style={senderInfoStyle}>
                      {msg.senderId}
                    </div>
                  )}
                  <div style={msg.senderId === 'user1' ? senderBubbleStyle : receiverBubbleStyle}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))
          )
        }

      </div>

      <div style={inputAreaStyle}>
        <input
          type="text"
          value={message}
          placeholder="Type a message..."
          onChange={(e) =>
            setMessage(e.target.value)
          }
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSend();
            }
          }}
          style={inputStyle}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--color-primary)';
            e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--color-border)';
            e.target.style.boxShadow = 'none';
          }}
        />

        <button
          onClick={handleSend}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = 'var(--shadow-lg)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'var(--shadow-md)';
          }}
        >
          Send
        </button>
      </div>

    </div>
  );
}

export default ChatRoom;