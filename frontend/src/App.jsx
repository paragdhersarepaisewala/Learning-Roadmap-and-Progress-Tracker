import React, { useState, useEffect, useCallback } from 'react';
import { ROADMAP_DATA, DEFAULT_RESOURCES } from './data';
import {
  BookOpen, BrainCircuit, Download, CheckCircle, Circle,
  Plus, Trash2, Search, Loader2, Settings, Link,
  FileText, Film, Headphones, Globe, ExternalLink, ShieldCheck
} from 'lucide-react';
import SettingsModal, { GEMINI_MODELS } from './components/SettingsModal';
import ChatPage from './components/ChatPage';
import AdminPanel from './components/AdminPanel';
import { generateContent } from './lib/gemini';
import { fetchResources, deleteResource as apiDeleteResource, isAdmin } from './lib/api';

// ─── Resource type config ───
const RESOURCE_TYPES = [
  { value: 'link',   label: 'Link',    icon: Link },
  { value: 'docs',   label: 'Docs',    icon: FileText },
  { value: 'video',  label: 'Video',   icon: Film },
  { value: 'course', label: 'Course',  icon: BookOpen },
  { value: 'audio',  label: 'Podcast', icon: Headphones },
  { value: 'tool',   label: 'Tool',    icon: Globe },
];

const resourceIcon = (type) => {
  const cfg = RESOURCE_TYPES.find(r => r.value === type);
  const Icon = cfg?.icon || Link;
  return <Icon className="w-3.5 h-3.5" />;
};

