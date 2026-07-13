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

import {
  createRegimeSelectorState,
  renderRegimeSelector as renderRegimeSelectorModule,
  bindRegimeSelector,
  mapRegimeToAppSettings,
} from './regime-selector/ui.js';
import { getRegimeById } from './regime-selector/catalog-store.js';
import { buildTaxProfileFromAnswers, normalizeQuestionnaireAnswers } from './regime-selector/recommend.js';
import { parseCfdiXml, readFileAsText, isCfdiXml } from './cfdi-xml.js';
import { exportToXml, exportFullBackupXml, importFromXml, downloadXml } from './xml-export.js';
import {
  SAT_PORTALS,
  extractXmlFromSatPackage,
  extractXmlFromFileList,
  importSatXmlBatch,
  getExistingCfdiUuids,
  downloadAllStoredCfdiXml,
  downloadStoredCfdiAsZip,
} from './sat-portal.js';
import {
  connectToSat,
  downloadXmlFromSat,
  filterXmlCatalog,
  setAllSelected,
  toggleXmlSelection,
  getSelectedXml,
  importSelectedXmlToTaxPrep,
  disconnectSat,
  SAT_CONNECT_MODE,
} from './sat-connect.js';

import {
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
let rsState = createRegimeSelectorState();

const VIEW_META = {
  dashboard: { title: 'Panel Principal', subtitle: 'Control fiscal México — SAT' },
  income: { title: 'Registrar Ingreso', subtitle: 'Ingresos cobrados y CFDI emitido' },
  expense: { title: 'Registrar Gasto', subtitle: 'Gastos con CFDI y deducciones autorizadas' },
  sifting: { title: 'Motor SIFTING Fiscal', subtitle: 'Clasifique gastos deducibles (Art. 27 LISR)' },
  documentation: { title: 'Estado de Documentación', subtitle: 'CFDI y requisitos SAT' },
  calculator: { title: 'Reserva ISR + IVA', subtitle: 'Pagos provisionales estimados' },
  reports: { title: 'Reportes', subtitle: 'Exportar e importar en formato XML' },
  score: { title: 'Puntuación de Preparación Fiscal', subtitle: 'Listo para declarar ante el SAT' },
  'regime-selector': { title: 'Selector de Régimen Fiscal', subtitle: 'Clasificación educativa — México' },
  'sat-download': { title: 'Descarga SAT', subtitle: 'Importar CFDI XML desde la plataforma de Hacienda' },
  'sat-connect': { title: 'Conectar con Hacienda / SAT', subtitle: 'e.firma · descarga y selección de XML' },
};

const VIEW_NAV_ORDER = [
  'dashboard',
  'income',
  'expense',
  'sifting',
  'documentation',
  'sat-connect',
  'sat-download',
  'regime-selector',
  'calculator',
  'reports',
  'score',
];

const REGIME_SUB_VIEWS = {
  home: 'Régimen · Inicio',
  list: 'Régimen · Lista de regímenes',
  questionnaire: 'Régimen · Cuestionario',
  results: 'Régimen · Resultados',
  detail: 'Régimen · Detalle de régimen',
  admin: 'Régimen · Administración',
};

const FISCAL_HUB_MODULES = [
  { view: 'sat-connect', icon: '🔗', label: 'Conectar SAT', hint: 'e.firma y descarga de XML' },
  { view: 'sat-download', icon: '⬇', label: 'Descarga SAT', hint: 'Importar XML de emitidos y recibidos' },
  { view: 'regime-selector', icon: '⚖', label: 'Régimen Fiscal', hint: 'Cuestionario y recomendaciones' },
  { view: 'income', icon: '＋', label: 'Ingreso', hint: 'CFDI emitidos y cobros' },
  { view: 'expense', icon: '－', label: 'Gasto', hint: 'CFDI recibidos y deducciones' },
  { view: 'sifting', icon: '◎', label: 'SIFTING', hint: 'Clasificar gastos Art. 27 LISR' },
  { view: 'documentation', icon: '☰', label: 'Documentación', hint: 'Estado CFDI y comprobantes' },
  { view: 'calculator', icon: '％', label: 'ISR + IVA', hint: 'Reserva fiscal estimada' },
  { view: 'reports', icon: '↗', label: 'Reportes XML', hint: 'Exportar e importar respaldo' },
  { view: 'score', icon: '★', label: 'Preparación', hint: 'Puntuación para declarar' },
];

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

function escHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

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

function getCurrentJumpValue() {
  if (currentView === 'regime-selector' && rsState.subView !== 'home') {
    return `regime:${rsState.subView}`;
  }
  return currentView;
}

function populateViewJumpSelect() {
  const select = $('#view-jump');
  if (!select) return;

  const current = getCurrentJumpValue();
  const mainOptions = VIEW_NAV_ORDER.map((id) => {
    const meta = VIEW_META[id];
    const selected = current === id ? 'selected' : '';
    return `<option value="${id}" ${selected}>${meta.title}</option>`;
  }).join('');

  const regimeOptions = Object.entries(REGIME_SUB_VIEWS).map(([sub, label]) => {
    const value = `regime:${sub}`;
    const selected = current === value ? 'selected' : '';
    return `<option value="${value}" ${selected}>${label}</option>`;
  }).join('');

  select.innerHTML = `
    <optgroup label="Secciones principales">${mainOptions}</optgroup>
    <optgroup label="Selector de régimen">${regimeOptions}</optgroup>
  `;
}

function applyViewMeta() {
  const meta = VIEW_META[currentView];
  if (!meta) return;
  $('#view-title').textContent = meta.title;
  $('#view-subtitle').textContent = meta.subtitle;
}

function syncNavUI() {
  $$('.nav-item').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === currentView);
  });
  populateViewJumpSelect();
}

