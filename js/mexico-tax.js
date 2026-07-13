/** Constantes y cálculos orientativos según normativa fiscal mexicana (LISR, LIVA, RESICO). */

export const TAX_REGIMES = {
  resico: {
    id: 'resico',
    label: 'RESICO',
    fullName: 'Régimen Simplificado de Confianza',
    allowsDeductions: false,
    description: 'Paga ISR sobre ingresos cobrados. No aplica deducciones de gastos.',
    legalRef: 'Art. 113-E y 113-I LISR',
  },
  actividad_empresarial: {
    id: 'actividad_empresarial',
    label: 'Actividad Empresarial',
    fullName: 'Actividad Empresarial y Profesional',
    allowsDeductions: true,
    description: 'Permite deducciones autorizadas con CFDI. ISR sobre utilidad estimada.',
    legalRef: 'Título IV, Cap. II LISR',
  },
  manual: {
    id: 'manual',
    label: 'Tasa manual',
    fullName: 'Estimación personalizada',
    allowsDeductions: true,
    description: 'Use un porcentaje estimado de ISR. Consulte con su contador.',
    legalRef: 'Estimación orientativa',
  },
};

/** Tarifa RESICO personas físicas 2025 — tasa mensual según ingresos anuales acumulados (SAT). */
export const RESICO_PF_RATES = [
  { maxAnnual: 300_000, rate: 0.01 },
  { maxAnnual: 600_000, rate: 0.011 },
  { maxAnnual: 1_000_000, rate: 0.015 },
  { maxAnnual: 2_500_000, rate: 0.02 },
  { maxAnnual: 3_500_000, rate: 0.025 },
];

export const IVA_OPTIONS = [
  { id: '16', label: 'IVA 16% (tasa general)', rate: 0.16 },
  { id: '8', label: 'IVA 8% (región fronteriza)', rate: 0.08 },
  { id: '0', label: 'Exento / sin IVA', rate: 0 },
];

export const CFDI_TYPES = [
  'Ingreso (factura emitida)',
  'Egreso (nota de crédito)',
  'Pago (complemento)',
  'Nómina',
  'Sin CFDI / ticket',
];

export const RETENTION_TYPES = [
  'Sin retención',
  'Retención ISR',
  'Retención IVA',
  'Retención ISR + IVA',
];

const CFDI_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidCfdiUuid(uuid) {
  return CFDI_UUID_RE.test(String(uuid || '').trim());
}

export function getResicoRateForAnnualIncome(annualIncome) {
  const income = Math.max(0, Number(annualIncome) || 0);
  for (const bracket of RESICO_PF_RATES) {
    if (income <= bracket.maxAnnual) return bracket.rate;
  }
  return RESICO_PF_RATES[RESICO_PF_RATES.length - 1].rate;
}

export function getAnnualIncomeYTD(incomes, year = new Date().getFullYear()) {
  return incomes
    .filter((i) => new Date(i.date + 'T12:00:00').getFullYear() === year)
    .reduce((sum, i) => sum + getSubtotal(i), 0);
}

export function getIvaRateFromId(rateId) {
  const option = IVA_OPTIONS.find((o) => o.id === String(rateId));
  return option?.rate ?? 0.16;
}

/** Monto gravado sin IVA (asume que el monto capturado incluye IVA si includesIva es true). */
export function getSubtotal(transaction) {
  const total = Number(transaction.amount || 0);
  if (!transaction.includesIva) return total;
  const rate = getIvaRateFromId(transaction.ivaRate ?? '16');
  if (rate === 0) return total;
  return total / (1 + rate);
}

export function getIvaFromTransaction(transaction) {
  const total = Number(transaction.amount || 0);
  if (!transaction.includesIva) return 0;
  const subtotal = getSubtotal(transaction);
  return total - subtotal;
}

export function getTotalIvaCollected(incomes) {
  return incomes.reduce((sum, i) => sum + getIvaFromTransaction(i), 0);
}

