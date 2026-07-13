/** Constantes y cálculos orientativos — LISR, LIVA, RESICO (PF y PM). */

export const CONTRIBUYENTE_TYPES = {
  persona_fisica: {
    id: 'persona_fisica',
    label: 'Persona Física',
    shortLabel: 'PF',
    description: 'Emprendedores, freelancers y profesionistas independientes.',
    legalRef: 'Título IV LISR',
  },
  persona_moral: {
    id: 'persona_moral',
    label: 'Persona Moral',
    shortLabel: 'PM',
    description: 'Sociedades mercantiles, S.A. de C.V., S. de R.L., etc.',
    legalRef: 'Título II LISR',
  },
};

export const TAX_REGIMES = {
  /* ── Personas Físicas ── */
  resico_pf: {
    id: 'resico_pf',
    contributorType: 'persona_fisica',
    label: 'RESICO',
    fullName: 'Régimen Simplificado de Confianza (PF)',
    allowsDeductions: false,
    description: 'ISR sobre ingresos cobrados del mes. Sin deducción de gastos.',
    legalRef: 'Art. 113-E LISR',
    group: 'Persona Física',
  },
  actividad_empresarial_pf: {
    id: 'actividad_empresarial_pf',
    contributorType: 'persona_fisica',
    label: 'Actividad Empresarial',
    fullName: 'Actividad Empresarial y Profesional (PF)',
    allowsDeductions: true,
    description: 'Deducciones autorizadas con CFDI. ISR sobre utilidad fiscal.',
    legalRef: 'Título IV, Cap. II LISR',
    group: 'Persona Física',
  },
  arrendamiento_pf: {
    id: 'arrendamiento_pf',
    contributorType: 'persona_fisica',
    label: 'Arrendamiento',
    fullName: 'Régimen de Arrendamiento (PF)',
    allowsDeductions: true,
    description: 'Para ingresos por renta de inmuebles. Deducciones específicas.',
    legalRef: 'Título IV, Cap. III LISR',
    group: 'Persona Física',
  },
  manual_pf: {
    id: 'manual_pf',
    contributorType: 'persona_fisica',
    label: 'Tasa manual',
    fullName: 'Estimación personalizada (PF)',
    allowsDeductions: true,
    description: 'Porcentaje estimado de ISR. Consulte con su contador.',
    legalRef: 'Estimación orientativa',
    group: 'Persona Física',
  },

  /* ── Personas Morales ── */
  resico_pm: {
    id: 'resico_pm',
    contributorType: 'persona_moral',
    label: 'RESICO',
    fullName: 'Régimen Simplificado de Confianza (PM)',
    allowsDeductions: false,
    description: 'ISR sobre ingresos cobrados. Tarifas superiores a PF.',
    legalRef: 'Art. 113-E LISR',
    group: 'Persona Moral',
  },
  general_ley_pm: {
    id: 'general_ley_pm',
    contributorType: 'persona_moral',
    label: 'General de Ley',
    fullName: 'Régimen General de Ley Personas Morales',
    allowsDeductions: true,
    description: 'ISR 30% sobre utilidad fiscal. Deducciones y PTU según LISR.',
    legalRef: 'Título II LISR',
    group: 'Persona Moral',
  },
  coordinados_pm: {
    id: 'coordinados_pm',
    contributorType: 'persona_moral',
    label: 'Coordinados',
    fullName: 'Régimen de Actividades Agrícolas, Ganaderas… (opcional PM)',
    allowsDeductions: true,
    description: 'Para personas morales con actividades coordinadas específicas.',
    legalRef: 'Título II, Cap. VI LISR',
    group: 'Persona Moral',
  },
  manual_pm: {
    id: 'manual_pm',
    contributorType: 'persona_moral',
    label: 'Tasa manual',
    fullName: 'Estimación personalizada (PM)',
    allowsDeductions: true,
    description: 'Porcentaje estimado de ISR corporativo.',
    legalRef: 'Estimación orientativa',
    group: 'Persona Moral',
  },
};

/** Migración de IDs antiguos */
const LEGACY_REGIME_MAP = {
  resico: 'resico_pf',
  actividad_empresarial: 'actividad_empresarial_pf',
  manual: 'manual_pf',
};

export function normalizeRegimeId(regimeId) {
  return LEGACY_REGIME_MAP[regimeId] || regimeId || 'resico_pf';
}

