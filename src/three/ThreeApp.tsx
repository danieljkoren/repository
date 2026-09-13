import { useState } from 'react';
import { ThreeCanvas, type GameStats } from './GameWorld';

const initialStats: GameStats = { score: 0, collected: 0, total: 0, health: 3, reachedGoal: false };

export function ThreeApp() {
  const [started, setStarted] = useState(false);
  const [stats, setStats] = useState<GameStats>(initialStats);
  const [runKey, setRunKey] = useState(0);

  const restart = () => {
    setStats(initialStats);
    setRunKey((k) => k + 1);
    setStarted(true);
  };

  return (
    <div className="game-container" style={{ position: 'relative' }}>
      {started && <ThreeCanvas key={runKey} onStats={setStats} />}

      {started && (
        <div style={hudStyle}>
          <div>Score: {stats.score}</div>
          <div>
            Pollen: {stats.collected}/{stats.total}
          </div>
          <div>
            {'❤'.repeat(stats.health)}
            {'♡'.repeat(Math.max(0, 3 - stats.health))}
          </div>
        </div>
      )}

      {!started && (
        <div style={overlayStyle}>
          <h1 style={{ margin: 0, fontSize: 36 }}>🦋 Butterfly Palace</h1>
          <p style={{ opacity: 0.85, margin: '8px 0 20px' }}>
            3D prototype — fly through the Rainforest Atrium
          </p>
          <p style={{ fontSize: 14, opacity: 0.75, maxWidth: 380, textAlign: 'center' }}>
            WASD / Arrow keys to fly, Space to flap upward. Avoid the dark hazards, collect
            glowing pollen, and reach the pink portal.
          </p>
          <button style={buttonStyle} onClick={restart}>
            Start flying
          </button>
        </div>
      )}

      {started && stats.reachedGoal && (
        <div style={overlayStyle}>
          <h1 style={{ margin: 0 }}>🌿 You reached the portal!</h1>
          <p style={{ margin: '10px 0 20px' }}>Final score: {stats.score}</p>
          <button style={buttonStyle} onClick={restart}>
            Fly again
          </button>
        </div>
      )}

      {started && stats.health <= 0 && !stats.reachedGoal && (
        <div style={overlayStyle}>
          <h1 style={{ margin: 0 }}>Caught in the canopy!</h1>
          <p style={{ margin: '10px 0 20px' }}>Score: {stats.score}</p>
          <button style={buttonStyle} onClick={restart}>
            Retry
          </button>
        </div>
      )}
    </div>
  );
}

const hudStyle: React.CSSProperties = {
  position: 'absolute',
  top: 12,
  left: 16,
  color: '#ffffff',
  textShadow: '0 0 4px #12201a, 0 0 4px #12201a',
  fontFamily: 'system-ui, sans-serif',
  fontWeight: 700,
  fontSize: 16,
  lineHeight: 1.5,
  pointerEvents: 'none',
};

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(18, 32, 26, 0.88)',
  color: '#ffffff',
  fontFamily: 'system-ui, sans-serif',
  textAlign: 'center',
  padding: 24,
};

const buttonStyle: React.CSSProperties = {
  padding: '12px 28px',
  fontSize: 16,
  fontWeight: 700,
  color: '#12201a',
  background: '#ffd76a',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
};
