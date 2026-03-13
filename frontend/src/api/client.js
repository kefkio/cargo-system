const API_BASE = import.meta.env.VITE_API_URL;

/* ---------------- SAFE JSON PARSER ---------------- */

async function parseResponse(res) {
  const contentType = res.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    return await res.json();
  }

  const text = await res.text();
  return text ? { detail: text } : {};
}

/* ---------------- REFRESH TOKEN ---------------- */

async function refreshAccessToken() {
  const refresh = localStorage.getItem("refresh");

  if (!refresh) return null;

  const res = await fetch(`${API_BASE}/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  const data = await parseResponse(res);

  if (!res.ok) {
    localStorage.clear();
    return null;
  }

  localStorage.setItem("access", data.access);
  return data.access;
}

/* ---------------- MAIN API CLIENT ---------------- */

export async function apiRequest(endpoint, options = {}) {
  let access = localStorage.getItem("access");

  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(access && { Authorization: `Bearer ${access}` }),
    },
  };

  let res = await fetch(`${API_BASE}${endpoint}`, config);

  /* ---------------- TOKEN EXPIRED ---------------- */

  if (res.status === 401) {
    const newToken = await refreshAccessToken();

    if (newToken) {
      config.headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE}${endpoint}`, config);
    }
  }

  const data = await parseResponse(res);

  if (!res.ok) {
    throw new Error(data.detail || data.error || "Request failed");
  }

  return data;
}