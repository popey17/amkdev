"use client";

import { Environment, Float, Lightformer, MeshDistortMaterial } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import {
  type ComponentRef,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  AdditiveBlending,
  BackSide,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  type Group,
  IcosahedronGeometry,
  MathUtils,
  type Mesh,
  NormalBlending,
  type ShaderMaterial,
} from "three";

import { useMediaQuery } from "@/lib/use-media-query";
import { readTheme, subscribeToTheme, type Theme } from "@/lib/theme";

import {
  createParticleField,
  getSceneFrameloop,
  getSceneQuality,
  orbGeometry,
  orbitGeometry,
  sceneCamera,
} from "./hero-scene-state";

const lime = "#c6ff32";

const palette = {
  dark: { line: lime, lineOpacity: 0.32, particle: "#e6ffab", blending: AdditiveBlending },
  light: { line: "#4a6800", lineOpacity: 0.45, particle: "#4a6800", blending: NormalBlending },
} satisfies Record<Theme, object>;

function useTheme() {
  return useSyncExternalStore(subscribeToTheme, readTheme, () => "dark" as const);
}

// Fresnel rim drawn on an inflated back-face sphere: bright where the core's
// silhouette is, fading to nothing well before the canvas edge.
const haloVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 world = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-world.xyz);
    gl_Position = projectionMatrix * world;
  }
`;

const haloFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uStrength;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float rim = pow(1.0 - abs(dot(vNormal, vView)), 3.2);
    gl_FragColor = vec4(uColor, rim * uStrength);
  }
`;

const particleVertex = /* glsl */ `
  attribute float aScale;
  uniform float uPixelRatio;
  varying float vAlpha;
  void main() {
    vec4 view = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aScale * uPixelRatio * (22.0 / -view.z);
    vAlpha = 0.35 + aScale * 0.4;
    gl_Position = projectionMatrix * view;
  }
`;

const particleFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.1, d) * vAlpha;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

function Core({ detail, isReduced }: { detail: number; isReduced: boolean }) {
  const mesh = useRef<Mesh>(null);
  const material = useRef<ComponentRef<typeof MeshDistortMaterial>>(null);
  const lastPointer = useRef({ x: 0, y: 0 });
  const baseDistort = isReduced ? orbGeometry.reducedDistort : orbGeometry.distort;

  useFrame((state, delta) => {
    if (!mesh.current || !material.current || isReduced) return;

    // Quick pointer sweeps make the surface ripple harder, then it settles.
    const { x, y } = state.pointer;
    const speed = Math.hypot(x - lastPointer.current.x, y - lastPointer.current.y) / Math.max(delta, 1e-3);
    lastPointer.current = { x, y };
    const target = baseDistort * (0.8 + Math.min(speed * 0.04, 0.2));
    material.current.distort = MathUtils.damp(material.current.distort, target, 3, delta);
    mesh.current.rotation.y += delta * 0.12;
  });

  return (
    <mesh ref={mesh} scale={orbGeometry.scale}>
      <icosahedronGeometry args={[1, detail]} />
      <MeshDistortMaterial
        clearcoat={1}
        clearcoatRoughness={0.12}
        color={lime}
        distort={baseDistort}
        envMapIntensity={1.1}
        iridescence={0.55}
        iridescenceIOR={1.35}
        iridescenceThicknessRange={[120, 480]}
        metalness={0.3}
        ref={material}
        roughness={0.2}
        speed={isReduced ? 0 : 1.6}
      />
    </mesh>
  );
}

function Halo({ theme }: { theme: Theme }) {
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({ uColor: { value: new Color(lime) }, uStrength: { value: 0.85 } }),
    [],
  );

  useFrame(() => {
    if (material.current) {
      material.current.uniforms.uStrength.value = theme === "dark" ? 0.55 : 0.4;
    }
  });

  return (
    <mesh scale={orbGeometry.scale * 1.32}>
      <sphereGeometry args={[1, 48, 48]} />
      <shaderMaterial
        blending={palette[theme].blending}
        depthWrite={false}
        fragmentShader={haloFragment}
        ref={material}
        side={BackSide}
        transparent
        uniforms={uniforms}
        vertexShader={haloVertex}
      />
    </mesh>
  );
}

function Shell({ isReduced, theme }: { isReduced: boolean; theme: Theme }) {
  const group = useRef<Group>(null);
  const geometry = useMemo(() => new IcosahedronGeometry(orbitGeometry.shellRadius, 1), []);
  const colors = palette[theme];

  useFrame((_, delta) => {
    if (!group.current || isReduced) return;
    group.current.rotation.y -= delta * 0.08;
    group.current.rotation.x += delta * 0.03;
  });

  return (
    <group ref={group}>
      <lineSegments>
        <wireframeGeometry args={[geometry]} />
        <lineBasicMaterial color={colors.line} depthWrite={false} opacity={colors.lineOpacity} transparent />
      </lineSegments>
      <points geometry={geometry}>
        <pointsMaterial color={colors.line} opacity={Math.min(colors.lineOpacity * 2.4, 1)} size={0.045} transparent />
      </points>
    </group>
  );
}

