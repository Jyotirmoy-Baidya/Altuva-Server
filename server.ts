import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { logger } from './middlewares/logger';
import { errorHandler } from './middlewares/errorHandler';
import { healthRoutes } from './routes/healthRoutes';
import { adminRoutes } from './routes/adminRoutes';
import { adminCmsRoutes } from './routes/adminCmsRoutes';
import { publicCmsRoutes } from './routes/publicCmsRoutes';
import { adminProductRoutes } from './routes/adminProductRoutes';
import { publicProductRoutes } from './routes/publicProductRoutes';
import { customerRoutes } from './routes/customerRoutes';
import { adminTaxRoutes } from './routes/adminTaxRoutes';
import { adminDeliveryRoutes } from './routes/adminDeliveryRoutes';
import { adminCustomerRoutes } from './routes/adminCustomerRoutes';
import { adminDiscountRoutes } from './routes/adminDiscountRoutes';
import { adminSpotlightRoutes } from './routes/adminSpotlightRoutes';
import { publicSpotlightRoutes } from './routes/publicSpotlightRoutes';
import { adminPopularSectionRoutes } from './routes/adminPopularSectionRoutes';
import { publicPopularSectionRoutes } from './routes/publicPopularSectionRoutes';
import { adminOrderRoutes } from './routes/adminOrderRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGIN?.split(',');

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
app.use('/admin/products', adminProductRoutes);
app.use('/api/cms', publicCmsRoutes);
app.use('/public/products', publicProductRoutes);
app.use('/customer', customerRoutes);
app.use('/admin/taxes', adminTaxRoutes);
app.use('/admin/delivery-charges', adminDeliveryRoutes);
app.use('/admin/customers', adminCustomerRoutes);
app.use('/admin/discounts', adminDiscountRoutes);
app.use('/admin/spotlights', adminSpotlightRoutes);
app.use('/public/spotlights', publicSpotlightRoutes);
app.use('/admin/popular-sections', adminPopularSectionRoutes);
app.use('/public/popular-sections', publicPopularSectionRoutes);
app.use('/admin/orders', adminOrderRoutes);

// Error Handler Middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
