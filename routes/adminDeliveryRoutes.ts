import { Router } from 'express';
import { getDeliveryCharges, createDeliveryChargeHandler, updateDeliveryChargeHandler, deleteDeliveryChargeHandler } from '../controllers/deliveryChargeController';
import { adminMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(adminMiddleware);

router.get('/', getDeliveryCharges);
router.post('/', createDeliveryChargeHandler);
router.put('/:id', updateDeliveryChargeHandler);
router.delete('/:id', deleteDeliveryChargeHandler);

export { router as adminDeliveryRoutes };
