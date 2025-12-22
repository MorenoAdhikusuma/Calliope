import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/* ================= GLOBALS ================= */

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let environmentGroup: THREE.Group | null = null;

let rafId: number | null = null;
let boundResize: (() => void) | null = null;

/* ================= CAMERA PRESETS ================= */

const defaultCamPos = new THREE.Vector3(0, 15, 3.2);
const defaultLookAt = new THREE.Vector3(0, 1.8, 0);

/* ================= INIT ================= */

export function initMuseum(container: HTMLDivElement) {
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
  camera.position.copy(defaultCamPos);
  camera.lookAt(defaultLookAt);

  /* ---------- RENDERER ---------- */
  renderer = new THREE.WebGLRenderer({
    antialias: false,
    powerPreference: "low-power",
  });

  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  container.appendChild(renderer.domElement);

  /* ---------- CONTROLS ---------- */
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.target.copy(defaultLookAt);

  controls.minPolarAngle = Math.PI / 2.6;
  controls.maxPolarAngle = Math.PI / 2.15;
  controls.minAzimuthAngle = -Math.PI / 3;
  controls.maxAzimuthAngle = Math.PI / 3;

  /* ---------- LIGHTING ---------- */
  scene.add(new THREE.AmbientLight(0xffffff, 0.25));
  addDirectionalLights();

  /* ---------- ENVIRONMENT ---------- */
  loadEnvironment("/models/room.glb");

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

/* ================= ENVIRONMENT ================= */

function loadEnvironment(glbPath: string) {
  const loader = new GLTFLoader();
  const textureLoader = new THREE.TextureLoader();

  if (environmentGroup) {
    scene.remove(environmentGroup);
    environmentGroup.clear();
  }

  environmentGroup = new THREE.Group();
  scene.add(environmentGroup);

  loader.load(glbPath, (gltf) => {
    gltf.scene.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return;

      const mesh = obj as THREE.Mesh;
      const material = mesh.material as THREE.Material;

      mesh.castShadow = false;
      mesh.receiveShadow = true;

      if (!("name" in material)) return;

      switch (material.name) {
        case "art01":
          applyArtwork(material, textureLoader, "/artworks/art1.jpg");
          break;

        case "art02":
          applyArtwork(material, textureLoader, "/artworks/art2.jpg");
          break;

        case "art03":
          applyArtwork(material, textureLoader, "/artworks/art3.jpg");
          break;
      }
    });

    environmentGroup!.add(gltf.scene);
  });
}

/* ================= MATERIAL HELPERS ================= */

function applyArtwork(
  material: THREE.Material,
  loader: THREE.TextureLoader,
  src: string
) {
  const mat = material as THREE.MeshStandardMaterial;

  const tex = loader.load(src);
  tex.colorSpace = THREE.SRGBColorSpace;

  mat.map = tex;
  mat.needsUpdate = true;
}

/* ================= LIGHTS ================= */

function addDirectionalLights() {
  const lightA = new THREE.DirectionalLight(0xffffff, 1.0);
  lightA.position.set(22.627, 32.538, -44.759);
  scene.add(lightA);

  const lightB = new THREE.DirectionalLight(0xffffff, 1.0);
  lightB.position.set(-25.591, 19.098, 29.741);
  scene.add(lightB);
}

/* ================= CLEANUP ================= */

export function disposeMuseum() {
  if (boundResize) window.removeEventListener("resize", boundResize);
  if (rafId) cancelAnimationFrame(rafId);

  renderer?.dispose();
  renderer?.domElement?.remove();

  scene?.clear();
}
