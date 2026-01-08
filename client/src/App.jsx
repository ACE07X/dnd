import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import GameRoom from './components/GameRoom';
import Lobby from './components/Lobby';
import './App.css';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

function App() {
  const [socket, setSocket] = useState(null);
  const [room, setRoom] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setError(null);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    newSocket.on('error', (errorData) => {
      console.error('Socket error:', errorData);
      setError(errorData.message || 'An error occurred');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const handleCreateRoom = (name) => {
    setPlayerName(name);
    socket.emit('createRoom', { playerName: name });
    
    socket.once('roomCreated', (roomData) => {
      setRoom(roomData);
    });
  };

  const handleJoinRoom = (roomId, name) => {
    setPlayerName(name);
    socket.emit('joinRoom', { roomId, playerName: name });
    
    socket.once('roomJoined', (roomData) => {
      setRoom(roomData);
    });
  };

  const handleLeaveRoom = () => {
    setRoom(null);
    setPlayerName('');
  };

  if (!socket) {
    return (
      <div className="app-loading">
        <p>Connecting to server...</p>
      </div>
    );
  }

  if (room) {
    return (
      <GameRoom
        socket={socket}
        room={room}
        playerName={playerName}
        onLeaveRoom={handleLeaveRoom}
      />
    );
  }

  return (
    <div className="app">
      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
      <Lobby
        socket={socket}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
      />
    </div>
  );
}

export default App;