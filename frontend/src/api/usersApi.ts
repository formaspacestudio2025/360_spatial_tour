import api from './client';
import { User, UserRole } from '../types';

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  role?: UserRole;
  password?: string;
}

export const usersApi = {
  getAll: () => api.get<{ success: boolean; data: User[] }>('/api/users').then(r => r.data.data),

  create: (data: CreateUserData) =>
    api.post<{ success: boolean; data: User }>('/api/users', data).then(r => r.data.data),

  update: (id: string, data: UpdateUserData) =>
    api.put<{ success: boolean; data: User }>(`/api/users/${id}`, data).then(r => r.data.data),

  delete: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/api/users/${id}`).then(r => r.data),
};
