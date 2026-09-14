import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { createButterflyTexture, createWaterfallTexture } from './textures';
import type { LevelConfig } from './levels';
import { projectOntoPath, sampleAtDistance, totalPathLength } from './pathMath';
import stoneUrl from '../assets/textures/stone-wall.jpg';
import foliageUrl from '../assets/textures/foliage-wall.jpg';
import muralUrl from '../assets/textures/garden-mural.jpg';

const MOVE_SPEED = 7;
const FLAP_ACCEL = 16;
const GRAVITY = 7;
const MAX_UP_SPEED = 6;
const MAX_DOWN_SPEED = 9;

interface Keys {
  forward: boolean;
  back: boolean;
  left: boolean;
  right: boolean;
  up: boolean;
}

function useKeyboard(): React.MutableRefObject<Keys> {
  const keys = useRef<Keys>({ forward: false, back: false, left: false, right: false, up: false });

  useEffect(() => {
    const map: Record<string, keyof Keys> = {
      KeyW: 'forward',
      ArrowUp: 'forward',
      KeyS: 'back',
      ArrowDown: 'back',
      KeyA: 'left',
      ArrowLeft: 'left',
      KeyD: 'right',
      ArrowRight: 'right',
      Space: 'up',
    };
    const down = (e: KeyboardEvent) => {
      const k = map[e.code];
      if (k) {
        keys.current[k] = true;
        if (e.code === 'Space') e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => {
      const k = map[e.code];
      if (k) keys.current[k] = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  return keys;
}

function TreeDecor({ position, scale }: { position: [number, number, number]; scale: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 2, 0]} castShadow>
        <cylinderGeometry args={[0.6, 0.9, 4, 8]} />
        <meshStandardMaterial color="#5a4632" />
      </mesh>
      <mesh position={[0, 5, 0]} castShadow>
        <sphereGeometry args={[3, 12, 10]} />
        <meshStandardMaterial color="#3f6b3f" />
      </mesh>
    </group>
  );
}

function Terrarium({
  position,
  rotationY,
  critter,
}: {
  position: [number, number, number];
  rotationY: number;
  critter: 'frog' | 'lizard';
}) {
  const critterColor = critter === 'frog' ? '#2f6fb0' : '#6b7a3f';
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 1, -0.25]}>
        <boxGeometry args={[1.6, 2, 0.5]} />
        <meshStandardMaterial color="#2f3a24" />
      </mesh>
      <mesh position={[0, 1, 0.05]}>
        <planeGeometry args={[1.5, 1.9]} />
        <meshPhysicalMaterial
          color="#bfe9ff"
          transparent
          opacity={0.22}
          roughness={0.05}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0.15, 0.35, -0.1]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[0.9, 0.3, 0.4]} />
        <meshStandardMaterial color="#6b5030" />
      </mesh>
      <mesh position={[-0.25, 0.55, 0]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshStandardMaterial color={critterColor} />
      </mesh>
    </group>
  );
}

