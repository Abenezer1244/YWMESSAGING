import bcrypt from 'bcrypt';
const SALT_ROUNDS = 10;
/**
 * Hash password using bcrypt
 */
export async function hashPassword(password) {
    try {
        const hash = await bcrypt.hash(password, SALT_ROUNDS);
        return hash;
    }
    catch (error) {
        console.error('Error hashing password:', error);
        throw error;
    }
}
/**
 * Compare password with hash
 */
export async function comparePassword(password, hash) {
    try {
        const match = await bcrypt.compare(password, hash);
        return match;
    }
    catch (error) {
        console.error('Error comparing password:', error);
        return false;
    }
}
//# sourceMappingURL=password.utils.js.map