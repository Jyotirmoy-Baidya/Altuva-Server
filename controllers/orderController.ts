import { Request, Response } from 'express';
import {
    createRazorpayOrder,
    verifyAndPlaceOrder,
    getOrderById,
    getCustomerOrders,
} from '../services/orderService';

const ok = (res: Response, data: unknown) => res.status(200).json({ success: true, data });
const err = (res: Response, error: unknown, status = 500) =>
    res.status(status).json({ success: false, message: error instanceof Error ? error.message : 'Server error' });

// POST /customer/orders/initiate  — creates Razorpay order
export const initiateOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { address_id } = req.body;
        if (!address_id) { res.status(400).json({ success: false, message: 'address_id is required' }); return; }
        ok(res, await createRazorpayOrder(req.customer!.id, parseInt(String(address_id))));
    } catch (e) { err(res, e, 400); }
};

// POST /customer/orders/verify  — verify payment + place order
export const verifyOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { address_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        if (!address_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            res.status(400).json({ success: false, message: 'Missing required payment fields' }); return;
        }
        ok(res, await verifyAndPlaceOrder(
            req.customer!.id,
            parseInt(String(address_id)),
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        ));
    } catch (e) { err(res, e, 400); }
};

// GET /customer/orders
export const listOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(String(req.query.page ?? '1'));
        const limit = parseInt(String(req.query.limit ?? '10'));
        ok(res, await getCustomerOrders(req.customer!.id, page, limit));
    } catch (e) { err(res, e); }
};

// GET /customer/orders/:id
export const getOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        ok(res, await getOrderById(parseInt(String(req.params.id)), req.customer!.id));
    } catch (e) { err(res, e, 404); }
};
