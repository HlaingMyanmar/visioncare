import axios from 'axios';
import Swal from 'sweetalert2';
import { ApiResponse, AuthResponse, User } from '../types';

const joinUrl = (base: string, path: string) =>
  `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;

const inferBackendOrigin = () => {
  if (typeof window === 'undefined') return 'http://localhost:8080';
  const protocol = window.location.protocol;
  const hostname = window.location.hostname || 'localhost';
  const backendPort = (import.meta.env.VITE_BACKEND_PORT || '8080').toString();
  return `${protocol}//${hostname}:${backendPort}`;
};

const backendOrigin = inferBackendOrigin();
const defaultApiBase = import.meta.env.DEV ? '/api' : joinUrl(backendOrigin, 'api');
const defaultWsUrl = import.meta.env.DEV ? '/ws-clinic' : joinUrl(backendOrigin, 'ws-clinic');

export const BASE_URL = (import.meta.env.VITE_API_BASE_URL || defaultApiBase).toString();
export const WS_URL = (import.meta.env.VITE_WS_URL || defaultWsUrl).toString();

let accessToken: string | null = sessionStorage.getItem('visioncare_token');

export const getAccessToken = () => accessToken;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) sessionStorage.setItem('visioncare_token', token);
  else sessionStorage.removeItem('visioncare_token');
};

export const getStoredUser = (): User | null => {
  const raw = sessionStorage.getItem('visioncare_user');
  if (!raw) return null;
  try { return JSON.parse(raw) as User; } catch { return null; }
};

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      setAccessToken(null);
      sessionStorage.removeItem('visioncare_user');
      Swal.fire({ icon: 'warning', title: 'Session expired', text: 'Please sign in again.' })
        .then(() => { window.location.hash = '#/login'; });
    }
    return Promise.reject(error.response?.data || { success: false, message: error.message });
  }
);

export const authService = {
  login: async (usernameOremail: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post<any, ApiResponse<AuthResponse>>('/v1/auth/login', { usernameOremail, password });
    if (response.success) {
      setAccessToken(response.data.accessToken);
      sessionStorage.setItem('visioncare_user', JSON.stringify({
        username: response.data.username,
        roles: response.data.roles || [],
        permissions: response.data.permissions || []
      }));
    }
    return response;
  },
  logout: () => {
    setAccessToken(null);
    sessionStorage.removeItem('visioncare_user');
  }
};


export const companySettingsService = {
  getSettings: async (): Promise<ApiResponse<import('../types').CompanySettingsDTO>> =>
    api.get<any, ApiResponse<import('../types').CompanySettingsDTO>>('/v1/company-settings'),
  saveSettings: async (payload: import('../types').CompanySettingsDTO): Promise<ApiResponse<import('../types').CompanySettingsDTO>> =>
    api.post<any, ApiResponse<import('../types').CompanySettingsDTO>>('/v1/company-settings', payload)
};

export const voucherPrintSettingsService = {
  getSettings: async (): Promise<ApiResponse<import('../types').VoucherPrintSettingsDTO>> =>
    api.get<any, ApiResponse<import('../types').VoucherPrintSettingsDTO>>('/v1/voucher-print-settings'),
  saveSettings: async (payload: import('../types').VoucherPrintSettingsDTO): Promise<ApiResponse<import('../types').VoucherPrintSettingsDTO>> =>
    api.post<any, ApiResponse<import('../types').VoucherPrintSettingsDTO>>('/v1/voucher-print-settings', payload),
  resetSettings: async (): Promise<ApiResponse<import('../types').VoucherPrintSettingsDTO>> =>
    api.post<any, ApiResponse<import('../types').VoucherPrintSettingsDTO>>('/v1/voucher-print-settings/reset')
};
