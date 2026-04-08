import { Request, Response } from 'express';
import { getAllTaxes, createTax, updateTax, deleteTax } from '../services/taxService';

const ok = (res: Response, data: any, status = 200) => res.status(status).json({ success: true, data });
const err = (res: Response, error: unknown) =>
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Server error' });

export const getTaxes = async (_req: Request, res: Response): Promise<void> => {
    try { ok(res, await getAllTaxes()); } catch (e) { err(res, e); }
};

export const createTaxHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, type, value, is_active } = req.body;
        if (!name || !type || value === undefined) {
            res.status(400).json({ success: false, message: 'name, type and value are required' }); return;
        }
        ok(res, await createTax({ name, type, value: String(value), is_active }), 201);
    } catch (e) { err(res, e); }
};

export const updateTaxHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const tax = await updateTax(parseInt(req.params.id), req.body);
        if (!tax) { res.status(404).json({ success: false, message: 'Tax not found' }); return; }
        ok(res, tax);
    } catch (e) { err(res, e); }
};

export const deleteTaxHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const tax = await deleteTax(parseInt(req.params.id));
        if (!tax) { res.status(404).json({ success: false, message: 'Tax not found' }); return; }
        ok(res, { message: 'Tax deleted' });
    } catch (e) { err(res, e); }
};
