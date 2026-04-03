import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft, Send, Trash2,
  MessageSquarePlus, MessageSquare, Code,
  Copy, CheckCheck, PenLine, BookOpen, ChevronDown, ChevronUp
} from 'lucide-react';
import { generateContent } from '../lib/gemini';

// ─── Markdown renderer ───────────────────────────────────────────────────────
function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="rounded-xl overflow-hidden border border-white/10 bg-slate-950 my-2 shadow-inner">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Code className="w-3.5 h-3.5 text-green-400" />
          <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">{lang || 'python'}</span>
        </div>
        <button onClick={copy} className="text-slate-400 hover:text-white transition-colors p-1 rounded">
          {copied ? <CheckCheck className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm text-slate-200 font-mono leading-relaxed whitespace-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function TextBlock({ text }) {
  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Headers
    if (line.startsWith('### ')) {
      elements.push(<h4 key={i} className="text-sm font-bold text-white mt-3 mb-1">{line.slice(4)}</h4>);
    } else if (line.startsWith('## ')) {
      elements.push(<h3 key={i} className="text-base font-bold text-white mt-3 mb-1">{line.slice(3)}</h3>);
    } else if (line.startsWith('# ')) {
      elements.push(<h2 key={i} className="text-lg font-bold text-white mt-3 mb-1">{line.slice(2)}</h2>);
    }
    // List items
    else if (line.match(/^[-*•] /)) {
      const content = line.replace(/^[-*•] /, '');
      elements.push(
        <li key={i} className="text-sm leading-relaxed text-slate-200 ml-4 list-disc">
          {renderInline(content)}
        </li>
      );
    }
    // Numbered list
    else if (line.match(/^\d+\. /)) {
      const content = line.replace(/^\d+\. /, '');
      const num = line.match(/^(\d+)/)[1];
      elements.push(
        <li key={i} className="text-sm leading-relaxed text-slate-200 ml-4 list-decimal">
          {renderInline(content)}
        </li>
      );
    }
    // Empty line = paragraph break
    else if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
    }
    // Normal text
    else {
      elements.push(
        <p key={i} className="text-sm leading-relaxed text-slate-200">
          {renderInline(line)}
        </p>
      );
    }
    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
}

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((seg, j) => {
    if (seg.startsWith('**') && seg.endsWith('**'))
      return <strong key={j} className="text-white font-semibold">{seg.slice(2, -2)}</strong>;
    if (seg.startsWith('*') && seg.endsWith('*'))
      return <em key={j} className="italic text-slate-300">{seg.slice(1, -1)}</em>;
    if (seg.startsWith('`') && seg.endsWith('`'))
      return <code key={j} className="bg-slate-700 text-green-300 rounded px-1.5 py-0.5 text-xs font-mono">{seg.slice(1, -1)}</code>;
    return seg;
  });
}

function MessageContent({ text }) {
  const parts = [];
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  let lastIdx = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push({ type: 'text', content: text.slice(lastIdx, match.index) });
    }
    parts.push({ type: 'code', lang: match[1] || 'python', content: match[2].trim() });
    lastIdx = match.index + match[0].length;
  }
  if (lastIdx < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIdx) });
  }

  return (
    <div>
      {parts.map((part, i) =>
        part.type === 'code'
          ? <CodeBlock key={i} lang={part.lang} code={part.content} />
          : <TextBlock key={i} text={part.content} />
      )}
    </div>
  );
}

// ─── Chat history helpers ─────────────────────────────────────────────────────
const STORAGE_KEY = 'py_tutor_chats';

function loadAllChats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveAllChats(chats) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}

function createNewChat(title = 'New Chat') {
  return {
    id: 'chat_' + Date.now(),
    title,
    createdAt: new Date().toISOString(),
    messages: [],
  };
}

// ─── System prompt — simple Python beginner ───────────────────────────────────
const PYTHON_TUTOR_PROMPT = `You are a friendly Python tutor helping a complete beginner learn Python from scratch.

Your teaching rules:
- Use VERY simple, everyday language. No jargon unless you explain it immediately.
- Give short, step-by-step explanations. One concept at a time.
- ALWAYS show a simple code example. Keep examples short (under 15 lines).
- After every code example, explain what each line does in plain English.
- Encourage the learner. Be warm and patient.
- If they make a mistake, gently correct it and explain why.
- Use analogies from everyday life (cooking, legos, recipes, etc.)
- Format code using triple backticks with "python" as the language.

Example style:
- "Think of a variable like a box with a label..."
- "Here's how you do it, step by step:"
- Start with print(), variables, then build up slowly.

DO NOT:
- Use complex terminology without explaining it
- Show long complicated code
- Talk about AI agents, machine learning, or advanced topics unless asked`;

