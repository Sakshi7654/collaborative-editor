// socket manager
// will handle real time event handlers

export const registerEditorHandlers = (io, socket) => {
  // Join Room
  socket.on('room:join', ({ roomId, username }) => {
    socket.join(roomId);
    socket.to(roomId).emit('room:user-joined', {
      userId: socket.id,
      username: username || 'Anonymous Peer',
    });
    console.log(`[Socket] ${socket.id} joined room: ${roomId}`);
  });

  // Live Code Synchronization
  socket.on('editor:code-change', ({ roomId, code }) => {
    // Broadcast to all participants EXCEPT the sender
    socket.to(roomId).emit('editor:code-update', { code });
  });

  // Language Sync
  socket.on('editor:language-change', ({ roomId, language }) => {
    socket.to(roomId).emit('editor:language-update', { language });
  });

  // Disconnect Handler
  socket.on('disconnecting', () => {
    for (const roomId of socket.rooms) {
      if (roomId !== socket.id) {
        socket.to(roomId).emit('room:user-left', { userId: socket.id });
      }
    }
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
};