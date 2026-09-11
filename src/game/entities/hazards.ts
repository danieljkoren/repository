import Phaser from 'phaser';
import type { HazardConfig } from '../levels/levelData';

export function createSpider(
  _scene: Phaser.Scene,
  group: Phaser.Physics.Arcade.Group,
  cfg: Extract<HazardConfig, { type: 'spider' }>,
): Phaser.Physics.Arcade.Sprite {
  const spider = group.create(cfg.x, cfg.y, 'spider') as Phaser.Physics.Arcade.Sprite;
  const speed = cfg.speed ?? 60;
  spider.setData('kind', 'spider');
  spider.setData('baseY', cfg.y);
  spider.setData('range', cfg.range);
  spider.setData('speed', speed);
  const body = spider.body as Phaser.Physics.Arcade.Body;
  body.setAllowGravity(false);
  body.setImmovable(true);
  spider.setVelocityY(speed);
  return spider;
}

export function createBlade(
  scene: Phaser.Scene,
  group: Phaser.Physics.Arcade.Group,
  cfg: Extract<HazardConfig, { type: 'blade' }>,
): Phaser.Physics.Arcade.Sprite {
  const blade = group.create(cfg.x, cfg.y, 'blade') as Phaser.Physics.Arcade.Sprite;
  blade.setData('kind', 'blade');
  const body = blade.body as Phaser.Physics.Arcade.Body;
  body.setAllowGravity(false);
  body.setImmovable(true);
  scene.tweens.add({ targets: blade, angle: 360, duration: 1100, repeat: -1 });
  return blade;
}

export function createWindZone(
  scene: Phaser.Scene,
  cfg: Extract<HazardConfig, { type: 'wind' }>,
): Phaser.GameObjects.Zone {
  const zone = scene.add.zone(cfg.x, cfg.y, cfg.width, cfg.height);
  scene.physics.add.existing(zone, false);
  const body = zone.body as Phaser.Physics.Arcade.Body;
  body.setAllowGravity(false);
  body.moves = false;
  zone.setData('kind', 'wind');
  zone.setData('forceX', cfg.forceX);

  for (let i = 0; i < 4; i++) {
    const streak = scene.add.rectangle(
      cfg.x,
      cfg.y - cfg.height / 2 + (i + 0.5) * (cfg.height / 4),
      cfg.width,
      6,
      0xbfe9ff,
      0.25,
    );
    scene.tweens.add({
      targets: streak,
      x: streak.x + (cfg.forceX > 0 ? 30 : -30),
      duration: 700,
      yoyo: true,
      repeat: -1,
      delay: i * 120,
    });
  }

  return zone;
}
