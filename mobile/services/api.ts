import { Platform } from 'react-native';

const DEVICE_HOST = '192.168.1.100'; // ← remplace par l'IP de ta machine
const API_BASE = Platform.select({
  web: 'http://localhost:3000/api',
  default: `http://${DEVICE_HOST}:3000/api`,
});

export interface Item {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export function getItems(userId: number): Promise<Item[]> {
  return request(`/items?user_id=${userId}`);
}

export function getItemById(id: number): Promise<Item> {
  return request(`/items/${id}`);
}

export function createItem(userId: number, title: string, description?: string): Promise<Item> {
  return request('/items', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, title, description }),
  });
}

export function updateItem(id: number, title: string, description: string | null, status: string): Promise<Item> {
  return request(`/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title, description, status }),
  });
}

export function deleteItem(id: number): Promise<void> {
  return request(`/items/${id}`, { method: 'DELETE' });
}

export function getUsers(): Promise<User[]> {
  return request('/users');
}

export function getUserById(id: number): Promise<User> {
  return request(`/users/${id}`);
}
