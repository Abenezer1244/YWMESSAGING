import client from './client';
/**
 * Register a new church
 */
export async function register(data) {
    const response = await client.post('/auth/register', data);
    return response.data;
}
/**
 * Login with email and password
 */
export async function login(data) {
    console.log('[auth.login] Called with email:', data.email);
    console.log('[auth.login] About to make axios POST to /auth/login');
    try {
        const response = await client.post('/auth/login', data);
        console.log('[auth.login] Axios POST returned successfully:', response.status);
        return response.data;
    }
    catch (error) {
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
export async function refreshToken() {
    const response = await client.post('/auth/refresh', {});
    return response.data;
}
/**
 * Get current user
 */
export async function getMe() {
    const response = await client.get('/auth/me');
    return response.data;
}
/**
 * Logout - clears HTTPOnly cookies on backend
 */
export async function logout() {
    const response = await client.post('/auth/logout', {});
    return response.data;
}
//# sourceMappingURL=auth.js.map