'use client';

import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Bounds, useAnimations, useGLTF } from '@react-three/drei';
import { Box3, MathUtils, Object3D, Vector3 } from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import type { Group } from 'three';

const ACCESSIBLE_NAME = 'Personagem 3D de Jonatha Botelho';
const MODEL_PATH = '/jonatha-character-final.glb';

type PointerTarget = { x: number; y: number };
type PortraitTransform = {
  scale: number;
  position: [number, number, number];
};

const portraitTransformCache = new WeakMap<Object3D, PortraitTransform>();

function CharacterFallback() {
  return (
    <div
      role="img"
      aria-label={ACCESSIBLE_NAME}
      className="text-dim flex h-full w-full items-center justify-center bg-transparent text-[11px]"
    >
      <span aria-hidden="true">[ 3D ]</span>
    </div>
  );
}

class WebGLErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unable to render Jonatha character in WebGL.', error, info);
  }

  render() {
    return this.state.failed ? <CharacterFallback /> : this.props.children;
  }
}

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl'),
    );
  } catch {
    return false;
  }
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return reduced;
}

function CharacterModel({
  pointerTarget,
  reducedMotion,
  view,
  onReady,
}: {
  pointerTarget: React.RefObject<PointerTarget>;
  reducedMotion: boolean;
  view: 'portrait' | 'full';
  onReady: () => void;
}) {
  const group = useRef<Group>(null);
  const { scene, animations } = useGLTF(MODEL_PATH);
  // Animated/skinned GLTF scenes need their own skeleton instance. Reusing the
  // loader's scene directly can detach it or lose the WebGL context on remount.
  const model = useMemo(() => clone(scene) as Object3D, [scene]);
  const { actions } = useAnimations(animations, group);
  const portraitTransform = useMemo(() => {
    const cached = portraitTransformCache.get(scene);
    if (cached) return cached;

    const bounds = new Box3().setFromObject(model);
    const size = bounds.getSize(new Vector3());
    const upperBodyCenter = new Vector3(
      (bounds.min.x + bounds.max.x) / 2,
      bounds.max.y + size.y * 0.36,
      (bounds.min.z + bounds.max.z) / 2,
    );
    const scale = 3.7 / size.y;
    const transform: PortraitTransform = {
      scale,
      position: upperBodyCenter.multiplyScalar(-scale).toArray() as [
        number,
        number,
        number,
      ],
    };
    portraitTransformCache.set(scene, transform);
    return transform;
  }, [model, scene]);

  useEffect(() => {
    const action = animations[0] ? actions[animations[0].name] : undefined;
    if (action) {
      action.reset().fadeIn(0.25).play();
      action.setEffectiveTimeScale(reducedMotion ? 0 : 1);
    }

    let secondFrame = 0;
    let revealTimer = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        revealTimer = window.setTimeout(onReady, reducedMotion ? 0 : 180);
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.clearTimeout(revealTimer);
      action?.fadeOut(0.2);
    };
  }, [actions, animations, onReady, reducedMotion]);

  useFrame((_, delta) => {
    if (!group.current) return;
    const targetX = reducedMotion ? 0 : pointerTarget.current.y;
    const targetY = reducedMotion ? 0 : pointerTarget.current.x;
    group.current.rotation.x = MathUtils.damp(
      group.current.rotation.x,
      targetX,
      7,
      delta,
    );
    group.current.rotation.y = MathUtils.damp(
      group.current.rotation.y,
      targetY,
      7,
      delta,
    );
  });

  const character = (
    <group
      ref={group}
      position={view === 'portrait' ? portraitTransform.position : [0, 0, 0]}
      scale={view === 'portrait' ? portraitTransform.scale : 1}
    >
      <primitive object={model} />
    </group>
  );

  if (view === 'full') {
    return (
      <Bounds fit clip observe margin={1.15}>
        {character}
      </Bounds>
    );
  }

  return character;
}

export function JonathaCharacter3D({
  view = 'portrait',
}: {
  view?: 'portrait' | 'full';
}) {
  const pointerTarget = useRef<PointerTarget>({ x: 0, y: 0 });
  const reducedMotion = useReducedMotion();
  const [webGLAvailable] = useState(supportsWebGL);
  const [modelVisible, setModelVisible] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const showModel = useCallback(() => setModelVisible(true), []);

  useEffect(() => {
    const fallback = window.setTimeout(showModel, 1200);
    return () => window.clearTimeout(fallback);
  }, [showModel]);

  const resetPointer = () => {
    pointerTarget.current = { x: 0, y: 0 };
  };

  const reloadCanvas = () => {
    setModelVisible(false);
    setContextLost(false);
    setCanvasKey((key) => key + 1);
  };

  if (webGLAvailable === false) return <CharacterFallback />;

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-transparent"
      onPointerMove={(event) => {
        if (reducedMotion) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
        pointerTarget.current = {
          x: MathUtils.clamp(x, -1, 1) * 0.08,
          y: MathUtils.clamp(-y, -1, 1) * 0.04,
        };
      }}
      onPointerLeave={resetPointer}
      onPointerCancel={resetPointer}
    >
      <div
        className={`h-full w-full transition-opacity ease-out ${
          modelVisible && !contextLost ? 'opacity-100' : 'opacity-0'
        } ${reducedMotion ? 'duration-0' : 'duration-500'}`}
      >
        <WebGLErrorBoundary>
          <Canvas
            key={canvasKey}
            role="img"
            aria-label={ACCESSIBLE_NAME}
            camera={{
              position: view === 'portrait' ? [0, -0.76, 3.18] : [0, 0, 3],
              fov: view === 'portrait' ? 29 : 28,
              near: 0.1,
              far: 20,
            }}
            dpr={1}
            gl={{
              alpha: true,
              antialias: true,
              powerPreference: 'high-performance',
            }}
            style={{
              width: '100%',
              height: '100%',
              background: 'transparent',
            }}
            onCreated={({ gl }) => {
              gl.domElement.addEventListener(
                'webglcontextlost',
                (event) => {
                  event.preventDefault();
                  setContextLost(true);
                },
                { once: true },
              );
            }}
          >
            <ambientLight intensity={1.25} />
            <directionalLight position={[2, 3, 4]} intensity={2.2} />
            <directionalLight position={[-2, 1, 3]} intensity={0.65} />
            <Suspense fallback={null}>
              <CharacterModel
                pointerTarget={pointerTarget}
                reducedMotion={reducedMotion}
                view={view}
                onReady={showModel}
              />
            </Suspense>
          </Canvas>
        </WebGLErrorBoundary>
      </div>
      {contextLost && (
        <div className="bg-paper absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 text-center">
          <span className="text-faint text-[9px] tracking-[.14em]">
            [ WEBGL CONTEXT LOST ]
          </span>
          <button
            type="button"
            onClick={reloadCanvas}
            className="border-ink bg-ink text-yellow cursor-pointer border-2 px-5 py-3 text-[10px] font-bold hover:underline hover:underline-offset-4"
          >
            ↻ RELOAD 3D
          </button>
        </div>
      )}
    </div>
  );
}

useGLTF.preload(MODEL_PATH);
