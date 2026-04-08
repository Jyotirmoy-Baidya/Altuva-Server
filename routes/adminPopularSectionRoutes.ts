import { Router } from 'express';
import { getAllPopularSections, createPopularSection, updatePopularSection, deletePopularSection } from '../controllers/popularSectionController';
import { adminMiddleware } from '../middlewares/authMiddleware';

const router = Router();
router.use(adminMiddleware);

router.get('/', getAllPopularSections);
router.post('/', createPopularSection);
router.put('/:id', updatePopularSection);
router.delete('/:id', deletePopularSection);

export { router as adminPopularSectionRoutes };
