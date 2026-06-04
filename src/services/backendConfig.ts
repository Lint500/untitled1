const DEFAULT_BACKEND_ORIGIN = 'http://localhost:8000';
const DEFAULT_API_BASE = '/api';
const DEFAULT_WS_BASE = '/ws';

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

const ensureLeadingSlash = (value: string): string => (value.startsWith('/') ? value : `/${value}`);

const isAbsoluteUrl = (value: string): boolean => /^[a-z][a-z\d+.-]*:\/\//i.test(value);

const isDevServer = (): boolean => import.meta.env.DEV;

const backendOrigin = trimTrailingSlash(
  import.meta.env.VITE_BACKEND_ORIGIN || DEFAULT_BACKEND_ORIGIN,
);

const joinBaseAndPath = (base: string, path: string): string => {
  if (!path) return base;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
};

const resolveHttpBase = (): string => {
  const configuredBase = trimTrailingSlash(import.meta.env.VITE_API_BASE || DEFAULT_API_BASE);
  if (isAbsoluteUrl(configuredBase)) {
    return configuredBase;
  }
  if (isDevServer()) {
    return configuredBase || DEFAULT_API_BASE;
  }
  return joinBaseAndPath(backendOrigin, configuredBase || DEFAULT_API_BASE);
};

const resolveWsBase = (): string => {
  const configuredBase = trimTrailingSlash(import.meta.env.VITE_WS_BASE || DEFAULT_WS_BASE);
  if (isAbsoluteUrl(configuredBase)) {
    return configuredBase;
  }
  if (isDevServer()) {
    const browserWsOrigin = window.location.origin.replace(/^http/i, 'ws');
    return joinBaseAndPath(browserWsOrigin, configuredBase || DEFAULT_WS_BASE);
  }

  const wsOrigin = backendOrigin.replace(/^http/i, 'ws');
  return joinBaseAndPath(wsOrigin, configuredBase || DEFAULT_WS_BASE);
};

export const BACKEND_ORIGIN = backendOrigin;
export const API_BASE_URL = resolveHttpBase();
export const WS_BASE_URL = resolveWsBase();

export function buildApiUrl(path: string): string {
  if (!path) return API_BASE_URL;
  if (isAbsoluteUrl(path)) return path;
  return `${API_BASE_URL}${ensureLeadingSlash(path)}`;
}

export function buildWsUrl(path: string): string {
  if (!path) return WS_BASE_URL;
  if (isAbsoluteUrl(path)) return path;
  return `${WS_BASE_URL}${ensureLeadingSlash(path)}`;
}
