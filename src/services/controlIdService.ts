/**
 * controlIdService.ts
 *
 * HTTP client for the Control iD iDFace local REST API.
 * Runs inside Electron where webSecurity: false allows calls to http:// LAN addresses.
 *
 * iDFace API reference (simplified):
 *   POST /add_users.fcgi        – registers a user (name + numeric ID)
 *   POST /remote_enroll.fcgi    – triggers remote facial enrolment on device screen
 *   POST /login.fcgi            – obtains a session cookie if auth is enabled
 */

const DEFAULT_TIMEOUT_MS = 8_000;

interface FetchOptions extends RequestInit {
  timeoutMs?: number;
}

/** Fetch with a configurable timeout */
async function fetchWithTimeout(url: string, options: FetchOptions = {}): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...rest } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...rest, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Optionally authenticate with the device (only needed when API auth is on).
// For demo purposes the iDFace is assumed to have no password.
// ---------------------------------------------------------------------------
async function loginAparelho(ip: string): Promise<string | null> {
  // If the device has no password configured, skip this entirely.
  const login = import.meta.env.VITE_IDFACE_LOGIN ?? 'admin';
  const senha = import.meta.env.VITE_IDFACE_PASSWORD ?? '';
  if (!senha) return null; // No auth configured

  try {
    const res = await fetchWithTimeout(`http://${ip}/login.fcgi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password: senha }),
    });
    const cookie = res.headers.get('set-cookie');
    console.log('[ControlID] login.fcgi status:', res.status);
    return cookie;
  } catch (err) {
    console.warn('[ControlID] login.fcgi failed (assuming no auth):', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Build common headers (with optional session cookie)
// ---------------------------------------------------------------------------
function buildHeaders(cookie?: string | null): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (cookie) headers['Cookie'] = cookie;
  return headers;
}

// ---------------------------------------------------------------------------
// TASK 1 – Register a user on the iDFace device
// ---------------------------------------------------------------------------
export async function cadastrarUsuarioNoAparelho(
  ipAparelho: string,
  alunoIdDigital: number,
  nomeAluno: string,
): Promise<void> {
  const url = `http://${ipAparelho}/add_users.fcgi`;
  const payload = {
    users: [
      { id: alunoIdDigital, name: nomeAluno },
    ],
  };

  console.log(`[ControlID] cadastrarUsuario → ${url}`, payload);

  const cookie = await loginAparelho(ipAparelho);

  const res = await fetchWithTimeout(url, {
    method: 'POST',
    headers: buildHeaders(cookie),
    body: JSON.stringify(payload),
  });

  const text = await res.text().catch(() => '');
  console.log(`[ControlID] add_users.fcgi → ${res.status}`, text);

  if (!res.ok) {
    throw new Error(`add_users.fcgi returned HTTP ${res.status}: ${text}`);
  }
}

// ---------------------------------------------------------------------------
// TASK 2 – Trigger remote facial enrolment on the device screen
// ---------------------------------------------------------------------------
export async function iniciarCapturaFacial(
  ipAparelho: string,
  alunoIdDigital: number,
): Promise<void> {
  const url = `http://${ipAparelho}/remote_enroll.fcgi`;
  const payload = {
    type: 'face',
    user_id: alunoIdDigital,
    save: true,
  };

  console.log(`[ControlID] iniciarCapturaFacial → ${url}`, payload);

  const cookie = await loginAparelho(ipAparelho);

  const res = await fetchWithTimeout(url, {
    method: 'POST',
    headers: buildHeaders(cookie),
    body: JSON.stringify(payload),
  });

  const text = await res.text().catch(() => '');
  console.log(`[ControlID] remote_enroll.fcgi → ${res.status}`, text);

  if (!res.ok) {
    throw new Error(`remote_enroll.fcgi returned HTTP ${res.status}: ${text}`);
  }
}

// ---------------------------------------------------------------------------
// Utility: derive a stable numeric ID from a UUID string
// (uses last 5 hex digits → max 1 048 575, fits in iDFace id range)
// ---------------------------------------------------------------------------
export function uuidToNumericId(uuid: string): number {
  const hex = uuid.replace(/-/g, '').slice(-6);
  return parseInt(hex, 16) % 100_000 || Date.now() % 100_000;
}
