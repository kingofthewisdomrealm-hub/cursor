import { getSubtotal, getIvaFromTransaction, getRegime, getContributorType, normalizeRegimeId } from './mexico-tax.js';

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function indent(level) {
  return '  '.repeat(level);
}

export function exportToXml(incomes, expenses, settings = {}) {
  const regime = getRegime(settings.taxRegime ?? 'resico_pf');
  const contributor = getContributorType(settings.contributorType ?? regime.contributorType);
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<MapaPoderFiscal xmlns="http://tax-power-mapper.mx/export/1.0" version="1.1" generado="${new Date().toISOString()}">`,
    `${indent(1)}<Configuracion>`,
    `${indent(2)}<TipoContribuyente codigo="${esc(settings.contributorType)}">${esc(contributor.label)}</TipoContribuyente>`,
    `${indent(2)}<RegimenFiscal codigo="${esc(settings.taxRegime)}">${esc(regime.fullName)}</RegimenFiscal>`,
    `${indent(2)}<InscritoIVA>${settings.isIvaLiable ? 'true' : 'false'}</InscritoIVA>`,
    `${indent(2)}<TasaManual>${settings.taxPercentage ?? 30}</TasaManual>`,
    `${indent(2)}<TasaIVADefault>${esc(settings.defaultIvaRate ?? '16')}</TasaIVADefault>`,
    `${indent(1)}</Configuracion>`,
    `${indent(1)}<Ingresos total="${incomes.length}">`,
  ];

  incomes.forEach((i) => {
    lines.push(
      `${indent(2)}<Ingreso id="${esc(i.id)}" fecha="${esc(i.date)}" monto="${i.amount}" subtotal="${getSubtotal(i)}" iva="${getIvaFromTransaction(i)}">`,
      `${indent(3)}<Fuente>${esc(i.source)}</Fuente>`,
      `${indent(3)}<ClienteProyecto>${esc(i.clientProject)}</ClienteProyecto>`,
      `${indent(3)}<MetodoPago>${esc(i.paymentMethod)}</MetodoPago>`,
      `${indent(3)}<Retencion>${esc(i.retentionType)}</Retencion>`,
      `${indent(3)}<CFDI uuid="${esc(i.cfdiUuid)}" tipo="${esc(i.cfdiType)}" incluyeIva="${i.includesIva ? 'true' : 'false'}" tasaIva="${esc(i.ivaRate)}" />`,
      `${indent(3)}<Notas>${esc(i.notes)}</Notas>`,
      `${indent(2)}</Ingreso>`
    );
  });

  lines.push(`${indent(1)}</Ingresos>`);
  lines.push(`${indent(1)}<Gastos total="${expenses.length}">`);

  expenses.forEach((e) => {
    const status = getDocStatus(e);
    lines.push(
      `${indent(2)}<Gasto id="${esc(e.id)}" fecha="${esc(e.date)}" monto="${e.amount}" subtotal="${getSubtotal(e)}" iva="${getIvaFromTransaction(e)}" clasificacion="${esc(e.classification)}" estadoSAT="${esc(status.label)}">`,
      `${indent(3)}<Comercio>${esc(e.merchant)}</Comercio>`,
      `${indent(3)}<Categoria>${esc(e.category)}</Categoria>`,
      `${indent(3)}<RelacionActividad>${esc(e.commercialPurpose)}</RelacionActividad>`,
      `${indent(3)}<ClienteProyecto>${esc(e.clientProject)}</ClienteProyecto>`,
      `${indent(3)}<UsoComercialPorcentaje>${e.mixedCommercialPercent ?? e.commercialUsePercent ?? 100}</UsoComercialPorcentaje>`,
      `${indent(3)}<CFDI uuid="${esc(e.cfdiUuid)}" tipo="${esc(e.cfdiType)}" incluyeIva="${e.includesIva ? 'true' : 'false'}" tasaIva="${esc(e.ivaRate)}" />`,
      `${indent(3)}<Notas>${esc(e.notes)}</Notas>`,
      `${indent(2)}</Gasto>`
    );
  });

  lines.push(
    `${indent(1)}</Gastos>`,
    `${indent(1)}<AvisoLegal>Exportación orientativa conforme a LISR y LIVA. No sustituye asesoría del SAT.</AvisoLegal>`,
    `</MapaPoderFiscal>`
  );

  return lines.join('\n');
}

export function exportFullBackupXml(state) {
  return exportToXml(state.incomes, state.expenses, state.settings);
}

export function importFromXml(xmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');
  if (doc.querySelector('parsererror')) {
    throw new Error('XML de respaldo inválido');
  }

  const root = doc.documentElement;
  if (root.localName !== 'MapaPoderFiscal') {
    throw new Error('No es un archivo de respaldo de Tax Power Mapper');
  }

  const config = root.querySelector('Configuracion');
  const settings = {
    contributorType: config?.querySelector('TipoContribuyente')?.getAttribute('codigo')
      || (config?.querySelector('RegimenFiscal')?.getAttribute('codigo')?.endsWith('_pm') ? 'persona_moral' : 'persona_fisica'),
    taxRegime: config?.querySelector('RegimenFiscal')?.getAttribute('codigo') || 'resico_pf',
    isIvaLiable: config?.querySelector('InscritoIVA')?.textContent === 'true',
    taxPercentage: Number(config?.querySelector('TasaManual')?.textContent) || 30,
    defaultIvaRate: config?.querySelector('TasaIVADefault')?.textContent || '16',
  };

  const incomes = [...root.querySelectorAll('Ingresos > Ingreso')].map((el) => {
    const cfdi = el.querySelector('CFDI');
    return {
      id: el.getAttribute('id') || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date: el.getAttribute('fecha'),
      amount: Number(el.getAttribute('monto')),
      source: el.querySelector('Fuente')?.textContent || '',
      clientProject: el.querySelector('ClienteProyecto')?.textContent || '',
      paymentMethod: el.querySelector('MetodoPago')?.textContent || '',
      retentionType: el.querySelector('Retencion')?.textContent || 'Sin retención',
      notes: el.querySelector('Notas')?.textContent || '',
      cfdiUuid: cfdi?.getAttribute('uuid') || null,
      cfdiType: cfdi?.getAttribute('tipo') || 'Sin CFDI / ticket',
      includesIva: cfdi?.getAttribute('incluyeIva') === 'true',
      ivaRate: cfdi?.getAttribute('tasaIva') || '16',
      createdAt: new Date().toISOString(),
    };
  });

  const expenses = [...root.querySelectorAll('Gastos > Gasto')].map((el) => {
    const cfdi = el.querySelector('CFDI');
    return {
      id: el.getAttribute('id') || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date: el.getAttribute('fecha'),
      amount: Number(el.getAttribute('monto')),
      merchant: el.querySelector('Comercio')?.textContent || '',
      category: el.querySelector('Categoria')?.textContent || 'Otros gastos deducibles',
      commercialPurpose: el.querySelector('RelacionActividad')?.textContent || '',
      clientProject: el.querySelector('ClienteProyecto')?.textContent || '',
      commercialUsePercent: Number(el.querySelector('UsoComercialPorcentaje')?.textContent) || 100,
      classification: el.getAttribute('clasificacion') || null,
      mixedCommercialPercent: null,
      notes: el.querySelector('Notas')?.textContent || '',
      cfdiUuid: cfdi?.getAttribute('uuid') || null,
      cfdiType: cfdi?.getAttribute('tipo') || 'Sin CFDI / ticket',
      includesIva: cfdi?.getAttribute('incluyeIva') === 'true',
      ivaRate: cfdi?.getAttribute('tasaIva') || '16',
      receiptData: null,
      receiptName: null,
      cfdiXml: null,
      createdAt: new Date().toISOString(),
    };
  });

  return { incomes, expenses, settings };
}

export function downloadXml(content, filename) {
  const blob = new Blob([content], { type: 'application/xml;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
