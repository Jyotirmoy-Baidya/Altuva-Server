import { Router } from 'express';
import { getPublicPopularSections } from '../controllers/popularSectionController';

const router = Router();
router.get('/', getPublicPopularSections);

export { router as publicPopularSectionRoutes };
