import { useState } from 'react';
import './Lobby.css';

function Lobby({ onCreateRoom, onJoinRoom }) {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);

  const handleCreate = (e) => {
    e.preventDefault();
    if (playerName.trim()) {
      onCreateRoom(playerName.trim());
    }
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (playerName.trim() && roomId.trim()) {
      onJoinRoom(roomId.trim().toUpperCase(), playerName.trim());
    }
  };

  return (
    <div className="lobby">
      <div className="lobby-container">
        <h1 className="lobby-title">D&D Tabletop RPG</h1>
        <p className="lobby-subtitle">Multiplayer Online Role-Playing Game</p>

        <div className="lobby-forms">
          <form onSubmit={handleCreate} className="lobby-form">
            <h2>Create New Game</h2>
            <input
              type="text"
              placeholder="Your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              required
              className="lobby-input"
            />
            <button type="submit" className="lobby-button lobby-button-primary">
              Create Room
            </button>
          </form>

          <div className="lobby-divider">
            <span>OR</span>
          </div>

          <form
            onSubmit={handleJoin}
            className={`lobby-form ${showJoinForm ? 'active' : ''}`}
          >
            <h2>Join Existing Game</h2>
            {showJoinForm && (
              <>
                <input
                  type="text"
                  placeholder="Room ID (e.g., ABCD-1234)"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  maxLength={9}
                  pattern="[A-Z]{4}-[0-9]{4}"
                  className="lobby-input"
                />
              </>
            )}
            <input
              type="text"
              placeholder="Your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
              required
              className="lobby-input"
            />
            {!showJoinForm && (
              <button
                type="button"
                onClick={() => setShowJoinForm(true)}
                className="lobby-button"
              >
                Join Room
              </button>
            )}
            {showJoinForm && (
              <>
                <button type="submit" className="lobby-button lobby-button-primary">
                  Join
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinForm(false);
                    setRoomId('');
                  }}
                  className="lobby-button lobby-button-secondary"
                >
                  Cancel
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Lobby;