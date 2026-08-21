import { test, expect } from '@playwright/test';

test('portfolio smoke: typing, theme, language, nav', async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/');

  // name types in
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'JONATHA MATHEWS',
    {
      timeout: 5000,
    },
  );

  // theme toggle flips <html data-theme>
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: /modo/i }).click();
  await expect(html).toHaveAttribute('data-theme', 'light');

  // language starts in English and can switch to Portuguese
  await expect(page.getByRole('link', { name: 'toolkit' })).toBeVisible();
  await page.getByRole('button', { name: 'PT', exact: true }).click();
  await expect(page.getByRole('link', { name: 'ferramentas' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'JONATHA BOTELHO',
  );

  const orderedSections = await page
    .locator('#experiencia, #formacao, #cursos, #projetos, #contato')
    .evaluateAll((sections) => sections.map((section) => section.id));
  expect(orderedSections).toEqual([
    'experiencia',
    'formacao',
    'cursos',
    'projetos',
    'contato',
  ]);

  // nav anchor works
  await page.getByRole('link', { name: 'projetos' }).click();
  await expect(page).toHaveURL(/#projetos/);
});
