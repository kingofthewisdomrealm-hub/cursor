import {
  loadState,
  addIncome,
  addExpense,
  updateExpense,
  updateSettings,
  CATEGORIES,
  PAYMENT_METHODS,
  INCOME_SOURCES,
} from './store.js';

import {
  formatCurrency,
  formatDate,
  getTotalIncome,
  getTotalExpenses,
  getPossibleDeductions,
  getEstimatedTaxableProfit,
  getEstimatedTaxReserve,
  getUnclassifiedExpenses,
  getDocStatus,
  getMissingReceiptsCount,
  getPreparationScore,
  getMonthlyChartData,
  filterTransactions,
  exportToCSV,
  getUniqueClients,
  getAvailableYears,
} from './logic.js';

let state = loadState();
let currentView = 'dashboard';
let reportFilters = {};

const VIEW_META = {
  dashboard: { title: 'Panel Principal', subtitle: 'Centro de control financiero' },
  income: { title: 'Registrar Ingreso', subtitle: 'Capture sus entradas de dinero' },
  expense: { title: 'Registrar Gasto', subtitle: 'Documente cada egreso' },
  sifting: { title: 'Motor SIFTING Fiscal', subtitle: 'Clasifique sus gastos pendientes' },
  documentation: { title: 'Estado de Documentación', subtitle: 'Revise el estado de cada gasto' },
  calculator: { title: 'Calculadora de Reserva Fiscal', subtitle: 'Estime su reserva de impuestos' },
  reports: { title: 'Reportes', subtitle: 'Filtre y exporte sus datos' },
  score: { title: 'Puntuación de Preparación Fiscal', subtitle: 'Mida su nivel de organización' },
};

const MONTHS = [
  { value: '', label: 'Todos los meses' },
  { value: '1', label: 'Enero' }, { value: '2', label: 'Febrero' }, { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' }, { value: '5', label: 'Mayo' }, { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' }, { value: '8', label: 'Agosto' }, { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' }, { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' },
];

const DOC_STATUSES = [
  { value: '', label: 'Todos los estados' },
  { value: 'ready', label: 'Listo para revisión' },
  { value: 'missing-receipt', label: 'Falta recibo' },
  { value: 'missing-purpose', label: 'Falta propósito comercial' },
  { value: 'needs-clarification', label: 'Necesita aclaración' },
  { value: 'personal', label: 'Gasto personal' },
];

function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }

function showToast(message, type = 'success') {
  const container = $('#toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function openModal(title, html) {
  $('#modal-title').textContent = title;
  $('#modal-body').innerHTML = html;
  $('#modal').hidden = false;
}

function closeModal() {
  $('#modal').hidden = true;
}

function navigate(view) {
  currentView = view;
  $$('.nav-item').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });
  const meta = VIEW_META[view];
  $('#view-title').textContent = meta.title;
  $('#view-subtitle').textContent = meta.subtitle;
  render();
  closeSidebar();
}

function closeSidebar() {
  $('#sidebar').classList.remove('open');
  $('#overlay').classList.remove('visible');
}

