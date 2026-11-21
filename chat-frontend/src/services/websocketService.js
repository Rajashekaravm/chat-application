import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

let stompClient = null;
const chatListeners = new Map();
const chatSubscriptions = new Map();

const subscribeToChat = (client, chatId) => {
  if (!client.connected || chatSubscriptions.has(chatId) || !chatListeners.has(chatId)) {
    return;
  }

  const subscription = client.subscribe(`/topic/messages/${chatId}`, (frame) => {
    let receivedMessage;
    try {
      receivedMessage = JSON.parse(frame.body);
    } catch (err) {
      console.error('Failed to parse incoming chat message:', err);
      return;
    }

    chatListeners.get(chatId)?.forEach((listener) => listener(receivedMessage));
  });
  chatSubscriptions.set(chatId, subscription);
};

const ensureConnected = () => {
  if (stompClient) {
    return;
  }

  let client;
  client = new Client({
    webSocketFactory: () => new SockJS('http://localhost:8000/ws'),
    reconnectDelay: 5000,
    onConnect: () => {
      if (stompClient !== client) {
        return;
      }

      chatSubscriptions.clear();
      chatListeners.forEach((listeners, chatId) => {
        if (listeners.size > 0) {
          subscribeToChat(client, chatId);
        }
      });
    },
    onWebSocketClose: () => {
      if (stompClient === client) {
        chatSubscriptions.clear();
      }
    },
    onStompError: (frame) => {
      console.error(frame);
    }
  });

  stompClient = client;
  client.activate();
};

export const connectWebSocket = (chatId, onMessageReceived) => {
  const key = String(chatId);
  const listeners = chatListeners.get(key) || new Set();
  listeners.add(onMessageReceived);
  chatListeners.set(key, listeners);

  ensureConnected();
  if (stompClient.connected) {
    subscribeToChat(stompClient, key);
  }

  let active = true;
  return () => {
    if (!active) {
      return;
    }
    active = false;

    const activeListeners = chatListeners.get(key);
    activeListeners?.delete(onMessageReceived);
    if (activeListeners?.size === 0) {
      chatListeners.delete(key);
      const subscription = chatSubscriptions.get(key);
      chatSubscriptions.delete(key);
      if (subscription && stompClient?.connected) {
        subscription.unsubscribe();
      }
    }

    if (chatListeners.size === 0) {
      disconnectWebSocket();
    }
  };
};

export const sendMessage = (message) => {
  if (!stompClient || !stompClient.connected) {
    console.log('WebSocket not connected');
    return;
  }

  stompClient.publish({
    destination: '/app/send',
    body: JSON.stringify(message)
  });
};

export const disconnectWebSocket = () => {
  const client = stompClient;
  stompClient = null;
  chatListeners.clear();
  chatSubscriptions.clear();

  if (client) {
    client.deactivate();
  }
};
