import { geckos } from '@geckos.io/client'
import * as THREE from 'three'
import { PORT } from '@kapulaga/common'

// --- SCENE SETUP (Standard) ---
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x87CEEB)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(0, 5, 10)
camera.lookAt(0, 0, 0)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(5, 10, 7)
scene.add(light)
scene.add(new THREE.AmbientLight(0x404040))

const ground = new THREE.Mesh(
  new THREE.BoxGeometry(20, 0.2, 20),
  new THREE.MeshStandardMaterial({ color: 0x228B22 })
)
scene.add(ground)

// --- MULTIPLAYER ENTITY MANAGER ---
// We keep track of all active meshes here
const playerMeshes = new Map<string, THREE.Mesh>()

const createPlayerMesh = () => {
  return new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0xff0000 }) // Everyone is Red (for now)
  )
}

// --- INPUT LOGIC ---
const keys = { w: false, a: false, s: false, d: false }
function sendInput() {
  const input = {
    x: (keys.a ? -1 : 0) + (keys.d ? 1 : 0),
    y: (keys.s ? -1 : 0) + (keys.w ? 1 : 0),
  }
  if (channel) channel.emit('playerInput', input)
}
window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase(); if(k in keys) { keys[k as keyof typeof keys]=true; sendInput() }
})
window.addEventListener('keyup', (e) => {
  const k = e.key.toLowerCase(); if(k in keys) { keys[k as keyof typeof keys]=false; sendInput() }
})

// --- NETWORK LOGIC ---
let channel: any = null
const geckosChannel = geckos({ port: PORT })

geckosChannel.onConnect(error => {
  if (error) return console.error(error.message)
  channel = geckosChannel
  console.log(`[CLIENT] Connected. My ID: ${channel.id}`)

  channel.on('worldState', (snapshot: any[]) => {
    // 1. Track which IDs are in this update
    const activeIds = new Set<string>()

    snapshot.forEach((playerState) => {
      activeIds.add(playerState.id)

      if (playerMeshes.has(playerState.id)) {
        // UPDATE existing player
        const mesh = playerMeshes.get(playerState.id)!
        mesh.position.set(playerState.x, playerState.y, playerState.z)
      } else {
        // CREATE new player
        console.log(`[CLIENT] Spawning new player: ${playerState.id}`)
        const mesh = createPlayerMesh()
        mesh.position.set(playerState.x, playerState.y, playerState.z)
        scene.add(mesh)
        playerMeshes.set(playerState.id, mesh)
      }
    })

    // 2. CLEANUP (Remove players who are not in the snapshot anymore)
    for (const [id, mesh] of playerMeshes) {
      if (!activeIds.has(id)) {
        console.log(`[CLIENT] Player left: ${id}`)
        scene.remove(mesh)
        playerMeshes.delete(id)
      }
    }
  })
})

function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}
animate()