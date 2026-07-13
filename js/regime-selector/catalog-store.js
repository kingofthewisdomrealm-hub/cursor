import { DEFAULT_REGIME_CATALOG } from './catalog-defaults.js';

const CATALOG_KEY = 'tax-power-mapper-regime-catalog';
const RULES_KEY = 'tax-power-mapper-regime-rules';

export const DEFAULT_TAX_PROFILE = {
  taxpayerType: 'unknown',
  incomeSources: [],
  incomePattern: null,
  registeredWithSat: null,
  currentRegimesCount: null,
  recommendedRegimeIds: [],
  selectedRegimeIds: [],
  lastQuestionnaireAt: null,
};

export const DEFAULT_RECOMMENDATION_RULES = {
  sueldo_empleador: ['pf_sueldos_salarios'],
  venta_productos: ['pf_actividades_empresariales', 'pf_resico'],
  servicios_profesionales: ['pf_actividades_empresariales', 'pf_resico'],
  negocio_propio: ['pf_actividades_empresariales', 'pf_resico'],
  renta_propiedades: ['pf_arrendamiento', 'pf_resico'],
  plataformas_digitales: ['pf_plataformas_tecnologicas', 'pf_actividades_empresariales'],
  intereses_inversiones: ['pf_intereses'],
  dividendos: ['pf_dividendos'],
  venta_bienes: ['pf_enajenacion_bienes'],
  premios: ['pf_premios'],
  otro: ['pf_demas_ingresos'],
  empresa_constituida: ['pm_general_ley', 'pm_resico'],
  organizacion_sin_fines: ['pm_sin_fines_lucro'],
  sector_primario: ['pm_agricolas_ganaderas'],
  autotransporte: ['pm_coordinados'],
};

export function loadRegimeCatalog() {
  try {
    const raw = localStorage.getItem(CATALOG_KEY);
    if (!raw) return structuredClone(DEFAULT_REGIME_CATALOG);
    return JSON.parse(raw);
  } catch {
    return structuredClone(DEFAULT_REGIME_CATALOG);
  }
}

export function saveRegimeCatalog(catalog) {
  localStorage.setItem(CATALOG_KEY, JSON.stringify(catalog));
}

export function resetRegimeCatalog() {
  localStorage.removeItem(CATALOG_KEY);
  return structuredClone(DEFAULT_REGIME_CATALOG);
}

export function loadRecommendationRules() {
  try {
    const raw = localStorage.getItem(RULES_KEY);
    if (!raw) return structuredClone(DEFAULT_RECOMMENDATION_RULES);
    return { ...DEFAULT_RECOMMENDATION_RULES, ...JSON.parse(raw) };
  } catch {
    return structuredClone(DEFAULT_RECOMMENDATION_RULES);
  }
}

export function saveRecommendationRules(rules) {
  localStorage.setItem(RULES_KEY, JSON.stringify(rules));
}

export function getRegimeById(catalog, id) {
  return catalog.find((r) => r.id === id);
}

export function getActiveRegimes(catalog, taxpayerType = null) {
  return catalog.filter((r) => {
    if (!r.active) return false;
    if (taxpayerType && r.taxpayerType !== taxpayerType) return false;
    return true;
  });
}

export function updateRegimeInCatalog(catalog, id, updates) {
  const idx = catalog.findIndex((r) => r.id === id);
  if (idx === -1) return catalog;
  catalog[idx] = { ...catalog[idx], ...updates, lastReviewedAt: new Date().toISOString().slice(0, 10) };
  return catalog;
}

export function searchRegimes(catalog, query, taxpayerType = null) {
  const q = String(query || '').trim().toLowerCase();
  let list = getActiveRegimes(catalog, taxpayerType);
  if (!q) return list;
  return list.filter((r) => {
    const haystack = [
      r.name, r.shortName, r.description, r.whoItAppliesTo,
      ...(r.examples || []),
    ].join(' ').toLowerCase();
    return haystack.includes(q);
  });
}
