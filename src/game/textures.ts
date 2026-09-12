import Phaser from 'phaser';

function drawButterfly(g: Phaser.GameObjects.Graphics, wingsUp: boolean) {
  const lift = wingsUp ? -8 : -1;

  g.fillStyle(0xff6fae, 1);
  g.fillEllipse(14, 20 + lift, 20, 24);
  g.fillEllipse(34, 20 + lift, 20, 24);

  g.fillStyle(0xffe1f0, 1);
  g.fillEllipse(14, 20 + lift, 9, 11);
  g.fillEllipse(34, 20 + lift, 9, 11);

  g.fillStyle(0xffd76a, 0.9);
  g.fillEllipse(14, 20 + lift, 4, 5);
  g.fillEllipse(34, 20 + lift, 4, 5);

  g.fillStyle(0x3a2b52, 1);
  g.fillEllipse(24, 22, 7, 18);

  g.lineStyle(2, 0x3a2b52, 1);
  g.lineBetween(22, 10, 17, 3);
  g.lineBetween(26, 10, 31, 3);
  g.fillStyle(0x3a2b52, 1);
  g.fillCircle(17, 3, 2);
  g.fillCircle(31, 3, 2);
}

function drawSpider(g: Phaser.GameObjects.Graphics) {
  g.fillStyle(0x4a3728, 1);
  g.fillCircle(12, 14, 9);
  g.fillCircle(12, 6, 5);
  g.lineStyle(2, 0x3a2b1f, 1);
  for (let i = 0; i < 4; i++) {
    const spread = 6 + i * 3;
    g.lineBetween(12, 14, 2 - i, 10 + spread * 0.4);
    g.lineBetween(12, 14, 22 + i, 10 + spread * 0.4);
  }
  g.fillStyle(0xcc3333, 1);
  g.fillCircle(9, 5, 1.4);
  g.fillCircle(15, 5, 1.4);
}

function drawBlade(g: Phaser.GameObjects.Graphics) {
  const cx = 30;
  const cy = 30;
  g.fillStyle(0xd8d8ec, 1);
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const x1 = cx + Math.cos(angle) * 26;
    const y1 = cy + Math.sin(angle) * 26;
    const x2 = cx + Math.cos(angle + 0.5) * 8;
    const y2 = cy + Math.sin(angle + 0.5) * 8;
    const x3 = cx + Math.cos(angle - 0.5) * 8;
    const y3 = cy + Math.sin(angle - 0.5) * 8;
    g.fillTriangle(x1, y1, x2, y2, x3, y3);
  }
  g.fillStyle(0x9c8760, 1);
  g.fillCircle(cx, cy, 7);
}

function drawRainforestBG(g: Phaser.GameObjects.Graphics) {
  // Transparent base so each level's own background color shows through;
  // only hanging vines and a canopy patch are drawn, tiled across the level.
  for (const cx of [30, 226]) {
    g.fillStyle(0x2f5233, 0.4);
    g.fillRoundedRect(cx - 9, 0, 18, 256, 9);
    g.fillStyle(0x3f6b3f, 0.5);
    g.fillCircle(cx, 44, 17);
    g.fillCircle(cx - 6, 100, 13);
    g.fillCircle(cx + 5, 158, 15);
    g.fillCircle(cx, 218, 12);
  }
  g.fillStyle(0x3f6b3f, 0.35);
  g.fillCircle(128, 16, 46);
  g.fillStyle(0xffffff, 0.1);
  g.fillCircle(128, 56, 30);
}

export function generateTextures(scene: Phaser.Scene) {
  const g = scene.add.graphics();

  drawButterfly(g, true);
  g.generateTexture('butterfly-up', 48, 44);
  g.clear();

  drawButterfly(g, false);
  g.generateTexture('butterfly-down', 48, 44);
  g.clear();

  g.fillStyle(0xffd76a, 1);
  g.fillCircle(8, 8, 8);
  g.fillStyle(0xfff3c4, 0.85);
  g.fillCircle(8, 8, 4);
  g.generateTexture('pollen', 16, 16);
  g.clear();

  g.fillStyle(0x8a8578, 1);
  g.fillRect(0, 0, 64, 32);
  g.lineStyle(2, 0x5c5848, 1);
  g.strokeRect(0, 0, 64, 32);
  g.lineBetween(0, 12, 64, 12);
  g.fillStyle(0x5a7a45, 0.75);
  g.fillEllipse(12, 24, 16, 9);
  g.fillEllipse(46, 26, 18, 8);
  g.fillStyle(0x4a6b38, 0.55);
  g.fillEllipse(30, 6, 12, 6);
  g.generateTexture('platform', 64, 32);
  g.clear();

  drawSpider(g);
  g.generateTexture('spider', 24, 24);
  g.clear();

  drawBlade(g);
  g.generateTexture('blade', 60, 60);
  g.clear();

  g.fillStyle(0xff6fae, 1);
  g.fillCircle(32, 32, 30);
  g.fillStyle(0xffb3d9, 1);
  g.fillCircle(32, 32, 22);
  g.fillStyle(0xffe1f0, 1);
  g.fillCircle(32, 32, 12);
  g.fillStyle(0xffd76a, 1);
  g.fillCircle(32, 32, 5);
  g.generateTexture('goal', 64, 64);
  g.clear();

  drawRainforestBG(g);
  g.generateTexture('rainforest-bg', 256, 256);
  g.clear();

  g.destroy();
}
