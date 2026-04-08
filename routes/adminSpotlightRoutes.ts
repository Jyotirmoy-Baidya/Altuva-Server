import { Router } from 'express';
import { getAllSpotlights, createSpotlight, updateSpotlight, deleteSpotlight } from '../controllers/spotlightController';
import { adminMiddleware } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/upload';

const router = Router();
router.use(adminMiddleware);

router.get('/', getAllSpotlights);
router.post('/', upload.single('image'), createSpotlight);
router.put('/:id', upload.single('image'), updateSpotlight);
router.delete('/:id', deleteSpotlight);

export { router as adminSpotlightRoutes };
