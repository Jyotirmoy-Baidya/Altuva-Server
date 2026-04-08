import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt';


export const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'No token provided. Authorization header must be in format: Bearer <token>'
            });
            return;
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = verifyToken(token);

        // Check if user is approved
        if (!decoded.approved) {
            res.status(403).json({
                success: false,
                message: 'Your account is not approved yet. Please contact administrator.'
            });
            return;
        }

        // Attach user to request
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
