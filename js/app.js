import {
  loadState,
  addIncome,
  addExpense,
  updateExpense,
  updateIncome,
  updateSettings,
  saveState,
  CATEGORIES,
  PAYMENT_METHODS,
  INCOME_SOURCES,
} from './store.js';

import {
  formatCurrency,
  formatDate,
  parseAmount,
  getTotalIncome,
  getTotalExpenses,
  getPossibleDeductions,
  getEstimatedTaxableProfit,
  getTaxEstimate,
  getUnclassifiedExpenses,
  getDocStatus,
  getMissingReceiptsCount,
  getMissingCfdiCount,
  getPreparationScore,
  getMonthlyChartData,
  filterTransactions,
  getUniqueClients,
  getAvailableYears,
} from './logic.js';

import { parseCfdiXml, readFileAsText, isCfdiXml } from './cfdi-xml.js';
import { exportToXml, exportFullBackupXml, importFromXml, downloadXml } from './xml-export.js';

import {
  TAX_REGIMES,
  CONTRIBUYENTE_TYPES,
  IVA_OPTIONS,
  CFDI_TYPES,
  RETENTION_TYPES,
  SAT_DEDUCTION_HINTS,
  getRegime,
  getContributorType,
  getRegimesForContributor,
  getDefaultRegimeForContributor,
  getAnnualIncomeYTD,
  isValidCfdiUuid,
} from './mexico-tax.js';

let state = loadState();
let currentView = 'dashboard';
let reportFilters = {};
let pendingCfdiUpload = { income: null, expense: null };

