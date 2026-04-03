import React, { useState } from 'react';
import { X, Key, Eye, EyeOff, Shield, CheckCircle, Trash2, Cpu, Cloud, AlertCircle, Wifi, RefreshCw } from 'lucide-react';
import { generateContent } from '../lib/gemini';

// Active model list
export const GEMINI_MODELS = [
  {
    id: 'gemini-2.0-flash',
    label: 'Gemini 2.0 Flash',
    badge: 'Fast',
    badgeColor: 'text-green-400 bg-green-500/10 border-green-500/20',
    note: 'Reliable, fast, and widely available.',
  },
  {
    id: 'gemini-3.1-pro-preview',
    label: 'Gemini 3.1 Pro Preview',
    badge: 'Latest',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    note: 'Most capable model — best for complex AI topics.',
  },
];

export default function SettingsModal({ isOpen, onClose, settings, onSave }) {
  const [provider, setProvider]       = useState(settings?.provider   || 'ai_studio');
  const [apiKey, setApiKey]           = useState(settings?.apiKey     || '');
  const [projectId, setProjectId]     = useState(settings?.projectId  || '');
  const [region, setRegion]           = useState(settings?.region     || 'us-central1');
  const [selectedModel, setModel]     = useState(settings?.model      || GEMINI_MODELS[0].id);
  const [showKey, setShowKey]         = useState(false);
  const [saved, setSaved]             = useState(false);
  const [testing, setTesting]         = useState(false);
  const [testResult, setTestResult]   = useState(null); // null | 'ok' | { error }
  const [liveModels, setLiveModels]   = useState(null); // null | string[]
  const [fetchingModels, setFetchingModels] = useState(false);

  if (!isOpen) return null;

  const currentSettings = { provider, apiKey, model: selectedModel, projectId, region };

  const handleSave = () => {
    onSave(currentSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleClear = () => {
    setApiKey(''); setProjectId('');
    onSave({ provider: 'ai_studio', apiKey: '', model: GEMINI_MODELS[0].id, projectId: '', region: 'us-central1' });
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      await generateContent(currentSettings, [{ parts: [{ text: 'Reply with exactly one word: OK' }] }]);
      setTestResult('ok');
    } catch (err) {
      setTestResult({ error: err.message });
    } finally {
      setTesting(false);
    }
  };

  const fetchLiveModels = async () => {
    if (!apiKey) return;
    setFetchingModels(true);
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}&pageSize=50`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      // Only include models that support generateContent
      const filtered = (data.models || [])
        .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
        .map(m => m.name.replace('models/', ''));
      setLiveModels(filtered);
    } catch (err) {
      setLiveModels([`Error: ${err.message}`]);
    } finally {
      setFetchingModels(false);
    }
  };

  const maskedKey = apiKey
    ? apiKey.slice(0, 6) + '•'.repeat(Math.max(0, apiKey.length - 10)) + apiKey.slice(-4)
    : '';

  const isVertex = provider === 'vertex';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-slate-900 border border-white/10 rounded-3xl shadow-2xl shadow-black/60 overflow-hidden animate-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-500/30">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Settings</h2>
              <p className="text-xs text-slate-400">API credentials & model</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">

          {/* Provider Toggle */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Cloud className="w-4 h-4 text-purple-400" />
              API Provider
            </label>
            <div className="flex rounded-xl bg-slate-800 p-1 border border-white/5 gap-1">
              {[
                { id: 'ai_studio', label: 'Google AI Studio', sub: 'Easiest for beginners', color: 'bg-purple-600' },
                { id: 'vertex',    label: 'Vertex AI (GCP)',  sub: 'Enterprise / GCP users', color: 'bg-blue-600' },
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => { setProvider(p.id); setTestResult(null); }}
                  className={`flex-1 flex flex-col items-center justify-center p-2.5 rounded-lg text-sm font-medium transition-all ${
                    provider === p.id ? `${p.color} text-white shadow-md` : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{p.label}</span>
                  <span className="text-[10px] opacity-60">{p.sub}</span>
                </button>
              ))}
            </div>

            {/* Context banners */}
            {!isVertex && (
              <div className="p-4 rounded-xl bg-purple-500/8 border border-purple-500/20 space-y-1.5 text-xs text-purple-200/80 leading-relaxed">
                <p><strong className="text-purple-300">✓ Get a free key:</strong> <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="underline hover:text-white">aistudio.google.com/apikey</a></p>
                <p><strong className="text-amber-300">⚠ Quota = 0?</strong> Free tier may be restricted in EU/UK — add billing at <a href="https://console.cloud.google.com/billing" target="_blank" rel="noreferrer" className="underline hover:text-white">console.cloud.google.com</a>, or try a VPN set to US.</p>
                <p><strong className="text-green-300">✓ Best free model:</strong> gemini-2.0-flash-lite has the highest RPM quota.</p>
              </div>
            )}

            {isVertex && (
              <div className="p-4 rounded-xl bg-orange-500/8 border border-orange-500/20 text-xs leading-relaxed space-y-2">
                <p className="text-orange-200/80"><strong className="text-orange-300">⚠ CORS Limitation:</strong> Vertex AI access tokens cannot be used directly from a browser — Google blocks cross-origin requests. You'll see a <code className="bg-black/30 px-1 py-0.5 rounded text-orange-200">403 PERMISSION_DENIED</code> or CORS error.</p>
                <p className="text-orange-200/60">Solution: Use AI Studio instead, or deploy a backend proxy (Node.js/Python) that forwards requests using the token server-side.</p>
                <p className="text-orange-200/60">If you have a GCP <strong className="text-orange-300">API key</strong> (not an access token), it may work if you've enabled the Vertex AI API on your project.</p>
              </div>
            )}
          </div>

          <div className="h-px bg-white/5" />

          {/* Vertex params */}
          {isVertex && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">GCP Project ID</label>
                <input
                  type="text"
                  value={projectId}
                  onChange={e => setProjectId(e.target.value)}
                  placeholder="my-gcp-project"
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Region</label>
                <input
                  type="text"
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                  placeholder="us-central1"
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* API Key / Token */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Key className="w-4 h-4 text-purple-400" />
              {isVertex ? 'Access Token or API Key' : 'Gemini API Key'}
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => { setApiKey(e.target.value); setTestResult(null); }}
                placeholder={isVertex ? 'ya29.a0… or AQ.Ab8… or AIza…' : 'AIza…'}
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/40 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {apiKey && (
              <p className="text-xs text-slate-600 font-mono px-1">
                {maskedKey} <span className="text-slate-700 font-sans">(stored in localStorage only)</span>
              </p>
            )}
            {isVertex && apiKey && (
              <p className={`text-xs font-semibold px-1 ${ 
                apiKey.startsWith('ya29.') || apiKey.startsWith('AQ.') 
                  ? 'text-amber-400' 
                  : 'text-blue-400'
              }`}>
                {apiKey.startsWith('ya29.') || apiKey.startsWith('AQ.')
                  ? '⏱ Access token detected — expires ~1h. Will use Bearer auth. CORS may block browser calls.'
                  : '🔑 API key detected — will append as query param.'}
              </p>
            )}
          </div>

          {/* Test Connection */}
          {apiKey && (
            <div className="space-y-2">
              <button
                onClick={testConnection}
                disabled={testing}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-300 hover:text-white transition-all disabled:opacity-50"
              >
                <Wifi className={`w-4 h-4 ${testing ? 'animate-pulse text-blue-400' : 'text-slate-400'}`} />
                {testing ? 'Testing…' : 'Test Connection'}
              </button>

              {testResult === 'ok' && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-green-500/10 border border-green-500/20 rounded-xl text-xs text-green-300">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  Connection successful! API is working correctly.
                </div>
              )}
              {testResult?.error && (
                <div className="flex items-start gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
                  <span className="leading-relaxed whitespace-pre-wrap">{testResult.error}</span>
                </div>
              )}
            </div>
          )}

          <div className="h-px bg-white/5" />

          {/* Model picker */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                Model
              </label>
              {apiKey && !isVertex && (
                <button
                  onClick={fetchLiveModels}
                  disabled={fetchingModels}
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${fetchingModels ? 'animate-spin' : ''}`} />
                  {fetchingModels ? 'Fetching…' : 'Fetch live models from API'}
                </button>
              )}
            </div>

            {/* Live model list */}
            {liveModels && (
              <div className="rounded-xl border border-white/8 bg-slate-800/40 overflow-hidden">
                <div className="px-3 py-2 border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Live models supporting generateContent ({liveModels.filter(m => !m.startsWith('Error')).length})</span>
                  <button onClick={() => setLiveModels(null)} className="text-slate-600 hover:text-slate-400 text-xs">✕</button>
                </div>
                <div className="max-h-48 overflow-y-auto custom-scrollbar divide-y divide-white/5">
                  {liveModels.map(modelId => {
                    const isError = modelId.startsWith('Error');
                    const isSelected = selectedModel === modelId;
                    return (
                      <button
                        key={modelId}
                        onClick={() => !isError && setModel(modelId)}
                        disabled={isError}
                        className={`w-full text-left px-3 py-2 text-xs font-mono transition-colors ${
                          isError
                            ? 'text-red-400/60 cursor-default'
                            : isSelected
                            ? 'bg-purple-500/10 text-purple-300'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {isSelected && <CheckCircle className="w-3 h-3 text-purple-400 flex-shrink-0" />}
                          {modelId}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Preset tiles */}
            <div className="space-y-2">
              {GEMINI_MODELS.map(m => (
                <button
                  key={m.id}
                  onClick={() => setModel(m.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    selectedModel === m.id
                      ? 'bg-purple-500/10 border-purple-500/40'
                      : 'bg-slate-800/50 border-white/8 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{m.label}</span>
                      {selectedModel === m.id && <CheckCircle className="w-3.5 h-3.5 text-purple-400" />}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${m.badgeColor}`}>
                      {m.badge}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-600">{m.id}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{m.note}</p>
                </button>
              ))}
            </div>

            {/* Custom model ID input */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-500">Or type any model ID manually:</label>
              <input
                type="text"
                value={GEMINI_MODELS.find(m => m.id === selectedModel) ? '' : selectedModel}
                onChange={e => setModel(e.target.value)}
                placeholder="e.g. gemini-2.5-flash-preview-04-17"
                className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-5 border-t border-white/8 bg-slate-900">
          {settings?.apiKey && (
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          )}
          <button
            onClick={handleSave}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/20'
            }`}
          >
            {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
