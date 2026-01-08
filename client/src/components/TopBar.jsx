import './TopBar.css';

function TopBar({ roomName, players, currentPlayer, onLeaveRoom }) {
  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <h1 className="room-name">{roomName}</h1>
        <div className="room-id">
          Room ID: {roomName?.split(' ')[0] || 'N/A'}
        </div>
      </div>
      <div className="top-bar-center">
        <div className="players-list">
          <span className="players-label">Players:</span>
          {players?.map((player, index) => (
            <span
              key={player.id}
              className={`player-badge ${
                currentPlayer?.id === player.id ? 'current-turn' : ''
              }`}
              title={
                currentPlayer?.id === player.id ? 'Current turn' : player.name
              }
            >
              {player.name}
              {player.isGM && <span className="gm-badge">GM</span>}
            </span>
          ))}
        </div>
        {currentPlayer && (
          <div className="current-turn-indicator">
            <span className="turn-label">Current Turn:</span>
            <span className="turn-player">{currentPlayer.name}</span>
          </div>
        )}
      </div>
      <div className="top-bar-right">
        <button className="leave-button" onClick={onLeaveRoom}>
          Leave Room
        </button>
      </div>
    </div>
  );
}

export default TopBar;