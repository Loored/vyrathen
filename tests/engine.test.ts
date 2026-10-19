import test from 'node:test';
import assert from 'node:assert/strict';
import { beatsBoss, chooseVictor, countTypePoints, documentedMpCost, NOMINAL_POWER_DAMAGE } from '../src/engine/rules.ts';
import { simulateCombat } from '../src/engine/simulator.ts';
import { ENEMIES, PLAYER_TEAM } from '../src/data/demo.ts';
import type { HeroType } from '../src/engine/types.ts';
const t=(...types:HeroType[])=>types.map(type=>({type}));
test('manual: ejemplo de ventaja 13:1',()=>{
  assert.deepEqual(countTypePoints(t('Psico','Psico','Psico','Psico','Energía'),t('Energía','Energía','Energía','Psico','Control')), {attacker:13,defender:1});
});
test('ventaja 25:0 y simetría',()=>{
  assert.deepEqual(countTypePoints(t('Defensa','Defensa','Defensa','Defensa','Defensa'),t('Psico','Psico','Psico','Psico','Psico')),{attacker:25,defender:0});
  const a=t('Control','Energía','Psico','Defensa','Control'); const b=t('Energía','Defensa','Defensa','Psico','Control');
  const f=countTypePoints(a,b), r=countTypePoints(b,a);
  assert.deepEqual(f,{attacker:r.defender,defender:r.attacker});
});
test('victoria KOs, empate defensor y boss',()=>{
  assert.equal(chooseVictor(3,2),'atacante');
  assert.equal(chooseVictor(2,3),'defensor');
  assert.equal(chooseVictor(2,2),'defensor');
  assert.equal(beatsBoss(true),true);assert.equal(beatsBoss(false),false);
});
test('nominales documentados para nivel 5 y coste de MP',()=>{
  assert.equal(NOMINAL_POWER_DAMAGE['Electricidad'](5),125);
  assert.equal(NOMINAL_POWER_DAMAGE['Desatomizar'](5),135);
  assert.equal(NOMINAL_POWER_DAMAGE['Frio'](5),110);
  assert.equal(NOMINAL_POWER_DAMAGE['Fuego'](5),110);
  assert.equal(NOMINAL_POWER_DAMAGE['Radiactividad'](5),46);
  assert.equal(NOMINAL_POWER_DAMAGE['Telequinesis'](5),105);
  assert.equal(documentedMpCost('Regeneracion',5),15);
  assert.equal(documentedMpCost('Invisibilidad',5),15);
  assert.equal(documentedMpCost('Influir maquinas',5),0);
  assert.equal(documentedMpCost('Electricidad',5),25);
});
test('combate con semilla determinista, 10 rondas y recursos no negativos',()=>{
  const a=simulateCombat(PLAYER_TEAM,ENEMIES.patrulla.heroes,1024);
  const b=simulateCombat(PLAYER_TEAM,ENEMIES.patrulla.heroes,1024);
  assert.deepEqual(a,b);
  assert.equal(a.rounds.length,10);
  assert.equal(a.rounds.at(-1)?.attackerAlive,5-a.defenderKOs);
  assert.equal(a.rounds.at(-1)?.defenderAlive,5-a.attackerKOs);
  assert.equal(a.victor,chooseVictor(a.attackerKOs,a.defenderKOs));
  for(const h of [...a.attackers,...a.defenders]){
    assert.ok(h.hp>=0 && h.hp<=h.maxHp);assert.ok(h.mp>=0 && h.mp<=h.maxMp);
  }
  assert.ok(a.rounds.some(r=>r.events.length>0));
});
test('semillas distintas y sin mutar los héroes fuente',()=>{
  const before=structuredClone(PLAYER_TEAM);
  const a=simulateCombat(PLAYER_TEAM,ENEMIES.guardianes.heroes,1);
  const b=simulateCombat(PLAYER_TEAM,ENEMIES.guardianes.heroes,2);
  assert.notDeepEqual(a.rounds,b.rounds);
  assert.deepEqual(PLAYER_TEAM,before);
});
test('rechaza equipos incompletos y niveles inválidos',()=>{
  assert.throws(()=>simulateCombat(PLAYER_TEAM.slice(0,4),ENEMIES.patrulla.heroes,4));
  assert.throws(()=>documentedMpCost('Fuego',0));
});
import { advanceStarterQuest, claimStarterQuest } from '../src/engine/quest.ts';
import { INITIAL_SAVE } from '../src/data/demo.ts';
test('misión: diez pasos demo y recompensa histórica',()=>{
  let s=structuredClone(INITIAL_SAVE);
  for(let i=0;i<10;i++) s=advanceStarterQuest(s);
  assert.equal(s.turns,INITIAL_SAVE.turns-10);
  assert.equal(s.questProgress,10);
  assert.deepEqual(advanceStarterQuest(s),s);
  const claimed=claimStarterQuest(s);
  assert.equal(claimed.funds,INITIAL_SAVE.funds+12_000_000);
  assert.equal(claimed.questProgress,0);
  assert.equal(claimed.questCompletions,1);
  assert.deepEqual(claimStarterQuest(claimed),claimed);
});
