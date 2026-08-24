import { test, expect } from '@playwright/test';

test('mobile header hides its crown after scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const header = page.locator('header').first();
  await expect(header).toHaveCSS('height', '0px');
  await expect(page.getByRole('button', { name: 'Menu' })).toHaveCSS(
    'position',
    'fixed',
  );
  const crown = page.getByRole('link', {
    name: 'Voltar para a página inicial',
  });
  await expect(crown).toBeVisible();
  await expect(crown).toHaveCSS('position', 'static');
  await expect
    .poll(() =>
      page.evaluate(() => {
        window.scrollTo(0, 400);
        return window.scrollY;
      }),
    )
    .toBeGreaterThan(300);
  expect((await crown.boundingBox())?.y).toBeLessThan(0);
});

test('tablet header shows the crown and floating menu at the top', async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('/');

  await expect(
    page.getByRole('link', { name: 'Voltar para a página inicial' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible();
});

test('V2 portfolio navigation, language and project detail', async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/');

  await expect(
    page.getByText('JONATHA BOTELHO', { exact: true }).first(),
  ).toBeVisible();
  await page.getByRole('button', { name: 'PT-BR', exact: true }).click();
  await page
    .getByRole('link', { name: /ACADEMICS & CERTS/ })
    .last()
    .click();
  await expect(page).toHaveURL('/academics');
  await expect(
    page.getByText('Pós-graduação em Engenharia de Software'),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollHeight),
  ).toBeLessThanOrEqual(1080);

  await page
    .getByRole('link', { name: /PROJECTS/ })
    .last()
    .click();
  await expect(page).toHaveURL('/projects');
  await page
    .getByRole('link', { name: /see project/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/projects\/1$/);
  await expect(page.getByText('PROJECT SPECIFICATION')).toBeVisible();
});

test('desktop overview uses two content columns with absolute sketch notes', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  const overview = page.locator('#overview');
  const columns = await overview.evaluate((element) =>
    getComputedStyle(element).gridTemplateColumns.split(' '),
  );
  expect(columns).toHaveLength(2);
  await expect(page.getByTestId('overview-sketch-notes')).toHaveCSS(
    'position',
    'absolute',
  );
});

test('intermediate desktop width keeps the tablet overview composition', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1100, height: 900 });
  await page.goto('/');

  const columns = await page.locator('#overview').evaluate((element) =>
    getComputedStyle(element).gridTemplateColumns.split(' '),
  );
  expect(columns).toHaveLength(1);
  await expect(
    page.getByRole('heading', { name: 'SELECTED STACK_' }),
  ).toBeVisible();
});

test('mobile shell exposes menu and the real 3D portrait', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const character = page.getByRole('img', {
    name: 'Personagem 3D de Jonatha Botelho',
  });
  await expect(character).toBeVisible();

  const menu = page.getByRole('button', { name: 'Menu', exact: true });
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(
    page.getByRole('link', { name: /PROJECTS/ }).first(),
  ).toBeVisible();
});

test('character study renders the final GLB viewer', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/character');
  await expect(
    page.getByRole('heading', { level: 1, name: 'CHARACTER STUDY' }),
  ).toBeVisible();
  await expect(
    page.getByRole('img', { name: 'Personagem 3D de Jonatha Botelho' }),
  ).toBeVisible();
  await expect(page.getByText('GLB / GLTF 2.0')).toBeVisible();
  await expect(
    page.getByRole('link', { name: /OVERVIEW \/ CHARACTER STUDY/ }),
  ).toHaveAttribute('href', '/');
  await expect(page.getByText('→ observe')).toHaveCount(0);

  const heading = page.getByTestId('character-heading');
  const viewer = page.getByTestId('character-viewer-column');
  expect((await heading.boundingBox())?.width).toBeGreaterThan(
    (await viewer.boundingBox())?.width ?? 0,
  );

  const specification = page.getByTestId('character-specification');
  await expect(specification).toHaveCSS('align-self', 'flex-start');
  await expect(specification).toHaveCSS(
    'background-color',
    'rgb(246, 243, 235)',
  );
  expect((await specification.boundingBox())?.height).toBeLessThan(620);
});