const VIEW_META = {
  dashboard: { title: 'Panel Principal', subtitle: 'Control fiscal México — SAT' },
  income: { title: 'Registrar Ingreso', subtitle: 'Ingresos cobrados y CFDI emitido' },
  expense: { title: 'Registrar Gasto', subtitle: 'Gastos con CFDI y deducciones autorizadas' },
  sifting: { title: 'Motor SIFTING Fiscal', subtitle: 'Clasifique gastos deducibles (Art. 27 LISR)' },
  documentation: { title: 'Estado de Documentación', subtitle: 'CFDI y requisitos SAT' },
  calculator: { title: 'Reserva ISR + IVA', subtitle: 'Pagos provisionales estimados' },
  reports: { title: 'Reportes', subtitle: 'Exportar e importar en formato XML' },
  score: { title: 'Puntuación de Preparación Fiscal', subtitle: 'Listo para declarar ante el SAT' },
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
  { value: 'ready', label: 'Listo para revisión SAT' },
  { value: 'missing-cfdi', label: 'Falta CFDI' },
  { value: 'missing-receipt', label: 'Falta comprobante' },
  { value: 'missing-purpose', label: 'Falta relación con actividad' },
  { value: 'needs-clarification', label: 'Necesita aclaración' },
  { value: 'personal', label: 'Gasto no deducible' },
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

function amountInput(id, name, { value = '', placeholder = '0.00', required = true, className = '' } = {}) {
  const req = required ? 'required' : '';
  return `
    <input
      type="text"
      inputmode="decimal"
      pattern="[0-9.,]*"
      id="${id}"
      name="${name}"
      class="amount-input ${className}"
      placeholder="${placeholder}"
      value="${value}"
      autocomplete="off"
      ${req}
    >
  `;
}

function getFormAmount(fd, field = 'amount') {
  return parseAmount(fd.get(field));
}

function renderRegimeSelector() {
  const contributorType = state.settings.contributorType ?? 'persona_fisica';
  const currentRegime = state.settings.taxRegime ?? getDefaultRegimeForContributor(contributorType);
  const regimes = getRegimesForContributor(contributorType);
  const contributor = getContributorType(contributorType);
  const regime = getRegime(currentRegime);

  return `
    <div class="card regime-card mb-1">
      <div class="section-title">Tipo de contribuyente <span>SAT</span></div>
      <div class="contributor-toggle grid grid-2 mb-1">
        ${Object.values(CONTRIBUYENTE_TYPES).map((c) => `
          <button type="button" class="contributor-btn ${contributorType === c.id ? 'active' : ''}" data-contributor="${c.id}">
            <span class="contributor-badge">${c.shortLabel}</span>
            <strong>${c.label}</strong>
            <span class="card-hint">${c.description}</span>
          </button>
        `).join('')}
      </div>

      <div class="section-title">Régimen fiscal — ${contributor.label} <span>${contributor.legalRef}</span></div>
      <div class="field">
        <label for="tax-regime">Seleccione su régimen ante el SAT</label>
        <select id="tax-regime" name="taxRegime">
          ${regimes.map((r) => `
            <option value="${r.id}" ${currentRegime === r.id ? 'selected' : ''}>${r.label} — ${r.fullName}</option>
          `).join('')}
        </select>
        <div class="field-hint" id="regime-hint">${regime.description} (${regime.legalRef})</div>
      </div>

      <div class="regime-summary">
        <span class="status-badge ${contributorType === 'persona_fisica' ? 'status-ready' : 'status-needs-clarification'}">${contributor.shortLabel}</span>
        <span class="status-badge status-${regime.allowsDeductions ? 'ready' : 'missing-purpose'}">
          ${regime.allowsDeductions ? 'Deducciones autorizadas' : 'Sin deducciones (RESICO)'}
        </span>
      </div>

      <label class="checkbox-row mt-1">
        <input type="checkbox" id="iva-liable" ${state.settings.isIvaLiable ? 'checked' : ''}>
        Estoy inscrito en el padrón de IVA (LIVA)
      </label>
    </div>
  `;
}

function renderIvaFields(prefix, defaults = {}) {
  const includesIva = defaults.includesIva !== false;
  const ivaRate = defaults.ivaRate ?? state.settings.defaultIvaRate ?? '16';
  return `
    <div class="form-row-2">
      <div class="field">
        <label for="${prefix}-iva-rate">Tasa de IVA</label>
        <select id="${prefix}-iva-rate" name="ivaRate">
          ${IVA_OPTIONS.map((o) => `<option value="${o.id}" ${ivaRate === o.id ? 'selected' : ''}>${o.label}</option>`).join('')}
        </select>
      </div>
      <div class="field checkbox-field">
        <label class="checkbox-row">
          <input type="checkbox" id="${prefix}-includes-iva" name="includesIva" ${includesIva ? 'checked' : ''}>
          El monto incluye IVA
        </label>
        <div class="field-hint">Desmarque si captura el subtotal sin IVA</div>
      </div>
    </div>
  `;
}

function applyCfdiToForm(cfdi, type = 'expense') {
  const setVal = (id, val) => {
    const el = $(id);
    if (el && val != null && val !== '') el.value = val;
  };
  const setCheck = (id, checked) => {
    const el = $(id);
    if (el) el.checked = checked;
  };

  setVal(type === 'income' ? '#income-amount' : '#expense-amount', String(cfdi.total));
  setVal(type === 'income' ? '#income-date' : '#expense-date', cfdi.fecha);
  setVal(type === 'income' ? '#income-cfdi' : '#expense-cfdi', cfdi.uuid || '');
  setVal(type === 'income' ? '#income-iva-rate' : '#expense-iva-rate', cfdi.ivaRate);
  setCheck(type === 'income' ? '#income-includes-iva' : '#expense-includes-iva', cfdi.includesIva);

  if (type === 'expense') {
    setVal('#expense-merchant', cfdi.emisorNombre || cfdi.emisorRfc);
    setVal('#expense-purpose', cfdi.descripcion);
    const preview = $('#receipt-preview');
    if (preview) {
      preview.innerHTML = `<div class="receipt-preview">🧾 CFDI XML · ${cfdi.emisorNombre || 'Comprobante'} · UUID ${cfdi.uuid ? '✓' : '—'}</div>`;
    }
  } else {
    setVal('#income-client', cfdi.receptorNombre || cfdi.receptorRfc);
    setVal('#income-notes', cfdi.descripcion);
  }
}

async function processUploadedFile(file, type = 'expense') {
  if (!file) return null;
  if (file.size > 2 * 1024 * 1024) {
    showToast('El archivo excede 2 MB', 'error');
    return null;
  }

  const text = await readFileAsText(file);
  if (isCfdiXml(text)) {
    const cfdi = parseCfdiXml(text);
    applyCfdiToForm(cfdi, type);
    showToast(`CFDI XML leído: ${cfdi.emisorNombre || cfdi.receptorNombre || 'comprobante'}`);
    return {
      cfdiUuid: cfdi.uuid,
      cfdiXml: cfdi.rawXml,
      cfdiType: cfdi.tipoLabel === 'Ingreso' ? 'Ingreso (factura emitida)' : 'Egreso (nota de crédito)',
      amount: cfdi.total,
      date: cfdi.fecha,
      includesIva: cfdi.includesIva,
      ivaRate: cfdi.ivaRate,
      merchant: cfdi.emisorNombre,
      commercialPurpose: cfdi.descripcion,
      clientProject: type === 'income' ? cfdi.receptorNombre : undefined,
      receiptName: file.name,
      receiptData: null,
    };
  }

  if (type === 'expense') {
    const reader = await readFileAsBase64(file);
    $('#receipt-preview').innerHTML = `<div class="receipt-preview">📎 ${file.name}</div>`;
    return { receiptData: reader.data, receiptName: reader.name, cfdiXml: null };
  }

  showToast('Suba un archivo CFDI XML del SAT', 'error');
  return null;
}

function readCfdiAndIvaFromForm(fd, prefix = '') {
  const cfdiUuid = String(fd.get('cfdiUuid') || '').trim();
  const includesIva = fd.get('includesIva') === 'on';
  return {
    cfdiUuid: cfdiUuid || null,
    includesIva,
    ivaRate: fd.get('ivaRate') || state.settings.defaultIvaRate || '16',
    retentionType: fd.get('retentionType') || 'Sin retención',
    cfdiType: fd.get('cfdiType') || 'Sin CFDI / ticket',
  };
}

/* ─── Dashboard ─── */
function renderDashboard() {
  const totalIncome = getTotalIncome(state.incomes);
  const totalExpenses = getTotalExpenses(state.expenses);
  const regimeId = state.settings.taxRegime ?? getDefaultRegimeForContributor(state.settings.contributorType);
  const contributor = getContributorType(state.settings.contributorType ?? 'persona_fisica');
  const deductions = getPossibleDeductions(state.expenses, regimeId);
  const profit = getEstimatedTaxableProfit(state.incomes, state.expenses, regimeId);
  const tax = getTaxEstimate(state.incomes, state.expenses, state.settings);
  const missingCfdi = getMissingCfdiCount(state.expenses);
  const chartData = getMonthlyChartData(state.incomes, state.expenses);
  const maxVal = Math.max(...chartData.flatMap((d) => [d.income, d.expense]), 1);
  const score = getPreparationScore(state.incomes, state.expenses);
  const annualYtd = getAnnualIncomeYTD(state.incomes);
  const regime = getRegime(regimeId);

  return `
    ${renderRegimeSelector()}

    <div class="card quick-capture mb-1">
      <div class="section-title">Registro rápido <span>ingresos cobrados / gastos</span></div>
      <div class="grid grid-2">
        <form id="quick-income-form" class="quick-form">
          <label class="quick-label" for="quick-income-amount">+ Ingreso cobrado</label>
          ${amountInput('quick-income-amount', 'amount', { className: 'quick-amount income-amount' })}
          <button type="submit" class="btn btn-primary btn-sm btn-block mt-1">Agregar ingreso</button>
        </form>
        <form id="quick-expense-form" class="quick-form">
          <label class="quick-label" for="quick-expense-amount">− Gasto</label>
          ${amountInput('quick-expense-amount', 'amount', { className: 'quick-amount expense-amount' })}
          <button type="submit" class="btn btn-secondary btn-sm btn-block mt-1">Agregar gasto</button>
        </form>
      </div>
      <p class="card-hint mt-1">En ${regime.label} (${contributor.shortLabel}), ${regime.allowsDeductions ? 'las deducciones autorizadas reducen la base del ISR.' : 'el ISR se calcula sobre ingresos cobrados sin deducir gastos.'}</p>
    </div>

    <div class="grid grid-3 mb-1">
      <div class="card card-hero income">
        <div class="card-label">Ingresos cobrados (subtotal)</div>
        <div class="card-value income">${formatCurrency(totalIncome)}</div>
        <div class="card-hint">Acumulado anual: ${formatCurrency(annualYtd)}</div>
      </div>
      <div class="card card-hero expense">
        <div class="card-label">Gastos registrados</div>
        <div class="card-value expense">${formatCurrency(totalExpenses)}</div>
      </div>
      <div class="card card-hero deduction">
        <div class="card-label">Posibles deducciones autorizadas</div>
        <div class="card-value deduction">${formatCurrency(deductions)}</div>
        <div class="card-hint">${regime.allowsDeductions ? 'Art. 27 LISR · con CFDI' : 'No aplica en RESICO'}</div>
      </div>
    </div>
    <div class="grid grid-3 mb-1">
      <div class="card card-hero profit">
        <div class="card-label">Base gravable estimada (ISR)</div>
        <div class="card-value profit">${formatCurrency(profit)}</div>
        <div class="card-hint">${regime.allowsDeductions ? 'Ingresos − deducciones' : 'Ingresos cobrados'}</div>
      </div>
      <div class="card card-hero reserve">
        <div class="card-label">Reserva ISR estimada</div>
        <div class="card-value reserve">${formatCurrency(tax.isr.amount)}</div>
        <div class="card-hint">${tax.isr.method}</div>
      </div>
      <div class="card card-hero warning">
        <div class="card-label">CFDI faltantes</div>
        <div class="card-value warning">${missingCfdi}</div>
        <div class="card-hint">Gastos deducibles sin UUID de CFDI</div>
      </div>
    </div>

    ${state.settings.isIvaLiable ? `
    <div class="grid grid-3 mb-1">
      <div class="card">
        <div class="card-label">IVA trasladado (cobrado)</div>
        <div class="card-value" style="color:var(--info)">${formatCurrency(tax.ivaCollected)}</div>
      </div>
      <div class="card">
        <div class="card-label">IVA acreditable (pagado)</div>
        <div class="card-value" style="color:var(--accent)">${formatCurrency(tax.ivaCreditable)}</div>
      </div>
      <div class="card">
        <div class="card-label">IVA a pagar estimado</div>
        <div class="card-value" style="color:var(--purple)">${formatCurrency(tax.ivaPayable)}</div>
        <div class="card-hint">LIVA · declaración mensual</div>
      </div>
    </div>
    ` : ''}

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

    <p class="legal-note mt-2">Herramienta orientativa conforme a LISR y LIVA. No sustituye asesoría de un contador público ni representa opinión del SAT. Consulte con un profesional de impuestos.</p>
  `;
}

/* ─── Income Form ─── */
function renderIncomeForm() {
  const today = new Date().toISOString().slice(0, 10);
  return `
    <div class="card form-card">
      <form id="income-form" class="form-grid">
        <div class="field">
          <label for="income-xml">Importar CFDI XML (SAT)</label>
          <input type="file" id="income-xml" accept=".xml,application/xml,text/xml">
          <div class="field-hint">Suba el XML timbrado para llenar automáticamente los campos</div>
          <div id="income-xml-preview"></div>
        </div>
        <div class="form-row-2">
          <div class="field">
            <label for="income-amount">Monto *</label>
            ${amountInput('income-amount', 'amount')}
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
        ${renderIvaFields('income')}
        <div class="form-row-2">
          <div class="field">
            <label for="income-cfdi">UUID del CFDI (folio fiscal)</label>
            <input type="text" id="income-cfdi" name="cfdiUuid" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" pattern="[0-9a-fA-F-]{36}">
            <div class="field-hint">Folio fiscal del CFDI de ingreso emitido ante el SAT</div>
          </div>
          <div class="field">
            <label for="income-cfdi-type">Tipo de comprobante</label>
            <select id="income-cfdi-type" name="cfdiType">
              ${CFDI_TYPES.map((t) => `<option value="${t}">${t}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="field">
          <label for="income-retention">Retenciones aplicadas</label>
          <select id="income-retention" name="retentionType">
            ${RETENTION_TYPES.map((t) => `<option value="${t}">${t}</option>`).join('')}
          </select>
          <div class="field-hint">ISR/IVA retenido por el cliente (Art. 113 LISR)</div>
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
      <p class="legal-note">Registre ingresos efectivamente cobrados. En RESICO solo cuentan los cobros del periodo.</p>
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
          <thead><tr><th>Fecha</th><th>Fuente</th><th>CFDI</th><th>Cliente</th><th>Monto</th></tr></thead>
          <tbody>
            ${recent.map((i) => `
              <tr>
                <td>${formatDate(i.date)}</td>
                <td>${i.source}</td>
                <td>${i.cfdiUuid ? '✓' : '—'}</td>
                <td>${i.clientProject || '—'}</td>
                <td class="amount editable-amount" style="color:var(--income)">
                  <button type="button" class="amount-edit-btn" data-edit-amount="income" data-id="${i.id}" title="Editar monto">
                    ${formatCurrency(i.amount)}
                  </button>
                </td>
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
            ${amountInput('expense-amount', 'amount')}
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
              <option value="">Seleccionar categoría SAT...</option>
              ${CATEGORIES.map((c) => `<option value="${c}">${c}</option>`).join('')}
            </select>
            <div class="field-hint" id="category-hint"></div>
          </div>
          <div class="field">
            <label for="expense-commercial-pct">% uso comercial</label>
            ${amountInput('expense-commercial-pct', 'commercialUsePercent', { value: '100', placeholder: '100', required: false })}
            <div class="field-hint">Para gastos mixtos, ajuste después en SIFTING</div>
          </div>
        </div>
        ${renderIvaFields('expense')}
        <div class="form-row-2">
          <div class="field">
            <label for="expense-cfdi">UUID del CFDI (folio fiscal)</label>
            <input type="text" id="expense-cfdi" name="cfdiUuid" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx">
            <div class="field-hint">Requisito para deducir gastos ante el SAT</div>
          </div>
          <div class="field">
            <label for="expense-cfdi-type">Tipo de comprobante</label>
            <select id="expense-cfdi-type" name="cfdiType">
              ${CFDI_TYPES.filter((t) => t !== 'Ingreso (factura emitida)').map((t) => `<option value="${t}">${t}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="field">
          <label for="expense-purpose">Relación con la actividad económica *</label>
          <input type="text" id="expense-purpose" name="commercialPurpose" placeholder="Ej. Internet para atención a clientes — indispensable">
          <div class="field-hint">Debe ser estrictamente indispensable para su actividad (Art. 27 LISR)</div>
        </div>
        <div class="field">
          <label for="expense-client">Cliente o proyecto relacionado</label>
          <input type="text" id="expense-client" name="clientProject" placeholder="Ej. Proyecto Web ABC">
        </div>
        <div class="field">
          <label for="expense-xml">Importar CFDI XML (SAT) *recomendado*</label>
          <input type="file" id="expense-xml" accept=".xml,application/xml,text/xml">
          <div class="field-hint">El XML timbrado llena monto, fecha, UUID, emisor e IVA automáticamente</div>
        </div>
        <div class="field">
          <label for="expense-receipt">Adjuntar comprobante adicional (PDF/imagen)</label>
          <input type="file" id="expense-receipt" name="receipt" accept="image/*,.pdf">
          <div class="field-hint">Opcional si ya subió el XML (máx. 2 MB)</div>
          <div id="receipt-preview"></div>
        </div>
        <div class="field">
          <label for="expense-notes">Notas</label>
          <textarea id="expense-notes" name="notes" placeholder="Detalles adicionales..."></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Registrar gasto</button>
      </form>
      <p class="legal-note">Las deducciones requieren CFDI vigente, pago electrónico (si aplica) y relación con la actividad. Consulte con un contador.</p>
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
                  <td class="amount editable-amount" style="color:var(--expense)">
                    <button type="button" class="amount-edit-btn" data-edit-amount="expense" data-id="${e.id}" title="Editar monto">
                      ${formatCurrency(e.amount)}
                    </button>
                  </td>
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
    <p class="card-hint mb-1">Clasifique cada gasto según el Art. 27 LISR. Solo gastos estrictamente indispensables son deducibles. Consulte con un contador.</p>
    ${unclassified.map((e) => `
      <div class="card sifting-card" data-expense-id="${e.id}">
        <div class="sifting-amount">${formatCurrency(e.amount)}</div>
        <div style="font-size:0.95rem;color:var(--text-muted)">${formatDate(e.date)} · ${e.merchant}</div>
        <div class="sifting-meta">
          <span>Categoría: <strong>${e.category}</strong></span>
          ${e.commercialPurpose ? `<span>Propósito: <strong>${e.commercialPurpose}</strong></span>` : ''}
          ${e.clientProject ? `<span>Proyecto: <strong>${e.clientProject}</strong></span>` : ''}
          ${e.cfdiUuid ? '<span>✓ CFDI XML</span>' : e.cfdiXml ? '<span>🧾 XML adjunto</span>' : e.receiptData ? '<span>📎 Comprobante</span>' : '<span style="color:var(--warning)">Sin CFDI</span>'}
        </div>
        <div class="btn-group">
          <button class="btn btn-business" data-classify="business" data-id="${e.id}">Deducible</button>
          <button class="btn btn-personal" data-classify="personal" data-id="${e.id}">No deducible</button>
          <button class="btn btn-mixed" data-classify="mixed" data-id="${e.id}">Mixto</button>
          <button class="btn btn-unsure" data-classify="unsure" data-id="${e.id}">No estoy seguro</button>
        </div>
        <div class="mixed-input" id="mixed-${e.id}" hidden>
          <div class="field">
            <label>¿Cuál porcentaje fue utilizado para fines comerciales?</label>
            <input type="text" inputmode="decimal" pattern="[0-9.,]*" min="1" max="99" placeholder="Ej. 60" class="amount-input" data-mixed-pct="${e.id}">
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
    ready: [], 'missing-cfdi': [], 'missing-receipt': [], 'missing-purpose': [],
    'needs-clarification': [], personal: [],
  };

  state.expenses.forEach((e) => {
    const status = getDocStatus(e);
    grouped[status.key].push(e);
  });

  const sections = [
    { key: 'ready', label: 'Listo para revisión SAT', icon: '✓' },
    { key: 'missing-cfdi', label: 'Falta CFDI', icon: '🧾' },
    { key: 'missing-receipt', label: 'Falta comprobante', icon: '📎' },
    { key: 'missing-purpose', label: 'Falta relación con actividad', icon: '📝' },
    { key: 'needs-clarification', label: 'Necesita aclaración', icon: '?' },
    { key: 'personal', label: 'Gasto no deducible', icon: '—' },
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
              ${!e.cfdiUuid && (sec.key === 'missing-cfdi' || sec.key === 'missing-receipt')
                ? '<button class="btn btn-secondary btn-sm mt-1" data-add-cfdi="' + e.id + '">Registrar UUID CFDI</button>'
                : ''}
              ${!e.receiptData && sec.key === 'missing-receipt'
                ? '<button class="btn btn-secondary btn-sm mt-1" data-upload-receipt="' + e.id + '">Adjuntar comprobante</button>'
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
  const regimeId = state.settings.taxRegime ?? getDefaultRegimeForContributor(state.settings.contributorType);
  const contributor = getContributorType(state.settings.contributorType ?? 'persona_fisica');
  const tax = getTaxEstimate(state.incomes, state.expenses, state.settings);
  const regime = getRegime(regimeId);
  const annualYtd = getAnnualIncomeYTD(state.incomes);
  const showManualSlider = regimeId === 'manual_pf' || regimeId === 'manual_pm';

  return `
    ${renderRegimeSelector()}
    <div class="grid grid-2">
      <div class="card">
        <div class="section-title">Reserva ISR <span>${contributor.shortLabel} · ${regime.label}</span></div>
        ${showManualSlider ? `
        <div class="calculator-slider">
          <div class="slider-value" id="tax-display">${state.settings.taxPercentage}%</div>
          <input type="range" id="tax-slider" min="10" max="35" step="1" value="${state.settings.taxPercentage}">
          <div class="flex-between" style="font-size:0.78rem;color:var(--text-dim)">
            <span>10%</span><span>35%</span>
          </div>
        </div>` : `
        <div class="regime-rate-box">
          <div class="slider-value">${tax.isr.rate.toFixed(1)}%</div>
          <p class="card-hint">${tax.isr.method}</p>
          <p class="card-hint">Ingresos acumulados ${new Date().getFullYear()}: ${formatCurrency(annualYtd)}</p>
        </div>`}
        <div class="formula-box">
          <p><strong>Base gravable estimada (ISR)</strong></p>
          <code>${formatCurrency(tax.totalIncome)}${regime.allowsDeductions ? ` − ${formatCurrency(tax.deductions)}` : ''} = ${formatCurrency(tax.taxableProfit)}</code>
          <p class="mt-1"><strong>Reserva ISR estimada</strong></p>
          <code>${formatCurrency(tax.taxableProfit)} × ${tax.isr.rate.toFixed(1)}% = ${formatCurrency(tax.isr.amount)}</code>
          ${state.settings.isIvaLiable ? `
          <p class="mt-1"><strong>IVA a pagar estimado (LIVA)</strong></p>
          <code>${formatCurrency(tax.ivaCollected)} − ${formatCurrency(tax.ivaCreditable)} = ${formatCurrency(tax.ivaPayable)}</code>
          ` : ''}
        </div>
        <p class="legal-note">${tax.isr.note} Pagos provisionales mensuales ante el SAT.</p>
      </div>
      <div class="card">
        <div class="section-title">Reserva total estimada</div>
        <div class="card card-hero reserve mt-1" style="border:none;background:var(--bg)">
          <div class="card-label">ISR + IVA a reservar</div>
          <div class="card-value reserve">${formatCurrency(tax.totalReserve)}</div>
        </div>
        <div class="progress-section mt-1">
          <div class="progress-header">
            <span class="progress-label">ISR estimado</span>
            <span class="progress-value">${formatCurrency(tax.isr.amount)}</span>
          </div>
        </div>
        ${state.settings.isIvaLiable ? `
        <div class="progress-section">
          <div class="progress-header">
            <span class="progress-label">IVA estimado</span>
            <span class="progress-value">${formatCurrency(tax.ivaPayable)}</span>
          </div>
        </div>` : ''}
        <div class="progress-section">
          <div class="progress-header">
            <span class="progress-label">Posibles deducciones</span>
            <span class="progress-value" style="color:var(--accent)">${formatCurrency(tax.deductions)}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill accent" style="width:${tax.totalIncome ? (tax.deductions / tax.totalIncome) * 100 : 0}%"></div>
          </div>
        </div>
        <p class="legal-note mt-1">Referencias: LISR (ISR), LIVA (IVA), RESICO (Art. 113-E). Consulte con un contador público.</p>
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
      <div class="field" style="align-self:flex-end;display:flex;gap:0.5rem;flex-wrap:wrap">
        <button class="btn btn-primary btn-sm" id="export-xml" ${totalRows === 0 ? 'disabled' : ''}>Exportar XML</button>
        <button class="btn btn-secondary btn-sm" id="export-backup-xml">Respaldo XML completo</button>
        <label class="btn btn-secondary btn-sm" style="cursor:pointer;margin:0">
          Importar XML
          <input type="file" id="import-xml" accept=".xml,application/xml" hidden>
        </label>
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
                const classLabels = { business: 'Deducible', personal: 'No deducible', mixed: 'Mixto', unsure: 'No seguro' };
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
          { key: 'receipts', label: 'CFDI registrados (UUID)', color: 'income' },
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
      <p class="legal-note">Preparación orientativa para declaraciones ante el SAT. Consulte con un contador público certificado.</p>
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
  focusPrimaryAmountInput();
}

function focusPrimaryAmountInput() {
  const focusMap = {
    dashboard: '#quick-income-amount',
    income: '#income-amount',
    expense: '#expense-amount',
  };
  const selector = focusMap[currentView];
  if (!selector) return;
  requestAnimationFrame(() => {
    const input = $(selector);
    if (input) input.focus();
  });
}

function bindViewEvents() {
  $$('[data-contributor]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const contributorType = btn.dataset.contributor;
      const defaultRegime = getDefaultRegimeForContributor(contributorType);
      updateSettings(state, { contributorType, taxRegime: defaultRegime });
      showToast(`Contribuyente: ${getContributorType(contributorType).label}`);
      render();
    });
  });

  const taxRegimeSelect = $('#tax-regime');
  if (taxRegimeSelect) {
    taxRegimeSelect.addEventListener('change', () => {
      updateSettings(state, { taxRegime: taxRegimeSelect.value });
      const hint = $('#regime-hint');
      if (hint) {
        const r = getRegime(taxRegimeSelect.value);
        hint.textContent = `${r.description} (${r.legalRef})`;
      }
      showToast(`Régimen ${getContributorType(state.settings.contributorType).shortLabel}: ${getRegime(taxRegimeSelect.value).label}`);
      render();
    });
  }

  const ivaLiableCheck = $('#iva-liable');
  if (ivaLiableCheck) {
    ivaLiableCheck.addEventListener('change', () => {
      updateSettings(state, { isIvaLiable: ivaLiableCheck.checked });
      showToast(ivaLiableCheck.checked ? 'IVA activado (LIVA)' : 'IVA desactivado');
      render();
    });
  }

  const categorySelect = $('#expense-category');
  const categoryHint = $('#category-hint');
  if (categorySelect && categoryHint) {
    const updateHint = () => {
      categoryHint.textContent = SAT_DEDUCTION_HINTS[categorySelect.value] || '';
    };
    categorySelect.addEventListener('change', updateHint);
    updateHint();
  }

  const quickIncomeForm = $('#quick-income-form');
  if (quickIncomeForm) {
    quickIncomeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(quickIncomeForm);
      const amount = getFormAmount(fd);
      if (amount == null || amount <= 0) {
        showToast('Escriba un monto válido mayor a 0', 'error');
        return;
      }
      const today = new Date().toISOString().slice(0, 10);
      addIncome(state, {
        amount,
        date: today,
        source: 'Otro ingreso gravado',
        clientProject: '',
        paymentMethod: '',
        notes: 'Registro rápido desde panel',
        includesIva: true,
        ivaRate: state.settings.defaultIvaRate || '16',
        cfdiUuid: null,
      });
      showToast(`Ingreso de ${formatCurrency(amount)} registrado`);
      quickIncomeForm.reset();
      render();
    });
  }

  const quickExpenseForm = $('#quick-expense-form');
  if (quickExpenseForm) {
    quickExpenseForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(quickExpenseForm);
      const amount = getFormAmount(fd);
      if (amount == null || amount <= 0) {
        showToast('Escriba un monto válido mayor a 0', 'error');
        return;
      }
      const today = new Date().toISOString().slice(0, 10);
      addExpense(state, {
        amount,
        date: today,
        merchant: 'Gasto rápido',
        category: 'Otros gastos deducibles',
        commercialPurpose: '',
        clientProject: '',
        commercialUsePercent: 100,
        notes: 'Registro rápido desde panel',
        receiptData: null,
        receiptName: null,
        includesIva: true,
        ivaRate: state.settings.defaultIvaRate || '16',
        cfdiUuid: null,
      });
      showToast(`Gasto de ${formatCurrency(amount)} registrado — clasifíquelo en SIFTING`);
      quickExpenseForm.reset();
      render();
    });
  }

  const incomeForm = $('#income-form');
  if (incomeForm) {
    const incomeXmlInput = $('#income-xml');
    if (incomeXmlInput) {
      incomeXmlInput.addEventListener('change', async () => {
        const file = incomeXmlInput.files[0];
        if (!file) return;
        const result = await processUploadedFile(file, 'income');
        if (result) {
          pendingCfdiUpload.income = result;
          const preview = $('#income-xml-preview');
          if (preview) {
            preview.innerHTML = `<div class="receipt-preview">🧾 ${file.name} · UUID ${result.cfdiUuid ? '✓' : '—'}</div>`;
          }
        }
      });
    }

    incomeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(incomeForm);
      const amount = getFormAmount(fd);
      if (amount == null || amount <= 0) {
        showToast('Escriba un monto válido mayor a 0', 'error');
        return;
      }
      const cfdiFields = readCfdiAndIvaFromForm(fd, 'income');
      if (cfdiFields.cfdiUuid && !isValidCfdiUuid(cfdiFields.cfdiUuid)) {
        showToast('UUID de CFDI inválido', 'error');
        return;
      }
      addIncome(state, {
        amount,
        date: fd.get('date'),
        source: fd.get('source'),
        clientProject: fd.get('clientProject') || '',
        paymentMethod: fd.get('paymentMethod') || '',
        notes: fd.get('notes') || '',
        ...cfdiFields,
        cfdiXml: pendingCfdiUpload.income?.cfdiXml || null,
      });
      pendingCfdiUpload.income = null;
      showToast('Ingreso registrado correctamente');
      incomeForm.reset();
      $('#income-date').value = new Date().toISOString().slice(0, 10);
      render();
    });
  }

  const expenseForm = $('#expense-form');
  if (expenseForm) {
    const expenseXmlInput = $('#expense-xml');
    const receiptInput = $('#expense-receipt');

    if (expenseXmlInput) {
      expenseXmlInput.addEventListener('change', async () => {
        const file = expenseXmlInput.files[0];
        if (!file) return;
        const result = await processUploadedFile(file, 'expense');
        if (result) pendingCfdiUpload.expense = result;
      });
    }

    if (receiptInput) {
      receiptInput.addEventListener('change', async () => {
        const file = receiptInput.files[0];
        if (!file) return;
        const result = await processUploadedFile(file, 'expense');
        if (result?.receiptData) {
          pendingCfdiUpload.expense = { ...(pendingCfdiUpload.expense || {}), ...result };
        }
      });
    }

    expenseForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(expenseForm);
      const amount = getFormAmount(fd);
      if (amount == null || amount <= 0) {
        showToast('Escriba un monto válido mayor a 0', 'error');
        return;
      }
      const commercialPct = parseAmount(fd.get('commercialUsePercent'));
      const cfdiFields = readCfdiAndIvaFromForm(fd, 'expense');
      if (cfdiFields.cfdiUuid && !isValidCfdiUuid(cfdiFields.cfdiUuid)) {
        showToast('UUID de CFDI inválido. Verifique el folio fiscal.', 'error');
        return;
      }
      const pending = pendingCfdiUpload.expense || {};
      addExpense(state, {
        amount,
        date: fd.get('date'),
        merchant: fd.get('merchant'),
        category: fd.get('category'),
        commercialPurpose: fd.get('commercialPurpose') || '',
        clientProject: fd.get('clientProject') || '',
        commercialUsePercent: commercialPct ?? 100,
        notes: fd.get('notes') || '',
        receiptData: pending.receiptData || null,
        receiptName: pending.receiptName || null,
        cfdiXml: pending.cfdiXml || null,
        ...cfdiFields,
      });
      pendingCfdiUpload.expense = null;
      showToast('Gasto registrado — clasifíquelo en SIFTING');
      expenseForm.reset();
      $('#expense-date').value = new Date().toISOString().slice(0, 10);
      const pctField = $('#expense-commercial-pct');
      if (pctField) pctField.value = '100';
      $('#receipt-preview').innerHTML = '';
      render();
    });
  }

  $$('[data-edit-amount]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.editAmount;
      const id = btn.dataset.id;
      const current = type === 'income'
        ? state.incomes.find((i) => i.id === id)
        : state.expenses.find((e) => e.id === id);
      if (!current) return;

      openModal('Editar monto', `
        <div class="field">
          <label>Nuevo monto</label>
          ${amountInput('modal-amount', 'amount', { value: String(current.amount), className: 'quick-amount' })}
        </div>
        <button class="btn btn-primary btn-block mt-1" id="modal-amount-save">Guardar monto</button>
      `);

      $('#modal-amount-save').addEventListener('click', () => {
        const amount = parseAmount($('#modal-amount').value);
        if (amount == null || amount <= 0) {
          showToast('Escriba un monto válido mayor a 0', 'error');
          return;
        }
        if (type === 'income') {
          updateIncome(state, id, { amount });
        } else {
          updateExpense(state, id, { amount });
        }
        closeModal();
        showToast(`Monto actualizado a ${formatCurrency(amount)}`);
        render();
      });
    });
  });

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
      const pct = parseAmount(input.value);
      if (pct == null || pct < 1 || pct > 99) {
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

  const exportXmlBtn = $('#export-xml');
  if (exportXmlBtn) {
    exportXmlBtn.addEventListener('click', () => {
      const filtered = filterTransactions(state.incomes, state.expenses, reportFilters);
      const xml = exportToXml(filtered.incomes, filtered.expenses, state.settings);
      downloadXml(xml, `tax-power-mapper-${new Date().toISOString().slice(0, 10)}.xml`);
      showToast('Reporte XML exportado');
    });
  }

  const exportBackupBtn = $('#export-backup-xml');
  if (exportBackupBtn) {
    exportBackupBtn.addEventListener('click', () => {
      const xml = exportFullBackupXml(state);
      downloadXml(xml, `tax-power-mapper-respaldo-${new Date().toISOString().slice(0, 10)}.xml`);
      showToast('Respaldo XML completo exportado');
    });
  }

  const importXmlInput = $('#import-xml');
  if (importXmlInput) {
    importXmlInput.addEventListener('change', async () => {
      const file = importXmlInput.files[0];
      if (!file) return;
      try {
        const text = await readFileAsText(file);
        const imported = importFromXml(text);
        if (!confirm(`¿Importar ${imported.incomes.length} ingresos y ${imported.expenses.length} gastos? Esto reemplazará sus datos actuales.`)) {
          importXmlInput.value = '';
          return;
        }
        state.incomes = imported.incomes;
        state.expenses = imported.expenses;
        state.settings = { ...state.settings, ...imported.settings };
        saveState(state);
        showToast('Datos importados desde XML');
        render();
      } catch (err) {
        showToast(err.message || 'Error al importar XML', 'error');
      }
      importXmlInput.value = '';
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
          <input type="file" id="modal-receipt" accept="image/*,.pdf,.xml,application/xml">
        </div>
        <button class="btn btn-primary btn-block mt-1" id="modal-receipt-save">Guardar recibo</button>
      `);
      $('#modal-receipt-save').addEventListener('click', async () => {
        const file = $('#modal-receipt').files[0];
        if (!file) { showToast('Seleccione un archivo', 'error'); return; }
        const result = await processUploadedFile(file, 'expense');
        if (!result) return;
        updateExpense(state, id, {
          receiptData: result.receiptData || undefined,
          receiptName: result.receiptName || file.name,
          cfdiXml: result.cfdiXml || undefined,
          cfdiUuid: result.cfdiUuid || undefined,
        });
        closeModal();
        showToast('Recibo adjuntado');
        render();
      });
    });
  });

  $$('[data-add-cfdi]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.addCfdi;
      openModal('Registrar UUID del CFDI', `
        <div class="field">
          <label>Folio fiscal (UUID)</label>
          <input type="text" id="modal-cfdi" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx">
          <div class="field-hint">Lo encuentra en su CFDI emitido por el proveedor</div>
        </div>
        <button class="btn btn-primary btn-block mt-1" id="modal-cfdi-save">Guardar CFDI</button>
      `);
      $('#modal-cfdi-save').addEventListener('click', () => {
        const uuid = $('#modal-cfdi').value.trim();
        if (!isValidCfdiUuid(uuid)) {
          showToast('UUID de CFDI inválido', 'error');
          return;
        }
        updateExpense(state, id, { cfdiUuid: uuid });
        closeModal();
        showToast('CFDI registrado');
        render();
      });
    });
  });

  $$('[data-add-purpose]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.addPurpose;
      openModal('Relación con la actividad económica', `
        <div class="field">
          <label>Describa por qué es indispensable (Art. 27 LISR)</label>
          <input type="text" id="modal-purpose" placeholder="Ej. Gasolina para visitas a clientes">
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
