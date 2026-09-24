/* Progressive presentation only: native Odhín remains the source of result data. */
(() => {
  const dashboard = document.querySelector('#TabDashboard > .container-fluid > .row');
  if (!dashboard) return;
  dashboard.classList.add('report-grid');
  document.body.classList.add('report-compact');
  const density = document.createElement('button');
  density.type = 'button';
  density.className = 'report-density';
  density.textContent = 'Compact view';
  density.setAttribute('aria-pressed', 'true');
  density.addEventListener('click', () => {
    const compact = document.body.classList.toggle('report-compact');
    density.setAttribute('aria-pressed', String(compact));
  });
  const reset = document.createElement('button');
  reset.type = 'button';
  reset.className = 'report-reset';
  reset.textContent = 'Reset layout';
  reset.addEventListener('click', () => {
    dashboard.querySelectorAll('.report-panel').forEach(panel => {
      panel.style.removeProperty('--panel-width');
      panel.style.removeProperty('--panel-height');
      panel.classList.remove('panel-sized', 'panel-expanded');
      const expand = panel.querySelector('.panel-expand');
      expand.setAttribute('aria-pressed', 'false');
      expand.setAttribute('aria-label', `Expand ${expand.dataset.title}`);
      expand.textContent = '↗';
    });
  });
  document.querySelector('.tab').append(density, reset);
  [...dashboard.children].find(panel => panel.querySelector('.info-box-header')?.textContent.trim() === 'Status by test file')?.remove();
  const cards = [...dashboard.children];
  cards.forEach((column, index) => {
    column.classList.add('report-panel');
    column.dataset.panel = index;
    const header = column.querySelector('.info-box-header');
    if (!header) return;
    const title = header.textContent.trim();
    const expand = document.createElement('button');
    expand.type = 'button';
    expand.dataset.title = title;
    expand.className = 'panel-expand';
    expand.textContent = '↗';
    expand.setAttribute('aria-label', `Expand ${title}`);
    expand.setAttribute('aria-pressed', 'false');
    expand.addEventListener('click', () => {
      const expanded = column.classList.toggle('panel-expanded');
      expand.setAttribute('aria-pressed', String(expanded));
      expand.setAttribute('aria-label', `${expanded ? 'Restore' : 'Expand'} ${title}`);
      expand.textContent = expanded ? '↙' : '↗';
    });
    header.append(expand);
    const resize = document.createElement('button');
    resize.type = 'button';
    resize.className = 'panel-resize';
    resize.textContent = '◢';
    resize.setAttribute('aria-label', `Resize ${title}`);
    resize.title = 'Drag to resize. Arrow keys adjust size; Home resets this panel.';
    const setSize = (width, height) => {
      column.classList.remove('panel-expanded');
      column.classList.add('panel-sized');
      expand.setAttribute('aria-pressed', 'false');
      expand.setAttribute('aria-label', `Expand ${title}`);
      expand.textContent = '↗';
      column.style.setProperty('--panel-width', `${Math.min(dashboard.clientWidth, Math.max(320, width))}px`);
      column.style.setProperty('--panel-height', `${Math.max(180, height)}px`);
    };
    resize.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      event.preventDefault();
      resize.focus();
      const start = column.getBoundingClientRect();
      const x = event.clientX;
      const y = event.clientY;
      resize.setPointerCapture(event.pointerId);
      document.body.classList.add('report-resizing');
      resize.onpointermove = move => setSize(start.width + move.clientX - x, start.height + move.clientY - y);
      resize.onlostpointercapture = () => {
        resize.onpointermove = null;
        document.body.classList.remove('report-resizing');
      };
    });
    resize.addEventListener('keydown', event => {
      if (event.key === 'Home') {
        column.style.removeProperty('--panel-width');
        column.style.removeProperty('--panel-height');
        column.classList.remove('panel-sized');
      } else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        const bounds = column.getBoundingClientRect();
        setSize(bounds.width + (event.key === 'ArrowRight' ? 24 : event.key === 'ArrowLeft' ? -24 : 0),
          bounds.height + (event.key === 'ArrowDown' ? 24 : event.key === 'ArrowUp' ? -24 : 0));
      } else return;
      event.preventDefault();
    });
    column.querySelector('.odhin-thin-border').append(resize);
  });

  const summary = document.querySelector('#chart-status')?.closest('.odhin-thin-border');
  if (summary) {
    const count = status => Number(summary.querySelector(`.chart-status-${status}-info`)?.textContent.trim() || 0);
    const passed = count('passed');
    const total = ['passed', 'failed', 'timedOut', 'skipped', 'interrupted', 'flaky']
      .reduce((sum, status) => sum + count(status), 0);
    const attention = count('failed') + count('timedOut') + count('interrupted') + count('flaky');
    const duration = cards[0]?.querySelector('tr:last-child td')?.textContent.trim() || '—';
    const metrics = document.createElement('section');
    metrics.className = 'report-metrics';
    metrics.setAttribute('aria-label', 'Run at a glance');
    [
      ['Tests in this run', String(total), 'Across all projects'],
      ['Pass rate', total ? `${Math.round(passed / total * 1000) / 10}%` : '—', `${passed} passed · ${count('skipped')} skipped`],
      ['Needs attention', String(attention), 'Failed · timed out · interrupted · flaky'],
      ['Execution time', duration, 'Total elapsed time']
    ].forEach(([label, value, detail], index) => {
      const metric = document.createElement('div');
      metric.className = `report-metric metric-${index}`;
      if (index === 2 && attention > 0) metric.classList.add('has-attention');
      [label, value, detail].forEach((text, part) => {
        const element = document.createElement(part === 1 ? 'strong' : 'span');
        element.textContent = text;
        metric.append(element);
      });
      metrics.append(metric);
    });
    dashboard.before(metrics);
  }

  // Make native div-based controls operable with the keyboard without replacing their handlers.
  [['#theme-toggle', 'Toggle colour theme'], ['.modal-info-btn', 'About this report']].forEach(([selector, label]) => {
    const control = document.querySelector(selector);
    if (!control) return;
    control.setAttribute('role', 'button');
    control.setAttribute('aria-label', label);
    control.tabIndex = 0;
    control.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        control.click();
      }
    });
  });
  document.querySelectorAll('#test-list-table .test-row-result').forEach(row => {
    const title = row.cells[0];
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'test-detail-link';
    button.setAttribute('aria-haspopup', 'dialog');
    button.append(...title.childNodes);
    title.append(button);
  });
  document.querySelectorAll('#TabDashboard .table-responsive').forEach(region => {
    region.tabIndex = 0;
    region.setAttribute('role', 'region');
    region.setAttribute('aria-label', 'Scrollable report table');
  });
})();

