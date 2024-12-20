import { Router } from 'express';
import { PurchaseController } from '../controllers/purchase.controller';
import { validatePurchase } from '../middlewares/purchase.validator';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticateToken, validatePurchase, PurchaseController.createPurchase);
router.get('/user', authenticateToken, PurchaseController.getUserPurchases);

export default router;

