import { Request, Response } from 'express';
import { getAllDeliveryCharges, createDeliveryCharge, updateDeliveryCharge, deleteDeliveryCharge } from '../services/deliveryChargeService';

const ok = (res: Response, data: any, status = 200) => res.status(status).json({ success: true, data });
const err = (res: Response, error: unknown) =>
    res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Server error' });

export const getDeliveryCharges = async (_req: Request, res: Response): Promise<void> => {
    try { ok(res, await getAllDeliveryCharges()); } catch (e) { err(res, e); }
};

export const createDeliveryChargeHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, min_order_amount, max_order_amount, charge, is_active } = req.body;
        if (!name || charge === undefined || min_order_amount === undefined) {
            res.status(400).json({ success: false, message: 'name, min_order_amount and charge are required' }); return;
        }
        ok(res, await createDeliveryCharge({ name, min_order_amount: String(min_order_amount), max_order_amount: max_order_amount ? String(max_order_amount) : undefined, charge: String(charge), is_active }), 201);
    } catch (e) { err(res, e); }
};

export const updateDeliveryChargeHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const slab = await updateDeliveryCharge(parseInt(String(req.params.id)), req.body);
        if (!slab) { res.status(404).json({ success: false, message: 'Slab not found' }); return; }
        ok(res, slab);
    } catch (e) { err(res, e); }
};

export const deleteDeliveryChargeHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const slab = await deleteDeliveryCharge(parseInt(String(req.params.id)));
        if (!slab) { res.status(404).json({ success: false, message: 'Slab not found' }); return; }
        ok(res, { message: 'Delivery charge deleted' });
    } catch (e) { err(res, e); }
};
