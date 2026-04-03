import React, { useState, useEffect, useRef } from 'react';
import { ROADMAP_DATA, DEFAULT_RESOURCES } from './data';
import { BookOpen, Calendar, ChevronRight, Download, BrainCircuit, ExternalLink, CheckCircle, Circle, ArrowLeft, Plus, Trash2, Search, Loader2, MessageSquare, Send } from 'lucide-react';

function App() {
  const [activeMonth, setActiveMonth] = useState(1);
  const [activeWeek, setActiveWeek] = useState(ROADMAP_DATA.months[0].weeks[0].id);
  
  // Persisted state
  const [completedDays, setCompletedDays] = useState(() => JSON.parse(localStorage.getItem('completedDays')) || []);
  const [resources, setResources] = useState(() => JSON.parse(localStorage.getItem('resources')) || DEFAULT_RESOURCES);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('geminiApiKey') || '');
  
  // UI state
  const [activeView, setActiveView] = useState('roadmap'); // 'roadmap' | 'chat'
  
  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [askInput, setAskInput] = useState('');

  // Resources form state
  const [isFindingResources, setIsFindingResources] = useState(false);
  const [newResourceTitle, setNewResourceTitle] = useState('');
  const [newResourceUrl, setNewResourceUrl] = useState('');

  // Persist effects
  useEffect(() => { localStorage.setItem('completedDays', JSON.stringify(completedDays)); }, [completedDays]);
  useEffect(() => { localStorage.setItem('resources', JSON.stringify(resources)); }, [resources]);
  useEffect(() => { localStorage.setItem('geminiApiKey', apiKey); }, [apiKey]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const currentMonthData = ROADMAP_DATA.months.find(m => m.id === activeMonth);
  const currentWeekData = currentMonthData?.weeks.find(w => w.id === activeWeek) || currentMonthData?.weeks[0];

  const toggleDayCompletion = (dayId) => {
    setCompletedDays(prev => 
      prev.includes(dayId) ? prev.filter(id => id !== dayId) : [...prev, dayId]
    );
  };

  const addManualResource = () => {
    if (!newResourceTitle || !newResourceUrl) return;
    const newRes = { id: Date.now().toString(), title: newResourceTitle, url: newResourceUrl, notes: 'Added manually', week: currentWeekData.id };
    setResources(prev => [newRes, ...prev]);
    setNewResourceTitle('');
    setNewResourceUrl('');
  };

  const removeResource = (id) => {
    setResources(prev => prev.filter(r => r.id !== id));
  };

  const handleAskTutor = (overrideText = '') => {
    if (!apiKey) {
      alert("Please enter your Gemini API Key first.");
      return;
    }
    setActiveView('chat');
    
    // Set context message if chat is empty
    if (chatMessages.length === 0) {
      setChatMessages([{ role: 'model', text: `Hi! I'm your Agentic Tutor. I see you're working on ${currentMonthData.title}, ${currentWeekData.title}. How can I help you master these concepts?` }]);
    }

    if (overrideText) {
      sendMessage(overrideText);
    }
  };

  const handleAskTutorSubmit = (e) => {
    e.preventDefault();
    if (askInput.trim() && apiKey) {
      const msg = askInput;
      setAskInput('');
      handleAskTutor(msg);
    } else if (!apiKey) {
      alert("Please enter your Gemini API Key first.");
    }
  };

  const sendMessage = async (textToSend = chatInput) => {
    if (!textToSend.trim() || !apiKey) return;
    
    setChatInput('');
    const newMsg = { role: 'user', text: textToSend };
    
    // We update state with the user message immediately
    setChatMessages(prev => {
      const nextMessages = [...prev, newMsg];
      
      // Perform fetch inside so we have latest history
      setIsChatLoading(true);
      
      const historyForApi = nextMessages.map(m => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.text }]
      }));
      
      // Add system context invisibly to the last user message for the API call
      historyForApi[historyForApi.length - 1].parts[0].text += `\n\n[Context: The user is currently learning about "${currentWeekData.title}: ${currentWeekData.goal}". Guide them primarily on this context if applicable.]`;

      fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: historyForApi })
      })
      .then(res => res.json())
      .then(data => {
        setIsChatLoading(false);
        if (data.error) throw new Error(data.error.message);
        const reply = data.candidates[0].content.parts[0].text;
        setChatMessages(curr => [...curr, { role: 'model', text: reply }]);
      })
      .catch(err => {
        setIsChatLoading(false);
        setChatMessages(curr => [...curr, { role: 'model', text: `Error: ${err.message}` }]);
      });
      
      return nextMessages;
    });
  };

  const findResourcesWithAI = async () => {
    if (!apiKey) return alert("Please set your Gemini API key first!");
    setIsFindingResources(true);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `Find 3 high-quality free learning resources for: "${currentWeekData.title}" in the context of "${currentWeekData.goal}". Return raw JSON array with objects containing keys: "title", "url", "notes" (very short). Only valid JSON, no markdown formatting. Avoid backticks.` }]
          }]
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      let text = data.candidates[0].content.parts[0].text;
      
      // Clean up markdown in case the model returns it
      const jsonStr = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const aiRes = JSON.parse(jsonStr).map(r => ({ ...r, id: Date.now() + Math.random().toString(), week: currentWeekData.id, type: 'ai-suggested' }));
      
      setResources(prev => [...aiRes, ...prev]);
    } catch (err) {
      alert("Failed to find resources: " + err.message);
    } finally {
      setIsFindingResources(false);
    }
  };

  if (activeView === 'chat') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-50 font-sans flex flex-col selection:bg-purple-500/30 selection:text-purple-200">
        <header className="border-b border-white/10 bg-slate-900/50 p-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveView('roadmap')} className="p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2">
              <ArrowLeft className="w-5 h-5 text-slate-300" />
              <span className="hidden sm:inline font-medium text-slate-300">Back to Roadmap</span>
            </button>
            <div className="h-6 w-px bg-white/10 mx-2" />
            <BrainCircuit className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              Agentic Tutor
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="password" 
              placeholder="Gemini API Key" 
              value={apiKey} 
              onChange={e => setApiKey(e.target.value)}
              className="bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm w-32 sm:w-48 focus:border-purple-500 focus:outline-none"
            />
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full space-y-4">
          {chatMessages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-4 ${m.role === 'user' ? 'bg-purple-600 text-white rounded-tr-sm' : 'bg-slate-800 text-slate-200 border border-white/5 rounded-tl-sm'}`}>
                {m.text}
              </div>
            </div>
          ))}
          {isChatLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-200 border border-white/5 rounded-2xl p-4 flex items-center gap-3 rounded-tl-sm">
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" /> 
                <span className="text-sm font-medium">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </main>
        
        <footer className="border-t border-white/10 bg-slate-900/80 backdrop-blur p-4 sticky bottom-0">
          <div className="max-w-4xl mx-auto flex gap-2">
            <input 
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder={apiKey ? "Ask something..." : "Enter Gemini API Key in header first..."}
              disabled={!apiKey || isChatLoading}
              className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 shadow-inner"
            />
            <button 
              onClick={() => sendMessage()}
              disabled={!apiKey || !chatInput.trim() || isChatLoading}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 px-6 rounded-xl transition-colors flex items-center justify-center shadow-lg shadow-purple-500/20"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </footer>
      </div>
    );
  }

  // Active displayed resources
  const visibleResources = resources.filter(r => !r.week || r.week === currentWeekData.id || r.week === 'all');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-purple-500/30 selection:text-purple-200">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg shadow-purple-500/20">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                AgenticDev
              </h1>
              <p className="text-xs text-slate-400 font-medium">Zero → Job-Ready Roadmap</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input 
              type="password" 
              placeholder="Gemini API Key" 
              value={apiKey} 
              onChange={e => setApiKey(e.target.value)}
              className="bg-slate-800/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm w-32 sm:w-48 focus:border-purple-500 focus:outline-none hidden sm:block"
            />
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-all group">
              <Download className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
              Export Plan
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-12">
        {/* Left Col: Roadmap */}
        <div className="space-y-12">
          {/* Intro */}
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight mb-4">
              Your Path to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">AI Mastery</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
              {ROADMAP_DATA.subtitle}. A complete curriculum covering Python, APIs, Multi-agent systems, and deployment.
            </p>
          </div>

          {/* Month Tabs */}
          <div className="flex flex-wrap gap-2 p-1 bg-white/5 rounded-2xl border border-white/5 w-fit">
            {ROADMAP_DATA.months.map((month) => (
              <button
                key={month.id}
                onClick={() => {
                  setActiveMonth(month.id);
                  setActiveWeek(month.weeks[0].id);
                }}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeMonth === month.id
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {month.title}
              </button>
            ))}
          </div>

          {/* Week Selection & Content */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm border border-purple-500/30">
                  {currentMonthData.id}
                </span>
                {currentMonthData.subtitle}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Weeks List */}
              <div className="md:col-span-1 space-y-2 relative">
                <div className="absolute left-4 top-4 bottom-4 w-px bg-white/10" />
                {currentMonthData.weeks.map((week) => {
                  const weekDays = week.days.length;
                  const completedInWeek = week.days.filter(d => completedDays.includes(d.id)).length;
                  const isWeekDone = completedInWeek === weekDays && weekDays > 0;
                  
                  return (
                    <button
                      key={week.id}
                      onClick={() => setActiveWeek(week.id)}
                      className={`w-full text-left pl-10 py-3 pr-4 rounded-xl relative transition-all ${
                        activeWeek === week.id
                          ? 'bg-purple-500/10 text-white font-medium border border-purple-500/20'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className={`absolute left-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                        activeWeek === week.id ? 'bg-purple-400' : (isWeekDone ? 'bg-green-400' : 'bg-slate-600')
                      }`} style={{ marginLeft: '17px' }} />
                      <div className={`text-xs uppercase tracking-wider mb-1 font-semibold ${isWeekDone ? 'text-green-400' : 'text-purple-400'}`}>
                        Week {week.weekNum} {isWeekDone && '✓'}
                      </div>
                      <div className="text-sm truncate">{week.title}</div>
                    </button>
                  );
                })}
              </div>

              {/* Week Details */}
              <div className="md:col-span-3 bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
                <div className="flex items-start justify-between gap-4 mb-8">
                  <div>
                    <h4 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 uppercase tracking-widest mb-2">
                       {currentWeekData.title}
                    </h4>
                    <p className="text-slate-300 text-lg leading-relaxed">
                      {currentWeekData.goal}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {currentWeekData.days.map((day) => {
                    const isCompleted = completedDays.includes(day.id);
                    return (
                      <div key={day.id} className="group flex gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 items-start">
                        <button 
                          onClick={() => toggleDayCompletion(day.id)} 
                          className="mt-1 flex-shrink-0 focus:outline-none"
                          title="Mark completed"
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-6 h-6 text-green-400" />
                          ) : (
                            <Circle className="w-6 h-6 text-slate-600 group-hover:text-slate-400" />
                          )}
                        </button>
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl border flex flex-col items-center justify-center shadow-inner transition-colors ${
                          isCompleted ? 'bg-green-900/20 border-green-500/20' : 'bg-slate-800 border-white/5'
                        }`}>
                          <span className={`text-[10px] font-semibold uppercase ${isCompleted ? 'text-green-400/70' : 'text-slate-400'}`}>Day</span>
                          <span className={`text-lg font-bold leading-none ${isCompleted ? 'text-green-400' : 'text-white'}`}>{day.day}</span>
                        </div>
                        <div className="flex-1">
                          <h5 className={`font-semibold text-base mb-1 transition-colors ${isCompleted ? 'line-through text-slate-500' : 'text-white'}`}>
                            {day.topic}
                          </h5>
                          <p className={`text-sm leading-relaxed mb-3 transition-colors ${isCompleted ? 'text-slate-600' : 'text-slate-400'}`}>
                            {day.scope}
                          </p>
                          {day.url && (
                            <a href={day.url} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-1.5 text-xs font-semibold hover:text-purple-300 transition-colors ${isCompleted ? 'text-slate-600' : 'text-purple-400'}`}>
                              <BookOpen className="w-3.5 h-3.5" />
                              {day.resource || 'View Docs'}
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

        {/* Right Col: Resources / AI Agent box (Sidebar) */}
        <div className="space-y-8">
          <div className="bg-gradient-to-b from-purple-900/20 to-transparent border border-purple-500/20 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
            
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-purple-400" />
              Agentic Tutor
            </h3>

            {!apiKey ? (
              <div className="mb-4 mt-4 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                <p className="text-xs text-red-200 mb-2 font-medium">Gemini API Key required to use AI features</p>
                <input 
                  type="password" 
                  placeholder="Paste your API Key here..." 
                  value={apiKey} 
                  onChange={e => setApiKey(e.target.value)}
                  className="w-full bg-slate-900/80 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-400" 
                />
              </div>
            ) : (
              <p className="text-sm text-purple-200/70 mb-6">
                Stuck on a concept? Ask the AI tutor for an explanation scoped strictly to your current week's knowledge.
              </p>
            )}

            <form onSubmit={handleAskTutorSubmit} className="space-y-4 pt-2">
              <input 
                type="text" 
                placeholder="Explain variables to me..." 
                value={askInput}
                onChange={e => setAskInput(e.target.value)}
                className="w-full bg-slate-900/50 border border-purple-500/30 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all shadow-inner" 
              />
              
              <button 
                type="button"
                onClick={() => askInput ? handleAskTutorSubmit({preventDefault:()=>{}}) : handleAskTutor()}
                className="group relative overflow-hidden rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white shadow-[0_0_40px_-5px_var(--tw-shadow-color)] shadow-purple-500 transition-all duration-300 hover:scale-[1.02] hover:bg-purple-500 w-full active:scale-[0.98]"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Ask Tutor
                  <BrainCircuit className="h-4 w-4 transition-transform group-hover:rotate-12 group-hover:scale-110" />
                </span>
                <div className="absolute inset-0 z-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] transition-transform duration-700 ease-in-out group-hover:translate-x-[150%]" />
              </button>
            </form>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-slate-400" />
                Resources
              </h3>
              <button 
                onClick={findResourcesWithAI}
                disabled={isFindingResources || !apiKey}
                className="text-xs flex items-center gap-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 font-medium"
              >
                {isFindingResources ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                Autofill via AI
              </button>
            </div>

            <div className="mb-4 space-y-2 p-3 bg-white/5 rounded-xl border border-white/5">
              <input 
                type="text" 
                placeholder="Resource Title" 
                value={newResourceTitle} 
                onChange={e => setNewResourceTitle(e.target.value)} 
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500" 
              />
              <input 
                type="text" 
                placeholder="URL (optional)" 
                value={newResourceUrl} 
                onChange={e => setNewResourceUrl(e.target.value)} 
                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500" 
              />
              <button 
                onClick={addManualResource} 
                className="w-full bg-white/10 hover:bg-white/20 text-xs py-2 mt-1 rounded-lg flex items-center justify-center gap-1.5 transition-colors font-medium text-white"
              >
                <Plus className="w-3.5 h-3.5" /> Add Custom Resource
              </button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {visibleResources.length > 0 ? (
                visibleResources.map((res) => (
                  <div key={res.id} className="block p-4 rounded-2xl bg-white/[0.02] border border-white/5 relative group transition-colors hover:bg-white/[0.04] hover:border-white/10">
                    <button 
                      onClick={() => removeResource(res.id)} 
                      className="absolute top-3 right-3 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 p-1.5 rounded-md"
                      title="Remove resource"
                    >
                       <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {res.url ? (
                      <a href={res.url} target="_blank" rel="noreferrer" className="block pr-6">
                        <h4 className="font-semibold text-white text-sm mb-1 group-hover:text-cyan-400 transition-colors">{res.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{res.notes}</p>
                      </a>
                    ) : (
                      <div className="block pr-6">
                        <h4 className="font-semibold text-white text-sm mb-1">{res.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{res.notes}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                  <p className="text-sm">No resources for this week.</p>
                  <p className="text-xs mt-1">Use the "Autofill via AI" button above!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