function PathRoom({ level }: { level: LevelConfig }) {
  const path = level.path!;
  const pathWidth = level.pathWidth ?? 8;
  const totalLen = useMemo(() => totalPathLength(path), [path]);

  const [stoneTex, foliageTex, muralTex] = useLoader(THREE.TextureLoader, [
    stoneUrl,
    foliageUrl,
    muralUrl,
  ]);

  const nearWallTex = useMemo(() => {
    const t = (level.terrariums ? foliageTex : stoneTex).clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(totalLen / 6, 1);
    t.needsUpdate = true;
    return t;
  }, [stoneTex, foliageTex, level.terrariums, totalLen]);

  const cliffTex = useMemo(() => {
    const t = foliageTex.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(totalLen / 8, 2);
    t.needsUpdate = true;
    return t;
  }, [foliageTex, totalLen]);

  const floorTex = useMemo(() => {
    const t = stoneTex.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(pathWidth / 3, totalLen / 6);
    t.needsUpdate = true;
    return t;
  }, [stoneTex, pathWidth, totalLen]);

  const waterfallTex = useMemo(() => createWaterfallTexture(), []);

  const showBackdrop = !level.mirrored && !level.terrariums;
  // Note: this is a glossy-panel approximation, not a true planar mirror
  // reflection -- real-time reflections need an environment map or a
  // Reflector pass, which isn't worth the complexity/risk here. Moderate
  // metalness (not 1) keeps the panels visible under direct light instead
  // of going flat black with no environment to reflect.
  const wallMaterialProps = level.mirrored
    ? { color: level.wallTint, metalness: 0.35, roughness: 0.12 }
    : { map: nearWallTex, color: level.wallTint };

  const segments = [];
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len = Math.hypot(dx, dz);
    const angle = Math.atan2(dx, dz);
    const midX = (a.x + b.x) / 2;
    const midZ = (a.z + b.z) / 2;

    segments.push(
      <group key={i} position={[midX, 0, midZ]} rotation={[0, angle, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[pathWidth, len + 0.5]} />
          <meshStandardMaterial map={floorTex} color={level.floorTint} />
        </mesh>

        <mesh position={[-pathWidth / 2, level.wallHeight! / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[len + 0.5, level.wallHeight]} />
          <meshStandardMaterial {...wallMaterialProps} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[pathWidth / 2, level.wallHeight! / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[len + 0.5, level.wallHeight]} />
          <meshStandardMaterial {...wallMaterialProps} side={THREE.DoubleSide} />
        </mesh>

        {showBackdrop && (
          <>
            <mesh
              position={[-(pathWidth / 2 + 3), level.height / 2, 0]}
              rotation={[0, Math.PI / 2, 0]}
            >
              <planeGeometry args={[len + 1, level.height]} />
              <meshStandardMaterial map={cliffTex} color={level.wallTint} side={THREE.DoubleSide} />
            </mesh>
            <mesh
              position={[pathWidth / 2 + 3, level.height / 2, 0]}
              rotation={[0, -Math.PI / 2, 0]}
            >
              <planeGeometry args={[len + 1, level.height]} />
              <meshStandardMaterial map={cliffTex} color={level.wallTint} side={THREE.DoubleSide} />
            </mesh>
          </>
        )}
      </group>,
    );
  }

  const decor: React.ReactNode[] = [];

  if (level.treeScale) {
    const p = sampleAtDistance(path, totalLen * 0.35);
    // Offset to one side of the centerline so the trunk/canopy is a
    // landmark to fly past, not an obstacle blocking the flight path.
    const lateral = pathWidth / 2 - 0.5;
    const tx = p.x + p.normX * lateral;
    const tz = p.z + p.normZ * lateral;
    decor.push(<TreeDecor key="tree" position={[tx, 0, tz]} scale={level.treeScale} />);
  }

  if (level.waterfall) {
    const p = sampleAtDistance(path, totalLen * 0.62);
    const wx = p.x + p.normX * (pathWidth / 2 + 2.9);
    const wz = p.z + p.normZ * (pathWidth / 2 + 2.9);
    const angle = Math.atan2(p.dirX, p.dirZ);
    decor.push(
      <mesh key="waterfall" position={[wx, level.height / 2 - 1, wz]} rotation={[0, angle, 0]}>
        <planeGeometry args={[3, level.height - 2]} />
        <meshStandardMaterial
          map={waterfallTex}
          emissive="#bfe9ff"
          emissiveIntensity={0.15}
          transparent
          opacity={0.92}
        />
      </mesh>,
    );
    decor.push(
      <mesh
        key="pillar"
        position={[p.x - p.normX * 3, level.height / 2 - 2, p.z - p.normZ * 3]}
      >
        <cylinderGeometry args={[0.9, 1.3, level.height - 3, 10]} />
        <meshStandardMaterial map={stoneTex} />
      </mesh>,
    );
  }

  if (level.terrariums) {
    const spacing = 3.4;
    let d = spacing;
    let side = -1;
    let i = 0;
    while (d < totalLen - spacing / 2) {
      const p = sampleAtDistance(path, d);
      const offset = pathWidth / 2 - 0.3;
      const px = p.x + p.normX * offset * side;
      const pz = p.z + p.normZ * offset * side;
      const facing = Math.atan2(-p.normX * side, -p.normZ * side);
      decor.push(
        <Terrarium
          key={`terrarium-${i}`}
          position={[px, 0, pz]}
          rotationY={facing}
          critter={i % 2 === 0 ? 'frog' : 'lizard'}
        />,
      );
      side *= -1;
      d += spacing;
      i += 1;
    }
  }

  if (level.key === 'atrium') {
    const p = sampleAtDistance(path, totalLen * 0.12);
    const mx = p.x - p.normX * (pathWidth / 2 + 2.9);
    const mz = p.z - p.normZ * (pathWidth / 2 + 2.9);
    const angle = Math.atan2(p.dirX, p.dirZ);
    decor.push(
      <mesh key="mural" position={[mx, 5, mz]} rotation={[0, angle, 0]}>
        <planeGeometry args={[6, 8.5]} />
        <meshStandardMaterial map={muralTex} />
      </mesh>,
    );
  }

  return (
    <group>
      {segments}
      {decor}
    </group>
  );
}

function BoxOrRotundaRoom({ level }: { level: LevelConfig }) {
  const [stoneTex, foliageTex] = useLoader(THREE.TextureLoader, [stoneUrl, foliageUrl]);

  const roomDepth = level.entranceZ - level.farZ;
  const roomCenterZ = (level.entranceZ + level.farZ) / 2;
  const treeZ = level.farZ + (level.entranceZ - level.farZ) * 0.35;

  const floorTex = useMemo(() => {
    const t = stoneTex.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(level.halfWidth / 3, roomDepth / 6);
    t.needsUpdate = true;
    return t;
  }, [stoneTex, level.halfWidth, roomDepth]);

  const wallTex = useMemo(() => {
    const t = foliageTex.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(roomDepth / 8, 2);
    t.needsUpdate = true;
    return t;
  }, [foliageTex, roomDepth]);

  const treeScale = level.treeScale ?? 0;
  const tree = treeScale > 0 && (
    <TreeDecor position={[0, 0, treeZ]} scale={treeScale} />
  );

  if (level.shape === 'rotunda') {
    const radius = level.halfWidth;
    return (
      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, roomCenterZ]} receiveShadow>
          <circleGeometry args={[radius, 32]} />
          <meshStandardMaterial map={floorTex} color={level.floorTint} />
        </mesh>
        <mesh position={[0, level.height / 2, roomCenterZ]}>
          <cylinderGeometry args={[radius, radius, level.height, 32, 1, true]} />
          <meshStandardMaterial map={wallTex} color={level.wallTint} side={THREE.BackSide} />
        </mesh>
        {tree}
      </group>
    );
  }

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, roomCenterZ]} receiveShadow>
        <planeGeometry args={[level.halfWidth * 2, roomDepth]} />
        <meshStandardMaterial map={floorTex} color={level.floorTint} />
      </mesh>

      <mesh
        position={[-level.halfWidth, level.height / 2, roomCenterZ]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[roomDepth, level.height]} />
        <meshStandardMaterial map={wallTex} color={level.wallTint} side={THREE.DoubleSide} />
      </mesh>
      <mesh
        position={[level.halfWidth, level.height / 2, roomCenterZ]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[roomDepth, level.height]} />
        <meshStandardMaterial map={wallTex} color={level.wallTint} side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[0, level.height / 2 - 1, level.farZ]}>
        <planeGeometry args={[level.halfWidth * 2, level.height]} />
        <meshStandardMaterial map={wallTex} color={level.wallTint} side={THREE.DoubleSide} />
      </mesh>
      {level.key === 'theater' && (
        <mesh position={[0, level.height / 2, level.farZ + 0.1]}>
          <planeGeometry args={[8, 5]} />
          <meshStandardMaterial color="#7fb3ff" emissive="#3f7fdb" emissiveIntensity={0.7} />
        </mesh>
      )}

      <mesh position={[0, level.height / 2 - 1, level.entranceZ]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[level.halfWidth * 2, level.height]} />
        <meshStandardMaterial map={wallTex} color={level.wallTint} side={THREE.DoubleSide} />
      </mesh>

      {tree}
    </group>
  );
}

