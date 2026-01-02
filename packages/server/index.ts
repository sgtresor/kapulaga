import { geckos } from '@geckos.io/server'
import RAPIER from '@dimforge/rapier3d-compat'
import { PORT, TICK_RATE, type InputPayload } from '@kapulaga/common'

await RAPIER.init()
const gravity = { x: 0.0, y: -9.81, z: 0.0 }
const world = new RAPIER.World(gravity)

// setup Ground
const groundBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed())
world.createCollider(RAPIER.ColliderDesc.cuboid(10.0, 0.1, 10.0), groundBody)

// the Player Registry
// we map a Socket ID (string) to their Physics Body and current Input
interface PlayerState {
  body: RAPIER.RigidBody
  input: InputPayload
}
const players = new Map<string, PlayerState>()

const MOVE_SPEED = 5
const io = geckos()

io.listen(PORT)
console.log('[SERVER] Lobby Open. Waiting for combatants...')

// --- GAME LOOP ---
setInterval(() => {
  const snapshot: any[] = []

  // A. Process every player
  players.forEach((player, id) => {
    // 1. Apply Physics based on their specific input
    const linvel = player.body.linvel()
    player.body.setLinvel({
      x: player.input.x * MOVE_SPEED,
      y: linvel.y,
      z: -player.input.y * MOVE_SPEED
    }, true)

    // 2. Prepare data for snapshot
    const t = player.body.translation()
    snapshot.push({
      id: id, // The critical tag: "Who is this?"
      x: t.x,
      y: t.y,
      z: t.z
    })
  })

  // B. Step World
  world.step()

  // C. Broadcast the WHOLE list to EVERYONE
  // Now we send an Array: [{id: 'A',...}, {id: 'B',...}]
  if (snapshot.length > 0) {
    io.emit('worldState', snapshot)
  }

}, 1000 / TICK_RATE)

// --- NETWORK HANDLER ---
io.onConnection(channel => {
  console.log(`[SERVER] ${channel.id} joined the lobby.`)

  // 1. SPAWN: Create a body for this specific connection
  const bodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(0.0, 5.0, 0.0)
  const body = world.createRigidBody(bodyDesc)
  world.createCollider(RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5), body)

  // 2. REGISTER: Add to our map
  players.set(channel.id as string, {
    body,
    input: { x: 0, y: 0 }
  })

  // 3. LISTEN: Handle inputs for THIS player
  channel.on('playerInput', (data: any) => {
    const player = players.get(channel.id as string)
    if (player) {
      player.input = data as InputPayload
    }
  })

  // 4. CLEANUP: When they leave, delete the body
  channel.onDisconnect(() => {
    console.log(`[SERVER] ${channel.id} disconnected.`)
    const player = players.get(channel.id as string)
    if (player) {
      world.removeRigidBody(player.body) // Remove from physics world
      players.delete(channel.id as string) // Remove from our map
    }
  })
})