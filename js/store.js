const STORAGE_KEY = 'tax-power-mapper-data';

const DEFAULT_STATE = {
  incomes: [],
  expenses: [],
  settings: {
    taxPercentage: 30,
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

export const CATEGORIES = [
  'Software y suscripciones',
  'Equipo y tecnología',
  'Oficina y suministros',
  'Marketing y publicidad',
  'Viajes y transporte',
  'Comidas de negocio',
  'Servicios profesionales',
  'Seguros',
  'Educación y capacitación',
  'Telecomunicaciones',
  'Arrendamiento',
  'Otros',
];

export const PAYMENT_METHODS = [
  'Transferencia',
  'Tarjeta de crédito',
  'Tarjeta de débito',
  'Efectivo',
  'PayPal',
  'Otro',
];

export const INCOME_SOURCES = [
  'Servicios freelance',
  'Venta de productos',
  'Consultoría',
  'Regalías',
  'Comisiones',
  'Otro',
];
