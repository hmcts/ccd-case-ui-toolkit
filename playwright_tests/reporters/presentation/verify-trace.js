// Run with playwright-cli run-code --filename after opening a report generated with --trace on.
async page => {
  await page.reload();
  await page.locator('#loading').waitFor({ state: 'hidden' });
  await page.locator('.main-tablinks[onclick*="TabTests"]').click();
  await page.locator('#test-list-table .test-detail-link').first().click();
  const modal = page.locator('.modal.show');
  await modal.getByRole('button', { name: 'Trace', exact: true }).click();
  const panel = modal.locator('[id^="TabTrace-"]');
  const download = panel.locator('a[download]');
  const open = panel.getByRole('link', { name: 'Open in Playwright Trace Viewer' });
  const trace = await download.evaluate(node => node.href);
  const viewer = await open.getAttribute('href');
  if (await open.evaluate(node => new URL(node.href).searchParams.get('trace')) !== (/^https?:/.test(trace) ? trace : null)) throw new Error('Wrong trace deep-link');
  await page.context().route('https://trace.playwright.dev/**', route => route.fulfill({ contentType: 'text/html', body: '<h1>Viewer navigation verified</h1>' }));
  const popupPromise = page.waitForEvent('popup');
  await open.click();
  const popup = await popupPromise;
  await popup.waitForLoadState();
  if (popup.url() !== viewer || await popup.evaluate(() => Boolean(window.opener))) throw new Error('Unsafe or incorrect viewer navigation');
  await popup.close();
  const downloadPromise = page.waitForEvent('download');
  await download.click();
  const artifact = await downloadPromise;
  if (await artifact.failure()) throw new Error('Trace download failed');
  if (!artifact.suggestedFilename()) throw new Error('Trace download filename is missing');
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    if (await panel.evaluate(node => node.scrollWidth > node.clientWidth)) throw new Error(`Trace controls overflow at ${width}px`);
  }
  await page.context().unroute('https://trace.playwright.dev/**');
  return 'Trace download, encoded deep-link, new-tab isolation and mobile controls passed. External viewer navigation was intercepted; CORS/auth access is host-dependent.';
}
