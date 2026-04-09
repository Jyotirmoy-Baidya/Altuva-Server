import { Router } from 'express';
import { listOrdersAdmin, getOrderAdmin, updateStatus, orderStats } from '../controllers/adminOrderController';
import { adminMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.get('/stats', adminMiddleware, orderStats);
router.get('/', adminMiddleware, listOrdersAdmin);
router.get('/:id', adminMiddleware, getOrderAdmin);
router.patch('/:id/status', adminMiddleware, updateStatus);

export { router as adminOrderRoutes };
