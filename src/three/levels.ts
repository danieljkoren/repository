export interface HazardConfig {
  x: number;
  z: number;
  baseY: number;
  range: number;
  speed: number;
}

export interface CollectibleSpec {
  count: number;
  xSpread: number;
  yBase: number;
  ySpread: number;
  zStart: number;
  zEnd: number;
}

export type RoomShape = 'box' | 'rotunda' | 'maze';

export interface LevelConfig {
  key: string;
  name: string;
  /** Placeholder name pulled from a low-resolution photo of the venue's site map -- likely
   * wrong in the small details, confirm against the real signage/labels later. */
  isPlaceholderName: boolean;
  shape: RoomShape;
  halfWidth: number;
  height: number;
  entranceZ: number;
  farZ: number;
  fogColor: string;
  wallTint: string;
  floorTint: string;
  hazards: HazardConfig[];
  collectibles: CollectibleSpec;
  treeScale?: number;
}

export const LEVELS: LevelConfig[] = [
  {
    key: 'atrium',
    name: 'Rainforest Atrium',
    isPlaceholderName: false,
    shape: 'box',
    halfWidth: 16,
    height: 13,
    entranceZ: 11,
    farZ: -24,
    fogColor: '#cfe8c0',
    wallTint: '#ffffff',
    floorTint: '#ffffff',
    hazards: [
      { x: -6, z: -8, baseY: 5, range: 2.5, speed: 0.8 },
      { x: 5, z: -16, baseY: 6, range: 3, speed: 1.1 },
      { x: -3, z: -19, baseY: 4.5, range: 2, speed: 1.4 },
    ],
    collectibles: { count: 10, xSpread: 6, yBase: 3, ySpread: 2, zStart: 4, zEnd: -19 },
    treeScale: 1,
  },
  {
    key: 'banyan',
    name: 'Great Banyan Tree Rotunda',
    isPlaceholderName: true,
    shape: 'rotunda',
    halfWidth: 20,
    height: 18,
    entranceZ: 16,
    farZ: -16,
    fogColor: '#e9dfc4',
    wallTint: '#d9cba3',
    floorTint: '#c9bb90',
    hazards: [
      { x: -8, z: 4, baseY: 8, range: 4, speed: 0.7 },
      { x: 8, z: -4, baseY: 10, range: 4, speed: 0.9 },
      { x: 0, z: -12, baseY: 6, range: 3, speed: 1.2 },
      { x: -6, z: -8, baseY: 12, range: 3, speed: 1.0 },
    ],
    collectibles: { count: 14, xSpread: 10, yBase: 6, ySpread: 4, zStart: 9, zEnd: -13 },
    treeScale: 2.6,
  },
  {
    key: 'theater',
    name: 'Rainforest Theater',
    isPlaceholderName: true,
    shape: 'box',
    halfWidth: 11,
    height: 9,
    entranceZ: 9,
    farZ: -18,
    fogColor: '#1b2233',
    wallTint: '#4a5266',
    floorTint: '#2e3446',
    hazards: [
      { x: -4, z: -4, baseY: 4, range: 1.8, speed: 1.3 },
      { x: 4, z: -10, baseY: 5, range: 2, speed: 1.0 },
    ],
    collectibles: { count: 8, xSpread: 4, yBase: 3.5, ySpread: 1.5, zStart: 2, zEnd: -15 },
  },
  {
    key: 'conservatory',
    name: 'Emerald Conservatory',
    isPlaceholderName: true,
    shape: 'box',
    halfWidth: 14,
    height: 12,
    entranceZ: 10,
    farZ: -22,
    fogColor: '#bfe6d8',
    wallTint: '#a8ddc9',
    floorTint: '#dff2ea',
    hazards: [
      { x: -5, z: -6, baseY: 6, range: 3, speed: 1.0 },
      { x: 5, z: -14, baseY: 5, range: 3, speed: 1.3 },
      { x: -2, z: -19, baseY: 7, range: 2.5, speed: 0.9 },
    ],
    collectibles: { count: 12, xSpread: 8, yBase: 4, ySpread: 3, zStart: 3, zEnd: -18 },
    treeScale: 1.4,
  },
];
