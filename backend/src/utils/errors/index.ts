export { AppError, type AppError as IAppError } from './AppError.js';
export { ValidationError } from './ValidationError.js';
export { AuthenticationError } from './AuthenticationError.js';
export { AuthorizationError } from './AuthorizationError.js';
export { NotFoundError } from './NotFoundError.js';
export { DatabaseError } from './DatabaseError.js';

// Re-export default for backward compatibility
export { default } from './AppError.js';
