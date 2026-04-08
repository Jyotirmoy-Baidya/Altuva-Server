import { Request, Response } from 'express';
import {
    getCart, addToCart, updateCartItem,
    removeFromCart, clearCart, applyDiscount, removeDiscount,
} from '../services/cartService';

const ok = (res: Response, data: any) => res.status(200).json({ success: true, data });
const err = (res: Response, error: unknown, status = 500) =>
    res.status(status).json({ success: false, message: error instanceof Error ? error.message : 'Server error' });

export const getCartHandler = async (req: Request, res: Response): Promise<void> => {
    try { ok(res, await getCart(req.customer!.id)); } catch (e) { err(res, e); }
};

export const addToCartHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const productId = parseInt(String(req.params.productId));
        const quantity = parseInt(req.body.quantity ?? '1');
        ok(res, await addToCart(req.customer!.id, productId, quantity));
    } catch (e) { err(res, e, 400); }
};

export const updateCartItemHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const productId = parseInt(String(req.params.productId));
        const quantity = parseInt(req.body.quantity);
        if (isNaN(quantity)) { res.status(400).json({ success: false, message: 'quantity is required' }); return; }
        ok(res, await updateCartItem(req.customer!.id, productId, quantity));
    } catch (e) { err(res, e, 400); }
};

export const removeFromCartHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        ok(res, await removeFromCart(req.customer!.id, parseInt(String(req.params.productId))));
    } catch (e) { err(res, e); }
};

export const clearCartHandler = async (req: Request, res: Response): Promise<void> => {
    try { ok(res, await clearCart(req.customer!.id)); } catch (e) { err(res, e); }
};

export const applyDiscountHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { code } = req.body;
        if (!code) { res.status(400).json({ success: false, message: 'code is required' }); return; }
        ok(res, await applyDiscount(req.customer!.id, code));
    } catch (e) { err(res, e, 400); }
};

export const removeDiscountHandler = async (req: Request, res: Response): Promise<void> => {
    try { ok(res, await removeDiscount(req.customer!.id)); } catch (e) { err(res, e); }
};
