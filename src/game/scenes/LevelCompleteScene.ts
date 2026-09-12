import Phaser from 'phaser';

interface LevelCompleteData {
  levelName: string;
  bonus: number;
  score: number;
  nextLevel: number;
}

export class LevelCompleteScene extends Phaser.Scene {
  private payload!: LevelCompleteData;

  constructor() {
    super('LevelComplete');
  }

  init(data: LevelCompleteData) {
    this.payload = data;
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor('#1f3324');

    this.add
      .text(width / 2, height * 0.3, `${this.payload.levelName} Complete!`, {
        fontSize: '32px',
        color: '#ffe1f0',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.44, `Time Bonus: +${this.payload.bonus}`, {
        fontSize: '18px',
        color: '#ffd76a',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height * 0.52, `Total Score: ${this.payload.score}`, {
        fontSize: '22px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const prompt = this.add
      .text(width / 2, height * 0.72, 'Click or press SPACE for the next level', {
        fontSize: '18px',
        color: '#ff6fae',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.tweens.add({ targets: prompt, alpha: 0.4, duration: 600, yoyo: true, repeat: -1 });

    const advance = () =>
      this.scene.start('Game', { levelIndex: this.payload.nextLevel, entryScore: this.payload.score });
    prompt.on('pointerdown', advance);
    this.input.keyboard!.once('keydown-SPACE', advance);
  }
}
