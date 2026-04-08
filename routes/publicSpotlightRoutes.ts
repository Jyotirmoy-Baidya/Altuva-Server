import { Router } from 'express';
import { getPublicSpotlights } from '../controllers/spotlightController';

const router = Router();
router.get('/', getPublicSpotlights);

export { router as publicSpotlightRoutes };