function updateSiftingBadge() {
  const count = getUnclassifiedExpenses(state.expenses).length;
  const badge = $('#sifting-badge');
  if (count > 0) {
    badge.textContent = count;
    badge.hidden = false;
  } else {
    badge.hidden = true;
  }
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ data: reader.result, name: file.name });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ─── Dashboard ─── */
function renderDashboard() {
  const totalIncome = getTotalIncome(state.incomes);
  const totalExpenses = getTotalExpenses(state.expenses);
  const deductions = getPossibleDeductions(state.expenses);
  const profit = getEstimatedTaxableProfit(state.incomes, state.expenses);
  const reserve = getEstimatedTaxReserve(state.incomes, state.expenses, state.settings.taxPercentage);
  const missingReceipts = getMissingReceiptsCount(state.expenses);
  const chartData = getMonthlyChartData(state.incomes, state.expenses);
  const maxVal = Math.max(...chartData.flatMap((d) => [d.income, d.expense]), 1);
  const score = getPreparationScore(state.incomes, state.expenses);

  return `
    <div class="grid grid-3 mb-1">
      <div class="card card-hero income">
        <div class="card-label">Ingresos totales</div>
        <div class="card-value income">${formatCurrency(totalIncome)}</div>
      </div>
      <div class="card card-hero expense">
        <div class="card-label">Gastos totales</div>
        <div class="card-value expense">${formatCurrency(totalExpenses)}</div>
      </div>
      <div class="card card-hero deduction">
        <div class="card-label">Posibles deducciones de negocio</div>
        <div class="card-value deduction">${formatCurrency(deductions)}</div>
        <div class="card-hint">No constituye asesoría fiscal</div>
      </div>
    </div>
    <div class="grid grid-3 mb-1">
      <div class="card card-hero profit">
        <div class="card-label">Ganancia imponible estimada</div>
        <div class="card-value profit">${formatCurrency(profit)}</div>
        <div class="card-hint">Ingresos − posibles deducciones</div>
      </div>
      <div class="card card-hero reserve">
        <div class="card-label">Reserva fiscal estimada</div>
        <div class="card-value reserve">${formatCurrency(reserve)}</div>
        <div class="card-hint">Al ${state.settings.taxPercentage}% · Consulte con un profesional</div>
      </div>
      <div class="card card-hero warning">
        <div class="card-label">Recibos faltantes</div>
        <div class="card-value warning">${missingReceipts}</div>
        <div class="card-hint">Gastos de negocio sin recibo adjunto</div>
      </div>
    </div>

    <div class="grid grid-2 mt-2">
      <div class="card chart-card">
        <div class="section-title">Flujo mensual <span>últimos 6 meses</span></div>
        ${chartData.every((d) => d.income === 0 && d.expense === 0)
          ? '<div class="empty-state"><div class="icon">📊</div><p>Sin datos aún</p></div>'
          : `<div class="chart-bars">
              ${chartData.map((d) => `
                <div class="chart-bar-group">
                  <div class="chart-bar-wrap">
                    <div class="chart-bar income" style="height:${(d.income / maxVal) * 100}%"></div>
                  </div>
                  <div class="chart-bar-wrap">
                    <div class="chart-bar expense" style="height:${(d.expense / maxVal) * 100}%"></div>
                  </div>
                  <div class="chart-label">${d.label}</div>
                </div>
              `).join('')}
            </div>
            <div class="flex-between mt-1" style="font-size:0.78rem;color:var(--text-muted)">
              <span><span style="color:var(--income)">■</span> Ingresos</span>
              <span><span style="color:var(--expense)">■</span> Gastos</span>
            </div>`
        }
      </div>
      <div class="card">
        <div class="section-title">Puntuación de Preparación Fiscal</div>
        <div class="flex-between mb-1">
          <span style="font-size:2rem;font-weight:700;font-family:var(--mono);color:var(--accent)">${score.total}%</span>
          <button class="btn btn-secondary btn-sm" data-nav="score">Ver detalle →</button>
        </div>
        <div class="progress-bar"><div class="progress-fill accent" style="width:${score.total}%"></div></div>
        <p class="card-hint mt-1">${score.recommendations[0]}</p>
      </div>
    </div>

    <p class="legal-note mt-2">Esta herramienta ofrece estimaciones orientativas. No sustituye la asesoría de un profesional de impuestos.</p>
  `;
}

