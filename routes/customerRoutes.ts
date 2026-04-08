import { Router } from 'express';
import { register, login, getMe, updateProfile } from '../controllers/customerController';
import { customerMiddleware } from '../middlewares/customerMiddleware';
import {
    getCartHandler, addToCartHandler, updateCartItemHandler,
    removeFromCartHandler, clearCartHandler, applyDiscountHandler, removeDiscountHandler,
} from '../controllers/cartController';
import {
    getAddresses, addAddressHandler, updateAddressHandler,
    deleteAddressHandler, setDefaultAddressHandler,
} from '../controllers/addressController';

const router = Router();

// ─── Auth ─────────────────────────────────────────────────────────────────────
router.post('/register', register);
router.post('/login', login);
router.get('/get-me', customerMiddleware, getMe);
router.put('/update-profile', customerMiddleware, updateProfile);

// ─── Cart ─────────────────────────────────────────────────────────────────────
router.get('/cart', customerMiddleware, getCartHandler);
router.post('/cart/add/:productId', customerMiddleware, addToCartHandler);
router.put('/cart/update/:productId', customerMiddleware, updateCartItemHandler);
router.delete('/cart/remove/:productId', customerMiddleware, removeFromCartHandler);
router.delete('/cart/clear', customerMiddleware, clearCartHandler);
router.post('/cart/apply-discount', customerMiddleware, applyDiscountHandler);
router.delete('/cart/remove-discount', customerMiddleware, removeDiscountHandler);

// ─── Addresses ────────────────────────────────────────────────────────────────
router.get('/addresses', customerMiddleware, getAddresses);
router.post('/addresses', customerMiddleware, addAddressHandler);
router.put('/addresses/:id', customerMiddleware, updateAddressHandler);
router.delete('/addresses/:id', customerMiddleware, deleteAddressHandler);
router.patch('/addresses/:id/set-default', customerMiddleware, setDefaultAddressHandler);

export { router as customerRoutes };
