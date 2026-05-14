import { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';

import {
  connectWebSocket,
  sendMessage,
  disconnectWebSocket
} from '../services/websocketService';

function ChatRoom() {

  // URL example:
  // /chat/123

  const { userId } = useParams();

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

  return (

    <div style={{ padding: '20px' }}>

      <h2>
        Chat Room
      </h2>

      <div
        style={{
          border: '1px solid gray',
          height: '400px',
          overflowY: 'scroll',
          padding: '10px',
          marginBottom: '10px'
        }}
      >

        {
          messages.map((msg, index) => (

            <div
              key={index}
              style={{
                marginBottom: '10px'
              }}
            >

              <b>
                {msg.senderId}
              </b>

              : {msg.content}

            </div>
          ))
        }

      </div>

      <input
        type="text"
        value={message}
        placeholder="Type message"
        onChange={(e) =>
          setMessage(e.target.value)
        }

        style={{
          width: '300px',
          marginRight: '10px'
        }}
      />

      <button onClick={handleSend}>
        Send
      </button>

    </div>
  );
}

export default ChatRoom;