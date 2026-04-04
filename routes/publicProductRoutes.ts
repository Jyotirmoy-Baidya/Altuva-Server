import { Router } from 'express';
import { getPublicProducts, getPublicProductBySlug } from '../controllers/productController';

const router = Router();

// GET /public/products?category=&brand=&search=&is_featured=&min_price=&max_price=&tags=&flavors=&limit=&offset=
router.get('/', getPublicProducts);

// GET /public/products/:slug
router.get('/:slug', getPublicProductBySlug);

export { router as publicProductRoutes };
