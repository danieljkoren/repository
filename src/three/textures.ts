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
