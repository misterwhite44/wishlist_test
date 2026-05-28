// ── App state ────────────────────────────────────────────────────────────────
let state = null;
let currentPage = 'budget';
let sortBy = 'dateDesc';
let currentSuggestions = [];
let selectedCategory = null;

const PRIORITY_ORDER = { haute: 3, normale: 2, basse: 1 };

function normalizeState(appState) {
  if (!appState) appState = {};
  appState.categories = Array.isArray(appState.categories) ? appState.categories : [];
  appState.items = Array.isArray(appState.items) ? appState.items : [];
  if (typeof appState.budgetLimit !== 'number' || appState.budgetLimit < 0) {
    appState.budgetLimit = 0;
  }
  appState.items.forEach(item => {
    if (typeof item.price !== 'number' || item.price < 0) item.price = 0;
    if (!item.id) item.id = 'item_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    if (!item.name) item.name = 'Article';
    if (!item.cat || !appState.categories.some(c => c.id === item.cat)) item.cat = appState.categories[0]?.id || '';
    item.subtitle = item.subtitle || '';
    item.link = item.link || '';
    item.description = item.description || '';
    item.checked = typeof item.checked === 'boolean' ? item.checked : false;
    item.priority = ['haute', 'normale', 'basse'].includes(item.priority) ? item.priority : 'normale';
    item.dateAdded = typeof item.dateAdded === 'number' ? item.dateAdded : Date.now();
    item.comparisons = Array.isArray(item.comparisons) ? item.comparisons : [];
  });
  return appState;
}

// Initialize app on page load
async function initializeApp() {
  try {
    state = normalizeState(await AppData.loadData());
    console.log('✨ App initialized with data');
    
    // Setup real-time listener for Firestore updates
    AppData.setupRealtimeListener((newData) => {
      state = normalizeState(newData);
      console.log('🔄 UI updating from Firestore changes...');
      // Refresh current page if visible
      if (currentPage === 'budget') renderBudget();
      if (currentPage === 'categories') renderCategories();
      rebuildSidebar();
      updateMobileTotal();
    });
    
    // Initial render
    renderBudget();
    rebuildSidebar();
    bindSidebarAutoClose();
  } catch (err) {
    console.error('❌ App initialization failed:', err);
    alert('Erreur lors du chargement des données. Vérifiez votre configuration Firebase.');
  }
}

// Update mobile total display
function updateMobileTotal() {
  const el = document.getElementById('mobile-total');
  if (el && state && state.items) el.textContent = state.items.reduce((s,i) => s + (i.price || 0), 0).toLocaleString('fr-FR') + ' €';
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// ── Routing ──────────────────────────────────────────────────────────────────
function navigate(page) {
  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');
  document.querySelectorAll(`.nav-item[data-page="${page}"]`).forEach(n => n.classList.add('active'));

  // Refresh content
  if (page === 'budget') renderBudget();
  if (page === 'categories') renderCategories();
  if (page === 'ai') initAI();

  // Close mobile sidebar
  closeSidebar();
}

function navigateToCategory(catId) {
  selectedCategory = catId;
  // go to budget view and render filtered
  currentPage = 'budget';
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-budget')?.classList.add('active');
  // mark only the selected category as active
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const catBtn = document.querySelector(`.nav-item[data-cat="${catId}"]`);
  if (catBtn) catBtn.classList.add('active');
  renderBudget();
  closeSidebar();
}

function clearCategoryFilterAndNavigate(page) {
  selectedCategory = null;
  navigate(page);
}

// Sidebar control helpers (mobile)
function openSidebar() {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar) sidebar.classList.add('open');
  if (backdrop) backdrop.classList.add('open');
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar) sidebar.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  if (sidebar.classList.contains('open')) closeSidebar(); else openSidebar();
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n) { 
  if (n === undefined || n === null) return '0 €';
  return (typeof n === 'number' ? n : 0).toLocaleString('fr-FR') + ' €'; 
}
function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function getCatById(id) { return state?.categories?.find(c => c.id === id); }
function getItemById(id) { return state?.items?.find(i => i.id === id); }

