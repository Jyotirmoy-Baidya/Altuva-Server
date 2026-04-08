import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface CustomerJWTPayload {
    id: number;
    email: string;
    name: string;
}

export const generateCustomerToken = (payload: CustomerJWTPayload): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
};

export const verifyCustomerToken = (token: string): CustomerJWTPayload => {
    return jwt.verify(token, JWT_SECRET) as CustomerJWTPayload;
};