// Use the existing DataTables instance so filters compose with search, sorting and pagination.
$(document).ready(() => {
  const table = $('#test-list-table').DataTable();
  table.page.len(100).draw();
  // Keep detail navigation inside the filtered, sorted result set, including other pages.
  table.rows().nodes().toArray().forEach(row => {
    const modal = document.getElementById(row.dataset.bsTarget.slice(1));
    if (!modal) return;
    const navigation = document.createElement('nav');
    navigation.className = 'test-detail-navigation';
    navigation.setAttribute('aria-label', 'Test navigation');
    const back = document.createElement('button');
    back.type = 'button';
    back.textContent = '← Back to tests';
    back.dataset.bsDismiss = 'modal';
    const position = document.createElement('span');
    position.setAttribute('aria-live', 'polite');
    const previous = document.createElement('button');
    previous.type = 'button';
    previous.textContent = '← Previous test';
    const next = document.createElement('button');
    next.type = 'button';
    next.textContent = 'Next test →';
    let moving = false;
    const matchingRows = () => table.rows({ search: 'applied', order: 'applied' }).nodes().toArray();
    modal.addEventListener('show.bs.modal', () => {
      const rows = matchingRows();
      const index = rows.indexOf(row);
      position.textContent = `Test ${index + 1} of ${rows.length} matching tests`;
      previous.disabled = index <= 0;
      next.disabled = index === rows.length - 1;
    });
    modal.addEventListener('shown.bs.modal', () => back.focus());
    modal.addEventListener('hidden.bs.modal', () => {
      document.body.classList.remove('hide-scroll');
      if (moving) return;
      const index = matchingRows().indexOf(row);
      if (index >= 0 && table.page.len() > 0) table.page(Math.floor(index / table.page.len())).draw('page');
      row.querySelector('.test-detail-link').focus();
    });
    [previous, next].forEach((button, index) => button.addEventListener('click', () => {
      const rows = matchingRows();
      const target = rows[rows.indexOf(row) + (index === 0 ? -1 : 1)];
      if (!target) return;
      moving = true;
      modal.addEventListener('hidden.bs.modal', () => {
        moving = false;
        bootstrap.Modal.getOrCreateInstance(document.getElementById(target.dataset.bsTarget.slice(1))).show();
      }, { once: true });
      bootstrap.Modal.getOrCreateInstance(modal).hide();
    }));
    navigation.append(back, position, previous, next);
    modal.querySelector('.modal-content').prepend(navigation);
    modal.querySelector('.close-btn')?.remove();
  });
  const filters = document.createElement('div');
  filters.className = 'report-filters';
  filters.setAttribute('role', 'group');
  filters.setAttribute('aria-label', 'Filter tests');
  const selects = [];
  table.columns().every(function (index) {
    const name = this.header().textContent.trim();
    if (!['Status', 'Project', 'File', 'Feature', 'Tags', 'Attempt'].includes(name)) return;
    const label = document.createElement('label');
    label.textContent = name === 'File' ? 'Test file' : name;
    const select = document.createElement('select');
    select.setAttribute('aria-label', name === 'File' ? 'Test file' : name);
    select.dataset.filter = name;
    select.add(new Option(`All ${name === 'Status' ? 'statuses' : name.toLowerCase() + 's'}`, ''));
    const values = name === 'Status' ? ['passed', 'failed', 'timedOut', 'skipped', 'interrupted', 'flaky'] : [...new Set(this.nodes().toArray().flatMap(cell => name === 'Tags' ? cell.textContent.split(', ').filter(Boolean) : [cell.textContent.trim()]))].sort();
    values.filter(Boolean).forEach(value => select.add(new Option(value, value)));
    select.addEventListener('change', () => {
      const value = $.fn.dataTable.util.escapeRegex(select.value);
      const pattern = name === 'Tags' ? `(^|, )${value}(, |$)` : `^\\s*${value}\\s*$`;
      table.column(index).search(value ? pattern : '', true, false).draw();
    });
    selects.push(select);
    label.append(select);
    filters.append(label);
  });
  const durations = ['Min seconds', 'Max seconds'].map(name => {
    const label = document.createElement('label');
    label.textContent = name;
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.step = 'any';
    input.placeholder = 'Any duration';
    input.addEventListener('input', () => table.draw());
    label.append(input);
    filters.append(label);
    return input;
  });
  $.fn.dataTable.ext.search.push((settings, data, index) => {
    if (settings.nTable.id !== 'test-list-table') return true;
    const seconds = Number(table.row(index).node().dataset.durationMs) / 1000;
    return (!durations[0].value || seconds >= Number(durations[0].value)) &&
      (!durations[1].value || seconds <= Number(durations[1].value));
  });
  const clear = document.createElement('button');
  clear.type = 'button';
  clear.textContent = 'Clear filters';
  clear.addEventListener('click', () => {
    selects.forEach(select => { select.value = ''; });
    durations.forEach(input => { input.value = ''; });
    table.search('').columns().search('').draw();
  });
  filters.append(clear);
  document.querySelector('#test-list-table_wrapper').prepend(filters);
  const drillDown = (cell, field, value) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'report-drilldown';
    button.textContent = cell.textContent.trim();
    button.title = `Show tests: ${value}`;
    button.addEventListener('click', () => {
      clear.click();
      const select = selects.find(control => control.dataset.filter === field);
      select.value = value;
      select.dispatchEvent(new Event('change'));
      document.querySelector('.main-tablinks[onclick*="TabTests"]').click();
      select.focus();
    });
    cell.replaceChildren(button);
  };
  const featureColumn = table.columns().header().toArray().findIndex(header => header.textContent.trim() === 'Feature');
  document.querySelectorAll('#odhin-feature-summary tbody tr').forEach((row, index) => {
    const name = row.cells[0].textContent.trim();
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'feature-toggle';
    toggle.textContent = name;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', `feature-tests-${index}`);
    row.cells[0].replaceChildren(toggle);
    drillDown(row.cells[1], 'Feature', name);
    const details = document.createElement('tr');
    details.id = `feature-tests-${index}`;
    details.hidden = true;
    details.className = 'feature-tests';
    const cell = details.insertCell();
    cell.colSpan = row.cells.length;
    const list = document.createElement('ul');
    list.setAttribute('aria-label', `${name} tests`);
    table.rows().nodes().toArray().filter(test => test.cells[featureColumn].textContent.trim() === name).forEach(test => {
      const item = document.createElement('li');
      const link = document.createElement('button');
      link.type = 'button';
      link.className = 'test-detail-link';
      link.textContent = test.cells[0].textContent.trim();
      link.setAttribute('aria-haspopup', 'dialog');
      const modal = document.getElementById(test.dataset.bsTarget.slice(1));
      const openDetails = tab => {
        row.cells[1].querySelector('button').click();
        tab?.click();
        bootstrap.Modal.getOrCreateInstance(modal).show();
      };
      link.addEventListener('click', () => openDetails());
      const context = document.createElement('span');
      context.className = 'feature-test-summary';
      context.textContent = `${test.cells[1].textContent.trim()} · ${test.cells[2].textContent.trim()}`;
      const steps = document.createElement('button');
      steps.type = 'button';
      steps.className = 'feature-test-steps';
      steps.textContent = 'View steps';
      steps.addEventListener('click', () => openDetails([...modal.querySelectorAll('.result-tab-header button')].find(tab => tab.textContent.trim() === 'Steps')));
      item.append(link, context, steps);
      list.append(item);
    });
    cell.append(list);
    row.after(details);
    toggle.addEventListener('click', () => {
      details.hidden = !details.hidden;
      toggle.setAttribute('aria-expanded', String(!details.hidden));
    });
    const share = row.cells[row.cells.length - 1];
    share.classList.add('feature-share');
    share.style.setProperty('--feature-share', `${Math.min(100, Math.max(0, parseFloat(share.textContent) || 0))}%`);
  });
  ['passed', 'failed', 'timedOut', 'skipped', 'interrupted', 'flaky'].forEach(status => {
    const cell = document.querySelector(`#TabDashboard .chart-status-${status}`);
    if (cell) drillDown(cell, 'Status', status);
  });
  const styleCharts = () => {
    if (!window.Chart) return;
    const style = getComputedStyle(document.documentElement);
    Object.values(Chart.instances).forEach(chart => {
      const colors = chart.canvas.id === 'chart-status'
        ? chart.data.labels.map(label => {
          const name = label.split(' ')[0];
          const status = name[0].toLowerCase() + name.slice(1);
          return style.getPropertyValue(`--odhin-${status}-status-color`).trim();
        })
        : ['#7663e6', '#3f9cb2', '#bb72c5', '#538ad4'];
      chart.data.datasets[0].backgroundColor = colors;
      chart.data.datasets[0].borderWidth = 0;
      chart.options.cutoutPercentage = 74;
      chart.options.animation.duration = 0;
      chart.update(0);
    });
  };
  styleCharts();
  document.querySelector('#theme-toggle')?.addEventListener('click', styleCharts);
});