function sortItems(items) {
  return [...items].sort((a, b) => {
    switch (sortBy) {
      case 'priceAsc': return a.price - b.price;
      case 'priceDesc': return b.price - a.price;
      case 'dateAsc': return a.dateAdded - b.dateAdded;
      case 'dateDesc': return b.dateAdded - a.dateAdded;
      case 'priorityAsc': return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || a.price - b.price;
      case 'priorityDesc': return PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority] || b.price - a.price;
      case 'categoryAsc': return (getCatById(a.cat)?.label || '').localeCompare(getCatById(b.cat)?.label || '') || a.name.localeCompare(b.name);
      case 'categoryDesc': return (getCatById(b.cat)?.label || '').localeCompare(getCatById(a.cat)?.label || '') || a.name.localeCompare(b.name);
      default: return b.dateAdded - a.dateAdded;
    }
  });
}

function setSortBy(value) {
  sortBy = value;
  renderBudget();
}

function setBudgetLimitPrompt() {
  const current = state.budgetLimit || 0;
  const input = prompt('Budget mensuel prévu (€) :', current);
  const value = Number(input);
  if (!isNaN(value) && value >= 0) {
    state.budgetLimit = Math.round(value);
    persist();
    renderBudget();
  }
}

function exportCSV() {
  if (!state?.items?.length) {
    return alert('Aucun article à exporter.');
  }
  const header = ['id', 'name', 'subtitle', 'price', 'cat', 'checked', 'link', 'description', 'priority', 'dateAdded'];
  const rows = state.items.map(item => [
    item.id,
    item.name,
    item.subtitle,
    item.price,
    item.cat,
    item.checked ? '1' : '0',
    item.link,
    item.description,
    item.priority,
    item.dateAdded
  ]);
  const csv = [header, ...rows].map(r => r.map(escapeCSV).join(',')).join('\r\n');
  downloadFile('buylist-items.csv', csv);
}

function triggerCSVImport() {
  document.getElementById('csv-import-input')?.click();
}

function handleCSVImport(event) {
  const file = event.target?.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const text = String(reader.result || '').trim();
    if (!text) return alert('Fichier vide ou invalide.');
    const rows = parseCSV(text);
    if (!rows.length) return alert('CSV invalide.');
    const headers = rows.shift().map(cell => String(cell).trim().toLowerCase());
    if (!headers.length) return alert('CSV invalide.');
    if (!confirm(`Importer ${rows.length} article${rows.length > 1 ? 's' : ''} depuis le CSV ?`)) return;

    rows.forEach((row, index) => {
      const data = {};
      headers.forEach((header, colIndex) => {
        data[header] = row[colIndex] || '';
      });
      let categoryId = String(data.cat || '').trim();
      let cat = state.categories.find(c => c.id === categoryId || c.label.toLowerCase() === categoryId.toLowerCase());
      if (!cat) {
        categoryId = categoryId || state.categories[0]?.id || 'autres';
        if (!state.categories.some(c => c.id === categoryId)) {
          state.categories.push({ id: categoryId, label: categoryId || 'Autres', icon: '📦', color: '#888' });
        }
      } else {
        categoryId = cat.id;
      }

      state.items.push({
        id: data.id || `item_${Date.now()}_${index}`,
        name: data.name || 'Article importé',
        subtitle: data.subtitle || '',
        price: Number(data.price) || 0,
        cat: categoryId,
        checked: String(data.checked).trim() === '1' || String(data.checked).trim().toLowerCase() === 'true',
        link: data.link || '',
        description: data.description || '',
        priority: ['haute', 'normale', 'basse'].includes(String(data.priority).trim()) ? String(data.priority).trim() : 'normale',
        dateAdded: Number(data.dateadded) || Number(data.dateAdded) || Date.now(),
        comparisons: []
      });
    });

    event.target.value = '';
    persist();
    rebuildSidebar();
    renderBudget();
    renderCategories();
    alert('Import CSV terminé.');
  };
  reader.readAsText(file, 'UTF-8');
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(cell);
        cell = '';
      } else if (char === '\n') {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = '';
      } else if (char === '\r') {
        continue;
      } else {
        cell += char;
      }
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter(r => r.length && r.some(c => c !== ''));
}