function RoomEnv({ level }: { level: LevelConfig }) {
  if (level.shape === 'path') return <PathRoom level={level} />;
  return <BoxOrRotundaRoom level={level} />;
}

function Butterfly({
  posRef,
  level,
}: {
  posRef: React.MutableRefObject<THREE.Vector3>;
  level: LevelConfig;
}) {
  const spriteRef = useRef<THREE.Sprite>(null);
  const velocity = useRef(new THREE.Vector3());
  const keys = useKeyboard();
  const flapTimer = useRef(0);
  const wingUp = useRef(true);

  const texUp = useMemo(() => createButterflyTexture(true), []);
  const texDown = useMemo(() => createButterflyTexture(false), []);

  useFrame((_, delta) => {
    const k = keys.current;
    const pos = posRef.current;

    const move = new THREE.Vector3(
      (k.right ? 1 : 0) - (k.left ? 1 : 0),
      0,
      (k.back ? 1 : 0) - (k.forward ? 1 : 0),
    );
    pos.x += move.x * MOVE_SPEED * delta;
    pos.z += move.z * MOVE_SPEED * delta;

    velocity.current.y -= GRAVITY * delta;
    if (k.up) {
      velocity.current.y = Math.min(velocity.current.y + FLAP_ACCEL * delta, MAX_UP_SPEED);
    }
    velocity.current.y = Math.max(velocity.current.y, -MAX_DOWN_SPEED);
    pos.y += velocity.current.y * delta;

    if (level.shape === 'path') {
      const proj = projectOntoPath(level.path!, pos.x, pos.z);
      const maxDist = (level.pathWidth ?? 8) / 2 - 1.2;
      if (proj.dist > maxDist) {
        const dx = pos.x - proj.px;
        const dz = pos.z - proj.pz;
        const d = Math.hypot(dx, dz) || 1;
        pos.x = proj.px + (dx / d) * maxDist;
        pos.z = proj.pz + (dz / d) * maxDist;
      }
    } else if (level.shape === 'rotunda') {
      const roomCenterZ = (level.entranceZ + level.farZ) / 2;
      const dx = pos.x;
      const dz = pos.z - roomCenterZ;
      const dist = Math.hypot(dx, dz);
      const maxDist = level.halfWidth - 1.5;
      if (dist > maxDist) {
        const scale = maxDist / dist;
        pos.x = dx * scale;
        pos.z = roomCenterZ + dz * scale;
      }
    } else {
      pos.x = THREE.MathUtils.clamp(pos.x, -level.halfWidth + 1.5, level.halfWidth - 1.5);
      pos.z = THREE.MathUtils.clamp(pos.z, level.farZ + 1.5, level.entranceZ - 1.5);
    }
    if (pos.y < 1) {
      pos.y = 1;
      velocity.current.y = 0;
    }
    if (pos.y > level.height - 1.5) {
      pos.y = level.height - 1.5;
      velocity.current.y = 0;
    }

    if (spriteRef.current) {
      spriteRef.current.position.copy(pos);
    }

    flapTimer.current += delta;
    const flapping = k.up || k.forward || k.back || k.left || k.right;
    const interval = flapping ? 0.08 : 0.16;
    if (flapTimer.current > interval && spriteRef.current) {
      flapTimer.current = 0;
      wingUp.current = !wingUp.current;
      const mat = spriteRef.current.material as THREE.SpriteMaterial;
      mat.map = wingUp.current ? texUp : texDown;
      mat.needsUpdate = true;
    }
  });

  return (
    <sprite ref={spriteRef} scale={[2.4, 2.1, 1]} position={posRef.current}>
      <spriteMaterial map={texUp} transparent alphaTest={0.1} />
    </sprite>
  );
}

