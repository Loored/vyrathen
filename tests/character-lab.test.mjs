import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';

// DOM integration checks, not a substitute for browser layout/motion review.
const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/character-lab', pretendToBeVisual: true });
Object.assign(globalThis, {
  window: dom.window, document: dom.window.document,
  HTMLElement: dom.window.HTMLElement, Element: dom.window.Element,
  SVGElement: dom.window.SVGElement, localStorage: dom.window.localStorage,
  getComputedStyle: dom.window.getComputedStyle,
  requestAnimationFrame: dom.window.requestAnimationFrame.bind(dom.window),
  cancelAnimationFrame: dom.window.cancelAnimationFrame.bind(dom.window),
  IS_REACT_ACT_ENVIRONMENT: true,
});
let prefersReduced = true;
const mediaListeners = new Set();
window.matchMedia = () => ({
  get matches() { return prefersReduced; },
  addEventListener: (_, fn) => mediaListeners.add(fn),
  removeEventListener: (_, fn) => mediaListeners.delete(fn),
});
window.scrollTo = () => {};
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
const { default: Lab } = await vite.ssrLoadModule('/src/features/character-lab/CharacterLabRoute.tsx');
const { default: App } = await vite.ssrLoadModule('/src/App.tsx');
const { INITIAL_SAVE } = await vite.ssrLoadModule('/src/data/demo.ts');
let root;
const container = document.getElementById('root');
const q = selector => container.querySelector(selector);
const key = async (node, value, extra = {}) => {
  await act(async () => node.dispatchEvent(new window.KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true, ...extra })));
};
const click = async node => { await act(async () => node.click()); };
const mount = async Component => {
  if (root) await act(async () => root.unmount());
  root = createRoot(container);
  await act(async () => root.render(React.createElement(React.StrictMode, null, React.createElement(Component))));
};
after(async () => {
  if (root) await act(async () => root.unmount());
  await vite.close();
  dom.window.close();
});

test('lab switches fixtures, tabs and motion preferences without writing the game save', async () => {
  const save = JSON.stringify({ ...INITIAL_SAVE, turns: 77, funds: 123456 });
  localStorage.setItem('vyrathen-v01', save);
  await mount(Lab);
  assert.equal(q('.app').dataset.reduced, 'true');
  await key(window, 'ArrowRight');
  assert.equal(q('h1').textContent, 'Kuroe');
  assert.equal(q('.switch-overlay'), null);
  assert.equal(container.querySelectorAll('.edge-select').length, 1);
  const first = q('#character-tab-stats');
  first.focus();
  await key(first, 'ArrowRight');
  assert.equal(document.activeElement.id, 'character-tab-skills');
  assert.equal(q('[role=tabpanel]').getAttribute('aria-labelledby'), 'character-tab-skills');
  assert.equal(q('h1').textContent, 'Kuroe'); // tab arrows must not switch hero
  await key(document.activeElement, 'End');
  assert.equal(document.activeElement.id, 'character-tab-equipment');
  assert.equal(container.querySelectorAll('[role=tab][tabindex="0"]').length, 1);
  await click(q('.slot-2'));
  assert.equal(q('.slot-2').getAttribute('aria-pressed'), 'true');
  await click(q('[aria-label="Seleccionar Orion"]'));
  assert.equal(q('h1').textContent, 'Orion');
  assert.equal(q('.slot-0').getAttribute('aria-pressed'), 'true');
  await key(window, '1');
  assert.equal(container.querySelectorAll('.stat-row').length, 6);
  await key(window, 'm');
  assert.equal(q('.app').dataset.ambient, 'false');
  await key(window, 'm', { repeat: true });
  assert.equal(q('.app').dataset.ambient, 'false');
  assert.equal(localStorage.getItem('vyrathen-v01'), save);
  assert.equal(q('a[href="/"]').textContent, 'VOLVER AL JUEGO');
});

test('animated switch locks concurrent input and resolves immediately if reduced motion is enabled', async () => {
  await mount(Lab);
  await key(window, 'r');
  await key(window, 'ArrowRight');
  assert.ok(q('.switch-overlay'));
  assert.equal(container.querySelectorAll('.edge-select').length, 1);
  assert.equal(q('.person').disabled, true);
  await key(window, 'ArrowRight');
  await key(window, 'r');
  assert.equal(q('h1').textContent, 'Kuroe');
  assert.equal(q('.switch-overlay'), null);
  assert.equal(q('.person').disabled, false);
});

test('system motion changes settle an active transition and unmount clears listeners', async () => {
  prefersReduced = false;
  await mount(Lab);
  await key(window, 'ArrowRight');
  assert.ok(q('.switch-overlay'));
  await act(async () => { prefersReduced = true; mediaListeners.forEach(fn => fn()); });
  assert.equal(q('h1').textContent, 'Kuroe');
  assert.equal(q('.switch-overlay'), null);
  await mount(App);
  assert.equal(mediaListeners.size, 0);
});

test('normal choreography swaps under cover and unlocks after the sequence', async () => {
  prefersReduced = false;
  await mount(Lab);
  await click(q('[aria-label="Seleccionar Kuroe"]'));
  assert.equal(q('h1').textContent, 'Selene');
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 360)); });
  assert.ok(q('[role=status]').textContent.includes('Kuroe'));
  assert.ok(q('.switch-overlay'));
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 500)); });
  assert.equal(q('.switch-overlay'), null);
  assert.equal(q('.person').disabled, false);
  assert.equal(container.querySelectorAll('.edge-select').length, 1);
  prefersReduced = true;
});

test('original navigation, quest, seeded battle and save survive a visit to the lab', async () => {
  localStorage.setItem('vyrathen-v01', JSON.stringify({ ...INITIAL_SAVE, turns: 77, funds: 123456 }));
  await mount(App);
  const button = text => [...container.querySelectorAll('button')].find(n => n.textContent.includes(text));
  await click(button('Avanzar un paso'));
  assert.equal(JSON.parse(localStorage.getItem('vyrathen-v01')).turns, 76);
  await click(button('Simulador de combate'));
  await click(button('Iniciar simulación'));
  const before = localStorage.getItem('vyrathen-v01');
  assert.equal(JSON.parse(before).lastBattle.rounds.length, 10);
  assert.ok(q('a[href="/character-lab"]'));
  await mount(Lab);
  await key(window, 'ArrowRight');
  assert.equal(localStorage.getItem('vyrathen-v01'), before);
  await mount(App);
  assert.equal(localStorage.getItem('vyrathen-v01'), before);
  await click(button('Mis héroes'));
  assert.equal(container.querySelectorAll('.hero-card').length, 5);
  await click(button('Consultar ficha'));
  assert.ok(container.textContent.includes('Estadísticas de configuración'));
  assert.ok(container.textContent.includes('HP máximo'));
  await click(button('Volver a Mis héroes'));
  assert.equal(container.querySelectorAll('.hero-card').length, 5);
  await click(button('Archivo de reglas'));
  assert.equal(container.querySelectorAll('.power-entry').length, 24);
  await click(button('Simulador de combate'));
  assert.ok(container.textContent.includes('Resultado del enfrentamiento'));
});
