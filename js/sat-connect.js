/**
 * Conexión con Hacienda / SAT — flujo con datos simulados.
 * La conexión real queda preparada en connectToSatReal() para integración futura
 * (requiere backend con FIEL / Web Service de Descarga Masiva del SAT).
 */

import { parseCfdiXml } from './cfdi-xml.js';
import {
  getExistingCfdiUuids,
  cfdiToIncome,
  cfdiToExpense,
} from './sat-portal.js';
import { addIncome, addExpense } from './store.js';

/** Credenciales en memoria de sesión — nunca se persisten en localStorage. */
export const satSession = {
  cerContent: null,
  keyContent: null,
  password: '',
  cerFileName: '',
  keyFileName: '',
};

export const SAT_CONNECT_MODE = {
  simulated: 'simulated',
  real: 'real',
};

const TIPO_FACTURA = {
  I: 'Ingreso',
  E: 'Egreso',
  P: 'Pago',
  N: 'Nómina',
  T: 'Traslado',
};

const MOCK_XML_TEMPLATES = [
  {
    direction: 'emitido',
    uuid: 'a1000001-0001-4000-8000-000000000001',
    fecha: '2026-06-15',
    emisorNombre: 'CONSULTORÍA DEMO SC',
    receptorNombre: 'CLIENTE ALPHA SA DE CV',
    receptorRfc: 'CACX7605101P8',
    concepto: 'Servicios profesionales de consultoría fiscal',
    subtotal: 25000,
    iva: 4000,
    total: 29000,
    tipo: 'I',
    estado: 'Vigente',
  },
  {
    direction: 'emitido',
    uuid: 'a1000002-0002-4000-8000-000000000002',
    fecha: '2026-06-28',
    emisorNombre: 'CONSULTORÍA DEMO SC',
    receptorNombre: 'BETA SOLUCIONES S DE RL',
    receptorRfc: 'BSO990101AB1',
    concepto: 'Desarrollo de software a la medida',
    subtotal: 45000,
    iva: 7200,
    total: 52200,
    tipo: 'I',
    estado: 'Vigente',
  },
  {
    direction: 'recibido',
    uuid: 'b2000001-0001-4000-8000-000000000001',
    fecha: '2026-06-10',
    emisorNombre: 'OFFICE DEPOT DE MÉXICO',
    emisorRfc: 'ODO970101XY2',
    receptorNombre: 'CONSULTORÍA DEMO SC',
    concepto: 'Suministros de oficina y papelería',
    subtotal: 3200,
    iva: 512,
    total: 3712,
    tipo: 'I',
    estado: 'Vigente',
  },
  {
    direction: 'recibido',
    uuid: 'b2000002-0002-4000-8000-000000000002',
    fecha: '2026-06-18',
    emisorNombre: 'TELMEX SA DE CV',
    emisorRfc: 'TME840315KT6',
    receptorNombre: 'CONSULTORÍA DEMO SC',
    concepto: 'Servicio de internet empresarial',
    subtotal: 899,
    iva: 143.84,
    total: 1042.84,
    tipo: 'I',
    estado: 'Vigente',
  },
  {
    direction: 'recibido',
    uuid: 'b2000003-0003-4000-8000-000000000003',
    fecha: '2026-05-22',
    emisorNombre: 'GASOLINERA CENTRO SA',
    emisorRfc: 'GCE850101ZZ1',
    receptorNombre: 'CONSULTORÍA DEMO SC',
    concepto: 'Combustible para vehículo de servicio',
    subtotal: 1800,
    iva: 288,
    total: 2088,
    tipo: 'I',
    estado: 'Vigente',
  },
  {
    direction: 'emitido',
    uuid: 'a1000003-0003-4000-8000-000000000003',
    fecha: '2026-05-30',
    emisorNombre: 'CONSULTORÍA DEMO SC',
    receptorNombre: 'GAMMA INDUSTRIAS SA',
    receptorRfc: 'GIN880202CD3',
    concepto: 'Capacitación en cumplimiento fiscal',
    subtotal: 12000,
    iva: 1920,
    total: 13920,
    tipo: 'I',
    estado: 'Cancelado',
  },
];

