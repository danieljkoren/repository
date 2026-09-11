import Phaser from 'phaser';

interface GameOverData {
  levelIndex: number;
  entryScore: number;
  levelName: string;
}

export class GameOverScene extends Phaser.Scene {
  private payload!: GameOverData;

  constructor() {
    super('GameOver');
  }

  init(data: GameOverData) {
    this.payload = data;
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#1b1330');

    this.add
      .text(width / 2, height * 0.3, 'Caught in a Web!', {
        fontSize: '32px',
        color: '#ff6fae',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.42, `${this.payload.levelName}`, {
        fontSize: '18px',
        color: '#ffe1f0',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.5, `Score so far: ${this.payload.entryScore}`, {
        fontSize: '18px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    const retry = this.add
      .text(width / 2, height * 0.68, 'Click or press SPACE to retry', {
        fontSize: '18px',
        color: '#ffd76a',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.tweens.add({ targets: retry, alpha: 0.4, duration: 600, yoyo: true, repeat: -1 });

    const menuPrompt = this.add
      .text(width / 2, height * 0.78, 'Press M for main menu', {
        fontSize: '14px',
        color: '#9c8fb0',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const doRetry = () =>
      this.scene.start('Game', { levelIndex: this.payload.levelIndex, entryScore: this.payload.entryScore });
    const toMenu = () => this.scene.start('Menu');

    retry.on('pointerdown', doRetry);
    menuPrompt.on('pointerdown', toMenu);
    this.input.keyboard!.once('keydown-SPACE', doRetry);
    this.input.keyboard!.once('keydown-M', toMenu);
  }
}
