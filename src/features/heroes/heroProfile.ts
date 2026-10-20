import PODERES from '../../data/poderes.json' with { type: 'json' };
import { documentedMpCost, NOMINAL_POWER_DAMAGE } from '../../engine/rules.ts';
import type { Hero } from '../../engine/types.ts';

export type PowerStatus =
  | { kind: 'documented'; description: string; mpCost: number; nominalDamage?: number; implementation: string }
  | { kind: 'uncatalogued'; description: string; implementation: string };
export interface HeroProfileViewModel {
  id: string; name: string; type: Hero['type']; level: number; maxHp: number; maxMp: number;
  stats: ReadonlyArray<{ label: string; value: number }>; power: { name: string; level: number; status: PowerStatus };
  presentation: { symbol: string; accent: string; art: 'absent' };
}
const visualByType: Record<Hero['type'], { symbol: string; accent: string }> = {
  Psico: { symbol: '◈', accent: '#b5a0ff' }, Energía: { symbol: '✦', accent: '#f4aa74' },
  Defensa: { symbol: '⬡', accent: '#79b6fa' }, Control: { symbol: '◎', accent: '#6ff0ce' },
};
export function toHeroProfile(hero: Readonly<Hero>): HeroProfileViewModel {
  const catalogued = PODERES.find(power => power.nombre === hero.power);
  const nominal = NOMINAL_POWER_DAMAGE[hero.power]?.(hero.powerLevel);
  const status: PowerStatus = catalogued
    ? { kind: 'documented', description: catalogued.descripcion, mpCost: documentedMpCost(hero.power, hero.powerLevel), nominalDamage: nominal, implementation: nominal !== undefined ? 'Magnitud nominal disponible; el daño final es una simulación.' : 'Catalogado como referencia; su efecto no está ejecutado de forma específica en esta demo.' }
    : { kind: 'uncatalogued', description: 'Este poder no figura en el catálogo de referencia cargado.', implementation: 'No se asume comportamiento ni coste ejecutado.' };
  return { id: hero.id, name: hero.name, type: hero.type, level: hero.level, maxHp: hero.maxHp, maxMp: hero.maxMp,
    stats: [{ label:'Golpear',value:hero.hit },{ label:'Bloquear',value:hero.block },{ label:'Esquivar',value:hero.dodge },{ label:'Mental',value:hero.mental },{ label:'Velocidad',value:hero.speed }],
    power: { name: hero.power, level: hero.powerLevel, status }, presentation: { ...visualByType[hero.type], art:'absent' } };
}
