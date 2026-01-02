import RAPIER from "@dimforge/rapier3d-compat";
import { geckos } from "@geckos.io/server";
import { PORT, TICK_RATE, type InputPayload } from "@kapulaga/common";

// init phsics engine
await RAPIER.init();
const gravity = { x: 0.0, y: -9.81, z: 0.0 };
const world = new RAPIER.World(gravity);

// Ground
const groundBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed())
world.createCollider(RAPIER.ColliderDesc.cuboid(10.0, 0.1, 10.0), groundBody)

// Player
const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(0.0, 5.0, 0.0)
const playerBody = world.createRigidBody(rigidBodyDesc)
world.createCollider(RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5), playerBody)

// Store the player's current intended direction
let currentInput: InputPayload = { x: 0, y: 0 }
const MOVE_SPEED = 5

// starting the network
const io = geckos();
io.listen(PORT);

console.log('[SERVER] Physics Engine Ready.')

// game loop
// we run this 30 times a second (approx every 33ms)
setInterval(() => {
  // 1. Apply Movement Logic
  // We manipulate velocity directly for arcade-like control
  const linvel = playerBody.linvel()
  
  // We keep the falling speed (y), but override x and z based on input
  // Note: In 3D space, "Y" is Up/Down. "Z" is usually Forward/Back.
  playerBody.setLinvel({
    x: currentInput.x * MOVE_SPEED,
    y: linvel.y, 
    z: -currentInput.y * MOVE_SPEED // Negative because in 3D, -Z is often "Forward"
  }, true)

  // 2. Step Physics
  world.step()

  // 3. Broadcast
  const t = playerBody.translation()
  io.emit('worldState', { id: 'cube-1', x: t.x, y: t.y, z: t.z })
}, 1000 / TICK_RATE);

// NETWORK HANDLER
io.onConnection(channel => {
  console.log(`[SERVER] Operator connected: ${channel.id}`)

  channel.on('playerInput', (data: any) => {
    // Update the global input variable
    currentInput = data as InputPayload
  })
})
