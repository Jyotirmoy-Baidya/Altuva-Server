import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { logger } from './middlewares/logger';
import { errorHandler } from './middlewares/errorHandler';
import { healthRoutes } from './routes/healthRoutes';
import { adminRoutes } from './routes/adminRoutes';
import { adminCmsRoutes } from './routes/adminCmsRoutes';
import { publicCmsRoutes } from './routes/publicCmsRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5173',
];

const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
    optionsSuccessStatus: 200,
};

// Global Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(logger);

// Routes
app.use('/', healthRoutes);
app.use('/admin', adminRoutes);
app.use('/admin/cms', adminCmsRoutes);
app.use('/api/cms', publicCmsRoutes);

// Error Handler Middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
