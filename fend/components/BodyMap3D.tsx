'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export type BodyViewSide = 'front' | 'back' | 'left' | 'right' | 'pelvis';

export interface BodyRegionMeta {
  id: string;
  label: string;
  defaultSide: 'front' | 'back' | 'left' | 'right';
}

export interface LoggedBodyMarker {
  id: number;
  regionId: string;
  severity: number;
  symptom: string;
}

interface BodyMap3DProps {
  selectedRegionId: string;
  viewSide: BodyViewSide;
  logs: LoggedBodyMarker[];
  onSelectRegion: (region: BodyRegionMeta) => void;
}

const REGION_COLORS = {
  base: 0xe2c7c2,
  hover: 0xf472b6,
  selected: 0xe11d48,
  pinMild: 0xf59e0b,
  pinSevere: 0xdc2626,
};

const CAMERA_PRESETS: Record<BodyViewSide, { pos: [number, number, number]; target: [number, number, number] }> = {
  front: { pos: [0, 1.05, 3.1], target: [0, 0.95, 0] },
  back: { pos: [0, 1.05, -3.1], target: [0, 0.95, 0] },
  left: { pos: [-3.1, 1.05, 0], target: [0, 0.95, 0] },
  right: { pos: [3.1, 1.05, 0], target: [0, 0.95, 0] },
  pelvis: { pos: [0, 0.85, 1.75], target: [0, 0.82, 0] },
};

