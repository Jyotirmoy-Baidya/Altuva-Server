import { Router } from 'express';
import { getRoot, getHello, testDatabase } from '../controllers/healthController';

const router = Router();

// Root route - Check if server is running
router.get("/", getRoot);

// Hello route - Simple API test
router.get("/api/hello", getHello);

// Database test route - Check database connection
router.get("/api/db-test", testDatabase);

export { router as healthRoutes };
