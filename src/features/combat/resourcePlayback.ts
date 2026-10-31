import type { CombatEventTrace, CombatResources, CombatResult, CombatTrace, Fighter } from '../../engine/types.ts';
import type { Timeline } from './playback.ts';

export type ResourceState = ReadonlyMap<string, Readonly<CombatResources>>;
export type ResourcePlayback =
  | { mode: 'legacy'; reason: 'missing' | 'unsupported' | 'invalid' }
  | { mode: 'recorded'; version: 1; frames: readonly ResourceState[]; events: readonly CombatEventTrace[] };
const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const number = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const resources = (v: unknown): v is CombatResources => object(v) && number(v.hp) && number(v.mp);
const optionalId = (v: unknown) => v === undefined || (typeof v === 'string' && v.length > 0);
const same = (a: CombatResources, b: CombatResources) => a.hp === b.hp && a.mp === b.mp;
function eventTrace(v: unknown): v is CombatEventTrace {
  if (!object(v) || typeof v.eventId !== 'string' || !Number.isInteger(v.sequence) ||
    ![v.actorId, v.targetId, v.actionId, v.defeatedId].every(optionalId) || !Array.isArray(v.changes)) return false;
  if (v.attempt !== undefined && (!object(v.attempt) || !number(v.attempt.mpSpent) ||
    !(v.attempt.kind === 'basic' && v.attempt.mpSpent === 0 || v.attempt.kind === 'power' && typeof v.attempt.power === 'string' && v.attempt.power.length > 0))) return false;
  return v.changes.every(c => object(c) && typeof c.id === 'string' && resources(c.before) && resources(c.after));
}
function traceShape(v: unknown): v is CombatTrace {
  return object(v) && v.version === 1 && Array.isArray(v.initial) &&
    v.initial.every(r => resources(r) && object(r) && typeof r.id === 'string') &&
    Array.isArray(v.events) && v.events.every(eventTrace);
}
const within = (r: CombatResources, h: Fighter) => r.hp <= h.maxHp && r.mp <= h.maxMp;
const copy = (r: CombatResources) => Object.freeze({ hp: r.hp, mp: r.mp });

/** Validate the entire optional recording before exposing any current resources or IDs.
 * No formula, RNG, message parsing, final-state interpolation or partial recovery.
 */
export function adaptResources(battle: CombatResult): ResourcePlayback {
  const invalid: ResourcePlayback = { mode: 'legacy', reason: 'invalid' };
  const raw: unknown = battle.trace;
  if (raw === undefined) return { mode: 'legacy', reason: 'missing' };
  if (object(raw) && raw.version !== undefined && raw.version !== 1) return { mode: 'legacy', reason: 'unsupported' };
  if (!traceShape(raw)) return invalid;
  const heroes = [...battle.attackers, ...battle.defenders];
  const fighters = new Map(heroes.map(h => [h.id, h]));
  const attackerIds = new Set(battle.attackers.map(h => h.id));
  const stream = battle.rounds.flatMap(r => r.events);
  if (fighters.size !== heroes.length || raw.initial.length !== heroes.length || raw.events.length !== stream.length ||
    new Set(raw.initial.map(r => r.id)).size !== heroes.length || new Set(stream.map(e => e.id)).size !== stream.length) return invalid;
  let current = new Map<string, Readonly<CombatResources>>();
  for (const r of raw.initial) {
    const h = fighters.get(r.id);
    if (!h || !within(r, h) || r.hp !== h.maxHp || r.mp !== h.maxMp) return invalid;
    current.set(r.id, copy(r));
  }
  const frames: ResourceState[] = [current];
  const actions = new Set<string>();
  for (const [index, record] of raw.events.entries()) {
    const e = stream[index];
    if (record.eventId !== e.id || record.sequence !== index + 1) return invalid;
    const actor = record.actorId ? fighters.get(record.actorId) : undefined;
    const target = record.targetId ? fighters.get(record.targetId) : undefined;
    if (e.side === 'sistema') {
      if (e.kind !== 'info' || actor || record.actorId || record.targetId || record.actionId || record.attempt || record.defeatedId || record.changes.length) return invalid;
    } else {
      if (!actor || actor.name !== e.actor || attackerIds.has(actor.id) !== (e.side === 'atacante')) return invalid;
      if (e.kind === 'skip') {
        if (record.targetId || record.actionId || record.attempt || record.defeatedId || record.changes.length || e.target !== undefined || current.get(actor.id)?.hp === 0) return invalid;
      } else {
        if (!target || target.name !== e.target || attackerIds.has(actor.id) === attackerIds.has(target.id) || !record.actionId) return invalid;
        if (e.kind === 'ko') {
          const previous = raw.events[index - 1];
          if (!previous?.attempt || previous.actionId !== record.actionId || previous.actorId !== actor.id || previous.targetId !== target.id ||
            record.defeatedId !== target.id || current.get(target.id)?.hp !== 0 || record.attempt || record.changes.length) return invalid;
        } else {
          if (!record.attempt || record.defeatedId || actions.has(record.actionId) || current.get(actor.id)?.hp === 0 || current.get(target.id)?.hp === 0 ||
            !['normal', 'power', 'blocked', 'miss', 'dodged'].includes(e.kind) || record.changes.length !== 2) return invalid;
          actions.add(record.actionId);
          const a = record.changes.find(c => c.id === actor.id);
          const t = record.changes.find(c => c.id === target.id);
          if (!a || !t || a.after.hp !== a.before.hp || t.after.mp !== t.before.mp ||
            a.before.mp - a.after.mp !== record.attempt.mpSpent ||
            e.kind === 'normal' && record.attempt.kind !== 'basic' || e.kind === 'power' && record.attempt.kind !== 'power' ||
            record.attempt.kind === 'power' && record.attempt.power !== actor.power) return invalid;
          if (e.kind === 'miss' || e.kind === 'dodged') {
            if (e.damage !== undefined || t.before.hp !== t.after.hp) return invalid;
          } else if (!number(e.damage) || t.before.hp - t.after.hp !== e.damage) return invalid;
        }
      }
    }
    const next = new Map(current);
    const changed = new Set<string>();
    for (const change of record.changes) {
      const h = fighters.get(change.id), before = current.get(change.id);
      if (!h || !before || changed.has(change.id) || !same(before, change.before) || !within(change.before, h) || !within(change.after, h)) return invalid;
      changed.add(change.id);
      next.set(change.id, copy(change.after));
    }
    current = next;
    frames.push(current);
  }
  if (heroes.some(h => !same(current.get(h.id)!, h))) return invalid;
  return { mode: 'recorded', version: 1, frames, events: structuredClone(raw.events) };
}

/** Cursor -1 is initial; every navigation stop uses the state after its event.
 * Empty rounds inherit the previous event's ordinal without fabricating changes.
 */
export function resourcesAtCursor(recording: ResourcePlayback, timeline: Timeline, cursor: number): ResourceState | undefined {
  if (recording.mode !== 'recorded') return undefined;
  const bounded = Number.isFinite(cursor) ? Math.max(-1, Math.min(timeline.length - 1, Math.trunc(cursor))) : -1;
  return recording.frames[timeline[bounded]?.ordinal ?? 0];
}
