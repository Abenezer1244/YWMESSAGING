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
    const response = await client.post('/auth/login', data);
    return response.data;
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
//# sourceMappingURL=auth.js.map