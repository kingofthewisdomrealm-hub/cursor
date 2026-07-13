import {
  loadRegimeCatalog,
  saveRegimeCatalog,
  resetRegimeCatalog,
  getActiveRegimes,
  getRegimeById,
  searchRegimes,
  updateRegimeInCatalog,
  loadRecommendationRules,
  saveRecommendationRules,
  DEFAULT_RECOMMENDATION_RULES,
} from './catalog-store.js';
import {
  recommendRegimes,
  buildTaxProfileFromAnswers,
  getVisibleQuestions,
  normalizeQuestionnaireAnswers,
} from './recommend.js';

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function createRegimeSelectorState() {
  return {
    subView: 'home',
    listType: null,
    selectedRegimeId: null,
    searchQuery: '',
    filterType: '',
    questionnaireAnswers: {},
    questionnaireStep: 0,
    catalog: loadRegimeCatalog(),
    adminEditingId: null,
  };
}

export function renderRegimeSelector(rs, taxProfile) {
  const views = {
    home: () => renderHome(rs),
    list: () => renderList(rs),
    detail: () => renderDetail(rs),
    questionnaire: () => renderQuestionnaire(rs),
    results: () => renderResults(rs, taxProfile),
    admin: () => renderAdmin(rs),
  };
  return `
    <div class="regime-selector-module">
      ${views[rs.subView]?.() || renderHome(rs)}
      ${renderLegalFooter()}
    </div>
  `;
}

function renderLegalFooter() {
  return `
    <p class="rs-legal">
      Esta herramienta ofrece información general y una clasificación preliminar. La situación fiscal de cada persona o empresa puede variar.
      Antes de realizar cambios ante el SAT, consulta a un contador o asesor fiscal autorizado.
    </p>
  `;
}

function renderHome() {
  return `
    <div class="rs-hero">
      <h2 class="rs-title">¿Qué régimen fiscal te corresponde?</h2>
      <p class="rs-subtitle">Selecciona si tributas como persona física o persona moral para conocer las opciones disponibles.</p>
      <button type="button" class="btn rs-btn-primary rs-btn-quiz" data-rs-action="start-quiz">Ayúdame a identificar mi régimen</button>
    </div>
    <div class="rs-grid-2">
      <div class="rs-type-card rs-pf">
        <div class="rs-type-icon">👤</div>
        <h3>Persona Física</h3>
        <p>Personas que reciben ingresos por trabajo, negocios, servicios profesionales, rentas, plataformas digitales, inversiones u otras actividades.</p>
        <button type="button" class="btn rs-btn-pf" data-rs-action="list-pf">Ver regímenes de persona física</button>
      </div>
      <div class="rs-type-card rs-pm">
        <div class="rs-type-icon">🏢</div>
        <h3>Persona Moral</h3>
        <p>Empresas, sociedades, asociaciones y organizaciones constituidas legalmente en México.</p>
        <button type="button" class="btn rs-btn-pm" data-rs-action="list-pm">Ver regímenes de persona moral</button>
      </div>
    </div>
    <div class="rs-toolbar">
      <input type="search" class="rs-search" id="rs-global-search" placeholder="Buscar régimen fiscal…">
      <button type="button" class="btn rs-btn-secondary btn-sm" data-rs-action="admin">Panel administrativo</button>
    </div>
  `;
}

function renderList(rs) {
  const type = rs.listType === 'company' ? 'company' : 'individual';
  const title = type === 'individual' ? 'Regímenes para Personas Físicas' : 'Regímenes para Personas Morales';
  const list = searchRegimes(rs.catalog, rs.searchQuery, type);

  return `
    <div class="rs-breadcrumb">
      <button type="button" class="rs-link" data-rs-action="home">← Inicio</button>
      <span>${title}</span>
    </div>
    <div class="rs-hero rs-hero-compact">
      <h2 class="rs-title">${title}</h2>
      <p class="rs-subtitle">${list.length} regímenes disponibles · clasificación educativa</p>
    </div>
    <div class="rs-toolbar">
      <input type="search" class="rs-search" id="rs-list-search" value="${esc(rs.searchQuery)}" placeholder="Buscar por nombre o actividad…">
      <button type="button" class="btn rs-btn-primary btn-sm" data-rs-action="start-quiz">Ayúdame a identificar mi régimen</button>
    </div>
    <div class="rs-regime-list">
      ${list.length === 0
        ? '<div class="rs-empty">No se encontraron regímenes con ese criterio.</div>'
        : list.map((r) => renderRegimeCard(r)).join('')}
    </div>
  `;
}

