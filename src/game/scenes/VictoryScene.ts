import Phaser from 'phaser';

interface VictoryData {
  score: number;
}

export class VictoryScene extends Phaser.Scene {
  private payload!: VictoryData;

  constructor() {
    super('Victory');
  }

  init(data: VictoryData) {
    this.payload = data;
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#8f6bb3');

    this.add
      .tileSprite(0, 0, width, height, 'palace-bg')
      .setOrigin(0, 0)
      .setAlpha(0.5);

    this.add
      .text(width / 2, height * 0.24, '👑 You reached the Throne Room!', {
        fontSize: '28px',
        color: '#3a2b52',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: width * 0.8 },
      })
      .setOrigin(0.5);

    const goal = this.add.image(width / 2, height * 0.48, 'goal').setScale(1.4);
    this.tweens.add({ targets: goal, scale: 1.6, duration: 700, yoyo: true, repeat: -1 });

    this.add
      .text(width / 2, height * 0.66, `Final Score: ${this.payload.score}`, {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const prompt = this.add
      .text(width / 2, height * 0.82, 'Click or press SPACE to return to the menu', {
        fontSize: '16px',
        color: '#ff6fae',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.tweens.add({ targets: prompt, alpha: 0.4, duration: 600, yoyo: true, repeat: -1 });

    const toMenu = () => this.scene.start('Menu');
    prompt.on('pointerdown', toMenu);
    this.input.keyboard!.once('keydown-SPACE', toMenu);
  }
}
