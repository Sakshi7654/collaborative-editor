// server bootstrapand socket initialization
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { registerEditorHandlers } from './sockets/editorSocket.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());

// Health check route
app.get('/health', (req, res) => res.status(200).json({ status: 'healthy' }));

const httpServer = createServer(app);

// Initialize Socket.IO with production-safe CORS and transport fallbacks
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'], // WebSocket first, fallback to polling
});

io.on('connection', (socket) => {
  console.log(`[Connection] Connected: ${socket.id}`);
  registerEditorHandlers(io, socket);
});

httpServer.listen(PORT, () => {
  console.log(`[Server] Live on http://localhost:${PORT}`);
});