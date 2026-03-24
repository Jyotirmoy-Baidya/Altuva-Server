import { Router } from 'express';
import { getActiveBanners } from '../controllers/cmsController';

const router = Router();

// Public routes (no authentication required)
router.get('/hero-banners', getActiveBanners);

export { router as publicCmsRoutes };