function Hazard({
  cfg,
  posOut,
}: {
  cfg: { x: number; z: number; baseY: number; range: number; speed: number };
  posOut: THREE.Vector3;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const y = cfg.baseY + Math.sin(clock.elapsedTime * cfg.speed) * cfg.range;
    if (ref.current) {
      ref.current.position.set(cfg.x, y, cfg.z);
      ref.current.rotation.y += 0.02;
    }
    posOut.set(cfg.x, y, cfg.z);
  });

  return (
    <mesh ref={ref} position={[cfg.x, cfg.baseY, cfg.z]}>
      <icosahedronGeometry args={[0.55, 0]} />
      <meshStandardMaterial color="#4a3728" emissive="#2a1f16" />
    </mesh>
  );
}

function Collectible({ position, collected }: { position: THREE.Vector3; collected: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = position.y + Math.sin(clock.elapsedTime * 2 + position.x) * 0.3;
      ref.current.rotation.y += 0.03;
    }
  });
  if (collected) return null;
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.3, 12, 10]} />
      <meshStandardMaterial color="#ffd76a" emissive="#ffb400" emissiveIntensity={0.6} />
    </mesh>
  );
}

function Goal({ position, reached }: { position: THREE.Vector3; reached: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ref.current) ref.current.rotation.z += 0.01;
  });
  return (
    <mesh ref={ref} position={position} visible={!reached}>
      <torusGeometry args={[1.4, 0.35, 12, 24]} />
      <meshStandardMaterial color="#ff6fae" emissive="#ff2f8f" emissiveIntensity={0.5} />
    </mesh>
  );
}

