import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { simulateCombat } from '../src/engine/simulator.ts';
import type { CombatResult } from '../src/engine/types.ts';
import { combatScenario, variants } from './fixtures/combat-scenarios.ts';
import { adaptBattle, initialPlayback, transition } from '../src/features/combat/playback.ts';
import { adaptResources, resourcesAtCursor } from '../src/features/combat/resourcePlayback.ts';

const baseline = JSON.parse(readFileSync(new URL('./fixtures/combat-v01-projections.json', import.meta.url), 'utf8')) as {
  base: string; cases: { enemy: 'patrulla' | 'guardianes'; variant: typeof variants[number]; seed: number; sha256: string }[];
};
function simulate(enemy: 'patrulla' | 'guardianes' = 'patrulla', variant: typeof variants[number] = 'demo', seed = 1024) {
  const input = combatScenario(enemy, variant);
  return simulateCombat(input.attackers, input.defenders, seed);
}
test('all existing result fields equal 60 projections captured from the uninstrumented base motor', () => {
  assert.equal(baseline.base, 'c03c8b5702f947196b86ffa7bb30f7f256f66da2');
  assert.equal(baseline.cases.length, 60);
  const checks: { enemy: string; variant: string; seed: number; expected: string; actual: string }[] = [];
  for (const { enemy, variant, seed, sha256 } of baseline.cases) {
    const { trace, ...legacy } = simulate(enemy, variant, seed);
    assert.ok(trace);
    const actual = createHash('sha256').update(JSON.stringify(legacy)).digest('hex');
    assert.equal(actual, sha256, `${enemy}/${variant}/${seed}`);
    checks.push({ enemy, variant, seed, expected: sha256, actual });
  }
  const { trace: _trace, ...projection } = simulate();
  assert.deepEqual(projection, JSON.parse(readFileSync(new URL('./fixtures/combat-v01-1024.json', import.meta.url), 'utf8')));
  mkdirSync('output/playwright', { recursive: true });
  writeFileSync('output/playwright/combat-equivalence.json', JSON.stringify({
    sha: execFileSync('git', ['rev-parse', 'HEAD']).toString().trim(), baseSha: baseline.base,
    projection: 'CombatResult excluding only trace; all pre-existing fields retained', casesPassed: checks.length, checks,
  }, null, 2));
});

test('recordings preserve value snapshots, IDs, event order, resources, action costs and final state', () => {
  const coverage = new Set<string>();
  for (const { enemy, variant, seed } of baseline.cases) {
    const battle = simulate(enemy, variant, seed);
    const before = structuredClone(battle);
    const recording = adaptResources(battle);
    assert.equal(recording.mode, 'recorded', `${enemy}/${variant}/${seed}`);
    if (recording.mode !== 'recorded') throw new Error('Invalid generated trace');
    const timeline = adaptBattle(battle);
    assert.deepEqual([...resourcesAtCursor(recording, timeline, -1)!], battle.trace!.initial.map(r => [r.id, { hp: r.hp, mp: r.mp }]));
    const stream = battle.rounds.flatMap(r => r.events);
    for (const [i, record] of battle.trace!.events.entries()) {
      const event = stream[i];
      coverage.add(event.kind);
      assert.equal(record.eventId, event.id);
      assert.equal(record.sequence, i + 1);
      assert.deepEqual(recording.frames[i + 1], resourcesAtCursor(recording, timeline, i));
      if (record.attempt) {
        const a = record.changes.find(c => c.id === record.actorId)!;
        const t = record.changes.find(c => c.id === record.targetId)!;
        assert.equal(record.attempt.mpSpent, a.before.mp - a.after.mp);
        assert.equal(a.after.hp, a.before.hp);
        assert.equal(t.after.mp, t.before.mp);
        assert.notStrictEqual(a.before, a.after);
        if (record.attempt.kind === 'power') {
          coverage.add(`power:${event.kind}`);
          assert.ok(record.attempt.mpSpent > 0);
          assert.equal(record.attempt.power, [...battle.attackers, ...battle.defenders].find(h => h.id === record.actorId)!.power);
        } else assert.equal(record.attempt.mpSpent, 0);
        if (event.kind === 'miss' || event.kind === 'dodged') assert.equal(t.before.hp, t.after.hp);
        else assert.equal(t.before.hp - t.after.hp, event.damage);
      } else {
        assert.equal(record.changes.length, 0);
        if (event.kind === 'ko') {
          assert.equal(record.actionId, battle.trace!.events[i - 1].actionId);
          assert.equal(record.defeatedId, record.targetId);
          assert.equal(recording.frames[i + 1].get(record.defeatedId!)!.hp, 0);
          assert.deepEqual(recording.frames[i + 1], recording.frames[i]);
          for (const later of recording.frames.slice(i + 1)) assert.equal(later.get(record.defeatedId!)!.hp, 0);
        } else {
          assert.equal(record.actionId, undefined);
          assert.equal(record.targetId, undefined);
          assert.equal(record.defeatedId, undefined);
        }
      }
    }
    const final = resourcesAtCursor(recording, timeline, timeline.length - 1)!;
    for (const h of [...battle.attackers, ...battle.defenders]) assert.deepEqual(final.get(h.id), { hp: h.hp, mp: h.mp });
    assert.deepEqual(battle, before);
    const first = battle.trace!.initial[0];
    const hp = first.hp;
    battle.attackers[0].hp = -999;
    assert.equal(first.hp, hp, 'initial snapshot must not refer to mutable Fighter');
  }
  for (const kind of ['normal','power','blocked','dodged','miss','skip','ko','info','power:power','power:blocked','power:miss','power:dodged']) assert.ok(coverage.has(kind), `missing coverage: ${kind}`);
});

