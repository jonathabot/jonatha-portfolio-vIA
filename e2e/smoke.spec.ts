import { test, expect } from '@playwright/test';

test('portfolio smoke: typing, theme, language, nav', async ({ page }) => {
  await page.goto('/');

  // name types in
  await expect(page.getByRole('heading', { level: 1 })).toContainText('JONATHA BOTELHO', {
    timeout: 5000,
  });

  // theme toggle flips <html data-theme>
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: /modo/i }).click();
  await expect(html).toHaveAttribute('data-theme', 'dark');

  // language toggle switches a visible string (nav: ferramentas → toolkit)
  await expect(page.getByRole('link', { name: 'ferramentas' })).toBeVisible();
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.getByRole('link', { name: 'toolkit' })).toBeVisible();

  // nav anchor works
  await page.getByRole('link', { name: 'projects' }).click();
  await expect(page).toHaveURL(/#projetos/);
});