function renderRegimeCard(r) {
  const typeClass = r.taxpayerType === 'company' ? 'rs-pm' : 'rs-pf';
  const badges = [
    r.legacyOnly ? '<span class="rs-badge rs-badge-warning">Régimen histórico</span>' : '',
    r.requiresValidation ? '<span class="rs-badge rs-badge-warning">Requiere validación</span>' : '',
    r.warningLabel ? `<span class="rs-badge rs-badge-warning">${esc(r.warningLabel)}</span>` : '',
    !r.active ? '<span class="rs-badge rs-badge-restrict">Inactivo</span>' : '',
  ].filter(Boolean).join('');

  return `
    <article class="rs-regime-card ${typeClass}" data-rs-action="detail" data-regime-id="${r.id}">
      <div class="rs-regime-card-head">
        <span class="rs-regime-icon">${r.icon || '📄'}</span>
        <div>
          <h3>${esc(r.name)}</h3>
          ${r.shortName ? `<span class="rs-short-name">${esc(r.shortName)}</span>` : ''}
        </div>
      </div>
      <p>${esc(r.description)}</p>
      ${badges ? `<div class="rs-badges">${badges}</div>` : ''}
      <div class="rs-examples">
        <strong>Ejemplos:</strong> ${esc((r.examples || []).slice(0, 3).join(' · '))}
      </div>
      <button type="button" class="btn rs-btn-secondary btn-sm" data-rs-action="detail" data-regime-id="${r.id}">Ver ficha detallada</button>
    </article>
  `;
}