function CameraRig({
  targetRef,
  level,
}: {
  targetRef: React.MutableRefObject<THREE.Vector3>;
  level: LevelConfig;
}) {
  const { camera } = useThree();
  const desired = useRef(new THREE.Vector3());

  useFrame(() => {
    const t = targetRef.current;
    let backX = 0;
    let backZ = 1;
    if (level.shape === 'path') {
      const proj = projectOntoPath(level.path!, t.x, t.z);
      backX = -proj.dirX;
      backZ = -proj.dirZ;
    }
    desired.current.set(t.x + backX * 7, t.y + 2.2, t.z + backZ * 7);
    camera.position.lerp(desired.current, 0.08);
    camera.lookAt(t.x - backX * 3, t.y + 0.5, t.z - backZ * 3);
  });

  return null;
}

export interface GameStats {
  score: number;
  collected: number;
  total: number;
  health: number;
  reachedGoal: boolean;
}

function computeSpawn(level: LevelConfig): THREE.Vector3 {
  if (level.shape === 'path') {
    const p = sampleAtDistance(level.path!, 9);
    return new THREE.Vector3(p.x, 4, p.z);
  }
  return new THREE.Vector3(0, 4, level.entranceZ - 9);
}

function computeGoal(level: LevelConfig): THREE.Vector3 {
  if (level.shape === 'path') {
    const len = totalPathLength(level.path!);
    const p = sampleAtDistance(level.path!, Math.max(0, len - 4));
    return new THREE.Vector3(p.x, 4, p.z);
  }
  const roomCenterZ = (level.entranceZ + level.farZ) / 2;
  const gz = level.shape === 'rotunda' ? roomCenterZ - (level.halfWidth - 4) : level.farZ + 4;
  return new THREE.Vector3(0, 4, gz);
}

function computeCollectibles(level: LevelConfig): THREE.Vector3[] {
  const spec = level.collectibles;
  if (level.shape === 'path') {
    const len = totalPathLength(level.path!);
    const start = 6;
    const end = Math.max(start, len - 6);
    return Array.from({ length: spec.count }, (_, i) => {
      const t = spec.count > 1 ? i / (spec.count - 1) : 0;
      const d = start + t * (end - start);
      const p = sampleAtDistance(level.path!, d);
      const lateral = Math.sin(i * 1.7) * spec.xSpread;
      return new THREE.Vector3(
        p.x + p.normX * lateral,
        spec.yBase + Math.cos(i * 1.3) * spec.ySpread,
        p.z + p.normZ * lateral,
      );
    });
  }
  return Array.from({ length: spec.count }, (_, i) => {
    const t = spec.count > 1 ? i / (spec.count - 1) : 0;
    return new THREE.Vector3(
      Math.sin(i * 1.7) * spec.xSpread,
      spec.yBase + Math.cos(i * 1.3) * spec.ySpread,
      spec.zStart - t * (spec.zStart - spec.zEnd),
    );
  });
}

