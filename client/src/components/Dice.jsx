import './Dice.css';

const DICE_TYPES = [
  { sides: 20, label: 'd20' },
  { sides: 12, label: 'd12' },
  { sides: 10, label: 'd10' },
  { sides: 8, label: 'd8' },
  { sides: 6, label: 'd6' },
  { sides: 4, label: 'd4' }
];

function Dice({ onRollDice, recentResults }) {
  const handleRoll = (sides) => {
    onRollDice(sides, 1);
  };

  return (
    <div className="dice-container">
      <div className="dice-buttons">
        {DICE_TYPES.map((dice) => (
          <button
            key={dice.sides}
            className="dice-button"
            onClick={() => handleRoll(dice.sides)}
            title={`Roll ${dice.label}`}
          >
            🎲 {dice.label}
          </button>
        ))}
      </div>
      {recentResults.length > 0 && (
        <div className="dice-recent">
          <div className="recent-label">Recent:</div>
          <div className="recent-results">
            {recentResults.slice(0, 3).map((result, index) => (
              <div key={index} className="recent-result">
                <span className="recent-player">{result.playerName}</span>
                <span className="recent-roll">
                  {result.count > 1 ? `${result.count}${result.dice}` : result.dice}:{' '}
                  {result.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dice;