function renderDetail(rs) {
  const r = getRegimeById(rs.catalog, rs.selectedRegimeId);
  if (!r) return '<div class="rs-empty">Régimen no encontrado.</div>';

  const typeLabel = r.taxpayerType === 'company' ? 'Persona Moral' : 'Persona Física';
  const section = (title, items, empty = 'Consulte con un contador para su caso específico.') => {
    const list = Array.isArray(items) ? items : [];
    if (list.length === 0 && empty) return '';
    return `
      <section class="rs-detail-section">
        <h4>${title}</h4>
        ${list.length ? `<ul>${list.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : `<p class="rs-muted">${empty}</p>`}
      </section>
    `;
  };

  return `
    <div class="rs-breadcrumb">
      <button type="button" class="rs-link" data-rs-action="back-list">← Regímenes</button>
      <span>${esc(r.name)}</span>
    </div>
    <div class="rs-detail ${r.taxpayerType === 'company' ? 'rs-pm' : 'rs-pf'}">
      <div class="rs-detail-header">
        <span class="rs-regime-icon large">${r.icon || '📄'}</span>
        <div>
          <span class="rs-type-pill">${typeLabel}</span>
          <h2>${esc(r.name)}</h2>
          <p>${esc(r.description)}</p>
          ${r.warningLabel ? `<div class="rs-alert rs-alert-warning">${esc(r.warningLabel)}</div>` : ''}
          ${r.legacyOnly ? '<div class="rs-alert rs-alert-warning">Generalmente no está disponible para nuevas inscripciones.</div>' : ''}
        </div>
      </div>
      ${section('Para quién aplica', [r.whoItAppliesTo])}
      ${section('Ejemplos', r.examples)}
      ${section('Obligaciones frecuentes', r.commonObligations)}
      ${section('Declaraciones relacionadas', r.relatedDeclarations)}
      ${section('Comprobantes fiscales', r.fiscalDocuments)}
      ${section('Posibles deducciones', r.possibleDeductions)}
      ${section('Restricciones', r.restrictions)}
      ${section('Compatibilidad con otros regímenes', (r.compatibleRegimes || []).map((id) => getRegimeById(rs.catalog, id)?.name || id))}
      ${r.faq?.length ? `
        <section class="rs-detail-section">
          <h4>Preguntas frecuentes</h4>
          ${r.faq.map((f) => `<details class="rs-faq"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}
        </section>
      ` : ''}
      ${r.officialSourceUrl ? `<p class="rs-muted">Fuente orientativa: <a href="${esc(r.officialSourceUrl)}" target="_blank" rel="noopener">SAT / fuente oficial</a>${r.lastReviewedAt ? ` · Revisado: ${esc(r.lastReviewedAt)}` : ''}</p>` : ''}
      <div class="rs-detail-actions">
        <button type="button" class="btn rs-btn-primary" data-rs-action="save-profile" data-regime-id="${r.id}">Guardar en mi perfil</button>
        <button type="button" class="btn rs-btn-secondary" data-rs-action="start-quiz">Hacer cuestionario</button>
      </div>
    </div>
  `;
}

function renderQuestionnaire(rs) {
  const answers = rs.questionnaireAnswers;
  const steps = getVisibleQuestions(answers);
  const step = steps[rs.questionnaireStep] || steps[0];
  const progress = steps.length ? ((rs.questionnaireStep + 1) / steps.length) * 100 : 0;

  if (!step) {
    return renderResults(rs, {});
  }

  const optionsHtml = step.type === 'multi'
    ? step.options.map((o) => {
        const val = o.id || o.value;
        const label = o.label;
        const checked = (answers[step.id] || []).includes(val) ? 'checked' : '';
        return `<label class="rs-option"><input type="checkbox" name="${step.id}" value="${val}" ${checked}> ${esc(label)}</label>`;
      }).join('')
    : step.options.map((o) => {
        const val = o.value;
        const checked = answers[step.id] === val ? 'checked' : '';
        return `<label class="rs-option"><input type="radio" name="${step.id}" value="${val}" ${checked}> ${esc(o.label)}</label>`;
      }).join('');

  return `
    <div class="rs-breadcrumb">
      <button type="button" class="rs-link" data-rs-action="home">← Cancelar</button>
      <span>Cuestionario · paso ${rs.questionnaireStep + 1} de ${steps.length}</span>
    </div>
    <div class="rs-quiz">
      <div class="rs-progress"><div class="rs-progress-fill" style="width:${progress}%"></div></div>
      <h2 class="rs-title">${esc(step.title)}</h2>
      ${step.subtitle ? `<p class="rs-subtitle">${esc(step.subtitle)}</p>` : ''}
      <div class="rs-options" id="rs-quiz-options">${optionsHtml}</div>
      <div class="rs-quiz-nav">
        <button type="button" class="btn rs-btn-secondary" data-rs-action="quiz-prev" ${rs.questionnaireStep === 0 ? 'disabled' : ''}>Anterior</button>
        <button type="button" class="btn rs-btn-primary" data-rs-action="quiz-next">${rs.questionnaireStep >= steps.length - 1 ? 'Ver resultado' : 'Siguiente'}</button>
      </div>
    </div>
  `;
}

function renderResults(rs, taxProfile) {
  const normalized = normalizeQuestionnaireAnswers(rs.questionnaireAnswers);
  const profile = buildTaxProfileFromAnswers({
    q1: normalized.q1,
    q2: normalized.q2 || [],
    q3: normalized.q3,
    q4: normalized.q4,
    q5: normalized.q5,
  });
  const recommendations = recommendRegimes(profile, rs.catalog, 3);

  const cards = recommendations.map((rec, i) => `
    <div class="rs-result-card ${i === 0 ? 'rs-result-primary' : 'rs-result-secondary'}">
      <span class="rs-result-label">${i === 0 ? 'Posible régimen principal' : 'Régimen adicional posible'}</span>
      <h3>${esc(rec.regime?.name || rec.id)}</h3>
      <p><strong>Razón:</strong> ${esc(rec.reasons[0] || 'Coincide con las respuestas del cuestionario.')}</p>
      <button type="button" class="btn rs-btn-secondary btn-sm" data-rs-action="detail" data-regime-id="${rec.id}">Ver obligaciones</button>
      ${rec.regime?.possibleDeductions?.length ? `<p class="rs-muted"><strong>Posibles deducciones:</strong> ${esc(rec.regime.possibleDeductions.slice(0, 2).join('; '))}</p>` : ''}
    </div>
  `).join('');

  return `
    <div class="rs-breadcrumb">
      <button type="button" class="rs-link" data-rs-action="home">← Inicio</button>
      <span>Resultado del cuestionario</span>
    </div>
    <div class="rs-results">
      <h2 class="rs-title">Tus posibles regímenes</h2>
      <div class="rs-alert rs-alert-info">Una persona puede tributar en más de un régimen al mismo tiempo. El régimen aplicable depende del origen de cada ingreso.</div>
      ${cards || '<div class="rs-empty">No fue posible generar recomendaciones. Explora la lista de regímenes manualmente.</div>'}
      <div class="rs-result-actions">
        ${recommendations[0] ? `<button type="button" class="btn rs-btn-primary" data-rs-action="save-profile" data-regime-id="${recommendations[0].id}">Guardar en mi perfil</button>` : ''}
        <button type="button" class="btn rs-btn-secondary" data-rs-action="start-quiz">Repetir cuestionario</button>
        <button type="button" class="btn rs-btn-secondary" data-rs-action="home">Consultar con un contador</button>
      </div>
    </div>
  `;
}

function renderAdmin(rs) {
  const rules = loadRecommendationRules();
  return `
    <div class="rs-breadcrumb">
      <button type="button" class="rs-link" data-rs-action="home">← Inicio</button>
      <span>Panel administrativo</span>
    </div>
    <div class="rs-admin">
      <h2 class="rs-title">Panel administrativo</h2>
      <p class="rs-subtitle">Edita regímenes, reglas del cuestionario y contenido sin modificar el código.</p>
      <div class="rs-toolbar">
        <button type="button" class="btn rs-btn-secondary btn-sm" data-rs-action="reset-catalog">Restaurar catálogo predeterminado</button>
      </div>
      <div class="rs-admin-list">
        ${rs.catalog.map((r) => `
          <div class="rs-admin-row ${r.active ? '' : 'inactive'}">
            <div>
              <strong>${esc(r.name)}</strong>
              <span class="rs-type-pill">${r.taxpayerType === 'company' ? 'PM' : 'PF'}</span>
              ${r.legacyOnly ? '<span class="rs-badge rs-badge-warning">Histórico</span>' : ''}
            </div>
            <div class="rs-admin-actions">
              <button type="button" class="btn rs-btn-secondary btn-sm" data-rs-action="admin-edit" data-regime-id="${r.id}">Editar</button>
              <button type="button" class="btn rs-btn-secondary btn-sm" data-rs-action="admin-toggle" data-regime-id="${r.id}">${r.active ? 'Desactivar' : 'Activar'}</button>
            </div>
          </div>
        `).join('')}
      </div>
      <details class="rs-admin-rules">
        <summary>Reglas del cuestionario (JSON editable)</summary>
        <textarea id="rs-rules-json" class="rs-rules-editor" rows="12">${esc(JSON.stringify(rules, null, 2))}</textarea>
        <button type="button" class="btn rs-btn-primary btn-sm mt-1" data-rs-action="save-rules">Guardar reglas</button>
      </details>
    </div>
    ${rs.adminEditingId ? renderAdminEditModal(rs) : ''}
  `;
}

function renderAdminEditModal(rs) {
  const r = getRegimeById(rs.catalog, rs.adminEditingId);
  if (!r) return '';
  return `
    <div class="rs-admin-modal">
      <div class="rs-admin-modal-panel">
        <h3>Editar: ${esc(r.name)}</h3>
        <div class="field"><label>Nombre</label><input id="adm-name" value="${esc(r.name)}"></div>
        <div class="field"><label>Descripción</label><textarea id="adm-desc" rows="3">${esc(r.description)}</textarea></div>
        <div class="field"><label>URL oficial</label><input id="adm-url" value="${esc(r.officialSourceUrl || '')}"></div>
        <label class="checkbox-row"><input type="checkbox" id="adm-active" ${r.active ? 'checked' : ''}> Activo</label>
        <label class="checkbox-row"><input type="checkbox" id="adm-legacy" ${r.legacyOnly ? 'checked' : ''}> Régimen histórico</label>
        <div class="rs-quiz-nav">
          <button type="button" class="btn rs-btn-secondary" data-rs-action="admin-cancel">Cancelar</button>
          <button type="button" class="btn rs-btn-primary" data-rs-action="admin-save">Guardar cambios</button>
        </div>
      </div>
    </div>
  `;
}

export function bindRegimeSelector(root, rs, callbacks) {
  const { onNavigate, onSaveProfile, onToast, onPersistCatalog } = callbacks;

  root.querySelectorAll('[data-rs-action]').forEach((el) => {
    el.addEventListener('click', (e) => {
      const action = el.dataset.rsAction;
      const regimeId = el.dataset.regimeId;

      switch (action) {
        case 'home':
          rs.subView = 'home';
          rs.searchQuery = '';
          break;
        case 'list-pf':
          rs.subView = 'list';
          rs.listType = 'individual';
          rs.searchQuery = '';
          break;
        case 'list-pm':
          rs.subView = 'list';
          rs.listType = 'company';
          rs.searchQuery = '';
          break;
        case 'detail':
          rs.selectedRegimeId = regimeId;
          rs.subView = 'detail';
          break;
        case 'back-list':
          rs.subView = 'list';
          break;
        case 'start-quiz':
          rs.subView = 'questionnaire';
          rs.questionnaireStep = 0;
          rs.questionnaireAnswers = {};
          break;
        case 'quiz-prev':
          if (rs.questionnaireStep > 0) rs.questionnaireStep -= 1;
          break;
        case 'quiz-next':
          collectQuizAnswers(root, rs);
          const steps = getVisibleQuestions(rs.questionnaireAnswers);
          if (rs.questionnaireStep < steps.length - 1) {
            rs.questionnaireStep += 1;
          } else {
            rs.subView = 'results';
            const normalized = normalizeQuestionnaireAnswers(rs.questionnaireAnswers);
            const profile = buildTaxProfileFromAnswers({
              q1: normalized.q1,
              q2: normalized.q2 || [],
              q3: normalized.q3,
              q4: normalized.q4,
              q5: normalized.q5,
            });
            const recs = recommendRegimes(profile, rs.catalog, 3);
            callbacks.onQuestionnaireComplete?.(profile, recs.map((r) => r.id));
          }
          break;
        case 'save-profile':
          onSaveProfile?.(regimeId);
          break;
        case 'admin':
          rs.subView = 'admin';
          break;
        case 'admin-edit':
          rs.adminEditingId = regimeId;
          break;
        case 'admin-cancel':
          rs.adminEditingId = null;
          break;
        case 'admin-toggle': {
          const r = getRegimeById(rs.catalog, regimeId);
          if (r) {
            updateRegimeInCatalog(rs.catalog, regimeId, { active: !r.active });
            saveRegimeCatalog(rs.catalog);
            onToast?.(`Régimen ${r.active ? 'desactivado' : 'activado'}`);
          }
          break;
        }
        case 'admin-save': {
          const id = rs.adminEditingId;
          updateRegimeInCatalog(rs.catalog, id, {
            name: root.querySelector('#adm-name')?.value,
            description: root.querySelector('#adm-desc')?.value,
            officialSourceUrl: root.querySelector('#adm-url')?.value,
            active: root.querySelector('#adm-active')?.checked,
            legacyOnly: root.querySelector('#adm-legacy')?.checked,
          });
          saveRegimeCatalog(rs.catalog);
          rs.adminEditingId = null;
          onToast?.('Régimen actualizado');
          break;
        }
        case 'reset-catalog':
          rs.catalog = resetRegimeCatalog();
          onToast?.('Catálogo restaurado');
          break;
        case 'save-rules': {
          try {
            const parsed = JSON.parse(root.querySelector('#rs-rules-json')?.value || '{}');
            saveRecommendationRules(parsed);
            onToast?.('Reglas guardadas');
          } catch {
            onToast?.('JSON de reglas inválido', 'error');
          }
          break;
        }
        default:
          break;
      }
      onNavigate?.();
    });
  });

  const listSearch = root.querySelector('#rs-list-search');
  if (listSearch) {
    listSearch.addEventListener('input', () => {
      rs.searchQuery = listSearch.value;
      onNavigate?.();
    });
  }

  const globalSearch = root.querySelector('#rs-global-search');
  if (globalSearch) {
    globalSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && globalSearch.value.trim()) {
        rs.searchQuery = globalSearch.value;
        rs.subView = 'list';
        rs.listType = 'individual';
        onNavigate?.();
      }
    });
  }
}

function collectQuizAnswers(root, rs) {
  const answers = rs.questionnaireAnswers;
  const steps = getVisibleQuestions(answers);
  const step = steps[rs.questionnaireStep];
  if (!step) return;

  if (step.type === 'multi') {
    answers[step.id] = [...root.querySelectorAll(`#rs-quiz-options input[name="${step.id}"]:checked`)].map((i) => i.value);
  } else {
    const selected = root.querySelector(`#rs-quiz-options input[name="${step.id}"]:checked`);
    answers[step.id] = selected?.value || null;
  }
}

export function mapRegimeToAppSettings(regime) {
  if (!regime) return {};
  const contributorType = regime.taxpayerType === 'company' ? 'persona_moral' : 'persona_fisica';
  const updates = {
    contributorType,
    selectedRegimeCatalogId: regime.id,
    selectedRegimeName: regime.name,
  };
  if (regime.appRegimeId) updates.taxRegime = regime.appRegimeId;
  return updates;
}

export { recommendRegimes, buildTaxProfileFromAnswers };
