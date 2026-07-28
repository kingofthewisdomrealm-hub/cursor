# Tax Power Mapper → Lovable (producción)

## Cómo usarlo en Lovable

1. Abre [https://lovable.dev](https://lovable.dev) e inicia sesión.
2. Crea un **nuevo proyecto**.
3. Copia y pega **todo el bloque** de la sección **PROMPT PARA LOVABLE** (abajo).
4. Cuando la app esté lista, pulsa **Publish** para publicar en producción.
5. (Opcional) En Project settings → Git, conecta GitHub para sincronizar el código.

> Nota: Lovable **no importa** repositorios existentes. Solo exporta hacia GitHub. Por eso hay que regenerar la app con este prompt.

---

## PROMPT PARA LOVABLE

```
Build a production-ready Spanish web app called "Tax Power Mapper — Mapa de Poder Fiscal" for freelancers and small businesses in Mexico.

IMPORTANT LEGAL DISCLAIMER (always visible in footer/sidebar):
"Herramienta orientativa conforme a LISR y LIVA. No es asesoría fiscal del SAT. Consulte con un contador público."

STACK:
- React + TypeScript + Vite + Tailwind
- Client-side only first (localStorage). No auth required for MVP.
- Mobile-responsive sidebar navigation + topbar section dropdown
- Spanish UI throughout (México)

DESIGN:
- Dark financial dashboard aesthetic (not purple-on-white, not cream+terracotta)
- Brand "Tax Power Mapper" must be hero-level in sidebar
- CSS variables for colors; expressive fonts (not Inter/Roboto/Arial)
- One job per section; avoid card clutter in hero areas
- Smooth intentional motion for nav/toasts

DATA MODEL (localStorage key: tax-power-mapper-data):
{
  incomes: [],
  expenses: [],
  settings: {
    contributorType: 'persona_fisica' | 'persona_moral',
    taxRegime: string,
    taxPercentage: number,
    defaultIvaRate: '16'|'8'|'0',
    isIvaLiable: boolean,
    userRfc: string,
    satImportLog: [],
    satConnect: {
      rfc, isConnected, connectedAt, cerFileName, keyFileName,
      xmlCatalog: [], xmlFilter: 'all'|'emitidos'|'recibidos',
      lastDownloadAt, mode: 'simulated'
    },
    taxProfile: { ...regime questionnaire profile }
  }
}

NAVIGATION (sidebar + topbar dropdown with hash routing):
1. Panel (dashboard)
2. Ingreso
3. Gasto
4. SIFTING
5. Documentación
6. Conectar SAT  ← NEW / critical
7. Descarga SAT
8. Régimen Fiscal
9. ISR + IVA
10. Reportes
11. Preparación

=== MODULE: PANEL ===
Fiscal hub cards linking to all modules.
Quick amount capture for income/expense.
Contributor type toggle PF/PM + regime selector.
KPI cards: ingresos cobrados (subtotal), gastos, posibles deducciones Art.27 LISR, base gravable ISR, reserva ISR, CFDI faltantes.
If IVA liable: IVA trasladado, acreditable, a pagar.
Monthly chart last 6 months.
Preparation score teaser.
Show selected tax profile regime name if set.

=== MODULE: INGRESO ===
Form: amount, date, source, IVA fields, CFDI UUID, CFDI type, retentions, client/project, payment method, notes.
Import single CFDI XML to autofill.
Recent incomes list with editable amounts.

=== MODULE: GASTO ===
Form: amount, date, merchant, SAT category (Art.27), commercial %, IVA, CFDI UUID, purpose (indispensable), client, CFDI XML import, optional receipt upload.
Recent expenses with editable amounts.

CATEGORIES:
Arrendamiento; Honorarios y servicios profesionales; Combustibles y vehículos; Viáticos y hospedaje; Telecomunicaciones e internet; Seguros y fianzas; Equipo de cómputo y software; Publicidad y marketing; Capacitación; Cuotas IMSS e INFONAVIT; Suministros de oficina; Otros gastos deducibles.

=== MODULE: SIFTING ===
Classify unclassified expenses as: business (deducible), personal (no deducible), mixed (% commercial), unsure.
Mixed requires percentage 1–99.

=== MODULE: DOCUMENTACIÓN ===
Status per expense: Listo SAT / Falta CFDI / Falta comprobante / Falta relación con actividad / Necesita aclaración / No deducible.
Actions to upload receipt, add UUID, add purpose.

=== MODULE: CONECTAR CON HACIENDA / SAT (CRITICAL) ===
Section title: "Conectar con Hacienda / SAT"

Step flow UI:
1. Enter RFC, certificado .cer, llave privada .key, contraseña
2. Button "Conectar con SAT"
3. After connect: "Descargar los XML del contribuyente"
4. Filters: Ver XML emitidos | Ver XML recibidos | Todos
5. Select which XML to use; buttons "Seleccionar todos" / "Quitar selección"
6. Button "Usar XML seleccionados" → auto-fill incomes/expenses for tax prep → navigate to Panel

Credentials form fields:
- RFC
- Certificado .cer (file)
- Llave privada .key (file)
- Contraseña
- Button: Conectar con SAT
- Disconnect button when connected

NEVER persist password or key/cer binary in localStorage (session memory only).

XML list columns for each item:
- Checkbox
- Fecha
- RFC
- Nombre del emisor (+ RFC)
- Nombre del receptor (+ RFC)
- Concepto
- Subtotal
- IVA
- Total
- Tipo de factura (Ingreso/Egreso/Pago/Nómina)
- Estado (Vigente/Cancelado)
- Dirección (Emitido/Recibido)

SIMULATED MODE (default for now):
- Validate RFC length 12–13, files end with .cer/.key, password non-empty
- Simulate connection delay ~1.2s
- On download, generate ~6 mock CFDI XML (mix emitidos/recibidos; one cancelled)
- Use user RFC as emisor for emitidos and receptor for recibidos
- Parse into catalog; cancelled rows not selectable

REAL CONNECTION STUB (prepare for later):
- Functions connectToSatReal() and downloadXmlFromSatReal() that throw clear "not available yet — needs secure backend + SAT Descarga Masiva Web Service" errors
- Comment that browser cannot talk to SAT APIs directly (CORS + FIEL security)

On "Usar XML seleccionados":
- Import selected as incomes (emitidos) or expenses (recibidos) with CFDI UUID/XML
- Skip duplicates by UUID
- Log import; toast summary; go to dashboard

=== MODULE: DESCARGA SAT ===
Manual import path: links to official SAT portals, RFC save, upload ZIP/folder/XML, demo sample CFDI, export stored CFDI as ZIP, import history.

Official links:
- https://portalcfdi.facturaelectronica.sat.gob.mx/
- Descarga masiva CFDI guide on sat.gob.mx
- Buzón Tributario
- Constancia de situación fiscal

=== MODULE: RÉGIMEN FISCAL ===
Educational light-theme submodule:
- 14 Persona Física + 8 Persona Moral regimes catalog
- Home: choose PF/PM lists + "Ayúdame a identificar mi régimen" questionnaire
- Detail fichas with obligations/deductions
- Up to 3 recommendations
- Save selected regime to profile (syncs contributorType + taxRegime when mappable)
- Admin panel MVP for catalog edits (localStorage)

=== MODULE: ISR + IVA ===
Estimate provisional ISR based on regime:
- RESICO PF rates ~1.0%–2.5% on collected income
- RESICO PM rates ~2.0%–3.5%
- Actividad empresarial / General de Ley: deductions allowed; manual rate slider when applicable
IVA payable = collected − creditable when isIvaLiable.

=== MODULE: REPORTES ===
Filters: year, month, category, client, doc status.
Export filtered XML report, full backup XML, import backup XML, CFDI ZIP export, link to Conectar SAT / Descarga SAT.

=== MODULE: PREPARACIÓN ===
Score 0–100 with factors: CFDI UUID coverage, classified expenses, complete info, documented transactions.
Recommendations list.

CFDI XML PARSER:
Support CFDI 3.3/4.0: Comprobante, Emisor, Receptor, Conceptos, Impuestos/Traslados (002), TimbreFiscalDigital UUID.
Extract fecha, subtotal, total, IVA, tipo, names, RFCs, description.

CURRENCY/DATE:
es-MX formatting, MXN.

ACCEPTANCE CRITERIA:
1. User can navigate all sections via sidebar and topbar dropdown without refresh.
2. User can connect with simulated FIEL credentials and download mock XMLs.
3. User can filter emitidos/recibidos, select/deselect all, and import selected into tax data.
4. Dashboard updates with imported incomes/expenses and tax estimates.
5. Regime questionnaire can save a profile.
6. Disclaimer always visible.
7. Mobile usable (hamburger sidebar + full-width jump select).

Publish this as a polished MVP ready for real users (simulated SAT only).
```

---

## Referencia del código fuente actual

Repo / PR (vanilla HTML/JS de referencia, no importable a Lovable):

- Branch: `cursor/tax-power-mapper-269e`
- PR: https://github.com/kingofthewisdomrealm-hub/cursor/pull/8
- App root: `index.html`, `js/`, `styles.css`

Archivos clave de la lógica SAT:

- `js/sat-connect.js` — conexión simulada + stubs reales
- `js/sat-portal.js` — importación ZIP/XML
- `js/cfdi-xml.js` — parser CFDI
- `js/mexico-tax.js` — ISR/IVA/regímenes
- `js/regime-selector/` — selector de régimen

---

## Después de publicar en Lovable

1. Copia la URL pública de Lovable.
2. Conecta GitHub (Project settings → Git) si quieres el código en un repo propio.
3. Para conexión SAT real más adelante: backend seguro + Web Service de Descarga Masiva (FIEL); nunca enviar `.key`/contraseña a un frontend público.
