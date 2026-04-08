import { Router } from 'express';
import { adminMiddleware } from '../middlewares/authMiddleware';
import { db, schema } from '../db';
import { eq } from 'drizzle-orm';

const router = Router();
router.use(adminMiddleware);

const { discountCodes } = schema;

router.get('/', async (_req, res) => {
    try {
        const data = await db.select().from(discountCodes);
        res.json({ success: true, data });
    } catch (e) { res.status(500).json({ success: false, message: e instanceof Error ? e.message : 'Error' }); }
});

router.post('/', async (req, res) => {
    try {
        const { name, code, type, value, min_order_amount, max_uses, is_active, expires_at } = req.body;
        if (!name || !code || !type || value === undefined) {
            res.status(400).json({ success: false, message: 'name, code, type, value required' }); return;
        }
        const result = await db.insert(discountCodes).values({
            name, code: code.toUpperCase(), type, value: String(value),
            min_order_amount: min_order_amount ? String(min_order_amount) : '0',
            max_uses: max_uses || null,
            is_active: is_active ?? true,
            expires_at: expires_at ? new Date(expires_at) : null,
        }).returning();
        res.status(201).json({ success: true, data: result[0] });
    } catch (e) { res.status(500).json({ success: false, message: e instanceof Error ? e.message : 'Error' }); }
});

router.put('/:id', async (req, res) => {
    try {
        const body = { ...req.body };
        if (body.code) body.code = body.code.toUpperCase();
        if (body.value !== undefined) body.value = String(body.value);
        if (body.expires_at) body.expires_at = new Date(body.expires_at);
        const result = await db.update(discountCodes).set({ ...body, updated_at: new Date() })
            .where(eq(discountCodes.id, parseInt(req.params.id))).returning();
        if (!result[0]) { res.status(404).json({ success: false, message: 'Not found' }); return; }
        res.json({ success: true, data: result[0] });
    } catch (e) { res.status(500).json({ success: false, message: e instanceof Error ? e.message : 'Error' }); }
});

router.delete('/:id', async (req, res) => {
    try {
        const result = await db.delete(discountCodes).where(eq(discountCodes.id, parseInt(req.params.id))).returning();
        if (!result[0]) { res.status(404).json({ success: false, message: 'Not found' }); return; }
        res.json({ success: true, data: { message: 'Deleted' } });
    } catch (e) { res.status(500).json({ success: false, message: e instanceof Error ? e.message : 'Error' }); }
});

export { router as adminDiscountRoutes };
