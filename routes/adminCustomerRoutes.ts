import { Router } from 'express';
import { adminMiddleware } from '../middlewares/authMiddleware';
import { db, schema } from '../db';
import { eq } from 'drizzle-orm';
import { calculateCart } from '../services/cartService';

const router = Router();
router.use(adminMiddleware);

const { customerUsers, carts } = schema;

// GET /admin/customers — list all customers (no passwords)
router.get('/', async (_req, res) => {
    try {
        const customers = await db.select({
            id: customerUsers.id,
            name: customerUsers.name,
            email: customerUsers.email,
            phone: customerUsers.phone,
            is_active: customerUsers.is_active,
            created_at: customerUsers.created_at,
        }).from(customerUsers);
        res.json({ success: true, data: customers });
    } catch (e) {
        res.status(500).json({ success: false, message: e instanceof Error ? e.message : 'Error' });
    }
});

// GET /admin/customers/:id/cart — view a customer's cart
router.get('/:id/cart', async (req, res) => {
    try {
        const customerId = parseInt(req.params.id);
        const cart = await db.select().from(carts).where(eq(carts.customer_id, customerId)).limit(1);
        if (!cart[0]) {
            res.json({ success: true, data: { items: [], grand_total: 0, item_count: 0 } });
            return;
        }
        const summary = await calculateCart(cart[0].id, cart[0].discount_code_id);
        res.json({ success: true, data: summary });
    } catch (e) {
        res.status(500).json({ success: false, message: e instanceof Error ? e.message : 'Error' });
    }
});

export { router as adminCustomerRoutes };