export function getTotalIvaCreditable(expenses) {
  return expenses
    .filter((e) => (e.classification === 'business' || e.classification === 'mixed') && hasCfdiSupport(e))
    .reduce((sum, e) => {
      const factor = e.classification === 'mixed'
        ? Number(e.mixedCommercialPercent ?? e.commercialUsePercent ?? 0) / 100
        : 1;
      return sum + getIvaFromTransaction(e) * factor;
    }, 0);
}

export function getEstimatedIvaPayable(incomes, expenses) {
  return Math.max(0, getTotalIvaCollected(incomes) - getTotalIvaCreditable(expenses));
}

export function hasCfdiSupport(expense) {
  return isValidCfdiUuid(expense.cfdiUuid) || Boolean(expense.cfdiXml) || Boolean(expense.receiptData);
}

export function getRegime(regimeId) {
  return TAX_REGIMES[regimeId] ?? TAX_REGIMES.resico;
}

export function regimeAllowsDeductions(regimeId) {
  return getRegime(regimeId).allowsDeductions;
}

export function estimateIsrReserve({
  regimeId,
  totalIncome,
  taxableProfit,
  annualIncomeYTD,
  manualRate,
}) {
  const regime = getRegime(regimeId);

  if (regime.id === 'resico') {
    const rate = getResicoRateForAnnualIncome(annualIncomeYTD);
    return {
      amount: Math.max(0, totalIncome * rate),
      rate: rate * 100,
      method: `RESICO ${(rate * 100).toFixed(1)}% sobre ingresos cobrados`,
      note: 'En RESICO no se deducen gastos para ISR.',
    };
  }

  if (regime.id === 'actividad_empresarial') {
    const profit = Math.max(0, taxableProfit);
    const estimatedRate = profit > 0 ? Math.min(35, Math.max(10, 10 + (profit / 500_000) * 5)) : 0;
    return {
      amount: profit * (estimatedRate / 100),
      rate: estimatedRate,
      method: `ISR estimado ~${estimatedRate.toFixed(0)}% sobre utilidad fiscal`,
      note: 'Tasa orientativa. Los pagos provisionales reales dependen del ejercicio anterior.',
    };
  }

  const rate = Number(manualRate) || 30;
  return {
    amount: Math.max(0, taxableProfit * (rate / 100)),
    rate,
    method: `Tasa manual ${rate}%`,
    note: 'Estimación personalizada. Consulte con un contador.',
  };
}

export function getMonthlyProvisionalIsr(annualReserve, monthIndex = new Date().getMonth()) {
  const monthsElapsed = monthIndex + 1;
  return annualReserve / 12;
}

export const SAT_DEDUCTION_HINTS = {
  'Arrendamiento': 'Deducible si el inmueble se usa exclusivamente para la actividad (Art. 27 LISR).',
  'Honorarios y servicios profesionales': 'Requiere CFDI con retenciones cuando aplique.',
  'Combustibles y vehículos': 'Solo deducible el uso estrictamente indispensable.',
  'Viáticos y hospedaje': 'Límite de deducción según zona geográfica SAT.',
  'Telecomunicaciones e internet': 'Deducible en proporción al uso comercial.',
  'Seguros y fianzas': 'Deben estar relacionados con la actividad.',
  'Equipo de cómputo y software': 'Puede deducirse o amortizarse según el monto.',
  'Publicidad y marketing': 'Deducible con CFDI que cumpla requisitos fiscales.',
  'Capacitación': 'Debe estar relacionada con la actividad económica.',
  'Cuotas IMSS e INFONAVIT': 'Deducible cuando corresponda al patrón o trabajador independiente.',
  'Suministros de oficina': 'Deducible con CFDI y uso comprobable.',
  'Otros gastos deducibles': 'Deben ser estrictamente indispensables (Art. 27 LISR).',
};
