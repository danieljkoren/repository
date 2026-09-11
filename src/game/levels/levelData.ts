export interface RectConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpiderConfig {
  type: 'spider';
  x: number;
  y: number;
  range: number;
  speed?: number;
}

export interface BladeConfig {
  type: 'blade';
  x: number;
  y: number;
}

export interface WindConfig {
  type: 'wind';
  x: number;
  y: number;
  width: number;
  height: number;
  forceX: number;
}

export type HazardConfig = SpiderConfig | BladeConfig | WindConfig;

export interface LevelConfig {
  key: string;
  name: string;
  width: number;
  height: number;
  bgColor: number;
  playerStart: { x: number; y: number };
  goal: { x: number; y: number };
  platforms: RectConfig[];
  hazards: HazardConfig[];
  collectibles: { x: number; y: number }[];
}

function scatterCollectibles(
  count: number,
  startX: number,
  endX: number,
  minY: number,
  maxY: number,
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const step = (endX - startX) / (count - 1);
  for (let i = 0; i < count; i++) {
    const x = startX + step * i;
    const wave = (Math.sin(i * 1.7) + 1) / 2;
    const y = minY + wave * (maxY - minY);
    points.push({ x, y });
  }
  return points;
}

const level1: LevelConfig = {
  key: 'level1',
  name: 'Garden Entrance',
  width: 2400,
  height: 600,
  bgColor: 0xffe9c7,
  playerStart: { x: 80, y: 300 },
  goal: { x: 2300, y: 260 },
  platforms: [
    { x: 1200, y: 580, width: 2400, height: 40 },
    { x: 400, y: 440, width: 160, height: 24 },
    { x: 700, y: 340, width: 140, height: 24 },
    { x: 1000, y: 460, width: 160, height: 24 },
    { x: 1300, y: 360, width: 140, height: 24 },
    { x: 1650, y: 440, width: 160, height: 24 },
    { x: 1950, y: 340, width: 140, height: 24 },
    { x: 2200, y: 420, width: 160, height: 24 },
  ],
  hazards: [
    { type: 'spider', x: 750, y: 220, range: 110, speed: 50 },
    { type: 'spider', x: 1500, y: 200, range: 140, speed: 60 },
  ],
  collectibles: scatterCollectibles(10, 200, 2260, 180, 480),
};

const level2: LevelConfig = {
  key: 'level2',
  name: 'Grand Hall',
  width: 3000,
  height: 640,
  bgColor: 0xf7d9e3,
  playerStart: { x: 80, y: 320 },
  goal: { x: 2900, y: 280 },
  platforms: [
    { x: 1500, y: 620, width: 3000, height: 40 },
    { x: 350, y: 460, width: 150, height: 24 },
    { x: 350, y: 220, width: 150, height: 24 },
    { x: 700, y: 520, width: 130, height: 24 },
    { x: 1000, y: 380, width: 150, height: 24 },
    { x: 1000, y: 200, width: 150, height: 24 },
    { x: 1350, y: 480, width: 130, height: 24 },
    { x: 1650, y: 320, width: 150, height: 24 },
    { x: 1950, y: 500, width: 150, height: 24 },
    { x: 2250, y: 300, width: 130, height: 24 },
    { x: 2550, y: 460, width: 150, height: 24 },
    { x: 2800, y: 340, width: 140, height: 24 },
  ],
  hazards: [
    { type: 'spider', x: 550, y: 300, range: 130, speed: 55 },
    { type: 'blade', x: 1000, y: 480 },
    { type: 'spider', x: 1500, y: 220, range: 150, speed: 65 },
    { type: 'blade', x: 1950, y: 380 },
    { type: 'spider', x: 2400, y: 260, range: 120, speed: 70 },
    { type: 'blade', x: 2650, y: 300 },
  ],
  collectibles: scatterCollectibles(12, 200, 2850, 160, 520),
};

const level3: LevelConfig = {
  key: 'level3',
  name: 'Throne Room',
  width: 3600,
  height: 700,
  bgColor: 0x8f6bb3,
  playerStart: { x: 80, y: 340 },
  goal: { x: 3500, y: 300 },
  platforms: [
    { x: 1800, y: 680, width: 3600, height: 40 },
    { x: 300, y: 500, width: 140, height: 24 },
    { x: 600, y: 260, width: 130, height: 24 },
    { x: 900, y: 480, width: 140, height: 24 },
    { x: 1200, y: 240, width: 130, height: 24 },
    { x: 1500, y: 520, width: 150, height: 24 },
    { x: 1800, y: 300, width: 130, height: 24 },
    { x: 2100, y: 500, width: 150, height: 24 },
    { x: 2400, y: 260, width: 130, height: 24 },
    { x: 2700, y: 480, width: 150, height: 24 },
    { x: 3000, y: 300, width: 130, height: 24 },
    { x: 3300, y: 460, width: 150, height: 24 },
  ],
  hazards: [
    { type: 'spider', x: 450, y: 350, range: 150, speed: 60 },
    { type: 'wind', x: 750, y: 380, width: 120, height: 260, forceX: -140 },
    { type: 'blade', x: 1050, y: 340 },
    { type: 'spider', x: 1350, y: 300, range: 160, speed: 70 },
    { type: 'wind', x: 1650, y: 400, width: 120, height: 260, forceX: -160 },
    { type: 'blade', x: 1950, y: 420 },
    { type: 'spider', x: 2250, y: 350, range: 150, speed: 75 },
    { type: 'wind', x: 2550, y: 380, width: 120, height: 260, forceX: -160 },
    { type: 'blade', x: 2850, y: 340 },
    { type: 'spider', x: 3150, y: 320, range: 140, speed: 80 },
  ],
  collectibles: scatterCollectibles(15, 220, 3450, 180, 560),
};

export const LEVELS: LevelConfig[] = [level1, level2, level3];
