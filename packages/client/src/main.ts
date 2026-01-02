import { geckos } from "@geckos.io/client";
import * as THREE from "three";
import { PORT } from "@kapulaga/common";

// --- 1. SCENE SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// We don't set a fixed position anymore, the update loop will handle it.

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

const ground = new THREE.Mesh(
  new THREE.BoxGeometry(20, 0.2, 20),
  new THREE.MeshStandardMaterial({ color: 0x228b22 }),
);
scene.add(ground);

// --- 2. ENTITY MANAGEMENT ---
const playerMeshes = new Map<string, THREE.Mesh>();
let myId = ""; // We will store our ID here once connected

// Helper to create a mesh with specific color
const createPlayerMesh = (isMe: boolean) => {
  const color = isMe ? 0x0000ff : 0xff0000; // Blue for me, Red for others
  return new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color }));
};

// --- 3. INPUT ---
const keys = { w: false, a: false, s: false, d: false };
function sendInput() {
  const input = {
    x: (keys.a ? -1 : 0) + (keys.d ? 1 : 0),
    y: (keys.s ? -1 : 0) + (keys.w ? 1 : 0),
  };
  if (channel) channel.emit("playerInput", input);
}
window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (k in keys) {
    keys[k as keyof typeof keys] = true;
    sendInput();
  }
});
window.addEventListener("keyup", (e) => {
  const k = e.key.toLowerCase();
  if (k in keys) {
    keys[k as keyof typeof keys] = false;
    sendInput();
  }
});

// --- 4. NETWORK LOGIC ---
let channel: any = null;
const geckosChannel = geckos({ port: PORT });

geckosChannel.onConnect((error) => {
  if (error) return console.error(error.message);
  channel = geckosChannel;
  myId = channel.id as string; // STORE MY ID
  console.log(`[CLIENT] Connected. My ID: ${myId}`);

  channel.on("worldState", (snapshot: any[]) => {
    const activeIds = new Set<string>();

    snapshot.forEach((playerState) => {
      activeIds.add(playerState.id);

      if (playerMeshes.has(playerState.id)) {
        // UPDATE
        const mesh = playerMeshes.get(playerState.id)!;
        mesh.position.set(playerState.x, playerState.y, playerState.z);
      } else {
        // CREATE
        const isMe = playerState.id === myId;
        console.log(`[CLIENT] Spawning ${isMe ? "MYSELF" : "ENEMY"} (${playerState.id})`);

        const mesh = createPlayerMesh(isMe);
        mesh.position.set(playerState.x, playerState.y, playerState.z);
        scene.add(mesh);
        playerMeshes.set(playerState.id, mesh);
      }
    });

    // CLEANUP
    for (const [id, mesh] of playerMeshes) {
      if (!activeIds.has(id)) {
        scene.remove(mesh);
        playerMeshes.delete(id);
      }
    }
  });
});

// --- 5. RENDER LOOP (With Camera Follow) ---
const CAMERA_OFFSET = new THREE.Vector3(0, 5, 8); // Behind and above
const CAMERA_SMOOTHNESS = 0.1; // 0.0 to 1.0 (Lower is smoother/slower)

function animate() {
  requestAnimationFrame(animate);

  // CAMERA LOGIC: Find my mesh and follow it
  if (myId && playerMeshes.has(myId)) {
    const myMesh = playerMeshes.get(myId)!;

    // Calculate where the camera WANTS to be (Player Position + Offset)
    const targetPosition = myMesh.position.clone().add(CAMERA_OFFSET);

    // Smoothly move the camera there (Linear Interpolation - Lerp)
    camera.position.lerp(targetPosition, CAMERA_SMOOTHNESS);

    // Always look at the player
    camera.lookAt(myMesh.position);
  }

  renderer.render(scene, camera);
}

animate();
