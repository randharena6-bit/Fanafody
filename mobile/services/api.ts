import { Platform } from 'react-native';

const DEVICE_HOST = '192.168.1.100';
const API_BASE = Platform.select({
  web: 'http://localhost:3000/api',
  default: `http://${DEVICE_HOST}:3000/api`,
});

let authToken: string | null = null;

export function setToken(token: string | null) {
  authToken = token;
}

export function getToken(): string | null {
  return authToken;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers: { ...headers, ...options?.headers } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface User {
  id: number;
  email: string;
  name: string;
  phone: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Medication {
  id: number;
  user_id: number;
  name: string;
  dosage: string;
  photo_url: string;
  time: string;
  start_date: string;
  end_date: string;
  notes: string;
  today_log: string | null;
  created_at: string;
  updated_at: string;
}

export interface MedicationInput {
  name: string;
  dosage?: string;
  photo_url?: string;
  time: string;
  start_date: string;
  end_date?: string;
  notes?: string;
}

export interface MedicationLog {
  id: number;
  medication_id: number;
  user_id: number;
  status: 'taken' | 'skipped';
  taken_at: string;
  medication_name?: string;
  dosage?: string;
  scheduled_time?: string;
}

export interface DailySummary {
  date: string;
  total: number;
  taken: number;
  skipped: number;
  missed: number;
}

export interface TrustedContact {
  id: number;
  user_id: number;
  name: string;
  phone: string;
  email: string;
  notify_after_missed: number;
  created_at: string;
}

// Auth
export function register(email: string, password: string, name: string, phone?: string): Promise<AuthResponse> {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, phone }),
  });
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function getMe(): Promise<User> {
  return request('/auth/me');
}

export function updateProfile(name: string, phone: string): Promise<User> {
  return request('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify({ name, phone }),
  });
}

export function forgotPassword(email: string): Promise<{ message: string; token: string }> {
  return request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  return request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
}

// Medications
export function getMedications(): Promise<Medication[]> {
  return request('/medications');
}

export function getTodaysMedications(date?: string): Promise<Medication[]> {
  const q = date ? `?date=${date}` : '';
  return request(`/medications/today${q}`);
}

export function getMedicationById(id: number): Promise<Medication> {
  return request(`/medications/${id}`);
}

export function createMedication(data: MedicationInput): Promise<Medication> {
  return request('/medications', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateMedication(id: number, data: Partial<MedicationInput>): Promise<Medication> {
  return request(`/medications/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteMedication(id: number): Promise<void> {
  return request(`/medications/${id}`, { method: 'DELETE' });
}

// History
export function logMedicationIntake(medicationId: number, status: 'taken' | 'skipped', takenAt?: string): Promise<MedicationLog> {
  return request('/history/log', {
    method: 'POST',
    body: JSON.stringify({ medication_id: medicationId, status, taken_at: takenAt }),
  });
}

export function getMedicationLogs(medicationId: number): Promise<MedicationLog[]> {
  return request(`/history/${medicationId}`);
}

export function getHistoryByDateRange(from: string, to: string): Promise<MedicationLog[]> {
  return request(`/history/range?from=${from}&to=${to}`);
}

export function getDailySummary(date?: string): Promise<DailySummary> {
  const q = date ? `?date=${date}` : '';
  return request(`/history/daily${q}`);
}

// Contacts
export function getContacts(): Promise<TrustedContact[]> {
  return request('/contacts');
}

export function getContactById(id: number): Promise<TrustedContact> {
  return request(`/contacts/${id}`);
}

export function createContact(name: string, phone?: string, email?: string, notifyAfterMissed?: number): Promise<TrustedContact> {
  return request('/contacts', {
    method: 'POST',
    body: JSON.stringify({ name, phone, email, notify_after_missed: notifyAfterMissed }),
  });
}

export function updateContact(id: number, data: Partial<TrustedContact>): Promise<TrustedContact> {
  return request(`/contacts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteContact(id: number): Promise<void> {
  return request(`/contacts/${id}`, { method: 'DELETE' });
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  id: string;
  message: ChatMessage;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export function chat(messages: ChatMessage[], model?: string): Promise<ChatResponse> {
  return request('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ messages, model }),
  });
}
