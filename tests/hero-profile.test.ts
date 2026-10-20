import test from 'node:test';
import assert from 'node:assert/strict';
import { PLAYER_TEAM } from '../src/data/demo.ts';
import { toHeroProfile } from '../src/features/heroes/heroProfile.ts';

test('el adaptador de ficha conserva campos del héroe y no muta el dominio', () => {
  const hero = { ...PLAYER_TEAM[0] };
  const before = JSON.stringify(hero);
  const profile = toHeroProfile(hero);
  assert.equal(profile.id, hero.id);
  assert.equal(profile.maxHp, hero.maxHp);
  assert.equal(profile.maxMp, hero.maxMp);
  assert.deepEqual(profile.stats.map(stat => stat.value), [hero.hit, hero.block, hero.dodge, hero.mental, hero.speed]);
  assert.equal(profile.power.status.kind, 'documented');
  assert.equal(JSON.stringify(hero), before);
});

test('un poder no catalogado no inventa coste ni ejecución', () => {
  const profile = toHeroProfile({ ...PLAYER_TEAM[0], power: 'Poder sin catálogo' });
  assert.equal(profile.power.status.kind, 'uncatalogued');
  assert.match(profile.power.status.implementation, /No se asume/);
  assert.equal(profile.presentation.art, 'absent');
});
