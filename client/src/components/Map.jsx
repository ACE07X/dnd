import { useState, useEffect, useRef } from 'react';
import './Map.css';

const GRID_SIZE = 30;
const INITIAL_ZOOM = 1;

function Map({ gameState, players, currentPlayer, isMyTurn, onMove }) {
  const [selectedCell, setSelectedCell] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const mapRef = useRef(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const width = gameState?.mapWidth || 20;
  const height = gameState?.mapHeight || 20;
  const tokens = gameState?.tokens || {};

  // Get token positions for rendering
  const tokenPositions = {};
  Object.values(tokens).forEach((token) => {
    tokenPositions[`${token.x},${token.y}`] = token;
  });

  // Get player info for tokens
  const getPlayerInfo = (playerId) => {
    return players?.find((p) => p.id === playerId);
  };

  const handleCellClick = (x, y) => {
    if (!isMyTurn) return;
    
    const occupied = tokenPositions[`${x},${y}`];
    if (occupied) {
      // Clicking on an occupied cell just selects it
      setSelectedCell({ x, y });
      return;
    }

    // Move to this cell
    setSelectedCell({ x, y });
    onMove(x, y);
  };

  const handleMouseDown = (e) => {
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      isDragging.current = true;
      dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
      e.preventDefault();
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging.current) {
      setOffset({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.max(0.5, Math.min(2, prev * delta)));
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isDragging.current) {
        setOffset({
          x: e.clientX - dragStart.current.x,
          y: e.clientY - dragStart.current.y
        });
      }
    };
    const handleGlobalMouseUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  // Center map initially
  useEffect(() => {
    if (mapRef.current) {
      const containerWidth = mapRef.current.offsetWidth;
      const containerHeight = mapRef.current.offsetHeight;
      const mapWidth = width * GRID_SIZE * INITIAL_ZOOM;
      const mapHeight = height * GRID_SIZE * INITIAL_ZOOM;
      
      setOffset({
        x: (containerWidth - mapWidth) / 2,
        y: (containerHeight - mapHeight) / 2
      });
    }
  }, [width, height]);

  return (
    <div
      ref={mapRef}
      className="map-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      <div
        className="map-grid"
        style={{
          width: width * GRID_SIZE * zoom,
          height: height * GRID_SIZE * zoom,
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          gridTemplateColumns: `repeat(${width}, ${GRID_SIZE * zoom}px)`,
          gridTemplateRows: `repeat(${height}, ${GRID_SIZE * zoom}px)`
        }}
      >
        {Array.from({ length: width * height }, (_, i) => {
          const x = i % width;
          const y = Math.floor(i / width);
          const key = `${x},${y}`;
          const token = tokenPositions[key];
          const playerInfo = token ? getPlayerInfo(token.playerId) : null;
          const isSelected = selectedCell?.x === x && selectedCell?.y === y;
          const isCurrentPlayerToken = token && currentPlayer?.id === token.playerId;

          return (
            <div
              key={key}
              className={`grid-cell ${isSelected ? 'selected' : ''} ${
                isMyTurn && !token ? 'movable' : ''
              }`}
              onClick={() => handleCellClick(x, y)}
              title={token ? `${playerInfo?.name || token.name} (${x}, ${y})` : `(${x}, ${y})`}
            >
              {token && (
                <div
                  className={`token ${isCurrentPlayerToken ? 'current-player' : ''}`}
                  style={{
                    backgroundColor: playerInfo?.isGM
                      ? '#aa88ff'
                      : isCurrentPlayerToken
                      ? '#d4af37'
                      : '#4a8a4a'
                  }}
                >
                  {playerInfo?.name?.[0]?.toUpperCase() || token.name[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="map-controls">
        <div className="map-hint">
          {isMyTurn
            ? 'Click on a cell to move • Ctrl+Drag to pan • Scroll to zoom'
            : `Waiting for ${currentPlayer?.name || 'your turn'}...`}
        </div>
        <div className="zoom-controls">
          <button onClick={() => setZoom((prev) => Math.max(0.5, prev - 0.1))}>−</button>
          <span>{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((prev) => Math.min(2, prev + 0.1))}>+</button>
        </div>
      </div>
    </div>
  );
}

export default Map;