interface RuntimeConfig {
  VITE_API_URL?: string;
  VITE_N8N_URL?: string;
}

function getRuntimeConfig(): RuntimeConfig {
  return window.__SPACE_MISSIONS_CONFIG__ ?? {};
}

export const API_URL =
  getRuntimeConfig().VITE_API_URL ??
  import.meta.env.VITE_API_URL ??
  "http://localhost:3001";

export const N8N_URL =
  getRuntimeConfig().VITE_N8N_URL ??
  import.meta.env.VITE_N8N_URL ??
  "http://localhost:5678";
