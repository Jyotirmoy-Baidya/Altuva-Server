import { Request, Response } from 'express';
import { db, schema } from '../db';
import { eq, asc } from 'drizzle-orm';

const { popularSections, products } = schema;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getProductBySlug = async (slug: string | null | undefined) => {
    if (!slug) return null;
    const rows = await db.select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        primary_image: products.primary_image,
        secondary_image: products.secondary_image,
        price: products.price,
        discounted_price: products.discounted_price,
    }).from(products).where(eq(products.slug, slug)).limit(1);
    return rows[0] || null;
};

// ─── Public ───────────────────────────────────────────────────────────────────

export const getPublicPopularSections = async (_req: Request, res: Response): Promise<void> => {
    try {
        const rows = await db.select().from(popularSections)
            .where(eq(popularSections.is_active, true))
            .orderBy(asc(popularSections.sort_order), asc(popularSections.created_at));

        const enriched = await Promise.all(rows.map(async (row) => ({
            ...row,
            product_1: await getProductBySlug(row.product_1_slug),
            product_2: await getProductBySlug(row.product_2_slug),
        })));

        res.json({ success: true, data: enriched });
    } catch (e) {
        res.status(500).json({ success: false, message: e instanceof Error ? e.message : 'Server error' });
    }
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export const getAllPopularSections = async (_req: Request, res: Response): Promise<void> => {
    try {
        const rows = await db.select().from(popularSections)
            .orderBy(asc(popularSections.sort_order), asc(popularSections.created_at));
        res.json({ success: true, data: rows });
    } catch (e) {
        res.status(500).json({ success: false, message: e instanceof Error ? e.message : 'Server error' });
    }
};

export const createPopularSection = async (req: Request, res: Response): Promise<void> => {
    try {
        const { category, title, subtitle, cta_text, cta_url, product_1_slug, product_2_slug, sort_order, is_active } = req.body;
        if (!category || !title) {
            res.status(400).json({ success: false, message: 'category and title are required' });
            return;
        }
        const [row] = await db.insert(popularSections).values({
            category,
            title,
            subtitle: subtitle || null,
            cta_text: cta_text || 'Shop All Products',
            cta_url: cta_url || '/products',
            product_1_slug: product_1_slug || null,
            product_2_slug: product_2_slug || null,
            sort_order: sort_order ? parseInt(sort_order) : 0,
            is_active: is_active !== undefined ? is_active === 'true' || is_active === true : true,
        }).returning();
        res.status(201).json({ success: true, data: row });
    } catch (e) {
        res.status(500).json({ success: false, message: e instanceof Error ? e.message : 'Server error' });
    }
};

export const updatePopularSection = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(String(req.params.id));
        const { category, title, subtitle, cta_text, cta_url, product_1_slug, product_2_slug, sort_order, is_active } = req.body;
        const updates: Record<string, any> = { updated_at: new Date() };
        if (category !== undefined)        updates.category = category;
        if (title !== undefined)           updates.title = title;
        if (subtitle !== undefined)        updates.subtitle = subtitle;
        if (cta_text !== undefined)        updates.cta_text = cta_text;
        if (cta_url !== undefined)         updates.cta_url = cta_url;
        if (product_1_slug !== undefined)  updates.product_1_slug = product_1_slug || null;
        if (product_2_slug !== undefined)  updates.product_2_slug = product_2_slug || null;
        if (sort_order !== undefined)      updates.sort_order = parseInt(sort_order);
        if (is_active !== undefined)       updates.is_active = is_active === 'true' || is_active === true;

        const [row] = await db.update(popularSections).set(updates).where(eq(popularSections.id, id)).returning();
        if (!row) { res.status(404).json({ success: false, message: 'Not found' }); return; }
        res.json({ success: true, data: row });
    } catch (e) {
        res.status(500).json({ success: false, message: e instanceof Error ? e.message : 'Server error' });
    }
};

export const deletePopularSection = async (req: Request, res: Response): Promise<void> => {
    try {
        const [row] = await db.delete(popularSections).where(eq(popularSections.id, parseInt(String(req.params.id)))).returning();
        if (!row) { res.status(404).json({ success: false, message: 'Not found' }); return; }
        res.json({ success: true, message: 'Deleted' });
    } catch (e) {
        res.status(500).json({ success: false, message: e instanceof Error ? e.message : 'Server error' });
    }
};
