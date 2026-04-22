import api from './client';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

export const authApi = {
  login: (credentials: LoginCredentials) =>
    api.post<{ success: boolean; data: AuthResponse }>('/api/auth/login', credentials),

  register: (data: RegisterData) =>
    api.post<{ success: boolean; data: AuthResponse }>('/api/auth/register', data),

  getMe: () =>
    api.get<{ success: boolean; data: AuthResponse['user'] }>('/api/auth/me'),
};
