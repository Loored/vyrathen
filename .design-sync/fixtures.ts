import { PLAYER_TEAM } from '../src/data/demo';
import { toHeroProfile } from '../src/features/heroes/heroProfile';
import type { Character } from '../src/features/character-lab/data/characters';

// Demo del motor, sin guardados. Acentos de exploración: no asignaciones de producto.
export const [kael, vesper, astra, nyra] = PLAYER_TEAM;
export const soft: Record<string, string> = { h2: '#F2E6FF', h1: '#FFE8DB', h3: '#D8F8FF' };
const themes = [['#BB84FF', '187,132,255', '#251a49'], ['#FF785F', '255,120,95', '#3d1521'], ['#5ED8FF', '94,216,255', '#112a43']];
// SVG original de contexto; no importa ilustraciones ni sprites.
const marker = (accent: string, scene: string) =>
  'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900"><defs><radialGradient id="g" cx="52%" cy="38%" r="55%"><stop offset="0" stop-color="${accent}" stop-opacity=".5"/><stop offset="1" stop-color="${scene}" stop-opacity="0"/></radialGradient></defs><rect width="1200" height="900" fill="${scene}"/><rect width="1200" height="900" fill="url(#g)"/><g fill="none" stroke="${accent}" transform="translate(624 342)"><rect x="-130" y="-130" width="260" height="260" transform="rotate(45)" stroke-width="6"/><rect x="-215" y="-215" width="430" height="430" transform="rotate(45)" stroke-opacity=".35" stroke-width="3"/><circle r="70" stroke-width="4" stroke-opacity=".85"/><path d="M-520 330 520 -330" stroke-opacity=".3" stroke-width="3"/></g></svg>`,
  );
export const squad: Character[] = [vesper, kael, astra].map((hero, index) => {
  const profile = toHeroProfile(hero);
  const [accent, accentRgb, surface] = themes[index];
  return { id: hero.id, name: hero.name, title: `${hero.type.toUpperCase()} // NIVEL ${String(hero.level).padStart(2, '0')}`, code: `VYR-${hero.id.toUpperCase()}`, archive: `${hero.type.toUpperCase()} // ARCHIVO`, category: hero.type.toUpperCase(), quote: 'Sin cita registrada en el archivo.', intro: 'Datos de demostración, no personajes históricos definitivos. Habilidades y equipo: exploración visual.', tags: [hero.type.toUpperCase(), `${hero.power.toUpperCase()} · N${hero.powerLevel}`, 'DEMO'], stats: [{ label: 'HP MÁXIMO', value: String(profile.maxHp) }, { label: 'MP MÁXIMO', value: String(profile.maxMp) }, ...profile.stats.map(stat => ({ label: stat.label.toUpperCase(), value: String(stat.value) }))], accent, accentRgb, surface, art: marker(accent, surface) };
});