test('insufficient MP only records basic attempts; duplicate names retain distinct participant IDs', () => {
  const noMp = simulate('patrulla', 'no-mp');
  assert.ok(noMp.trace!.events.some(r => r.attempt));
  assert.ok(noMp.trace!.events.every(r => !r.attempt || r.attempt.kind === 'basic' && r.attempt.mpSpent === 0));
  const duplicates = simulate('patrulla', 'fragile-duplicates');
  assert.equal(new Set([...duplicates.attackers, ...duplicates.defenders].map(h => h.name)).size, 1);
  assert.equal(adaptResources(duplicates).mode, 'recorded');
  assert.ok(duplicates.trace!.events.some(r => r.actorId && r.targetId && r.actorId !== r.targetId));
});

test('positive MP below cost and catalog-only powers do not fabricate power execution', () => {
  for (const mode of ['insufficient', 'catalog-only']) {
    const input = combatScenario('patrulla', 'demo');
    for (const hero of [...input.attackers, ...input.defenders]) {
      if (mode === 'insufficient') hero.maxMp = 1;
      else hero.power = 'Preparar';
    }
    const result = simulateCombat(input.attackers, input.defenders, 1024);
    assert.equal(adaptResources(result).mode, 'recorded');
    assert.ok(result.trace!.events.some(e => e.attempt));
    assert.ok(result.trace!.events.every(e => !e.attempt || e.attempt.kind === 'basic' && e.attempt.mpSpent === 0));
    for (const h of [...result.attackers, ...result.defenders]) assert.equal(h.mp, h.maxMp);
  }
});

test('cursor jumps, restart, final and empty navigation stops read immutable recorded states', () => {
  const battle = simulate();
  battle.rounds.unshift({ round: 0, events: [], attackerAlive: 5, defenderAlive: 5 });
  const snapshot = structuredClone(battle);
  const recording = adaptResources(battle), timeline = adaptBattle(battle);
  let state = initialPlayback(timeline);
  const initial = resourcesAtCursor(recording, timeline, state.cursor);
  state = transition(state, { type: 'round', round: 0 }, timeline);
  assert.strictEqual(resourcesAtCursor(recording, timeline, state.cursor), initial);
  for (const round of [7, 2, 10, 1, 7]) {
    state = transition(state, { type: 'round', round }, timeline);
    assert.equal(state.status, 'paused');
    if (recording.mode !== 'recorded') throw new Error('Missing recording');
    assert.strictEqual(resourcesAtCursor(recording, timeline, state.cursor), recording.frames[timeline[state.cursor].ordinal]);
  }
  state = transition(state, { type: 'finish' }, timeline);
  assert.equal(state.status, 'finished');
  state = transition(state, { type: 'restart' }, timeline);
  assert.strictEqual(resourcesAtCursor(recording, timeline, state.cursor), initial);
  assert.deepEqual(battle, snapshot);
});

test('actual pre-v0.2 result and unsupported, partial or inconsistent recordings fall back completely', () => {
  const legacy = JSON.parse(readFileSync(new URL('./fixtures/combat-v01-1024.json', import.meta.url), 'utf8')) as CombatResult;
  assert.equal(legacy.trace, undefined);
  assert.deepEqual(adaptResources(legacy), { mode: 'legacy', reason: 'missing' });
  assert.equal(resourcesAtCursor(adaptResources(legacy), adaptBattle(legacy), 5), undefined);
  const mutations: ((v: CombatResult) => void)[] = [
    b => { Object.assign(b.trace!, { version: 42 }); },
    b => { Object.assign(b, { trace: null }); },
    b => { b.trace!.initial.pop(); },
    b => { b.trace!.initial[0].hp = -1; },
    b => { b.trace!.events.pop(); },
    b => { b.trace!.events[0].sequence = 2; },
    b => { b.trace!.events[0].actorId = 'missing'; },
    b => { b.trace!.events[0].targetId = b.trace!.events[0].actorId; },
    b => { b.trace!.events[0].eventId = 'mismatch'; },
    b => { b.trace!.events[0].changes[0].after.mp += 1; },
    b => { b.trace!.events[0].changes[0].before.hp -= 1; },
    b => { Object.assign(b.trace!.events[0].attempt!, { mpSpent: undefined }); },
    b => { b.trace!.events.find(r => r.defeatedId)!.changes = b.trace!.events[0].changes; },
    b => { b.attackers[0].mp += 1; },
  ];
  for (const mutate of mutations) {
    const battle = simulate();
    mutate(battle);
    const recording = adaptResources(battle);
    assert.equal(recording.mode, 'legacy');
    assert.equal(resourcesAtCursor(recording, adaptBattle(battle), 0), undefined);
  }
});
