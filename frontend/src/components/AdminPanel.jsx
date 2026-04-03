import React, { useState } from 'react';
import { X, Lock, Unlock, Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import { getAdminSecret, setAdminSecret, isAdmin, createResource, deleteResource } from '../lib/api';
import { ROADMAP_DATA } from '../data';

const RESOURCE_TYPES = [
  { value: 'link',   label: 'Link' },
  { value: 'docs',   label: 'Docs' },
  { value: 'video',  label: 'Video' },
  { value: 'course', label: 'Course' },
  { value: 'audio',  label: 'Podcast' },
  { value: 'tool',   label: 'Tool' },
];

export default function AdminPanel({ isOpen, onClose, onResourcesChanged }) {
  const [loggedIn, setLoggedIn] = useState(() => isAdmin());
  const [secretInput, setSecretInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const [form, setForm] = useState({
    title: '',
    url: '',
    type: 'link',
    notes: '',
    tags: '',
    week: '',
  });

  if (!isOpen) return null;

  const handleLogin = () => {
    if (!secretInput.trim()) { setLoginError('Enter the admin secret.'); return; }
    setAdminSecret(secretInput.trim());
    setLoggedIn(true);
    setLoginError('');
    setSecretInput('');
  };

  const handleLogout = () => {
    setAdminSecret(null);
    setLoggedIn(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setSaveError('Title is required.'); return; }
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');
    try {
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      await createResource({ ...form, tags }, getAdminSecret());
      setSaveSuccess('Resource added! ✓');
      setForm({ title: '', url: '', type: 'link', notes: '', tags: '', week: '' });
      onResourcesChanged?.();
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err) {
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        handleLogout();
        setSaveError('Admin secret is wrong — logged out.');
      } else {
        setSaveError(err.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const updateForm = (key, val) => setForm(p => ({ ...p, [key]: val }));

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div className="flex items-center gap-2">
            {loggedIn
              ? <Unlock className="w-4 h-4 text-green-400" />
              : <Lock className="w-4 h-4 text-amber-400" />}
            <h2 className="font-bold text-white text-sm">Admin Panel</h2>
            {loggedIn && (
              <span className="text-[10px] bg-green-500/15 text-green-400 border border-green-500/25 rounded-full px-2 py-0.5 font-semibold">
                LOGGED IN
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {loggedIn && (
              <button
                onClick={handleLogout}
                className="text-xs px-3 py-1.5 text-slate-400 hover:text-white border border-white/10 hover:border-white/20 rounded-lg transition-colors"
              >
                Logout
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {!loggedIn ? (
            /* Login form */
            <div className="space-y-4">
              <p className="text-sm text-slate-400">Enter your admin secret to manage resources.</p>
              <input
                type="password"
                placeholder="Admin secret…"
                value={secretInput}
                onChange={e => setSecretInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="w-full bg-slate-800 border border-white/10 focus:border-amber-500/60 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
              {loginError && (
                <p className="text-xs text-red-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> {loginError}
                </p>
              )}
              <button
                onClick={handleLogin}
                className="w-full py-3 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 hover:text-white rounded-xl text-sm font-semibold transition-all"
              >
                Unlock Admin
              </button>
            </div>
          ) : (
            /* Add resource form */
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white mb-4">Add New Resource</h3>

              <input
                type="text"
                placeholder="Title *"
                value={form.title}
                onChange={e => updateForm('title', e.target.value)}
                className="w-full bg-slate-800 border border-white/10 focus:border-purple-500/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
              <input
                type="text"
                placeholder="URL (optional)"
                value={form.url}
                onChange={e => updateForm('url', e.target.value)}
                className="w-full bg-slate-800 border border-white/10 focus:border-purple-500/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
              <input
                type="text"
                placeholder="Notes (optional)"
                value={form.notes}
                onChange={e => updateForm('notes', e.target.value)}
                className="w-full bg-slate-800 border border-white/10 focus:border-purple-500/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
              <input
                type="text"
                placeholder="Tags (comma separated)"
                value={form.tags}
                onChange={e => updateForm('tags', e.target.value)}
                className="w-full bg-slate-800 border border-white/10 focus:border-purple-500/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
              />

              <div className="grid grid-cols-2 gap-3">
                {/* Type */}
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1.5 block">Type</label>
                  <select
                    value={form.type}
                    onChange={e => updateForm('type', e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/60 transition-colors"
                  >
                    {RESOURCE_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Week */}
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1.5 block">Week</label>
                  <select
                    value={form.week}
                    onChange={e => updateForm('week', e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/60 transition-colors"
                  >
                    <option value="">— General —</option>
                    {ROADMAP_DATA.months.flatMap(m =>
                      m.weeks.map(w => (
                        <option key={w.id} value={w.id}>W{w.weekNum}: {w.title.slice(0, 25)}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {saveError && (
                <p className="text-xs text-red-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> {saveError}
                </p>
              )}
              {saveSuccess && (
                <p className="text-xs text-green-400 font-semibold">{saveSuccess}</p>
              )}

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all"
              >
                {saving ? (
                  <span className="animate-spin">⟳</span>
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {saving ? 'Saving…' : 'Add Resource'}
              </button>

              <p className="text-[10px] text-slate-600 text-center mt-2">
                Your admin session lasts until you close or refresh this tab.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
