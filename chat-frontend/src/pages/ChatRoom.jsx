import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import {
  connectWebSocket,
  sendMessage,
  disconnectWebSocket
} from '../services/websocketService';

import API from '../services/api';

const mergeMessages = (...groups) => {
  const mergedMessages = [];
  const seenIds = new Set();

  groups.forEach((group) => {
    group.forEach((msg) => {
      const id = msg.id ? String(msg.id) : null;
      if (id && seenIds.has(id)) {
        return;
      }
      if (id) {
        seenIds.add(id);
      }
      mergedMessages.push(msg);
    });
  });

  return mergedMessages;
};

const getDateKey = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

const getDateLabel = (date) => {
  const today = new Date();
  if (getDateKey(date) === getDateKey(today)) {
    return 'Today';
  }

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (getDateKey(date) === getDateKey(yesterday)) {
    return 'Yesterday';
  }

  return date.toLocaleDateString([], {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

function ChatRoom({ chatId, contactName, currentUserId }) {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);

  const [message, setMessage] = useState('');

  const [loadingMessages, setLoadingMessages] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchChatHistory = async () => {
      try {
        const res = await API.get(`/messages/${chatId}`);
        if (active) {
          setMessages((previousMessages) => mergeMessages(res.data || [], previousMessages));
        }
      } catch (err) {
        console.error('Failed to fetch chat history:', err);
      } finally {
        if (active) {
          setLoadingMessages(false);
        }
      }
    };

    setLoadingMessages(true);
    fetchChatHistory();

    return () => {
      active = false;
    };
  }, [chatId]);

  useEffect(() => {

    connectWebSocket(
      chatId,
      (msg) => {
        setMessages((previousMessages) => mergeMessages(previousMessages, [msg]));
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

      senderId: currentUserId,

      content: message,

      timestamp: new Date()
    };

    sendMessage(msgObject);

    setMessage('');
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
    minWidth: 0,
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
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--space-lg)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-md)'
  };

  const messageStyle = {
    display: 'flex',
    marginBottom: 0,
    width: '100%'
  };

  const messageBubbleStyle = {
    maxWidth: '60%',
    padding: 'var(--space-md)',
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
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
    width: 'auto',
    minWidth: 0,
    marginBottom: 0,
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

  const orderedMessages = [...messages].sort((first, second) => {
    const firstTime = Date.parse(first.timestamp);
    const secondTime = Date.parse(second.timestamp);
    if (Number.isNaN(firstTime) || Number.isNaN(secondTime)) {
      return 0;
    }
    return firstTime - secondTime;
  });
  let previousDateKey = null;

  return (

    <div className="chat-room" style={containerStyle}>

      <div className="chat-room-header" style={headerStyle}>
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
          {contactName ? `Chat with ${contactName}` : 'Chat'}
        </h2>
      </div>

      <div style={messagesContainerStyle}>

        {loadingMessages ? (
          <div style={{
            textAlign: 'center',
            color: 'var(--color-text-secondary)',
            padding: 'var(--space-xl)'
          }}>
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: 'var(--color-text-secondary)',
              padding: 'var(--space-xl)'
            }}>
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            orderedMessages.map((msg, index) => {
              const messageDate = msg.timestamp ? new Date(msg.timestamp) : null;
              const hasValidTimestamp = messageDate && !Number.isNaN(messageDate.getTime());
              const dateKey = hasValidTimestamp ? getDateKey(messageDate) : null;
              const showDate = dateKey && dateKey !== previousDateKey;
              if (dateKey) {
                previousDateKey = dateKey;
              }

              return (
                <div className="chat-message-group" key={msg.id || index}>
                  {showDate && (
                    <div className="chat-date-separator">
                      <span>{getDateLabel(messageDate)}</span>
                    </div>
                  )}
                  <div
                    style={{
                      ...messageStyle,
                      justifyContent: msg.senderId === currentUserId ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={msg.senderId === currentUserId ? senderBubbleStyle : receiverBubbleStyle}>
                      <span>{msg.content}</span>
                      <time
                        className="chat-message-time"
                        dateTime={hasValidTimestamp ? messageDate.toISOString() : undefined}
                      >
                        {hasValidTimestamp
                          ? messageDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                          : 'Time unavailable'}
                      </time>
                    </div>
                  </div>
                </div>
              );
            })
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