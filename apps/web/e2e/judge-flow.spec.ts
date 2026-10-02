import { expect, test } from '@playwright/test';

test('judge can create a demo order and select included test data', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Every parcel right/i })).toBeVisible();
  await expect(page.getByText('A product your team can trust.', { exact: true })).toBeVisible();
  await expect(page.locator('.heroProduct img')).toBeVisible();
  await page.getByRole('button', { name: /Inspect a demo parcel/i }).click();
  await expect(page.getByText('Live judge workflow', { exact: true })).toBeVisible();
  await expect(page.getByText('Happy Birthday Ayesha')).toBeVisible();
  await expect(page.getByText('Realistic synthetic fixtures · no customer data')).toBeVisible();
  await expect(page.getByText(/Drop a clear packing photo/i)).toBeVisible();
  await page.getByRole('button', { name: /Wrong parcel/i }).click();
  await expect(page.getByText('parcelproof-wrong-parcel.webp')).toBeVisible();
});
