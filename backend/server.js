/**
 * AgenticDev — Cloud Backend
 * 
 * - Serves the compiled React frontend as static files
 * - Provides REST API for resources (Firestore-backed)
 * - Admin routes protected by ADMIN_SECRET env var
 * - Chat history, API keys, and progress stay in the browser (localStorage)
 */

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { v4: uuidv4 } = require('uuid');
const fs      = require('fs');
const db      = require('./db');
const multer  = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { generateContent, generateEmbeddings, cosineSimilarity } = require('./gemini');

let localConfig = {};
try {
  localConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
} catch(e) {
  // Ignore, running via env vars
}

// ─── File Upload Setup ────────────────────────────────────────────────────────
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}
// Using diskStorage to retain extensions for mime types check if needed
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR)
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext)
  }
});
const upload = multer({ storage: storage });

// ─── Express Setup ────────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ─── Admin Auth Middleware ────────────────────────────────────────────────────
const ADMIN_SECRET = process.env.ADMIN_SECRET || localConfig.ADMIN_SECRET || '';

function requireAdmin(req, res, next) {
  if (!ADMIN_SECRET) {
    return res.status(503).json({ error: 'Admin access not configured on this server.' });
  }
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (token !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized — invalid admin secret.' });
  }
  next();
}

// ─── Chat History API Routes ──────────────────────────────────────────────────
app.get('/api/chats', (req, res) => {
  try {
    const chats = db.getChats();
    res.json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/chats', (req, res) => {
  try {
    const { title } = req.body;
    const id = 'chat_' + Date.now();
    const chat = db.createChat(id, title || 'New Chat');
    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/chats/:id', (req, res) => {
  try {
    db.deleteChat(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/chats/:id', (req, res) => {
  try {
    const { title } = req.body;
    db.updateChatTitle(req.params.id, title);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Settings API Route
app.get('/api/settings', (req, res) => {
  res.json(db.getSetting('app_settings') || {});
});

app.post('/api/settings', (req, res) => {
  db.setSetting('app_settings', req.body);
  res.json({ ok: true });
});

// ─── Document Upload API (RAG) ────────────────────────────────────────────────
function chunkText(text, maxChars = 2000) {
  const chunks = [];
  let current = 0;
  while (current < text.length) {
    chunks.push(text.slice(current, current + maxChars));
    current += maxChars;
  }
  return chunks;
}

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const { chatId } = req.body;
    if (!chatId) return res.status(400).json({ error: 'chatId is required' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const fileExt = path.extname(req.file.originalname).toLowerCase();
    const filePath = req.file.path;
    let extractedText = '';

    // Extract text based on file type
    if (fileExt === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      extractedText = data.text;
    } else if (fileExt === '.docx') {
      const data = await mammoth.extractRawText({ path: filePath });
      extractedText = data.value;
    } else if (['.txt', '.md', '.csv', '.json'].includes(fileExt)) {
      extractedText = fs.readFileSync(filePath, 'utf8');
    } else {
      // It might be an image, so we just return the file info, no text extraction
      return res.json({ 
        id: req.file.filename,
        originalName: req.file.originalname,
        filename: req.file.filename,
        type: 'image' 
      });
    }

    if (!extractedText.trim()) {
      return res.status(400).json({ error: 'Could not extract text from document.' });
    }

    // Process Document for RAG
    const settings = db.getSetting('app_settings');
    const docId = 'doc_' + Date.now();
    db.addDocument(docId, chatId, req.file.filename, req.file.originalname, extractedText);

    // Chunk and embed
    const chunks = chunkText(extractedText);
    const embeddings = await generateEmbeddings(settings, chunks);

    chunks.forEach((chunk, idx) => {
      db.addDocumentChunk('chunk_' + uuidv4(), docId, idx, chunk, embeddings[idx]);
    });

    res.json({
      id: docId,
      originalName: req.file.originalname,
      filename: req.file.filename,
      type: 'document',
      chunks: chunks.length
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Gemini Chat Endpoint with RAG & Multimodal ───────────────────────────────
function fileToGenerativePart(filename) {
  const filePath = path.join(UPLOAD_DIR, filename);
  const ext = path.extname(filename).toLowerCase();
  let mimeType = 'image/jpeg';
  if (ext === '.png') mimeType = 'image/png';
  if (ext === '.webp') mimeType = 'image/webp';
  if (ext === '.heic') mimeType = 'image/heic';
  
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString('base64'),
      mimeType
    }
  };
}

app.post('/api/chat/message', async (req, res) => {
  try {
    const { chatId, text, images } = req.body;
    const settings = db.getSetting('app_settings');
    if (!settings?.apiKey) {
      return res.status(400).json({ error: 'No API configuration set. Please update settings.' });
    }

    // Save User Message
    const userMsgId = 'msg_' + Date.now();
    db.addMessage(userMsgId, chatId, 'user', text);

    // Context Generation (RAG)
    let contextStr = '';
    const docs = db.getDocumentChunksByChatId(chatId);
    if (docs && docs.length > 0) {
      // Create embedding query
      const queryEmbed = await generateEmbeddings(settings, [text]);
      const targetVec = queryEmbed[0];
      
      // Calculate scores
      const scoredChunks = docs.map(doc => {
        return {
          text: doc.text,
          score: cosineSimilarity(targetVec, doc.embedding)
        };
      });

      // Top 3 chunks
      scoredChunks.sort((a, b) => b.score - a.score);
      const topChunks = scoredChunks.slice(0, 3);
      if (topChunks.length > 0) {
        contextStr = 'Context Documents:\\n' + topChunks.map((c, i) => `[Doc ${i}]: ${c.text}`).join('\\n\\n') + '\\n\\n';
      }
    }

    // Construct history for Gemini
    const chats = db.getChats().find(c => c.id === chatId);
    const messages = chats ? chats.messages : [];
    
    // We'll take the last 10 messages for context window + system prompt
    const recentMessages = messages.slice(-10);

    const apiContents = [
      { role: 'user', parts: [{ text: 'You are a helpful programming tutor. Be clear and conversational. Here is some document context you may optionally use to answer: ' + contextStr }] },
      { role: 'model', parts: [{ text: 'Understood.' }] }
    ];

    for (let msg of recentMessages) {
      if (msg.role === 'user') {
        const parts = [{ text: msg.text }];
        // Append images if it's the latest user message
        if (msg.id === userMsgId && images && images.length > 0) {
          images.forEach(imgFilename => {
            parts.push(fileToGenerativePart(imgFilename));
          });
        }
        apiContents.push({ role: 'user', parts });
      } else {
        apiContents.push({ role: 'model', parts: [{ text: msg.text }] });
      }
    }

    const reply = await generateContent(settings, apiContents);
    
    // Save Model Message
    const modelMsgId = 'msg_' + (Date.now() + 1);
    db.addMessage(modelMsgId, chatId, 'model', reply);

    res.json({ role: 'model', text: reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Serve Static Frontend ────────────────────────────────────────────────────
const staticDir = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(staticDir));

// SPA fallback — all non-API routes serve index.html
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(staticDir, 'index.html'));
});

// ─── Start ────────────────────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 AgenticDev backend running on port ${PORT}`);
    console.log(`   Admin: ${ADMIN_SECRET ? '✅ secret configured' : '⚠️  no secret set'}`);
    console.log(`   DB:    ✅ SQLite Native DataStore`);
  });
}

module.exports = app;
