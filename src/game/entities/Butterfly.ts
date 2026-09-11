import Phaser from 'phaser';

const MOVE_ACCEL = 900;
const MAX_MOVE_SPEED = 220;
const DRAG_X = 900;
const FLAP_ACCEL = 900;
const MAX_UP_SPEED = 260;
const MAX_DOWN_SPEED = 420;

export interface ButterflyKeys {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
}

export class Butterfly extends Phaser.Physics.Arcade.Sprite {
  health = 3;
  invulnerable = false;

  private flapTimer = 0;
  private wingUp = true;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'butterfly-up');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setDragX(DRAG_X);
    body.setMaxVelocity(MAX_MOVE_SPEED, MAX_DOWN_SPEED);
    body.setSize(28, 26);
    body.setOffset(10, 12);
  }

  update(_time: number, delta: number, keys: ButterflyKeys) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const dt = delta / 1000;

    if (keys.left) {
      body.setAccelerationX(-MOVE_ACCEL);
      this.setFlipX(true);
    } else if (keys.right) {
      body.setAccelerationX(MOVE_ACCEL);
      this.setFlipX(false);
    } else {
      body.setAccelerationX(0);
    }

    if (keys.up) {
      body.velocity.y = Math.max(body.velocity.y - FLAP_ACCEL * dt, -MAX_UP_SPEED);
    }
    if (keys.down) {
      body.velocity.y = Math.min(body.velocity.y + FLAP_ACCEL * dt, MAX_DOWN_SPEED);
    }

    this.flapTimer += delta;
    const flapping = keys.up || keys.left || keys.right;
    const interval = flapping ? 80 : 160;
    if (this.flapTimer > interval) {
      this.flapTimer = 0;
      this.wingUp = !this.wingUp;
      this.setTexture(this.wingUp ? 'butterfly-up' : 'butterfly-down');
    }
  }

  hit(knockbackX: number): boolean {
    if (this.invulnerable) return false;
    this.health -= 1;
    this.invulnerable = true;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(knockbackX, -200);

    this.scene.tweens.add({
      targets: this,
      alpha: 0.25,
      duration: 90,
      yoyo: true,
      repeat: 7,
      onComplete: () => {
        this.alpha = 1;
        this.invulnerable = false;
      },
    });
    return true;
  }
}
