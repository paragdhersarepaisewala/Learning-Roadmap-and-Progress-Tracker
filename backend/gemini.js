const fetch = require('node-fetch'); // we'll use native fetch if node >= 18 or install node-fetch if < 18 (Node 18+ has global fetch)

async function generateContent(settings, contents) {
  const { provider, apiKey, model, projectId, region } = settings || {};
  const activeModel = model || 'gemini-2.0-flash-lite';

  if (!apiKey) throw new Error('No API key configured.');

  let url;
  const headers = { 'Content-Type': 'application/json' };

  if (provider === 'vertex') {
    if (!projectId) throw new Error('Vertex AI requires a Project ID.');
    const loc = region || 'us-central1';
    url = `https://${loc}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${loc}/publishers/google/models/${activeModel}:generateContent`;
    const isAccessToken = apiKey.startsWith('ya29.') || apiKey.startsWith('AQ.');
    if (isAccessToken) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else {
      url += `?key=${apiKey}`;
    }
  } else {
    url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ contents }),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || `HTTP ${res.status}: ${res.statusText}`);
  }

  const candidate = data.candidates?.[0];
  if (!candidate) throw new Error('Empty response from API.');
  return candidate.content.parts[0].text;
}

async function generateEmbeddings(settings, texts) {
  const { provider, apiKey, projectId, region } = settings || {};
  if (!apiKey) throw new Error('No API key configured.');

  let url;
  const headers = { 'Content-Type': 'application/json' };

  if (provider === 'vertex') {
    const loc = region || 'us-central1';
    url = `https://${loc}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${loc}/publishers/google/models/text-embedding-004:batchEmbedText`;
    const isAccessToken = apiKey.startsWith('ya29.') || apiKey.startsWith('AQ.');
    if (isAccessToken) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else {
      url += `?key=${apiKey}`;
    }
  } else {
    // Generate content vs embed content differ
    url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:batchEmbedText?key=${apiKey}`;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      requests: texts.map(text => ({
        model: 'models/text-embedding-004',
        text: text,
      }))
    })
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(data.error?.message || `HTTP ${res.status}: ${res.statusText}`);
  }

  return data.embeddings.map(e => e.values);
}

// Cosine similarity
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = {
  generateContent,
  generateEmbeddings,
  cosineSimilarity
};
