import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('divyasetu_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Authentication endpoints
export const authApi = {
  login: (data: { mobile: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// Devices endpoints
export const deviceApi = {
  list: (params?: { lat?: number; lng?: number; radius?: number }) =>
    api.get('/devices', { params }),
  myDevices: () => api.get('/devices/my'),
  pendingInspection: () => api.get('/devices/pending-inspection'),
  track: (identifier: string | number) => api.get(`/devices/track/${identifier}`),
  getMatches: (id: number) => api.get(`/devices/${id}/matches`),
  create: (data: {
    serial: string;
    typeId: number;
    condition: string;
    description: string;
    lat?: number;
    lng?: number;
    imageUrl?: string | null;
  }) => api.post('/devices', data),
};

// Needs endpoints
export const needApi = {
  list: () => api.get('/needs'),
  myNeeds: () => api.get('/needs/my'),
  track: (id: number) => api.get(`/needs/track/${id}`),
  create: (data: {
    category: string;
    urgencyHours?: number;
    lat?: number;
    lng?: number;
    monthlyIncome?: number;
  }) => api.post('/needs', data),
};

// Matches endpoints
export const matchApi = {
  generate: (needId: number, limit?: number) =>
    api.post('/matches/generate', { needId, limit }),
  forNeed: (needId: number) => api.get(`/matches/for-need/${needId}`),
  accept: (id: number) => api.post(`/matches/${id}/accept`),
};

// Certifications endpoints
export const certApi = {
  list: (status: 'PENDING' | 'SAFE' | 'NOT_SAFE' = 'PENDING') =>
    api.get('/certifications', { params: { status } }),
  certify: (data: {
    deviceId: number;
    verdict: 'SAFE' | 'NOT_SAFE' | 'PENDING';
    notes?: string;
    certificateRef?: string;
  }) => api.post('/certifications', data),
};

// Transfers endpoints
export const transferApi = {
  create: (data: {
    matchId: number;
    pickupAddr: string;
    dropoffAddr: string;
    costPaisa?: number;
  }) => api.post('/transfers', data),
  deliver: (id: number) => api.post(`/transfers/${id}/deliver`),
  feedback: (
    id: number,
    data: { rating: number; notes?: string; reListIntent?: boolean }
  ) => api.post(`/transfers/${id}/feedback`, data),
};

// Reports & Admin endpoints
export const reportApi = {
  overview: () => api.get('/reports/overview'),
  districtAggregate: () => api.get('/reports/district-aggregate'),
  auditLog: () => api.get('/reports/audit-log'),
};

// AI assistant endpoint
export const aiApi = {
  ask: (question: string) => api.post('/ai/ask', { question }),
};
