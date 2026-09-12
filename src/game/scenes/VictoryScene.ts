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
    this.cameras.main.setBackgroundColor('#2f5233');

    this.add
      .tileSprite(0, 0, width, height, 'rainforest-bg')
      .setOrigin(0, 0)
      .setAlpha(0.5);

    this.add
      .text(width / 2, height * 0.24, '🌳 You reached the Banyan Tree Canopy!', {
        fontSize: '28px',
        color: '#ffffff',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: width * 0.8 },
        stroke: '#12201a',
        strokeThickness: 4,
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
