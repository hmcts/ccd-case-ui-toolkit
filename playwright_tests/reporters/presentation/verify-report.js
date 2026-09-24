// Run with: playwright-cli run-code --filename playwright_tests/reporters/presentation/verify-report.js
// Open a freshly generated report first. This check does not change its saved data.
async page => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.reload();
  await page.locator('.report-metrics').waitFor();
  await page.locator('#loading').waitFor({ state: 'hidden' });
  for (const width of [2560, 1920, 1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (overflow) throw new Error(`Dashboard overflows at ${width}px`);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  const panel = page.locator('[data-panel="0"]');
  const neighbour = page.locator('[data-panel="1"]');
  await page.getByRole('button', { name: 'Resize Run info', exact: true }).scrollIntoViewIfNeeded();
  const before = await panel.boundingBox();
  const neighbourBefore = await neighbour.boundingBox();
  const grip = await page.getByRole('button', { name: 'Resize Run info', exact: true }).boundingBox();
  await page.mouse.move(grip.x + grip.width / 2, grip.y + grip.height / 2);
  await page.mouse.down();
  await page.mouse.move(grip.x + grip.width / 2 + 100, grip.y + grip.height / 2 + 60, { steps: 12 });
  await page.mouse.up();
  const after = await panel.boundingBox();
  const neighbourAfter = await neighbour.boundingBox();
  if (Math.abs(after.width - before.width - 100) > 3 || Math.abs(after.height - before.height - 60) > 3) throw new Error('Drag resize failed');
  if (Math.abs(neighbourBefore.width - neighbourAfter.width) < 3 && Math.abs(neighbourBefore.y - neighbourAfter.y) < 3) throw new Error('Neighbours did not adapt');
  await page.getByRole('button', { name: 'Resize Run info', exact: true }).focus();
  await page.keyboard.press('ArrowDown');
  if ((await panel.boundingBox()).height < after.height + 20) throw new Error('Keyboard resize failed');
  await page.getByRole('button', { name: 'Reset layout', exact: true }).click();
  if (await panel.evaluate(node => node.style.getPropertyValue('--panel-width'))) throw new Error('Reset layout failed');
  await page.getByRole('button', { name: 'Expand Run info', exact: true }).click();
  if (!await page.locator('[data-panel="0"]').evaluate(panel => panel.clientWidth > 1000)) {
    throw new Error('Panel did not expand');
  }
  await page.getByRole('button', { name: 'Restore Run info', exact: true }).click();
  const theme = page.getByRole('button', { name: 'Toggle colour theme' });
  await theme.focus();
  await page.keyboard.press('Enter');
  if (await page.locator('html').getAttribute('data-applied-mode') !== 'dark') throw new Error('Dark theme failed');
  await page.keyboard.press('Space');
  if (await page.locator('html').getAttribute('data-applied-mode') !== 'light') throw new Error('Light theme failed');
  // Controlled chart fixtures catch omitted zero-status slices without changing saved results.
  const originalLabels = await page.evaluate(() => {
    const chart = Object.values(Chart.instances).find(item => item.canvas.id === 'chart-status');
    const labels = chart.data.labels;
    chart.data.labels = ['Failed (1)'];
    return labels;
  });
  await theme.click();
  if (!await page.evaluate(() => {
    const chart = Object.values(Chart.instances).find(item => item.canvas.id === 'chart-status');
    return chart.data.datasets[0].backgroundColor[0] === getComputedStyle(document.documentElement).getPropertyValue('--odhin-failed-status-color').trim();
  })) throw new Error('Failed-only chart has wrong colour');
  await page.evaluate(() => { Object.values(Chart.instances).find(item => item.canvas.id === 'chart-status').data.labels = ['Passed (1)', 'Skipped (1)']; });
  await theme.click();
  if (!await page.evaluate(() => {
    const chart = Object.values(Chart.instances).find(item => item.canvas.id === 'chart-status');
    return chart.data.datasets[0].backgroundColor[1] === getComputedStyle(document.documentElement).getPropertyValue('--odhin-skipped-status-color').trim();
  })) throw new Error('Mixed chart has wrong colour');
  await page.evaluate(labels => { Object.values(Chart.instances).find(item => item.canvas.id === 'chart-status').data.labels = labels; }, originalLabels);
  await theme.click();
  await theme.click();
  const expectedTotal = Number(await page.locator('.metric-0 strong').textContent());
  await page.getByRole('button', { name: 'Tests', exact: true }).click();
  if (await page.locator('select[name=test-list-table_length]').inputValue() !== '100') throw new Error('Default page size must be 100');
  const status = page.getByLabel('Status', { exact: true });
  const statuses = await status.locator('option').evaluateAll(options => options.map(option => option.value).filter(Boolean));
  for (const value of statuses) {
    await status.selectOption(value);
    const actual = await page.locator('#test-list-table tbody tr td:nth-child(2)').allTextContents();
    if (actual.some(text => text.trim() !== value)) throw new Error(`Status filter failed: ${value}`);
  }
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
  const files = page.getByLabel('Test file', { exact: true });
  const filename = await files.locator('option').nth(1).getAttribute('value');
  await files.selectOption(filename);
  const project = page.getByLabel('Project', { exact: true });
  await project.selectOption({ index: 1 });
  const visibleRows = await page.locator('#test-list-table tbody tr').allTextContents();
  if (!visibleRows.length || visibleRows.some(text => !text.includes(filename))) throw new Error('Combined file/project filters failed');
  const feature = page.getByLabel('Feature', { exact: true });
  const featureName = await page.locator('#test-list-table tbody tr td:nth-child(6)').first().textContent();
  await feature.selectOption(featureName.trim());
  if (!await page.locator('#test-list-table tbody tr td:nth-child(6)').count()) throw new Error('Feature filter removed matching tests');
  await page.getByLabel('Min seconds', { exact: true }).fill('999999');
  await page.getByText('No matching records found', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
  const search = page.getByLabel('Search:', { exact: true });
  await search.fill('no-such-test-7d138');
  await page.getByText('No matching records found', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
  if (await search.inputValue() !== '') throw new Error('Clear did not reset search');
  if (!await page.locator('#test-list-table_info').textContent().then(text => text.includes(`of ${expectedTotal} entries`))) {
    throw new Error('Clear did not restore all tests');
  }
  await page.locator('.test-detail-link').first().focus();
  await page.keyboard.press('Enter');
  await page.locator('.modal.show').waitFor();
  await page.waitForFunction(() => document.activeElement?.textContent === '← Back to tests');
  const firstDetail = await page.locator('.modal.show').getAttribute('id');
  await page.locator('.modal.show').getByRole('button', { name: 'Next test →', exact: true }).click();
  await page.waitForFunction(id => document.querySelector('.modal.show')?.id !== id && document.activeElement?.textContent === '← Back to tests', firstDetail);
  await page.locator('.modal.show').getByRole('button', { name: '← Previous test', exact: true }).click();
  await page.waitForFunction(id => document.querySelector('.modal.show')?.id === id && document.activeElement?.textContent === '← Back to tests', firstDetail);
  await page.locator('.modal.show').getByRole('button', { name: '← Back to tests', exact: true }).click();
  await page.locator('.modal.show').waitFor({ state: 'hidden' });
  await page.waitForFunction(() => document.activeElement?.classList.contains('test-detail-link'));
  await page.locator('.test-detail-link').first().press('Enter');
  await page.waitForFunction(() => document.activeElement?.textContent === '← Back to tests');
  await page.keyboard.press('Escape');
  await page.locator('.modal.show').waitFor({ state: 'hidden' });
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error(`Tests overflow at ${width}px`);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole('button', { name: 'Dashboard', exact: true }).click();
  await page.locator('#odhin-feature-summary .report-drilldown').first().click();
  if (!await page.getByLabel('Feature', { exact: true }).inputValue()) throw new Error('Feature drill-down failed');
  await page.getByRole('button', { name: 'Dashboard', exact: true }).click();
  await page.locator('.chart-status-failed .report-drilldown').click();
  if (await page.getByLabel('Status', { exact: true }).inputValue() !== 'failed') throw new Error('Status drill-down failed');
  await page.getByRole('button', { name: 'Perfetto Results', exact: true }).click();
  const timeline = page.locator('#TabPerfetto a').first();
  await timeline.waitFor();
  const response = await page.request.get(await timeline.evaluate(link => link.href));
  if (!response.ok()) throw new Error('Perfetto artifact unavailable');
  const trace = await response.json();
  if (!trace.traceEvents && !Array.isArray(trace)) throw new Error('Invalid Perfetto artifact');
  await page.getByRole('button', { name: 'Dashboard', exact: true }).click();
  if (errors.length) throw new Error(errors.join('\n'));
  return 'Passed: full-width/mobile layout, pointer/keyboard resize with neighbour reflow, reset, themes, filters, drill-downs, test details and Perfetto.';
}
