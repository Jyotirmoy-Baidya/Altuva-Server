import { Router } from 'express';
import { getTaxes, createTaxHandler, updateTaxHandler, deleteTaxHandler } from '../controllers/taxController';
import { adminMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(adminMiddleware);

router.get('/', getTaxes);
router.post('/', createTaxHandler);
router.put('/:id', updateTaxHandler);
router.delete('/:id', deleteTaxHandler);

export { router as adminTaxRoutes };
