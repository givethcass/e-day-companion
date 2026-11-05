// The three.js backdrop: a faceted medal-like diamond turning in a cloud of rising embers, leaning toward the cursor.
// `variant="embers"` keeps only the particles for page headers. Falls back to nothing when WebGL is missing.
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { reducedMotion } from './fx';

export function HeroScene({ variant = 'medal', tint = '#E50F11', className = '' }: { variant?: 'medal' | 'embers'; tint?: string; className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.055);
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 12);
    const color = new THREE.Color(tint);

    // Embers: points that drift upward and wrap around, additive so they glow over the solid background.
    const COUNT = variant === 'medal' ? 900 : 500;
    const pos = new Float32Array(COUNT * 3);
    const speed = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 26;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2;
      speed[i] = 0.004 + Math.random() * 0.018;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const dot = document.createElement('canvas');
    dot.width = dot.height = 64;
    const g = dot.getContext('2d')!;
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.25, 'rgba(255,180,120,0.9)'); grd.addColorStop(1, 'rgba(255,60,20,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
    const sprite = new THREE.CanvasTexture(dot);
    const pMat = new THREE.PointsMaterial({ size: 0.16, map: sprite, color: new THREE.Color('#FF7A3C'), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const embers = new THREE.Points(pGeo, pMat);
    scene.add(embers);

    // The medal: an octahedron stretched like the badge, solid metal plus a glowing edge cage and an inner core.
    const medal = new THREE.Group();
    const disposables: { dispose: () => void }[] = [pGeo, pMat, sprite];
    if (variant === 'medal') {
      const pmrem = new THREE.PMREMGenerator(renderer);
      const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = env;
      disposables.push(pmrem, env);
      const geo = new THREE.OctahedronGeometry(2, 0);
      geo.scale(1, 1.15, 0.5);
      const metal = new THREE.MeshPhysicalMaterial({ color: 0x3a0d0b, metalness: 0.85, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.15, flatShading: true, envMapIntensity: 1.1 });
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: new THREE.Color('#FF6A50'), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending }));
      const inner = new THREE.OctahedronGeometry(1.05, 0);
      inner.scale(1, 1.15, 0.5);
      const core = new THREE.Mesh(inner, new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.55 }));
      const ringGeo = new THREE.TorusGeometry(3.1, 0.012, 8, 160);
      const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35 }));
      ring.rotation.x = Math.PI / 2.4;
      const ring2 = ring.clone();
      ring2.scale.setScalar(1.25);
      ring2.rotation.x = Math.PI / 1.8;
      medal.add(new THREE.Mesh(geo, metal), edges, core, ring, ring2);
      medal.position.set(3.2, 0.2, 0);
      scene.add(medal);
      disposables.push(geo, metal, edges.geometry, edges.material as THREE.Material, inner, core.material as THREE.Material, ringGeo, ring.material as THREE.Material);
      scene.add(new THREE.AmbientLight(0xffffff, 0.25));
      const key = new THREE.PointLight(color, 120, 30);
      key.position.set(6, 3, 6);
      const rim = new THREE.DirectionalLight(0xffd2b0, 1.4);
      rim.position.set(-6, 4, 2);
      scene.add(key, rim);
    }

    const resize = () => {
      const w = el.clientWidth || 1, h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      medal.position.x = w < 900 ? 0 : 3.2;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      mouse.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      mouse.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    window.addEventListener('pointermove', onMove);

    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(el);
    const still = reducedMotion();
    let raf = 0;
    const clock = new THREE.Clock();
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const t = clock.getElapsedTime();
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      if (!still) {
        for (let i = 0; i < COUNT; i++) {
          const k = i * 3 + 1;
          pos[k] += speed[i];
          pos[i * 3] += Math.sin(t * 0.6 + i) * 0.003;
          if (pos[k] > 8) pos[k] = -8;
        }
        pGeo.attributes.position.needsUpdate = true;
        medal.rotation.y = t * 0.35 + mouse.x * 0.5;
        medal.rotation.x = Math.sin(t * 0.5) * 0.12 + mouse.y * 0.3;
        medal.position.y = 0.2 + Math.sin(t * 0.9) * 0.18;
      }
      camera.position.x = mouse.x * 0.8;
      camera.position.y = -mouse.y * 0.5;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [variant, tint]);
  return <div ref={host} aria-hidden className={`absolute inset-0 ${className}`} />;
}
