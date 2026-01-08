import { getRoom, getRoomState, findRoomBySocketId } from './rooms.js';

/**
 * Handle game actions from clients
 * Server is authoritative - all game logic happens here
 * @param {string} socketId - Socket ID of the player making the action
 * @param {string} action - Type of action (move, rollDice, endTurn, etc.)
 * @param {Object} data - Action-specific data
 * @param {Object} io - Socket.IO server instance for broadcasting
 * @returns {Object} Result object with success flag
 */
export function handleGameAction(socketId, action, data, io) {
  // Find which room this socket belongs to
  const room = findRoomBySocketId(socketId);
  
  if (!room) {
    return { success: false, error: 'Player not in any room' };
  }

  // Find the player making the action
  const player = room.players.find(p => p.socketId === socketId);
  
  if (!player) {
    return { success: false, error: 'Player not found' };
  }

  // Check if it's the player's turn (except for certain actions like chat)
  const isPlayerTurn = room.players[room.currentTurnIndex]?.id === player.id;
  
  switch (action) {
    case 'move':
      if (!isPlayerTurn) {
        return { success: false, error: 'Not your turn' };
      }
      return handleMove(room, player, data, io);
      
    case 'rollDice':
      // Dice rolls can happen anytime, but we'll log whose turn it is
      return handleDiceRoll(room, player, data, io);
      
    case 'endTurn':
      if (!isPlayerTurn) {
        return { success: false, error: 'Not your turn' };
      }
      return handleEndTurn(room, io);
      
    default:
      return { success: false, error: `Unknown action: ${action}` };
  }
}

/**
 * Handle player movement on the grid
 */
function handleMove(room, player, data, io) {
  const { x, y } = data;
  
  // Validate coordinates
  if (typeof x !== 'number' || typeof y !== 'number') {
    return { success: false, error: 'Invalid coordinates' };
  }
  
  if (x < 0 || x >= room.gameState.mapWidth || y < 0 || y >= room.gameState.mapHeight) {
    return { success: false, error: 'Coordinates out of bounds' };
  }
  
  // Check if position is already occupied
  const occupied = Object.values(room.gameState.tokens).some(
    token => token.x === x && token.y === y && token.playerId !== player.id
  );
  
  if (occupied) {
    return { success: false, error: 'Position already occupied' };
  }
  
  // Update player position
  player.position = { x, y };
  room.gameState.tokens[player.id].x = x;
  room.gameState.tokens[player.id].y = y;
  
  // Broadcast updated state
  io.to(room.id).emit('roomState', getRoomState(room.id));
  io.to(room.id).emit('systemMessage', {
    message: `${player.name} moved to (${x}, ${y})`,
    timestamp: Date.now()
  });
  
  return { success: true };
}

/**
 * Handle dice roll (server-authoritative)
 */
function handleDiceRoll(room, player, data, io) {
  const { sides, count = 1 } = data;
  
  // Validate dice sides (allowed dice types)
  const allowedDice = [4, 6, 8, 10, 12, 20];
  if (!allowedDice.includes(sides)) {
    return { success: false, error: `Invalid dice type: d${sides}` };
  }
  
  if (count < 1 || count > 10) {
    return { success: false, error: 'Dice count must be between 1 and 10' };
  }
  
  // Roll dice on server
  const rolls = [];
  let total = 0;
  
  for (let i = 0; i < count; i++) {
    const roll = Math.floor(Math.random() * sides) + 1;
    rolls.push(roll);
    total += roll;
  }
  
  const result = {
    playerId: player.id,
    playerName: player.name,
    dice: `d${sides}`,
    count,
    rolls,
    total,
    timestamp: Date.now()
  };
  
  // Broadcast dice roll result to all players in room
  io.to(room.id).emit('diceRoll', result);
  io.to(room.id).emit('systemMessage', {
    message: `${player.name} rolled ${count}d${sides}: [${rolls.join(', ')}] = ${total}`,
    timestamp: Date.now()
  });
  
  return { success: true };
}

/**
 * Handle turn ending
 */
function handleEndTurn(room, io) {
  // Move to next player
  room.currentTurnIndex = (room.currentTurnIndex + 1) % room.players.length;
  
  const nextPlayer = room.players[room.currentTurnIndex];
  
  // Broadcast updated state
  io.to(room.id).emit('roomState', getRoomState(room.id));
  io.to(room.id).emit('systemMessage', {
    message: `${nextPlayer.name}'s turn`,
    timestamp: Date.now()
  });
  
  return { success: true };
}
