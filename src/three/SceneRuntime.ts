import * as THREE from 'three';
import type { NarrativePhase, NarrativeScenario } from '../narrative/types';

type SceneState = {
  phase: NarrativePhase;
  owners: number[];
  silver: number[];
  zeroUtility?: boolean;
  mastered?: boolean;
  focusTargetId?: string | null;
};

type AnimatedObject = {
  object: THREE.Object3D;
  baseY: number;
  speed: number;
  amount: number;
  kind: 'float' | 'flame' | 'wheel' | 'breathe';
};

const COLORS = {
  ink: 0x17130f,
  wood: 0x3a2419,
  woodLight: 0x6a4329,
  paper: 0xd8c8a6,
  gold: 0xc8943d,
  jade: 0x3f7168,
  vermilion: 0x8e2f24,
  stone: 0x49423a,
};

function standard(color: number, roughness = 0.72, metalness = 0.02) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

export class SceneRuntime {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.PerspectiveCamera;
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2(8, 8);
  private readonly clock = new THREE.Clock();
  private readonly interactives: THREE.Object3D[] = [];
  private readonly animated: AnimatedObject[] = [];
  private readonly itemMeshes = new Map<string, THREE.Object3D>();
  private readonly itemHomes = new Map<string, THREE.Vector3>();
  private readonly focusables = new Map<string, THREE.Object3D>();
  private readonly focusScales = new Map<string, THREE.Vector3>();
  private readonly materials = new Set<THREE.Material>();
  private frame = 0;
  private hovered: THREE.Mesh | null = null;
  private hoveredEmissive = new THREE.Color();
  private cameraPointer = new THREE.Vector2();
  private cameraLookX = 0;
  private state: SceneState = { phase: 'investigation', owners: [], silver: [], focusTargetId: null };
  private readonly resizeObserver: ResizeObserver;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly sceneId: 'prologue' | NarrativeScenario['id'],
    private readonly scenario: NarrativeScenario,
    private readonly onHotspot: (targetId: string) => void,
  ) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.camera = new THREE.PerspectiveCamera(37, 1, 0.1, 70);
    this.camera.position.set(0, 5.2, 12.8);
    this.camera.lookAt(0, 1.6, 0);

    this.scene.background = new THREE.Color(sceneId === 'prologue' ? 0x05080d : COLORS.ink);
    this.scene.fog = new THREE.FogExp2(sceneId === 'prologue' ? 0x05080d : 0x201710, sceneId === 'prologue' ? 0.025 : 0.035);

    if (sceneId === 'prologue') this.buildPrologue();
    else {
      this.addRoom();
      if (sceneId === 'guild') this.buildGuild();
      if (sceneId === 'yamen') this.buildYamen();
      if (sceneId === 'palace') this.buildPalace();
    }

    this.canvas.addEventListener('pointermove', this.handlePointerMove);
    this.canvas.addEventListener('pointerleave', this.handlePointerLeave);
    this.canvas.addEventListener('click', this.handleClick);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.resize();
    this.animate();
  }

  update(state: SceneState) {
    this.state = state;
  }

  private material(color: number, roughness = 0.72, metalness = 0.02) {
    const material = standard(color, roughness, metalness);
    this.materials.add(material);
    return material;
  }

  private box(size: [number, number, number], position: [number, number, number], color: number, parent: THREE.Object3D = this.scene) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), this.material(color));
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  private cylinder(radius: number, height: number, position: [number, number, number], color: number, parent: THREE.Object3D = this.scene, segments = 16) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 1.04, height, segments), this.material(color));
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  private addRoom() {
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(24, 18), this.material(0x2b2019, 0.9));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.02;
    floor.receiveShadow = true;
    this.scene.add(floor);

    this.box([18, 7, 0.25], [0, 3.5, -4.5], COLORS.wood);
    this.box([0.25, 7, 12], [-9, 3.5, 0], COLORS.wood);
    this.box([0.25, 7, 12], [9, 3.5, 0], COLORS.wood);

    for (const x of [-7.2, -3.6, 3.6, 7.2]) {
      this.cylinder(0.28, 6.8, [x, 3.4, -3.9], 0x6f2f25, this.scene, 18);
      this.cylinder(0.42, 0.18, [x, 0.1, -3.9], COLORS.gold, this.scene, 18);
    }

    const ambient = new THREE.HemisphereLight(0xd6b77b, 0x17110d, 1.6);
    this.scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffd89a, 2.6);
    key.position.set(-4, 8, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -10;
    key.shadow.camera.right = 10;
    key.shadow.camera.top = 8;
    key.shadow.camera.bottom = -5;
    key.shadow.bias = -0.0005;
    this.scene.add(key);

    for (const x of [-5.5, 0, 5.5]) this.addLantern(x, 5.3, -1.8);
  }

  private addLantern(x: number, y: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, y, z);
    const frame = this.cylinder(0.28, 0.62, [0, 0, 0], 0x9b3d27, group, 10);
    frame.material.emissive = new THREE.Color(0x5e1508);
    frame.material.emissiveIntensity = 0.7;
    const light = new THREE.PointLight(0xffa64d, 9, 7, 2);
    light.position.y = -0.1;
    group.add(light);
    this.scene.add(group);
    this.animated.push({ object: group, baseY: y, speed: 0.7 + Math.abs(x) * 0.03, amount: 0.04, kind: 'float' });
    this.animated.push({ object: light, baseY: -0.1, speed: 5 + Math.abs(x), amount: 0.25, kind: 'flame' });
  }

  private addCharacter(id: string, x: number, z: number, color: string, scale = 1) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.scale.setScalar(scale);
    const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.62, 1.55, 12), this.material(Number.parseInt(color.slice(1), 16), 0.82));
    robe.position.y = 0.82;
    robe.castShadow = true;
    group.add(robe);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), this.material(0xb98a62, 0.85));
    head.position.y = 1.86;
    head.castShadow = true;
    group.add(head);
    const hat = this.box([0.62, 0.12, 0.34], [0, 2.16, 0], 0x1b1714, group);
    hat.rotation.y = 0.04;
    group.userData.hotspotId = id;
    this.interactives.push(group);
    this.focusables.set(id, group);
    this.focusScales.set(id, group.scale.clone());
    this.scene.add(group);
    this.animated.push({ object: robe, baseY: robe.position.y, speed: 1.2 + Math.abs(x) * 0.04, amount: 0.018, kind: 'breathe' });
    return group;
  }

  private registerItem(id: string, object: THREE.Object3D) {
    object.userData.hotspotId = id;
    this.interactives.push(object);
    this.itemMeshes.set(id, object);
    this.itemHomes.set(id, object.position.clone());
    this.focusables.set(id, object);
    this.focusScales.set(id, object.scale.clone());
    return object;
  }

  private buildGuild() {
    this.camera.position.set(0, 4.7, 12.5);
    this.box([8.8, 0.35, 3.3], [0, 0.82, 0.4], 0x4b2d1d);
    this.box([9.2, 0.16, 3.7], [0, 1.04, 0.4], 0x76492b);
    this.addCharacter('jinghe', -5.5, 0.8, this.scenario.agents[0].color, 1.08);
    this.addCharacter('yunjin', 5.5, 0.8, this.scenario.agents[1].color, 1.08);

    const mirror = new THREE.Group();
    mirror.position.set(-2.8, 1.72, 0.2);
    const glassMaterial = new THREE.MeshPhysicalMaterial({ color: 0xb6d6d1, roughness: 0.08, metalness: 0.45, clearcoat: 1 });
    this.materials.add(glassMaterial);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.25), glassMaterial);
    glass.rotation.y = 0.08;
    mirror.add(glass);
    const frame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.08, 1.43, 0.08)), new THREE.LineBasicMaterial({ color: COLORS.gold }));
    mirror.add(frame);
    this.scene.add(mirror);
    this.registerItem('mirror', mirror);

    const scroll = new THREE.Group();
    scroll.position.set(-0.85, 1.3, 0.2);
    const paper = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.05, 0.62), this.material(COLORS.paper, 0.95));
    scroll.add(paper);
    this.cylinder(0.08, 1.5, [-0.72, 0, 0], COLORS.woodLight, scroll, 10).rotation.z = Math.PI / 2;
    this.cylinder(0.08, 1.5, [0.72, 0, 0], COLORS.woodLight, scroll, 10).rotation.z = Math.PI / 2;
    this.scene.add(scroll);
    this.registerItem('dye-scroll', scroll);

    const plaque = this.box([1.65, 0.18, 0.72], [1.2, 1.34, 0.2], 0x6f2f20);
    plaque.material.metalness = 0.08;
    this.registerItem('plaque', plaque);

    const vase = new THREE.Mesh(new THREE.LatheGeometry([
      new THREE.Vector2(0, 0), new THREE.Vector2(0.28, 0.08), new THREE.Vector2(0.38, 0.55),
      new THREE.Vector2(0.2, 0.9), new THREE.Vector2(0.18, 1.1), new THREE.Vector2(0.26, 1.18),
    ], 18), this.material(0x96aaa3, 0.25));
    vase.position.set(3.15, 1.1, 0.2);
    vase.castShadow = true;
    this.scene.add(vase);
    this.registerItem('vase', vase);
  }

  private buildYamen() {
    this.camera.position.set(0, 5.6, 13.8);
    this.box([8.2, 0.45, 2.4], [0, 1.25, -2.2], 0x5a2c20);
    this.box([2.8, 1.0, 0.2], [0, 4.6, -4.15], 0x7d3528);
    this.addCharacter('boqian', -4.8, 0.7, this.scenario.agents[0].color);
    this.addCharacter('zhongwen', 0, 1.2, this.scenario.agents[1].color);
    this.addCharacter('shoucheng', 4.8, 0.7, this.scenario.agents[2].color);

    const positions: [number, number, number][] = [[-3.2, 1.0, -0.4], [-1.6, 1.0, -0.4], [0, 1.0, -0.4], [1.6, 1.0, -0.4], [3.2, 1.0, -0.4]];
    const colors = [0x765438, COLORS.gold, 0x5b3e2a, 0x456a59, 0x3d6b75];
    this.scenario.items.forEach((item, index) => {
      const token = new THREE.Group();
      token.position.set(...positions[index]);
      const base = this.box([1.0, 0.18, 0.78], [0, 0.12, 0], colors[index], token);
      base.material.roughness = 0.55;
      if (item.id === 'watermill') {
        const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.045, 8, 18), this.material(COLORS.gold, 0.5, 0.25));
        wheel.rotation.y = Math.PI / 2;
        wheel.position.y = 0.55;
        token.add(wheel);
        this.animated.push({ object: wheel, baseY: wheel.position.y, speed: 0.55, amount: 0, kind: 'wheel' });
      } else {
        const marker = this.cylinder(0.18, 0.38, [0, 0.38, 0], colors[index], token, index === 1 ? 8 : 12);
        marker.material.metalness = index === 1 ? 0.55 : 0.05;
      }
      this.scene.add(token);
      this.registerItem(item.id, token);
    });
  }

  private buildPalace() {
    this.camera.position.set(0, 5.8, 14.8);
    const table = this.box([10.5, 0.48, 4.4], [0, 0.9, 0.2], 0x3b2419);
    table.material.roughness = 0.42;
    const map = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 2.7, 12, 6), this.material(0xb8a579, 0.96));
    map.rotation.x = -Math.PI / 2;
    map.position.set(0, 1.16, 0.2);
    map.userData.hotspotId = 'map';
    this.interactives.push(map);
    this.focusables.set('map', map);
    this.focusScales.set('map', map.scale.clone());
    this.scene.add(map);

    this.addCharacter('emperor', 0, -3.1, '#b58b39', 1.16);
    this.addCharacter('juzheng', -5.6, 0.2, this.scenario.agents[0].color);
    this.addCharacter('jiguang', 0, 3.0, this.scenario.agents[1].color);
    this.addCharacter('fengbao', 5.6, 0.2, this.scenario.agents[2].color);

    const positions: [number, number, number][] = [[-3.4, 1.37, 0.1], [-1.7, 1.37, 0.1], [0, 1.37, 0.1], [1.7, 1.37, 0.1], [3.4, 1.37, 0.1]];
    this.scenario.items.forEach((item, index) => {
      const seal = new THREE.Group();
      seal.position.set(...positions[index]);
      this.cylinder(0.32, 0.34, [0, 0.18, 0], index === 0 ? 0x353a3d : COLORS.gold, seal, 8);
      this.box([0.5, 0.22, 0.5], [0, 0.48, 0], index === 3 ? 0x7c3126 : 0x75542a, seal);
      this.scene.add(seal);
      this.registerItem(item.id, seal);
      this.animated.push({ object: seal, baseY: seal.position.y, speed: 0.75 + index * 0.08, amount: 0.025, kind: 'float' });
    });

    for (const x of [-4.4, 4.4]) {
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.38, 10), this.material(0xffa02b, 0.2));
      flame.material.emissive = new THREE.Color(0xff6a12);
      flame.material.emissiveIntensity = 2.2;
      flame.position.set(x, 1.62, 1.2);
      this.scene.add(flame);
      this.animated.push({ object: flame, baseY: flame.position.y, speed: 6 + x, amount: 0.08, kind: 'flame' });
    }
  }

  private buildPrologue() {
    this.camera.position.set(0, 1.8, 11.5);
    this.camera.lookAt(0, 0.6, 0);
    const positions = new Float32Array(600 * 3);
    for (let index = 0; index < 600; index += 1) {
      const radius = 4 + Math.random() * 18;
      const angle = Math.random() * Math.PI * 2;
      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = (Math.random() - 0.5) * 12;
      positions[index * 3 + 2] = Math.sin(angle) * radius - 4;
    }
    const starsGeometry = new THREE.BufferGeometry();
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starsMaterial = new THREE.PointsMaterial({ color: 0xc7d5d0, size: 0.045, transparent: true, opacity: 0.8 });
    this.materials.add(starsMaterial);
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    this.scene.add(stars);
    this.animated.push({ object: stars, baseY: 0, speed: 0.025, amount: 0, kind: 'wheel' });

    const bronze = this.material(0x77714a, 0.38, 0.72);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.22, 0.34), bronze);
    beam.position.y = 1.7;
    beam.rotation.z = -0.03;
    this.scene.add(beam);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.3, 4.0, 20), bronze);
    stem.position.y = -0.2;
    this.scene.add(stem);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.7, 0.35, 32), bronze);
    base.position.y = -2.2;
    this.scene.add(base);
    for (const x of [-2.65, 2.65]) {
      const chainMaterial = new THREE.LineBasicMaterial({ color: 0xb5a86d });
      this.materials.add(chainMaterial);
      const chain = new THREE.Line(new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, 1.58, 0), new THREE.Vector3(x - 0.65, -0.1, 0),
        new THREE.Vector3(x + 0.65, -0.1, 0), new THREE.Vector3(x, 1.58, 0),
      ]), chainMaterial);
      this.scene.add(chain);
      const pan = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 0.78, 0.16, 28), bronze);
      pan.position.set(x, -0.18, 0);
      this.scene.add(pan);
      this.animated.push({ object: pan, baseY: pan.position.y, speed: 0.55 + x * 0.02, amount: 0.08, kind: 'float' });
    }
    const glow = new THREE.PointLight(0xd3b568, 18, 12, 2);
    glow.position.set(0, 3.5, 4);
    this.scene.add(glow);
    this.scene.add(new THREE.AmbientLight(0x8ba4a0, 1.2));
  }

  private targetForItem(itemIndex: number) {
    const item = this.scenario.items[itemIndex];
    const home = this.itemHomes.get(item.id) ?? new THREE.Vector3();
    const owner = this.state.owners[itemIndex];
    if (owner === undefined || owner < 0) return home;
    const count = this.scenario.agents.length;
    return new THREE.Vector3((owner - (count - 1) / 2) * 4.2 + (itemIndex % 2) * 0.42, 1.7 + Math.floor(itemIndex / 2) * 0.28, 2.8);
  }

  private animate = () => {
    this.frame = requestAnimationFrame(this.animate);
    const delta = Math.min(this.clock.getDelta(), 0.05);
    const elapsed = this.clock.elapsedTime;

    for (const entry of this.animated) {
      if (entry.kind === 'float' || entry.kind === 'breathe') {
        entry.object.position.y = entry.baseY + Math.sin(elapsed * entry.speed) * entry.amount;
      } else if (entry.kind === 'flame') {
        entry.object.scale.y = 1 + Math.sin(elapsed * entry.speed) * 0.12;
        if (entry.object instanceof THREE.Light) entry.object.intensity = 8.5 + Math.sin(elapsed * entry.speed) * 1.5;
      } else {
        entry.object.rotation.z += delta * entry.speed;
      }
    }

    this.scenario.items.forEach((item, index) => {
      const object = this.itemMeshes.get(item.id);
      if (!object) return;
      object.position.lerp(this.targetForItem(index), 1 - Math.pow(0.0008, delta));
    });

    const focusedId = this.state.focusTargetId ?? null;
    const focused = focusedId ? this.focusables.get(focusedId) : null;
    for (const [id, object] of this.focusables) {
      const baseScale = this.focusScales.get(id) ?? new THREE.Vector3(1, 1, 1);
      const emphasis = id === focusedId ? 1.075 + Math.sin(elapsed * 2.4) * 0.012 : 1;
      object.scale.lerp(baseScale.clone().multiplyScalar(emphasis), 1 - Math.pow(0.002, delta));
    }

    const focusPosition = new THREE.Vector3();
    if (focused) focused.getWorldPosition(focusPosition);
    const targetLookX = focused ? THREE.MathUtils.clamp(focusPosition.x * 0.38, -2.1, 2.1) : 0;
    this.cameraLookX += (targetLookX - this.cameraLookX) * (1 - Math.pow(0.01, delta));

    const crisis = this.state.zeroUtility;
    const targetBackground = new THREE.Color(crisis ? 0x2c0807 : this.sceneId === 'prologue' ? 0x05080d : COLORS.ink);
    if (this.scene.background instanceof THREE.Color) this.scene.background.lerp(targetBackground, 0.035);
    const targetCameraX = this.cameraPointer.x * 0.35 + (focused ? THREE.MathUtils.clamp(focusPosition.x * 0.08, -0.65, 0.65) : 0);
    this.camera.position.x += (targetCameraX - this.camera.position.x) * 0.018;
    const baseY = this.sceneId === 'prologue' ? 1.8 : this.sceneId === 'guild' ? 4.7 : this.sceneId === 'yamen' ? 5.6 : 5.8;
    this.camera.position.y += (baseY + this.cameraPointer.y * 0.16 - this.camera.position.y) * 0.018;
    this.camera.lookAt(this.cameraLookX, 1.5, 0);
    this.renderer.render(this.scene, this.camera);
  };

  private hotspotFromObject(object: THREE.Object3D | null): string | null {
    let current = object;
    while (current) {
      if (typeof current.userData.hotspotId === 'string') return current.userData.hotspotId;
      current = current.parent;
    }
    return null;
  }

  private setPointer(event: PointerEvent | MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.cameraPointer.copy(this.pointer);
    this.raycaster.setFromCamera(this.pointer, this.camera);
  }

  private handlePointerMove = (event: PointerEvent) => {
    this.setPointer(event);
    const intersection = this.raycaster.intersectObjects(this.interactives, true)[0];
    const next = intersection?.object instanceof THREE.Mesh ? intersection.object : null;
    if (this.hovered === next) return;
    if (this.hovered && this.hovered.material instanceof THREE.MeshStandardMaterial) {
      this.hovered.material.emissive.copy(this.hoveredEmissive);
    }
    this.hovered = next;
    this.canvas.style.cursor = this.hotspotFromObject(next) ? 'pointer' : 'default';
    if (next?.material instanceof THREE.MeshStandardMaterial) {
      this.hoveredEmissive.copy(next.material.emissive);
      next.material.emissive.setHex(0x6d5626);
    }
  };

  private handlePointerLeave = () => {
    this.cameraPointer.set(0, 0);
    this.canvas.style.cursor = 'default';
  };

  private handleClick = (event: MouseEvent) => {
    this.setPointer(event);
    const intersection = this.raycaster.intersectObjects(this.interactives, true)[0];
    const hotspot = this.hotspotFromObject(intersection?.object ?? null);
    if (hotspot) this.onHotspot(hotspot);
  };

  private resize() {
    const width = Math.max(1, this.canvas.clientWidth);
    const height = Math.max(1, this.canvas.clientHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  dispose() {
    cancelAnimationFrame(this.frame);
    this.resizeObserver.disconnect();
    this.canvas.removeEventListener('pointermove', this.handlePointerMove);
    this.canvas.removeEventListener('pointerleave', this.handlePointerLeave);
    this.canvas.removeEventListener('click', this.handleClick);
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Points) object.geometry.dispose();
    });
    this.materials.forEach((material) => material.dispose());
    this.renderer.dispose();
  }
}
