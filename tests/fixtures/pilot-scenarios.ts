import { PLAYER_TEAM, ENEMIES } from '../../src/data/demo.ts';
import { simulateCombat } from '../../src/engine/simulator.ts';

/** Test-only inputs. Production teams, rules and telemetry are never patched. */
export function pilotFixture(variant: 'patrulla' | 'grim-fragile' | 'duplicate-names' = 'patrulla', seed = 1024) {
  const attackers = structuredClone(PLAYER_TEAM), defenders = structuredClone(ENEMIES.patrulla.heroes);
  if (variant === 'grim-fragile') defenders.find(h => h.id === 'e3')!.maxHp = 70;
  if (variant === 'duplicate-names') for (const h of [...attackers, ...defenders]) h.name = 'Eco';
  return simulateCombat(attackers, defenders, seed);
}
