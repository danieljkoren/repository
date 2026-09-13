import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { createButterflyTexture } from './textures';
import stoneUrl from '../assets/textures/stone-wall.jpg';
import foliageUrl from '../assets/textures/foliage-wall.jpg';
import muralUrl from '../assets/textures/garden-mural.jpg';

const ROOM_HALF_WIDTH = 16;
const ROOM_HEIGHT = 13;
// Entrance wall (spawn side) and far wall (goal side), with room for the
// chase camera to sit behind the player without clipping through the entrance.
const ENTRANCE_Z = 11;
const FAR_Z = -24;
const ROOM_CENTER_Z = (ENTRANCE_Z + FAR_Z) / 2;
const ROOM_DEPTH = ENTRANCE_Z - FAR_Z;
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

function RoomEnv() {
  const [stoneTex, foliageTex, muralTex] = useLoader(THREE.TextureLoader, [
    stoneUrl,
    foliageUrl,
    muralUrl,
  ]);

  const floorTex = useMemo(() => {
    const t = stoneTex.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(6, ROOM_DEPTH / 6);
    t.needsUpdate = true;
    return t;
  }, [stoneTex]);

  const wallTex = useMemo(() => {
    const t = foliageTex.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(ROOM_DEPTH / 8, 2);
    t.needsUpdate = true;
    return t;
  }, [foliageTex]);

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, ROOM_CENTER_Z]} receiveShadow>
        <planeGeometry args={[ROOM_HALF_WIDTH * 2, ROOM_DEPTH]} />
        <meshStandardMaterial map={floorTex} />
      </mesh>

      {/* Side walls (foliage) */}
      <mesh
        position={[-ROOM_HALF_WIDTH, ROOM_HEIGHT / 2, ROOM_CENTER_Z]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
        <meshStandardMaterial map={wallTex} side={THREE.DoubleSide} />
      </mesh>
      <mesh
        position={[ROOM_HALF_WIDTH, ROOM_HEIGHT / 2, ROOM_CENTER_Z]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
        <meshStandardMaterial map={wallTex} side={THREE.DoubleSide} />
      </mesh>

      {/* Far wall with the real garden-photo mural */}
      <mesh position={[0, ROOM_HEIGHT / 2 - 1, FAR_Z]}>
        <planeGeometry args={[ROOM_HALF_WIDTH * 2, ROOM_HEIGHT]} />
        <meshStandardMaterial map={wallTex} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 5, FAR_Z + 0.1]}>
        <planeGeometry args={[6, 8.5]} />
        <meshStandardMaterial map={muralTex} />
      </mesh>

      {/* Entrance-side wall */}
      <mesh position={[0, ROOM_HEIGHT / 2 - 1, ENTRANCE_Z]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[ROOM_HALF_WIDTH * 2, ROOM_HEIGHT]} />
        <meshStandardMaterial map={wallTex} side={THREE.DoubleSide} />
      </mesh>

      {/* Decorative planter tree in the middle of the atrium */}
      <mesh position={[0, 2, -10]} castShadow>
        <cylinderGeometry args={[0.6, 0.9, 4, 8]} />
        <meshStandardMaterial color="#5a4632" />
      </mesh>
      <mesh position={[0, 5, -10]} castShadow>
        <sphereGeometry args={[3, 12, 10]} />
        <meshStandardMaterial color="#3f6b3f" />
      </mesh>
    </group>
  );
}

function Butterfly({ posRef }: { posRef: React.MutableRefObject<THREE.Vector3> }) {
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

    pos.x = THREE.MathUtils.clamp(pos.x, -ROOM_HALF_WIDTH + 1.5, ROOM_HALF_WIDTH - 1.5);
    pos.z = THREE.MathUtils.clamp(pos.z, FAR_Z + 1.5, ENTRANCE_Z - 1.5);
    if (pos.y < 1) {
      pos.y = 1;
      velocity.current.y = 0;
    }
    if (pos.y > ROOM_HEIGHT - 1.5) {
      pos.y = ROOM_HEIGHT - 1.5;
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

interface HazardConfig {
  id: string;
  x: number;
  z: number;
  baseY: number;
  range: number;
  speed: number;
}

function Hazard({ cfg, posOut }: { cfg: HazardConfig; posOut: THREE.Vector3 }) {
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

export function GameWorld({ onStats }: { onStats: (s: GameStats) => void }) {
  const butterflyPos = useRef(new THREE.Vector3(0, 4, 0));

  const hazards = useMemo<HazardConfig[]>(
    () => [
      { id: 'h1', x: -6, z: -8, baseY: 5, range: 2.5, speed: 0.8 },
      { id: 'h2', x: 5, z: -16, baseY: 6, range: 3, speed: 1.1 },
      { id: 'h3', x: -3, z: -19, baseY: 4.5, range: 2, speed: 1.4 },
    ],
    [],
  );
  const hazardPositions = useRef(hazards.map(() => new THREE.Vector3()));

  const collectiblePositions = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => {
        const t = i / 9;
        return new THREE.Vector3(
          Math.sin(i * 1.7) * 6,
          3 + Math.cos(i * 1.3) * 2,
          8 - t * 27,
        );
      }),
    [],
  );
  const [collectedFlags, setCollectedFlags] = useState<boolean[]>(() =>
    collectiblePositions.map(() => false),
  );

  const goalPos = useMemo(() => new THREE.Vector3(0, 4, FAR_Z + 4), []);
  const [reachedGoal, setReachedGoal] = useState(false);

  const health = useRef(3);
  const invuln = useRef(0);
  const score = useRef(0);

  useEffect(() => {
    onStats({
      score: 0,
      collected: 0,
      total: collectiblePositions.length,
      health: health.current,
      reachedGoal: false,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((_, delta) => {
    invuln.current = Math.max(0, invuln.current - delta);

    // Hazard collisions
    hazards.forEach((_h, i) => {
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

    // Collectible pickups
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

    // Goal
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
      <fog attach="fog" args={['#cfe8c0', 18, 42]} />

      <RoomEnv />
      <Butterfly posRef={butterflyPos} />
      <CameraRig targetRef={butterflyPos} />

      {hazards.map((h, i) => (
        <Hazard key={h.id} cfg={h} posOut={hazardPositions.current[i]} />
      ))}
      {collectiblePositions.map((p, i) => (
        <Collectible key={i} position={p} collected={collectedFlags[i]} />
      ))}
      <Goal position={goalPos} reached={reachedGoal} />
    </>
  );
}

export function ThreeCanvas({ onStats }: { onStats: (s: GameStats) => void }) {
  return (
    <Canvas
      shadows
      camera={{ fov: 60, position: [0, 6, 8] }}
      gl={{ antialias: true }}
      style={{ background: '#cfe8c0' }}
    >
      <GameWorld onStats={onStats} />
    </Canvas>
  );
}
