import { Request, Response, NextFunction } from 'express';
import { verifyCustomerToken, CustomerJWTPayload } from '../utils/customerJwt';


export const customerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, message: 'No token provided' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = verifyCustomerToken(token);
        req.customer = decoded;
        next();
    } catch {
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};
