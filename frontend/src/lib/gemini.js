/**
 * gemini.js — Universal Gemini API client
 * Supports:
 *   - Google AI Studio (generativelanguage.googleapis.com)
 *   - Google Cloud Vertex AI (aiplatform.googleapis.com)
 *
 * settings shape:
 *   { provider, apiKey, model, projectId, region }
 *   provider: 'ai_studio' | 'vertex'
 *   apiKey:   AI Studio key (AIza...) OR Vertex access token (ya29.* / AQ.*)
 */

export async function generateContent(settings, contents) {
  const { provider, apiKey, model, projectId, region } = settings || {};
  const activeModel = model || 'gemini-2.0-flash-lite';

  if (!apiKey) throw new Error('No API key or access token configured. Open ⚙ Settings to add one.');

  let url;
  const headers = { 'Content-Type': 'application/json' };

  if (provider === 'vertex') {
    // ── Vertex AI ──────────────────────────────────────────────────────────
    if (!projectId) throw new Error('Vertex AI requires a Project ID. Open ⚙ Settings.');
    const loc = region || 'us-central1';

    // Vertex REST endpoint (v1)
    url = `https://${loc}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${loc}/publishers/google/models/${activeModel}:generateContent`;

    // Detect token type: access tokens (OAuth2) start with ya29. or AQ.
    // Standard GCP service-account API keys start with AIza but rarely work for Vertex.
    const isAccessToken = apiKey.startsWith('ya29.') || apiKey.startsWith('AQ.');
    if (isAccessToken) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else {
      // Might be a GCP API key — append as query param (limited use case)
      url += `?key=${apiKey}`;
    }
  } else {
    // ── Google AI Studio ───────────────────────────────────────────────────
    url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`;
  }

  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ contents }),
    });
  } catch (networkErr) {
    const e = new Error(`Network error: ${networkErr.message}. Check internet or CORS (Vertex tokens can't be used from the browser directly).`);
    throw e;
  }

  const data = await res.json();

  if (!res.ok || data.error) {
    const msg = data.error?.message || `HTTP ${res.status}: ${res.statusText}`;
    const retryMatch = msg.match(/(\d+(\.\d+)?)s/);
    const retrySeconds = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : 0;
    const isQuota = res.status === 429 || msg.toLowerCase().includes('quota');
    const isCors = res.status === 403 && data.error?.status === 'PERMISSION_DENIED';
    const isDeprecated = msg.toLowerCase().includes('no longer available') || msg.toLowerCase().includes('deprecated');

    let friendlyMsg = msg;
    if (isDeprecated) {
      friendlyMsg = `Model "${activeModel}" is no longer available.\n\nOpen ⚙ Settings → click "Fetch live models from API" to see all currently available models, then select a working one (e.g. gemini-2.0-flash).`;
    } else if (isQuota && retrySeconds > 0) {
      friendlyMsg = `Rate limit hit. Retry in ${retrySeconds}s, or switch to a different model in ⚙ Settings.`;
    } else if (isQuota) {
      friendlyMsg = `Quota exceeded.\n\nFor AI Studio keys:\n• Free tier may not be available in your region (UK/EU). Add billing at console.cloud.google.com.\n• Or switch to gemini-2.0-flash-lite which has higher free limits.\n\nFor Vertex tokens:\n• Access tokens expire after ~1 hour. Get a fresh one:\n  gcloud auth print-access-token`;
    } else if (isCors || res.status === 403) {
      friendlyMsg = provider === 'vertex'
        ? `Vertex AI permission denied.\n\nAccess tokens (AQ.* / ya29.*) usually can NOT be used from a browser due to CORS restrictions.\n\nSolution: Use AI Studio key instead, or deploy a backend proxy.\n\nAlternatively, use the AI Studio provider with your Google account.`
        : `API key not authorized.\n\nCheck that your key has Generative Language API enabled at:\nhttps://console.cloud.google.com/apis/library/generativelanguage.googleapis.com`;
    }

    const err = new Error(friendlyMsg);
    err.retrySeconds = retrySeconds;
    err.status = res.status;
    err.raw = msg;
    throw err;
  }

  // Both Vertex and AI Studio return the same candidate structure
  const candidate = data.candidates?.[0];
  if (!candidate) throw new Error('Empty response from API — no candidates returned.');
  return candidate.content.parts[0].text;
}
