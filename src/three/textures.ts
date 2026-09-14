import * as THREE from 'three';

function drawButterfly(ctx: CanvasRenderingContext2D, wingsUp: boolean) {
  const lift = wingsUp ? -8 : -1;
  ctx.clearRect(0, 0, 64, 56);

  const wing = (cx: number) => {
    ctx.fillStyle = '#ff6fae';
    ctx.beginPath();
    ctx.ellipse(cx, 26 + lift, 13, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffe1f0';
    ctx.beginPath();
    ctx.ellipse(cx, 26 + lift, 6, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  };
  wing(18);
  wing(46);

  ctx.fillStyle = '#3a2b52';
  ctx.beginPath();
  ctx.ellipse(32, 28, 5, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#3a2b52';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(29, 12);
  ctx.lineTo(23, 4);
  ctx.moveTo(35, 12);
  ctx.lineTo(41, 4);
  ctx.stroke();
}

export function createButterflyTexture(wingsUp: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 56;
  const ctx = canvas.getContext('2d')!;
  drawButterfly(ctx, wingsUp);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function createWaterfallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0, '#dff5ff');
  grad.addColorStop(1, '#8fd0e8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 128);

  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  for (let i = 0; i < 10; i++) {
    const x = (i * 7 + (i % 2 === 0 ? 2 : -2)) % 64;
    ctx.lineWidth = 1 + (i % 3);
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + (i % 2 === 0 ? 4 : -4), 128);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  for (let i = 0; i < 40; i++) {
    const x = (i * 13) % 64;
    const y = (i * 29) % 128;
    ctx.fillRect(x, y, 2, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
