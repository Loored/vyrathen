import type { Hero, HeroType, Side } from './types.ts';

/** Biblioteca del 02-03-2010: Defensa > Psico > Energía > Control > Defensa. */
export const beats: Record<HeroType, HeroType> = {
  'Defensa': 'Psico', 'Psico': 'Energía', 'Energía': 'Control', 'Control': 'Defensa',
};

/** Cada pareja atacante/defensor concede 1 punto a quien venza por tipo. */
export function countTypePoints(a: readonly Pick<Hero, 'type'>[], b: readonly Pick<Hero, 'type'>[]) {
  let attacker = 0;
  let defender = 0;
  for (const first of a) for (const second of b) {
    if (beats[first.type] === second.type) attacker++;
    if (beats[second.type] === first.type) defender++;
  }
  return { attacker, defender };
}

/** Victoria general por K.O. infligidos; el empate favorece al defensor. */
export function chooseVictor(attackerKOs: number, defenderKOs: number): Side {
  if (attackerKOs < 0 || defenderKOs < 0) throw new RangeError('KOs no pueden ser negativos');
  return attackerKOs > defenderKOs ? 'atacante' : 'defensor';
}

/** Para bosses sólo cuenta que el boss quede K.O., sin usar desempate general. */
export function beatsBoss(bossKnockedOut: boolean): boolean { return bossKnockedOut; }

/** Daños NOMINALES APROXIMADOS del manual, no daño final. */
export const NOMINAL_POWER_DAMAGE: Record<string, (level: number) => number> = {
  'Electricidad': l => 15 + 22 * l,
  'Desatomizar': l => 5 + 26 * l,
  'Frio': l => 25 + 17 * l,
  'Fuego': l => 20 + 18 * l,
  'Radiactividad': l => 6 + 8 * l,
  'Telequinesis': l => 10 + 19 * l,
};

/** Coste general, con las excepciones textuales conocidas. */
export function documentedMpCost(power: string, level: number): number {
  if (!Number.isInteger(level) || level < 1) throw new RangeError('Nivel inválido');
  if (power === 'Influir maquinas') return 0;
  if (['Oido agudo', 'Invisibilidad', 'Regeneracion'].includes(power)) return 3 * level;
  return 5 * level;
}
