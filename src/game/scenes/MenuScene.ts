import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#2f2447');

    this.add
      .tileSprite(0, 0, width, height, 'palace-bg')
      .setOrigin(0, 0);

    this.add
      .text(width / 2, height * 0.22, '🦋 Butterfly Palace', {
        fontSize: '46px',
        color: '#ffe1f0',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.34, 'A flying adventure through the royal gardens', {
        fontSize: '18px',
        color: '#c9b8dd',
      })
      .setOrigin(0.5);

    const butterfly = this.add.image(width / 2, height * 0.5, 'butterfly-up').setScale(2.4);
    this.tweens.add({
      targets: butterfly,
      y: butterfly.y - 16,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    this.time.addEvent({
      delay: 140,
      loop: true,
      callback: () => {
        butterfly.setTexture(butterfly.texture.key === 'butterfly-up' ? 'butterfly-down' : 'butterfly-up');
      },
    });

    this.add
      .text(
        width / 2,
        height * 0.68,
        'Arrow Keys / WASD to fly\nAvoid spiders & blades • Collect pollen • Reach the flower portal',
        { fontSize: '15px', color: '#c9b8dd', align: 'center' },
      )
      .setOrigin(0.5);

    const prompt = this.add
      .text(width / 2, height * 0.84, 'Click or press SPACE to begin', {
        fontSize: '18px',
        color: '#ff6fae',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.tweens.add({
      targets: prompt,
      alpha: 0.4,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    const start = () => this.scene.start('Game', { levelIndex: 0, entryScore: 0 });
    prompt.on('pointerdown', start);
    this.input.keyboard!.once('keydown-SPACE', start);
  }
}
