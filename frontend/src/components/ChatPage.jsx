import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft, Send, Trash2,
  MessageSquarePlus, MessageSquare, Code,
  Copy, CheckCheck, PenLine, BookOpen, ChevronDown, ChevronUp, Download, FileText, Paperclip, Loader2, File, Image
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

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
// ─── Chat history helpers ─────────────────────────────────────────────────────

async function loadAllChats() {
  try {
    const res = await fetch('/api/chats');
    if (!res.ok) throw new Error('Failed to load chats');
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function createNewChatBackend(title = 'New Chat') {
  try {
    const res = await fetch('/api/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
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
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showTopics, setShowTopics] = useState(true);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState(0);
  const [editingTitle, setEditingTitle] = useState(null);
  const [tempTitle, setTempTitle] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [exportingId, setExportingId] = useState(null);
  const fileInputRef = useRef(null);

  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    loadAllChats().then(all => {
      if (all.length === 0) {
        startNewChat('Getting Started with Python 🐍');
      } else {
        setChats(all);
        setActiveChatId(all[0].id);
      }
    });
  }, []);

  const activeChat = chats.find(c => c.id === activeChatId) || (chats.length > 0 ? chats[0] : null);
  const messages = activeChat?.messages || [];

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
  const startNewChat = async (startTitle = 'New Chat') => {
    const chat = await createNewChatBackend(startTitle);
    if (!chat) return;
    setChats(prev => [chat, ...prev]);
    setActiveChatId(chat.id);
    setInput('');
    setAttachedFiles([]);
  };

  const deleteChat = async (id) => {
    try {
      await fetch(`/api/chats/${id}`, { method: 'DELETE' });
      setChats(prev => {
        const next = prev.filter(c => c.id !== id);
        if (next.length === 0) {
          startNewChat('Python Basics');
        }
        return next;
      });
      if (activeChatId === id) {
        setActiveChatId(chats.find(c => c.id !== id)?.id || null);
      }
      setDeleteConfirmId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const startRenameChat = (chat) => {
    setEditingTitle(chat.id);
    setTempTitle(chat.title);
  };

  const confirmRename = async (id) => {
    if (tempTitle.trim()) {
      try {
        await fetch(`/api/chats/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: tempTitle.trim() })
        });
        setChats(prev => prev.map(c => c.id === id ? { ...c, title: tempTitle.trim() } : c));
      } catch (err) {
        console.error(err);
      }
    }
    setEditingTitle(null);
  };

  const autoTitle = (firstUserMsg) => {
    const trimmed = firstUserMsg.trim();
    if (trimmed.length <= 30) return trimmed;
    return trimmed.slice(0, 28) + '…';
  };

  // ── Export helpers ───────────────────────────────────────────────────────────
  // Parse raw message text into code/text segments
  const parseMessageForExport = (text) => {
    const segments = [];
    const codeBlockRegex = /```(\w*)[\r\n]?([\s\S]*?)```/g;
    let lastIdx = 0, match;
    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIdx) segments.push({ type: 'text', content: text.slice(lastIdx, match.index) });
      segments.push({ type: 'code', lang: match[1] || 'code', content: match[2] });
      lastIdx = match.index + match[0].length;
    }
    if (lastIdx < text.length) segments.push({ type: 'text', content: text.slice(lastIdx) });
    return segments;
  };

  // Escape HTML entities
  const escapeHtml = (str) => String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Convert inline markdown (**bold**, *italic*, `code`) → HTML with inline styles
  const inlineMD = (raw, isDark) => {
    const codeBg   = isDark ? '#1e293b' : '#e8edf4';
    const codeFg   = isDark ? '#86efac' : '#15803d';
    const boldFg   = isDark ? '#f1f5f9' : '#0f172a';
    const italicFg = isDark ? '#94a3b8' : '#475569';
    return escapeHtml(raw)
      .replace(/\*\*([^*]+)\*\*/g, `<strong style="color:${boldFg};font-weight:700;">$1</strong>`)
      .replace(/\*([^*]+)\*/g,     `<em style="color:${italicFg};">$1</em>`)
      .replace(/`([^`]+)`/g,       `<code style="background:${codeBg};color:${codeFg};padding:1px 5px;border-radius:3px;font-family:'Courier New',monospace;font-size:11.5px;">$1</code>`);
  };

  // Build a complete self-contained HTML string from raw message text.
  // isDark = true → dark code blocks; false → light (for Word / printing on white)
  const buildExportHTML = (msgText, isDark = true) => {
    const segments = parseMessageForExport(msgText);

    const bgPage     = isDark ? '#0f172a' : '#ffffff';
    const bgCodeOuter = isDark ? '#1e293b' : '#f1f5f9';
    const bgCodeHdr  = isDark ? '#0f172a' : '#e2e8f0';
    const fgCode     = isDark ? '#e2e8f0' : '#1e293b';
    const fgCodeLbl  = isDark ? '#4ade80' : '#16a34a';
    const fgText     = isDark ? '#cbd5e1' : '#1e293b';
    const fgHeading  = isDark ? '#f1f5f9' : '#0f172a';
    const borderCode = isDark ? 'rgba(255,255,255,0.08)' : '#cbd5e1';

    let html = '';
    segments.forEach(seg => {
      if (seg.type === 'code') {
        html += `
          <div style="background:${bgCodeOuter};border-radius:8px;margin:14px 0;border:1px solid ${borderCode};overflow:hidden;">
            <div style="background:${bgCodeHdr};padding:6px 12px;border-bottom:1px solid ${borderCode};">
              <span style="color:${fgCodeLbl};font-size:10px;font-weight:700;font-family:'Courier New',monospace;letter-spacing:0.07em;">${escapeHtml((seg.lang||'code').toUpperCase())}</span>
            </div>
            <pre style="margin:0;padding:14px 13px;color:${fgCode};font-family:'Courier New',Courier,monospace;font-size:12.5px;line-height:1.65;white-space:pre-wrap;word-break:break-word;">${escapeHtml(seg.content)}</pre>
          </div>`;
      } else {
        seg.content.split('\n').forEach(rawLine => {
          const line = rawLine.trimEnd();
          if (!line.trim()) { html += '<div style="height:6px;"></div>'; return; }
          const md = (s) => inlineMD(s, isDark);
          if      (/^### /.test(line)) html += `<h4 style="color:${fgHeading};font-size:13px;font-weight:700;margin:14px 0 3px;font-family:sans-serif;">${md(line.slice(4))}</h4>`;
          else if (/^## /.test(line))  html += `<h3 style="color:${fgHeading};font-size:15px;font-weight:700;margin:16px 0 4px;font-family:sans-serif;">${md(line.slice(3))}</h3>`;
          else if (/^# /.test(line))   html += `<h2 style="color:${fgHeading};font-size:17px;font-weight:700;margin:18px 0 6px;font-family:sans-serif;">${md(line.slice(2))}</h2>`;
          else if (/^[-*•] /.test(line)) html += `<p style="color:${fgText};font-size:12.5px;margin:3px 0 3px 14px;line-height:1.65;font-family:sans-serif;">&bull; ${md(line.replace(/^[-*•] /,''))}</p>`;
          else if (/^\d+\. /.test(line)) html += `<p style="color:${fgText};font-size:12.5px;margin:3px 0 3px 16px;line-height:1.65;font-family:sans-serif;">${md(line)}</p>`;
          else                           html += `<p style="color:${fgText};font-size:12.5px;margin:4px 0;line-height:1.65;font-family:sans-serif;">${md(line)}</p>`;
        });
      }
    });
    return `<div style="background:${bgPage};padding:22px 24px;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">${html}</div>`;
  };

  const downloadAsPDF = (msgText, msgIndex) => {
    if (exportingId !== null) return;
    setExportingId(msgIndex);
    setTimeout(async () => {
      let wrapper = null;
      try {
        const htmlContent = buildExportHTML(msgText, true); // dark theme
        wrapper = document.createElement('div');
        wrapper.innerHTML = htmlContent;
        // Position off-screen but visible to html2canvas (NOT display:none)
        wrapper.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;z-index:-1;';
        document.body.appendChild(wrapper);

        await html2pdf().set({
          margin: [8, 8, 8, 8],
          filename: 'AI_Response.pdf',
          image: { type: 'png', quality: 1 },
          html2canvas: {
            scale: 1.5,
            useCORS: true,
            backgroundColor: '#0f172a',
            logging: false,
            windowWidth: 794,
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        }).from(wrapper).save();
      } catch (err) {
        console.error('PDF export failed:', err);
      } finally {
        if (wrapper && wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
        setExportingId(null);
      }
    }, 60);
  };

  const downloadAsWord = (msgText, msgIndex) => {
    if (exportingId !== null) return;
    setExportingId(`word-${msgIndex}`);
    setTimeout(() => {
      try {
        // For Word use dark code blocks but white page background so it prints on white paper too
        const bodyHTML = buildExportHTML(msgText, true);
        const docHTML = `<html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'
          xmlns='http://www.w3.org/TR/REC-html40'>
          <head><meta charset='utf-8'><title>AI Response</title></head>
          <body style="font-family:'Segoe UI',Arial,sans-serif;margin:0;padding:0;">${bodyHTML}</body>
        </html>`;
        const blob = new Blob([docHTML], { type: 'application/vnd.ms-word;charset=utf-8' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url; a.download = 'AI_Response.doc';
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Word export failed:', err);
      } finally {
        setExportingId(null);
      }
    }, 60);
  };

  // (kept for legacy use in Word export — inlineMarkdownToHTML alias)
  const inlineMarkdownToHTML = (text) => inlineMD(text, false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('chatId', activeChatId);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      
      setAttachedFiles(prev => [...prev, data]);
    } catch (err) {
      alert(`Upload Error: ${err.message}`);
    } finally {
      setUploading(false);
      e.target.value = null; // reset
    }
  };

  const removeAttachment = (filename) => {
    setAttachedFiles(prev => prev.filter(f => f.filename !== filename));
  };

  // ── Send message ──────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (textToSend = input) => {
    if ((!textToSend.trim() && attachedFiles.length === 0) || loading || !activeChatId) return;
    
    setInput('');
    setLoading(true);

    const userMsg = { role: 'user', text: textToSend };
    const updatedMessages = [...messages, userMsg];
    
    // Optimistic UI
    setChats(prev => prev.map(c => {
      if (c.id !== activeChatId) return c;
      const newTitle = c.messages.filter(m => m.role === 'user').length === 0
        ? autoTitle(textToSend)
        : c.title;
      return { ...c, title: newTitle, messages: updatedMessages };
    }));

    try {
      // Send to backend
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: activeChatId,
          text: textToSend,
          images: attachedFiles.filter(f => f.type === 'image').map(f => f.filename)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');

      setChats(prev => prev.map(c =>
        c.id === activeChatId
          ? { ...c, messages: [...updatedMessages, { role: 'model', text: data.text }] }
          : c
      ));
      
      // Clear attachments after successful send
      setAttachedFiles([]);
    } catch (err) {
      setChats(prev => prev.map(c =>
        c.id === activeChatId
          ? { ...c, messages: [...updatedMessages, { role: 'model', text: `⚠️ Error: ${err.message}` }] }
          : c
      ));
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading, activeChatId, attachedFiles]);

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
              <div className={`max-w-[82%] sm:max-w-[72%] ${m.role === 'user' ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
                <div id={`msg-${i}`} className={`rounded-2xl p-4 shadow-sm ${m.role === 'user'
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-sm'
                  : 'bg-slate-800/80 border border-white/5 rounded-tl-sm w-full'
                  }`}>
                  {m.role === 'user'
                    ? <p className="text-sm leading-relaxed">{m.text}</p>
                    : <MessageContent text={m.text} />
                  }
                </div>
                
                {/* Download Actions for AI Messages */}
                {m.role === 'model' && (
                  <div className="flex gap-2 mt-2 px-1">
                    <button
                      onClick={() => downloadAsPDF(m.text, i)}
                      disabled={exportingId !== null}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] sm:text-xs text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 rounded transition-colors border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Download as PDF"
                    >
                      {exportingId === i
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <Download className="w-3 h-3" />}
                      PDF
                    </button>
                    <button
                      onClick={() => downloadAsWord(m.text, i)}
                      disabled={exportingId !== null}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] sm:text-xs text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 rounded transition-colors border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Download as Word"
                    >
                      {exportingId === `word-${i}`
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <FileText className="w-3 h-3" />}
                      Word
                    </button>
                  </div>
                )}
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
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload}
            className="hidden" 
            accept="image/*,.pdf,.doc,.docx,.txt,.md"
          />

          {/* Attached Files Preview */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {attachedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-white/10 rounded-full text-xs">
                  {file.type === 'image' ? <Image className="w-3 h-3 text-blue-400" /> : <File className="w-3 h-3 text-orange-400" />}
                  <span className="text-slate-300 truncate max-w-[150px]">{file.originalName}</span>
                  <button onClick={() => removeAttachment(file.filename)} className="text-slate-500 hover:text-red-400 p-0.5 rounded-full ml-1">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {(!settings || !settings.apiKey) && (
            <div className="mb-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200 text-center">
              ⚠️ No API key set. Go back and open <strong>Settings</strong> to add your Gemini API key so that the backend can use it.
            </div>
          )}
          {retryCountdown > 0 && (
            <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-200 flex items-center justify-between">
              <span>⏱ Quota reached — please wait…</span>
              <span className="font-mono font-bold text-red-300 text-sm">{retryCountdown}s</span>
            </div>
          )}

          <div className="flex gap-3 items-end">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || !activeChatId}
              className="flex-shrink-0 h-12 w-12 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-white/10 flex items-center justify-center transition-all disabled:opacity-40"
              title="Upload image or document"
            >
              {uploading ? <Loader2 className="w-5 h-5 text-slate-400 animate-spin" /> : <Paperclip className="w-5 h-5 text-slate-400" />}
            </button>
            <div className="flex-1 bg-slate-800 border border-white/10 rounded-2xl overflow-hidden focus-within:border-green-500/60 focus-within:ring-1 focus-within:ring-green-500/20 transition-all">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={settings?.apiKey ? 'Ask anything about Python… (Shift+Enter for new line)' : 'Set API key in Settings to chat…'}
                disabled={!settings?.apiKey || loading}
                rows={1}
                className="w-full bg-transparent px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!settings?.apiKey || (!input.trim() && attachedFiles.length === 0) || loading}
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
