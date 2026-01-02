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

## [Phase 2] The Synchronized Cube
**Status:** Completed
**Date:** 2026-01-02

**Changes:**
- Replaced "Ping/Pong" with real physics data.
- Server now runs a Rapier World (Gravity -9.81).
- Client renders a Red Cube (Player) and Green Ground.
- **Visuals:** The cube falls, but looks jittery (30Hz server vs 60Hz screen).

**Technical Debt/Notes:**
- Hardcoded "cube-1" ID.
- No client-side prediction or interpolation yet.
- Code style enforced via Biome.