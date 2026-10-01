import { expect, test } from '@playwright/test';

test('judge can create a demo order and reach the private upload control', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Wrong parcel/i })).toBeVisible();
  await page.getByRole('button', { name: /Run the judge demo/i }).click();
  await expect(page.getByText('Live judge workflow', { exact: true })).toBeVisible();
  await expect(page.getByText('Happy Birthday Ayesha')).toBeVisible();
  await expect(page.getByText(/Drop a clear packing photo/i)).toBeVisible();
});
