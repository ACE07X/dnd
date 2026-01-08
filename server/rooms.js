import { v4 as uuidv4 } from 'uuid';

/**
 * In-memory storage for game rooms
 * In production, this would be replaced with a database (Redis, MongoDB, etc.)
 */
const rooms = new Map();

/**
 * Create a new game room
 * @param {string} creatorName - Name of the player creating the room
 * @param {string} creatorSocketId - Socket ID of the creator
 * @returns {Object} The created room object
 */
export function createRoom(creatorName, creatorSocketId) {
  const roomId = generateRoomId();
  
  const room = {
    id: roomId,
    name: `${creatorName}'s Game`,
    players: [
      {
        id: uuidv4(),
        name: creatorName,
        socketId: creatorSocketId,
        isGM: true, // Creator is the Game Master
        position: { x: 5, y: 5 }, // Starting position on grid
        turnOrder: 0
      }
    ],
    currentTurnIndex: 0,
    createdAt: Date.now(),
    gameState: {
      mapWidth: 20,
      mapHeight: 20,
      tokens: {} // Will store player positions
    }
  };

  // Initialize creator's token position
  const creatorId = room.players[0].id;
  room.gameState.tokens[creatorId] = {
    playerId: creatorId,
    x: 5,
    y: 5,
    name: creatorName
  };

  rooms.set(roomId, room);
  return room;
}

/**
 * Join an existing room
 * @param {string} roomId - ID of the room to join
 * @param {string} playerName - Name of the player joining
 * @param {string} socketId - Socket ID of the player
 * @returns {Object} Result object with success flag and room/error
 */
export function joinRoom(roomId, playerName, socketId) {
  const room = rooms.get(roomId);
  
  if (!room) {
    return { success: false, error: 'Room not found' };
  }

  // Check if player name already exists
  if (room.players.some(p => p.name === playerName)) {
    return { success: false, error: 'Player name already taken' };
  }

  // Check if socket is already in room (reconnection)
  const existingPlayer = room.players.find(p => p.socketId === socketId);
  if (existingPlayer) {
    existingPlayer.socketId = socketId; // Update socket ID
    return { success: true, room };
  }

  // Add new player
  const newPlayer = {
    id: uuidv4(),
    name: playerName,
    socketId: socketId,
    isGM: false,
    position: { x: 10, y: 10 }, // Default starting position
    turnOrder: room.players.length
  };

  room.players.push(newPlayer);

  // Initialize new player's token
  room.gameState.tokens[newPlayer.id] = {
    playerId: newPlayer.id,
    x: 10,
    y: 10,
    name: playerName
  };

  return { success: true, room };
}

/**
 * Leave a room
 * @param {string} socketId - Socket ID of the leaving player
 * @returns {Object|null} The room the player left, or null
 */
export function leaveRoom(socketId) {
  for (const [roomId, room] of rooms.entries()) {
    const playerIndex = room.players.findIndex(p => p.socketId === socketId);
    
    if (playerIndex !== -1) {
      const player = room.players[playerIndex];
      
      // Remove player from room
      room.players.splice(playerIndex, 1);
      
      // Remove player's token
      delete room.gameState.tokens[player.id];

      // If no players left, delete the room
      if (room.players.length === 0) {
        rooms.delete(roomId);
        return null;
      }

      // Adjust turn order if needed
      if (room.currentTurnIndex >= room.players.length) {
        room.currentTurnIndex = 0;
      }

      return room;
    }
  }
  
  return null;
}

/**
 * Get a room by ID
 * @param {string} roomId - ID of the room
 * @returns {Object|undefined} The room object or undefined
 */
export function getRoom(roomId) {
  return rooms.get(roomId);
}

/**
 * Get current state of a room (for broadcasting)
 * @param {string} roomId - ID of the room
 * @returns {Object|null} Room state object or null if room doesn't exist
 */
export function getRoomState(roomId) {
  const room = rooms.get(roomId);
  
  if (!room) {
    return null;
  }

  return {
    roomId: room.id,
    roomName: room.name,
    players: room.players.map(p => ({
      id: p.id,
      name: p.name,
      isGM: p.isGM,
      position: p.position,
      turnOrder: p.turnOrder
    })),
    currentTurnIndex: room.currentTurnIndex,
    currentPlayer: room.players[room.currentTurnIndex] ? {
      id: room.players[room.currentTurnIndex].id,
      name: room.players[room.currentTurnIndex].name
    } : null,
    gameState: room.gameState
  };
}

/**
 * Get socket ID for a player in a room
 * @param {string} roomId - ID of the room
 * @param {string} playerId - ID of the player
 * @returns {string|undefined} Socket ID or undefined
 */
export function getPlayerSocketId(roomId, playerId) {
  const room = rooms.get(roomId);
  if (!room) return undefined;
  
  const player = room.players.find(p => p.id === playerId);
  return player ? player.socketId : undefined;
}

/**
 * Find room by socket ID
 * @param {string} socketId - Socket ID to search for
 * @returns {Object|undefined} Room object or undefined
 */
export function findRoomBySocketId(socketId) {
  for (const [, room] of rooms.entries()) {
    if (room.players.some(p => p.socketId === socketId)) {
      return room;
    }
  }
  return undefined;
}

/**
 * Generate a short, readable room ID
 * @returns {string} Room ID in format like "ABCD-1234"
 */
function generateRoomId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed I, O to avoid confusion
  const nums = '23456789'; // Removed 0, 1 to avoid confusion
  
  const code1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const code2 = Array.from({ length: 4 }, () => nums[Math.floor(Math.random() * nums.length)]).join('');
  
  return `${code1}-${code2}`;
}