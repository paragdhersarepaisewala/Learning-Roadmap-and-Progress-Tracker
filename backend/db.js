const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

function initDb() {
  db.pragma('journal_mode = WAL'); // Better performance

  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS chats (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      chatId TEXT NOT NULL,
      role TEXT NOT NULL,
      text TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(chatId) REFERENCES chats(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      chatId TEXT,
      filename TEXT NOT NULL,
      originalName TEXT NOT NULL,
      text TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(chatId) REFERENCES chats(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS document_chunks (
      id TEXT PRIMARY KEY,
      documentId TEXT NOT NULL,
      chunkIndex INTEGER NOT NULL,
      text TEXT NOT NULL,
      embedding TEXT NOT NULL, -- Storing embedding as JSON string
      FOREIGN KEY(documentId) REFERENCES documents(id) ON DELETE CASCADE
    );
  `);
}

initDb();

function getSetting(key) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? JSON.parse(row.value) : null;
}

function setSetting(key, value) {
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, JSON.stringify(value));
}

function getChats() {
  const chats = db.prepare('SELECT * FROM chats ORDER BY createdAt DESC').all();
  for (let chat of chats) {
    chat.messages = db.prepare('SELECT * FROM messages WHERE chatId = ? ORDER BY createdAt ASC').all(chat.id);
  }
  return chats;
}

function createChat(id, title) {
  db.prepare('INSERT INTO chats (id, title) VALUES (?, ?)').run(id, title);
  return { id, title, messages: [] };
}

function deleteChat(id) {
  db.prepare('DELETE FROM chats WHERE id = ?').run(id);
}

function updateChatTitle(id, title) {
  db.prepare('UPDATE chats SET title = ? WHERE id = ?').run(title, id);
}

function addMessage(id, chatId, role, text) {
  db.prepare('INSERT INTO messages (id, chatId, role, text) VALUES (?, ?, ?, ?)').run(id, chatId, role, text);
}

// RAG Functions
function addDocument(id, chatId, filename, originalName, text) {
  db.prepare('INSERT INTO documents (id, chatId, filename, originalName, text) VALUES (?, ?, ?, ?, ?)').run(id, chatId, filename, originalName, text);
}

function addDocumentChunk(id, documentId, chunkIndex, text, embedding) {
  db.prepare('INSERT INTO document_chunks (id, documentId, chunkIndex, text, embedding) VALUES (?, ?, ?, ?, ?)').run(id, documentId, chunkIndex, text, JSON.stringify(embedding));
}

function getDocumentChunksByChatId(chatId) {
  return db.prepare(`
    SELECT dc.id, dc.text, dc.embedding 
    FROM document_chunks dc
    JOIN documents d ON dc.documentId = d.id
    WHERE d.chatId = ?
  `).all(chatId).map(row => ({
    ...row,
    embedding: JSON.parse(row.embedding)
  }));
}

module.exports = {
  db,
  getSetting,
  setSetting,
  getChats,
  createChat,
  deleteChat,
  updateChatTitle,
  addMessage,
  addDocument,
  addDocumentChunk,
  getDocumentChunksByChatId
};
