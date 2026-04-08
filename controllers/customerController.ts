import { Request, Response } from 'express';
import { registerCustomer, loginCustomer, findCustomerById, updateCustomerProfile } from '../services/customerService';
import { generateCustomerToken } from '../utils/customerJwt';

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, phone, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ success: false, message: 'name, email and password are required' });
            return;
        }
        const customer = await registerCustomer({ name, email, phone, password });
        const token = generateCustomerToken({ id: customer.id, email: customer.email, name: customer.name });
        res.status(201).json({ success: true, data: { token, customer } });
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Registration failed';
        res.status(400).json({ success: false, message: msg });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, message: 'email and password are required' });
            return;
        }
        const customer = await loginCustomer(email, password);
        const token = generateCustomerToken({ id: customer.id, email: customer.email, name: customer.name });
        const { password: _, ...safeCustomer } = customer;
        res.status(200).json({ success: true, data: { token, customer: safeCustomer } });
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Login failed';
        res.status(401).json({ success: false, message: msg });
    }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
    try {
        const customer = await findCustomerById(req.customer!.id);
        if (!customer) { res.status(404).json({ success: false, message: 'User not found' }); return; }
        res.status(200).json({ success: true, data: customer });
    } catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Server error' });
    }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, phone } = req.body;
        const customer = await updateCustomerProfile(req.customer!.id, { name, phone });
        res.status(200).json({ success: true, data: customer });
    } catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Server error' });
    }
};
