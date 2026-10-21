import { expect, test, type Locator } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PLAYER_TEAM, INITIAL_SAVE } from '../../src/data/demo';

for (const reducedMotion of ['reduce', 'no-preference'] as const) {
  test(`personajes: contratos, consulta, teclado, foco y partida — ${reducedMotion}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    await page.addInitScript(save => localStorage.setItem('vyrathen-v01', JSON.stringify(save)), { ...INITIAL_SAVE, questProgress: 4, turns: 176 });
    await page.goto('/');
    const saved = await page.evaluate(() => localStorage.getItem('vyrathen-v01'));
    await page.getByRole('button', { name: 'Mis héroes', exact: true }).click();
    await expect(page.getByRole('button', { name: /^Seleccionar / })).toHaveCount(0);
    await expect(page.locator('.vyr-roster-entry.is-selected')).toHaveCount(0);
    await expect(page.locator('.vyr-roster-entry button')).toHaveCount(5);
    for (const hero of PLAYER_TEAM) {
      const opener = page.getByRole('button', { name: `Consultar ficha de ${hero.name}`, exact: true });
      await opener.focus();
      await page.keyboard.press('Enter');
      await expect(page.getByRole('heading', { name: hero.name, exact: true })).toBeFocused();
      await expect(page.locator('.vyr-hero-vitals dd')).toHaveText([String(hero.maxHp), String(hero.maxMp)]);
      await expect(page.locator('.vyr-profile-stats dd')).toHaveText([hero.hit, hero.block, hero.dodge, hero.mental, hero.speed].map(String));
      await expect(page.locator('#hero-power-title')).toHaveText(hero.power);
      await expect(page.getByText('Sin ilustración asignada.', { exact: false })).toBeVisible();
      await expect(page.locator('.hero-profile img')).toHaveCount(0);
      await expect(page.locator('.vyr-profile-stats')).toBeInViewport({ ratio: 1 });
      await expect(page.getByRole('button', { name: 'Abrir simulador' })).toBeInViewport({ ratio: 1 });
      if (reducedMotion === 'reduce') await expect(page.locator('.hero-profile')).toHaveCSS('animation-name', 'none');
      await page.getByRole('button', { name: 'Volver a Mis héroes' }).click();
      await expect(opener).toBeFocused();
      await expect(page.locator('.vyr-roster-entry.is-selected')).toHaveCount(1);
      await expect(page.locator('.vyr-roster-entry.is-selected h2')).toHaveText(hero.name);
      await expect(page.locator('.vyr-roster-entry.is-selected')).toContainText('Último consultado');
    }
    expect(await page.evaluate(() => localStorage.getItem('vyrathen-v01'))).toBe(saved);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(1366);
  });
}

test('personajes móvil: consulta y ficha accesibles sin overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir menú' }).click();
  await page.getByRole('button', { name: 'Mis héroes', exact: true }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Consultar ficha de Astra' }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  await page.getByRole('button', { name: 'Volver a Mis héroes' }).click();
  await expect(page.getByRole('button', { name: 'Consultar ficha de Astra' })).toBeFocused();
  await expect(page.locator('.vyr-roster-entry.is-selected h2')).toHaveText('Astra');
});

test('vídeo personajes: consulta y retorno con movimiento normal', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Mis héroes', exact: true }).click();
  await page.waitForTimeout(1000); // Readable holds for owner review, not synchronization.
  for (const name of ['Vesper', 'Astra']) {
    await page.getByRole('button', { name: `Consultar ficha de ${name}` }).click();
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
    await page.waitForTimeout(1500);
    await page.getByRole('button', { name: 'Volver a Mis héroes' }).click();
    await page.waitForTimeout(700);
  }
});

for (const input of ['mouse', 'keyboard'] as const) {
  test(`consulta rápida con ${input} real durante movimiento normal`, async ({ page }, testInfo) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    await page.getByRole('button', { name: 'Mis héroes', exact: true }).click();
    const saved = await page.evaluate(() => localStorage.getItem('vyrathen-v01'));
    // Observe trusted browser events, without dispatchEvent, force, animation changes
    // or sleeps. Record whether a real event reaches a control during entry motion.
    await page.evaluate(() => {
      const samples: Array<{ type: string; trusted: boolean; moving: boolean }> = [];
      Object.assign(window, { characterInputSamples: samples });
      for (const type of ['click', 'keydown']) document.addEventListener(type, event => {
        if (!(event.target instanceof Element) || !event.target.closest('.vyr-characters button')) return;
        samples.push({ type, trusted: event.isTrusted, moving: document.getAnimations().some(animation =>
          animation.playState === 'running' && animation.effect instanceof KeyframeEffect &&
          animation.effect.target instanceof Element && animation.effect.target.matches('.vyr-characters')) });
      }, true);
    });
    async function clickNow(control: Locator) {
      // mouse.click performs real hit-testing without Locator.click's stability wait.
      const bounds = await control.boundingBox();
      expect(bounds).not.toBeNull();
      await page.mouse.click(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
    }
    for (const hero of [PLAYER_TEAM[1], PLAYER_TEAM[2], PLAYER_TEAM[3], PLAYER_TEAM[1]]) {
      const opener = page.getByRole('button', { name: `Consultar ficha de ${hero.name}`, exact: true });
      if (input === 'mouse') await clickNow(opener);
      else { await opener.focus(); await page.keyboard.press('Enter'); }
      await expect(page.locator('#hero-profile-name')).toHaveText(hero.name);
      await expect(page.locator('#hero-profile-name')).toBeFocused();
      const back = page.getByRole('button', { name: 'Volver a Mis héroes' });
      if (input === 'mouse') await clickNow(back);
      else {
        await page.keyboard.press('Shift+Tab');
        await expect(back).toBeFocused();
        await page.keyboard.press('Enter');
      }
      await expect(opener).toBeFocused();
      await expect(page.locator('.vyr-roster-entry.is-selected h2')).toHaveText(hero.name);
    }
    const samples = await page.evaluate(() => (window as unknown as { characterInputSamples: Array<{type: string; trusted: boolean; moving: boolean}> }).characterInputSamples);
    await testInfo.attach('trusted-input-during-motion', { body: JSON.stringify(samples, null, 2), contentType: 'application/json' });
    expect(samples.length).toBeGreaterThanOrEqual(8);
    expect(samples.every(sample => sample.trusted)).toBe(true);
    expect(samples.some(sample => sample.moving && sample.type === (input === 'mouse' ? 'click' : 'keydown'))).toBe(true);
    expect(await page.evaluate(() => localStorage.getItem('vyrathen-v01'))).toBe(saved);
    await expect(page.locator('.switch-overlay')).toHaveCount(0);
  });
}
