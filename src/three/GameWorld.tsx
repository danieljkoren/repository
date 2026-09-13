import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { createButterflyTexture } from './textures';
import type { LevelConfig } from './levels';
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

function RoomEnv({ level }: { level: LevelConfig }) {
  const [stoneTex, foliageTex, muralTex] = useLoader(THREE.TextureLoader, [
    stoneUrl,
    foliageUrl,
    muralUrl,
  ]);

  const roomDepth = level.entranceZ - level.farZ;
  const roomCenterZ = (level.entranceZ + level.farZ) / 2;
  // Biased toward the far wall (not the true geometric center) so the
  // decorative tree never sits right on top of the entrance-side spawn point.
  const treeZ = level.farZ + (level.entranceZ - level.farZ) * 0.35;
  const showMural = level.key === 'atrium' || level.key === 'conservatory';

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
    <group position={[0, 0, treeZ]} scale={treeScale}>
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

  if (level.shape === 'rotunda') {
    const radius = level.halfWidth;
    return (
      <group>
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, roomCenterZ]}
          receiveShadow
        >
          <circleGeometry args={[radius, 32]} />
          <meshStandardMaterial map={floorTex} color={level.floorTint} />
        </mesh>
        <mesh position={[0, level.height / 2, roomCenterZ]}>
          <cylinderGeometry args={[radius, radius, level.height, 32, 1, true]} />
          <meshStandardMaterial
            map={wallTex}
            color={level.wallTint}
            side={THREE.BackSide}
          />
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
      {showMural && (
        <mesh position={[0, 5, level.farZ + 0.1]}>
          <planeGeometry args={[6, 8.5]} />
          <meshStandardMaterial map={muralTex} />
        </mesh>
      )}
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

    const roomCenterZ = (level.entranceZ + level.farZ) / 2;
    if (level.shape === 'rotunda') {
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

function CameraRig({ targetRef }: { targetRef: React.MutableRefObject<THREE.Vector3> }) {
  const { camera } = useThree();
  const desired = useRef(new THREE.Vector3());

  useFrame(() => {
    const t = targetRef.current;
    desired.current.set(t.x, t.y + 2.2, t.z + 7);
    camera.position.lerp(desired.current, 0.08);
    camera.lookAt(t.x, t.y + 0.5, t.z - 3);
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

export function GameWorld({
  level,
  entryScore,
  onStats,
}: {
  level: LevelConfig;
  entryScore: number;
  onStats: (s: GameStats) => void;
}) {
  // GameWorld remounts fresh per level (see ThreeApp's runKey), so this
  // initial value is safe to compute once from the current level's entrance.
  // The chase camera trails 7 units behind the player (see CameraRig), so the
  // spawn point must sit at least that far inside the entrance wall/radius or
  // the camera itself ends up clipping through the wall.
  const butterflyPos = useRef(new THREE.Vector3(0, 4, level.entranceZ - 9));

  const hazardPositions = useRef(level.hazards.map(() => new THREE.Vector3()));

  const collectiblePositions = useMemo(() => {
    const spec = level.collectibles;
    return Array.from({ length: spec.count }, (_, i) => {
      const t = spec.count > 1 ? i / (spec.count - 1) : 0;
      return new THREE.Vector3(
        Math.sin(i * 1.7) * spec.xSpread,
        spec.yBase + Math.cos(i * 1.3) * spec.ySpread,
        spec.zStart - t * (spec.zStart - spec.zEnd),
      );
    });
  }, [level]);
  const [collectedFlags, setCollectedFlags] = useState<boolean[]>(() =>
    collectiblePositions.map(() => false),
  );

  const goalPos = useMemo(() => {
    const roomCenterZ = (level.entranceZ + level.farZ) / 2;
    // Box rooms: farZ is the actual back wall, so sit just in front of it.
    // Rotunda rooms: farZ is only used to derive the center, so place the
    // goal near the far edge of the circular radius instead.
    const gz =
      level.shape === 'rotunda' ? roomCenterZ - (level.halfWidth - 4) : level.farZ + 4;
    return new THREE.Vector3(0, 4, gz);
  }, [level]);
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
      <fog attach="fog" args={[level.fogColor, 18, 46]} />

      <RoomEnv level={level} />
      <Butterfly posRef={butterflyPos} level={level} />
      <CameraRig targetRef={butterflyPos} />

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
