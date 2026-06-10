/**
 * 友愛教室 V2 — sync.js
 * Cloud sync + offline detection
 *
 * Usage:
 *   import { initSync, syncNow, getSyncStatus, setTeacherToken } from './sync.js';
 *
 *   initSync();                      // auto-sync on page load
 *   syncNow(studentName, progress);  // called after saveProgress
 */

import { bus } from './domain/EventBus.js';

// ── Config ──────────────────────────────────────────────────────────────────
// In production, point this at your deployed backend URL.
// Local dev: http://localhost:8000
const API_BASE = (() => {
  // Auto-detect: in dev (port 5173), use localhost:8000
  // in production (gh-pages / Tailscale), use your backend URL
  if (window.location.hostname === 'localhost' && window.location.port === '5173') {
    return 'http://localhost:8000';
  }
  // Override via env — set VITE_API_URL in .env
  return import.meta.env.VITE_API_URL || 'http://localhost:8000';
})();

// ── State ───────────────────────────────────────────────────────────────────
let teacherToken = localStorage.getItem('fc_teacher_token') || null;
let teacherTokenExpiry = parseInt(localStorage.getItem('fc_teacher_expiry') || '0', 10);
let isOnline = navigator.onLine;
let lastSyncStatus = 'idle'; // idle | syncing | ok | error | offline
let lastSyncTime = null;

// ── Device ID (stable per browser) ──────────────────────────────────────────
const DEVICE_ID_KEY = 'fc_device_id';
function getDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = 'device_' + Math.random().toString(36).slice(2) + '_' + Date.now();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

// ── Online/Offline detection ─────────────────────────────────────────────────
window.addEventListener('online', () => {
  isOnline = true;
  bus.emit('sync:status', { status: 'online' });
  // Retry any pending syncs
  retryPendingSync();
});

window.addEventListener('offline', () => {
  isOnline = false;
  lastSyncStatus = 'offline';
  bus.emit('sync:status', { status: 'offline' });
});

// ── API helpers ──────────────────────────────────────────────────────────────
async function apiCall(method, path, body, opts = {}) {
  const url = API_BASE + path;
  const headers = { 'Content-Type': 'application/json', ...opts.headers };
  if (teacherToken) headers['X-Teacher-Token'] = teacherToken;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(8000), // 8s timeout
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Sync student progress ─────────────────────────────────────────────────────
/**
 * Sync a student's progress to the cloud backend.
 * Non-blocking — fails silently and queues for retry.
 */
export async function syncNow(studentName, progress) {
  if (!isOnline) {
    lastSyncStatus = 'offline';
    bus.emit('sync:status', { status: 'offline' });
    return { ok: false, reason: 'offline' };
  }

  lastSyncStatus = 'syncing';
  bus.emit('sync:status', { status: 'syncing', student: studentName });

  try {
    const result = await apiCall('POST', '/api/sync', {
      name: studentName,
      completedScenarios: progress.completedScenarios || [],
      topicProgress: progress.topicProgress || {},
      subjectProgress: progress.subjectProgress || {},
      totalMoralScore: progress.totalMoralScore || 0,
      lastPlayed: progress.lastPlayed,
      deviceId: getDeviceId(),
    });

    lastSyncStatus = 'ok';
    lastSyncTime = new Date().toISOString();
    bus.emit('sync:status', {
      status: 'ok',
      student: studentName,
      lastSynced: lastSyncTime,
    });

    // Persist sync time to localStorage
    localStorage.setItem(`fc_last_sync_${studentName}`, lastSyncTime);

    return { ok: true, lastSynced: lastSyncTime };
  } catch (e) {
    lastSyncStatus = 'error';
    bus.emit('sync:status', {
      status: 'error',
      student: studentName,
      error: e.message,
    });
    console.warn('[Sync] Failed:', e.message);
    return { ok: false, reason: e.message };
  }
}

// ── Retry pending sync ───────────────────────────────────────────────────────
let pendingSync = null;

function retryPendingSync() {
  if (pendingSync) {
    syncNow(pendingSync.name, pendingSync.progress);
    pendingSync = null;
  }
}

// ── Teacher auth ─────────────────────────────────────────────────────────────
export function isTeacherLoggedIn() {
  if (!teacherToken) return false;
  if (Date.now() > teacherTokenExpiry) {
    clearTeacherSession();
    return false;
  }
  return true;
}

function clearTeacherSession() {
  teacherToken = null;
  teacherTokenExpiry = 0;
  localStorage.removeItem('fc_teacher_token');
  localStorage.removeItem('fc_teacher_expiry');
}

export async function teacherLogin(password) {
  const result = await apiCall('POST', '/api/teacher/login', { password });
  teacherToken = result.token;
  teacherTokenExpiry = Date.now() + (result.expiresIn * 1000);
  localStorage.setItem('fc_teacher_token', teacherToken);
  localStorage.setItem('fc_teacher_expiry', String(teacherTokenExpiry));
  return result;
}

export async function teacherLogout() {
  if (teacherToken) {
    try {
      await apiCall('POST', '/api/teacher/logout', null);
    } catch (_) {}
  }
  clearTeacherSession();
}

// ── Teacher: fetch all students ───────────────────────────────────────────────
export async function fetchAllStudents() {
  if (!isTeacherLoggedIn()) throw new Error('Not logged in');
  return apiCall('GET', '/api/teacher/students');
}

export async function deleteStudent(name) {
  if (!isTeacherLoggedIn()) throw new Error('Not logged in');
  return apiCall('DELETE', `/api/teacher/students/${encodeURIComponent(name)}`);
}

export async function exportAllStudents() {
  if (!isTeacherLoggedIn()) throw new Error('Not logged in');
  const res = await fetch(API_BASE + '/api/teacher/export', {
    headers: { 'X-Teacher-Token': teacherToken },
  });
  if (!res.ok) throw new Error('Export failed');
  return res.json();
}

// ── Status helpers ────────────────────────────────────────────────────────────
export function getSyncStatus() {
  return {
    status: lastSyncStatus,
    isOnline,
    lastSyncTime,
    teacherLoggedIn: isTeacherLoggedIn(),
  };
}

export function getLastSyncTime(studentName) {
  return localStorage.getItem(`fc_last_sync_${studentName}`) || null;
}

// ── Init: try to sync on page load ────────────────────────────────────────────
export function initSync(studentName, progress) {
  if (isOnline && studentName && progress) {
    // Give other loaders a moment, then sync
    setTimeout(() => syncNow(studentName, progress), 500);
  }
}

// ── Queue sync (call this instead of syncNow when you want to defer) ──────────
export function queueSync(studentName, progress) {
  pendingSync = { name: studentName, progress };
  if (isOnline) {
    syncNow(studentName, progress);
  }
}