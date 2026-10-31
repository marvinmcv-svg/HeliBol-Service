"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const COUNT = 1400;

const vertex = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uCalm;
  attribute float aSeed;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    // Idle drift — grass and dust stirred by the rotor.
    float t = uTime * (0.25 + aSeed * 0.35);
    p.x += sin(t + aSeed * 40.0) * 0.08;
    p.y += cos(t * 1.3 + aSeed * 20.0) * 0.06;
    // Swirl away from the cursor (downwash), weaker as the page scrolls.
    vec2 d = p.xy - uMouse;
    float dist = length(d);
    float force = (1.0 - uCalm) * smoothstep(1.6, 0.0, dist);
    float ang = force * 2.4;
    mat2 rot = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
    p.xy = uMouse + rot * d * (1.0 + force * 0.9);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.4 + aSeed * 2.6) * (6.0 / -mv.z);
    vAlpha = (0.25 + aSeed * 0.55) * (1.0 - uCalm * 0.6);
  }
`;
const fragment = /* glsl */ `
  varying float vAlpha;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    vec3 grass = vec3(0.95, 0.80, 0.55);
    gl_FragColor = vec4(grass, vAlpha * smoothstep(0.5, 0.0, r));
  }
`;

function Field() {
  const ref = useRef<THREE.ShaderMaterial>(null);
  const { viewport, pointer } = useThree();
  const mouse = useRef(new THREE.Vector2(0, -2));

  const [positions, seeds] = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const seed = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 7;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2;
      seed[i] = Math.random();
    }
    return [pos, seed];
  }, []);

  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uMouse: { value: new THREE.Vector2() }, uCalm: { value: 0 } }),
    [],
  );

  const target = useMemo(() => new THREE.Vector2(), []);

  useFrame((_, dt) => {
    const m = ref.current;
    if (!m) return;
    m.uniforms.uTime!.value += dt;
    target.set((pointer.x * viewport.width) / 2, (pointer.y * viewport.height) / 2);
    mouse.current.lerp(target, 0.08);
    (m.uniforms.uMouse!.value as THREE.Vector2).copy(mouse.current);
    const calm = Math.min(window.scrollY / window.innerHeight, 1);
    m.uniforms.uCalm!.value += (calm - m.uniforms.uCalm!.value) * 0.1;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={ref}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * Rotor-wash particle field (plan M3). Desktop only, lazy-loaded after idle by the hero.
 * Renders only while the hero is on screen and the tab is visible — an always-on canvas over
 * the hero video was the main source of scroll jank.
 */
export default function RotorWashField() {
  const wrap = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let inView = true;
    const update = () => setActive(inView && document.visibilityState === "visible");
    const io = new IntersectionObserver(([e]) => {
      inView = Boolean(e?.isIntersecting);
      update();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0">
      <Canvas
        dpr={1}
        frameloop={active ? "always" : "never"}
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power", stencil: false, depth: false }}
        className="!absolute inset-0"
        eventSource={typeof document !== "undefined" ? document.body : undefined}
        eventPrefix="client"
      >
        <Field />
      </Canvas>
    </div>
  );
}
