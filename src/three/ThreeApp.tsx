import { useState } from 'react';
import { ThreeCanvas, type GameStats } from './GameWorld';
import { LEVELS } from './levels';

type Phase = 'menu' | 'playing' | 'levelComplete' | 'gameOver' | 'victory';

const initialStats: GameStats = { score: 0, collected: 0, total: 0, health: 3, reachedGoal: false };

export function ThreeApp() {
  const [phase, setPhase] = useState<Phase>('menu');
  const [levelIndex, setLevelIndex] = useState(0);
  const [entryScore, setEntryScore] = useState(0);
  const [stats, setStats] = useState<GameStats>(initialStats);
  const [runKey, setRunKey] = useState(0);

  const level = LEVELS[levelIndex];

  const startGame = () => {
    setLevelIndex(0);
    setEntryScore(0);
    setStats(initialStats);
    setRunKey((k) => k + 1);
    setPhase('playing');
  };

  const retryLevel = () => {
    setStats({ ...initialStats, score: entryScore });
    setRunKey((k) => k + 1);
    setPhase('playing');
  };

  const advanceLevel = () => {
    const next = levelIndex + 1;
    if (next < LEVELS.length) {
      setLevelIndex(next);
      setEntryScore(stats.score);
      setStats({ ...initialStats, score: stats.score });
      setRunKey((k) => k + 1);
      setPhase('playing');
    } else {
      setPhase('victory');
    }
  };

  const handleStats = (s: GameStats) => {
    setStats(s);
    if (s.reachedGoal) setPhase('levelComplete');
    else if (s.health <= 0) setPhase('gameOver');
  };

  return (
    <div className="game-container" style={{ position: 'relative' }}>
      {phase === 'playing' && (
        <ThreeCanvas key={runKey} level={level} entryScore={entryScore} onStats={handleStats} />
      )}

      {phase === 'playing' && (
        <div style={hudStyle}>
          <div>{level.name}</div>
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

      {phase === 'menu' && (
        <div style={overlayStyle}>
          <h1 style={{ margin: 0, fontSize: 36 }}>🦋 Butterfly Palace</h1>
          <p style={{ opacity: 0.85, margin: '8px 0 20px' }}>
            3D prototype &mdash; fly through {LEVELS.length} rooms of the venue
          </p>
          <p style={{ fontSize: 14, opacity: 0.75, maxWidth: 380, textAlign: 'center' }}>
            WASD / Arrow keys to fly, Space to flap upward. Avoid the dark hazards, collect
            glowing pollen, and reach the pink portal in each room.
          </p>
          <button style={buttonStyle} onClick={startGame}>
            Start flying
          </button>
        </div>
      )}

      {phase === 'levelComplete' && (
        <div style={overlayStyle}>
          <h1 style={{ margin: 0 }}>🌿 {level.name} complete!</h1>
          <p style={{ margin: '10px 0 20px' }}>Score: {stats.score}</p>
          <button style={buttonStyle} onClick={advanceLevel}>
            {levelIndex + 1 < LEVELS.length ? `Continue to ${LEVELS[levelIndex + 1].name}` : 'Finish'}
          </button>
        </div>
      )}

      {phase === 'gameOver' && (
        <div style={overlayStyle}>
          <h1 style={{ margin: 0 }}>Caught in the canopy!</h1>
          <p style={{ margin: '10px 0 20px' }}>Score: {stats.score}</p>
          <button style={buttonStyle} onClick={retryLevel}>
            Retry {level.name}
          </button>
        </div>
      )}

      {phase === 'victory' && (
        <div style={overlayStyle}>
          <h1 style={{ margin: 0 }}>👑 You explored the whole palace!</h1>
          <p style={{ margin: '10px 0 20px' }}>Final score: {stats.score}</p>
          <button style={buttonStyle} onClick={startGame}>
            Fly again
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