/* ─── Income Form ─── */
function renderIncomeForm() {
  const today = new Date().toISOString().slice(0, 10);
  return `
    <div class="card form-card">
      <form id="income-form" class="form-grid">
        <div class="form-row-2">
          <div class="field">
            <label for="income-amount">Monto *</label>
            <input type="number" id="income-amount" name="amount" min="0" step="0.01" required placeholder="0.00">
          </div>
          <div class="field">
            <label for="income-date">Fecha *</label>
            <input type="date" id="income-date" name="date" value="${today}" required>
          </div>
        </div>
        <div class="field">
          <label for="income-source">Fuente del ingreso *</label>
          <select id="income-source" name="source" required>
            <option value="">Seleccionar...</option>
            ${INCOME_SOURCES.map((s) => `<option value="${s}">${s}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label for="income-client">Cliente o proyecto</label>
          <input type="text" id="income-client" name="clientProject" placeholder="Ej. Proyecto Web ABC">
        </div>
        <div class="field">
          <label for="income-payment">Método de pago</label>
          <select id="income-payment" name="paymentMethod">
            <option value="">Seleccionar...</option>
            ${PAYMENT_METHODS.map((m) => `<option value="${m}">${m}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label for="income-notes">Notas</label>
          <textarea id="income-notes" name="notes" placeholder="Detalles adicionales..."></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Registrar ingreso</button>
      </form>
    </div>
    ${renderRecentIncomes()}
  `;
}

function renderRecentIncomes() {
  if (state.incomes.length === 0) return '';
  const recent = [...state.incomes].reverse().slice(0, 5);
  return `
    <div class="mt-2">
      <div class="section-title">Ingresos recientes</div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Fecha</th><th>Fuente</th><th>Cliente</th><th>Monto</th></tr></thead>
          <tbody>
            ${recent.map((i) => `
              <tr>
                <td>${formatDate(i.date)}</td>
                <td>${i.source}</td>
                <td>${i.clientProject || '—'}</td>
                <td class="amount" style="color:var(--income)">${formatCurrency(i.amount)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/* ─── Expense Form ─── */
function renderExpenseForm() {
  const today = new Date().toISOString().slice(0, 10);
  return `
    <div class="card form-card">
      <form id="expense-form" class="form-grid">
        <div class="form-row-2">
          <div class="field">
            <label for="expense-amount">Monto *</label>
            <input type="number" id="expense-amount" name="amount" min="0" step="0.01" required placeholder="0.00">
          </div>
          <div class="field">
            <label for="expense-date">Fecha *</label>
            <input type="date" id="expense-date" name="date" value="${today}" required>
          </div>
        </div>
        <div class="field">
          <label for="expense-merchant">Comercio o proveedor *</label>
          <input type="text" id="expense-merchant" name="merchant" required placeholder="Ej. Amazon, Office Depot">
        </div>
        <div class="form-row-2">
          <div class="field">
            <label for="expense-category">Categoría *</label>
            <select id="expense-category" name="category" required>
              <option value="">Seleccionar...</option>
              ${CATEGORIES.map((c) => `<option value="${c}">${c}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label for="expense-commercial-pct">% uso comercial</label>
            <input type="number" id="expense-commercial-pct" name="commercialUsePercent" min="0" max="100" value="100" placeholder="100">
            <div class="field-hint">Para gastos mixtos, ajuste después en SIFTING</div>
          </div>
        </div>
        <div class="field">
          <label for="expense-purpose">Propósito comercial</label>
          <input type="text" id="expense-purpose" name="commercialPurpose" placeholder="Ej. Software para diseño de cliente X">
        </div>
        <div class="field">
          <label for="expense-client">Cliente o proyecto relacionado</label>
          <input type="text" id="expense-client" name="clientProject" placeholder="Ej. Proyecto Web ABC">
        </div>
        <div class="field">
          <label for="expense-receipt">Subir recibo</label>
          <input type="file" id="expense-receipt" name="receipt" accept="image/*,.pdf">
          <div class="field-hint">Imagen o PDF (máx. 2 MB)</div>
          <div id="receipt-preview"></div>
        </div>
        <div class="field">
          <label for="expense-notes">Notas</label>
          <textarea id="expense-notes" name="notes" placeholder="Detalles adicionales..."></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Registrar gasto</button>
      </form>
      <p class="legal-note">Los montos registrados son posibles deducciones hasta que un profesional de impuestos los valide.</p>
    </div>
    ${renderRecentExpenses()}
  `;
}

function renderRecentExpenses() {
  if (state.expenses.length === 0) return '';
  const recent = [...state.expenses].reverse().slice(0, 5);
  return `
    <div class="mt-2">
      <div class="section-title">Gastos recientes</div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Fecha</th><th>Comercio</th><th>Categoría</th><th>Estado</th><th>Monto</th></tr></thead>
          <tbody>
            ${recent.map((e) => {
              const status = getDocStatus(e);
              return `
                <tr>
                  <td>${formatDate(e.date)}</td>
                  <td>${e.merchant}</td>
                  <td>${e.category}</td>
                  <td><span class="status-badge status-${status.key}">${status.label}</span></td>
                  <td class="amount" style="color:var(--expense)">${formatCurrency(e.amount)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/* ─── SIFTING ─── */
function renderSifting() {
  const unclassified = getUnclassifiedExpenses(state.expenses);
  if (unclassified.length === 0) {
    return `
      <div class="card empty-state">
        <div class="icon">✓</div>
        <h3>¡Todo clasificado!</h3>
        <p>No hay gastos pendientes de clasificar. Registre nuevos gastos para continuar.</p>
        <button class="btn btn-primary mt-1" data-nav="expense">Registrar gasto</button>
      </div>
    `;
  }

  return `
    <p class="card-hint mb-1">Clasifique cada gasto para determinar posibles deducciones. Consulte con un profesional de impuestos.</p>
    ${unclassified.map((e) => `
      <div class="card sifting-card" data-expense-id="${e.id}">
        <div class="sifting-amount">${formatCurrency(e.amount)}</div>
        <div style="font-size:0.95rem;color:var(--text-muted)">${formatDate(e.date)} · ${e.merchant}</div>
        <div class="sifting-meta">
          <span>Categoría: <strong>${e.category}</strong></span>
          ${e.commercialPurpose ? `<span>Propósito: <strong>${e.commercialPurpose}</strong></span>` : ''}
          ${e.clientProject ? `<span>Proyecto: <strong>${e.clientProject}</strong></span>` : ''}
          ${e.receiptData ? '<span>📎 Recibo adjunto</span>' : '<span style="color:var(--warning)">Sin recibo</span>'}
        </div>
        <div class="btn-group">
          <button class="btn btn-business" data-classify="business" data-id="${e.id}">Negocio</button>
          <button class="btn btn-personal" data-classify="personal" data-id="${e.id}">Personal</button>
          <button class="btn btn-mixed" data-classify="mixed" data-id="${e.id}">Mixto</button>
          <button class="btn btn-unsure" data-classify="unsure" data-id="${e.id}">No estoy seguro</button>
        </div>
        <div class="mixed-input" id="mixed-${e.id}" hidden>
          <div class="field">
            <label>¿Cuál porcentaje fue utilizado para fines comerciales?</label>
            <input type="number" min="1" max="99" placeholder="Ej. 60" data-mixed-pct="${e.id}">
          </div>
          <button class="btn btn-mixed btn-sm mt-1" data-confirm-mixed="${e.id}">Confirmar porcentaje</button>
        </div>
      </div>
    `).join('')}
  `;
}

/* ─── Documentation ─── */
function renderDocumentation() {
  if (state.expenses.length === 0) {
    return `
      <div class="card empty-state">
        <div class="icon">📋</div>
        <h3>Sin gastos registrados</h3>
        <p>Registre gastos para ver su estado de documentación.</p>
      </div>
    `;
  }

  const grouped = {
    ready: [], 'missing-receipt': [], 'missing-purpose': [],
    'needs-clarification': [], personal: [],
  };

  state.expenses.forEach((e) => {
    const status = getDocStatus(e);
    grouped[status.key].push(e);
  });

  const sections = [
    { key: 'ready', label: 'Listo para revisión', icon: '✓' },
    { key: 'missing-receipt', label: 'Falta recibo', icon: '📎' },
    { key: 'missing-purpose', label: 'Falta propósito comercial', icon: '📝' },
    { key: 'needs-clarification', label: 'Necesita aclaración', icon: '?' },
    { key: 'personal', label: 'Gasto personal', icon: '—' },
  ];

  return sections.map((sec) => {
    const items = grouped[sec.key];
    if (items.length === 0) return '';
    return `
      <div class="mb-1">
        <div class="section-title">
          <span class="status-badge status-${sec.key}">${sec.icon} ${sec.label}</span>
          <span>${items.length}</span>
        </div>
        <div class="grid grid-2">
          ${items.map((e) => `
            <div class="card">
              <div class="flex-between">
                <strong>${e.merchant}</strong>
                <span class="amount" style="color:var(--expense)">${formatCurrency(e.amount)}</span>
              </div>
              <div class="card-hint">${formatDate(e.date)} · ${e.category}</div>
              ${!e.receiptData && sec.key === 'missing-receipt'
                ? '<button class="btn btn-secondary btn-sm mt-1" data-upload-receipt="' + e.id + '">Subir recibo</button>'
                : ''}
              ${!e.commercialPurpose?.trim() && sec.key === 'missing-purpose'
                ? '<button class="btn btn-secondary btn-sm mt-1" data-add-purpose="' + e.id + '">Agregar propósito</button>'
                : ''}
              ${sec.key === 'needs-clarification'
                ? '<button class="btn btn-secondary btn-sm mt-1" data-nav="sifting">Clasificar en SIFTING</button>'
                : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

/* ─── Calculator ─── */
function renderCalculator() {
  const deductions = getPossibleDeductions(state.expenses);
  const totalIncome = getTotalIncome(state.incomes);
  const profit = getEstimatedTaxableProfit(state.incomes, state.expenses);
  const reserve = getEstimatedTaxReserve(state.incomes, state.expenses, state.settings.taxPercentage);

  return `
    <div class="grid grid-2">
      <div class="card">
        <div class="section-title">Porcentaje estimado de impuestos</div>
        <div class="calculator-slider">
          <div class="slider-value" id="tax-display">${state.settings.taxPercentage}%</div>
          <input type="range" id="tax-slider" min="10" max="45" step="1" value="${state.settings.taxPercentage}">
          <div class="flex-between" style="font-size:0.78rem;color:var(--text-dim)">
            <span>10%</span><span>45%</span>
          </div>
        </div>
        <div class="formula-box">
          <p><strong>Ganancia imponible estimada</strong></p>
          <code>${formatCurrency(totalIncome)} − ${formatCurrency(deductions)} = ${formatCurrency(profit)}</code>
          <p class="mt-1"><strong>Reserva fiscal estimada</strong></p>
          <code>${formatCurrency(profit)} × ${state.settings.taxPercentage}% = ${formatCurrency(reserve)}</code>
        </div>
        <p class="legal-note">Estas cifras son estimaciones. Consulte con un profesional de impuestos para determinar su tasa real.</p>
      </div>
      <div class="card">
        <div class="section-title">Desglose</div>
        <div class="progress-section">
          <div class="progress-header">
            <span class="progress-label">Ingresos totales</span>
            <span class="progress-value">${formatCurrency(totalIncome)}</span>
          </div>
        </div>
        <div class="progress-section">
          <div class="progress-header">
            <span class="progress-label">Posibles deducciones</span>
            <span class="progress-value" style="color:var(--accent)">− ${formatCurrency(deductions)}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill accent" style="width:${totalIncome ? (deductions / totalIncome) * 100 : 0}%"></div>
          </div>
        </div>
        <div class="progress-section">
          <div class="progress-header">
            <span class="progress-label">Ganancia imponible estimada</span>
            <span class="progress-value" style="color:var(--info)">${formatCurrency(profit)}</span>
          </div>
        </div>
        <div class="card card-hero reserve mt-1" style="border:none;background:var(--bg)">
          <div class="card-label">Reserva fiscal estimada</div>
          <div class="card-value reserve">${formatCurrency(reserve)}</div>
        </div>
      </div>
    </div>
  `;
}

/* ─── Reports ─── */
function renderReports() {
  const years = getAvailableYears(state.incomes, state.expenses);
  const clients = getUniqueClients(state.incomes, state.expenses);
  const filtered = filterTransactions(state.incomes, state.expenses, reportFilters);
  const totalRows = filtered.incomes.length + filtered.expenses.length;

  return `
    <div class="filters" id="report-filters">
      <div class="field">
        <label>Año</label>
        <select name="year">
          <option value="">Todos</option>
          ${years.map((y) => `<option value="${y}" ${reportFilters.year == y ? 'selected' : ''}>${y}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label>Mes</label>
        <select name="month">
          ${MONTHS.map((m) => `<option value="${m.value}" ${reportFilters.month == m.value ? 'selected' : ''}>${m.label}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label>Categoría</label>
        <select name="category">
          <option value="">Todas</option>
          ${CATEGORIES.map((c) => `<option value="${c}" ${reportFilters.category === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label>Cliente / Proyecto</label>
        <select name="client">
          <option value="">Todos</option>
          ${clients.map((c) => `<option value="${c}" ${reportFilters.client === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label>Estado documentación</label>
        <select name="docStatus">
          ${DOC_STATUSES.map((s) => `<option value="${s.value}" ${reportFilters.docStatus === s.value ? 'selected' : ''}>${s.label}</option>`).join('')}
        </select>
      </div>
      <div class="field" style="align-self:flex-end">
        <button class="btn btn-primary btn-sm" id="export-csv" ${totalRows === 0 ? 'disabled' : ''}>Exportar CSV</button>
      </div>
    </div>

    <div class="flex-between mb-1">
      <span style="color:var(--text-muted);font-size:0.88rem">${totalRows} transacciones encontradas</span>
      <span style="font-family:var(--mono);font-size:0.88rem">
        Ingresos: <span style="color:var(--income)">${formatCurrency(getTotalIncome(filtered.incomes))}</span> ·
        Gastos: <span style="color:var(--expense)">${formatCurrency(getTotalExpenses(filtered.expenses))}</span>
      </span>
    </div>

    ${totalRows === 0
      ? '<div class="card empty-state"><div class="icon">🔍</div><h3>Sin resultados</h3><p>Ajuste los filtros o registre transacciones.</p></div>'
      : `<div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tipo</th><th>Fecha</th><th>Descripción</th><th>Categoría</th>
                <th>Cliente</th><th>Clasificación</th><th>Estado</th><th>Monto</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.incomes.map((i) => `
                <tr>
                  <td><span class="status-badge status-ready">Ingreso</span></td>
                  <td>${formatDate(i.date)}</td>
                  <td>${i.source}</td>
                  <td>—</td>
                  <td>${i.clientProject || '—'}</td>
                  <td>—</td>
                  <td>—</td>
                  <td class="amount" style="color:var(--income)">${formatCurrency(i.amount)}</td>
                </tr>
              `).join('')}
              ${filtered.expenses.map((e) => {
                const status = getDocStatus(e);
                const classLabels = { business: 'Negocio', personal: 'Personal', mixed: 'Mixto', unsure: 'No seguro' };
                return `
                  <tr>
                    <td><span class="status-badge status-missing-receipt">Gasto</span></td>
                    <td>${formatDate(e.date)}</td>
                    <td>${e.merchant}</td>
                    <td>${e.category}</td>
                    <td>${e.clientProject || '—'}</td>
                    <td>${e.classification ? classLabels[e.classification] || e.classification : '—'}</td>
                    <td><span class="status-badge status-${status.key}">${status.label}</span></td>
                    <td class="amount" style="color:var(--expense)">${formatCurrency(e.amount)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>`
    }
  `;
}

/* ─── Score ─── */
function renderScore() {
  const score = getPreparationScore(state.incomes, state.expenses);
  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (score.total / 100) * circumference;

  return `
    <div class="grid grid-2">
      <div class="card score-hero">
        <svg width="0" height="0">
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#3dd6c3"/>
              <stop offset="100%" stop-color="#a78bfa"/>
            </linearGradient>
          </defs>
        </svg>
        <div class="score-ring-wrap">
          <svg class="score-ring" width="180" height="180" viewBox="0 0 180 180">
            <circle class="score-ring-bg" cx="90" cy="90" r="80"/>
            <circle class="score-ring-fill" cx="90" cy="90" r="80"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${offset}"/>
          </svg>
          <div class="score-number">
            <span class="value">${score.total}</span>
            <span class="label">de 100</span>
          </div>
        </div>
        <h3>Puntuación de Preparación Fiscal</h3>
        <p class="card-hint">Mide qué tan organizada está su información para la temporada fiscal</p>
      </div>
      <div class="card">
        <div class="section-title">Factores de puntuación</div>
        ${[
          { key: 'receipts', label: 'Recibos adjuntos', color: 'income' },
          { key: 'classified', label: 'Gastos clasificados', color: 'accent' },
          { key: 'complete', label: 'Información completa', color: 'info' },
          { key: 'documented', label: 'Transacciones documentadas', color: 'warning' },
        ].map((f) => `
          <div class="progress-section">
            <div class="progress-header">
              <span class="progress-label">${f.label}</span>
              <span class="progress-value">${score.factors[f.key]}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill ${f.color}" style="width:${score.factors[f.key]}%"></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="card mt-1">
      <div class="section-title">Recomendaciones</div>
      ${score.recommendations.map((r) => `
        <div class="recommendation">
          <div class="recommendation-icon">→</div>
          <span>${r}</span>
        </div>
      `).join('')}
      <p class="legal-note">Esta puntuación es orientativa. Consulte con un profesional de impuestos para una evaluación completa.</p>
    </div>
  `;
}

/* ─── Render & Events ─── */
function render() {
  const content = $('#content');
  const views = {
    dashboard: renderDashboard,
    income: renderIncomeForm,
    expense: renderExpenseForm,
    sifting: renderSifting,
    documentation: renderDocumentation,
    calculator: renderCalculator,
    reports: renderReports,
    score: renderScore,
  };
  content.innerHTML = views[currentView]();
  updateSiftingBadge();
  bindViewEvents();
}

function bindViewEvents() {
  const incomeForm = $('#income-form');
  if (incomeForm) {
    incomeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(incomeForm);
      addIncome(state, {
        amount: Number(fd.get('amount')),
        date: fd.get('date'),
        source: fd.get('source'),
        clientProject: fd.get('clientProject') || '',
        paymentMethod: fd.get('paymentMethod') || '',
        notes: fd.get('notes') || '',
      });
      showToast('Ingreso registrado correctamente');
      incomeForm.reset();
      $('#income-date').value = new Date().toISOString().slice(0, 10);
      render();
    });
  }

  const expenseForm = $('#expense-form');
  if (expenseForm) {
    const receiptInput = $('#expense-receipt');
    if (receiptInput) {
      receiptInput.addEventListener('change', async () => {
        const file = receiptInput.files[0];
        const preview = $('#receipt-preview');
        if (!file) { preview.innerHTML = ''; return; }
        if (file.size > 2 * 1024 * 1024) {
          showToast('El archivo excede 2 MB', 'error');
          receiptInput.value = '';
          return;
        }
        preview.innerHTML = `<div class="receipt-preview">📎 ${file.name}</div>`;
      });
    }

    expenseForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(expenseForm);
      let receiptData = null;
      let receiptName = null;
      const file = receiptInput?.files[0];
      if (file) {
        const result = await readFileAsBase64(file);
        receiptData = result.data;
        receiptName = result.name;
      }
      addExpense(state, {
        amount: Number(fd.get('amount')),
        date: fd.get('date'),
        merchant: fd.get('merchant'),
        category: fd.get('category'),
        commercialPurpose: fd.get('commercialPurpose') || '',
        clientProject: fd.get('clientProject') || '',
        commercialUsePercent: Number(fd.get('commercialUsePercent')) || 100,
        notes: fd.get('notes') || '',
        receiptData,
        receiptName,
      });
      showToast('Gasto registrado — clasifíquelo en SIFTING');
      expenseForm.reset();
      $('#expense-date').value = new Date().toISOString().slice(0, 10);
      $('#expense-commercial-pct').value = 100;
      $('#receipt-preview').innerHTML = '';
      render();
    });
  }

  $$('[data-classify]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const classification = btn.dataset.classify;
      if (classification === 'mixed') {
        const mixedEl = $(`#mixed-${id}`);
        mixedEl.hidden = false;
        return;
      }
      updateExpense(state, id, { classification });
      showToast(`Gasto clasificado como ${classification === 'business' ? 'Negocio' : classification === 'personal' ? 'Personal' : 'No seguro'}`);
      render();
    });
  });

  $$('[data-confirm-mixed]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.confirmMixed;
      const input = $(`[data-mixed-pct="${id}"]`);
      const pct = Number(input.value);
      if (!pct || pct < 1 || pct > 99) {
        showToast('Ingrese un porcentaje entre 1 y 99', 'error');
        return;
      }
      updateExpense(state, id, { classification: 'mixed', mixedCommercialPercent: pct });
      showToast(`Gasto mixto: ${pct}% uso comercial`);
      render();
    });
  });

  const taxSlider = $('#tax-slider');
  if (taxSlider) {
    taxSlider.addEventListener('input', () => {
      const val = Number(taxSlider.value);
      updateSettings(state, { taxPercentage: val });
      $('#tax-display').textContent = `${val}%`;
      render();
    });
  }

  const filtersEl = $('#report-filters');
  if (filtersEl) {
    filtersEl.querySelectorAll('select').forEach((sel) => {
      sel.addEventListener('change', () => {
        reportFilters = {};
        filtersEl.querySelectorAll('select').forEach((s) => {
          if (s.value) reportFilters[s.name] = s.value;
        });
        render();
      });
    });
  }

  const exportBtn = $('#export-csv');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const filtered = filterTransactions(state.incomes, state.expenses, reportFilters);
      const csv = exportToCSV(filtered.incomes, filtered.expenses);
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tax-power-mapper-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('CSV exportado correctamente');
    });
  }

  $$('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => navigate(btn.dataset.nav));
  });

  $$('[data-upload-receipt]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.uploadReceipt;
      openModal('Subir recibo', `
        <div class="field">
          <label>Seleccionar archivo</label>
          <input type="file" id="modal-receipt" accept="image/*,.pdf">
        </div>
        <button class="btn btn-primary btn-block mt-1" id="modal-receipt-save">Guardar recibo</button>
      `);
      $('#modal-receipt-save').addEventListener('click', async () => {
        const file = $('#modal-receipt').files[0];
        if (!file) { showToast('Seleccione un archivo', 'error'); return; }
        if (file.size > 2 * 1024 * 1024) { showToast('Máximo 2 MB', 'error'); return; }
        const result = await readFileAsBase64(file);
        updateExpense(state, id, { receiptData: result.data, receiptName: result.name });
        closeModal();
        showToast('Recibo adjuntado');
        render();
      });
    });
  });

  $$('[data-add-purpose]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.addPurpose;
      openModal('Agregar propósito comercial', `
        <div class="field">
          <label>Propósito comercial</label>
          <input type="text" id="modal-purpose" placeholder="Describa el uso comercial">
        </div>
        <button class="btn btn-primary btn-block mt-1" id="modal-purpose-save">Guardar</button>
      `);
      $('#modal-purpose-save').addEventListener('click', () => {
        const purpose = $('#modal-purpose').value.trim();
        if (!purpose) { showToast('Ingrese un propósito', 'error'); return; }
        updateExpense(state, id, { commercialPurpose: purpose });
        closeModal();
        showToast('Propósito agregado');
        render();
      });
    });
  });
}

function init() {
  $('#current-date').textContent = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  $$('.nav-item').forEach((btn) => {
    btn.addEventListener('click', () => navigate(btn.dataset.view));
  });

  $('#menu-toggle').addEventListener('click', () => {
    $('#sidebar').classList.toggle('open');
    $('#overlay').classList.toggle('visible');
  });

  $('#overlay').addEventListener('click', closeSidebar);

  $$('[data-close-modal]').forEach((el) => {
    el.addEventListener('click', closeModal);
  });

  render();
}

init();