export function BodyMap3D({ selectedRegionId, viewSide, logs, onSelectRegion }: BodyMap3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const [contextLost, setContextLost] = useState(false);

  const selectedRef = useRef(selectedRegionId);
  selectedRef.current = selectedRegionId;
  const viewRef = useRef(viewSide);
  viewRef.current = viewSide;
  const logsRef = useRef(logs);
  logsRef.current = logs;
  const onSelectRef = useRef(onSelectRegion);
  onSelectRef.current = onSelectRegion;
  const requestRenderRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    requestRenderRef.current?.();
  }, [selectedRegionId, viewSide, logs]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 540;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const gl = renderer.getContext();
    const dbg = gl?.getExtension('WEBGL_debug_renderer_info');
    const rendererStr = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '') : '';
    const isSoftwareGl = /swiftshader|llvmpipe|software/i.test(rendererStr);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(...CAMERA_PRESETS.front.pos);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 1.3;
    controls.maxDistance = 4.6;
    controls.maxPolarAngle = Math.PI * 0.62;
    controls.target.set(...CAMERA_PRESETS.front.target);

    // Three-point studio lighting
    const hemi = new THREE.HemisphereLight(0xfff5f7, 0xcbd5e1, 0.85);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.35);
    keyLight.position.set(2.5, 4.0, 3.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xe0f2fe, 0.65);
    rimLight.position.set(-2.5, 2.5, -2.5);
    scene.add(rimLight);

    // Pedestal floor disc
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(1.15, 48),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.9, metalness: 0.0 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.02;
    floor.receiveShadow = true;
    scene.add(floor);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.68, 0.72, 48),
      new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.6, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.015;
    scene.add(ring);

    // Composite anatomical 3D body group
    const bodyGroup = new THREE.Group();
    scene.add(bodyGroup);

    const interactiveMeshes: THREE.Mesh[] = [];
    const regionPositionMap = new Map<string, THREE.Vector3>();

    const addPart = (
      regionId: string,
      regionLabel: string,
      defaultSide: 'front' | 'back' | 'left' | 'right',
      geometry: THREE.BufferGeometry,
      position: [number, number, number],
      scale: [number, number, number] = [1, 1, 1],
      rotation: [number, number, number] = [0, 0, 0]
    ) => {
      const mat = new THREE.MeshStandardMaterial({
        color: REGION_COLORS.base,
        roughness: 0.55,
        metalness: 0.04,
      });
      const mesh = new THREE.Mesh(geometry, mat);
      mesh.position.set(...position);
      mesh.scale.set(...scale);
      mesh.rotation.set(...rotation);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { regionId, regionLabel, defaultSide };
      bodyGroup.add(mesh);
      interactiveMeshes.push(mesh);
      if (!regionPositionMap.has(regionId)) {
        regionPositionMap.set(regionId, new THREE.Vector3(...position));
      }
      return mesh;
    };

    // Sculpted anatomical hierarchy
    addPart('head', 'Head & Temples', 'front', new THREE.SphereGeometry(0.125, 28, 28), [0, 1.66, 0], [0.92, 1.08, 0.98]);
    addPart('neck_throat', 'Neck & Thyroid Area', 'front', new THREE.CylinderGeometry(0.055, 0.068, 0.14, 24), [0, 1.5, 0.01]);
    addPart('chest_breast', 'Chest & Breast Tissue', 'front', new THREE.SphereGeometry(0.18, 28, 24), [0, 1.31, 0.04], [1.18, 0.85, 0.72]);
    addPart('upper_back', 'Upper Back & Shoulders', 'back', new THREE.CapsuleGeometry(0.13, 0.18, 12, 24), [0, 1.32, -0.055], [1.35, 1.0, 0.6], [0, 0, Math.PI / 2]);
    addPart('upper_abdomen', 'Upper Abdomen & Stomach', 'front', new THREE.CylinderGeometry(0.145, 0.125, 0.19, 28), [0, 1.12, 0.03], [1.12, 1.0, 0.78]);
    addPart('lower_back', 'Lower Back (Lumbar)', 'back', new THREE.CylinderGeometry(0.135, 0.15, 0.22, 28), [0, 0.96, -0.05], [1.15, 1.0, 0.68]);
    addPart('lower_abdomen', 'Lower Abdomen & Pelvic Anterior', 'front', new THREE.CylinderGeometry(0.128, 0.165, 0.18, 28), [0, 0.94, 0.04], [1.18, 1.0, 0.82]);
    addPart('pelvis_uterus', 'Deep Pelvic & Uterine Region', 'front', new THREE.SphereGeometry(0.155, 28, 24), [0, 0.79, 0.025], [1.26, 0.82, 0.88]);
    addPart('left_hip', 'Left Hip / Ovary Side', 'left', new THREE.SphereGeometry(0.105, 20, 20), [-0.155, 0.82, 0.01], [0.85, 1.05, 0.92]);
    addPart('right_hip', 'Right Hip / Ovary Side', 'right', new THREE.SphereGeometry(0.105, 20, 20), [0.155, 0.82, 0.01], [0.85, 1.05, 0.92]);
    addPart('left_arm', 'Left Arm & Shoulder', 'left', new THREE.CapsuleGeometry(0.045, 0.44, 10, 18), [-0.255, 1.14, 0], [1, 1, 1], [0, 0, -0.14]);
    addPart('right_arm', 'Right Arm & Shoulder', 'right', new THREE.CapsuleGeometry(0.045, 0.44, 10, 18), [0.255, 1.14, 0], [1, 1, 1], [0, 0, 0.14]);
    addPart('left_leg', 'Left Thigh & Knee', 'front', new THREE.CapsuleGeometry(0.072, 0.56, 12, 20), [-0.105, 0.37, 0], [1, 1, 1], [0, 0, -0.03]);
    addPart('right_leg', 'Right Thigh & Knee', 'front', new THREE.CapsuleGeometry(0.072, 0.56, 12, 20), [0.105, 0.37, 0], [1, 1, 1], [0, 0, 0.03]);

    const pinsGroup = new THREE.Group();
    bodyGroup.add(pinsGroup);

    let hoveredMesh: THREE.Mesh | null = null;
    let activeView = viewRef.current;
    let cameraTransitioning = false;
    let lastLogHash = '';

    const syncPinsAndMaterials = () => {
      const selId = selectedRef.current;
      for (const mesh of interactiveMeshes) {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        const rId = mesh.userData.regionId;
        if (rId === selId) {
          mat.color.setHex(REGION_COLORS.selected);
          mat.emissive.setHex(0x881337);
          mat.emissiveIntensity = 0.28;
        } else if (mesh === hoveredMesh) {
          mat.color.setHex(REGION_COLORS.hover);
          mat.emissive.setHex(0x9d174d);
          mat.emissiveIntensity = 0.15;
        } else {
          mat.color.setHex(REGION_COLORS.base);
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0;
        }
      }

      const currentLogs = logsRef.current;
      const hash = currentLogs.map((l) => `${l.id}:${l.regionId}:${l.severity}`).join('|');
      if (hash !== lastLogHash) {
        lastLogHash = hash;
        while (pinsGroup.children.length > 0) {
          const child = pinsGroup.children.pop() as THREE.Mesh;
          child.geometry.dispose();
          (child.material as THREE.Material).dispose();
        }
        const byRegion = new Map<string, number>();
        for (const l of currentLogs) {
          const prev = byRegion.get(l.regionId) ?? 0;
          if (l.severity > prev) byRegion.set(l.regionId, l.severity);
        }
        for (const [rId, maxSev] of byRegion.entries()) {
          const basePos = regionPositionMap.get(rId);
          if (!basePos) continue;
          const pin = new THREE.Mesh(
            new THREE.SphereGeometry(0.032, 16, 16),
            new THREE.MeshStandardMaterial({
              color: maxSev >= 7 ? REGION_COLORS.pinSevere : REGION_COLORS.pinMild,
              emissive: maxSev >= 7 ? 0xb91c1c : 0xd97706,
              emissiveIntensity: 0.45,
              roughness: 0.3,
            })
          );
          pin.position.set(basePos.x, basePos.y + 0.02, basePos.z + (basePos.z < 0 ? -0.1 : 0.14));
          pinsGroup.add(pin);
        }
      }
    };

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downX = 0;
    let downY = 0;

    const updatePointer = (ev: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerMove = (ev: PointerEvent) => {
      updatePointer(ev);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(interactiveMeshes, false);
      const hitMesh = (hits[0]?.object as THREE.Mesh) || null;
      if (hitMesh !== hoveredMesh) {
        hoveredMesh = hitMesh;
        setHoveredLabel(hitMesh ? hitMesh.userData.regionLabel : null);
        renderer.domElement.style.cursor = hitMesh ? 'pointer' : 'grab';
        renderSoon();
      }
    };

    const onPointerDown = (ev: PointerEvent) => {
      downX = ev.clientX;
      downY = ev.clientY;
    };

    const onPointerUp = (ev: PointerEvent) => {
      const dist = Math.hypot(ev.clientX - downX, ev.clientY - downY);
      if (dist > 6) return; // Drag orbit, not click
      updatePointer(ev);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(interactiveMeshes, false);
      const hitMesh = hits[0]?.object as THREE.Mesh | undefined;
      if (hitMesh?.userData?.regionId) {
        onSelectRef.current({
          id: hitMesh.userData.regionId,
          label: hitMesh.userData.regionLabel,
          defaultSide: hitMesh.userData.defaultSide,
        });
        renderSoon();
      }
    };

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const onContextRestored = () => {
      setContextLost(false);
      renderSoon();
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    let rafId = 0;
    let running = true;
    const clock = new THREE.Clock();

    const renderFrame = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      if (viewRef.current !== activeView) {
        activeView = viewRef.current;
        cameraTransitioning = true;
      }

      if (cameraTransitioning) {
        const preset = CAMERA_PRESETS[activeView];
        const factor = 1 - Math.exp(-8 * dt);
        camera.position.lerp(new THREE.Vector3(...preset.pos), factor);
        controls.target.lerp(new THREE.Vector3(...preset.target), factor);
        if (camera.position.distanceTo(new THREE.Vector3(...preset.pos)) < 0.02) {
          cameraTransitioning = false;
        }
      }

      controls.update();
      syncPinsAndMaterials();
      renderer.render(scene, camera);

      if (!isSoftwareGl && running) {
        rafId = requestAnimationFrame(renderFrame);
      } else if (cameraTransitioning && running) {
        rafId = requestAnimationFrame(renderFrame);
      } else {
        rafId = 0;
      }
    };

    const renderSoon = () => {
      if (!rafId && running) {
        rafId = requestAnimationFrame(renderFrame);
      }
    };
    requestRenderRef.current = renderSoon;

    if (isSoftwareGl) {
      controls.addEventListener('change', renderSoon);
      renderSoon();
    } else {
      rafId = requestAnimationFrame(renderFrame);
    }

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 640;
      const h = container.clientHeight || 540;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderSoon();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      controls.dispose();
      interactiveMeshes.forEach((m) => {
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      });
      pmrem.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative h-[540px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
      <div ref={mountRef} className="h-full w-full" />
      <div className="pointer-events-none absolute top-3 left-3 rounded-lg border border-slate-200 bg-white/95 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm">
        {hoveredLabel ? `Region: ${hoveredLabel} (Click to log)` : 'Drag to orbit · Scroll to zoom · Click any region'}
      </div>
      {contextLost && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100/90 text-sm font-medium text-slate-700">
          3D viewport paused — restoring graphics context...
        </div>
      )}
    </div>
  );
}
