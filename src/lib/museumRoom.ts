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
const defaultLookAt = new THREE.Vector3(0, 1.6, 0);

/* ================= LAZY LOADING ================= */

const textureLoader = new THREE.TextureLoader();

type LazyArtwork = {
  mesh: THREE.Mesh;
  material: THREE.MeshStandardMaterial;
  src: string;
  loaded: boolean;
};

const lazyArtworks: LazyArtwork[] = [];
const frustum = new THREE.Frustum();
const projScreenMatrix = new THREE.Matrix4();

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
    antialias: true,
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
  loadEnvironment("/models/MUSEUM1.glb");

  /* ---------- LOOP ---------- */
  const animate = () => {
    rafId = requestAnimationFrame(animate);

    controls.update();

    // update frustum
    camera.updateMatrixWorld();
    projScreenMatrix.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );
    frustum.setFromProjectionMatrix(projScreenMatrix);

    // lazy-load visible artworks
    for (const entry of lazyArtworks) {
      if (!entry.loaded && frustum.intersectsObject(entry.mesh)) {
        loadArtworkTexture(entry);
      }
    }

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

  if (environmentGroup) {
    scene.remove(environmentGroup);
    environmentGroup.clear();
    lazyArtworks.length = 0;
  }

  environmentGroup = new THREE.Group();
  scene.add(environmentGroup);

  loader.load(glbPath, (gltf) => {
    gltf.scene.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return;

      const mesh = obj as THREE.Mesh;
      const mat = mesh.material as THREE.MeshStandardMaterial;

      mesh.castShadow = false;
      mesh.receiveShadow = true;

      if (!mat?.name) return;

      // MATCH MATERIAL NAMES FROM BLENDER
      if (mat.name === "art01") {
        registerLazyArtwork(mesh, mat, "/artworks/art1.jpg");
      }

      if (mat.name === "art02") {
        registerLazyArtwork(mesh, mat, "/artworks/art2.jpg");
      }

      if (mat.name === "art03") {
        registerLazyArtwork(mesh, mat, "/artworks/art3.jpg");
      }
    });

    environmentGroup!.add(gltf.scene);
  });
}

/* ================= LAZY ARTWORK ================= */

function registerLazyArtwork(
  mesh: THREE.Mesh,
  material: THREE.MeshStandardMaterial,
  src: string
) {
  // placeholder
  material.map = null;
  material.color.set(0x222222);
  material.needsUpdate = true;

  lazyArtworks.push({
    mesh,
    material,
    src,
    loaded: false,
  });
}

function loadArtworkTexture(entry: LazyArtwork) {
  textureLoader.load(entry.src, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;

    entry.material.map = tex;
    entry.material.color.set(0xffffff);
    entry.material.needsUpdate = true;
    entry.loaded = true;
  });
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
  if (boundResize) {
    window.removeEventListener("resize", boundResize);
    boundResize = null;
  }

  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  if (renderer) {
    renderer.dispose();
    renderer.domElement?.remove();
  }

  scene?.clear();
}