function updateHash() {
  let hash = currentView;
  if (currentView === 'regime-selector' && rsState.subView && rsState.subView !== 'home') {
    hash += `/${rsState.subView}`;
  }
  const next = `#${hash}`;
  if (location.hash !== next) {
    history.replaceState(null, '', next);
  }
}

function parseHash() {
  const raw = location.hash.replace(/^#/, '').trim();
  if (!raw) return { view: 'dashboard' };
  const [view, sub] = raw.split('/');
  if (view === 'regime-selector') {
    if (sub && REGIME_SUB_VIEWS[sub]) return { view, regimeSub: sub };
    return { view, regimeSub: 'home' };
  }
  if (VIEW_META[view]) return { view };
  return { view: 'dashboard' };
}

function goToRegimeSubView(subView) {
  currentView = 'regime-selector';
  rsState.subView = subView;
  if (subView === 'home') {
    rsState.searchQuery = '';
    rsState.adminEditingId = null;
  }
  if (subView === 'list' && !rsState.listType) {
    rsState.listType = 'individual';
  }
  syncNavUI();
  applyViewMeta();
  render();
  closeSidebar();
  updateHash();
}

function handleViewJump(value) {
  if (!value) return;
  if (value.startsWith('regime:')) {
    goToRegimeSubView(value.slice(7));
    return;
  }
  navigate(value, { regimeSubView: value === 'regime-selector' ? 'home' : undefined });
}

function navigate(view, { regimeSubView } = {}) {
  currentView = view;
  if (view === 'regime-selector') {
    rsState.subView = regimeSubView ?? rsState.subView ?? 'home';
    if (rsState.subView === 'home') {
      rsState.searchQuery = '';
      rsState.adminEditingId = null;
    }
    if (rsState.subView === 'list' && !rsState.listType) {
      rsState.listType = 'individual';
    }
  }
  syncNavUI();
  applyViewMeta();
  render();
  closeSidebar();
  updateHash();
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

function countSatImported() {
  const incomes = state.incomes.filter((i) => i.satImported).length;
  const expenses = state.expenses.filter((e) => e.satImported).length;
  const storedXml = downloadAllStoredCfdiXml(state).length;
  return { incomes, expenses, total: incomes + expenses, storedXml };
}

function appendSatImportLog(result, source) {
  const log = [...(state.settings.satImportLog || [])];
  log.unshift({
    at: new Date().toISOString(),
    source,
    incomes: result.incomes,
    expenses: result.expenses,
    skipped: result.skipped,
    errors: result.errors?.length || 0,
  });
  if (log.length > 20) log.length = 20;
  updateSettings(state, { satImportLog: log });
}

function renderFiscalHub() {
  const sat = countSatImported();
  const unclassified = getUnclassifiedExpenses(state.expenses).length;
  return `
    <div class="card fiscal-hub mb-1">
      <div class="section-title">Centro fiscal <span>todas las herramientas</span></div>
      <p class="card-hint mb-1">Flujo recomendado: descargue XML en el SAT → impórtelos aquí → clasifique en SIFTING → revise ISR+IVA y reportes.</p>
      <div class="hub-grid">
        ${FISCAL_HUB_MODULES.map((m) => `
          <button type="button" class="hub-card" data-nav="${m.view}">
            <span class="hub-icon">${m.icon}</span>
            <strong>${m.label}</strong>
            <span class="hub-hint">${m.hint}</span>
            ${m.view === 'sat-download' && sat.total > 0 ? `<span class="hub-badge">${sat.total} del SAT</span>` : ''}
            ${m.view === 'sifting' && unclassified > 0 ? `<span class="hub-badge warning">${unclassified} pendientes</span>` : ''}
          </button>
        `).join('')}
      </div>
    </div>
  `;
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
    ${renderFiscalHub()}
    ${state.settings.taxProfile?.selectedRegimeName ? `
    <div class="card mb-1" style="border-color:var(--accent-dim)">
      <div class="flex-between">
        <div>
          <div class="card-label">Régimen en tu perfil</div>
          <strong>${state.settings.taxProfile.selectedRegimeName}</strong>
        </div>
        <button class="btn btn-secondary btn-sm" data-nav="regime-selector">Abrir selector</button>
      </div>
    </div>` : ''}
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

/* ─── SAT Download ─── */
function renderSatDownload() {
  const userRfc = state.settings.userRfc || '';
  const sat = countSatImported();
  const log = (state.settings.satImportLog || []).slice(0, 8);

  return `
    <div class="card sat-notice mb-1">
      <div class="section-title">Plataforma del SAT <span>Hacienda</span></div>
      <p class="card-hint">
        Por seguridad, el SAT exige iniciar sesión con RFC y contraseña o e.firma. Esta app no puede conectarse directamente;
        usted descarga los XML en el portal oficial y los importa aquí para registrar ingresos y gastos automáticamente.
      </p>
    </div>

    <div class="grid grid-2 mb-1">
      <div class="card">
        <div class="section-title">1. Su RFC <span>clasificación automática</span></div>
        <div class="field">
          <label for="sat-user-rfc">RFC del contribuyente</label>
          <input type="text" id="sat-user-rfc" maxlength="13" placeholder="Ej. XAXX010101000"
            value="${userRfc}" style="text-transform:uppercase;font-family:var(--mono)">
          <div class="field-hint">Con su RFC distinguimos CFDI emitidos (ingresos) de recibidos (gastos).</div>
        </div>
        <button type="button" class="btn btn-primary btn-sm" id="sat-save-rfc">Guardar RFC</button>
      </div>
      <div class="card">
        <div class="section-title">Resumen importado <span>desde SAT</span></div>
        <div class="sat-stats">
          <div><span class="card-label">Ingresos SAT</span><strong class="income">${sat.incomes}</strong></div>
          <div><span class="card-label">Gastos SAT</span><strong class="expense">${sat.expenses}</strong></div>
          <div><span class="card-label">XML almacenados</span><strong>${sat.storedXml}</strong></div>
        </div>
        <button type="button" class="btn btn-secondary btn-sm mt-1" id="sat-export-zip"
          ${sat.storedXml === 0 ? 'disabled' : ''}>Descargar XML almacenados (ZIP)</button>
      </div>
    </div>

    <div class="card mb-1">
      <div class="section-title">2. Portales oficiales del SAT <span>abrir en nueva pestaña</span></div>
      <div class="sat-portals">
        ${Object.entries(SAT_PORTALS).map(([key, p]) => `
          <a class="sat-portal-link" href="${p.url}" target="_blank" rel="noopener noreferrer" data-sat-portal="${key}">
            <strong>${p.label}</strong>
            <span>${p.description}</span>
            <span class="sat-portal-cta">Ir al SAT →</span>
          </a>
        `).join('')}
      </div>
      <ol class="sat-steps mt-1">
        <li>Ingrese al <strong>Portal de Consulta CFDI</strong> o solicite <strong>Descarga Masiva</strong> en sat.gob.mx.</li>
        <li>Descargue el paquete ZIP con XML de emitidos y recibidos (o archivos XML individuales).</li>
        <li>Regrese aquí y suba el ZIP o la carpeta con los XML en el paso 3.</li>
      </ol>
    </div>

    <div class="card mb-1">
      <div class="section-title">3. Importar XML descargados <span>ZIP o carpeta</span></div>
      <div class="sat-upload-grid">
        <label class="sat-upload-zone">
          <input type="file" id="sat-upload-zip" accept=".zip,.xml,application/zip,application/xml,text/xml" hidden>
          <span class="sat-upload-icon">📦</span>
          <strong>Paquete ZIP del SAT</strong>
          <span>Descarga masiva o ZIP con varios XML</span>
        </label>
        <label class="sat-upload-zone">
          <input type="file" id="sat-upload-folder" webkitdirectory directory multiple hidden>
          <span class="sat-upload-icon">📁</span>
          <strong>Carpeta de XML</strong>
          <span>Seleccione la carpeta extraída del ZIP</span>
        </label>
        <label class="sat-upload-zone">
          <input type="file" id="sat-upload-xml" accept=".xml,application/xml,text/xml" multiple hidden>
          <span class="sat-upload-icon">🧾</span>
          <strong>Archivos XML sueltos</strong>
          <span>Uno o varios comprobantes</span>
        </label>
      </div>
      <div class="flex-between mt-1" style="flex-wrap:wrap;gap:0.5rem">
        <button type="button" class="btn btn-secondary btn-sm" id="sat-demo-import">Probar con XML de ejemplo</button>
        <span id="sat-import-status" class="card-hint"></span>
      </div>
    </div>

    ${log.length > 0 ? `
    <div class="card">
      <div class="section-title">Historial de importaciones <span>últimas ${log.length}</span></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Fecha</th><th>Origen</th><th>Ingresos</th><th>Gastos</th><th>Omitidos</th><th>Errores</th></tr></thead>
          <tbody>
            ${log.map((entry) => `
              <tr>
                <td>${formatDate(entry.at.slice(0, 10))}</td>
                <td>${entry.source}</td>
                <td class="income">${entry.incomes}</td>
                <td class="expense">${entry.expenses}</td>
                <td>${entry.skipped}</td>
                <td>${entry.errors || 0}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>` : ''}

    <p class="legal-note mt-2">Los enlaces dirigen a sitios oficiales del SAT. Verifique siempre la autenticidad de los comprobantes. No almacenamos credenciales del SAT.</p>
  `;
}

function getSatConnect() {
  return state.settings.satConnect || {};
}

function renderSatConnectXmlRows(items) {
  if (items.length === 0) {
    return `<tr><td colspan="12" class="sat-connect-empty">No hay XML para mostrar con este filtro.</td></tr>`;
  }
  return items.map((item) => `
    <tr class="${item.selected ? 'sat-row-selected' : ''} ${item.estado === 'Cancelado' ? 'sat-row-cancelled' : ''}">
      <td class="sat-check-col">
        <input type="checkbox" class="sat-xml-check" data-sat-xml-id="${escHtml(item.id)}"
          ${item.selected ? 'checked' : ''} ${item.estado === 'Cancelado' ? 'disabled' : ''}
          aria-label="Seleccionar XML ${escHtml(item.uuid)}">
      </td>
      <td>${formatDate(item.fecha)}</td>
      <td class="mono">${escHtml(item.rfc)}</td>
      <td>${escHtml(item.emisorNombre)}<br><span class="cell-muted">${escHtml(item.emisorRfc)}</span></td>
      <td>${escHtml(item.receptorNombre)}<br><span class="cell-muted">${escHtml(item.receptorRfc)}</span></td>
      <td class="sat-concept-col">${escHtml(item.concepto)}</td>
      <td class="amount">${formatCurrency(item.subtotal)}</td>
      <td class="amount">${formatCurrency(item.iva)}</td>
      <td class="amount">${formatCurrency(item.total)}</td>
      <td><span class="status-badge status-${item.direction === 'emitido' ? 'ready' : 'missing-receipt'}">${escHtml(item.tipoFactura)}</span></td>
      <td><span class="status-badge status-${item.estado === 'Vigente' ? 'ready' : 'personal'}">${escHtml(item.estado)}</span></td>
      <td><span class="sat-dir-pill sat-dir-${item.direction}">${item.direction === 'emitido' ? 'Emitido' : 'Recibido'}</span></td>
    </tr>
  `).join('');
}

/* ─── Conectar con Hacienda / SAT ─── */
function renderSatConnect() {
  const sc = getSatConnect();
  const rfc = sc.rfc || state.settings.userRfc || '';
  const filter = sc.xmlFilter || 'all';
  const catalog = sc.xmlCatalog || [];
  const filtered = filterXmlCatalog(catalog, filter);
  const selectedCount = getSelectedXml(catalog).length;
  const emitidos = catalog.filter((x) => x.direction === 'emitido').length;
  const recibidos = catalog.filter((x) => x.direction === 'recibido').length;

  const credentialsForm = `
    <div class="card sat-connect-credentials mb-1">
      <div class="section-title">Credenciales FIEL <span>e.firma del SAT</span></div>
      <p class="card-hint mb-1">
        Ingrese su RFC, certificado (.cer), llave privada (.key) y contraseña.
        <strong>La contraseña y archivos no se guardan</strong> — solo permanecen en esta sesión.
      </p>
      <form id="sat-connect-form" class="form-grid">
        <div class="field">
          <label for="sat-connect-rfc">RFC *</label>
          <input type="text" id="sat-connect-rfc" maxlength="13" placeholder="Ej. XAXX010101000"
            value="${escHtml(rfc)}" style="text-transform:uppercase;font-family:var(--mono)" required>
        </div>
        <div class="form-row-2">
          <div class="field">
            <label for="sat-connect-cer">Certificado (.cer) *</label>
            <input type="file" id="sat-connect-cer" accept=".cer" ${sc.isConnected ? '' : 'required'}>
            ${sc.cerFileName ? `<div class="field-hint">Último: ${escHtml(sc.cerFileName)}</div>` : ''}
          </div>
          <div class="field">
            <label for="sat-connect-key">Llave privada (.key) *</label>
            <input type="file" id="sat-connect-key" accept=".key" ${sc.isConnected ? '' : 'required'}>
            ${sc.keyFileName ? `<div class="field-hint">Último: ${escHtml(sc.keyFileName)}</div>` : ''}
          </div>
        </div>
        <div class="field">
          <label for="sat-connect-password">Contraseña de la llave *</label>
          <input type="password" id="sat-connect-password" placeholder="Contraseña de su e.firma" autocomplete="off" required>
        </div>
        <div class="sat-connect-actions">
          <button type="submit" class="btn btn-primary" id="sat-connect-btn">
            ${sc.isConnected ? 'Reconectar con SAT' : 'Conectar con SAT'}
          </button>
          ${sc.isConnected ? '<button type="button" class="btn btn-secondary" id="sat-disconnect-btn">Desconectar</button>' : ''}
        </div>
      </form>
      <div class="sat-mode-badge">
        <span class="status-badge status-needs-clarification">Modo simulado</span>
        <span class="card-hint">Conexión real preparada para integración futura con Web Service del SAT.</span>
      </div>
    </div>
  `;

  const connectedPanel = !sc.isConnected ? '' : `
    <div class="card mb-1 sat-connect-panel">
      <div class="flex-between mb-1" style="flex-wrap:wrap;gap:0.75rem">
        <div>
          <div class="section-title">XML del contribuyente <span>${escHtml(sc.rfc)}</span></div>
          <p class="card-hint">
            Conectado ${sc.connectedAt ? `desde ${formatDate(sc.connectedAt.slice(0, 10))}` : ''}
            · ${catalog.length} comprobantes
            · <span class="income">${emitidos} emitidos</span> · <span class="expense">${recibidos} recibidos</span>
          </p>
        </div>
        <button type="button" class="btn btn-primary btn-sm" id="sat-download-xml-btn"
          ${catalog.length > 0 ? '' : ''}>
          ${catalog.length > 0 ? 'Actualizar XML del SAT' : 'Descargar XML del contribuyente'}
        </button>
      </div>

      ${catalog.length > 0 ? `
      <div class="sat-connect-toolbar">
        <div class="sat-filter-tabs">
          <button type="button" class="sat-filter-tab ${filter === 'all' ? 'active' : ''}" data-sat-filter="all">Todos (${catalog.length})</button>
          <button type="button" class="sat-filter-tab ${filter === 'emitidos' ? 'active' : ''}" data-sat-filter="emitidos">XML emitidos (${emitidos})</button>
          <button type="button" class="sat-filter-tab ${filter === 'recibidos' ? 'active' : ''}" data-sat-filter="recibidos">XML recibidos (${recibidos})</button>
        </div>
        <div class="sat-select-actions">
          <button type="button" class="btn btn-secondary btn-sm" id="sat-select-all">Seleccionar todos</button>
          <button type="button" class="btn btn-secondary btn-sm" id="sat-deselect-all">Quitar selección</button>
        </div>
      </div>

      <div class="table-wrap sat-xml-table-wrap mt-1">
        <table class="sat-xml-table">
          <thead>
            <tr>
              <th class="sat-check-col">✓</th>
              <th>Fecha</th>
              <th>RFC</th>
              <th>Emisor</th>
              <th>Receptor</th>
              <th>Concepto</th>
              <th>Subtotal</th>
              <th>IVA</th>
              <th>Total</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Dir.</th>
            </tr>
          </thead>
          <tbody>
            ${renderSatConnectXmlRows(filtered)}
          </tbody>
        </table>
      </div>

      <div class="sat-connect-footer mt-1">
        <span class="card-hint">${selectedCount} XML seleccionado(s) de ${catalog.length}</span>
        <button type="button" class="btn btn-primary" id="sat-use-selected-btn"
          ${selectedCount === 0 ? 'disabled' : ''}>
          Usar XML seleccionados
        </button>
      </div>
      ` : `
      <div class="empty-state">
        <div class="icon">📥</div>
        <h3>Sin XML descargados</h3>
        <p>Presione <strong>Descargar XML del contribuyente</strong> para obtener sus comprobantes (datos simulados por ahora).</p>
      </div>
      `}
    </div>
  `;

  return `
    <div class="card sat-notice mb-1">
      <div class="section-title">Flujo de conexión <span>Hacienda / SAT</span></div>
      <ol class="sat-steps">
        <li>Ingresar RFC, certificado, llave y contraseña</li>
        <li><strong>Conectar con SAT</strong></li>
        <li>Descargar XML del contribuyente</li>
        <li>Escoger XML (emitidos / recibidos)</li>
        <li><strong>Usar XML seleccionados</strong> → preparar información de impuestos</li>
      </ol>
    </div>
    ${credentialsForm}
    ${connectedPanel}
    <p class="legal-note mt-2">
      Herramienta orientativa. La conexión real con el SAT requiere integración con el Web Service de Descarga Masiva
      mediante un backend seguro. No almacenamos contraseñas ni llaves privadas en el dispositivo.
    </p>
  `;
}

function bindSatConnectEvents() {
  const form = $('#sat-connect-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const rfc = ($('#sat-connect-rfc')?.value || '').trim();
      const cerFile = $('#sat-connect-cer')?.files?.[0];
      const keyFile = $('#sat-connect-key')?.files?.[0];
      const password = $('#sat-connect-password')?.value || '';
      const btn = $('#sat-connect-btn');
      if (btn) { btn.disabled = true; btn.textContent = 'Conectando…'; }

      try {
        const result = await connectToSat({ rfc, cerFile, keyFile, password });
        updateSettings(state, {
          userRfc: result.rfc,
          satConnect: {
            ...getSatConnect(),
            rfc: result.rfc,
            isConnected: true,
            connectedAt: result.connectedAt,
            cerFileName: cerFile?.name || getSatConnect().cerFileName,
            keyFileName: keyFile?.name || getSatConnect().keyFileName,
            mode: SAT_CONNECT_MODE.simulated,
          },
        });
        showToast(result.message);
        render();
      } catch (err) {
        showToast(err.message || 'Error al conectar con el SAT', 'error');
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = getSatConnect().isConnected ? 'Reconectar con SAT' : 'Conectar con SAT'; }
      }
    });
  }

  const disconnectBtn = $('#sat-disconnect-btn');
  if (disconnectBtn) {
    disconnectBtn.addEventListener('click', () => {
      disconnectSat();
      updateSettings(state, {
        satConnect: {
          ...getSatConnect(),
          isConnected: false,
          connectedAt: null,
          xmlCatalog: [],
          lastDownloadAt: null,
        },
      });
      showToast('Desconectado del SAT');
      render();
    });
  }

  const downloadBtn = $('#sat-download-xml-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', async () => {
      const sc = getSatConnect();
      if (!sc.rfc) {
        showToast('Conecte primero con el SAT', 'error');
        return;
      }
      downloadBtn.disabled = true;
      downloadBtn.textContent = 'Descargando…';
      try {
        const catalog = await downloadXmlFromSat(sc.rfc);
        updateSettings(state, {
          satConnect: {
            ...sc,
            xmlCatalog: catalog,
            lastDownloadAt: new Date().toISOString(),
          },
        });
        showToast(`${catalog.length} XML descargados (simulado)`);
        render();
      } catch (err) {
        showToast(err.message || 'Error al descargar XML', 'error');
      } finally {
        downloadBtn.disabled = false;
        downloadBtn.textContent = getSatConnect().xmlCatalog?.length
          ? 'Actualizar XML del SAT'
          : 'Descargar XML del contribuyente';
      }
    });
  }

  $$('[data-sat-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      updateSettings(state, {
        satConnect: { ...getSatConnect(), xmlFilter: btn.dataset.satFilter },
      });
      render();
    });
  });

  const selectAllBtn = $('#sat-select-all');
  if (selectAllBtn) {
    selectAllBtn.addEventListener('click', () => {
      const sc = getSatConnect();
      const catalog = [...(sc.xmlCatalog || [])];
      const filtered = filterXmlCatalog(catalog, sc.xmlFilter || 'all');
      filtered.forEach((item) => {
        if (item.estado !== 'Cancelado') item.selected = true;
      });
      updateSettings(state, { satConnect: { ...sc, xmlCatalog: catalog } });
      render();
    });
  }

  const deselectAllBtn = $('#sat-deselect-all');
  if (deselectAllBtn) {
    deselectAllBtn.addEventListener('click', () => {
      const sc = getSatConnect();
      const catalog = setAllSelected([...(sc.xmlCatalog || [])], false);
      updateSettings(state, { satConnect: { ...sc, xmlCatalog: catalog } });
      render();
    });
  }

  $$('.sat-xml-check').forEach((chk) => {
    chk.addEventListener('change', () => {
      const sc = getSatConnect();
      const catalog = toggleXmlSelection([...(sc.xmlCatalog || [])], chk.dataset.satXmlId, chk.checked);
      updateSettings(state, { satConnect: { ...sc, xmlCatalog: catalog } });
      const selectedCount = getSelectedXml(catalog).length;
      const useBtn = $('#sat-use-selected-btn');
      const hint = document.querySelector('.sat-connect-footer .card-hint');
      if (useBtn) useBtn.disabled = selectedCount === 0;
      if (hint) hint.textContent = `${selectedCount} XML seleccionado(s) de ${catalog.length}`;
      chk.closest('tr')?.classList.toggle('sat-row-selected', chk.checked);
    });
  });

  const useSelectedBtn = $('#sat-use-selected-btn');
  if (useSelectedBtn) {
    useSelectedBtn.addEventListener('click', () => {
      const sc = getSatConnect();
      const selected = getSelectedXml(sc.xmlCatalog || []);
      if (selected.length === 0) {
        showToast('Seleccione al menos un XML', 'error');
        return;
      }
      const result = importSelectedXmlToTaxPrep(state, sc.xmlCatalog, sc.rfc);
      appendSatImportLog(result, 'Conexión SAT (selección)');
      const msg = `Importados: ${result.incomes} ingresos, ${result.expenses} gastos` +
        (result.skipped ? ` · ${result.skipped} duplicados omitidos` : '');
      showToast(msg);
      if (result.incomes + result.expenses > 0) {
        setTimeout(() => navigate('dashboard'), 800);
      } else {
        render();
      }
    });
  }
}

async function processSatFileUpload(fileList, sourceLabel) {
  const statusEl = $('#sat-import-status');
  if (!state.settings.userRfc?.trim()) {
    showToast('Configure su RFC antes de importar para clasificar ingresos y gastos', 'error');
    return;
  }
  if (statusEl) statusEl.textContent = 'Leyendo archivos…';

  try {
    const files = [...fileList];
    let xmlItems = [];
    if (files.length === 1 && (files[0].name.endsWith('.zip') || files[0].name.endsWith('.xml'))) {
      xmlItems = await extractXmlFromSatPackage(files[0]);
    } else {
      xmlItems = await extractXmlFromFileList(files);
    }

    if (xmlItems.length === 0) {
      showToast('No se encontraron CFDI XML válidos en los archivos', 'error');
      if (statusEl) statusEl.textContent = '';
      return;
    }

    const existing = getExistingCfdiUuids(state);
    const result = importSatXmlBatch(state, xmlItems, state.settings.userRfc, existing);
    appendSatImportLog(result, sourceLabel);

    const msg = `Importados: ${result.incomes} ingresos, ${result.expenses} gastos` +
      (result.skipped ? ` · ${result.skipped} duplicados omitidos` : '') +
      (result.errors.length ? ` · ${result.errors.length} errores` : '');
    showToast(msg);
    if (statusEl) statusEl.textContent = msg;
    if (result.errors.length) console.warn('SAT import errors:', result.errors);
    render();
  } catch (err) {
    showToast(err.message || 'Error al importar XML del SAT', 'error');
    if (statusEl) statusEl.textContent = '';
  }
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
        <button class="btn btn-secondary btn-sm" id="export-cfdi-zip">CFDI SAT (ZIP)</button>
        <label class="btn btn-secondary btn-sm" style="cursor:pointer;margin:0">
          Importar XML
          <input type="file" id="import-xml" accept=".xml,application/xml" hidden>
        </label>
        <button class="btn btn-secondary btn-sm" data-nav="sat-download">Descarga SAT →</button>
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
function saveRegimeToProfile(regimeId) {
  const regime = getRegimeById(rsState.catalog, regimeId);
  if (!regime) {
    showToast('Régimen no encontrado', 'error');
    return;
  }
  const mapped = mapRegimeToAppSettings(regime);
  const prev = state.settings.taxProfile || {};
  const selectedIds = [...new Set([...(prev.selectedRegimeIds || []), regimeId])];
  updateSettings(state, {
    ...mapped,
    taxProfile: {
      ...prev,
      ...mapped,
      selectedRegimeIds: selectedIds,
      selectedRegimeCatalogId: regimeId,
      selectedRegimeName: regime.name,
      taxpayerType: regime.taxpayerType,
    },
  });
  showToast(`Régimen guardado en tu perfil: ${regime.name}`);
}

function render() {
  const content = $('#content');
  const isRegimeModule = currentView === 'regime-selector';
  document.body.classList.toggle('regime-module-active', isRegimeModule);

  if (isRegimeModule) {
    content.innerHTML = renderRegimeSelectorModule(rsState, state.settings.taxProfile || {});
    bindRegimeSelector(content, rsState, {
      onNavigate: () => {
        updateHash();
        syncNavUI();
        render();
      },
      onSaveProfile: saveRegimeToProfile,
      onToast: showToast,
      onQuestionnaireComplete: (profile, recommendedIds) => {
        updateSettings(state, {
          taxProfile: {
            ...(state.settings.taxProfile || {}),
            ...profile,
            recommendedRegimeIds: recommendedIds,
            lastQuestionnaireAt: new Date().toISOString(),
          },
        });
      },
    });
    syncNavUI();
    return;
  }

  const views = {
    dashboard: renderDashboard,
    income: renderIncomeForm,
    expense: renderExpenseForm,
    sifting: renderSifting,
    documentation: renderDocumentation,
    calculator: renderCalculator,
    reports: renderReports,
    score: renderScore,
    'sat-download': renderSatDownload,
    'sat-connect': renderSatConnect,
  };
  content.innerHTML = views[currentView]();
  updateSiftingBadge();
  bindViewEvents();
  bindSatConnectEvents();
  focusPrimaryAmountInput();
  syncNavUI();
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

  const satSaveRfc = $('#sat-save-rfc');
  if (satSaveRfc) {
    satSaveRfc.addEventListener('click', () => {
      const rfc = ($('#sat-user-rfc')?.value || '').trim().toUpperCase();
      if (rfc && (rfc.length < 12 || rfc.length > 13)) {
        showToast('RFC debe tener 12 (moral) o 13 (física) caracteres', 'error');
        return;
      }
      updateSettings(state, { userRfc: rfc });
      showToast(rfc ? `RFC guardado: ${rfc}` : 'RFC eliminado');
    });
  }

  const satUploadZip = $('#sat-upload-zip');
  if (satUploadZip) {
    satUploadZip.addEventListener('change', async () => {
      if (!satUploadZip.files?.length) return;
      await processSatFileUpload(satUploadZip.files, 'ZIP SAT');
      satUploadZip.value = '';
    });
  }

  const satUploadFolder = $('#sat-upload-folder');
  if (satUploadFolder) {
    satUploadFolder.addEventListener('change', async () => {
      if (!satUploadFolder.files?.length) return;
      await processSatFileUpload(satUploadFolder.files, 'Carpeta XML');
      satUploadFolder.value = '';
    });
  }

  const satUploadXml = $('#sat-upload-xml');
  if (satUploadXml) {
    satUploadXml.addEventListener('change', async () => {
      if (!satUploadXml.files?.length) return;
      await processSatFileUpload(satUploadXml.files, 'XML sueltos');
      satUploadXml.value = '';
    });
  }

  const satExportZip = $('#sat-export-zip');
  if (satExportZip) {
    satExportZip.addEventListener('click', async () => {
      const count = await downloadStoredCfdiAsZip(state);
      if (count === 0) showToast('No hay XML de CFDI almacenados', 'error');
      else showToast(`${count} XML exportados en ZIP`);
    });
  }

  const satDemoImport = $('#sat-demo-import');
  if (satDemoImport) {
    satDemoImport.addEventListener('click', async () => {
      try {
        const res = await fetch('samples/cfdi-ejemplo.xml');
        if (!res.ok) throw new Error('No se pudo cargar el ejemplo');
        const text = await res.text();
        const existing = getExistingCfdiUuids(state);
        const result = importSatXmlBatch(state, [{ name: 'cfdi-ejemplo.xml', xml: text }], state.settings.userRfc, existing);
        appendSatImportLog(result, 'Ejemplo demo');
        showToast(`Demo: ${result.incomes} ingreso(s), ${result.expenses} gasto(s)`);
        render();
      } catch (err) {
        showToast(err.message || 'Error en importación demo', 'error');
      }
    });
  }

  const exportCfdiZipBtn = $('#export-cfdi-zip');
  if (exportCfdiZipBtn) {
    exportCfdiZipBtn.addEventListener('click', async () => {
      const count = await downloadStoredCfdiAsZip(state);
      if (count === 0) showToast('No hay XML de CFDI almacenados', 'error');
      else showToast(`${count} CFDI exportados en ZIP`);
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
  const initial = parseHash();
  currentView = initial.view;
  if (initial.regimeSub) {
    rsState.subView = initial.regimeSub;
    if (rsState.subView === 'list' && !rsState.listType) {
      rsState.listType = 'individual';
    }
  }

  $('#current-date').textContent = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  $$('.nav-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      if (view === currentView && view === 'regime-selector') {
        goToRegimeSubView('home');
        return;
      }
      navigate(view, { regimeSubView: view === 'regime-selector' ? 'home' : undefined });
    });
  });

  const viewJump = $('#view-jump');
  if (viewJump) {
    viewJump.addEventListener('change', () => {
      handleViewJump(viewJump.value);
    });
  }

  window.addEventListener('hashchange', () => {
    const parsed = parseHash();
    currentView = parsed.view;
    if (parsed.regimeSub) {
      rsState.subView = parsed.regimeSub;
      if (rsState.subView === 'list' && !rsState.listType) {
        rsState.listType = 'individual';
      }
    }
    syncNavUI();
    applyViewMeta();
    render();
  });

  $('#menu-toggle').addEventListener('click', () => {
    $('#sidebar').classList.toggle('open');
    $('#overlay').classList.toggle('visible');
  });

  $('#overlay').addEventListener('click', closeSidebar);

  $$('[data-close-modal]').forEach((el) => {
    el.addEventListener('click', closeModal);
  });

  syncNavUI();
  applyViewMeta();
  render();
}

init();
