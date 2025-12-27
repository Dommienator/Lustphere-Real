import { API_URL } from '../utils/constants';

export const authAPI = {
  signup: (data) => fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  login: (data) => fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  verifyEmail: (data) => fetch(`${API_URL}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
};

export const profileAPI = {
  getAll: () => fetch(`${API_URL}/profiles`),
  update: (data) => fetch(`${API_URL}/profile/update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  updatePaymentMethod: (data) => fetch(`${API_URL}/profile/payment-method`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
};

export const callAPI = {
  checkIncoming: (userId) => fetch(`${API_URL}/calls/check/${userId}`),
  create: (data) => fetch(`${API_URL}/calls/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  accept: (data) => fetch(`${API_URL}/calls/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  end: (data) => fetch(`${API_URL}/calls/end`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  getHistory: (userId) => fetch(`${API_URL}/calls/history/${userId}`),
};

export const tokenAPI = {
  purchase: (data) => fetch(`${API_URL}/tokens/purchase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
};

export const earningsAPI = {
  withdraw: (data) => fetch(`${API_URL}/earnings/withdraw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  getHistory: (userId) => fetch(`${API_URL}/earnings/history/${userId}`),
};
