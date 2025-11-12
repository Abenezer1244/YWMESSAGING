import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { searchNumbers, purchaseNumber, getCurrentNumber, releaseCurrentNumber, } from '../controllers/numbers.controller.js';
const router = express.Router();
// All routes require authentication
router.use(authenticateToken);
/**
 * Search for available phone numbers
 * GET /api/numbers/search?areaCode=415&state=CA&quantity=10
 */
router.get('/search', searchNumbers);
/**
 * Get church's current phone number
 * GET /api/numbers/current
 */
router.get('/current', getCurrentNumber);
/**
 * Purchase a phone number
 * POST /api/numbers/purchase
 * Body: { phoneNumber: "+14155552671", connectionId?: "..." }
 */
router.post('/purchase', purchaseNumber);
/**
 * Release/delete church's phone number
 * DELETE /api/numbers/current
 */
router.delete('/current', releaseCurrentNumber);
export default router;
//# sourceMappingURL=numbers.routes.js.map