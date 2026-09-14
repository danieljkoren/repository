export interface PathPt {
  x: number;
  z: number;
}

export function totalPathLength(points: PathPt[]): number {
  let len = 0;
  for (let i = 0; i < points.length - 1; i++) {
    len += Math.hypot(points[i + 1].x - points[i].x, points[i + 1].z - points[i].z);
  }
  return len;
}

/** Nearest point on the polyline to (x, z), plus the local segment direction and distance. */
export function projectOntoPath(points: PathPt[], x: number, z: number) {
  let best = { dist: Infinity, px: x, pz: z, dirX: 0, dirZ: -1 };
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len = Math.hypot(dx, dz) || 1;
    const ux = dx / len;
    const uz = dz / len;
    const wx = x - a.x;
    const wz = z - a.z;
    const t = Math.max(0, Math.min(len, wx * ux + wz * uz));
    const px = a.x + ux * t;
    const pz = a.z + uz * t;
    const dist = Math.hypot(x - px, z - pz);
    if (dist < best.dist) {
      best = { dist, px, pz, dirX: ux, dirZ: uz };
    }
  }
  return best;
}

/** Point + local direction + left-hand normal at a given distance along the polyline. */
export function sampleAtDistance(points: PathPt[], distance: number) {
  let remaining = distance;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len = Math.hypot(dx, dz);
    if (remaining <= len || i === points.length - 2) {
      const t = len === 0 ? 0 : Math.max(0, Math.min(1, remaining / len));
      const dirX = dx / (len || 1);
      const dirZ = dz / (len || 1);
      return {
        x: a.x + dx * t,
        z: a.z + dz * t,
        dirX,
        dirZ,
        normX: -dirZ,
        normZ: dirX,
      };
    }
    remaining -= len;
  }
  const last = points[points.length - 1];
  return { x: last.x, z: last.z, dirX: 0, dirZ: -1, normX: 1, normZ: 0 };
}
