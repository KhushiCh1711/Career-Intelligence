const API_URL = import.meta.env.VITE_API_URL || "/api";

// Access token lives only in memory (module-level variable) — never localStorage/sessionStorage,
// matching the two-token pattern the backend issues.
let accessToken = null;
export function setAccessToken(token) { accessToken = token; }
export function getAccessToken() { return accessToken; }

// Wraps every call: on a 401, tries one silent refresh, then retries the original request once.
async function rawRequest(path, options = {}) {
  try {
    const headers = new Headers(options.headers || {});
    if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

    return await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      credentials: "include",
    });
  } catch {
    throw new Error("Cannot reach the server. Is the API running on port 4000?");
  }
}

async function request(path, options = {}, retry = true) {
  const res = await rawRequest(path, options);
  if (res.status === 401 && retry) {
    const refreshedUser = await refreshSession();
    if (refreshedUser) return request(path, options, false);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export async function refreshSession() {
  try {
    const res = await rawRequest("/auth/refresh", { method: "POST" });
    if (!res.ok) return null;
    const data = await res.json();
    setAccessToken(data.accessToken);
    return data.user;
  } catch {
    return null;
  }
}

export const api = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, body) => request(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: (path, body) => request(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
};

export async function login(username, password) {
  const data = await request("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) });
  setAccessToken(data.accessToken);
  return data.user;
}
export async function register(profile) {
  const data = await request("/auth/register", { method: "POST", body: JSON.stringify(profile) });
  setAccessToken(data.accessToken);
  return data.user;
}
export async function logout() {
  await request("/auth/logout", { method: "POST" });
  setAccessToken(null);
}
