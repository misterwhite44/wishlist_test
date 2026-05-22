// ── AI Chat — powered by Groq (free tier) ───────────────────────────────────
// API docs: https://console.groq.com
// Model: llama-3.3-70b-versatile (free, ultra fast)

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL   = 'llama-3.3-70b-versatile';

let aiMessages    = [];
let aiInitialized = false;
let aiTyping      = false;

// ── Key management ────────────────────────────────────────────────────────────
function getGroqKey() {
  return localStorage.getItem('groq_api_key') || '';
}

function saveGroqKey(key) {
  localStorage.setItem('groq_api_key', key.trim());
}

function clearGroqKey() {
  localStorage.removeItem('groq_api_key');
}

// ── Init ──────────────────────────────────────────────────────────────────────
function initAI() {
  if (aiInitialized) return;
  aiInitialized = true;
  renderAIPage();
}

function renderAIPage() {
  const key = getGroqKey();
  if (!key) {
    renderKeySetup();
  } else {
    if (!aiMessages.length) {
      addAIMessage('assistant',
        `Bonjour ! Je suis ton assistant pour ta liste d'achats, propulsé par **Llama 3.3** via Groq.\n\nJ'ai accès à ta liste complète (${state.items.length} articles · total ${fmt(grandTotal())}). Je peux comparer des produits, analyser ton budget, ou répondre à toutes tes questions.\n\nQue veux-tu savoir ?`
      );
    }
  }
}

