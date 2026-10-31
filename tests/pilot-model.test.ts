import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pilotFixture } from './fixtures/pilot-scenarios.ts';
import { adaptBattle, initialPlayback, transition, type PlaybackAction } from '../src/features/combat/playback.ts';
import { adaptResources } from '../src/features/combat/resourcePlayback.ts';
import { initialPilotPlayer, inspectedPose, PILOT_ACTORS, PILOT_SHEET, POSE_FRAMES, pilotFrame, pilotTransition } from '../src/features/combat/pilotModel.ts';

test('original pose sheet files match declared dimensions, frame grid, IDs and provenance manifest', () => {
  const manifest=JSON.parse(readFileSync(new URL('../public/combat-pilot/manifest.json',import.meta.url),'utf8'));
  assert.equal(manifest.type,'provisional-eight-pose-spritesheets');
  assert.equal(manifest.assets.length,2);
  for(const [id,asset] of Object.entries(PILOT_ACTORS)){
    const png=readFileSync(new URL(`../public${asset.src}`,import.meta.url));
    assert.equal(png.readUInt32BE(16),PILOT_SHEET.width);assert.equal(png.readUInt32BE(20),PILOT_SHEET.height);
    assert.equal(png[25],6,'PNG RGBA supports transparent cutouts');
    assert.equal(manifest.assets.find((a:{participant:string})=>a.participant===id).sha256,createHash('sha256').update(png).digest('hex'));
  }
  assert.deepEqual(Object.values(POSE_FRAMES),[0,1,2,3,4,5,6,7]);
});

test('real 1024 crossing uses Nyra h4 and Grim e3, validated attempt and post-event resources', () => {
  const battle = pilotFixture(), snapshot = structuredClone(battle);
  const timeline = adaptBattle(battle), recording = adaptResources(battle);
  const frame = pilotFrame(battle, recording, timeline, 0);
  assert.equal(frame.action?.actorId, 'h4');
  assert.equal(frame.action?.targetId, 'e3');
  assert.equal(frame.action?.kind, 'power');
  assert.equal(frame.actors.find(a => a.id === 'h4')?.pose, 'power');
  assert.equal(frame.actors.find(a => a.id === 'e3')?.pose, 'hit');
  assert.equal(frame.actors.length, 2);
  assert.equal(battle.attackers.length + battle.defenders.length, 10);
  const duplicate = pilotFixture('duplicate-names');
  assert.deepEqual(pilotFrame(duplicate, adaptResources(duplicate), adaptBattle(duplicate), 0), frame);
  for (const cursor of [-1, 0, 2, 50, timeline.length - 1]) pilotFrame(battle, recording, timeline, cursor);
  assert.deepEqual(battle, snapshot);
});

test('basic, power, miss, dodge and block poses come from actual validated records only', () => {
  const covered = new Set<string>();
  for (let seed = 0; seed < 30; seed++) {
    const battle = pilotFixture('patrulla', seed), timeline = adaptBattle(battle), recording = adaptResources(battle);
    for (const [cursor, item] of timeline.entries()) {
      const frame = pilotFrame(battle, recording, timeline, cursor);
      const record = battle.trace!.events[cursor];
      if (record.attempt) {
        assert.equal(frame.action?.id, record.actionId);
        assert.equal(frame.action?.kind, record.attempt.kind);
        if (record.actorId === 'h4' || record.actorId === 'e3') {
          covered.add(record.attempt.kind);
          assert.equal(frame.actors.find(a => a.id === record.actorId)?.pose, record.attempt.kind);
        }
        const target = frame.actors.find(a => a.id === record.targetId);
        if (target && !target.knockedOut) {
          covered.add(item.event!.kind);
          assert.equal(target.pose, item.event!.kind === 'miss' ? 'idle' : item.event!.kind === 'dodged' ? 'dodge' : item.event!.kind === 'blocked' ? 'block' : 'hit');
          assert.equal(inspectedPose(target, 'anticipation'), 'idle');
        }
      } else {
        assert.equal(frame.action, undefined);
        assert.ok(frame.actors.every(a => a.pose === 'idle' || a.pose === 'ko'));
      }
    }
  }
  for (const state of ['basic','power','blocked','dodged','miss','normal']) assert.ok(covered.has(state), state);
});

