// The three.js backdrop: the E-Day seal (a cog ring split by a glowing fissure) turning in rising embers and falling ash, leaning toward the cursor.
// `variant="embers"` keeps only the particles for page headers. Falls back to nothing when WebGL is missing.
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { reducedMotion } from './fx';
import { sealHalf } from './sealShape';

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

    // The seal: two halves of a cog ring split by a fissure, drifting apart with molten light between them.
    const medal = new THREE.Group();
    const disposables: { dispose: () => void }[] = [pGeo, pMat, sprite];
    const halves: THREE.Mesh[] = [];
    let crackMat: THREE.MeshBasicMaterial | null = null;
    let coreMat: THREE.SpriteMaterial | null = null;
    if (variant === 'medal') {
      const pmrem = new THREE.PMREMGenerator(renderer);
      const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = env;
      disposables.push(pmrem, env);
      const metal = new THREE.MeshPhysicalMaterial({ color: 0x3a3a40, metalness: 0.85, roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.3, envMapIntensity: 1.2 });
      disposables.push(metal);
      for (const side of [-1, 1] as const) {
        const shape = new THREE.Shape(sealHalf(side).map(([x, y]) => new THREE.Vector2(x, y)));
        const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.45, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 2, curveSegments: 4 });
        geo.translate(0, 0, -0.225);
        const mesh = new THREE.Mesh(geo, metal);
        mesh.userData.side = side;
        const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), new THREE.LineBasicMaterial({ color: new THREE.Color('#FF6A50'), transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending }));
        mesh.add(edges);
        halves.push(mesh);
        medal.add(mesh);
        disposables.push(geo, edges.geometry, edges.material as THREE.Material);
      }
      // Molten light: a bright plane in the fissure and a soft core sprite in the ring's hollow.
      crackMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#FF5A1F'), transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
      const crackGeo = new THREE.PlaneGeometry(0.1, 4.5);
      const crackMesh = new THREE.Mesh(crackGeo, crackMat);
      coreMat = new THREE.SpriteMaterial({ map: sprite, color: new THREE.Color('#FF4A1A'), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
      const core = new THREE.Sprite(coreMat);
      core.scale.setScalar(5.2);
      core.position.z = -0.3;
      const ringGeo = new THREE.TorusGeometry(3.2, 0.012, 8, 160);
      const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3 }));
      ring.rotation.x = Math.PI / 2.3;
      // An inner gauge ring of ticks, so it reads as a seal and not a bare gear.
      const tickGeo = new THREE.BufferGeometry();
      const tp: number[] = [];
      for (let k = 0; k < 60; k++) {
        const a = (k / 60) * Math.PI * 2;
        if (Math.abs(Math.cos(a)) < 0.07) continue;
        const r0 = 1.3, r1 = k % 5 ? 1.42 : 1.55;
        tp.push(Math.cos(a) * r0, Math.sin(a) * r0, 0.3, Math.cos(a) * r1, Math.sin(a) * r1, 0.3);
      }
      tickGeo.setAttribute('position', new THREE.Float32BufferAttribute(tp, 3));
      const ticks = new THREE.LineSegments(tickGeo, new THREE.LineBasicMaterial({ color: 0xd8d8dc, transparent: true, opacity: 0.55 }));
      medal.add(core, crackMesh, ring, ticks);
      disposables.push(tickGeo, ticks.material as THREE.Material);
      medal.position.set(3.7, 0.9, 0);
      medal.scale.setScalar(0.72);
      scene.add(medal);
      disposables.push(crackGeo, crackMat, coreMat, ringGeo, ring.material as THREE.Material);
      scene.add(new THREE.AmbientLight(0xffffff, 0.2));
      const key = new THREE.PointLight(color, 140, 30);
      key.position.set(5, -3, 5);
      const inner = new THREE.PointLight(0xff6a2a, 40, 6);
      inner.position.set(0, 0, 1.2);
      medal.add(inner);
      const rim = new THREE.DirectionalLight(0xffd2b0, 1.6);
      rim.position.set(-6, 4, 2);
      scene.add(key, rim);
    }

    // Ash: slow grey flakes falling against the embers.
    const ASH = variant === 'medal' ? 260 : 120;
    const ashPos = new Float32Array(ASH * 3);
    for (let i = 0; i < ASH; i++) {
      ashPos[i * 3] = (Math.random() - 0.5) * 26;
      ashPos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      ashPos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    const ashGeo = new THREE.BufferGeometry();
    ashGeo.setAttribute('position', new THREE.BufferAttribute(ashPos, 3));
    const ashMat = new THREE.PointsMaterial({ size: 0.07, color: 0x9a8f88, transparent: true, opacity: 0.55, depthWrite: false });
    scene.add(new THREE.Points(ashGeo, ashMat));
    disposables.push(ashGeo, ashMat);

    const resize = () => {
      const w = el.clientWidth || 1, h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      medal.position.x = w < 900 ? 0 : w < 1200 ? 4.1 : 3.7;
      medal.scale.setScalar(w < 900 ? 0.55 : w < 1200 ? 0.6 : 0.72);
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
        for (let i = 0; i < ASH; i++) {
          ashPos[i * 3 + 1] -= 0.006 + (i % 7) * 0.001;
          ashPos[i * 3] += Math.sin(t * 0.4 + i * 1.7) * 0.006;
          if (ashPos[i * 3 + 1] < -8) ashPos[i * 3 + 1] = 8;
        }
        ashGeo.attributes.position.needsUpdate = true;
        medal.rotation.y = Math.sin(t * 0.3) * 0.45 + mouse.x * 0.45;
        medal.rotation.x = Math.sin(t * 0.5) * 0.1 + mouse.y * 0.25;
        medal.position.y = 0.9 + Math.sin(t * 0.9) * 0.15;
        // The halves breathe apart; the fissure flares with them.
        const open = 0.1 + (Math.sin(t * 0.8) * 0.5 + 0.5) * 0.12 + Math.abs(mouse.x) * 0.06;
        halves.forEach((h) => { h.position.x = h.userData.side * open; h.rotation.z = -h.userData.side * open * 0.18; });
        if (crackMat) crackMat.opacity = 0.55 + open * 2.2 + Math.sin(t * 7) * 0.05;
        if (coreMat) coreMat.opacity = 0.6 + open * 1.6;
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