// ─── Main component ───────────────────────────────────────────────────────────
export default function ChatPage({ settings, weekData, monthData, onBack }) {
  const apiKey = settings?.apiKey;

  // All chats list
  const [chats, setChats] = useState(() => {
    const all = loadAllChats();
    if (all.length === 0) {
      const first = createNewChat('Getting Started with Python 🐍');
      first.messages = [{
        role: 'model',
        text: `👋 Hi! I'm your Python tutor.\n\nI'll help you learn Python step by step, starting from the very basics — no experience needed!\n\n**What would you like to learn today?** You can ask me things like:\n- "What is Python?"\n- "How do I print something?"\n- "What is a variable?"\n- "Show me a simple example"\n\nJust type your question below! 😊`
      }];
      return [first];
    }
    return all;
  });

  const [activeChatId, setActiveChatId] = useState(() => {
    const all = loadAllChats();
    return all.length > 0 ? all[0].id : null;
  });

  const [showSidebar, setShowSidebar] = useState(true);
  const [showTopics, setShowTopics] = useState(true);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState(0);
  const [editingTitle, setEditingTitle] = useState(null);
  const [tempTitle, setTempTitle] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Derived: active chat
  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];
  const messages = activeChat?.messages || [];

  // Persist whenever chats change
  useEffect(() => {
    saveAllChats(chats);
  }, [chats]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px';
    }
  }, [input]);

  // ── Chat management ──────────────────────────────────────────────────────────
  const startNewChat = () => {
    const chat = createNewChat('New Chat');
    chat.messages = [{
      role: 'model',
      text: `👋 Fresh start! Ask me anything about Python.\n\nSome ideas to get going:\n- "Explain variables with an example"\n- "How does a for loop work?"\n- "What's the difference between = and ==?"\n- "Help me understand functions"`
    }];
    setChats(prev => [chat, ...prev]);
    setActiveChatId(chat.id);
    setInput('');
  };

  const deleteChat = (id) => {
    setChats(prev => {
      const next = prev.filter(c => c.id !== id);
      if (next.length === 0) {
        const fresh = createNewChat('Python Basics');
        return [fresh];
      }
      return next;
    });
    if (activeChatId === id) {
      setActiveChatId(chats.find(c => c.id !== id)?.id || null);
    }
    setDeleteConfirmId(null);
  };

  const startRenameChat = (chat) => {
    setEditingTitle(chat.id);
    setTempTitle(chat.title);
  };

  const confirmRename = (id) => {
    if (tempTitle.trim()) {
      setChats(prev => prev.map(c => c.id === id ? { ...c, title: tempTitle.trim() } : c));
    }
    setEditingTitle(null);
  };

  // Auto-generate a smart title from first user message
  const autoTitle = (firstUserMsg) => {
    const trimmed = firstUserMsg.trim();
    if (trimmed.length <= 30) return trimmed;
    return trimmed.slice(0, 28) + '…';
  };

  // ── Send message ──────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (textToSend = input) => {
    if (!textToSend.trim() || loading || !apiKey) return;
    setInput('');
    setLoading(true);

    const userMsg = { role: 'user', text: textToSend };
    const updatedMessages = [...messages, userMsg];

    // Auto-set title from first user message
    setChats(prev => prev.map(c => {
      if (c.id !== activeChatId) return c;
      const newTitle = c.messages.filter(m => m.role === 'user').length === 0
        ? autoTitle(textToSend)
        : c.title;
      return { ...c, title: newTitle, messages: updatedMessages };
    }));

    const apiContents = [
      { role: 'user', parts: [{ text: PYTHON_TUTOR_PROMPT }] },
      { role: 'model', parts: [{ text: 'Got it! I\'m ready to help you learn Python step by step.' }] },
      ...updatedMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }))
    ];

    try {
      const reply = await generateContent(settings, apiContents);
      setChats(prev => prev.map(c =>
        c.id === activeChatId
          ? { ...c, messages: [...updatedMessages, { role: 'model', text: reply }] }
          : c
      ));
    } catch (err) {
      if (err.retrySeconds) {
        setRetryCountdown(err.retrySeconds);
        const t = setInterval(() => {
          setRetryCountdown(c => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; });
        }, 1000);
      }
      setChats(prev => prev.map(c =>
        c.id === activeChatId
          ? { ...c, messages: [...updatedMessages, { role: 'model', text: `⚠️ Error: ${err.message}` }] }
          : c
      ));
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading, settings, apiKey, activeChatId]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Starter questions ────────────────────────────────────────────────────────
  const STARTER_QUESTIONS = [
    'What is Python and why should I learn it?',
    'Show me my first Python program',
    'What is a variable? Give me an example',
    'How does a for loop work?',
    'What are functions and why use them?',
    'Explain if/else with a simple example',
  ];

  const formatDate = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now - d;
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex h-screen bg-slate-900 text-white overflow-hidden">

      {/* ── Sidebar: Chat list ── */}
      <aside className={`flex-shrink-0 flex flex-col border-r border-white/8 bg-slate-950/70 transition-all duration-300 ${showSidebar ? 'w-64 xl:w-72' : 'w-0 overflow-hidden'}`}>
        {/* Sidebar header */}
        <div className="p-3 border-b border-white/8 flex items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg flex items-center justify-center">
              <span className="text-sm leading-none">🐍</span>
            </div>
            <span className="text-sm font-bold text-white">Python Tutor</span>
          </div>
          <button
            onClick={startNewChat}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 text-green-400 hover:text-green-300 rounded-lg transition-all font-semibold"
            title="New Chat"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            New
          </button>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
          {chats.map(chat => (
            <div
              key={chat.id}
              className={`group relative rounded-xl transition-all cursor-pointer ${activeChatId === chat.id
                ? 'bg-white/8 border border-white/10'
                : 'hover:bg-white/5 border border-transparent'
                }`}
              onClick={() => { setActiveChatId(chat.id); setInput(''); }}
            >
              {editingTitle === chat.id ? (
                <div className="p-2" onClick={e => e.stopPropagation()}>
                  <input
                    autoFocus
                    value={tempTitle}
                    onChange={e => setTempTitle(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') confirmRename(chat.id); if (e.key === 'Escape') setEditingTitle(null); }}
                    onBlur={() => confirmRename(chat.id)}
                    className="w-full bg-slate-800 border border-white/20 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-green-500"
                  />
                </div>
              ) : (
                <div className="px-3 py-2.5 flex items-start gap-2">
                  <MessageSquare className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${activeChatId === chat.id ? 'text-green-400' : 'text-slate-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium truncate leading-tight ${activeChatId === chat.id ? 'text-white' : 'text-slate-300'}`}>
                      {chat.title}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-0.5">
                      {chat.messages.length} messages · {formatDate(chat.createdAt)}
                    </p>
                  </div>

                  {/* Actions (shown on hover) */}
                  <div className="flex-shrink-0 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => startRenameChat(chat)}
                      className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors"
                      title="Rename"
                    >
                      <PenLine className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(chat.id)}
                      className="p-1 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Delete confirm */}
              {deleteConfirmId === chat.id && (
                <div className="mx-2 mb-2 p-2 bg-red-900/40 border border-red-500/30 rounded-lg" onClick={e => e.stopPropagation()}>
                  <p className="text-[10px] text-red-200 mb-1.5">Delete this chat?</p>
                  <div className="flex gap-1.5">
                    <button onClick={() => deleteChat(chat.id)} className="flex-1 py-1 text-[10px] bg-red-600 hover:bg-red-500 text-white rounded-md font-semibold transition-colors">Delete</button>
                    <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-1 text-[10px] bg-white/5 hover:bg-white/10 text-slate-300 rounded-md transition-colors">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sidebar footer */}
        <div className="p-3 border-t border-white/8 flex-shrink-0">
          <p className="text-[10px] text-slate-600 text-center">Chats saved in your browser</p>
        </div>
      </aside>

      {/* ── Main chat area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="flex-shrink-0 border-b border-white/8 bg-slate-900/80 backdrop-blur z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2 min-w-0">
              {/* ← Back to Roadmap */}
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 text-slate-300 hover:text-white transition-colors flex-shrink-0 text-sm font-medium"
                title="Back to Roadmap"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Roadmap</span>
              </button>
              <button
                onClick={() => setShowSidebar(v => !v)}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors text-slate-500 hover:text-white flex-shrink-0"
                title="Toggle chat history"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
              <div className="min-w-0 hidden sm:block">
                <h1 className="font-bold text-sm text-white truncate leading-tight">
                  {activeChat?.title || 'Python Tutor'}
                </h1>
              </div>
            </div>

            <button
              onClick={startNewChat}
              className="flex items-center gap-2 px-3 py-2 text-xs bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 text-green-400 hover:text-green-300 rounded-xl transition-all font-semibold flex-shrink-0"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          </div>

          {/* ── Topics bar (collapsible) ── */}
          {weekData?.days?.length > 0 && (
            <div className="border-t border-white/5">
              <button
                onClick={() => setShowTopics(v => !v)}
                className="w-full flex items-center justify-between px-4 py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-green-500" />
                  <span className="font-semibold text-green-400/80">This Week's Topics</span>
                  <span className="text-slate-600">— click any topic to ask about it</span>
                </div>
                {showTopics
                  ? <ChevronUp className="w-3.5 h-3.5" />
                  : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showTopics && (
                <div className="px-3 pb-2.5 flex flex-wrap gap-1.5">
                  {weekData.days.map(day => (
                    <button
                      key={day.id}
                      onClick={() => {
                        const q = `Explain "${day.topic}" to me in simple terms with a short Python example.`;
                        setInput(q);
                        textareaRef.current?.focus();
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-green-500/10 border border-white/8 hover:border-green-500/30 text-xs transition-all group"
                      title={day.scope}
                    >
                      <span className="text-green-500/70 font-mono font-bold text-[10px]">D{day.day}</span>
                      <span className="text-slate-300 group-hover:text-white">{day.topic}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-5">

          {/* Starter questions – shown when chat is empty (only welcome msg) */}
          {messages.length <= 1 && messages[0]?.role === 'model' && (
            <>
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-green-500/40 to-emerald-500/40 border border-green-500/30 flex items-center justify-center">
                  <span className="text-base">🐍</span>
                </div>
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm p-4 bg-slate-800/80 border border-white/5 shadow-sm">
                  <MessageContent text={messages[0].text} />
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs text-slate-500 mb-3 text-center">— or pick a question to start —</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
                  {STARTER_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      className="text-left px-4 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/8 hover:border-green-500/30 text-xs text-slate-300 hover:text-white transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Normal messages */}
          {(messages.length > 1 || messages[0]?.role === 'user') && messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'model' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-green-500/40 to-emerald-500/40 border border-green-500/30 flex items-center justify-center mt-0.5">
                  <span className="text-base">🐍</span>
                </div>
              )}
              <div className={`max-w-[82%] sm:max-w-[72%] rounded-2xl p-4 shadow-sm ${m.role === 'user'
                ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-sm'
                : 'bg-slate-800/80 border border-white/5 rounded-tl-sm'
                }`}>
                {m.role === 'user'
                  ? <p className="text-sm leading-relaxed">{m.text}</p>
                  : <MessageContent text={m.text} />
                }
              </div>
              {m.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-slate-700 border border-white/5 flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-slate-300">You</span>
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-green-500/40 to-emerald-500/40 border border-green-500/30 flex items-center justify-center">
                <span className="text-base">🐍</span>
              </div>
              <div className="bg-slate-800/80 border border-white/5 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-3">
                <span className="flex gap-1">
                  {[0, 1, 2].map(j => (
                    <span key={j} className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: `${j * 0.15}s` }} />
                  ))}
                </span>
                <span className="text-sm text-slate-400">Thinking…</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input bar */}
        <div className="flex-shrink-0 border-t border-white/8 bg-slate-900/80 backdrop-blur px-4 sm:px-6 py-4">
          {!apiKey && (
            <div className="mb-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200 text-center">
              ⚠️ No API key set. Go back and open <strong>Settings</strong> to add your Gemini API key.
            </div>
          )}
          {retryCountdown > 0 && (
            <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-200 flex items-center justify-between">
              <span>⏱ Quota reached — please wait…</span>
              <span className="font-mono font-bold text-red-300 text-sm">{retryCountdown}s</span>
            </div>
          )}

          <div className="flex gap-3 items-end">
            <div className="flex-1 bg-slate-800 border border-white/10 rounded-2xl overflow-hidden focus-within:border-green-500/60 focus-within:ring-1 focus-within:ring-green-500/20 transition-all">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={apiKey ? 'Ask anything about Python… (Shift+Enter for new line)' : 'Set API key in Settings to chat…'}
                disabled={!apiKey || loading}
                rows={1}
                className="w-full bg-transparent px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!apiKey || !input.trim() || loading}
              className="flex-shrink-0 h-12 w-12 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-green-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
          <p className="text-center text-xs text-slate-600 mt-2">
            Python Tutor · {chats.length} chat{chats.length !== 1 ? 's' : ''} · {messages.filter(m => m.role === 'user').length} questions in this session
          </p>
        </div>
      </div>
    </div>
  );
}
