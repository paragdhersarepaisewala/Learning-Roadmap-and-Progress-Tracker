/**
 * API client — talks to the backend for shared resources.
 * In dev mode (localhost:5173), requests proxy to localhost:8080.
 * In production, the frontend is served by the same Express server.
 */

const BASE = '/api';

// ─── Resources (public read, admin write) ─────────────────────────────────────

export async function fetchResources() {
  const res = await fetch(`${BASE}/resources`);
  if (!res.ok) throw new Error(`Failed to fetch resources: ${res.status}`);
  return res.json();
}

export async function createResource(data, adminSecret) {
  const res = await fetch(`${BASE}/resources`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminSecret}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function updateResource(id, data, adminSecret) {
  const res = await fetch(`${BASE}/resources/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminSecret}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function deleteResource(id, adminSecret) {
  const res = await fetch(`${BASE}/resources/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminSecret}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Admin helpers (session-only storage) ────────────────────────────────────

export function getAdminSecret() {
  return sessionStorage.getItem('admin_secret') || '';
}

export function setAdminSecret(secret) {
  if (secret) sessionStorage.setItem('admin_secret', secret);
  else sessionStorage.removeItem('admin_secret');
}

export function isAdmin() {
  return !!getAdminSecret();
}
