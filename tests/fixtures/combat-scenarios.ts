import { PLAYER_TEAM, ENEMIES } from '../../src/data/demo.ts';

export const variants = ['demo', 'no-mp', 'fragile-duplicates'] as const;
export function combatScenario(enemy: keyof typeof ENEMIES, variant: typeof variants[number]) {
  const attackers = structuredClone(PLAYER_TEAM);
  const defenders = structuredClone(ENEMIES[enemy].heroes);
  for (const hero of [...attackers, ...defenders]) {
    if (variant === 'no-mp') hero.maxMp = 0;
    if (variant === 'fragile-duplicates') {
      hero.maxHp = 30;
      hero.name = 'Eco';
    }
  }
  return { attackers, defenders };
}
