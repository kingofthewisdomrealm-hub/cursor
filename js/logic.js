import {
  getSubtotal,
  getIvaFromTransaction,
  getAnnualIncomeYTD,
  getEstimatedIvaPayable,
  getTotalIvaCollected,
  getTotalIvaCreditable,
  hasCfdiSupport,
  isValidCfdiUuid,
  estimateIsrReserve,
  regimeAllowsDeductions,
  getRegime,
} from './mexico-tax.js';

export function parseAmount(value) {
  if (value == null || value === '') return null;
  const normalized = String(value).trim().replace(/\s/g, '').replace(/,/g, '.');
  const parsed = parseFloat(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}

export function formatCurrency(amount) {
  const safe = Number(amount);
  if (!Number.isFinite(safe)) return '$0.00';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(safe);
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function getTotalIncome(incomes) {
  return incomes.reduce((sum, i) => sum + getSubtotal(i), 0);
}

export function getTotalExpenses(expenses) {
  return expenses.reduce((sum, e) => sum + getSubtotal(e), 0);
}

export function getDeductibleAmount(expense, regimeId = 'actividad_empresarial') {
  if (!regimeAllowsDeductions(regimeId)) return 0;
  const amount = getSubtotal(expense);
  if (expense.classification === 'business') {
    return hasCfdiSupport(expense) ? amount : amount * 0.5;
  }
  if (expense.classification === 'mixed') {
    const pct = Number(expense.mixedCommercialPercent ?? expense.commercialUsePercent ?? 0);
    const base = hasCfdiSupport(expense) ? amount : amount * 0.5;
    return base * (pct / 100);
  }
  return 0;
}

export function getPossibleDeductions(expenses, regimeId = 'actividad_empresarial') {
  if (!regimeAllowsDeductions(regimeId)) return 0;
  return expenses.reduce((sum, e) => sum + getDeductibleAmount(e, regimeId), 0);
}

export function getEstimatedTaxableProfit(incomes, expenses, regimeId = 'actividad_empresarial') {
  const income = getTotalIncome(incomes);
  if (!regimeAllowsDeductions(regimeId)) return income;
  return income - getPossibleDeductions(expenses, regimeId);
}

export function getTaxEstimate(incomes, expenses, settings) {
  const regimeId = settings.taxRegime ?? 'resico';
  const totalIncome = getTotalIncome(incomes);
  const taxableProfit = getEstimatedTaxableProfit(incomes, expenses, regimeId);
  const annualIncomeYTD = getAnnualIncomeYTD(incomes);
  const isr = estimateIsrReserve({
    regimeId,
    totalIncome,
    taxableProfit,
    annualIncomeYTD,
    manualRate: settings.taxPercentage,
  });
  const ivaPayable = settings.isIvaLiable
    ? getEstimatedIvaPayable(incomes, expenses)
    : 0;

  return {
    regime: getRegime(regimeId),
    isr,
    ivaPayable,
    ivaCollected: getTotalIvaCollected(incomes),
    ivaCreditable: getTotalIvaCreditable(expenses),
    taxableProfit,
    totalIncome,
    deductions: getPossibleDeductions(expenses, regimeId),
    totalReserve: isr.amount + ivaPayable,
  };
}

export function getEstimatedTaxReserve(incomes, expenses, settings) {
  return getTaxEstimate(incomes, expenses, settings).isr.amount;
}

export function getUnclassifiedExpenses(expenses) {
  return expenses.filter((e) => !e.classification);
}

export function getDocStatus(expense) {
  if (expense.classification === 'personal') {
    return { key: 'personal', label: 'Gasto no deducible (personal)' };
  }
  if (!expense.classification || expense.classification === 'unsure') {
    return { key: 'needs-clarification', label: 'Necesita aclaración' };
  }
  if (expense.classification === 'mixed' && expense.mixedCommercialPercent == null) {
    return { key: 'needs-clarification', label: 'Necesita aclaración' };
  }
  if ((expense.classification === 'business' || expense.classification === 'mixed')) {
    if (!isValidCfdiUuid(expense.cfdiUuid) && !expense.cfdiXml && !expense.receiptData) {
      return { key: 'missing-cfdi', label: 'Falta CFDI' };
    }
    if (!expense.commercialPurpose?.trim()) {
      return { key: 'missing-purpose', label: 'Falta relación con actividad' };
    }
    if (!hasCfdiSupport(expense)) {
      return { key: 'missing-receipt', label: 'Falta comprobante' };
    }
  }
  return { key: 'ready', label: 'Listo para revisión SAT' };
}

export function getMissingReceiptsCount(expenses) {
  return expenses.filter((e) => {
    const status = getDocStatus(e);
    return status.key === 'missing-cfdi' || status.key === 'missing-receipt';
  }).length;
}

export function getMissingCfdiCount(expenses) {
  return expenses.filter((e) => {
    const status = getDocStatus(e);
    return status.key === 'missing-cfdi';
  }).length;
}

export function isExpenseComplete(expense) {
  const status = getDocStatus(expense);
  return status.key === 'ready' || status.key === 'personal';
}

export function getPreparationScore(incomes, expenses) {
  const allTransactions = incomes.length + expenses.length;
  if (allTransactions === 0) {
    return {
      total: 0,
      factors: { receipts: 0, classified: 0, complete: 0, documented: 0 },
      recommendations: ['Comience registrando sus ingresos cobrados y gastos con CFDI.'],
    };
  }

  const deductibleExpenses = expenses.filter(
    (e) => e.classification === 'business' || e.classification === 'mixed'
  );
  const cfdiScore =
    deductibleExpenses.length === 0
      ? 100
      : (deductibleExpenses.filter((e) => hasCfdiSupport(e) && isValidCfdiUuid(e.cfdiUuid)).length /
          deductibleExpenses.length) *
        100;

  const classifiedScore =
    expenses.length === 0 ? 100 : (expenses.filter((e) => e.classification).length / expenses.length) * 100;

  const completeScore =
    ((incomes.filter((i) => i.amount && i.date && i.source).length +
      expenses.filter((e) => e.amount && e.date && e.merchant && e.category).length) /
      allTransactions) *
    100;

  const documentedCount =
    incomes.filter((i) => i.amount && i.date && i.source && (i.cfdiUuid || i.clientProject)).length +
    expenses.filter((e) => isExpenseComplete(e)).length;
  const documentedScore = (documentedCount / allTransactions) * 100;

  const total = Math.round(
    cfdiScore * 0.35 + classifiedScore * 0.25 + completeScore * 0.15 + documentedScore * 0.25
  );

  const recommendations = [];
  if (cfdiScore < 80) {
    recommendations.push('Solicite y registre el UUID del CFDI en cada gasto deducible (requisito SAT).');
  }
  if (classifiedScore < 100) {
    recommendations.push('Clasifique gastos en SIFTING: deducible, personal o mixto según el Art. 27 LISR.');
  }
  if (completeScore < 90) {
    recommendations.push('Complete fechas, categorías SAT y método de pago en cada movimiento.');
  }
  if (documentedScore < 75) {
    recommendations.push('Vincule gastos a su actividad económica y cliente/proyecto para auditoría.');
  }
  if (recommendations.length === 0) {
    recommendations.push('¡Buen trabajo! Consulte con un contador para su declaración ante el SAT.');
  }

  return {
    total,
    factors: {
      receipts: Math.round(cfdiScore),
      classified: Math.round(classifiedScore),
      complete: Math.round(completeScore),
      documented: Math.round(documentedScore),
    },
    recommendations,
  };
}

export function getMonthlyChartData(incomes, expenses, months = 6) {
  const now = new Date();
  const data = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const label = d.toLocaleDateString('es-MX', { month: 'short' });

    const monthIncome = incomes
      .filter((inc) => {
        const id = new Date(inc.date + 'T12:00:00');
        return id.getFullYear() === year && id.getMonth() === month;
      })
      .reduce((s, inc) => s + getSubtotal(inc), 0);

    const monthExpense = expenses
      .filter((exp) => {
        const ed = new Date(exp.date + 'T12:00:00');
        return ed.getFullYear() === year && ed.getMonth() === month;
      })
      .reduce((s, exp) => s + getSubtotal(exp), 0);

    data.push({ label, income: monthIncome, expense: monthExpense });
  }

  return data;
}

export function filterTransactions(incomes, expenses, filters) {
  let filteredIncomes = [...incomes];
  let filteredExpenses = [...expenses];

  if (filters.year) {
    const y = Number(filters.year);
    filteredIncomes = filteredIncomes.filter((i) => new Date(i.date + 'T12:00:00').getFullYear() === y);
    filteredExpenses = filteredExpenses.filter((e) => new Date(e.date + 'T12:00:00').getFullYear() === y);
  }

  if (filters.month) {
    const m = Number(filters.month) - 1;
    filteredIncomes = filteredIncomes.filter((i) => new Date(i.date + 'T12:00:00').getMonth() === m);
    filteredExpenses = filteredExpenses.filter((e) => new Date(e.date + 'T12:00:00').getMonth() === m);
  }

  if (filters.category) {
    filteredExpenses = filteredExpenses.filter((e) => e.category === filters.category);
    filteredIncomes = [];
  }

  if (filters.client) {
    filteredIncomes = filteredIncomes.filter((i) => i.clientProject === filters.client);
    filteredExpenses = filteredExpenses.filter((e) => e.clientProject === filters.client);
  }

  if (filters.project) {
    filteredIncomes = filteredIncomes.filter((i) => i.clientProject === filters.project);
    filteredExpenses = filteredExpenses.filter((e) => e.clientProject === filters.project);
  }

  if (filters.docStatus) {
    filteredExpenses = filteredExpenses.filter((e) => getDocStatus(e).key === filters.docStatus);
    filteredIncomes = [];
  }

  return { incomes: filteredIncomes, expenses: filteredExpenses };
}

export function exportToCSV(incomes, expenses) {
  const rows = [
    [
      'Tipo', 'Monto', 'Subtotal', 'IVA', 'Fecha', 'Descripción', 'Categoría/Fuente',
      'UUID CFDI', 'Cliente/Proyecto', 'Clasificación', 'Estado SAT', 'Notas',
    ],
  ];

  incomes.forEach((i) => {
    rows.push([
      'Ingreso',
      i.amount,
      getSubtotal(i),
      getIvaFromTransaction(i),
      i.date,
      i.source,
      i.source,
      i.cfdiUuid || '',
      i.clientProject || '',
      '—',
      i.cfdiUuid ? 'CFDI registrado' : 'Sin CFDI',
      i.notes || '',
    ]);
  });

  expenses.forEach((e) => {
    const status = getDocStatus(e);
    rows.push([
      'Gasto',
      e.amount,
      getSubtotal(e),
      getIvaFromTransaction(e),
      e.date,
      e.merchant,
      e.category,
      e.cfdiUuid || '',
      e.clientProject || '',
      e.classification || 'Sin clasificar',
      status.label,
      e.notes || '',
    ]);
  });

  return rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

export function getUniqueClients(incomes, expenses) {
  const set = new Set();
  incomes.forEach((i) => i.clientProject && set.add(i.clientProject));
  expenses.forEach((e) => e.clientProject && set.add(e.clientProject));
  return [...set].sort();
}

export function getAvailableYears(incomes, expenses) {
  const years = new Set();
  [...incomes, ...expenses].forEach((t) => {
    years.add(new Date(t.date + 'T12:00:00').getFullYear());
  });
  if (years.size === 0) years.add(new Date().getFullYear());
  return [...years].sort((a, b) => b - a);
}
