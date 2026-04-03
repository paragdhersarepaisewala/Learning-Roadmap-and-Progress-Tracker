/* ============================================================
   AI AGENT ROADMAP TRACKER — app.js
   Features: Progress tracking, Resource CRUD, Gemini AI Tutor,
             Start Date, Learning Status (Active/Paused)
   ============================================================ */

// ── Storage Keys ──────────────────────────────────────────
const SK = {
  STATE: 'arm_state',
  RESOURCES: 'arm_resources',
  SETTINGS: 'arm_settings',
  CHAT: 'arm_chat',
};

// ── App State ─────────────────────────────────────────────
let state = {
  completedDays: [],     // array of day IDs
  expandedWeeks: [],     // array of week IDs
};

let settings = {
  geminiApiKey: '',
  startDate: new Date().toISOString().slice(0, 10),
  learningStatus: 'active',  // 'active' | 'paused'
  pausedDate: null,           // ISO date string when paused
};

let resources = [];
let chatHistory = [];  // {role, content}

// ── Persistence ───────────────────────────────────────────
function loadAll() {
  try { const s = localStorage.getItem(SK.STATE); if (s) state = { ...state, ...JSON.parse(s) }; } catch {}
  try { const r = localStorage.getItem(SK.RESOURCES); if (r) resources = JSON.parse(r); else resources = JSON.parse(JSON.stringify(DEFAULT_RESOURCES)); } catch { resources = JSON.parse(JSON.stringify(DEFAULT_RESOURCES)); }
  try { const cfg = localStorage.getItem(SK.SETTINGS); if (cfg) settings = { ...settings, ...JSON.parse(cfg) }; } catch {}
  try { const ch = localStorage.getItem(SK.CHAT); if (ch) chatHistory = JSON.parse(ch); } catch {}
}
function saveState()     { localStorage.setItem(SK.STATE,     JSON.stringify(state)); }
function saveResources() { localStorage.setItem(SK.RESOURCES, JSON.stringify(resources)); }
function saveSettings()  { localStorage.setItem(SK.SETTINGS,  JSON.stringify(settings)); }
function saveChat()      { localStorage.setItem(SK.CHAT,      JSON.stringify(chatHistory)); }

// ── Date / Week Calculations ───────────────────────────────
function daysBetween(d1, d2) {
  return Math.floor((new Date(d2) - new Date(d1)) / 86400000);
}

function getCurrentWeekNum() {
  const start = settings.startDate;
  if (!start) return 1;
  let elapsed;
  if (settings.learningStatus === 'paused' && settings.pausedDate) {
    elapsed = Math.max(0, daysBetween(start, settings.pausedDate));
  } else {
    elapsed = Math.max(0, daysBetween(start, new Date().toISOString().slice(0, 10)));
  }
  return Math.min(12, Math.floor(elapsed / 7) + 1);
}

