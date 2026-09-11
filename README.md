# Butterfly Palace

A flying platformer/adventure built with React, TypeScript, and Phaser 3. Guide a
butterfly through the rooms of a palace, dodging spiders and rotating blades,
collecting pollen, and fighting through wind gusts to reach each level's flower
portal.

## Controls

- **Arrow keys / WASD** — fly (hold up/down to flap and dive, left/right to move)
- Avoid spiders and blades — 3 hearts before it's game over
- Collect pollen for score, reach the glowing portal to finish a level

## Running locally

```bash
npm install
npm run dev
```

Then open the printed local URL in your browser.

## Project structure

- `src/game/textures.ts` — procedurally draws all placeholder sprites (butterfly,
  spider, blade, pollen, platforms, background) as Phaser textures. Swap this out
  once real art assets are available.
- `src/game/levels/levelData.ts` — level layouts (platforms, hazards, collectibles,
  goal) for the three levels.
- `src/game/entities/` — the `Butterfly` player class and hazard factories (spider,
  blade, wind zone).
- `src/game/scenes/` — Phaser scenes: Boot (texture generation), Menu, Game
  (gameplay), LevelComplete, GameOver, Victory.
- `src/game/PhaserGame.tsx` — React component that mounts the Phaser canvas.

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check and build for production
- `npm run lint` — run Oxlint
