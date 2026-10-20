# Vyrathen — UI animation and rendering stack

## Primary now
React 19 + TypeScript + Vite remain the project's official frontend. Add **Motion for React** for declarative state transitions and tab/element presence; CSS/SVG for typography masks, glitch, kinetic diagonals and controlled background motion. Import from `motion/react`. Do not replace the working engine/app with the standalone demo.

## Defer until justified
**PixiJS:** suitable later for a dedicated 2D battle scene with sprites, high-frequency particles and effects, fed by immutable structured CombatEvents from pure engine code. Keep simulated RNG/timing separate from renderer.

**Three.js:** not needed for flat illustration / 2D sprites. Consider only if genuine 3D camera/geometry/shader requirements appear.

**GSAP:** optional for complex cinematic multi-step sequences if Motion/CSS cannot meet needs. Avoid redundant animation systems.

**Phaser:** may own a full 2D game-loop, but currently unnecessary for React-led menus and event-driven auto-battle.

Performance: profile animation frames and memory instead of assuming a renderer is faster. Respect reduced-motion and keep display legible during effects.
