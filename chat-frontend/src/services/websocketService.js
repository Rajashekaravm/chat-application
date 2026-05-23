import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

let stompClient = null;

export const connectWebSocket = (chatId, onMessageReceived) => {

  const socket = new SockJS('http://localhost:8000/ws');

  stompClient = new Client({
    webSocketFactory: () => socket,

    reconnectDelay: 5000,

    onConnect: () => {
      console.log('Connected');

      stompClient.subscribe(
        `/topic/messages/${chatId}`,
        (message) => {
          onMessageReceived(JSON.parse(message.body));
        }
      );
    },

    onStompError: (frame) => {
      console.error(frame);
    }
  });

  stompClient.activate();
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
  if (stompClient && stompClient.connected) {
    stompClient.deactivate();
    stompClient = null;
  }
};