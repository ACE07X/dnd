import { createRoom, joinRoom, leaveRoom, getRoom, getRoomState, findRoomBySocketId } from './rooms.js';
import { handleGameAction } from './gameLogic.js';

/**
 * Handle new Socket.IO connection
 */
export function handleConnection(socket, io) {
  console.log(`Client connected: ${socket.id}`);

  // Handle room creation
  socket.on('createRoom', ({ playerName }) => {
    try {
      const room = createRoom(playerName, socket.id);
      socket.join(room.id);
      socket.emit('roomCreated', room);
      io.to(room.id).emit('roomState', getRoomState(room.id));
      console.log(`Room ${room.id} created by ${playerName}`);
    } catch (error) {
      socket.emit('error', { message: 'Failed to create room', error: error.message });
    }
  });

  // Handle joining a room
  socket.on('joinRoom', ({ roomId, playerName }) => {
    try {
      const result = joinRoom(roomId, playerName, socket.id);
      if (result.success) {
        socket.join(roomId);
        socket.emit('roomJoined', result.room);
        io.to(roomId).emit('roomState', getRoomState(roomId));
        console.log(`${playerName} joined room ${roomId}`);
      } else {
        socket.emit('error', { message: result.error });
      }
    } catch (error) {
      socket.emit('error', { message: 'Failed to join room', error: error.message });
    }
  });

  // Handle game actions (movement, dice rolls, turn changes)
  socket.on('gameAction', ({ action, data }) => {
    try {
      const result = handleGameAction(socket.id, action, data, io);
      if (!result.success) {
        socket.emit('error', { message: result.error });
      }
    } catch (error) {
      socket.emit('error', { message: 'Game action failed', error: error.message });
    }
  });

  // Handle chat messages
  socket.on('chatMessage', ({ message }) => {
    try {
      const room = findRoomBySocketId(socket.id);
      if (room) {
        const player = room.players.find(p => p.socketId === socket.id);
        if (player) {
          io.to(room.id).emit('chatMessage', {
            player: player.name,
            message,
            timestamp: Date.now()
          });
        }
      }
    } catch (error) {
      socket.emit('error', { message: 'Failed to send message', error: error.message });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    try {
      const room = leaveRoom(socket.id);
      if (room) {
        io.to(room.id).emit('roomState', getRoomState(room.id));
        console.log(`Client ${socket.id} disconnected from room ${room.id}`);
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });
}
