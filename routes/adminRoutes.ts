import { Router } from 'express';
import { register, login, createUser, getMe } from '../controllers/adminController';
import { adminMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (require authentication and approval)
router.post('/create-user', adminMiddleware, createUser);
router.get('/get-me-admin-user', adminMiddleware, getMe);

export { router as adminRoutes };
