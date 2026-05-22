// ── AI Chat ──────────────────────────────────────────────────────────────────

let aiMessages = [];
let aiInitialized = false;
let aiTyping = false;

const SUGGESTIONS = [
  'Compare la machine Pongbot Pace S Pro avec la Slinger Bag',
  'Quel projecteur est le meilleur rapport qualité/prix ?',
  'Y a-t-il des alternatives moins chères à la Libernovo Omni ?',
  'Quel est le budget total pour mon home cinema ?',
  'Quels articles dois-je prioriser ?',
  'Explique les différences entre les barres de son',
];

function initAI() {
  if (aiInitialized) return;
  aiInitialized = true;

  const msgsEl = document.getElementById('ai-msgs');
  if (!msgsEl) return;

  const welcome = buildSystemContext();
  addAIMessage('assistant', `Bonjour ! Je suis ton assistant pour ta liste d'achats.\n\nJ'ai accès à ta liste complète (${state.items.length} articles pour un total de ${fmt(grandTotal())}). Je peux t'aider à comparer des produits, analyser ton budget, ou répondre à toutes tes questions sur tes achats.\n\nQue veux-tu savoir ?`);
}

function buildSystemContext() {
  const itemsList = state.items.map(item => {
    const cat = getCatById(item.cat);
    let str = `- ${item.name} (${item.subtitle || ''}) : ${fmt(item.price)} [${cat?.label || item.cat}]`;
    if (item.description) str += `\n  Description: ${item.description}`;
    if (item.comparisons?.length) {
      str += `\n  Comparaisons disponibles: ${item.comparisons.map(c => `${c.model} (${fmt(c.price || 0)}, score:${c.score}/10)`).join(', ')}`;
    }
    return str;
  }).join('\n');

  return `Tu es un assistant personnel spécialisé dans le conseil d'achat. Tu aides l'utilisateur à optimiser sa liste d'achats.

LISTE D'ACHATS ACTUELLE (${state.items.length} articles, total: ${fmt(grandTotal())}):
${itemsList}

CATÉGORIES: ${state.categories.map(c => `${c.icon} ${c.label}`).join(', ')}

CONTEXTE UTILISATEUR: Louis est un jeune ingénieur basé à Nantes, passionné de tennis (niveau débutant-intermédiaire, 1 an de pratique, entraînement solo), gaming (jeux médiévaux), et home cinema. Il cherche le meilleur rapport qualité/prix.

INSTRUCTIONS:
- Réponds en français, de manière concise et directe
- Utilise les données de la liste pour personnaliser tes réponses
- Quand tu compares des produits, sois factuel et objectif
- Si tu ne sais pas quelque chose, dis-le clairement
- Formate tes réponses avec des sauts de ligne pour la lisibilité
- Pour les comparaisons, utilise des tableaux texte si pertinent
- Taille de réponse: courte à moyenne (max 300 mots sauf si demande complexe)`;
}

function addAIMessage(role, text) {
  aiMessages.push({ role, text });
  renderAIMessages();
}

function renderAIMessages() {
  const msgsEl = document.getElementById('ai-msgs');
  if (!msgsEl) return;

  msgsEl.innerHTML = aiMessages.map(msg => `
    <div class="msg ${msg.role}">
      <div class="msg-bubble">${formatAIText(msg.text)}</div>
      <div class="msg-meta">${msg.role === 'user' ? 'Vous' : '✦ Assistant'}</div>
    </div>`).join('');

  if (aiTyping) {
    msgsEl.innerHTML += `
      <div class="msg assistant" id="typing-bubble">
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>`;
  }

  msgsEl.scrollTop = msgsEl.scrollHeight;
}

function formatAIText(text) {
  return text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="font-family:var(--font-m);background:var(--surface3);padding:1px 5px;border-radius:3px;font-size:0.82em">$1</code>')
    .replace(/\n/g, '<br>');
}

async function sendAIMessage(overrideText) {
  if (aiTyping) return;

  const input = document.getElementById('ai-input');
  const text  = overrideText || input?.value.trim();
  if (!text) return;

  if (!overrideText && input) input.value = '';

  addAIMessage('user', text);

  aiTyping = true;
  renderAIMessages();

  try {
    const systemPrompt = buildSystemContext();

    const messages = aiMessages
      .slice(0, -1) // exclude latest user message (we'll add it)
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, content: m.text }));

    messages.push({ role: 'user', content: text });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages.slice(-12), // keep last 12 for context window
      })
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const reply = data.content?.[0]?.text || "Désolé, je n'ai pas pu générer une réponse.";

    aiTyping = false;
    addAIMessage('assistant', reply);

  } catch (err) {
    aiTyping = false;
    addAIMessage('assistant', `⚠️ Erreur lors de la communication avec l'IA.\n\nDétail: ${err.message}\n\nVérifie ta connexion ou réessaie dans un moment.`);
  }
}

function handleAIKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendAIMessage();
  }
}

function useSuggestion(text) {
  const input = document.getElementById('ai-input');
  if (input) { input.value = text; input.focus(); }
}

window.sendAIMessage   = sendAIMessage;
window.handleAIKeydown = handleAIKeydown;
window.useSuggestion   = useSuggestion;
window.initAI          = initAI;