export function normalizeContributorType(type, regimeId) {
  if (type && CONTRIBUYENTE_TYPES[type]) return type;
  const regime = getRegime(regimeId);
  return regime.contributorType || 'persona_fisica';
}

/** Tarifa RESICO personas físicas — SAT 2025 */
export const RESICO_PF_RATES = [
  { maxAnnual: 300_000, rate: 0.01 },
  { maxAnnual: 600_000, rate: 0.011 },
  { maxAnnual: 1_000_000, rate: 0.015 },
  { maxAnnual: 2_500_000, rate: 0.02 },
  { maxAnnual: 3_500_000, rate: 0.025 },
];

/** Tarifa RESICO personas morales — SAT 2025 */
export const RESICO_PM_RATES = [
  { maxAnnual: 300_000, rate: 0.02 },
  { maxAnnual: 600_000, rate: 0.022 },
  { maxAnnual: 1_000_000, rate: 0.025 },
  { maxAnnual: 2_500_000, rate: 0.03 },
  { maxAnnual: 3_500_000, rate: 0.035 },
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

export function getRegimesForContributor(contributorType) {
  return Object.values(TAX_REGIMES).filter((r) => r.contributorType === contributorType);
}

export function getResicoRateForAnnualIncome(annualIncome, contributorType = 'persona_fisica') {
  const income = Math.max(0, Number(annualIncome) || 0);
  const table = contributorType === 'persona_moral' ? RESICO_PM_RATES : RESICO_PF_RATES;
  for (const bracket of table) {
    if (income <= bracket.maxAnnual) return bracket.rate;
  }
  return table[table.length - 1].rate;
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
  const id = normalizeRegimeId(regimeId);
  return TAX_REGIMES[id] ?? TAX_REGIMES.resico_pf;
}

export function getContributorType(contributorTypeId) {
  return CONTRIBUYENTE_TYPES[contributorTypeId] ?? CONTRIBUYENTE_TYPES.persona_fisica;
}

export function regimeAllowsDeductions(regimeId) {
  return getRegime(regimeId).allowsDeductions;
}

export function getDefaultRegimeForContributor(contributorType) {
  return contributorType === 'persona_moral' ? 'resico_pm' : 'resico_pf';
}

export function estimateIsrReserve({
  regimeId,
  contributorType,
  totalIncome,
  taxableProfit,
  annualIncomeYTD,
  manualRate,
}) {
  const regime = getRegime(regimeId);
  const ctype = contributorType || regime.contributorType;

  if (regime.id === 'resico_pf' || regime.id === 'resico_pm') {
    const rate = getResicoRateForAnnualIncome(annualIncomeYTD, ctype);
    const label = ctype === 'persona_moral' ? 'RESICO PM' : 'RESICO PF';
    return {
      amount: Math.max(0, totalIncome * rate),
      rate: rate * 100,
      method: `${label} ${(rate * 100).toFixed(1)}% sobre ingresos cobrados`,
      note: 'En RESICO no se deducen gastos para ISR.',
    };
  }

  if (regime.id === 'actividad_empresarial_pf' || regime.id === 'arrendamiento_pf' || regime.id === 'coordinados_pm') {
    const profit = Math.max(0, taxableProfit);
    const estimatedRate = profit > 0 ? Math.min(35, Math.max(10, 10 + (profit / 500_000) * 5)) : 0;
    return {
      amount: profit * (estimatedRate / 100),
      rate: estimatedRate,
      method: `ISR PF estimado ~${estimatedRate.toFixed(0)}% sobre utilidad fiscal`,
      note: 'Pagos provisionales mensuales ante el SAT.',
    };
  }

  if (regime.id === 'general_ley_pm') {
    const profit = Math.max(0, taxableProfit);
    const corporateRate = 30;
    return {
      amount: profit * (corporateRate / 100),
      rate: corporateRate,
      method: `ISR PM ${corporateRate}% sobre utilidad fiscal (General de Ley)`,
      note: 'Tasa corporativa Art. 9 LISR. No incluye PTU ni estímulos.',
    };
  }

  const rate = Number(manualRate) || (ctype === 'persona_moral' ? 30 : 25);
  return {
    amount: Math.max(0, taxableProfit * (rate / 100)),
    rate,
    method: `Tasa manual ${rate}% (${getContributorType(ctype).shortLabel})`,
    note: 'Estimación personalizada. Consulte con un contador.',
  };
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
