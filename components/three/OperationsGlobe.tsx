"use client";
import { Line, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { countries, type CountryCode } from "@/content/geo-south-america";

export type GlobeMarker = { id: string; lat: number; lng: number };
type Props = {
  base: { lat: number; lng: number };
  markers: GlobeMarker[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onHover: (h: { id: string; x: number; y: number } | null) => void;
};

const R = 1;
const HIGHLIGHT: CountryCode[] = ["BO", "AR", "PE"];
const C = {
  blue: new THREE.Color("#1C75BC"),
  sky: new THREE.Color("#7FB8E6"),
  sunset: new THREE.Color("#F2A23A"),
  dim: new THREE.Color("#3D6C97"),
};

export function latLngToVec(lat: number, lng: number, r = R) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lng + 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

/* ───────── Globe body + atmosphere ───────── */

const globeVert = /* glsl */ `
  varying vec3 vN; varying vec3 vV;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`;
const globeFrag = /* glsl */ `
  varying vec3 vN; varying vec3 vV;
  void main() {
    float f = pow(1.0 - max(dot(vN, vV), 0.0), 2.4);
    vec3 deep = vec3(0.024, 0.075, 0.122);
    vec3 mid = vec3(0.043, 0.227, 0.388);
    vec3 col = mix(deep, mid, f * 0.9) + vec3(0.11, 0.46, 0.74) * f * 0.55;
    gl_FragColor = vec4(col, 1.0);
  }`;
// Rendered on the back faces of a larger sphere: dot(n, v) runs from ≈ -0.5 at the globe's limb
// to 0 at the halo's outer edge, so the glow hugs the planet and fades into space.
const atmoFrag = /* glsl */ `
  varying vec3 vN; varying vec3 vV;
  void main() {
    float i = pow(clamp(-dot(vN, vV) / 0.5, 0.0, 1.0), 3.0) * 0.85;
    gl_FragColor = vec4(vec3(0.30, 0.62, 0.95) * i, i);
  }`;

function Body() {
  return (
    <>
      <mesh>
        <sphereGeometry args={[R, 96, 96]} />
        <shaderMaterial vertexShader={globeVert} fragmentShader={globeFrag} />
      </mesh>
      <mesh scale={1.16}>
        <sphereGeometry args={[R, 64, 64]} />
        <shaderMaterial
          vertexShader={globeVert}
          fragmentShader={atmoFrag}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          transparent
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

/* ───────── Graticule ───────── */

function Graticule() {
  const geo = useMemo(() => {
    const pts: number[] = [];
    const push = (a: THREE.Vector3, b: THREE.Vector3) => pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
    for (let lat = -75; lat <= 75; lat += 15)
      for (let lng = -180; lng < 180; lng += 3)
        push(latLngToVec(lat, lng, 1.001), latLngToVec(lat, lng + 3, 1.001));
    for (let lng = -180; lng < 180; lng += 15)
      for (let lat = -84; lat < 84; lat += 3)
        push(latLngToVec(lat, lng, 1.001), latLngToVec(lat + 3, lng, 1.001));
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color="#7FB8E6" transparent opacity={0.07} depthWrite={false} />
    </lineSegments>
  );
}

/* ───────── Land as a dot matrix ───────── */

function inRing(lng: number, lat: number, ring: number[]) {
  let inside = false;
  for (let i = 0, j = ring.length - 2; i < ring.length; j = i, i += 2) {
    const xi = ring[i]!,
      yi = ring[i + 1]!,
      xj = ring[j]!,
      yj = ring[j + 1]!;
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

const dotVert = /* glsl */ `
  attribute vec3 aColor; attribute float aSize;
  uniform float uDpr;
  varying vec3 vC; varying float vFacing;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vC = aColor;
    vFacing = dot(normalize(normalMatrix * position), normalize(-mv.xyz));
    gl_PointSize = aSize * uDpr * (3.2 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }`;
const dotFrag = /* glsl */ `
  varying vec3 vC; varying float vFacing;
  void main() {
    if (length(gl_PointCoord - 0.5) > 0.5) discard;
    gl_FragColor = vec4(vC, smoothstep(0.0, 0.35, vFacing));
  }`;

function LandDots() {
  const dpr = useThree((s) => s.viewport.dpr);
  const uniforms = useMemo(() => ({ uDpr: { value: 1 } }), []);
  uniforms.uDpr.value = dpr;
  const geo = useMemo(() => {
    const boxes = (Object.keys(countries) as CountryCode[]).map((code) => {
      const rings = countries[code];
      let minX = 180,
        maxX = -180,
        minY = 90,
        maxY = -90;
      for (const r of rings)
        for (let i = 0; i < r.length; i += 2) {
          minX = Math.min(minX, r[i]!);
          maxX = Math.max(maxX, r[i]!);
          minY = Math.min(minY, r[i + 1]!);
          maxY = Math.max(maxY, r[i + 1]!);
        }
      return { code, rings, minX, maxX, minY, maxY };
    });
    const pos: number[] = [],
      col: number[] = [],
      size: number[] = [];
    const step = 0.42;
    for (let lat = -56; lat <= 13; lat += step) {
      const lngStep = step / Math.cos(THREE.MathUtils.degToRad(lat));
      for (let lng = -82; lng <= -34; lng += lngStep) {
        const hit = boxes.find(
          (b) =>
            lng >= b.minX &&
            lng <= b.maxX &&
            lat >= b.minY &&
            lat <= b.maxY &&
            b.rings.some((r) => inRing(lng, lat, r)),
        );
        if (!hit) continue;
        const v = latLngToVec(lat, lng, 1.002);
        pos.push(v.x, v.y, v.z);
        const hi = HIGHLIGHT.includes(hit.code);
        const c = hit.code === "BO" ? C.sky : hi ? C.blue : C.dim;
        col.push(c.r, c.g, c.b);
        size.push(hit.code === "BO" ? 1.7 : hi ? 1.45 : 1.25);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("aColor", new THREE.Float32BufferAttribute(col, 3));
    g.setAttribute("aSize", new THREE.Float32BufferAttribute(size, 1));
    return g;
  }, []);
  return (
    <points geometry={geo}>
      <shaderMaterial
        vertexShader={dotVert}
        fragmentShader={dotFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}

function Borders() {
  const lines = useMemo(
    () =>
      HIGHLIGHT.flatMap((code) =>
        countries[code].map((ring, i) => ({
          key: `${code}-${i}`,
          code,
          points: Array.from({ length: ring.length / 2 }, (_, k) =>
            latLngToVec(ring[k * 2 + 1]!, ring[k * 2]!, 1.003),
          ),
        })),
      ),
    [],
  );
  return (
    <>
      {lines.map((l) => (
        <Line
          key={l.key}
          points={[...l.points, l.points[0]!]}
          color={l.code === "BO" ? "#BFE0FA" : "#5FA8E6"}
          lineWidth={l.code === "BO" ? 1.6 : 1}
          transparent
          opacity={l.code === "BO" ? 0.9 : 0.55}
        />
      ))}
    </>
  );
}

/* ───────── Arcs + markers ───────── */

function Arc({ from, to, active }: { from: THREE.Vector3; to: THREE.Vector3; active: boolean }) {
  // drei's Line2 exposes its dashed material; animate the offset so the dashes "fly" outward.
  const ref = useRef<{ material: { dashOffset: number } } | null>(null);
  const points = useMemo(() => {
    const dist = from.distanceTo(to);
    const mid = from
      .clone()
      .add(to)
      .normalize()
      .multiplyScalar(R + 0.04 + dist * 0.45);
    return new THREE.QuadraticBezierCurve3(from, mid, to).getPoints(48);
  }, [from, to]);
  useFrame((_, dt) => {
    if (ref.current) ref.current.material.dashOffset -= dt * (active ? 0.5 : 0.18);
  });
  return (
    <Line
      ref={ref as never}
      points={points}
      color="#F2A23A"
      lineWidth={active ? 2.4 : 1.1}
      dashed
      dashSize={active ? 0.06 : 0.025}
      gapSize={active ? 0.015 : 0.03}
      transparent
      opacity={active ? 1 : 0.45}
    />
  );
}

function Marker({
  m,
  active,
  onSelect,
  onHover,
}: {
  m: GlobeMarker;
  active: boolean;
  onSelect: Props["onSelect"];
  onHover: Props["onHover"];
}) {
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const [hover, setHover] = useState(false);
  const pos = useMemo(() => latLngToVec(m.lat, m.lng, 1.004), [m.lat, m.lng]);
  useEffect(() => group.current?.lookAt(pos.clone().multiplyScalar(2)), [pos]);
  useFrame(({ clock }, dt) => {
    const g = group.current;
    if (!g) return;
    const target = active ? 1.3 : hover ? 1.25 : 1;
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, target, 8, dt));
    if (ring.current) {
      const t = (clock.elapsedTime * (active ? 0.9 : 0.5) + m.lat) % 1;
      ring.current.scale.setScalar(1 + t * (active ? 2.6 : 1.6));
      (ring.current.material as THREE.MeshBasicMaterial).opacity = (1 - t) * (active ? 0.9 : 0.4);
    }
  });
  const point = (e: ThreeEvent<PointerEvent>) => ({
    id: m.id,
    x: e.nativeEvent.clientX,
    y: e.nativeEvent.clientY,
  });
  return (
    <group ref={group} position={pos}>
      <mesh ref={ring}>
        <ringGeometry args={[0.008, 0.0105, 40]} />
        <meshBasicMaterial color="#F2A23A" transparent depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0.015]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.0012, 0.0012, 0.03, 6]} />
        <meshBasicMaterial color="#F2A23A" transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.031]}>
        <sphereGeometry args={[0.0055, 16, 16]} />
        <meshBasicMaterial color={active ? "#FFFFFF" : "#F2A23A"} />
      </mesh>
      {/* Generous invisible hit area */}
      <mesh
        position={[0, 0, 0.03]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(m.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
          document.body.style.cursor = "pointer";
          onHover(point(e));
        }}
        onPointerMove={(e) => onHover(point(e))}
        onPointerOut={() => {
          setHover(false);
          document.body.style.cursor = "";
          onHover(null);
        }}
      >
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Base({ lat, lng }: { lat: number; lng: number }) {
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const pos = useMemo(() => latLngToVec(lat, lng, 1.004), [lat, lng]);
  useEffect(() => group.current?.lookAt(pos.clone().multiplyScalar(2)), [pos]);
  useFrame(({ clock }) => {
    if (!ring.current) return;
    const t = (clock.elapsedTime * 0.6) % 1;
    ring.current.scale.setScalar(1 + t * 2);
    (ring.current.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.8;
  });
  return (
    <group ref={group} position={pos}>
      <mesh ref={ring}>
        <ringGeometry args={[0.011, 0.014, 48]} />
        <meshBasicMaterial color="#7FB8E6" transparent depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0.004]}>
        <circleGeometry args={[0.0095, 32]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0, 0, 0.005]}>
        <circleGeometry args={[0.006, 32]} />
        <meshBasicMaterial color="#1C75BC" />
      </mesh>
    </group>
  );
}

/* ───────── Camera: fly to the focus, yield to the user while dragging ───────── */

function CameraRig({ focus, distance }: { focus: THREE.Vector3; distance: number }) {
  const { camera } = useThree();
  const controls = useThree((s) => s.controls) as unknown as {
    addEventListener: (t: "start", fn: () => void) => void;
    removeEventListener: (t: "start", fn: () => void) => void;
    update: () => void;
  } | null;
  const flying = useRef(true);
  const intro = useRef(true);

  useEffect(() => {
    flying.current = true;
  }, [focus, distance]);
  useEffect(() => {
    if (!controls) return;
    const stop = () => {
      flying.current = false;
      intro.current = false;
    };
    controls.addEventListener("start", stop);
    return () => controls.removeEventListener("start", stop);
  }, [controls]);

  useFrame((_, dt) => {
    if (!flying.current) return;
    const k = 1 - Math.exp(-dt * (intro.current ? 1.6 : 2.6));
    const cur = camera.position.clone();
    const len = THREE.MathUtils.lerp(cur.length(), distance, k);
    const dir = cur.normalize().lerp(focus.clone().normalize(), k).normalize();
    camera.position.copy(dir.multiplyScalar(len));
    camera.lookAt(0, 0, 0);
    controls?.update();
    if (dir.angleTo(focus) < 0.002 && Math.abs(len - distance) < 0.005) {
      flying.current = false;
      intro.current = false;
    }
  });
  return null;
}

function Scene({
  base,
  markers,
  activeId,
  onSelect,
  onHover,
  interactive,
}: Props & { interactive: boolean }) {
  const baseVec = useMemo(() => latLngToVec(base.lat, base.lng, 1.004), [base.lat, base.lng]);
  const ends = useMemo(
    () => markers.map((m) => ({ id: m.id, v: latLngToVec(m.lat, m.lng, 1.004) })),
    [markers],
  );
  const active = markers.find((m) => m.id === activeId);
  // Overview frames the whole Bolivia–Argentina–Peru region, a little south of the base.
  const focus = useMemo(
    () => (active ? latLngToVec(active.lat - 2, active.lng) : latLngToVec(base.lat - 6, base.lng + 1)),
    [active, base.lat, base.lng],
  );
  return (
    <>
      <Body />
      <Graticule />
      <LandDots />
      <Borders />
      {ends.map((e) => (
        <Arc key={e.id} from={baseVec} to={e.v} active={e.id === activeId} />
      ))}
      {markers.map((m) => (
        <Marker key={m.id} m={m} active={m.id === activeId} onSelect={onSelect} onHover={onHover} />
      ))}
      <Base lat={base.lat} lng={base.lng} />
      <CameraRig focus={focus} distance={active ? 2.15 : 3.05} />
      {/* Touch devices: no drag-to-rotate, so the page keeps scrolling; scroll and taps drive the globe. */}
      {interactive && (
        <OrbitControls
          makeDefault
          enablePan={false}
          enableZoom
          minDistance={1.5}
          maxDistance={3.8}
          rotateSpeed={0.45}
          zoomSpeed={0.6}
          enableDamping
          dampingFactor={0.08}
        />
      )}
    </>
  );
}

/** The R3F canvas. Renders only while on screen. */
export default function OperationsGlobe(props: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [interactive, setInteractive] = useState(false);
  useEffect(() => setInteractive(window.matchMedia("(pointer: fine)").matches), []);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(!!e?.isIntersecting), { rootMargin: "100px" });
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);
  // Start looking at the far side of the continent so the first flight-in has some travel.
  const start = useMemo(() => latLngToVec(-5, -110, 4.2), []);
  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, 1.75]}
        camera={{ fov: 35, near: 0.1, far: 20, position: [start.x, start.y, start.z] }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onPointerMissed={() => props.onHover(null)}
      >
        <Scene {...props} interactive={interactive} />
      </Canvas>
    </div>
  );
}
