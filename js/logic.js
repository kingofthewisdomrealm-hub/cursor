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
  return incomes.reduce((sum, i) => sum + Number(i.amount || 0), 0);
}

export function getTotalExpenses(expenses) {
  return expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
}

export function getDeductibleAmount(expense) {
  const amount = Number(expense.amount || 0);
  if (expense.classification === 'business') return amount;
  if (expense.classification === 'mixed') {
    const pct = Number(expense.mixedCommercialPercent ?? expense.commercialUsePercent ?? 0);
    return amount * (pct / 100);
  }
  return 0;
}

export function getPossibleDeductions(expenses) {
  return expenses.reduce((sum, e) => sum + getDeductibleAmount(e), 0);
}

export function getEstimatedTaxableProfit(incomes, expenses) {
  return getTotalIncome(incomes) - getPossibleDeductions(expenses);
}

export function getEstimatedTaxReserve(incomes, expenses, taxPercentage) {
  const profit = getEstimatedTaxableProfit(incomes, expenses);
  return Math.max(0, profit * (taxPercentage / 100));
}

export function getUnclassifiedExpenses(expenses) {
  return expenses.filter((e) => !e.classification);
}

export function getDocStatus(expense) {
  if (expense.classification === 'personal') {
    return { key: 'personal', label: 'Gasto personal' };
  }
  if (!expense.classification || expense.classification === 'unsure') {
    return { key: 'needs-clarification', label: 'Necesita aclaración' };
  }
  if (expense.classification === 'mixed' && expense.mixedCommercialPercent == null) {
    return { key: 'needs-clarification', label: 'Necesita aclaración' };
  }
  if (!expense.receiptData && (expense.classification === 'business' || expense.classification === 'mixed')) {
    return { key: 'missing-receipt', label: 'Falta recibo' };
  }
  if (!expense.commercialPurpose?.trim() && (expense.classification === 'business' || expense.classification === 'mixed')) {
    return { key: 'missing-purpose', label: 'Falta propósito comercial' };
  }
  return { key: 'ready', label: 'Listo para revisión' };
}

export function getMissingReceiptsCount(expenses) {
  return expenses.filter((e) => {
    const status = getDocStatus(e);
    return status.key === 'missing-receipt';
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
      factors: {
        receipts: 0,
        classified: 0,
        complete: 0,
        documented: 0,
      },
      recommendations: ['Comience registrando sus primeros ingresos y gastos.'],
    };
  }

  const deductibleExpenses = expenses.filter(
    (e) => e.classification === 'business' || e.classification === 'mixed'
  );
  const receiptsScore =
    deductibleExpenses.length === 0
      ? 100
      : (deductibleExpenses.filter((e) => e.receiptData).length / deductibleExpenses.length) * 100;

  const classifiedScore =
    expenses.length === 0 ? 100 : (expenses.filter((e) => e.classification).length / expenses.length) * 100;

  const completeScore =
    allTransactions === 0
      ? 0
      : ((incomes.filter((i) => i.amount && i.date && i.source).length +
          expenses.filter((e) => e.amount && e.date && e.merchant && e.category).length) /
          allTransactions) *
        100;

  const documentedCount =
    incomes.filter((i) => i.amount && i.date && i.source && i.clientProject).length +
    expenses.filter((e) => isExpenseComplete(e)).length;
  const documentedScore = (documentedCount / allTransactions) * 100;

  const total = Math.round(
    receiptsScore * 0.3 + classifiedScore * 0.25 + completeScore * 0.2 + documentedScore * 0.25
  );

  const recommendations = [];
  if (receiptsScore < 80) {
    recommendations.push('Adjunte recibos a sus gastos de negocio para respaldar posibles deducciones.');
  }
  if (classifiedScore < 100) {
    recommendations.push('Clasifique todos sus gastos en el motor SIFTING (Negocio, Personal, Mixto).');
  }
  if (completeScore < 90) {
    recommendations.push('Complete la información faltante en sus transacciones (fechas, categorías, fuentes).');
  }
  if (documentedScore < 75) {
    recommendations.push('Agregue propósito comercial y datos de cliente/proyecto a más transacciones.');
  }
  if (recommendations.length === 0) {
    recommendations.push('¡Excelente! Su documentación fiscal está muy bien organizada. Consulte con un profesional de impuestos.');
  }

  return {
    total,
    factors: {
      receipts: Math.round(receiptsScore),
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
      .reduce((s, inc) => s + Number(inc.amount), 0);

    const monthExpense = expenses
      .filter((exp) => {
        const ed = new Date(exp.date + 'T12:00:00');
        return ed.getFullYear() === year && ed.getMonth() === month;
      })
      .reduce((s, exp) => s + Number(exp.amount), 0);

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
    ['Tipo', 'Monto', 'Fecha', 'Descripción', 'Categoría/Fuente', 'Cliente/Proyecto', 'Clasificación', 'Estado documentación', 'Notas'],
  ];

  incomes.forEach((i) => {
    rows.push([
      'Ingreso',
      i.amount,
      i.date,
      i.source,
      i.source,
      i.clientProject || '',
      '—',
      '—',
      i.notes || '',
    ]);
  });

  expenses.forEach((e) => {
    const status = getDocStatus(e);
    rows.push([
      'Gasto',
      e.amount,
      e.date,
      e.merchant,
      e.category,
      e.clientProject || '',
      e.classification || 'Sin clasificar',
      status.label,
      e.notes || '',
    ]);
  });

  return rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    )
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
