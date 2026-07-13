/** Parser y utilidades para CFDI XML (SAT México 3.3 / 4.0). */

function parseXml(text) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'application/xml');
  if (doc.querySelector('parsererror')) {
    throw new Error('Archivo XML inválido o corrupto');
  }
  return doc;
}

function byLocalName(root, name) {
  return [...root.getElementsByTagName('*')].find(
    (el) => el.localName === name || el.tagName.endsWith(`:${name}`)
  );
}

function allByLocalName(root, name) {
  return [...root.getElementsByTagName('*')].filter(
    (el) => el.localName === name || el.tagName.endsWith(`:${name}`)
  );
}

function attr(el, ...names) {
  if (!el) return '';
  for (const n of names) {
    const v = el.getAttribute(n);
    if (v) return v;
  }
  return '';
}

export function isCfdiXml(text) {
  if (!text || !String(text).trim().startsWith('<')) return false;
  try {
    const doc = parseXml(text);
    return Boolean(byLocalName(doc, 'Comprobante'));
  } catch {
    return false;
  }
}

export function parseCfdiXml(xmlText) {
  const doc = parseXml(xmlText);
  const comprobante = byLocalName(doc, 'Comprobante');
  if (!comprobante) throw new Error('No es un CFDI válido: falta elemento Comprobante');

  const timbre = byLocalName(doc, 'TimbreFiscalDigital');
  const emisor = byLocalName(comprobante, 'Emisor');
  const receptor = byLocalName(comprobante, 'Receptor');
  const conceptos = allByLocalName(comprobante, 'Concepto');

  const uuid = attr(timbre, 'UUID');
  const fechaRaw = attr(comprobante, 'Fecha');
  const fecha = fechaRaw ? fechaRaw.slice(0, 10) : '';
  const subtotal = parseFloat(attr(comprobante, 'SubTotal')) || 0;
  const total = parseFloat(attr(comprobante, 'Total')) || subtotal;
  const moneda = attr(comprobante, 'Moneda') || 'MXN';
  const tipoComprobante = attr(comprobante, 'TipoDeComprobante');
  const serie = attr(comprobante, 'Serie');
  const folio = attr(comprobante, 'Folio');

  let ivaTrasladado = 0;
  const traslados = allByLocalName(comprobante, 'Traslado');
  traslados.forEach((t) => {
    const impuesto = attr(t, 'Impuesto');
    if (impuesto === '002' || !impuesto) {
      ivaTrasladado += parseFloat(attr(t, 'Importe')) || 0;
    }
  });

  if (ivaTrasladado === 0) {
    const impuestos = byLocalName(comprobante, 'Impuestos');
    ivaTrasladado = parseFloat(attr(impuestos, 'TotalImpuestosTrasladados')) || 0;
  }

  const includesIva = ivaTrasladado > 0 || total > subtotal;
  const emisorNombre = attr(emisor, 'Nombre', 'nombre');
  const emisorRfc = attr(emisor, 'Rfc', 'RFC');
  const receptorNombre = attr(receptor, 'Nombre', 'nombre');
  const receptorRfc = attr(receptor, 'Rfc', 'RFC');

  const descripcionConceptos = conceptos
    .map((c) => attr(c, 'Descripcion'))
    .filter(Boolean)
    .join('; ');

  const tipoLabels = { I: 'Ingreso', E: 'Egreso', P: 'Pago', N: 'Nómina', T: 'Traslado' };

  return {
    uuid: uuid || null,
    fecha,
    subtotal,
    total,
    iva: ivaTrasladado || Math.max(0, total - subtotal),
    includesIva,
    ivaRate: subtotal > 0 && ivaTrasladado > 0
      ? (Math.round((ivaTrasladado / subtotal) * 100) === 8 ? '8' : '16')
      : '16',
    moneda,
    tipoComprobante,
    tipoLabel: tipoLabels[tipoComprobante] || 'CFDI',
    serie,
    folio,
    emisorNombre,
    emisorRfc,
    receptorNombre,
    receptorRfc,
    descripcion: descripcionConceptos,
    rawXml: xmlText,
  };
}

export async function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export async function parseCfdiFile(file) {
  const text = await readFileAsText(file);
  if (!isCfdiXml(text)) {
    throw new Error('El archivo no contiene un CFDI XML válido del SAT');
  }
  return parseCfdiXml(text);
}
