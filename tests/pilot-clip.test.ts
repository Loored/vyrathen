import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pilotFixture} from './fixtures/pilot-scenarios.ts';
import {adaptBattle} from '../src/features/combat/playback.ts';
import {adaptResources} from '../src/features/combat/resourcePlayback.ts';
import {pilotFrame} from '../src/features/combat/pilotModel.ts';
import {CLIP_STARTS, CLIP_DURATION, clipDrawing, clipPose, eligibleClip, GRIM_DRAWINGS, GRIM_REPAIRS, NYRA_DRAWINGS} from '../src/features/combat/pilotClip.ts';
import {pilotLayout,projectPose} from '../src/features/combat/pilotGeometry.ts';

test('clip uses recorded IDs, power attempt, compatible outcome and surviving participants across seeds and names',()=>{
  let hits=0,other=0,excluded=0;
  for(const variant of ['patrulla','duplicate-names','grim-fragile'] as const)for(let seed=0;seed<30;seed++){
    const battle=pilotFixture(variant,seed),timeline=adaptBattle(battle),recording=adaptResources(battle);
    for(let i=0;i<timeline.length;i++){
      const frame=pilotFrame(battle,recording,timeline,i),a=frame.action;
      const expected=!!(a?.actorId==='h4'&&a.targetId==='e3'&&a.kind==='power'&&a.outcome==='power'&&frame.actors.every(a=>!a.knockedOut));
      assert.equal(eligibleClip(frame),expected);
      if(expected)hits++;else if(a?.actorId==='h4'&&a.targetId==='e3')excluded++;else other++;
    }
  }
  assert.ok(hits>5);assert.ok(other>5);assert.ok(excluded>5);
  const battle=pilotFixture(),frame=pilotFrame(battle,adaptResources(battle),adaptBattle(battle),0);
  assert.ok(eligibleClip(frame));
  assert.equal(eligibleClip({...frame,supported:false}),false);
  for(const outcome of ['miss','dodged','blocked','ko','normal'] as const)assert.equal(eligibleClip({...frame,action:{...frame.action!,outcome}}),false);
  for(const kind of ['actorId','targetId'] as const)assert.equal(eligibleClip({...frame,action:{...frame.action!,[kind]:'other'}}),false);
  assert.equal(eligibleClip({...frame,action:undefined}),false);
});

test('all clip and repair drawings have bounded geometry and a fixed support and actor scale in both framings',()=>{
  const manifest=JSON.parse(readFileSync('public/combat-pilot/manifest.json','utf8'));
  assert.equal(CLIP_DURATION,2100);assert.equal(CLIP_STARTS.at(-1),2050);
  assert.ok(CLIP_STARTS.every((v,i)=>i===0||v>CLIP_STARTS[i-1]));
  for(const asset of manifest.supplementalAssets){
    const png=readFileSync(`public${asset.src}`);
    assert.equal(png.readUInt32BE(16),asset.dimensions.width);assert.equal(png.readUInt32BE(20),asset.dimensions.height);
    assert.equal(png[25],6);assert.equal(createHash('sha256').update(png).digest('hex'),asset.sha256);
  }
  for(const id of ['h4','e3'] as const)for(const framing of ['expanded','compact'] as const){
    const layout=pilotLayout(framing);
    for(let step=0;step<CLIP_STARTS.length;step++){
      const drawing=clipDrawing(id,step),g=projectPose(id,clipPose(id,step),framing,drawing);
      assert.equal(g.support[0],layout.feet[id]);assert.equal(g.support[1],layout.ground);
      assert.equal(g.scale,layout.scale);
      assert.ok(g.bounds[0][0]>=0&&g.bounds[0][1]>=0);
      assert.ok(g.bounds[1][0]<=layout.width&&g.bounds[1][1]<=layout.height);
    }
    assert.equal(clipDrawing(id,12),undefined);assert.equal(clipPose(id,12),'idle');
  }
  for(const d of [...NYRA_DRAWINGS,...GRIM_DRAWINGS,...Object.values(GRIM_REPAIRS)]){
    assert.ok(d.anchors.bounds[0]>0&&d.anchors.bounds[1]>0);
    assert.ok(d.anchors.bounds[2]<d.cellWidth&&d.anchors.bounds[3]<d.cellHeight);
    for(const p of [d.anchors.contact,d.anchors.support,d.anchors.hand!])assert.ok(p.every(Number.isFinite));
  }
});
