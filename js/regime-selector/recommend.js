import { loadRecommendationRules } from './catalog-store.js';

const REASONS = {
  sueldo_empleador: 'Reportaste ingresos por sueldo de un empleador.',
  venta_productos: 'Indicaste venta de productos.',
  servicios_profesionales: 'Indicaste que prestas servicios profesionales.',
  negocio_propio: 'Mencionaste un negocio propio.',
  renta_propiedades: 'Reportaste ingresos por renta de propiedades.',
  plataformas_digitales: 'Obtienes ingresos por plataformas digitales.',
  intereses_inversiones: 'Recibes intereses o rendimientos de inversiones.',
  dividendos: 'Recibes dividendos o utilidades de empresas.',
  venta_bienes: 'Realizas venta de bienes.',
  premios: 'Obtuviste premios, sorteos o concursos.',
  otro: 'Tienes otros ingresos no clasificados claramente.',
  empresa_constituida: 'Indicaste que tienes una empresa o sociedad constituida.',
  organizacion_sin_fines: 'Tu organización parece no tener fines de lucro.',
  sector_primario: 'Tu actividad principal es del sector agrícola, ganadero, forestal o pesquero.',
  autotransporte: 'Tu actividad está relacionada con autotransporte.',
};

function scoreRegimes(profile, rules) {
  const scores = new Map();

  const addScore = (ids, sourceKey, weight = 1) => {
    ids.forEach((id) => {
      const prev = scores.get(id) || { score: 0, reasons: [] };
      prev.score += weight;
      if (sourceKey && !prev.reasons.includes(REASONS[sourceKey])) {
        prev.reasons.push(REASONS[sourceKey]);
      }
      scores.set(id, prev);
    });
  };

  if (profile.taxpayerType === 'company') {
    addScore(rules.empresa_constituida || ['pm_general_ley', 'pm_resico'], 'empresa_constituida', 3);
    if (profile.incomeSources.includes('sector_primario')) {
      addScore(rules.sector_primario, 'sector_primario', 3);
    }
    if (profile.incomeSources.includes('autotransporte')) {
      addScore(rules.autotransporte, 'autotransporte', 3);
    }
    if (profile.incomeSources.includes('organizacion_sin_fines')) {
      addScore(rules.organizacion_sin_fines, 'organizacion_sin_fines', 3);
    }
  } else {
    profile.incomeSources.forEach((source) => {
      const ids = rules[source];
      if (ids) addScore(ids, source, source === 'sueldo_empleador' ? 3 : 2);
    });

    if (profile.incomePattern === 'occasional' && profile.incomeSources.includes('venta_bienes')) {
      addScore(['pf_enajenacion_bienes'], 'venta_bienes', 2);
    }

    if (profile.incomeSources.length === 0 && profile.taxpayerType === 'individual') {
      addScore(['pf_demas_ingresos'], 'otro', 1);
    }

    if (profile.registeredWithSat === false) {
      addScore(['pf_sin_obligaciones'], null, 0.5);
    }
  }

  return [...scores.entries()]
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.score - a.score);
}

export function buildTaxProfileFromAnswers(answers) {
  const taxpayerType =
    answers.q1 === 'company' ? 'company'
      : answers.q1 === 'individual' ? 'individual'
        : 'unknown';

  return {
    taxpayerType,
    incomeSources: answers.q2 || [],
    incomePattern: answers.q3 || null,
    registeredWithSat: answers.q4 === 'yes' ? true : answers.q4 === 'no' ? false : null,
    currentRegimesCount: answers.q5 || null,
    recommendedRegimeIds: [],
    selectedRegimeIds: [],
    lastQuestionnaireAt: new Date().toISOString(),
  };
}

export function recommendRegimes(profile, catalog, max = 3) {
  const rules = loadRecommendationRules();
  const scored = scoreRegimes(profile, rules);

  const activeIds = new Set(catalog.filter((r) => r.active).map((r) => r.id));
  const filtered = scored.filter((s) => activeIds.has(s.id));

  if (profile.taxpayerType === 'company') {
    return filtered
      .filter((s) => s.id.startsWith('pm_'))
      .slice(0, max)
      .map((s) => ({ ...s, regime: catalog.find((r) => r.id === s.id) }));
  }

  if (profile.taxpayerType === 'individual') {
    return filtered
      .filter((s) => s.id.startsWith('pf_'))
      .slice(0, max)
      .map((s) => ({ ...s, regime: catalog.find((r) => r.id === s.id) }));
  }

  return filtered.slice(0, max).map((s) => ({
    ...s,
    regime: catalog.find((r) => r.id === s.id),
  }));
}

