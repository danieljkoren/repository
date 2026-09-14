export interface HazardConfig {
  x: number;
  z: number;
  baseY: number;
  range: number;
  speed: number;
}

export interface CollectibleSpec {
  count: number;
  /** Lateral offset amplitude from the path centerline (path shape) or from x=0 (box/rotunda). */
  xSpread: number;
  yBase: number;
  ySpread: number;
  zStart: number;
  zEnd: number;
}

export type RoomShape = 'box' | 'rotunda' | 'path';

export interface PathPoint {
  x: number;
  z: number;
}

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
  /** Only used when shape === 'path': the corridor's centerline, entrance to goal. */
  path?: PathPoint[];
  pathWidth?: number;
  wallHeight?: number;
  /** Mirror-finish walls instead of foliage (Emerald Forest Mirror Maze). */
  mirrored?: boolean;
  /** Line the corridor walls with terrarium exhibits (Rainforest Critter Center). */
  terrariums?: boolean;
  /** Add a waterfall decoration partway down the corridor. */
  waterfall?: boolean;
}

export const LEVELS: LevelConfig[] = [
  {
    key: 'atrium',
    name: 'Rainforest Atrium',
    isPlaceholderName: false,
    shape: 'path',
    halfWidth: 16,
    height: 13,
    entranceZ: 14,
    farZ: -26,
    fogColor: '#cfe8c0',
    wallTint: '#ffffff',
    floorTint: '#ffffff',
    path: [
      { x: 0, z: 14 },
      { x: 5, z: 2 },
      { x: -4, z: -10 },
      { x: 2, z: -26 },
    ],
    pathWidth: 9,
    wallHeight: 2.2,
    waterfall: true,
    hazards: [
      { x: 3, z: -2, baseY: 5, range: 2.5, speed: 0.8 },
      { x: -2, z: -14, baseY: 6, range: 3, speed: 1.1 },
      { x: 3, z: -22, baseY: 4.5, range: 2, speed: 1.4 },
    ],
    collectibles: { count: 10, xSpread: 3, yBase: 3, ySpread: 2, zStart: 0, zEnd: 1 },
    treeScale: 1,
  },
  {
    key: 'critterCenter',
    name: 'Rainforest Critter Center',
    isPlaceholderName: true,
    shape: 'path',
    halfWidth: 12,
    height: 8,
    entranceZ: 12,
    farZ: -18,
    fogColor: '#26301f',
    wallTint: '#5c6b4a',
    floorTint: '#3a4530',
    path: [
      { x: 0, z: 12 },
      { x: 0, z: -18 },
    ],
    pathWidth: 6,
    wallHeight: 3,
    terrariums: true,
    hazards: [
      { x: -1.5, z: 2, baseY: 3, range: 0.8, speed: 1.6 },
      { x: 1.5, z: -6, baseY: 2.5, range: 0.6, speed: 2.0 },
      { x: -1.5, z: -13, baseY: 3.2, range: 0.9, speed: 1.4 },
    ],
    collectibles: { count: 9, xSpread: 1.8, yBase: 2.8, ySpread: 1, zStart: 0, zEnd: 1 },
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
    key: 'mirrorMaze',
    name: 'Emerald Forest Mirror Maze',
    isPlaceholderName: true,
    shape: 'path',
    halfWidth: 10,
    height: 9,
    entranceZ: 14,
    farZ: -22,
    fogColor: '#0e2a24',
    wallTint: '#bfe9df',
    floorTint: '#173a32',
    path: [
      { x: 0, z: 14 },
      { x: -6, z: 5 },
      { x: 6, z: -3 },
      { x: -6, z: -11 },
      { x: 0, z: -22 },
    ],
    pathWidth: 6,
    wallHeight: 4,
    mirrored: true,
    hazards: [
      { x: -3, z: 6, baseY: 4, range: 1.5, speed: 1.2 },
      { x: 3, z: -4, baseY: 3.5, range: 1.5, speed: 1.5 },
      { x: -3, z: -12, baseY: 4, range: 1.5, speed: 1.3 },
    ],
    collectibles: { count: 10, xSpread: 2, yBase: 3.2, ySpread: 1.2, zStart: 0, zEnd: 1 },
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
];
