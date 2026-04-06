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
const productUpload = upload.fields([
    { name: 'primary_image', maxCount: 1 },
    { name: 'secondary_image', maxCount: 1 },
    { name: 'product_images', maxCount: 10 },
]);

router.post('/', productUpload, createProduct);
router.put('/:id', productUpload, updateProduct);
router.delete('/:id', deleteProduct);

export { router as adminProductRoutes };
