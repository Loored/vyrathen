import type { CombatEvent, CombatResult, Side } from '../../engine/types.ts';

export const PLAYBACK_INTERVAL_MS = 2500;
// Only event.kind determines these cues; message is never parsed for ability details.
export const actionCues: Record<CombatEvent['kind'], { category: string; actor: string; target: string }> = {
  normal: { category: 'Ataque', actor: 'Ataca', target: 'Recibe el golpe' },
  power: { category: 'Poder', actor: 'Usa poder', target: 'Recibe el poder' },
  blocked: { category: 'Defensa · bloqueo parcial', actor: 'Ataca', target: 'Bloquea parcialmente' },
  dodged: { category: 'Defensa · esquiva', actor: 'Ataca', target: 'Esquiva' },
  miss: { category: 'Ataque fallido', actor: 'Falla', target: 'Objetivo del fallo' },
  ko: { category: 'K.O. registrado', actor: 'Actor', target: 'K.O.' },
  skip: { category: 'Sin acción', actor: 'No actúa', target: 'Objetivo' },
  info: { category: 'Sistema', actor: 'Actor', target: 'Objetivo' },
};
export const actionLabels: Record<CombatEvent['kind'], string> = {
  normal: 'Golpe', power: 'Poder', blocked: 'Bloqueo parcial', dodged: 'Esquiva',
  miss: 'Fallo', ko: 'K.O.', skip: 'Sin acción', info: 'Sistema',
};
// Empty rounds get a navigation stop, never a fabricated engine event.
export function adaptBattle(result: CombatResult) {
  let ordinal = 0;
  return result.rounds.flatMap(round => round.events.length
    ? round.events.map(event => ({ round: round.round, event: event as CombatEvent | undefined, ordinal: ++ordinal }))
    : [{ round: round.round, event: undefined, ordinal }]);
}
export type Timeline = ReturnType<typeof adaptBattle>;
export type Playback = { cursor: number; status: 'empty' | 'ready' | 'playing' | 'paused' | 'finished' };
export type PlaybackAction = { type: 'play' | 'pause' | 'step' | 'tick' | 'restart' | 'finish' } | { type: 'round'; round: number };
export function initialPlayback(timeline: Timeline): Playback {
  return { cursor: -1, status: timeline.length ? 'ready' : 'empty' };
}
export function transition(state: Playback, action: PlaybackAction, timeline: Timeline): Playback {
  const last = timeline.length - 1;
  if (action.type === 'restart') return initialPlayback(timeline);
  if (last < 0) return initialPlayback(timeline);
  if (action.type === 'pause') return state.status === 'playing' ? { ...state, status: 'paused' } : state;
  if (action.type === 'play') return state.cursor < last ? { ...state, status: 'playing' } : state;
  if (action.type === 'round') {
    const cursor = timeline.findIndex(item => item.round === action.round);
    return cursor < 0 ? state : { cursor, status: cursor === last ? 'finished' : 'paused' };
  }
  if (action.type === 'finish') return { cursor: last, status: 'finished' };
  if (action.type === 'tick' && state.status !== 'playing') return state;
  const cursor = Math.min(last, state.cursor + 1);
  return { cursor, status: cursor === last ? 'finished' : action.type === 'tick' ? 'playing' : 'paused' };
}
export function resolveParticipant(result: CombatResult, name: string | undefined, side?: Side) {
  if (!name) return undefined;
  const candidates = [...(side !== 'defensor' ? result.attackers : []), ...(side !== 'atacante' ? result.defenders : [])].filter(hero => hero.name === name);
  return candidates.length === 1 ? candidates[0].id : undefined;
}
export function eventParticipants(result: CombatResult, event?: CombatEvent) {
  if (!event || event.side === 'sistema') return {};
  return { actor: resolveParticipant(result, event.actor, event.side), target: resolveParticipant(result, event.target) };
}
