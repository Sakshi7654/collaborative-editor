// socket instance and api calls

import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const socket = io(SERVER_URL, {
  autoConnect: false, // Prevents early connections before mounting
  transports: ['websocket'],
});