function buildMockXml(template, userRfc) {
  const rfc = userRfc.toUpperCase();
  const emisorRfc = template.direction === 'emitido' ? rfc : template.emisorRfc;
  const receptorRfc = template.direction === 'emitido' ? template.receptorRfc : rfc;
  const emisorNombre = template.direction === 'emitido' ? template.emisorNombre : template.emisorNombre;
  const receptorNombre = template.direction === 'emitido' ? template.receptorNombre : template.receptorNombre;

  return `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital"
  Version="4.0" Fecha="${template.fecha}T10:00:00" SubTotal="${template.subtotal.toFixed(2)}" Total="${template.total.toFixed(2)}"
  Moneda="MXN" TipoDeComprobante="${template.tipo}">
  <cfdi:Emisor Rfc="${emisorRfc}" Nombre="${emisorNombre}"/>
  <cfdi:Receptor Rfc="${receptorRfc}" Nombre="${receptorNombre}"/>
  <cfdi:Conceptos>
    <cfdi:Concepto ClaveProdServ="80101500" Cantidad="1" ClaveUnidad="E48" Descripcion="${template.concepto}" ValorUnitario="${template.subtotal.toFixed(2)}" Importe="${template.subtotal.toFixed(2)}"/>
  </cfdi:Conceptos>
  <cfdi:Impuestos TotalImpuestosTrasladados="${template.iva.toFixed(2)}">
    <cfdi:Traslados>
      <cfdi:Traslado Base="${template.subtotal.toFixed(2)}" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="${template.iva.toFixed(2)}"/>
    </cfdi:Traslados>
  </cfdi:Impuestos>
  <cfdi:Complemento>
    <tfd:TimbreFiscalDigital UUID="${template.uuid}" FechaTimbrado="${template.fecha}T10:01:00"/>
  </cfdi:Complemento>
</cfdi:Comprobante>`;
}

export function templateToCatalogItem(template, userRfc, xml) {
  const rfc = userRfc.toUpperCase();
  const parsed = parseCfdiXml(xml);
  return {
    id: template.uuid,
    uuid: template.uuid,
    fecha: template.fecha,
    rfc: template.direction === 'emitido' ? rfc : template.emisorRfc,
    emisorNombre: parsed.emisorNombre || template.emisorNombre,
    emisorRfc: parsed.emisorRfc,
    receptorNombre: parsed.receptorNombre || template.receptorNombre,
    receptorRfc: parsed.receptorRfc,
    concepto: template.concepto,
    subtotal: template.subtotal,
    iva: template.iva,
    total: template.total,
    tipoFactura: TIPO_FACTURA[template.tipo] || 'CFDI',
    estado: template.estado,
    direction: template.direction,
    selected: false,
    xml,
  };
}

export function generateSimulatedXmlCatalog(userRfc) {
  return MOCK_XML_TEMPLATES.map((t) => {
    const xml = buildMockXml(t, userRfc);
    return templateToCatalogItem(t, userRfc, xml);
  });
}

export function validateSatCredentials({ rfc, cerFile, keyFile, password }, { allowSession = false } = {}) {
  const errors = [];
  const cleanRfc = String(rfc || '').trim().toUpperCase();
  if (!cleanRfc || cleanRfc.length < 12 || cleanRfc.length > 13) {
    errors.push('RFC inválido (12 caracteres para moral, 13 para física).');
  }
  const hasCer = cerFile || (allowSession && satSession.cerContent);
  const hasKey = keyFile || (allowSession && satSession.keyContent);
  if (!hasCer) errors.push('Seleccione el archivo de certificado (.cer).');
  if (!hasKey) errors.push('Seleccione el archivo de llave privada (.key).');
  if (!password || String(password).length < 1) {
    errors.push('Ingrese la contraseña de la llave privada.');
  }
  if (cerFile && !cerFile.name.toLowerCase().endsWith('.cer')) {
    errors.push('El certificado debe ser un archivo .cer');
  }
  if (keyFile && !keyFile.name.toLowerCase().endsWith('.key')) {
    errors.push('La llave privada debe ser un archivo .key');
  }
  return { valid: errors.length === 0, errors, rfc: cleanRfc };
}

export async function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Conexión real con el SAT — pendiente de implementación.
 * @see https://www.sat.gob.mx/consultas/92764/consulta-y-recuperacion-de-comprobantes-
 */
export async function connectToSatReal({ rfc, cerFile, keyFile, password }) {
  const validation = validateSatCredentials({ rfc, cerFile, keyFile, password });
  if (!validation.valid) {
    throw new Error(validation.errors.join(' '));
  }

  // Placeholder para integración futura:
  // 1. Enviar FIEL al backend seguro (nunca en el navegador directo al SAT por CORS)
  // 2. Autenticar con WS-Security en Descarga Masiva de CFDI
  // 3. Solicitar paquetes de XML emitidos/recibidos
  // 4. Devolver catálogo parseado al frontend

  await readFileAsArrayBuffer(cerFile);
  await readFileAsArrayBuffer(keyFile);

  throw new Error(
    'Conexión real con el SAT aún no está disponible. Use el modo simulado para probar el flujo completo.'
  );
}

