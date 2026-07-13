/** Integración con CFDI del SAT (Hacienda) — importación de XML descargados. */

import { parseCfdiXml, isCfdiXml } from './cfdi-xml.js';
import { addIncome, addExpense } from './store.js';

export const SAT_PORTALS = {
  consulta: {
    label: 'Portal de Consulta CFDI',
    url: 'https://portalcfdi.facturaelectronica.sat.gob.mx/',
    description: 'Consulta y descarga comprobantes individuales con RFC y contraseña SAT.',
  },
  descargaMasiva: {
    label: 'Descarga Masiva de CFDI (SAT)',
    url: 'https://www.sat.gob.mx/portal/public/tramites/como-realizar-la-descarga-masiva-de-cfdi',
    description: 'Trámite oficial para solicitar paquetes ZIP con XML de emitidos y recibidos.',
  },
  buzon: {
    label: 'Buzón Tributario SAT',
    url: 'https://www.sat.gob.mx/portal/public/tramites/buzon-tributario',
    description: 'Acceso con e.firma o contraseña para trámites ante el SAT.',
  },
  misCuentas: {
    label: 'SAT ID / Mis cuentas',
    url: 'https://www.sat.gob.mx/portal/public/tramites/constancia-de-situacion-fiscal',
    description: 'Constancia de situación fiscal y datos del contribuyente.',
  },
};

export async function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

async function loadJSZip() {
  const mod = await import('https://esm.sh/jszip@3.10.1');
  return mod.default;
}

export async function extractXmlFromSatPackage(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.xml')) {
    const text = await readFileAsText(file);
    return isCfdiXml(text) ? [{ name: file.name, xml: text }] : [];
  }

  if (name.endsWith('.zip')) {
    const JSZip = await loadJSZip();
    const zip = await JSZip.loadAsync(file);
    const results = [];
    const entries = Object.keys(zip.files).filter((p) => !zip.files[p].dir && p.toLowerCase().endsWith('.xml'));
    for (const path of entries) {
      const text = await zip.files[path].async('string');
      if (isCfdiXml(text)) results.push({ name: path.split('/').pop(), xml: text });
    }
    return results;
  }

  return [];
}

export async function extractXmlFromFileList(fileList) {
  const files = [...fileList];
  const all = [];
  for (const file of files) {
    const items = await extractXmlFromSatPackage(file);
    all.push(...items);
  }
  return all;
}

function classifyCfdi(cfdi, userRfc) {
  const rfc = String(userRfc || '').trim().toUpperCase();
  const emisor = (cfdi.emisorRfc || '').toUpperCase();
  const receptor = (cfdi.receptorRfc || '').toUpperCase();
  const tipo = cfdi.tipoComprobante;

  if (tipo === 'I' || tipo === 'P') {
    if (rfc && emisor === rfc) return 'income';
    if (rfc && receptor === rfc) return 'expense';
    if (tipo === 'I') return emisor ? 'expense' : 'income';
  }
  if (tipo === 'E') return 'expense';
  if (tipo === 'N') return 'expense';
  return 'expense';
}

export function cfdiToIncome(cfdi, fileName) {
  return {
    amount: cfdi.total,
    date: cfdi.fecha || new Date().toISOString().slice(0, 10),
    source: cfdi.descripcion?.slice(0, 80) || 'CFDI importado del SAT',
    clientProject: cfdi.receptorNombre || cfdi.receptorRfc || '',
    paymentMethod: 'Transferencia SPEI',
    notes: `Importado desde SAT · ${fileName}`,
    cfdiUuid: cfdi.uuid,
    cfdiXml: cfdi.rawXml,
    cfdiType: 'Ingreso (factura emitida)',
    includesIva: cfdi.includesIva,
    ivaRate: cfdi.ivaRate,
    retentionType: 'Sin retención',
    satImported: true,
    satImportedAt: new Date().toISOString(),
  };
}

export function cfdiToExpense(cfdi, fileName) {
  return {
    amount: cfdi.total,
    date: cfdi.fecha || new Date().toISOString().slice(0, 10),
    merchant: cfdi.emisorNombre || cfdi.emisorRfc || 'Proveedor SAT',
    category: 'Otros gastos deducibles',
    commercialPurpose: cfdi.descripcion || 'Importado desde SAT',
    clientProject: '',
    commercialUsePercent: 100,
    notes: `Importado desde SAT · ${fileName}`,
    cfdiUuid: cfdi.uuid,
    cfdiXml: cfdi.rawXml,
    cfdiType: 'Sin CFDI / ticket',
    includesIva: cfdi.includesIva,
    ivaRate: cfdi.ivaRate,
    receiptData: null,
    receiptName: fileName,
    satImported: true,
    satImportedAt: new Date().toISOString(),
  };
}

export function importSatXmlBatch(state, xmlItems, userRfc, existingUuids = new Set()) {
  const result = { incomes: 0, expenses: 0, skipped: 0, errors: [] };

  xmlItems.forEach(({ name, xml }) => {
    try {
      const cfdi = parseCfdiXml(xml);
      if (cfdi.uuid && existingUuids.has(cfdi.uuid)) {
        result.skipped += 1;
        return;
      }
      const kind = classifyCfdi(cfdi, userRfc);
      if (kind === 'income') {
        addIncome(state, cfdiToIncome(cfdi, name));
        result.incomes += 1;
      } else {
        addExpense(state, cfdiToExpense(cfdi, name));
        result.expenses += 1;
      }
      if (cfdi.uuid) existingUuids.add(cfdi.uuid);
    } catch (err) {
      result.errors.push(`${name}: ${err.message}`);
    }
  });

  return result;
}

export function getExistingCfdiUuids(state) {
  const set = new Set();
  state.incomes.forEach((i) => i.cfdiUuid && set.add(i.cfdiUuid));
  state.expenses.forEach((e) => e.cfdiUuid && set.add(e.cfdiUuid));
  return set;
}

export function downloadXmlFile(content, filename) {
  const blob = new Blob([content], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadAllStoredCfdiXml(state) {
  const items = [];
  state.incomes.forEach((i) => {
    if (i.cfdiXml) items.push({ xml: i.cfdiXml, name: `ingreso-${i.cfdiUuid || i.id}.xml` });
  });
  state.expenses.forEach((e) => {
    if (e.cfdiXml) items.push({ xml: e.cfdiXml, name: `gasto-${e.cfdiUuid || e.id}.xml` });
  });
  return items;
}

export async function downloadStoredCfdiAsZip(state, filename = 'cfdi-sat-export.zip') {
  const items = downloadAllStoredCfdiXml(state);
  if (items.length === 0) return 0;
  const JSZip = await loadJSZip();
  const zip = new JSZip();
  items.forEach((item) => zip.file(item.name, item.xml));
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return items.length;
}
