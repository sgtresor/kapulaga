# Kapulaga DevLog

## Architecture
- **Server:** Authoritative. Runs Rapier Physics (Headless). 30 Ticks/sec.
- **Client:** "Dumb" terminal. Draws Three.js meshes based on server snapshots.
- **Protocol:** UDP (Geckos.io) for fast state updates.
- **Input:** Client sends intended direction; Server applies velocity.

## Current Status (MVP)
- [x] Monorepo setup (Bun)
- [x] Server-Client Connection (Ping/Pong)
- [x] Physics: Server drops a generic cube.
- [x] Visuals: Client renders the cube falling.
- [x] Gameplay: Basic WASD Movement (Server-Authoritative).

## Known Issues
- **Camera:** Static. If you walk too far, you go off-screen.
- **Visuals:** Movement is jittery (needs interpolation).
- **Multiplayer:** Only controls "Cube-1". If a second player joins, they control the SAME cube (Ghost in the machine).
- **Physics:** No jumping logic yet.

## [Phase 3] Remote Control
**Status:** Completed
**Date:** 2026-01-02

**Changes:**
- Implemented `InputPayload` in shared package.
- Client captures Keyboard state and streams it to Server.
- Server applies velocity to the RigidBody.
- **Outcome:** Successful remote control of the physics object.

**Technical Debt/Notes:**
- Input is sent on every keypress. Should probably send continuously or strictly on tick to save bandwidth later.

## [Phase 4] Multiplayer Lobby
**Status:** Completed
**Date:** 2026-01-02

**Changes:**
- **Server:** Now manages a `Map` of players.
- **Server:** Spawns a unique RigidBody for every new connection.
- **Client:** "Entity Manager" creates/destroys meshes dynamically.
- **Test:** Confirmed 2 browser tabs can control separate cubes independently.

**Technical Debt/Notes:**
- **Identity Crisis:** All cubes look the same (Red). You don't know which one is yours.
- **Camera:** Still static. If you walk away, you leave the screen.
- **Interpolation:** Still jittery.

## [Phase 5] Identity & Camera
**Status:** Completed
**Date:** 2026-01-02

**Changes:**
- **Visuals:** Implemented "Relative Coloring" (I am Blue, You are Red).
- **Camera:** Now follows the local player using Linear Interpolation (Lerp).
- **Network:** Client stores its own Socket ID to distinguish self from others.

**Observations:**
- The game is playable! You can chase other players.
- **The Jitter:** Because the camera now follows the "Jittery Cube," the whole screen shakes slightly.