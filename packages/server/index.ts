import RAPIER from "@dimforge/rapier3d-compat";
import { geckos } from "@geckos.io/server";
import { PORT, TICK_RATE } from "@kapulaga/common";

// init phsics engine
await RAPIER.init();
const gravity = { x: 0.0, y: -9.81, z: 0.0 };
const world = new RAPIER.World(gravity);

// creating the static ground
const groundDesc = RAPIER.RigidBodyDesc.fixed();
const groundBody = world.createRigidBody(groundDesc);
const groundCollider = RAPIER.ColliderDesc.cuboid(10.0, 0.1, 10.0);
world.createCollider(groundCollider, groundBody);

// creating player cube (dynamic - it falls)
// start 5 meters in the air
const rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(0.0, 5.0, 0.0);
const playerBody = world.createRigidBody(rigidBodyDesc);
const playerCollider = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
world.createCollider(playerCollider, playerBody);

// starting the network
const io = geckos();
io.listen(PORT);

console.log("[SERVER] Physics World initialized. Gravity is ON.");

// game loop
// we run this 30 times a second (approx every 33ms)
setInterval(() => {
  // step the physics simulation
  world.step();

  // get the cube position
  const t = playerBody.translation();
  const r = playerBody.rotation();

  // create the snapshot (JSON for now)
  const snapshot = {
    id: "cube-1",
    x: t.x,
    y: t.y,
    z: t.z,
    // We'll ignore rotation for this exact moment to keep it simple
  };

  // broadcast to everyone
  io.emit("worldState", snapshot);
}, 1000 / TICK_RATE);

io.onConnection((channel) => {
  console.log(`[SERVER] Observer connected: ${channel.id}`);
});
