import * as THREE from "three";
import { geckos } from "@geckos.io/client";
import { PORT } from "@kapulaga/common";

// setup three js scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb); // sky blue

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 8);

const renderer = new THREE.WebGL1Renderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

// Create the Ground Mesh (Visual only)
const groundGeo = new THREE.BoxGeometry(20, 0.2, 20);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x228b22 }); // Green
const ground = new THREE.Mesh(groundGeo, groundMat);
scene.add(ground);

// Create the Player Cube Mesh (Visual only)
const playerGeo = new THREE.BoxGeometry(1, 1, 1);
const playerMat = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Red
const playerCube = new THREE.Mesh(playerGeo, playerMat);
scene.add(playerCube);

const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
};

function sendInput() {
  // Calculate direction based on keys
  // x: -1 (Left/A), 1 (Right/D)
  // y: -1 (Back/S), 1 (Forward/W) -- Standard 2D coordinate logic
  const input = {
    x: (keys.a ? -1 : 0) + (keys.d ? 1 : 0),
    y: (keys.s ? -1 : 0) + (keys.w ? 1 : 0),
  };

  // Send to server
  if (channel) {
    channel.emit("playerInput", input);
  }
}

window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  if (key in keys) {
    keys[key as keyof typeof keys] = true;
    sendInput();
  }
});

window.addEventListener("keyup", (e) => {
  const key = e.key.toLowerCase();
  if (key in keys) {
    keys[key as keyof typeof keys] = false;
    sendInput();
  }
});

// connect to server
let channel: any = null; // Global reference
const geckosChannel = geckos({ port: PORT });
geckosChannel.onConnect((error) => {
  if (error) {
    console.error("[CLIENT] Connection failed:", error.message);
    return;
  }
  console.log("[CLIENT] Connected for Duty");
  channel = geckosChannel;

  // Listen for updates
  channel.on("worldState", (data: any) => {
    playerCube.position.set(data.x, data.y, data.z);
  });
});

// render loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
