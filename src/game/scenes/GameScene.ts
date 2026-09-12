import Phaser from 'phaser';
import { Butterfly } from '../entities/Butterfly';
import { createBlade, createSpider, createWindZone } from '../entities/hazards';
import { LEVELS, type LevelConfig } from '../levels/levelData';

interface GameSceneData {
  levelIndex: number;
  entryScore: number;
}

export class GameScene extends Phaser.Scene {
  private levelIndex = 0;
  private entryScore = 0;
  private level!: LevelConfig;

  private player!: Butterfly;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private hazards!: Phaser.Physics.Arcade.Group;
  private windZones: Phaser.GameObjects.Zone[] = [];
  private collectibles!: Phaser.Physics.Arcade.StaticGroup;
  private goal!: Phaser.Physics.Arcade.Sprite;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;

  private score = 0;
  private totalCollectibles = 0;
  private collected = 0;
  private startTime = 0;
  private ended = false;

  private scoreText!: Phaser.GameObjects.Text;
  private pollenText!: Phaser.GameObjects.Text;
  private hearts: Phaser.GameObjects.Text[] = [];

  constructor() {
    super('Game');
  }

  init(data: GameSceneData) {
    this.levelIndex = data.levelIndex ?? 0;
    this.entryScore = data.entryScore ?? 0;
    this.level = LEVELS[this.levelIndex];
    this.score = this.entryScore;
    this.collected = 0;
    this.ended = false;
  }

  create() {
    const { level } = this;

    this.physics.world.setBounds(0, 0, level.width, level.height);
    this.cameras.main.setBounds(0, 0, level.width, level.height);
    this.cameras.main.setBackgroundColor(level.bgColor);

    this.add
      .tileSprite(0, 0, level.width, level.height, 'rainforest-bg')
      .setOrigin(0, 0)
      .setScrollFactor(0.3);

    this.platforms = this.physics.add.staticGroup();
    level.platforms.forEach((p) => {
      const plat = this.platforms.create(p.x, p.y, 'platform') as Phaser.Physics.Arcade.Sprite;
      plat.setDisplaySize(p.width, p.height).refreshBody();
    });

    this.player = new Butterfly(this, level.playerStart.x, level.playerStart.y);
    this.player.health = 3;
    this.physics.add.collider(this.player, this.platforms);

    this.hazards = this.physics.add.group({ allowGravity: false });
    this.windZones = [];
    level.hazards.forEach((h) => {
      if (h.type === 'spider') createSpider(this, this.hazards, h);
      else if (h.type === 'blade') createBlade(this, this.hazards, h);
      else if (h.type === 'wind') this.windZones.push(createWindZone(this, h));
    });
    this.physics.add.overlap(this.player, this.hazards, this.onHazardHit, undefined, this);
    if (this.windZones.length) {
      this.physics.add.overlap(this.player, this.windZones, this.onWindOverlap, undefined, this);
    }

    this.collectibles = this.physics.add.staticGroup();
    level.collectibles.forEach((c) => {
      this.collectibles.create(c.x, c.y, 'pollen');
    });
    this.totalCollectibles = level.collectibles.length;
    this.physics.add.overlap(this.player, this.collectibles, this.onCollect, undefined, this);

    this.goal = this.physics.add.staticSprite(level.goal.x, level.goal.y, 'goal');
    this.tweens.add({
      targets: this.goal,
      scale: 1.12,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });
    this.physics.add.overlap(this.player, this.goal, this.onGoal, undefined, this);

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<
      'W' | 'A' | 'S' | 'D',
      Phaser.Input.Keyboard.Key
    >;

    this.startTime = this.time.now;
    this.buildHUD();
  }

