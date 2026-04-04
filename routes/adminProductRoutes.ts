import { Router } from 'express';
import {
    getAllProductsAdmin,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} from '../controllers/productController';
import { adminMiddleware } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/upload';

const router = Router();

router.use(adminMiddleware);

router.get('/', getAllProductsAdmin);
router.get('/:id', getProductById);
router.post('/', upload.single('primary_image'), createProduct);
router.put('/:id', upload.single('primary_image'), updateProduct);
router.delete('/:id', deleteProduct);

export { router as adminProductRoutes };