const resourceColor = (type) => {
  const map = {
    link:   'text-blue-400 bg-blue-500/10 border-blue-500/20',
    docs:   'text-purple-400 bg-purple-500/10 border-purple-500/20',
    video:  'text-red-400 bg-red-500/10 border-red-500/20',
    course: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    audio:  'text-green-400 bg-green-500/10 border-green-500/20',
    tool:   'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  };
  return map[type] || map.link;
};

// ─── Main App ───
export default function App() {
  const [activeView, setActiveView]   = useState('roadmap'); // 'roadmap' | 'chat'
  const [activeMonth, setActiveMonth] = useState(1);
  const [activeWeek, setActiveWeek]   = useState(ROADMAP_DATA.months[0].weeks[0].id);
  const [showSettings, setShowSettings] = useState(false);
  const [showAdmin, setShowAdmin]     = useState(false);
  const [adminMode, setAdminMode]     = useState(() => isAdmin());

  // Persisted Settings
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('ag_settings');
    if (saved) return JSON.parse(saved);
    return {
      provider: 'ai_studio',
      apiKey: localStorage.getItem('ag_api_key') || '',
      model: localStorage.getItem('ag_model') || 'gemini-3.1-pro-preview',
      projectId: '',
      region: 'us-central1'
    };
  });

  const [completedDays, setCompletedDays] = useState(() =>
    JSON.parse(localStorage.getItem('ag_completed') || '[]')
  );

  // Resources come from the backend (cloud database)
  const [resources, setResources] = useState(DEFAULT_RESOURCES);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [resourcesError, setResourcesError] = useState('');

  const [isFinding, setIsFinding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRes, setNewRes] = useState({ title: '', url: '', type: 'link', notes: '' });

  // Persist effects
  useEffect(() => { localStorage.setItem('ag_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('ag_completed', JSON.stringify(completedDays)); }, [completedDays]);

  // Load resources from the cloud
  const loadResources = useCallback(async () => {
    setResourcesLoading(true);
    setResourcesError('');
    try {
      const data = await fetchResources();
      // Only replace if we got a valid array back
      if (Array.isArray(data)) {
        // Merge cloud custom resources with defaults
        const dbIds = new Set(data.map(r => r.id));
        const filteredDefaults = DEFAULT_RESOURCES.filter(r => !dbIds.has(r.id));
        setResources([...data, ...filteredDefaults]);
      }
    } catch (err) {
      // Network not available (dev mode without backend, or offline)
      console.warn('Resources API unavailable, using defaults:', err.message);
      setResourcesError('');  // Don't show error — just use defaults silently
    } finally {
      setResourcesLoading(false);
    }
  }, []);

  useEffect(() => { loadResources(); }, [loadResources]);

  const currentMonthData = ROADMAP_DATA.months.find(m => m.id === activeMonth);
  const currentWeekData  = currentMonthData?.weeks.find(w => w.id === activeWeek) || currentMonthData?.weeks[0];

  const toggleDay = (id) =>
    setCompletedDays(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const removeResource = async (id) => {
    if (!adminMode) return;
    const { getAdminSecret } = await import('./lib/api');
    try {
      await apiDeleteResource(id, getAdminSecret());
      setResources(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert('Could not delete resource: ' + err.message);
    }
  };

  const findWithAI = async () => {
    if (!settings.apiKey) return alert('Add your API key (or access token) in Settings first!');
    setIsFinding(true);
    try {
      const textResponse = await generateContent(settings, [{
        parts: [{ text: `Find 4 high-quality FREE learning resources for the topic: "${currentWeekData.title}" in the context of: "${currentWeekData.goal}".
Return ONLY a raw JSON array (no backticks, no markdown). Each object must have: "title" (string), "url" (string, real working URL), "type" (one of: link, docs, video, course, audio, tool), "notes" (max 12 words). Example: [{"title":"...","url":"...","type":"docs","notes":"..."}]` }]
      }]);
      let raw = textResponse.replace(/```json|```/gi, '').trim();
      const parsed = JSON.parse(raw);
      // In admin mode: save to DB. Otherwise: show locally only
      if (adminMode) {
        const { getAdminSecret, createResource } = await import('./lib/api');
        const saved = await Promise.all(parsed.map(r =>
          createResource({ ...r, week: currentWeekData.id, aiSuggested: true }, getAdminSecret())
        ));
        setResources(prev => [...saved, ...prev]);
      } else {
        setResources(prev => [...parsed.map(r => ({ ...r, id: Date.now() + Math.random().toString(36), week: currentWeekData.id, aiSuggested: true })), ...prev]);
      }
    } catch (err) {
      alert('AI resource search failed:\n\n' + err.message);
    } finally {
      setIsFinding(false);
    }
  };

  // Compute progress
  const totalDays = ROADMAP_DATA.months.flatMap(m => m.weeks.flatMap(w => w.days)).length;
  const completedCount = completedDays.length;
  const pct = Math.round((completedCount / totalDays) * 100);

  // Per-week resources — support both `week` (cloud) and `weekId` (legacy) fields
  const weekResources = resources.filter(r => {
    const wId = r.week || r.weekId;
    return !wId || wId === currentWeekData?.id || wId === 'all';
  });

  // Chat view
  if (activeView === 'chat') {
    return (
      <>
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings}
          onSave={(newSettings) => { setSettings(newSettings); setShowSettings(false); }}
        />
        <ChatPage
          settings={settings}
          weekData={currentWeekData}
          monthData={currentMonthData}
          onBack={() => setActiveView('roadmap')}
        />
      </>
    );
  }

  // Roadmap view
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-purple-500/30 selection:text-purple-200">
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={(newSettings) => { setSettings(newSettings); setShowSettings(false); }}
      />
      <AdminPanel
        isOpen={showAdmin}
        onClose={() => { setShowAdmin(false); setAdminMode(isAdmin()); }}
        onResourcesChanged={loadResources}
      />

      {/* ── Header ── */}
      <header className="border-b border-white/8 bg-slate-900/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg shadow-purple-500/20">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 leading-tight">
                AgenticDev
              </h1>
              <p className="text-[10px] text-slate-500 font-medium">Zero → Job-Ready</p>
            </div>
          </div>

          {/* Progress pill */}
          <div className="hidden sm:flex items-center gap-3 flex-1 max-w-xs mx-auto">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-mono text-slate-400 flex-shrink-0">{completedCount}/{totalDays}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Admin toggle */}
            <button
              onClick={() => setShowAdmin(true)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                adminMode
                  ? 'bg-purple-500/15 border-purple-500/25 text-purple-400 hover:bg-purple-500/20'
                  : 'bg-white/5 border-white/8 text-slate-500 hover:text-slate-300 hover:bg-white/10'
              }`}
              title="Admin Panel"
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">{adminMode ? 'Admin' : ''}</span>
            </button>
            <button
            onClick={() => setShowSettings(true)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
              settings.apiKey
                ? 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
            }`}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">{settings.apiKey ? 'API ✓' : 'Set API Key'}</span>
          </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10">

        {/* ── Left: Roadmap ── */}
        <div className="space-y-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
              Your Python{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                Learning Journey
              </span>
            </h2>
            <p className="text-base text-slate-400 max-w-2xl leading-relaxed">
              Follow the roadmap week by week. Use the AI Tutor to ask questions and get simple, step-by-step explanations as you go.
            </p>
          </div>

          {/* Month tabs */}
          <div className="flex flex-wrap gap-2 p-1 bg-white/5 rounded-2xl border border-white/5 w-fit">
            {ROADMAP_DATA.months.map(month => (
              <button
                key={month.id}
                onClick={() => { setActiveMonth(month.id); setActiveWeek(month.weeks[0].id); }}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeMonth === month.id
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {month.title}
              </button>
            ))}
          </div>

          {/* Week selector + detail */}
          <div className="space-y-5">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs border border-purple-500/30">
                {currentMonthData.id}
              </span>
              {currentMonthData.subtitle}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Week list */}
              <div className="md:col-span-1 space-y-1.5 relative">
                <div className="absolute left-4 top-4 bottom-4 w-px bg-white/8" />
                {currentMonthData.weeks.map(week => {
                  const done = week.days.filter(d => completedDays.includes(d.id)).length;
                  const total = week.days.length;
                  const allDone = done === total;
                  return (
                    <button
                      key={week.id}
                      onClick={() => setActiveWeek(week.id)}
                      className={`w-full text-left pl-10 py-3 pr-3 rounded-xl relative transition-all ${
                        activeWeek === week.id
                          ? 'bg-purple-500/10 text-white font-medium border border-purple-500/20'
                          : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div
                        className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-slate-900 transition-colors ${
                          activeWeek === week.id ? 'bg-purple-400' : allDone ? 'bg-green-400' : 'bg-slate-600'
                        }`}
                        style={{ left: '17px' }}
                      />
                      <div className={`text-[10px] uppercase tracking-wider mb-0.5 font-bold ${allDone ? 'text-green-400' : 'text-purple-400'}`}>
                        Week {week.weekNum} {allDone && '✓'}
                      </div>
                      <div className="text-xs truncate leading-tight">{week.title}</div>
                      {done > 0 && !allDone && (
                        <div className="mt-1.5 h-0.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-500/60 rounded-full transition-all"
                            style={{ width: `${(done / total) * 100}%` }}
                          />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Week detail */}
              <div className="md:col-span-3 bg-white/[0.02] border border-white/8 rounded-3xl overflow-hidden">
                {/* Week header */}
                <div className="p-6 sm:p-7 border-b border-white/5">
                  <div className="text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 uppercase tracking-widest mb-1.5">
                    {currentWeekData.title}
                  </div>
                  <p className="text-slate-300 leading-relaxed text-sm sm:text-base">{currentWeekData.goal}</p>

                  {/* Ask Tutor CTA */}
                  <button
                    onClick={() => {
                    if (!settings.apiKey) { setShowSettings(true); return; }
                    setActiveView('chat');
                  }}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 hover:border-green-400/50 rounded-xl text-sm font-semibold text-green-300 hover:text-white transition-all group"
                >
                  <span className="text-base">🐍</span>
                  Ask Python Tutor
                  {!settings.apiKey && <span className="text-[10px] text-amber-400">(set API key)</span>}
                </button>
                </div>

                {/* Days */}
                <div className="divide-y divide-white/5">
                  {currentWeekData.days.map(day => {
                    const isDone = completedDays.includes(day.id);
                    return (
                      <div key={day.id} className={`flex gap-3 sm:gap-4 p-4 sm:p-5 transition-colors group ${isDone ? 'bg-green-900/5' : 'hover:bg-white/[0.02]'}`}>
                        {/* Checkbox */}
                        <button onClick={() => toggleDay(day.id)} className="flex-shrink-0 mt-0.5">
                          {isDone
                            ? <CheckCircle className="w-5 h-5 text-green-400" />
                            : <Circle className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                          }
                        </button>

                        {/* Day badge */}
                        <div className={`flex-shrink-0 w-11 h-11 rounded-xl border flex flex-col items-center justify-center text-center transition-colors ${
                          isDone ? 'bg-green-900/20 border-green-500/20' : 'bg-slate-800 border-white/5'
                        }`}>
                          <span className={`text-[9px] font-bold uppercase ${isDone ? 'text-green-500/70' : 'text-slate-500'}`}>Day</span>
                          <span className={`text-base font-bold leading-none ${isDone ? 'text-green-400' : 'text-white'}`}>{day.day}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h5 className={`font-semibold text-sm sm:text-base mb-0.5 transition-colors ${isDone ? 'line-through text-slate-500' : 'text-white'}`}>
                            {day.topic}
                          </h5>
                          <p className={`text-xs sm:text-sm leading-relaxed mb-2 transition-colors ${isDone ? 'text-slate-600' : 'text-slate-400'}`}>
                            {day.scope}
                          </p>
                          {day.url && (
                            <a href={day.url} target="_blank" rel="noreferrer"
                              className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors ${isDone ? 'text-slate-600' : 'text-purple-400 hover:text-purple-300'}`}>
                              <BookOpen className="w-3.5 h-3.5" />
                              {day.resource || 'View Resource'}
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Resources Sidebar ── */}
        <div className="space-y-6">
          {/* Python Tutor card */}
          <div className="bg-gradient-to-b from-green-900/20 to-slate-900/0 border border-green-500/20 rounded-3xl p-5 relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-28 h-28 bg-green-500/10 rounded-full blur-2xl" />
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🐍</span>
              <h3 className="text-base font-bold text-white">Python Tutor</h3>
            </div>
            <p className="text-xs text-green-200/60 mb-4 leading-relaxed">
              Stuck on something? Ask your Python tutor. Get simple, step-by-step explanations with real code examples — perfect for beginners.
            </p>
            <button
              onClick={() => {
                if (!settings.apiKey) { setShowSettings(true); return; }
                setActiveView('chat');
              }}
              className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-3 font-semibold text-white text-sm shadow-lg shadow-green-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {settings.apiKey ? 'Open Python Tutor' : 'Set API Key to Chat'}
                <BrainCircuit className="h-4 w-4 group-hover:rotate-12 transition-transform" />
              </span>
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700" />
            </button>
          </div>

          {/* Resources */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-slate-400" />
                Resources
                {weekResources.length > 0 && (
                  <span className="text-xs font-mono text-slate-500">({weekResources.length})</span>
                )}
              </h3>
              <div className="flex items-center gap-2">
                {adminMode && (
                  <>
                    <button
                      onClick={findWithAI}
                      disabled={isFinding}
                      className="text-xs flex items-center gap-1 px-2.5 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg transition-colors disabled:opacity-50 font-medium"
                      title={settings.apiKey ? 'Find resources with AI' : 'Set API key first'}
                    >
                      {isFinding ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                      AI Find
                    </button>
                    <button
                      onClick={() => setShowAdmin(true)}
                      className="text-xs flex items-center gap-1 px-2.5 py-1.5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/8 rounded-lg transition-colors font-medium"
                    >
                      <Plus className="w-3 h-3" />
                      Add
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Add resource — handled via Admin Panel (click the Add button above) */}

            {/* Resource list */}
            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-0.5 custom-scrollbar">
              {weekResources.length > 0 ? weekResources.map(res => (
                <div key={res.id} className="group relative p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.045] border border-white/5 hover:border-white/10 transition-all">
                  {adminMode && (
                    <button
                      onClick={() => removeResource(res.id)}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-900 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}

                  <div className="flex items-start gap-2.5 pr-5">
                    <span className={`flex-shrink-0 p-1.5 rounded-lg border mt-0.5 ${resourceColor(res.type)}`}>
                      {resourceIcon(res.type)}
                    </span>
                    <div className="min-w-0">
                      {res.url ? (
                        <a href={res.url} target="_blank" rel="noreferrer"
                          className="text-sm font-semibold text-white hover:text-cyan-400 transition-colors leading-tight block truncate">
                          {res.title}
                        </a>
                      ) : (
                        <p className="text-sm font-semibold text-white leading-tight">{res.title}</p>
                      )}
                      {res.notes && (
                        <p className="text-xs text-slate-500 leading-snug mt-0.5">{res.notes}</p>
                      )}
                      {res.aiSuggested && (
                        <span className="text-[9px] text-blue-400/70 font-semibold uppercase tracking-wider mt-1 block">AI Suggested</span>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10 text-slate-600 border border-dashed border-white/8 rounded-2xl">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No resources for this week.</p>
                  <p className="text-xs mt-1">Use "AI Find" or "Add" above!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
