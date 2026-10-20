/**
 * NON-CANONICAL UI FIXTURES.
 * None of these fields is evidence for historic Soulheroes gameplay rules.
 * Replace through a repository adapter once Vyrathen's mechanics are confirmed.
 */
export type CharacterTab = 'stats' | 'skills' | 'equipment';
export interface Stat { label: string; value: string }
export interface Character {
  id: string;
  name: string;
  title: string;
  code: string;
  archive: string;
  category: string;
  quote: string;
  intro: string;
  tags: string[];
  stats: Stat[];
  accent: string;
  accentRgb: string;
  surface: string;
  art: string;
}

export const characters: Character[] = [
  {
    id: 'selene', name: 'Selene', title: 'VOID RESONANCE', code: 'VYR-01',
    archive: 'ARCANE // ARCHIVE', category: 'VOID / MYSTIC',
    quote: 'THE VOID REMEMBERS WHAT THE WORLD FORGETS.',
    intro: 'A signal beyond the horizon. Character concept: non-canonical.',
    tags: ['ELECTRIC', 'ANOMALY', 'MYSTIC'],
    stats: [
      { label: 'HP', value: '6,240' }, { label: 'ATK', value: '1,182' },
      { label: 'DEF', value: '892' }, { label: 'CRIT RATE', value: '28%' },
      { label: 'CRIT DMG', value: '150%' }, { label: 'ENERGY', value: '1.2' },
    ],
    accent: '#BB84FF', accentRgb: '187,132,255', surface: '#251a49', art: '/character-lab/art/selene.webp',
  },
  {
    id: 'kuroe', name: 'Kuroe', title: 'BLAZING CIRCUIT', code: 'VYR-02',
    archive: 'NEON // ARCHIVE', category: 'FIRE / VANGUARD',
    quote: 'SOME CITIES BURN. I JUST MAKE THEM BRIGHTER.',
    intro: 'A spark in the undercity. Character concept: non-canonical.',
    tags: ['FIRE', 'VANGUARD', 'ENERGETIC'],
    stats: [
      { label: 'HP', value: '3,950' }, { label: 'ATK', value: '1,401' },
      { label: 'DEF', value: '612' }, { label: 'CRIT RATE', value: '36%' },
      { label: 'CRIT DMG', value: '168%' }, { label: 'ENERGY', value: '1.4' },
    ],
    accent: '#FF785F', accentRgb: '255,120,95', surface: '#3d1521', art: '/character-lab/art/kuroe.webp',
  },
  {
    id: 'orion', name: 'Orion', title: 'SIGNAL FRACTURE', code: 'VYR-03',
    archive: 'SPECTRAL // ARCHIVE', category: 'AETHER / RANGER',
    quote: 'EVERY FRACTURE IS A DOORWAY IF YOU READ THE SIGNAL.',
    intro: 'Where technology meets the unknown. Character concept: non-canonical.',
    tags: ['AETHER', 'RANGER', 'TECHNICAL'],
    stats: [
      { label: 'HP', value: '4,770' }, { label: 'ATK', value: '1,064' },
      { label: 'DEF', value: '730' }, { label: 'CRIT RATE', value: '22%' },
      { label: 'CRIT DMG', value: '144%' }, { label: 'ENERGY', value: '1.1' },
    ],
    accent: '#5ED8FF', accentRgb: '94,216,255', surface: '#112a43', art: '/character-lab/art/orion.webp',
  },
];

export const tabs: { id: CharacterTab; label: string; index: string }[] = [
  { id: 'stats', label: 'BASE STATS', index: '01' },
  { id: 'skills', label: 'SKILLS', index: '02' },
  { id: 'equipment', label: 'EQUIPMENT', index: '03' },
];
