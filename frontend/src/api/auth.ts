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
  mfaRequired?: boolean;
  mfaSessionToken?: string;
  data: {
    adminId?: string;
    churchId?: string;
    accessToken?: string;
    refreshToken?: string;
    admin: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      welcomeCompleted: boolean;
      userRole?: string;
    };
    church?: {
      id: string;
      name: string;
      email: string;
      trialEndsAt: string;
    };
    message?: string;
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
  console.log('[auth.login] Called with email:', data.email);
  console.log('[auth.login] About to make axios POST to /auth/login');
  try {
    const response = await client.post<AuthResponse>('/auth/login', data);
    console.log('[auth.login] Axios POST returned successfully:', response.status);
    return response.data;
  } catch (error: any) {
    console.error('[auth.login] Axios POST failed:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });
    throw error;
  }
}

/**
 * Refresh access token via httpOnly cookies
 */
export async function refreshToken(): Promise<{
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
  };
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
    welcomeCompleted: boolean;
    userRole?: string;
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

/**
 * Logout - clears HTTPOnly cookies on backend
 */
export async function logout(): Promise<{
  success: boolean;
}> {
  const response = await client.post('/auth/logout', {});
  return response.data;
}
