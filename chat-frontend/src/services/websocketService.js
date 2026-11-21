import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

let stompClient = null;
let messageSubscription = null;

export const connectWebSocket = (chatId, onMessageReceived) => {
  disconnectWebSocket();

  const client = new Client({
    webSocketFactory: () => new SockJS('http://localhost:8000/ws'),

    reconnectDelay: 5000,

    onConnect: () => {
      if (stompClient !== client) {
        return;
      }

      console.log('Connected');

      messageSubscription = client.subscribe(
        `/topic/messages/${chatId}`,
        (frame) => {
          let receivedMessage;
          try {
            receivedMessage = JSON.parse(frame.body);
          } catch (err) {
            console.error('Failed to parse incoming chat message:', err);
            return;
          }
          onMessageReceived(receivedMessage);
        }
      );
    },

    onStompError: (frame) => {
      console.error(frame);
    }
  });

  stompClient = client;
  client.activate();
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
  const subscription = messageSubscription;

  stompClient = null;
  messageSubscription = null;

  if (client && subscription && client.connected) {
    subscription.unsubscribe();
  }

  if (client) {
    client.deactivate();
  }
};