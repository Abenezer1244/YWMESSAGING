import client from './client';

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  churchName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    adminId: string;
    churchId: string;
    accessToken: string;
    refreshToken: string;
    admin: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
    };
    church: {
      id: string;
      name: string;
      email: string;
      trialEndsAt: string;
    };
  };
}

/**
 * Register a new church
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await client.post<AuthResponse>('/auth/register', data);
  return response.data;
}

/**
 * Login with email and password
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await client.post<AuthResponse>('/auth/login', data);
  return response.data;
}

/**
 * Refresh access token via httpOnly cookies
 */
export async function refreshToken(): Promise<{
  success: boolean;
}> {
  const response = await client.post('/auth/refresh', {});
  return response.data;
}

/**
 * Get current user
 */
export async function getMe(): Promise<{
  success: boolean;
  data: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    church: {
      id: string;
      name: string;
      email: string;
      trialEndsAt: string;
    };
  };
}> {
  const response = await client.get('/auth/me');
  return response.data;
}