function Rings({ isReduced, theme }: { isReduced: boolean; theme: Theme }) {
  const [inner, outer] = orbitGeometry.ringRadii;
  const ringA = useRef<Group>(null);
  const ringB = useRef<Group>(null);
  const colors = palette[theme];

  useFrame((_, delta) => {
    if (isReduced) return;
    if (ringA.current) ringA.current.rotation.z += delta * 0.35;
    if (ringB.current) ringB.current.rotation.z -= delta * 0.22;
  });

  return (
    <>
      <group rotation={[1.2, 0.25, 0]}>
        <group ref={ringA}>
          <mesh>
            <torusGeometry args={[inner, 0.006, 8, 160]} />
            <meshBasicMaterial color={colors.line} opacity={Math.min(colors.lineOpacity * 2, 1)} transparent />
          </mesh>
          <mesh position={[inner, 0, 0]}>
            <sphereGeometry args={[0.055, 16, 16]} />
            <meshBasicMaterial color={lime} />
          </mesh>
        </group>
      </group>
      <group rotation={[-0.5, 0.9, 0.3]}>
        <group ref={ringB}>
          <mesh>
            <torusGeometry args={[outer, 0.004, 8, 180]} />
            <meshBasicMaterial color={colors.line} opacity={colors.lineOpacity * 1.4} transparent />
          </mesh>
          <mesh position={[0, -outer, 0]}>
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshBasicMaterial color={colors.particle} />
          </mesh>
        </group>
      </group>
    </>
  );
}

function Particles({
  count,
  isReduced,
  theme,
}: {
  count: number;
  isReduced: boolean;
  theme: Theme;
}) {
  const group = useRef<Group>(null);
  const colors = palette[theme];

  const material = useRef<ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const { positions, scales } = createParticleField(count);
    const buffer = new BufferGeometry();
    buffer.setAttribute("position", new Float32BufferAttribute(positions, 3));
    buffer.setAttribute("aScale", new Float32BufferAttribute(scales, 1));
    return buffer;
  }, [count]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({ uColor: { value: new Color() }, uPixelRatio: { value: 1 } }),
    [],
  );

  useFrame((state, delta) => {
    if (material.current) {
      material.current.uniforms.uColor.value.set(colors.particle);
      material.current.uniforms.uPixelRatio.value = state.viewport.dpr;
    }
    if (!group.current || isReduced) return;
    group.current.rotation.y += delta * 0.04;
  });

  return (
    <group ref={group}>
      <points geometry={geometry}>
        <shaderMaterial
          blending={colors.blending}
          depthWrite={false}
          fragmentShader={particleFragment}
          ref={material}
          transparent
          uniforms={uniforms}
          vertexShader={particleVertex}
        />
      </points>
    </group>
  );
}

function Rig({
  children,
  isReduced,
  onReady,
}: {
  children: ReactNode;
  isReduced: boolean;
  onReady?: () => void;
}) {
  const group = useRef<Group>(null);
  const hasSignalled = useRef(false);

  useFrame((state, delta) => {
    if (!hasSignalled.current) {
      hasSignalled.current = true;
      onReady?.();
    }
    if (!group.current || isReduced) return;

    group.current.rotation.x = MathUtils.damp(group.current.rotation.x, -state.pointer.y * 0.3, 3, delta);
    group.current.rotation.y = MathUtils.damp(group.current.rotation.y, state.pointer.x * 0.5, 3, delta);
  });

  return <group ref={group}>{children}</group>;
}

export default function HeroScene({ onReady }: { onReady?: () => void }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const theme = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const quality = getSceneQuality({
    isCoarsePointer: useMediaQuery("(pointer: coarse)"),
    isNarrow: useMediaQuery("(max-width: 40rem)"),
  });

  useEffect(() => {
    const element = wrapper.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(([entry]) =>
      setIsVisible(entry.isIntersecting),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const isReduced = Boolean(shouldReduceMotion);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0"
      ref={wrapper}
    >
      <Canvas
        camera={{ fov: sceneCamera.fov, position: [0, 0, sceneCamera.z] }}
        dpr={quality.dpr}
        fallback={null}
        frameloop={getSceneFrameloop(isVisible, isReduced)}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight color="#f3f1e8" intensity={2.2} position={[3, 4, 5]} />
        <pointLight color={lime} intensity={10} position={[-4, -2, 2]} />

        {/* Local studio lightformers give the clearcoat something to reflect without fetching an HDR. */}
        <Environment frames={1} resolution={256}>
          <Lightformer form="rect" intensity={3} position={[0, 4, 3]} scale={[8, 2, 1]} />
          <Lightformer color={lime} form="circle" intensity={2.5} position={[-5, -1, 1]} scale={3} />
          <Lightformer color="#8fb0ff" form="rect" intensity={1.5} position={[4, -1, 2]} scale={[2, 6, 1]} />
        </Environment>

        <Rig isReduced={isReduced} onReady={onReady}>
          <Float
            enabled={!isReduced}
            floatIntensity={orbitGeometry.floatAmplitude * 6}
            rotationIntensity={0.2}
            speed={1.4}
          >
            <Core detail={quality.detail} isReduced={isReduced} />
            <Halo theme={theme} />
          </Float>
          <Shell isReduced={isReduced} theme={theme} />
          <Rings isReduced={isReduced} theme={theme} />
          <Particles count={quality.particles} isReduced={isReduced} theme={theme} />
        </Rig>
      </Canvas>
    </div>
  );
}
