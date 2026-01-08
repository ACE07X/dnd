import { useState, useEffect } from 'react';
import TopBar from './TopBar';
import Map from './Map';
import Chat from './Chat';
import Dice from './Dice';
import './GameRoom.css';

function GameRoom({ socket, room: initialRoom, playerName, onLeaveRoom }) {
  const [roomState, setRoomState] = useState(initialRoom);
  const [messages, setMessages] = useState([]);
  const [diceResults, setDiceResults] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!socket) return;

    // Listen for room state updates
    const handleRoomState = (state) => {
      setRoomState(state);
    };

    // Listen for system messages
    const handleSystemMessage = (msg) => {
      setMessages((prev) => [
        ...prev,
        {
          type: 'system',
          message: msg.message,
          timestamp: msg.timestamp || Date.now()
        }
      ]);
    };

    // Listen for chat messages
    const handleChatMessage = (msg) => {
      setMessages((prev) => [
        ...prev,
        {
          type: 'chat',
          player: msg.player,
          message: msg.message,
          timestamp: msg.timestamp || Date.now()
        }
      ]);
    };

    // Listen for dice rolls
    const handleDiceRoll = (result) => {
      setDiceResults((prev) => [result, ...prev].slice(0, 10)); // Keep last 10
      setMessages((prev) => [
        ...prev,
        {
          type: 'dice',
          player: result.playerName,
          dice: result.dice,
          count: result.count,
          rolls: result.rolls,
          total: result.total,
          timestamp: result.timestamp
        }
      ]);
    };

    // Listen for errors
    const handleError = (errorData) => {
      setError(errorData.message || 'An error occurred');
      setTimeout(() => setError(null), 5000);
    };

    socket.on('roomState', handleRoomState);
    socket.on('systemMessage', handleSystemMessage);
    socket.on('chatMessage', handleChatMessage);
    socket.on('diceRoll', handleDiceRoll);
    socket.on('error', handleError);

    // Add welcome message
    setMessages([
      {
        type: 'system',
        message: `Welcome to ${roomState.roomName || 'the game'}!`,
        timestamp: Date.now()
      }
    ]);

    return () => {
      socket.off('roomState', handleRoomState);
      socket.off('systemMessage', handleSystemMessage);
      socket.off('chatMessage', handleChatMessage);
      socket.off('diceRoll', handleDiceRoll);
      socket.off('error', handleError);
    };
  }, [socket, roomState.roomName]);

  const handleSendMessage = (message) => {
    if (message.trim()) {
      socket.emit('chatMessage', { message: message.trim() });
    }
  };

  const handleRollDice = (sides, count = 1) => {
    socket.emit('gameAction', {
      action: 'rollDice',
      data: { sides, count }
    });
  };

  const handleMove = (x, y) => {
    socket.emit('gameAction', {
      action: 'move',
      data: { x, y }
    });
  };

  const handleEndTurn = () => {
    socket.emit('gameAction', {
      action: 'endTurn',
      data: {}
    });
  };

  const isMyTurn = roomState?.currentPlayer?.name === playerName;

  return (
    <div className="game-room">
      {error && (
        <div className="game-error">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
      <TopBar
        roomName={roomState?.roomName || 'Unknown Room'}
        players={roomState?.players || []}
        currentPlayer={roomState?.currentPlayer}
        onLeaveRoom={onLeaveRoom}
      />
      <div className="game-main">
        <div className="game-sidebar">
          <Chat
            messages={messages}
            onSendMessage={handleSendMessage}
            playerName={playerName}
          />
        </div>
        <div className="game-center">
          <Map
            gameState={roomState?.gameState}
            players={roomState?.players || []}
            currentPlayer={roomState?.currentPlayer}
            isMyTurn={isMyTurn}
            onMove={handleMove}
          />
        </div>
      </div>
      <div className="game-footer">
        <Dice onRollDice={handleRollDice} recentResults={diceResults} />
        <div className="game-actions">
          <button
            className="action-button end-turn-button"
            onClick={handleEndTurn}
            disabled={!isMyTurn}
            title={isMyTurn ? 'End your turn' : 'Wait for your turn'}
          >
            End Turn
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameRoom;