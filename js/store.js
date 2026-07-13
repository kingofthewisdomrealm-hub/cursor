const STORAGE_KEY = 'tax-power-mapper-data';

const DEFAULT_STATE = {
  incomes: [],
  expenses: [],
  settings: {
    taxRegime: 'resico',
    taxPercentage: 30,
    defaultIvaRate: '16',
    isIvaLiable: true,
  },
};

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    return {
      incomes: parsed.incomes ?? [],
      expenses: parsed.expenses ?? [],
      settings: { ...DEFAULT_STATE.settings, ...parsed.settings },
    };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function addIncome(state, income) {
  const entry = { id: generateId(), createdAt: new Date().toISOString(), ...income };
  state.incomes.push(entry);
  saveState(state);
  return entry;
}

export function addExpense(state, expense) {
  const entry = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    classification: null,
    mixedCommercialPercent: null,
    ...expense,
  };
  state.expenses.push(entry);
  saveState(state);
  return entry;
}

export function updateExpense(state, id, updates) {
  const idx = state.expenses.findIndex((e) => e.id === id);
  if (idx === -1) return null;
  state.expenses[idx] = { ...state.expenses[idx], ...updates };
  saveState(state);
  return state.expenses[idx];
}

export function updateIncome(state, id, updates) {
  const idx = state.incomes.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  state.incomes[idx] = { ...state.incomes[idx], ...updates };
  saveState(state);
  return state.incomes[idx];
}

export function updateSettings(state, settings) {
  state.settings = { ...state.settings, ...settings };
  saveState(state);
}

export function deleteTransaction(state, type, id) {
  if (type === 'income') {
    state.incomes = state.incomes.filter((i) => i.id !== id);
  } else {
    state.expenses = state.expenses.filter((e) => e.id !== id);
  }
  saveState(state);
}

/** Categorías alineadas con deducciones autorizadas (Art. 27 LISR). */
export const CATEGORIES = [
  'Arrendamiento',
  'Honorarios y servicios profesionales',
  'Combustibles y vehículos',
  'Viáticos y hospedaje',
  'Telecomunicaciones e internet',
  'Seguros y fianzas',
  'Equipo de cómputo y software',
  'Publicidad y marketing',
  'Capacitación',
  'Cuotas IMSS e INFONAVIT',
  'Suministros de oficina',
  'Otros gastos deducibles',
];

export const PAYMENT_METHODS = [
  'Transferencia SPEI',
  'Tarjeta de crédito',
  'Tarjeta de débito',
  'Efectivo',
  'PayPal / Stripe',
  'Otro',
];

export const INCOME_SOURCES = [
  'Servicios profesionales (honorarios)',
  'Venta de productos',
  'Consultoría',
  'Comisiones',
  'Regalías',
  'Arrendamiento',
  'Otro ingreso gravado',
];