export function GameWorld({
  level,
  entryScore,
  onStats,
}: {
  level: LevelConfig;
  entryScore: number;
  onStats: (s: GameStats) => void;
}) {
  // GameWorld remounts fresh per level (see ThreeApp's runKey), so these
  // initial values are safe to compute once from the current level.
  const butterflyPos = useRef(computeSpawn(level));

  const hazardPositions = useRef(level.hazards.map(() => new THREE.Vector3()));

  const collectiblePositions = useMemo(() => computeCollectibles(level), [level]);
  const [collectedFlags, setCollectedFlags] = useState<boolean[]>(() =>
    collectiblePositions.map(() => false),
  );

  const goalPos = useMemo(() => computeGoal(level), [level]);
  const [reachedGoal, setReachedGoal] = useState(false);

  const health = useRef(3);
  const invuln = useRef(0);
  const score = useRef(entryScore);

  useEffect(() => {
    onStats({
      score: entryScore,
      collected: 0,
      total: collectiblePositions.length,
      health: health.current,
      reachedGoal: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((_, delta) => {
    invuln.current = Math.max(0, invuln.current - delta);

    level.hazards.forEach((_h, i) => {
      const dist = butterflyPos.current.distanceTo(hazardPositions.current[i]);
      if (dist < 0.9 && invuln.current <= 0 && health.current > 0) {
        health.current -= 1;
        invuln.current = 1.2;
        onStats({
          score: score.current,
          collected: collectedFlags.filter(Boolean).length,
          total: collectiblePositions.length,
          health: health.current,
          reachedGoal,
        });
      }
    });

    let changed = false;
    const next = collectedFlags.slice();
    collectiblePositions.forEach((p, i) => {
      if (!next[i] && butterflyPos.current.distanceTo(p) < 0.9) {
        next[i] = true;
        score.current += 10;
        changed = true;
      }
    });
    if (changed) {
      setCollectedFlags(next);
      onStats({
        score: score.current,
        collected: next.filter(Boolean).length,
        total: collectiblePositions.length,
        health: health.current,
        reachedGoal,
      });
    }

    if (!reachedGoal && butterflyPos.current.distanceTo(goalPos) < 2) {
      setReachedGoal(true);
      onStats({
        score: score.current,
        collected: collectedFlags.filter(Boolean).length,
        total: collectiblePositions.length,
        health: health.current,
        reachedGoal: true,
      });
    }
  });

  return (
    <>
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#dff5e0', '#3a5233', 0.6]} />
      <directionalLight position={[8, 14, 6]} intensity={0.9} castShadow />
      <fog attach="fog" args={[level.fogColor, 14, 40]} />

      <RoomEnv level={level} />
      <Butterfly posRef={butterflyPos} level={level} />
      <CameraRig targetRef={butterflyPos} level={level} />

      {level.hazards.map((h, i) => (
        <Hazard key={i} cfg={h} posOut={hazardPositions.current[i]} />
      ))}
      {collectiblePositions.map((p, i) => (
        <Collectible key={i} position={p} collected={collectedFlags[i]} />
      ))}
      <Goal position={goalPos} reached={reachedGoal} />
    </>
  );
}

export function ThreeCanvas({
  level,
  entryScore,
  onStats,
}: {
  level: LevelConfig;
  entryScore: number;
  onStats: (s: GameStats) => void;
}) {
  return (
    <Canvas
      shadows
      camera={{ fov: 60, position: [0, 6, 8] }}
      gl={{ antialias: true }}
      style={{ background: level.fogColor }}
    >
      <GameWorld level={level} entryScore={entryScore} onStats={onStats} />
    </Canvas>
  );
}