function renderKeySetup() {
  const msgsEl = document.getElementById('ai-msgs');
  const suggsEl = document.getElementById('ai-suggestions');
  const inputBar = document.querySelector('.ai-input-bar');
  if (!msgsEl) return;

  if (suggsEl) suggsEl.style.display = 'none';
  if (inputBar) inputBar.style.display = 'none';

  msgsEl.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:100%;padding:2rem">
      <div style="background:var(--surface);border:1px solid var(--border2);border-radius:var(--radius-lg);padding:2rem;max-width:440px;width:100%">

        <div style="font-size:2rem;margin-bottom:1rem;text-align:center">✦</div>
        <h3 style="font-size:1.1rem;font-weight:800;margin-bottom:0.5rem;text-align:center">Configurer l'assistant IA</h3>
        <p style="font-size:0.82rem;color:var(--text2);text-align:center;margin-bottom:1.5rem;line-height:1.6">
          L'IA utilise <strong>Groq</strong> — c'est <strong>gratuit</strong> (14 400 requêtes/jour).<br/>
          Crée ta clé en 30 secondes sur <a href="https://console.groq.com/keys" target="_blank" style="color:var(--accent)">console.groq.com</a>.
        </p>

        <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:0.5rem">
          <label style="font-size:0.65rem;font-family:var(--font-m);color:var(--muted);letter-spacing:0.08em;text-transform:uppercase">Clé API Groq</label>
          <input type="password" id="groq-key-input" placeholder="gsk_..." style="font-family:var(--font-m);font-size:0.82rem" />
        </div>

        <p style="font-size:0.7rem;color:var(--muted);font-family:var(--font-m);margin-bottom:1.25rem">
          🔒 Stockée uniquement dans ton navigateur (localStorage). Jamais envoyée ailleurs.
        </p>

        <button class="btn btn-primary" style="width:100%;justify-content:center" onclick="submitGroqKey()">
          Activer l'assistant →
        </button>

        <div style="margin-top:1.25rem;border-top:1px solid var(--border);padding-top:1.25rem">
          <p style="font-size:0.72rem;color:var(--muted);font-family:var(--font-m);margin-bottom:0.75rem">Comment créer une clé Groq :</p>
          <ol style="font-size:0.78rem;color:var(--text2);line-height:2;padding-left:1.25rem">
            <li>Va sur <a href="https://console.groq.com/keys" target="_blank" style="color:var(--accent)">console.groq.com/keys</a></li>
            <li>Crée un compte gratuit (Google/GitHub)</li>
            <li>Clique <strong>"Create API Key"</strong></li>
            <li>Copie la clé et colle-la ci-dessus</li>
          </ol>
        </div>
      </div>
    </div>`;

  // Enter key on input
  setTimeout(() => {
    document.getElementById('groq-key-input')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') submitGroqKey();
    });
  }, 50);
}

function submitGroqKey() {
  const key = document.getElementById('groq-key-input')?.value.trim();
  if (!key || !key.startsWith('gsk_')) {
    const el = document.getElementById('groq-key-input');
    if (el) { el.style.borderColor = 'var(--red)'; setTimeout(() => el.style.borderColor = '', 1500); }
    return;
  }
  saveGroqKey(key);

  // Restore UI
  const suggsEl = document.getElementById('ai-suggestions');
  const inputBar = document.querySelector('.ai-input-bar');
  if (suggsEl) suggsEl.style.display = '';
  if (inputBar) inputBar.style.display = '';

  addAIMessage('assistant',
    `✅ Clé configurée ! Je suis prêt.\n\nJ'ai accès à ta liste complète (${state.items.length} articles · total ${fmt(grandTotal())}). Pose-moi n'importe quelle question sur tes achats.`
  );
}

function resetGroqKey() {
  clearGroqKey();
  aiMessages = [];
  aiInitialized = false;
  initAI();
}

// ── System prompt ─────────────────────────────────────────────────────────────
function buildSystemPrompt() {
  const itemsList = state.items.map(item => {
    const cat = getCatById(item.cat);
    let s = `- ${item.name}${item.subtitle ? ' (' + item.subtitle + ')' : ''} : ${fmt(item.price)} [${cat?.label || item.cat}]`;
    if (item.description) s += ` — ${item.description}`;
    if (item.comparisons?.length) {
      s += `\n  Comparaisons: ${item.comparisons.map(c => `${c.model} ${c.price ? fmt(c.price) : ''} score:${c.score}/10`).join(' | ')}`;
    }
    return s;
  }).join('\n');

  return `Tu es un assistant personnel spécialisé dans le conseil d'achat. Tu aides l'utilisateur à optimiser sa liste d'achats.

LISTE D'ACHATS (${state.items.length} articles, total: ${fmt(grandTotal())}):
${itemsList}

CATÉGORIES: ${state.categories.map(c => `${c.icon} ${c.label}`).join(', ')}

PROFIL UTILISATEUR: Louis, développeur/ingénieur à Nantes. Passionné de tennis (niveau débutant-intermédiaire, ~1 an de pratique, entraînement solo avec machine à balles), gaming médiéval, home cinema. Cherche le meilleur rapport qualité/prix.

INSTRUCTIONS:
- Réponds TOUJOURS en français
- Sois concis et direct, max 300 mots sauf si question complexe
- Utilise les données de la liste pour personnaliser tes réponses
- Pour les comparaisons, sois factuel avec des données précises
- Formate avec des sauts de ligne pour la lisibilité
- Utilise **gras** pour les points importants`;
}

// ── Messages ──────────────────────────────────────────────────────────────────
function addAIMessage(role, text) {
  aiMessages.push({ role, text });
  renderAIMessages();
}

function renderAIMessages() {
  const el = document.getElementById('ai-msgs');
  if (!el || !getGroqKey()) return;

  el.innerHTML = aiMessages.map(msg => `
    <div class="msg ${msg.role}">
      <div class="msg-bubble">${formatAIText(msg.text)}</div>
      <div class="msg-meta">${msg.role === 'user' ? 'Vous' : '✦ Llama 3.3 via Groq'}</div>
    </div>`).join('');

  if (aiTyping) {
    el.innerHTML += `
      <div class="msg assistant">
        <div class="typing-indicator">
          <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
        </div>
      </div>`;
  }

  el.scrollTop = el.scrollHeight;
}

function formatAIText(text) {
  return text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.*?)\*/g,'<em>$1</em>')
    .replace(/`(.*?)`/g,'<code style="font-family:var(--font-m);background:var(--surface3);padding:1px 5px;border-radius:3px;font-size:0.82em">$1</code>')
    .replace(/\n/g,'<br>');
}

// ── Send message ──────────────────────────────────────────────────────────────
async function sendAIMessage(overrideText) {
  if (aiTyping) return;

  const key = getGroqKey();
  if (!key) { renderKeySetup(); return; }

  const input = document.getElementById('ai-input');
  const text  = overrideText || input?.value.trim();
  if (!text) return;
  if (!overrideText && input) input.value = '';

  addAIMessage('user', text);
  aiTyping = true;
  renderAIMessages();

  // Build history (max 12 turns)
  const history = aiMessages
    .slice(0, -1)
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .slice(-11)
    .map(m => ({ role: m.role, content: m.text }));
  history.push({ role: 'user', content: text });

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: 1000,
        temperature: 0.7,
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          ...history,
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      if (response.status === 401) {
        clearGroqKey();
        throw new Error('Clé API invalide. Reconfigure-la.');
      }
      throw new Error(err.error?.message || `HTTP ${response.status}`);
    }

    const data  = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Pas de réponse.';
    aiTyping = false;
    addAIMessage('assistant', reply);

  } catch (err) {
    aiTyping = false;
    addAIMessage('assistant', `⚠️ **Erreur :** ${err.message}\n\n${err.message.includes('invalide') ? '<button class="ai-sugg" onclick="resetGroqKey()">🔑 Reconfigurer la clé</button>' : 'Vérifie ta connexion et réessaie.'}`);
  }
}

function handleAIKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAIMessage(); }
}

function useSuggestion(text) {
  const input = document.getElementById('ai-input');
  if (input) { input.value = text; input.focus(); }
}

function askAIAbout(itemId, question) {
  const item = getItemById(itemId);
  if (!item) return;
  closeDetail();
  navigate('ai');
  setTimeout(() => sendAIMessage(`Concernant "${item.name}" (${fmt(item.price)}) : ${question}`), 300);
}

window.sendAIMessage   = sendAIMessage;
window.handleAIKeydown = handleAIKeydown;
window.useSuggestion   = useSuggestion;
window.initAI          = initAI;
window.resetGroqKey    = resetGroqKey;
window.submitGroqKey   = submitGroqKey;
window.askAIAbout      = askAIAbout;