export const INCOME_SOURCE_OPTIONS = [
  { id: 'sueldo_empleador', label: 'Sueldo de un empleador' },
  { id: 'venta_productos', label: 'Venta de productos' },
  { id: 'servicios_profesionales', label: 'Servicios profesionales' },
  { id: 'negocio_propio', label: 'Negocio propio' },
  { id: 'renta_propiedades', label: 'Renta de propiedades' },
  { id: 'plataformas_digitales', label: 'Plataformas digitales' },
  { id: 'intereses_inversiones', label: 'Intereses o inversiones' },
  { id: 'dividendos', label: 'Dividendos' },
  { id: 'venta_bienes', label: 'Venta de bienes' },
  { id: 'premios', label: 'Premios' },
  { id: 'sector_primario', label: 'Actividad agrícola/ganadera/pesquera' },
  { id: 'autotransporte', label: 'Autotransporte' },
  { id: 'organizacion_sin_fines', label: 'Organización sin fines de lucro' },
  { id: 'otro', label: 'Otro' },
];

export const QUESTIONNAIRE_STEPS = [
  {
    id: 'q1',
    title: '¿Eres una persona o una empresa constituida legalmente?',
    type: 'single',
    options: [
      { value: 'individual', label: 'Soy persona física' },
      { value: 'company', label: 'Tengo una empresa o sociedad' },
      { value: 'unknown', label: 'No estoy seguro' },
    ],
  },
  {
    id: 'q2',
    title: '¿De dónde provienen tus ingresos?',
    subtitle: 'Puedes seleccionar varias opciones',
    type: 'multi',
    showIf: (a) => a.q1 === 'individual' || a.q1 === 'unknown',
    options: INCOME_SOURCE_OPTIONS,
  },
  {
    id: 'q2b',
    title: '¿Qué tipo de organización es?',
    type: 'multi',
    showIf: (a) => a.q1 === 'company',
    options: [
      { id: 'empresa_comercial', label: 'Empresa comercial o de servicios', mapsTo: 'negocio_propio' },
      { id: 'sin_fines', label: 'Organización sin fines de lucro', mapsTo: 'organizacion_sin_fines' },
      { id: 'sector_primario', label: 'Sector agrícola, ganadero o pesquero', mapsTo: 'sector_primario' },
      { id: 'transporte', label: 'Autotransporte', mapsTo: 'autotransporte' },
      { id: 'otro_pm', label: 'Otro tipo de sociedad', mapsTo: 'otro' },
    ],
    mapAnswers: (selected) => selected.map((s) => {
      const opt = QUESTIONNAIRE_STEPS.find((st) => st.id === 'q2b')?.options.find((o) => o.id === s);
      return opt?.mapsTo || s;
    }),
  },
  {
    id: 'q3',
    title: '¿Tus ingresos son recurrentes o fue una operación ocasional?',
    type: 'single',
    options: [
      { value: 'recurring', label: 'Recurrentes' },
      { value: 'occasional', label: 'Ocasionales' },
      { value: 'both', label: 'Ambos' },
    ],
  },
  {
    id: 'q4',
    title: '¿Estás registrado actualmente ante el SAT?',
    type: 'single',
    options: [
      { value: 'yes', label: 'Sí' },
      { value: 'no', label: 'No' },
      { value: 'unknown', label: 'No lo sé' },
    ],
  },
  {
    id: 'q5',
    title: '¿Actualmente tienes uno o varios regímenes fiscales registrados?',
    type: 'single',
    options: [
      { value: 'one', label: 'Uno' },
      { value: 'several', label: 'Varios' },
      { value: 'none', label: 'Ninguno' },
      { value: 'unknown', label: 'No lo sé' },
    ],
  },
];

export function getVisibleQuestions(answers) {
  return QUESTIONNAIRE_STEPS.filter((step) => !step.showIf || step.showIf(answers));
}

export function normalizeQuestionnaireAnswers(answers) {
  const normalized = { ...answers };
  if (answers.q1 === 'company' && answers.q2b) {
    const step = QUESTIONNAIRE_STEPS.find((s) => s.id === 'q2b');
    normalized.q2 = step?.mapAnswers?.(answers.q2b) || answers.q2b;
  }
  return normalized;
}
