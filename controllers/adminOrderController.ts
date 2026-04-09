import { Request, Response } from 'express';
import { getAllOrders, getOrderById, updateOrderStatus, getOrderStats } from '../services/orderService';

const ok = (res: Response, data: unknown) => res.status(200).json({ success: true, data });
const err = (res: Response, error: unknown, status = 500) =>
    res.status(status).json({ success: false, message: error instanceof Error ? error.message : 'Server error' });

// GET /admin/orders
export const listOrdersAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(String(req.query.page ?? '1'));
        const limit = parseInt(String(req.query.limit ?? '20'));
        const status = req.query.status as string | undefined;
        ok(res, await getAllOrders({ page, limit, status }));
    } catch (e) { err(res, e); }
};

// GET /admin/orders/stats
export const orderStats = async (_req: Request, res: Response): Promise<void> => {
    try { ok(res, await getOrderStats()); } catch (e) { err(res, e); }
};

// GET /admin/orders/:id
export const getOrderAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        ok(res, await getOrderById(parseInt(String(req.params.id))));
    } catch (e) { err(res, e, 404); }
};

// PATCH /admin/orders/:id/status
export const updateStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status, revert_stock } = req.body;
        if (!status) { res.status(400).json({ success: false, message: 'status is required' }); return; }
        ok(res, await updateOrderStatus(
            parseInt(String(req.params.id)),
            status,
            revert_stock === true,
        ));
    } catch (e) { err(res, e, 400); }
};
