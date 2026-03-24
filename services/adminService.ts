import { pool } from '../db';
import bcrypt from 'bcryptjs';

export interface AdminUser {
    id: number;
    name: string;
    email: string;
    phone_number?: string;
    password: string;
    role: string;
    approved: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface CreateAdminUserDTO {
    name: string;
    email: string;
    phone_number?: string;
    password: string;
    role?: string;
    approved?: boolean;
}

export const createAdminUser = async (userData: CreateAdminUserDTO): Promise<Omit<AdminUser, 'password'>> => {
    const { name, email, phone_number, password, role = 'admin', approved = false } = userData;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
        INSERT INTO admin_users (name, email, phone_number, password, role, approved)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, name, email, phone_number, role, approved, created_at, updated_at
    `;

    const values = [name, email, phone_number, hashedPassword, role, approved];
    const result = await pool.query(query, values);

    return result.rows[0];
};

export const findAdminByEmail = async (email: string): Promise<AdminUser | null> => {
    const query = 'SELECT * FROM admin_users WHERE email = $1';
    const result = await pool.query(query, [email]);

    return result.rows[0] || null;
};

export const findAdminById = async (id: number): Promise<Omit<AdminUser, 'password'> | null> => {
    const query = `
        SELECT id, name, email, phone_number, role, approved, created_at, updated_at
        FROM admin_users
        WHERE id = $1
    `;
    const result = await pool.query(query, [id]);

    return result.rows[0] || null;
};

export const verifyPassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(plainPassword, hashedPassword);
};
