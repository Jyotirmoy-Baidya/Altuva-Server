import { Request, Response } from 'express';
import { db, schema } from '../db';
import { eq, asc } from 'drizzle-orm';
import { uploadToCloudinary } from '../utils/cloudinary';

const { spotlights } = schema;

// ─── Public ───────────────────────────────────────────────────────────────────

export const getPublicSpotlights = async (_req: Request, res: Response): Promise<void> => {
    try {
        const rows = await db.select().from(spotlights)
            .where(eq(spotlights.is_active, true))
            .orderBy(asc(spotlights.sort_order), asc(spotlights.created_at));
        res.json({ success: true, data: rows });
    } catch (e) {
        res.status(500).json({ success: false, message: e instanceof Error ? e.message : 'Server error' });
    }
};

// ─── Admin ────────────────────────────────────────────────────────────────────

export const getAllSpotlights = async (_req: Request, res: Response): Promise<void> => {
    try {
        const rows = await db.select().from(spotlights).orderBy(asc(spotlights.sort_order), asc(spotlights.created_at));
        res.json({ success: true, data: rows });
    } catch (e) {
        res.status(500).json({ success: false, message: e instanceof Error ? e.message : 'Server error' });
    }
};

export const createSpotlight = async (req: Request, res: Response): Promise<void> => {
    try {
        const { quote, person_name, sort_order, is_active } = req.body;
        if (!quote || !person_name) {
            res.status(400).json({ success: false, message: 'quote and person_name are required' });
            return;
        }

        let image_url = req.body.image_url || '';
        if (req.file) {
            const uploaded = await uploadToCloudinary(req.file.buffer, 'spotlights');
            image_url = uploaded.secure_url;
        }
        if (!image_url) {
            res.status(400).json({ success: false, message: 'image is required' });
            return;
        }

        const [row] = await db.insert(spotlights).values({
            image_url,
            quote,
            person_name,
            bg_color: req.body.bg_color || '#3B0E0E',
            sort_order: sort_order ? parseInt(sort_order) : 0,
            is_active: is_active !== undefined ? is_active === 'true' || is_active === true : true,
        }).returning();

        res.status(201).json({ success: true, data: row });
    } catch (e) {
        res.status(500).json({ success: false, message: e instanceof Error ? e.message : 'Server error' });
    }
};

export const updateSpotlight = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(String(req.params.id));
        const { quote, person_name, sort_order, is_active, bg_color } = req.body;
        const updates: Record<string, any> = { updated_at: new Date() };

        if (req.file) {
            const uploaded = await uploadToCloudinary(req.file.buffer, 'spotlights');
            updates.image_url = uploaded.secure_url;
        }
        if (quote !== undefined)       updates.quote = quote;
        if (person_name !== undefined)  updates.person_name = person_name;
        if (bg_color !== undefined)     updates.bg_color = bg_color;
        if (sort_order !== undefined)   updates.sort_order = parseInt(sort_order);
        if (is_active !== undefined)    updates.is_active = is_active === 'true' || is_active === true;

        const [row] = await db.update(spotlights).set(updates).where(eq(spotlights.id, id)).returning();
        if (!row) { res.status(404).json({ success: false, message: 'Not found' }); return; }
        res.json({ success: true, data: row });
    } catch (e) {
        res.status(500).json({ success: false, message: e instanceof Error ? e.message : 'Server error' });
    }
};

export const deleteSpotlight = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(String(req.params.id));
        const [row] = await db.delete(spotlights).where(eq(spotlights.id, id)).returning();
        if (!row) { res.status(404).json({ success: false, message: 'Not found' }); return; }
        res.json({ success: true, message: 'Deleted' });
    } catch (e) {
        res.status(500).json({ success: false, message: e instanceof Error ? e.message : 'Server error' });
    }
};