test('damage and K.O. share one visual action, and K.O. persists until navigation resets it', () => {
  const battle = pilotFixture('grim-fragile'), timeline = adaptBattle(battle), recording = adaptResources(battle);
  assert.equal(timeline[1].event?.kind, 'ko');
  assert.equal(battle.trace!.events[0].actionId, battle.trace!.events[1].actionId);
  const damage = pilotFrame(battle, recording, timeline, 0);
  assert.ok(damage.action);
  assert.equal(damage.actors.find(a => a.id === 'e3')?.pose, 'ko');
  assert.equal(pilotFrame(battle, recording, timeline, 1).action, undefined);
  for (let i = 1; i < timeline.length; i++) assert.equal(pilotFrame(battle, recording, timeline, i).actors.find(a => a.id === 'e3')?.pose, 'ko');
  assert.equal(pilotFrame(battle, recording, timeline, -1).actors.find(a => a.id === 'e3')?.pose, 'idle');
});

test('presentation changes preserve the one cursor; pause/resume does not replay, seeks and view changes cancel', () => {
  const timeline = adaptBattle(pilotFixture());
  let state = initialPilotPlayer(timeline);
  state = pilotTransition(state, { type: 'view', view: 'scene' }, timeline);
  state = pilotTransition(state, { type: 'play' }, timeline);
  state = pilotTransition(state, { type: 'tick' }, timeline);
  assert.equal(state.animated, true);
  const serial = state.visualSerial;
  state = pilotTransition(state, { type: 'pause' }, timeline);
  state = pilotTransition(state, { type: 'play' }, timeline);
  assert.equal(state.visualSerial, serial);
  for (const view of ['tactical', 'scene', 'tactical', 'scene'] as const) {
    state = pilotTransition(state, { type: 'view', view }, timeline);
    assert.equal(state.cursor, 0);
    assert.equal(state.status, 'playing');
    assert.equal(state.animated, false);
  }
  state = pilotTransition(state, { type: 'step' }, timeline);
  assert.equal(state.phase, 'event');
  assert.equal(state.status, 'paused');
  const before = state.cursor;
  state = pilotTransition(state, { type: 'inspect', phase: 'reaction' }, timeline);
  assert.equal(state.cursor, before);
  state = pilotTransition(state, { type: 'round', round: 5 }, timeline);
  assert.equal(state.phase, 'rest');
  assert.equal(state.animated, false);
  state = pilotTransition(state, { type: 'finish' }, timeline);
  assert.equal(state.phase, 'rest');
  assert.equal(state.animated, false);
  state = pilotTransition(state, { type: 'restart' }, timeline);
  assert.equal(state.cursor, -1);
  assert.equal(state.view, 'scene');
});

test('all existing playback actions keep original semantics, and invalid trace never produces actors', () => {
  const battle = pilotFixture(), timeline = adaptBattle(battle);
  let original = initialPlayback(timeline), pilot = initialPilotPlayer(timeline);
  for (const action of [{type:'play'},{type:'tick'},{type:'pause'},{type:'step'},{type:'round',round:6},{type:'finish'},{type:'restart'}] as PlaybackAction[]) {
    original = transition(original, action, timeline);
    pilot = pilotTransition(pilot, action, timeline);
    assert.equal(pilot.cursor, original.cursor);
    assert.equal(pilot.status, original.status);
  }
  delete battle.trace;
  assert.deepEqual(pilotFrame(battle, adaptResources(battle), timeline, 0), { supported:false, actors:[] });
  const invalid = pilotFixture();
  invalid.trace!.events.pop();
  assert.deepEqual(pilotFrame(invalid, adaptResources(invalid), adaptBattle(invalid), 0), { supported:false, actors:[] });
});

test('all 16 pose anchors map support to the same floor and preserve one scale per actor', async () => {
  const { POSE_ANCHORS, pilotLayout, projectPose } = await import('../src/features/combat/pilotGeometry.ts');
  for (const id of ['h4','e3'] as const) {
    assert.deepEqual(Object.keys(POSE_ANCHORS[id]).sort(), ['anticipation','basic','block','dodge','hit','idle','ko','power']);
    for (const pose of Object.keys(POSE_ANCHORS[id]) as (keyof typeof POSE_ANCHORS[typeof id])[]) {
      const geometry = projectPose(id, pose, 'expanded');
      assert.equal(geometry.support[1], pilotLayout('expanded').ground, `${id}/${pose} support`);
      assert.equal(geometry.scale, pilotLayout('expanded').scale);
      assert.ok(geometry.contact.every(Number.isFinite));
      if (POSE_ANCHORS[id][pose].hand) assert.ok(geometry.hand?.every(Number.isFinite));
    }
  }
  assert.equal(POSE_ANCHORS.e3.dodge.sourceClipped, 'right');
  assert.equal(POSE_ANCHORS.e3.ko.sourceClipped, 'left');
  assert.equal(projectPose('h4','ko','expanded').support[1], projectPose('e3','ko','expanded').support[1]);
});