export async function connectToSatSimulated({ rfc, cerFile, keyFile, password }) {
  const allowSession = Boolean(satSession.cerContent && satSession.keyContent);
  const validation = validateSatCredentials({ rfc, cerFile, keyFile, password }, { allowSession });
  if (!validation.valid) {
    throw new Error(validation.errors.join(' '));
  }

  if (cerFile) {
    satSession.cerContent = await readFileAsArrayBuffer(cerFile);
    satSession.cerFileName = cerFile.name;
  }
  if (keyFile) {
    satSession.keyContent = await readFileAsArrayBuffer(keyFile);
    satSession.keyFileName = keyFile.name;
  }
  satSession.password = password;

  await new Promise((r) => setTimeout(r, 1200));

  return {
    success: true,
    mode: SAT_CONNECT_MODE.simulated,
    rfc: validation.rfc,
    message: 'Conexión simulada exitosa con Hacienda / SAT',
    connectedAt: new Date().toISOString(),
  };
}

export async function connectToSat(credentials, { useReal = false } = {}) {
  if (useReal) return connectToSatReal(credentials);
  return connectToSatSimulated(credentials);
}

export async function downloadXmlFromSatSimulated(userRfc) {
  await new Promise((r) => setTimeout(r, 1500));
  return generateSimulatedXmlCatalog(userRfc);
}

/**
 * Descarga real de XML — delegará al backend cuando esté disponible.
 */
export async function downloadXmlFromSatReal() {
  throw new Error('Descarga real pendiente. Requiere backend con FIEL autorizado ante el SAT.');
}

export async function downloadXmlFromSat(userRfc, { useReal = false } = {}) {
  if (useReal) return downloadXmlFromSatReal();
  return downloadXmlFromSatSimulated(userRfc);
}

export function filterXmlCatalog(catalog, filter) {
  if (filter === 'emitidos') return catalog.filter((x) => x.direction === 'emitido');
  if (filter === 'recibidos') return catalog.filter((x) => x.direction === 'recibido');
  return catalog;
}

export function setAllSelected(catalog, selected) {
  catalog.forEach((item) => { item.selected = selected; });
  return catalog;
}

export function toggleXmlSelection(catalog, id, selected) {
  const item = catalog.find((x) => x.id === id);
  if (item) item.selected = selected;
  return catalog;
}

export function getSelectedXml(catalog) {
  return catalog.filter((x) => x.selected);
}

function classifyForUser(item, userRfc) {
  const rfc = userRfc.toUpperCase();
  if (item.emisorRfc?.toUpperCase() === rfc) return 'income';
  if (item.receptorRfc?.toUpperCase() === rfc) return 'expense';
  return item.direction === 'emitido' ? 'income' : 'expense';
}

export function importSelectedXmlToTaxPrep(state, catalog, userRfc) {
  const selected = getSelectedXml(catalog);
  const result = { incomes: 0, expenses: 0, skipped: 0, errors: [] };
  const existing = getExistingCfdiUuids(state);

  selected.forEach((item) => {
    try {
      const cfdi = parseCfdiXml(item.xml);
      if (cfdi.uuid && existing.has(cfdi.uuid)) {
        result.skipped += 1;
        return;
      }
      const kind = classifyForUser(item, userRfc);
      const fileName = `${item.uuid}.xml`;
      if (kind === 'income') {
        addIncome(state, cfdiToIncome(cfdi, fileName));
        result.incomes += 1;
      } else {
        addExpense(state, cfdiToExpense(cfdi, fileName));
        result.expenses += 1;
      }
      if (cfdi.uuid) existing.add(cfdi.uuid);
    } catch (err) {
      result.errors.push(`${item.uuid}: ${err.message}`);
    }
  });

  return result;
}

export function disconnectSat() {
  satSession.cerContent = null;
  satSession.keyContent = null;
  satSession.password = '';
  satSession.cerFileName = '';
  satSession.keyFileName = '';
}

export function getDefaultSatConnectSettings() {
  return {
    rfc: '',
    isConnected: false,
    connectedAt: null,
    cerFileName: '',
    keyFileName: '',
    xmlCatalog: [],
    xmlFilter: 'all',
    lastDownloadAt: null,
    mode: SAT_CONNECT_MODE.simulated,
  };
}
