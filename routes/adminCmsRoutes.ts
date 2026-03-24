import { Router } from 'express';
import {
    getAllBanners,
    getBannerById,
    createBanner,
    updateBannerById,
    deleteBannerById,
} from '../controllers/cmsController';
import { adminMiddleware } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/upload';

const router = Router();

// All CMS routes require admin authentication
router.use(adminMiddleware);

// Hero Banner Routes
router.get('/hero-banners', getAllBanners);
router.get('/hero-banners/:id', getBannerById);
router.post('/hero-banners', upload.single('image'), createBanner);
router.put('/hero-banners/:id', upload.single('image'), updateBannerById);
router.delete('/hero-banners/:id', deleteBannerById);

export { router as adminCmsRoutes };
