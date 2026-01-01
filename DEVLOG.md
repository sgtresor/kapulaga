# Kapulaga DevLog

## Architecture
- **Server:** Authoritative. Runs Rapier Physics (Headless). 30 Ticks/sec.
- **Client:** "Dumb" terminal. Draws Three.js meshes based on server snapshots.
- **Protocol:** UDP (Geckos.io) for fast state updates.

## Current Status (MVP)
- [x] Monorepo setup (Bun)
- [x] Server-Client Connection (Ping/Pong)
- [x] Physics: Server drops a generic cube.
- [x] Visuals: Client renders the cube falling.

## Known Issues
- Visuals: Cube "teleports" (need interpolation).
- Code: Formatting was inconsistent (Fixed with Biome).
- Gameplay: No inputs yet (cannot move).