function escapeCSV(value) {
  const text = value == null ? '' : String(value);
  if (/[",\n\r]/.test(text)) {
    return '"' + text.replace(/"/g, '""') + '"';
  }
  return text;
}

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function generateSuggestions() {
  const suggestions = [];
  const template = (name, subtitle, catId, priority = 'normale') => ({ name, subtitle, cat: catId, priority, label: `${name} (${subtitle || 'Suggestion'})` });
  const keywordMap = [
    { test: /cinema|home cinema|projecteur|télévision/i, items: ['Câble HDMI 2.1', 'Télécommande universelle', 'Support mural TV'], subs: ['Pour 4K', 'Contrôle simple', 'Fixation stable'] },
    { test: /tennis/i, items: ['Balles de tennis', 'Sac de transport', 'Tapis d’entraînement'], subs: ['Pack 3', 'Pour machine à balles', 'En mousse antidérapante'] },
    { test: /bureau|gaming|gaming/i, items: ['Lampe de bureau', 'Tapis de souris', 'Support ordinateur portable'], subs: ['Lumière douce', 'Grande surface', 'Réglable'] }
  ];

  state.categories.forEach(cat => {
    const items = state.items.filter(i => i.cat === cat.id);
    const group = keywordMap.find(entry => entry.test.test(cat.label));
    const suggestionsForCat = group ? group.items.map((name, index) => template(name, group.subs[index] || '', cat.id)) : [
      template(`Accessoire ${cat.label}`, 'À ajouter', cat.id),
      template(`Extension pour ${cat.label}`, 'Idéal pour compléter', cat.id)
    ];

    if (!items.length) {
      suggestions.push(...suggestionsForCat.slice(0, 3));
    } else if (items.length < 3) {
      suggestions.push(suggestionsForCat[0]);
    }
  });

  if (!suggestions.length) {
    suggestions.push(
      template('Câble universel', 'Multi-usage', state.categories[0]?.id || 'autres'),
      template('Protection supplémentaire', 'Housse ou coque', state.categories[0]?.id || 'autres'),
      template('Garantie prolongée', 'Pour plus de sérénité', state.categories[0]?.id || 'autres')
    );
  }

  return suggestions.slice(0, 6);
}

function applySuggestion(index) {
  const suggestion = currentSuggestions[index];
  if (!suggestion) return;
  document.getElementById('add-name').value = suggestion.name;
  document.getElementById('add-sub').value = suggestion.subtitle;
  document.getElementById('add-cat').value = suggestion.cat;
  document.getElementById('add-priority').value = suggestion.priority || 'normale';
  document.getElementById('add-name')?.focus();
  document.getElementById('add-form-wrap')?.scrollIntoView({ behavior: 'smooth' });
}

function catTotal(catId) {
  if (!state?.items) return 0;
  return state.items.filter(i => i.cat === catId).reduce((s, i) => s + (i.price || 0), 0);
}

function grandTotal() { 
  if (!state?.items) return 0;
  return state.items.reduce((s, i) => s + (i.price || 0), 0); 
}

function persist() { AppData.saveData(state); }

// ── Budget page ──────────────────────────────────────────────────────────────
function renderBudget() {
  const cont = document.getElementById('budget-content');
  if (!cont) return;
  if (!state || !state.items || !state.categories) {
    console.warn('⚠️ State not ready for renderBudget');
    return;
  }

  let items = sortItems(state.items);
  if (selectedCategory) {
    items = items.filter(i => i.cat === selectedCategory);
  }
  const total = grandTotal();
  const checked = items.filter(i => i.checked).length;
  const limit = state.budgetLimit || 0;
  const remaining = limit - total;
  const overBudget = limit > 0 && total > limit;
  const budgetFill = limit > 0 ? Math.min(100, Math.round(total / limit * 100)) : 0;

  const budgetBarHTML = state.categories.map(cat => {
    const sub = catTotal(cat.id);
    if (!sub) return '';
    const pct = total ? Math.round(sub / total * 100) : 0;
    return `<span class="budget-tag" style="color:${cat.color};border-color:${cat.color}20;background:${cat.color}10">${cat.icon} ${cat.label} — ${fmt(sub)} <span style="opacity:0.5">(${pct}%)</span></span>`;
  }).join('');

  const segments = state.categories.map(cat => ({ cat, amount: catTotal(cat.id) })).filter(s => s.amount > 0);
  let pieStyle = 'background: var(--surface3);';
  let legendHTML = '';
  if (segments.length) {
    let start = 0;
    const gradients = segments.map(segment => {
      const pct = Math.round(segment.amount / total * 100);
      const end = start + pct;
      const value = `${segment.cat.color} ${start}% ${end}%`;
      start = end;
      return value;
    });
    pieStyle = `background: conic-gradient(${gradients.join(', ')});`;
    legendHTML = segments.map(segment => {
      const pct = total ? Math.round(segment.amount / total * 100) : 0;
      return `<div class="legend-item"><span class="legend-color" style="background:${segment.cat.color}"></span>${esc(segment.cat.label)} <span>${pct}%</span></div>`;
    }).join('');
  }

  const suggestions = generateSuggestions();
  currentSuggestions = suggestions;
  const suggestionsHTML = suggestions.map((suggestion, index) => `
    <button class="ai-sugg" onclick="applySuggestion(${index})">${esc(suggestion.label)}</button>`).join('');

  const catOptions = state.categories.map(c => `<option value="${c.id}">${c.icon} ${c.label}</option>`).join('');

  const activeFilterLabel = selectedCategory ? `<div style="margin-left:12px;font-size:0.9rem;color:var(--muted);font-family:var(--font-m)">Filtre: ${esc(getCatById(selectedCategory)?.label || '')} <button class="btn btn-ghost" style="margin-left:8px;padding:6px 8px;font-size:0.72rem" onclick="clearCategoryFilterAndNavigate('budget')">Effacer</button></div>` : '';

  const sortOptions = [
    { value: 'dateDesc', label: 'Date ajoutée (récent)' },
    { value: 'dateAsc', label: 'Date ajoutée (ancien)' },
    { value: 'priceAsc', label: 'Prix croissant' },
    { value: 'priceDesc', label: 'Prix décroissant' },
    { value: 'priorityDesc', label: 'Priorité haute → basse' },
    { value: 'priorityAsc', label: 'Priorité basse → haute' },
    { value: 'categoryAsc', label: 'Catégorie A→Z' },
    { value: 'categoryDesc', label: 'Catégorie Z→A' }
  ].map(opt => `<option value="${opt.value}"${sortBy === opt.value ? ' selected' : ''}>${opt.label}</option>`).join('');

  let html = `
    <div class="budget-toolbar">
      <div class="toolbar-group">
        <label for="sort-by">Trier par</label>
        <select id="sort-by" onchange="setSortBy(this.value)">${sortOptions}</select>
      </div>
      ${activeFilterLabel}
      <div class="toolbar-actions">
        <button class="btn btn-ghost" onclick="exportCSV()">Exporter CSV</button>
        <button class="btn btn-ghost" onclick="triggerCSVImport()">Importer CSV</button>
        <button class="btn btn-accent" onclick="setBudgetLimitPrompt()">Budget : ${fmt(limit)}</button>
      </div>
    </div>

    <div class="total-bar">
      <div>
        <div class="t-label">Budget total estimé</div>
        <div class="t-amount">${fmt(total)}</div>
        <div style="font-size:0.7rem;font-family:var(--font-m);color:var(--muted);margin-top:4px">
          ${state.items.length} article${state.items.length > 1 ? 's' : ''} · ${checked} acheté${checked > 1 ? 's' : ''}
        </div>
      </div>
      <div class="budget-bars">${budgetBarHTML}</div>
    </div>

    <div class="budget-summary ${overBudget ? 'budget-alert' : ''}">
      <div>${limit ? `Plafond mensuel : <strong>${fmt(limit)}</strong>` : 'Aucun plafond défini'}</div>
      <div>Dépensé : <strong>${fmt(total)}</strong></div>
      <div>${limit ? (overBudget ? `Dépassement : <strong>${fmt(total - limit)}</strong>` : `Restant : <strong>${fmt(remaining)}</strong>`) : ''}</div>
    </div>

    <div class="budget-meter">
      <div class="meter-track">
        <div class="meter-fill" style="width:${budgetFill}%; background:${overBudget ? 'var(--red)' : 'var(--accent)'}"></div>
        ${overBudget && limit > 0 ? `<div class="meter-over" style="width:${Math.min(100, Math.round((total - limit) / limit * 100))}%;"></div>` : ''}
      </div>
      <div class="meter-labels">
        <span>${limit ? `Plafond ${fmt(limit)}` : 'Plafond non défini'}</span>
        <span>Dépensé ${fmt(total)}</span>
        ${limit ? `<span>${overBudget ? `Dépassement ${fmt(total - limit)}` : `Reste ${fmt(remaining)}`}</span>` : ''}
      </div>
    </div>

    <div class="budget-grid">
      <div class="chart-card">
        <div class="chart-title">Répartition par catégorie</div>
        <div class="pie-chart" style="${pieStyle}"></div>
        <div class="chart-legend">${legendHTML || '<div class="legend-empty">Ajoute des articles pour voir le graphique.</div>'}</div>
      </div>
      <div class="chart-card suggestions-panel">
        <div class="chart-title">Suggestions automatiques</div>
        <div class="suggestions-grid">${suggestionsHTML}</div>
      </div>
    </div>`;

  state.categories.forEach(cat => {
    const itemsByCategory = items.filter(i => i.cat === cat.id);
    const sub = itemsByCategory.reduce((s, i) => s + i.price, 0);

    html += `<div class="cat-section">
      <div class="cat-header">
        <span class="cat-dot" style="background:${cat.color}"></span>
        <h3>${cat.label}</h3>
        <span class="cat-sub">${fmt(sub)}</span>
        <button class="item-btn" onclick="event.stopPropagation(); editCategory('${cat.id}')" title="Modifier la catégorie">✏</button>
        <button class="item-btn" style="margin-left:8px" onclick="event.stopPropagation(); quickAddItem('${cat.id}')" title="Ajouter dans cette catégorie">＋</button>
      </div>
      <div class="items-grid">`;

    if (!itemsByCategory.length) {
      html += `<div class="empty-cat">Aucun article — <button class="ai-sugg" onclick="event.stopPropagation(); quickAddItem('${cat.id}')">+ Ajouter</button></div>`;
    } else {
      itemsByCategory.forEach(item => {
        html += `
          <div class="item-row ${item.checked ? 'checked' : ''}" onclick="toggleCheck('${item.id}')">
            <div class="item-checkbox">${item.checked ? '✓' : ''}</div>
            <span class="item-icon">${cat.icon}</span>
            <div class="item-info">
              <div class="name">${esc(item.name)}</div>
              <div class="item-meta"><span class="priority-pill priority-${item.priority}">${item.priority}</span></div>
              ${item.subtitle ? `<div class="sub">${esc(item.subtitle)}</div>` : ''}
            </div>
            <span class="item-price" style="color:${cat.color}">${fmt(item.price)}</span>
            <div class="item-actions" onclick="event.stopPropagation()">
              <button class="item-btn info" onclick="event.stopPropagation(); openEditItem('${item.id}')" title="Modifier l'article">✎</button>
              <button class="item-btn info" onclick="event.stopPropagation(); openDetail('${item.id}')" title="Détails & comparaison">🔍</button>
              <button class="item-btn del" onclick="event.stopPropagation(); deleteItem('${item.id}')" title="Supprimer">✕</button>
            </div>
          </div>`;
      });
    }

    html += `</div></div>`;
  });

  if (state.categories.length) {
    html += `
      <div class="separator"></div>
      <div class="add-form-wrap" id="add-form-wrap">
        <h3>+ Ajouter un article</h3>
        <div class="form-grid">
          <input type="text" id="add-name" placeholder="Nom de l'article" />
          <input type="number" id="add-price" placeholder="Prix €" min="0" step="1" />
          <select id="add-cat">${catOptions}</select>
          <select id="add-priority">
            <option value="haute">Priorité haute</option>
            <option value="normale" selected>Priorité normale</option>
            <option value="basse">Priorité basse</option>
          </select>
          <button class="btn btn-primary span-2" onclick="addItem()">Ajouter →</button>
        </div>
        <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
          <input type="text" id="add-sub" placeholder="Sous-titre (optionnel)" style="flex:1;min-width:160px" />
          <input type="text" id="add-link" placeholder="Lien produit (optionnel)" style="flex:1;min-width:160px" />
        </div>
        <div style="margin-top:8px">
          <textarea id="add-desc" placeholder="Description (optionnel)..." style="height:60px"></textarea>
        </div>
      </div>`;
  } else {
    html += `
      <div class="separator"></div>
      <div class="add-form-wrap">
        <h3>Créer une catégorie</h3>
        <div class="empty-cat">Aucune catégorie trouvée. Va dans l'onglet Catégories pour en créer avant d'ajouter des articles.</div>
      </div>`;
  }

  cont.innerHTML = html;
  document.getElementById('add-price')?.addEventListener('keydown', e => { if (e.key === 'Enter') addItem(); });
}

function toggleCheck(id) {
  const item = getItemById(id);
  if (item) { item.checked = !item.checked; persist(); renderBudget(); }
}

function deleteItem(id) {
  const item = getItemById(id);
  if (!item) return;
  if (!confirm(`Supprimer l'article « ${item.name} » ? Cette action est irréversible.`)) return;
  state.items = state.items.filter(i => i.id !== id);
  persist();
  renderBudget();
}

function openEditItem(itemId) {
  const item = getItemById(itemId);
  if (!item) return;

  const catSelect = document.getElementById('item-modal-cat');
  if (catSelect) {
    catSelect.innerHTML = state.categories.map(c => `<option value="${c.id}">${c.icon} ${c.label}</option>`).join('');
  }

  document.getElementById('item-modal-id').value = item.id;
  document.getElementById('item-modal-name').value = item.name;
  document.getElementById('item-modal-price').value = item.price;
  document.getElementById('item-modal-cat').value = item.cat;
  document.getElementById('item-modal-priority').value = item.priority || 'normale';
  document.getElementById('item-modal-sub').value = item.subtitle || '';
  document.getElementById('item-modal-link').value = item.link || '';
  document.getElementById('item-modal-desc').value = item.description || '';
  document.getElementById('item-modal').querySelector('h3').textContent = 'Modifier l’article';
  document.getElementById('item-modal-overlay').classList.add('open');
  setTimeout(() => document.getElementById('item-modal-name')?.focus(), 50);
}

function closeItemModal() {
  document.getElementById('item-modal-overlay').classList.remove('open');
}

function saveItemModal() {
  const id = document.getElementById('item-modal-id').value;
  const item = getItemById(id);
  if (!item) return;

  const name = document.getElementById('item-modal-name').value.trim();
  const price = parseFloat(document.getElementById('item-modal-price').value);
  const cat = document.getElementById('item-modal-cat').value;
  const sub = document.getElementById('item-modal-sub').value.trim();
  const link = document.getElementById('item-modal-link').value.trim();
  const desc = document.getElementById('item-modal-desc').value.trim();

  if (!name || isNaN(price) || price < 0) {
    const el = document.getElementById('item-modal-name');
    if (el) { el.style.borderColor = 'var(--red)'; setTimeout(() => el.style.borderColor = '', 1200); }
    return;
  }

  item.name = name;
  item.price = Math.round(price);
  item.cat = cat;
  item.subtitle = sub;
  item.link = link;
  item.description = desc;
  item.priority = document.getElementById('item-modal-priority')?.value || 'normale';

  persist();
  closeItemModal();
  renderBudget();
}

function addItem() {
  const name  = document.getElementById('add-name')?.value.trim();
  const price = parseFloat(document.getElementById('add-price')?.value);
  const cat   = document.getElementById('add-cat')?.value;
  const priority = document.getElementById('add-priority')?.value || 'normale';
  const sub   = document.getElementById('add-sub')?.value.trim();
  const link  = document.getElementById('add-link')?.value.trim();
  const desc  = document.getElementById('add-desc')?.value.trim();

  if (!name || isNaN(price) || price < 0) {
    const el = document.getElementById('add-name');
    if (el) { el.style.borderColor = 'var(--red)'; setTimeout(() => el.style.borderColor = '', 1200); }
    return;
  }

  state.items.push({
    id: 'item_' + Date.now(),
    name,
    price: Math.round(price),
    cat,
    priority,
    subtitle: sub || '',
    link: link || '',
    description: desc || '',
    comparisons: [],
    checked: false,
    dateAdded: Date.now()
  });

  persist();
  renderBudget();
}

function quickAddItem(catId) {
  const el = document.getElementById('add-cat');
  if (el) el.value = catId;
  document.getElementById('add-name')?.focus();
  document.getElementById('add-form-wrap')?.scrollIntoView({ behavior: 'smooth' });
}

// ── Detail panel ─────────────────────────────────────────────────────────────
function openDetail(itemId) {
  const item = getItemById(itemId);
  if (!item) return;
  const cat = getCatById(item.cat);

  const overlay = document.getElementById('detail-overlay');

  // Comparison table
  let compHTML = '';
  if (item.comparisons && item.comparisons.length) {
    const keys = Object.keys(item.comparisons[0]).filter(k => k !== 'model');
    compHTML = `
      <div class="desc-block">
        <h4>Comparaison des modèles</h4>
        <div class="comp-table-wrap">
          <table class="comp-table">
            <thead><tr>
              <th>Modèle</th>
              ${keys.map(k => `<th>${k === 'score' ? 'Score' : k}</th>`).join('')}
            </tr></thead>
            <tbody>
              ${item.comparisons.map(row => `
                <tr class="${row.model === item.name ? 'highlight' : ''}">
                  <td><strong>${esc(row.model)}</strong>${row.model === item.name ? ` <span class="tag" style="background:var(--accent-dim);color:var(--accent)">Sélectionné</span>` : ''}</td>
                  ${keys.map(k => {
                    if (k === 'score') return `<td><div class="score-bar"><div class="score-track"><div class="score-fill" style="width:${row[k]*10}%"></div></div><span class="score-num">${row[k]}/10</span></div></td>`;
                    if (typeof row[k] === 'boolean') return `<td class="${row[k] ? 'bool-yes' : 'bool-no'}">${row[k] ? '✓' : '—'}</td>`;
                    if (k === 'price') return `<td style="font-family:var(--font-m)">${fmt(row[k])}</td>`;
                    return `<td>${esc(String(row[k]))}</td>`;
                  }).join('')}
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  }

  overlay.querySelector('.panel-header').innerHTML = `
    <span style="font-size:1.8rem">${cat?.icon || '📦'}</span>
    <div>
      <div class="panel-title">${esc(item.name)}</div>
      <div class="panel-sub">${esc(item.subtitle || '')} · <span style="color:${cat?.color || 'var(--accent)'};font-family:var(--font-m)">${fmt(item.price)}</span></div>
    </div>
    <button class="panel-close" onclick="closeDetail()">✕</button>`;

  overlay.querySelector('.panel-body').innerHTML = `
    ${item.description ? `
    <div class="desc-block">
      <h4>Description</h4>
      <p>${esc(item.description)}</p>
    </div>` : ''}
    ${item.link ? `<div class="desc-block"><a href="${esc(item.link)}" target="_blank" class="link-btn">🔗 Voir le produit →</a></div>` : ''}
    ${compHTML}
    <div class="desc-block">
      <h4>Demander à l'IA</h4>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="ai-sugg" onclick="askAIAbout('${item.id}', 'est-ce un bon achat ?')">Est-ce un bon achat ?</button>
        <button class="ai-sugg" onclick="askAIAbout('${item.id}', 'quelles sont les meilleures alternatives ?')">Alternatives ?</button>
        <button class="ai-sugg" onclick="askAIAbout('${item.id}', 'quels sont les avis utilisateurs ?')">Avis utilisateurs</button>
        <button class="ai-sugg" onclick="askAIAbout('${item.id}', 'où acheter au meilleur prix ?')">Meilleur prix ?</button>
      </div>
    </div>`;

  overlay.classList.add('open');
}

function closeDetail() {
  document.getElementById('detail-overlay').classList.remove('open');
}

// Close on backdrop click
document.getElementById('detail-overlay')?.addEventListener('click', function(e) {
  if (e.target === this) closeDetail();
});

// ── Categories page ──────────────────────────────────────────────────────────
function renderCategories() {
  const cont = document.getElementById('cats-content');
  if (!cont) return;

  const maxSub = Math.max(...state.categories.map(c => catTotal(c.id)), 1);

  let grid = '<div class="cats-grid">';
  state.categories.forEach(cat => {
    const items = state.items.filter(i => i.cat === cat.id);
    const sub = items.reduce((s, i) => s + i.price, 0);
    const pct = Math.round(sub / maxSub * 100);

    grid += `
      <div class="cat-card">
        <div class="cc-icon">${cat.icon}</div>
        <div class="cc-name">${esc(cat.label)}</div>
        <div class="cc-count">${items.length} article${items.length !== 1 ? 's' : ''}</div>
        <div class="cc-bar"><div class="cc-bar-fill" style="width:${pct}%;background:${cat.color}"></div></div>
        <div class="cc-total" style="color:${cat.color};font-family:var(--font-m)">${fmt(sub)}</div>
        <div class="cc-actions">
          <button class="btn btn-ghost" style="font-size:0.72rem;padding:4px 10px" onclick="editCategory('${cat.id}')">✏ Modifier</button>
          <button class="btn btn-danger" style="font-size:0.72rem;padding:4px 10px" onclick="deleteCategory('${cat.id}')">✕</button>
        </div>
      </div>`;
  });
  grid += '</div>';

  const newCatBtn = `
    <button class="btn btn-accent" onclick="openNewCatModal()">＋ Nouvelle catégorie</button>`;

  cont.innerHTML = grid + newCatBtn;
}

function deleteCategory(id) {
  const cat = getCatById(id);
  if (!cat) return;
  if (!confirm(`Supprimer la catégorie « ${cat.label} » et tous les articles associés ?`)) return;
  state.categories = state.categories.filter(c => c.id !== id);
  state.items = state.items.filter(i => i.cat !== id);
  persist();
  renderCategories();
  rebuildSidebar();
}

// ── New category modal ────────────────────────────────────────────────────────
function openNewCatModal(editId) {
  const modal = document.getElementById('cat-modal');
  const editing = editId ? getCatById(editId) : null;

  modal.querySelector('h3').textContent = editing ? 'Modifier la catégorie' : 'Nouvelle catégorie';
  document.getElementById('cat-modal-id').value   = editId || '';
  document.getElementById('cat-modal-label').value = editing?.label || '';
  document.getElementById('cat-modal-icon').value  = editing?.icon  || '';
  document.getElementById('cat-modal-color').value = editing?.color || '#e8c547';

  modal.parentElement.classList.add('open');
}

function closeCatModal() {
  document.getElementById('cat-modal').parentElement.classList.remove('open');
}

function saveCatModal() {
  const id    = document.getElementById('cat-modal-id').value;
  const label = document.getElementById('cat-modal-label').value.trim();
  const icon  = document.getElementById('cat-modal-icon').value.trim();
  const color = document.getElementById('cat-modal-color').value;

  if (!label) return;

  if (id) {
    const cat = getCatById(id);
    if (cat) { cat.label = label; cat.icon = icon || '📦'; cat.color = color; }
  } else {
    const newId = 'cat_' + Date.now();
    state.categories.push({ id: newId, label, icon: icon || '📦', color });
  }

  persist();
  closeCatModal();
  renderCategories();
  rebuildSidebar();
}

function editCategory(id) { openNewCatModal(id); }

function bindSidebarAutoClose() {
  const sidebar = document.getElementById('sidebar');
  const mobileToggle = document.querySelector('.mobile-bar button');
  document.addEventListener('click', (event) => {
    if (!sidebar?.classList.contains('open')) return;
    if (sidebar.contains(event.target) || mobileToggle?.contains(event.target)) return;
    closeSidebar();
  });
}

// ── Sidebar rebuild ───────────────────────────────────────────────────────────
function rebuildSidebar() {
  const cont = document.getElementById('nav-cats');
  if (!cont) return;
  if (!state || !state.categories || !state.items) return;
  cont.innerHTML = state.categories.map(cat => `
    <button class="nav-item ${selectedCategory===cat.id ? 'active' : ''}" data-page="budget-cat" data-cat="${cat.id}" onclick="navigateToCategory('${cat.id}')" style="">
      <span class="nav-icon">${cat.icon}</span>
      <span>${cat.label}</span>
      <span class="nav-badge">${state.items.filter(i => i.cat === cat.id).length}</span>
    </button>`).join('');
}

// ── AI helpers ───────────────────────────────────────────────────────────────
function askAIAbout(itemId, question) {
  const item = getItemById(itemId);
  if (!item) return;
  closeDetail();
  navigate('ai');
  setTimeout(() => {
    sendAIMessage(`Concernant le produit "${item.name}" (${fmt(item.price)}) : ${question}`);
  }, 300);
}

// ── Data management ──────────────────────────────────────────────────────────
async function resetDataUI() {
  if (!confirm('Remettre toutes les données à zéro ? Cette action supprimera toutes les modifications et réinitialisera l’état partagé en Firestore.')) return;
  try {
    state = normalizeState(await AppData.resetData());
    rebuildSidebar();
    renderBudget();
    console.log('✅ Data reset successfully');
  } catch (err) {
    console.error('❌ Reset failed:', err);
    alert('Erreur lors de la réinitialisation');
  }
}

// ── Init ─────────────────────────────────────────────────────────────────────
function init() {
  rebuildSidebar();
  navigate('budget');
}

// Don't call init directly - use initializeApp instead
// window.addEventListener('DOMContentLoaded', init);
