import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

/* ================= GLOBALS ================= */

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;

let rafId: number | null = null;
let boundResize: (() => void) | null = null;
let boundPointerDown: ((e: PointerEvent) => void) | null = null;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let clickableArtworks: THREE.Mesh[] = [];

/* ================= TYPES ================= */

type ArtworkData = {
  title: string;
  year: string;
  medium: string;
  description: string;
};

/* ================= INIT ================= */

export function initMuseum(container: HTMLDivElement) {
  // Prevent double init (Next.js Strict Mode)
  if (container.querySelector("canvas")) return;

  /* ---------- SCENE ---------- */
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);

  /* ---------- CAMERA ---------- */
  camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 1.9, 2.2);
  camera.lookAt(0, 4.5, -10);

  /* ---------- RENDERER ---------- */
  renderer = new THREE.WebGLRenderer({
    antialias: false,
    powerPreference: "low-power",
  });

  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  container.appendChild(renderer.domElement);

  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();

  /* ---------- CONTROLS ---------- */
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableZoom = false;

  controls.minPolarAngle = Math.PI / 2.6;
  controls.maxPolarAngle = Math.PI / 2.15;
  controls.minAzimuthAngle = -Math.PI / 3;
  controls.maxAzimuthAngle = Math.PI / 3;

  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  /* ---------- LIGHTING ---------- */
  scene.add(new THREE.AmbientLight(0xffffff, 0.75));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.35);
  dirLight.position.set(0, 10, 5);
  scene.add(dirLight);

  /* ---------- ROOM ---------- */
  createRoom();

  /* ---------- ARTWORKS ---------- */
  addArtworks();

  /* ---------- INTERACTION ---------- */
  boundPointerDown = (e: PointerEvent) => onPointerDown(e);
  container.addEventListener("pointerdown", boundPointerDown);

  /* ---------- LOOP ---------- */
  const animate = () => {
    rafId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };
  animate();

  /* ---------- RESIZE ---------- */
  boundResize = () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };
  window.addEventListener("resize", boundResize);
}

/* ================= CLEANUP ================= */

export function disposeMuseum(container?: HTMLDivElement) {
  // Remove artwork info panel
  const panel = document.getElementById("artwork-panel");
  if (panel) panel.remove();

  // Remove listeners
  if (container && boundPointerDown) {
    container.removeEventListener("pointerdown", boundPointerDown);
  }
  if (boundResize) {
    window.removeEventListener("resize", boundResize);
  }

  // Stop animation
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  clickableArtworks = [];

  // Dispose renderer
  if (renderer) {
    renderer.dispose();
    if (renderer.domElement?.parentElement) {
      renderer.domElement.parentElement.removeChild(renderer.domElement);
    }
  }

  if (scene) scene.clear();
}

/* ================= ROOM ================= */

function createRoom() {
  const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xffcbe2 });
  const floorMaterial = new THREE.MeshLambertMaterial({ color: 0xfce4ef });
  const ceilingMaterial = new THREE.MeshLambertMaterial({ color: 0x9f9f9f });

  const roomWidth = 20;
  const roomHeight = 10;
  const roomDepth = 20;
  const floorY = -2;
  const wallCenterY = floorY + roomHeight / 2;

  // Back wall
  const backWall = new THREE.Mesh(
    new THREE.PlaneGeometry(roomWidth, roomHeight),
    wallMaterial
  );
  backWall.position.set(0, wallCenterY, -roomDepth / 2);
  scene.add(backWall);

  // Left wall
  const leftWall = new THREE.Mesh(
    new THREE.PlaneGeometry(roomDepth, roomHeight),
    wallMaterial
  );
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-roomWidth / 2, wallCenterY, -roomDepth / 2);
  scene.add(leftWall);

  // Right wall
  const rightWall = new THREE.Mesh(
    new THREE.PlaneGeometry(roomDepth, roomHeight),
    wallMaterial
  );
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(roomWidth / 2, wallCenterY, -roomDepth / 2);
  scene.add(rightWall);

  // Floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(roomWidth, roomDepth),
    floorMaterial
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, floorY, -roomDepth / 2);
  scene.add(floor);

  // Ceiling
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(roomWidth, roomDepth),
    ceilingMaterial
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, floorY + roomHeight, -roomDepth / 2);
  scene.add(ceiling);
}

/* ================= ARTWORKS ================= */

function addArtworks() {
  const loader = new THREE.TextureLoader();

  const artworks: { src: string; info: ArtworkData }[] = [
    {
      src: "/artworks/art1.jpg",
      info: {
        title: "Untitled Creature",
        year: "2024",
        medium: "Digital Painting",
        description: "A surreal creature exploring texture and contrast.",
      },
    },
    {
      src: "/artworks/art2.jpg",
      info: {
        title: "Study in Black",
        year: "2023",
        medium: "Mixed Media",
        description: "An exploration of absence and form.",
      },
    },
    {
      src: "/artworks/art3.jpg",
      info: {
        title: "Negative Space",
        year: "2023",
        medium: "Digital Illustration",
        description: "Minimalist composition focusing on balance.",
      },
    },
  ];

  const artWidth = 2.2;
  const artHeight = 1.6;
  const spacing = 3.0;
  const startX = -((artworks.length - 1) * spacing) / 2;

  artworks.forEach((item, index) => {
    const texture = loader.load(item.src);
    texture.colorSpace = THREE.SRGBColorSpace;

    const art = new THREE.Mesh(
      new THREE.PlaneGeometry(artWidth, artHeight),
      new THREE.MeshBasicMaterial({ map: texture })
    );

    art.position.set(startX + index * spacing, 2.4, -9.85);
    art.userData = item.info;

    scene.add(art);
    clickableArtworks.push(art);
  });
}

/* ================= INTERACTION ================= */

function onPointerDown(event: PointerEvent) {
  const rect = renderer.domElement.getBoundingClientRect();

  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(clickableArtworks);
  if (intersects.length > 0) {
    showArtworkInfo(intersects[0].object.userData as ArtworkData);
  } else {
    hideArtworkInfo();
  }
}

/* ================= INFO PANEL ================= */

function showArtworkInfo(data: ArtworkData) {
  let panel = document.getElementById("artwork-panel");

  if (!panel) {
    panel = document.createElement("div");
    panel.id = "artwork-panel";

    Object.assign(panel.style, {
      position: "fixed",
      bottom: "24px",
      left: "50%",
      transform: "translateX(-50%)",
      maxWidth: "420px",
      padding: "16px 20px",
      background: "rgba(20,20,20,0.92)",
      color: "#fff",
      borderRadius: "12px",
      fontFamily: "system-ui, sans-serif",
      boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
      zIndex: "9999",
    });

    document.body.appendChild(panel);
  }

  panel.innerHTML = `
    <strong style="font-size:18px;">${data.title}</strong><br/>
    <span style="opacity:0.8;">${data.year} · ${data.medium}</span>
    <p style="margin-top:8px; line-height:1.4;">${data.description}</p>
  `;

  panel.style.display = "block";
}

function hideArtworkInfo() {
  const panel = document.getElementById("artwork-panel");
  if (panel) panel.style.display = "none";
}