  private buildHUD() {
    const hudStyle = { stroke: '#1b1330', strokeThickness: 4 };
    this.scoreText = this.add
      .text(16, 12, 'Score: 0', {
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold',
        ...hudStyle,
      })
      .setScrollFactor(0);
    this.pollenText = this.add
      .text(16, 36, `Pollen: 0/${this.totalCollectibles}`, {
        fontSize: '14px',
        color: '#ffffff',
        ...hudStyle,
        strokeThickness: 3,
      })
      .setScrollFactor(0);
    this.add
      .text(this.scale.width / 2, 12, this.level.name, {
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold',
        ...hudStyle,
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0);

    this.hearts = [];
    for (let i = 0; i < 3; i++) {
      const heart = this.add
        .text(this.scale.width - 100 + i * 28, 12, '❤', {
          fontSize: '22px',
          color: '#ff6fae',
          stroke: '#1b1330',
          strokeThickness: 3,
        })
        .setScrollFactor(0);
      this.hearts.push(heart);
    }
  }

  private updateHUD() {
    this.scoreText.setText(`Score: ${this.score}`);
    this.pollenText.setText(`Pollen: ${this.collected}/${this.totalCollectibles}`);
    this.hearts.forEach((h, i) => h.setAlpha(i < this.player.health ? 1 : 0.2));
  }

  private onCollect(_player: unknown, pollen: unknown) {
    (pollen as Phaser.Physics.Arcade.Sprite).destroy();
    this.score += 10;
    this.collected += 1;
    this.updateHUD();
  }

  private onWindOverlap(_player: unknown, zoneObj: unknown) {
    const zone = zoneObj as Phaser.GameObjects.Zone;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const force = zone.getData('forceX') as number;
    body.velocity.x += force * (this.game.loop.delta / 1000);
  }

  private onHazardHit(_player: unknown, hazardObj: unknown) {
    if (this.ended) return;
    const hazard = hazardObj as Phaser.GameObjects.Sprite;
    const dir = this.player.x < hazard.x ? -1 : 1;
    const hit = this.player.hit(dir * 260);
    if (!hit) return;
    this.updateHUD();
    this.cameras.main.shake(150, 0.006);
    if (this.player.health <= 0) this.gameOver();
  }

  private onGoal() {
    if (this.ended) return;
    this.completeLevel();
  }

  private completeLevel() {
    this.ended = true;
    this.physics.pause();
    const elapsedSeconds = Math.floor((this.time.now - this.startTime) / 1000);
    const bonus = Math.max(0, 500 - elapsedSeconds * 2);
    const finalScore = this.score + bonus;
    const nextLevel = this.levelIndex + 1;

    if (nextLevel < LEVELS.length) {
      this.scene.start('LevelComplete', {
        levelName: this.level.name,
        bonus,
        score: finalScore,
        nextLevel,
      });
    } else {
      this.scene.start('Victory', { score: finalScore });
    }
  }

  private gameOver() {
    this.ended = true;
    this.physics.pause();
    this.cameras.main.fade(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
      this.scene.start('GameOver', {
        levelIndex: this.levelIndex,
        entryScore: this.entryScore,
        levelName: this.level.name,
      });
    });
  }

  update(time: number, delta: number) {
    if (this.ended) return;

    const keys = {
      left: this.cursors.left.isDown || this.wasd.A.isDown,
      right: this.cursors.right.isDown || this.wasd.D.isDown,
      up: this.cursors.up.isDown || this.wasd.W.isDown,
      down: this.cursors.down.isDown || this.wasd.S.isDown,
    };
    this.player.update(time, delta, keys);

    this.hazards.children.iterate((child) => {
      const obj = child as Phaser.Physics.Arcade.Sprite;
      if (obj.getData('kind') === 'spider') {
        const baseY = obj.getData('baseY') as number;
        const range = obj.getData('range') as number;
        const speed = obj.getData('speed') as number;
        if (obj.y >= baseY + range) obj.setVelocityY(-speed);
        else if (obj.y <= baseY - range) obj.setVelocityY(speed);
      }
      return true;
    });

    if (this.player.y > this.level.height + 60) {
      const hit = this.player.hit(0);
      this.player.setPosition(this.level.playerStart.x, this.level.playerStart.y);
      (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
      if (hit) this.updateHUD();
      if (this.player.health <= 0) this.gameOver();
    }
  }
}
