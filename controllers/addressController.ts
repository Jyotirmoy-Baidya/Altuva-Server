import { Request, Response } from 'express';
import { getCustomerAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../services/addressService';

const ok = (res: Response, data: any, status = 200) => res.status(status).json({ success: true, data });
const err = (res: Response, error: unknown, status = 500) =>
    res.status(status).json({ success: false, message: error instanceof Error ? error.message : 'Server error' });

export const getAddresses = async (req: Request, res: Response): Promise<void> => {
    try { ok(res, await getCustomerAddresses(req.customer!.id)); } catch (e) { err(res, e); }
};

export const addAddressHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, address_line_1, address_line_2, landmark, pin, city, state, country, is_default } = req.body;
        if (!name || !address_line_1 || !pin || !city || !state) {
            res.status(400).json({ success: false, message: 'name, address_line_1, pin, city, state are required' });
            return;
        }
        ok(res, await addAddress(req.customer!.id, { name, address_line_1, address_line_2, landmark, pin, city, state, country, is_default }), 201);
    } catch (e) { err(res, e); }
};

export const updateAddressHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const address = await updateAddress(parseInt(req.params.id), req.customer!.id, req.body);
        if (!address) { res.status(404).json({ success: false, message: 'Address not found' }); return; }
        ok(res, address);
    } catch (e) { err(res, e); }
};

export const deleteAddressHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const address = await deleteAddress(parseInt(req.params.id), req.customer!.id);
        if (!address) { res.status(404).json({ success: false, message: 'Address not found' }); return; }
        ok(res, { message: 'Address deleted' });
    } catch (e) { err(res, e); }
};

export const setDefaultAddressHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const address = await setDefaultAddress(parseInt(req.params.id), req.customer!.id);
        if (!address) { res.status(404).json({ success: false, message: 'Address not found' }); return; }
        ok(res, address);
    } catch (e) { err(res, e); }
};