function getEndDate() {
  if (!settings.startDate) return '—';
  const d = new Date(settings.startDate);
  d.setDate(d.getDate() + 84);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── Progress Calculations ──────────────────────────────────
function getCompletedSet() { return new Set(state.completedDays); }

function getWeekProgress(week) {
  const done = getCompletedSet();
  const completed = week.days.filter(d => done.has(d.id)).length;
  return { completed, total: week.days.length, pct: Math.round((completed / week.days.length) * 100) };
}

function getMonthProgress(month) {
  const allDays = month.weeks.flatMap(w => w.days);
  const done = getCompletedSet();
  const completed = allDays.filter(d => done.has(d.id)).length;
  return { completed, total: allDays.length, pct: Math.round((completed / allDays.length) * 100) };
}

function getOverallProgress() {
  const allDays = ROADMAP_DATA.months.flatMap(m => m.weeks.flatMap(w => w.days));
  const done = getCompletedSet();
  const completed = allDays.filter(d => done.has(d.id)).length;
  return { completed, total: allDays.length, pct: Math.round((completed / allDays.length) * 100) };
}

function getStreak() {
  // Count most recently completed consecutive days (treated simply as total for now)
  return state.completedDays.length > 0 ? Math.min(state.completedDays.length, 30) : 0;
}

function getCurrentWeekData() {
  const wn = getCurrentWeekNum();
  for (const month of ROADMAP_DATA.months) {
    for (const week of month.weeks) {
      if (week.weekNum === wn) return week;
    }
  }
  return ROADMAP_DATA.months[0].weeks[0];
}

// ── Toggle Day ─────────────────────────────────────────────
function toggleDay(dayId) {
  const idx = state.completedDays.indexOf(dayId);
  if (idx === -1) {
    state.completedDays.push(dayId);
    showToast('✓ Day marked complete!', 'success');
  } else {
    state.completedDays.splice(idx, 1);
    showToast('Day unmarked', 'info');
  }
  saveState();
  refreshHeaderProgress();
  refreshDashboard();
}

// ── Header Progress ────────────────────────────────────────
function refreshHeaderProgress() {
  const { pct } = getOverallProgress();
  const fill = document.getElementById('headerChipFill');
  const pctEl = document.getElementById('headerProgressPct');
  if (fill) fill.style.width = pct + '%';
  if (pctEl) pctEl.textContent = pct + '%';

  const pill = document.getElementById('statusPill');
  if (pill) {
    if (settings.learningStatus === 'paused') {
      pill.textContent = '⏸ Paused';
      pill.className = 'status-pill paused-status';
    } else {
      pill.textContent = '● Active';
      pill.className = 'status-pill active-status';
    }
  }
}

// ── Dashboard ──────────────────────────────────────────────
function refreshDashboard() {
  const overall = getOverallProgress();
  const wn = getCurrentWeekNum();
  const currentWeek = getCurrentWeekData();
  const streak = getStreak();

  // Title / subtitle
  setText('statCurrentWeek', 'Week ' + wn);
  setText('statWeekTitle', currentWeek ? currentWeek.title : '—');
  setText('statCompletedDays', overall.completed);
  setText('statTotalDays', `of ${overall.total} days`);
  setText('statStreak', streak);
  setText('statStreakSub', streak > 0 ? '🔥 Keep it up!' : 'Start your streak!');
  setText('statStartDate', formatDate(settings.startDate).split(',')[0]);
  setText('statEndDate', 'Ends ' + getEndDate());
  setText('overallPct', overall.pct + '%');
  setText('overallDaysLabel', `${overall.completed} / ${overall.total} days`);
  setStyle('overallBar', 'width', overall.pct + '%');

  // Subtitle
  const pausedBanner = document.getElementById('pausedBanner');
  if (settings.learningStatus === 'paused') {
    setText('dashSubtitle', `Learning paused since ${formatDate(settings.pausedDate)}. Week ${wn} · Ends ${getEndDate()}`);
    if (pausedBanner) pausedBanner.classList.remove('hidden');
  } else {
    setText('dashSubtitle', `Week ${wn} of 12 · Started ${formatDate(settings.startDate)} · Ends ${getEndDate()}`);
    if (pausedBanner) pausedBanner.classList.add('hidden');
  }

  // Continue button
  const continueBtn = document.getElementById('continueBtn');
  if (continueBtn) {
    continueBtn.textContent = `Go to Week ${wn} →`;
    continueBtn.onclick = () => goToWeek(currentWeek.id);
  }
  setText('continueTitle', `Week ${wn}: ${currentWeek.title}`);
  setText('continueDesc', currentWeek.goal.slice(0, 80) + (currentWeek.goal.length > 80 ? '…' : ''));

  // Month progress cards
  renderMonthProgressCards();

  // Update week context in AI tutor
  updateWeekContext();
}

function renderMonthProgressCards() {
  const grid = document.getElementById('monthProgressGrid');
  if (!grid) return;
  grid.innerHTML = '';

  ROADMAP_DATA.months.forEach(month => {
    const { completed, total, pct } = getMonthProgress(month);
    const card = document.createElement('div');
    card.className = 'month-card';
    card.style.borderColor = `rgba(${month.colorRgb},0.2)`;
    card.innerHTML = `
      <div class="month-card-hdr">
        <div>
          <div class="month-card-title" style="color:${month.color}">${month.title}</div>
          <div class="month-card-sub">${month.subtitle}</div>
        </div>
        <div class="month-pct" style="color:${month.color}">${pct}%</div>
      </div>
      <div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${pct}%;background:${month.color}"></div>
        </div>
        <div class="pb-labels"><span>${completed} days done</span><span>${total - completed} remaining</span></div>
      </div>
      <div class="week-dots">
        ${month.weeks.map(w => {
          const wp = getWeekProgress(w);
          let cls = '';
          if (wp.pct === 100) cls = 'complete';
          else if (wp.pct > 0) cls = 'partial';
          return `<div class="week-dot ${cls}" title="Week ${w.weekNum}: ${wp.completed}/${wp.total}" onclick="goToWeek('${w.id}')">W${w.weekNum}</div>`;
        }).join('')}
      </div>
    `;
    grid.appendChild(card);
  });
}

// ── Progress Tab ───────────────────────────────────────────
function renderProgress() {
  const container = document.getElementById('progressContent');
  if (!container) return;
  const done = getCompletedSet();
  const currentWn = getCurrentWeekNum();

  let html = '';
  ROADMAP_DATA.months.forEach(month => {
    const { pct } = getMonthProgress(month);
    html += `
      <div class="month-section">
        <div class="month-section-hdr">
          <span class="month-badge" style="background:rgba(${month.colorRgb},0.15);color:${month.color};border:1px solid rgba(${month.colorRgb},0.25)">${month.title}</span>
          <span class="month-section-title">${month.subtitle}</span>
          <span class="month-section-pct">${pct}% complete</span>
        </div>
        <div class="weeks-grid">
    `;

    month.weeks.forEach(week => {
      const wp = getWeekProgress(week);
      const isExpanded = state.expandedWeeks.includes(week.id);
      const isCurrent = week.weekNum === currentWn;

      html += `
        <div class="week-card ${isExpanded ? 'expanded' : ''} ${week.capstone ? 'capstone' : ''}" id="wcard-${week.id}" ${isCurrent ? 'data-current="true"' : ''}>
          <div class="week-hdr" onclick="toggleWeek('${week.id}')">
            <div class="week-num" style="background:rgba(${month.colorRgb},0.15);color:${month.color}">W${week.weekNum}</div>
            <div class="week-info">
              <h3>${isCurrent ? '📍 ' : ''}${week.title}</h3>
              <p>${week.goal.slice(0, 75)}${week.goal.length > 75 ? '…' : ''}</p>
            </div>
            <div class="week-hdr-right">
              ${week.capstone ? '<span class="cap-badge">Capstone</span>' : ''}
              <div class="week-prog-mini">
                <div class="mini-bar"><div class="mini-fill" style="width:${wp.pct}%"></div></div>
                <span>${wp.completed}/${wp.total}</span>
              </div>
              <span class="expand-icon">▼</span>
            </div>
          </div>
          <div class="week-body ${isExpanded ? 'open' : ''}" id="wbody-${week.id}">
            <div class="week-goal">"${week.goal}"</div>
            <div class="days-list">
      `;

      week.days.forEach(day => {
        const isDone = done.has(day.id);
        html += `
          <div class="day-item ${isDone ? 'done' : ''}" id="ditem-${day.id}">
            <div class="day-check ${isDone ? 'checked' : ''}" onclick="toggleDay('${day.id}')"></div>
            <div class="day-content">
              <div class="day-num-label">Day ${day.day}</div>
              <div class="day-topic">${day.topic}</div>
              <div class="day-scope">${day.scope}</div>
            </div>
            <div class="day-actions">
              ${day.url ? `<a class="day-res-btn" href="${day.url}" target="_blank" rel="noopener">📄 Docs</a>` : ''}
              <button class="day-explain-btn" onclick="explainTopic('${escapeAttr(day.topic)}','${escapeAttr(day.scope)}')">✨ Ask AI</button>
            </div>
          </div>
        `;
      });

      html += `</div>`; // days-list
      html += `<div class="week-footer">
        <div class="lib-tags">${week.libraries.map(l => `<span class="lib-tag">${l}</span>`).join('')}</div>
        ${week.project ? `<span class="proj-badge">🏗️ ${week.project}</span>` : ''}
      </div>`;
      html += `</div></div></div>`; // week-body, week-card
    });

    html += `</div></div>`; // weeks-grid, month-section
  });

  container.innerHTML = html;
}

function toggleWeek(weekId) {
  const idx = state.expandedWeeks.indexOf(weekId);
  if (idx === -1) state.expandedWeeks.push(weekId);
  else state.expandedWeeks.splice(idx, 1);
  saveState();

  const card = document.getElementById('wcard-' + weekId);
  const body = document.getElementById('wbody-' + weekId);
  if (card) card.classList.toggle('expanded', state.expandedWeeks.includes(weekId));
  if (body) body.classList.toggle('open', state.expandedWeeks.includes(weekId));
  const icon = card?.querySelector('.expand-icon');
  if (icon) icon.style.transform = state.expandedWeeks.includes(weekId) ? 'rotate(180deg)' : '';
}

function goToWeek(weekId) {
  switchTab('progress');
  // Expand target week
  if (!state.expandedWeeks.includes(weekId)) {
    state.expandedWeeks.push(weekId);
    saveState();
    renderProgress();
  }
  setTimeout(() => {
    const el = document.getElementById('wcard-' + weekId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function jumpToCurrentWeek() {
  const cw = getCurrentWeekData();
  if (cw) goToWeek(cw.id);
}

// ── Resources ──────────────────────────────────────────────
let resFilter = 'all';
let resSearch = '';

function renderResources() {
  const grid = document.getElementById('resGrid');
  const countEl = document.getElementById('resCount');
  if (!grid) return;

  let filtered = resources.filter(r => {
    const matchFilter = resFilter === 'all' || r.type === resFilter;
    const q = resSearch.toLowerCase();
    const matchSearch = !q || r.title.toLowerCase().includes(q) || (r.notes||'').toLowerCase().includes(q) || (r.tags||[]).some(t => t.toLowerCase().includes(q));
    return matchFilter && matchSearch;
  });

  if (countEl) countEl.textContent = `${filtered.length} of ${resources.length} resources`;

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-state-icon">📚</div>
      <h3>No resources found</h3>
      <p>Try a different filter or add a new resource using the button above.</p>
    </div>`;
    return;
  }

  grid.innerHTML = filtered.map(r => `
    <div class="res-card" id="rcard-${r.id}">
      <div class="res-card-hdr">
        <div class="res-type-badge type-${r.type}">${typeLabel(r.type)}</div>
        <div style="display:flex;gap:4px;flex-shrink:0">
          ${r.url ? `<a href="${r.url}" target="_blank" rel="noopener" class="btn btn-ghost btn-icon" title="Open URL">🔗</a>` : ''}
          <button class="btn btn-ghost btn-icon" onclick="openEditResource('${r.id}')" title="Edit">✏️</button>
          <button class="btn btn-ghost btn-icon" onclick="showDeleteConfirm('${r.id}')" title="Delete">🗑️</button>
        </div>
      </div>
      <div class="res-title">${escapeHtml(r.title)}</div>
      ${r.notes ? `<div class="res-notes">${escapeHtml(r.notes)}</div>` : ''}
      ${r.week ? `<div class="res-week">📍 ${getWeekLabel(r.week)}</div>` : ''}
      ${(r.tags||[]).length ? `<div class="res-tags">${r.tags.map(t=>`<span class="tag-pill">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
      <div class="del-confirm" id="delconfirm-${r.id}">
        <p>Delete this resource?</p>
        <div style="display:flex;gap:8px">
          <button class="btn btn-danger btn-sm" onclick="deleteResource('${r.id}')">Delete</button>
          <button class="btn btn-secondary btn-sm" onclick="hideDeleteConfirm('${r.id}')">Cancel</button>
        </div>
      </div>
    </div>
  `).join('');
}

function typeLabel(t) {
  return { docs:'📄 Docs', course:'🎓 Course', tool:'🛠️ Tool', video:'🎬 Video', other:'📎 Other' }[t] || t;
}

function getWeekLabel(weekId) {
  for (const m of ROADMAP_DATA.months) {
    for (const w of m.weeks) {
      if (w.id === weekId) return `Week ${w.weekNum}: ${w.title}`;
    }
  }
  return weekId;
}

function showDeleteConfirm(id) { document.getElementById('delconfirm-' + id)?.classList.add('show'); }
function hideDeleteConfirm(id) { document.getElementById('delconfirm-' + id)?.classList.remove('show'); }

function openAddResource() {
  document.getElementById('resourceModalTitle').textContent = 'Add Resource';
  document.getElementById('resourceId').value = '';
  document.getElementById('resourceTitle').value = '';
  document.getElementById('resourceUrl').value = '';
  document.getElementById('resourceNotes').value = '';
  document.getElementById('resourceType').value = 'docs';
  document.getElementById('resourceWeek').value = '';
  document.getElementById('resourceTags').value = '';
  openModal('resourceModal');
}

function openEditResource(id) {
  const r = resources.find(x => x.id === id);
  if (!r) return;
  document.getElementById('resourceModalTitle').textContent = 'Edit Resource';
  document.getElementById('resourceId').value = r.id;
  document.getElementById('resourceTitle').value = r.title;
  document.getElementById('resourceUrl').value = r.url || '';
  document.getElementById('resourceNotes').value = r.notes || '';
  document.getElementById('resourceType').value = r.type || 'docs';
  document.getElementById('resourceWeek').value = r.week || '';
  document.getElementById('resourceTags').value = (r.tags || []).join(', ');
  openModal('resourceModal');
}

function saveResource() {
  const title = document.getElementById('resourceTitle').value.trim();
  if (!title) { showToast('Title is required', 'error'); return; }

  const id = document.getElementById('resourceId').value || 'r' + Date.now();
  const tags = document.getElementById('resourceTags').value.split(',').map(t => t.trim()).filter(Boolean);

  const resource = {
    id,
    title,
    url: document.getElementById('resourceUrl').value.trim(),
    notes: document.getElementById('resourceNotes').value.trim(),
    type: document.getElementById('resourceType').value,
    week: document.getElementById('resourceWeek').value,
    tags,
  };

  const idx = resources.findIndex(r => r.id === id);
  if (idx !== -1) {
    resources[idx] = resource;
    showToast('Resource updated!', 'success');
  } else {
    resources.push(resource);
    showToast('Resource added!', 'success');
  }

  saveResources();
  closeModal('resourceModal');
  renderResources();
}

function deleteResource(id) {
  resources = resources.filter(r => r.id !== id);
  saveResources();
  renderResources();
  showToast('Resource deleted', 'info');
}

function populateWeekSelect() {
  const sel = document.getElementById('resourceWeek');
  if (!sel) return;
  sel.innerHTML = '<option value="">— General —</option>';
  ROADMAP_DATA.months.forEach(m => {
    const og = document.createElement('optgroup');
    og.label = `${m.title} — ${m.subtitle}`;
    m.weeks.forEach(w => {
      const opt = document.createElement('option');
      opt.value = w.id;
      opt.textContent = `Week ${w.weekNum}: ${w.title}`;
      og.appendChild(opt);
    });
    sel.appendChild(og);
  });
}

// ── AI Tutor ───────────────────────────────────────────────
const SYSTEM_PROMPT = `You are an expert AI agent development tutor teaching a 3-month course called "Zero to Job-Ready: AI Agent Developer". 

The student is learning to build AI agents using:
- Python (basics only — not data science)
- Google Gemini API (free tier) as the primary LLM
- Ollama for local LLMs (Llama3, Gemma2, Phi3)
- Groq for free fast inference
- LangChain and LangGraph for agent orchestration
- Google ADK (Agent Development Kit) for multi-agent systems
- ChromaDB for vector storage and RAG
- FastAPI for wrapping agents as APIs
- Docker and GCP Cloud Run for deployment

Your teaching philosophy:
- No ML theory, no statistics, no NumPy/Pandas unless unavoidable
- Focus on practical, working code
- Explain concepts with concrete examples
- Keep explanations concise and actionable
- When showing code, use Python with Gemini/LangGraph/LangChain
- Always relate concepts back to building AI agents

Format your responses with clear structure. Use code blocks for Python code. Be encouraging and practical.`;

function updateAiStatus() {
  const dot = document.getElementById('aiStatusDot');
  const txt = document.getElementById('aiStatusText');
  if (!dot || !txt) return;
  if (settings.geminiApiKey) {
    dot.classList.add('online');
    txt.textContent = 'Ready';
  } else {
    dot.classList.remove('online');
    txt.textContent = 'No API key';
  }
}

function updateWeekContext() {
  const el = document.getElementById('weekContextText');
  if (!el) return;
  const wn = getCurrentWeekNum();
  const week = getCurrentWeekData();
  if (week) {
    el.textContent = `Week ${wn}: ${week.title}. Goal: ${week.goal.slice(0, 60)}…`;
  }
}

async function sendMessage(userText) {
  userText = userText.trim();
  if (!userText) return;
  if (!settings.geminiApiKey) {
    showToast('Add your Gemini API key first', 'error');
    switchTab('aiTutor');
    return;
  }

  // Hide welcome
  const welcome = document.getElementById('chatWelcome');
  if (welcome) welcome.remove();

  // Add user message to UI
  appendMessage('user', userText);
  chatHistory.push({ role: 'user', content: userText });

  // Clear input
  const input = document.getElementById('chatInput');
  if (input) { input.value = ''; input.style.height = 'auto'; }

  // Disable send
  const sendBtn = document.getElementById('sendBtn');
  if (sendBtn) sendBtn.disabled = true;

  // Show typing
  const typingEl = appendTyping();

  try {
    const reply = await callGemini(chatHistory);
    typingEl.remove();
    appendMessage('assistant', reply);
    chatHistory.push({ role: 'model', content: reply });
    saveChat();
  } catch (err) {
    typingEl.remove();
    appendMessage('assistant', `❌ Error: ${err.message}\n\nCheck your API key in settings, or the [Gemini API status](https://status.cloud.google.com/).`);
    showToast('API error: ' + err.message, 'error');
  } finally {
    if (sendBtn) sendBtn.disabled = false;
    if (input) input.focus();
  }
}

async function callGemini(history) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${settings.geminiApiKey}`;

  // Convert history: 'model' role for assistant
  const contents = history.map(m => ({
    role: m.role === 'assistant' ? 'model' : m.role,
    parts: [{ text: m.content }],
  }));

  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents,
    generationConfig: { temperature: 0.7, maxOutputTokens: 1500 },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '(No response)';
}

function appendMessage(role, text) {
  const msgsEl = document.getElementById('chatMessages');
  if (!msgsEl) return;

  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.innerHTML = `
    <div class="msg-av">${role === 'user' ? '👤' : '✨'}</div>
    <div class="msg-bubble">${role === 'assistant' ? markdownToHtml(text) : escapeHtml(text)}</div>
  `;
  msgsEl.appendChild(div);
  msgsEl.scrollTop = msgsEl.scrollHeight;
  return div;
}

function appendTyping() {
  const msgsEl = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'message assistant';
  div.innerHTML = `<div class="msg-av">✨</div><div class="typing-ind"><div class="t-dot"></div><div class="t-dot"></div><div class="t-dot"></div></div>`;
  msgsEl.appendChild(div);
  msgsEl.scrollTop = msgsEl.scrollHeight;
  return div;
}

function explainTopic(topic, scope) {
  const prompt = `Explain "${topic}" for a beginner learning to build AI agents. Context: ${scope}. Give a clear explanation with a practical Python example if relevant. Keep it focused and actionable.`;
  switchTab('aiTutor');
  setTimeout(() => {
    const input = document.getElementById('chatInput');
    if (input) input.value = prompt;
    sendMessage(prompt);
  }, 200);
}

// Simple markdown → HTML converter
function markdownToHtml(text) {
  return text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => `<pre><code>${code}</code></pre>`)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\n\n+/g, '</p><p>')
    .replace(/^(?!<[hup])(.+)$/gm, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/^/, '<p>').replace(/$/, '</p>')
    .replace(/<p><\/p>/g, '').replace(/<p>(<[hup])/g, '$1').replace(/(<\/[hup][^>]*>)<\/p>/g, '$1');
}

function clearChat() {
  chatHistory = [];
  saveChat();
  const msgs = document.getElementById('chatMessages');
  if (msgs) msgs.innerHTML = `
    <div class="chat-welcome" id="chatWelcome">
      <div class="wi">🤖</div>
      <h3>Your AI Learning Tutor</h3>
      <p>Ask me to explain any topic from your roadmap. Click <strong>"Ask AI"</strong> on any day item, or type your question below.</p>
      <p style="font-size:12px;color:var(--text-3);margin-top:8px">Add your Gemini API key in the panel →</p>
    </div>`;
  showToast('Chat cleared', 'info');
}

function restoreChat() {
  if (chatHistory.length === 0) return;
  const welcome = document.getElementById('chatWelcome');
  if (welcome) welcome.remove();
  chatHistory.forEach(m => appendMessage(m.role === 'model' ? 'assistant' : m.role, m.content));
}

// ── Settings ───────────────────────────────────────────────
function openSettings() {
  const sd = document.getElementById('settingsStartDate');
  const sk = document.getElementById('settingsApiKey');
  if (sd) sd.value = settings.startDate || '';
  if (sk) sk.value = settings.geminiApiKey || '';

  // Status buttons
  updateStatusButtons(settings.learningStatus);
  openModal('settingsModal');
}

function updateStatusButtons(status) {
  const activeBtn = document.getElementById('statusActive');
  const pausedBtn = document.getElementById('statusPaused');
  const desc = document.getElementById('statusDescription');
  const pausedGroup = document.getElementById('pausedOnGroup');
  const pausedDateInput = document.getElementById('settingsPausedDate');

  if (activeBtn) activeBtn.classList.toggle('active', status === 'active');
  if (pausedBtn) pausedBtn.classList.toggle('active', status === 'paused');

  if (status === 'paused') {
    if (desc) desc.textContent = 'Learning is paused. Weeks won\'t advance. Click "Resume Learning" anytime.';
    if (pausedGroup) pausedGroup.style.display = 'block';
    if (pausedDateInput) pausedDateInput.value = settings.pausedDate || new Date().toISOString().slice(0, 10);
  } else {
    if (desc) desc.textContent = 'You\'re actively learning. Current week advances automatically from your start date.';
    if (pausedGroup) pausedGroup.style.display = 'none';
  }
}

function saveSettingsFromModal() {
  const sd = document.getElementById('settingsStartDate').value;
  const sk = document.getElementById('settingsApiKey').value.trim();

  if (sd) settings.startDate = sd;
  settings.geminiApiKey = sk;

  // Status from active button
  const activeBtn = document.getElementById('statusActive');
  const newStatus = activeBtn?.classList.contains('active') ? 'active' : 'paused';

  if (newStatus === 'paused' && settings.learningStatus !== 'paused') {
    settings.pausedDate = new Date().toISOString().slice(0, 10);
  } else if (newStatus === 'active') {
    settings.pausedDate = null;
  }
  settings.learningStatus = newStatus;

  saveSettings();
  closeModal('settingsModal');
  updateAiStatus();
  refreshHeaderProgress();
  refreshDashboard();

  // Sync API key in AI tab
  const aiKeyInput = document.getElementById('apiKeyInput');
  if (aiKeyInput) aiKeyInput.value = sk;

  showToast('Settings saved!', 'success');
}

function resumeLearning() {
  settings.learningStatus = 'active';
  settings.pausedDate = null;
  saveSettings();
  refreshHeaderProgress();
  refreshDashboard();
  showToast('▶ Learning resumed!', 'success');
}

// ── Export / Import ────────────────────────────────────────
function exportProgress() {
  const data = { state, settings: { ...settings, geminiApiKey: '(not exported for security)' }, resources, exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ai-roadmap-progress-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Progress exported!', 'success');
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.state) { state = { ...state, ...data.state }; saveState(); }
      if (data.resources) { resources = data.resources; saveResources(); }
      if (data.settings) {
        const { geminiApiKey, ...rest } = data.settings;
        settings = { ...settings, ...rest };
        saveSettings();
      }
      refreshAll();
      showToast('Progress imported!', 'success');
    } catch {
      showToast('Invalid file format', 'error');
    }
  };
  reader.readAsText(file);
}

function resetProgress() {
  if (!confirm('Reset all progress? This cannot be undone.')) return;
  state.completedDays = [];
  state.expandedWeeks = [];
  saveState();
  refreshAll();
  closeModal('settingsModal');
  showToast('Progress reset', 'info');
}

// ── Tab Navigation ─────────────────────────────────────────
function switchTab(tabId) {
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + tabId)?.classList.add('active');
  document.getElementById('panel-' + tabId)?.classList.add('active');

  if (tabId === 'progress') renderProgress();
  if (tabId === 'resources') renderResources();
  if (tabId === 'dashboard') refreshDashboard();
}

// ── Modal Helpers ──────────────────────────────────────────
function openModal(id) { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

// ── Toast ──────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${escapeHtml(msg)}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(20px)'; toast.style.transition = 'all .3s'; setTimeout(() => toast.remove(), 300); }, 2800);
}

// ── Utility ────────────────────────────────────────────────
function escapeHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function escapeAttr(s) { return String(s).replace(/'/g,"\\'").replace(/\n/g,' '); }
function setText(id, text) { const el = document.getElementById(id); if (el) el.textContent = text; }
function setStyle(id, prop, val) { const el = document.getElementById(id); if (el) el.style[prop] = val; }

// ── Event Listeners ────────────────────────────────────────
function bindEvents() {
  // Tab navigation
  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Settings
  document.getElementById('settingsBtn')?.addEventListener('click', openSettings);
  document.getElementById('saveSettingsBtn')?.addEventListener('click', saveSettingsFromModal);
  document.getElementById('resumeBtn')?.addEventListener('click', resumeLearning);

  // Status option buttons in settings
  document.querySelectorAll('.status-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.status-option-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateStatusButtons(btn.dataset.status);
    });
  });

  // Modal close buttons
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(overlay.id); });
  });

  // Resources
  document.getElementById('addResBtn')?.addEventListener('click', openAddResource);
  document.getElementById('saveResourceBtn')?.addEventListener('click', saveResource);
  document.getElementById('resSearch')?.addEventListener('input', e => { resSearch = e.target.value; renderResources(); });
  document.querySelectorAll('#resFilters .filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#resFilters .filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      resFilter = chip.dataset.filter;
      renderResources();
    });
  });

  // Progress controls
  document.getElementById('expandAllBtn')?.addEventListener('click', () => {
    ROADMAP_DATA.months.forEach(m => m.weeks.forEach(w => { if (!state.expandedWeeks.includes(w.id)) state.expandedWeeks.push(w.id); }));
    saveState(); renderProgress();
  });
  document.getElementById('collapseAllBtn')?.addEventListener('click', () => {
    state.expandedWeeks = []; saveState(); renderProgress();
  });
  document.getElementById('jumpCurrentBtn')?.addEventListener('click', jumpToCurrentWeek);
  document.getElementById('continueBtn')?.addEventListener('click', () => { const cw = getCurrentWeekData(); if (cw) goToWeek(cw.id); });

  // AI Tutor
  document.getElementById('sendBtn')?.addEventListener('click', () => sendMessage(document.getElementById('chatInput').value));
  document.getElementById('chatInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e.target.value); }
    // Auto-resize
    setTimeout(() => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }, 0);
  });
  document.getElementById('clearChatBtn')?.addEventListener('click', clearChat);

  // Quick prompts
  document.querySelectorAll('.qp-btn').forEach(btn => {
    btn.addEventListener('click', () => sendMessage(btn.dataset.prompt));
  });

  // AI Tutor API key
  document.getElementById('apiKeySave')?.addEventListener('click', () => {
    const val = document.getElementById('apiKeyInput').value.trim();
    settings.geminiApiKey = val;
    saveSettings();
    // Sync to settings modal
    const settingsKeyEl = document.getElementById('settingsApiKey');
    if (settingsKeyEl) settingsKeyEl.value = val;
    updateAiStatus();
    showToast(val ? '🔑 API key saved!' : 'API key cleared', val ? 'success' : 'info');
  });
  document.getElementById('apiKeyToggle')?.addEventListener('click', () => {
    const input = document.getElementById('apiKeyInput');
    input.type = input.type === 'password' ? 'text' : 'password';
  });
  document.getElementById('settingsApiKeyToggle')?.addEventListener('click', () => {
    const input = document.getElementById('settingsApiKey');
    input.type = input.type === 'password' ? 'text' : 'password';
  });

  // Data management
  document.getElementById('exportDataBtn')?.addEventListener('click', exportProgress);
  document.getElementById('importDataBtn')?.addEventListener('click', () => document.getElementById('importFileInput').click());
  document.getElementById('importFileInput')?.addEventListener('change', e => { if (e.target.files[0]) importProgress(e.target.files[0]); e.target.value = ''; });
  document.getElementById('resetProgressBtn')?.addEventListener('click', resetProgress);
}

// ── Refresh All ────────────────────────────────────────────
function refreshAll() {
  refreshHeaderProgress();
  refreshDashboard();
  renderResources();
  updateAiStatus();
  updateWeekContext();
}

// ── Init ───────────────────────────────────────────────────
function init() {
  loadAll();
  populateWeekSelect();
  bindEvents();
  refreshAll();

  // Pre-fill API key in AI tutor panel
  const aiKeyInput = document.getElementById('apiKeyInput');
  if (aiKeyInput && settings.geminiApiKey) aiKeyInput.value = settings.geminiApiKey;

  // Restore chat history
  restoreChat();

  // Auto-expand current week on first visit
  const cw = getCurrentWeekData();
  if (cw && state.expandedWeeks.length === 0) {
    state.expandedWeeks = [cw.id];
    saveState();
  }
}

// Extra CSS injected at runtime (status pill & paused banner)
const runtimeCSS = `
.status-pill{padding:5px 12px;border-radius:99px;font-size:12px;font-weight:600;letter-spacing:.3px;flex-shrink:0}
.active-status{background:rgba(16,185,129,.15);color:#34d399;border:1px solid rgba(16,185,129,.25)}
.paused-status{background:rgba(245,158,11,.15);color:#fbbf24;border:1px solid rgba(245,158,11,.25)}
.paused-banner{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 20px;border-radius:var(--radius-lg);background:rgba(245,158,11,.07);border:1px solid rgba(245,158,11,.2);margin-bottom:20px;font-size:14px;font-weight:500;color:#fbbf24;flex-wrap:wrap}
.status-option-btn{padding:8px 16px;border-radius:var(--radius);font-size:13px;font-weight:600;background:var(--surface);border:1px solid var(--border);color:var(--text-2);cursor:pointer;transition:all .15s}
.status-option-btn:hover{border-color:var(--border-hover);color:var(--text-1)}
.status-option-btn.active{background:rgba(139,92,246,.15);border-color:rgba(139,92,246,.35);color:var(--purple)}
.settings-section{margin-bottom:22px}
.settings-section-title{font-size:13px;font-weight:700;margin-bottom:11px;padding-bottom:7px;border-bottom:1px solid var(--border);color:var(--text-2);text-transform:uppercase;letter-spacing:.4px}
`;
const styleEl = document.createElement('style');
styleEl.textContent = runtimeCSS;
document.head.appendChild(styleEl);

document.addEventListener('DOMContentLoaded', init);
