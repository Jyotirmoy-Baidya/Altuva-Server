import { db, schema } from '../db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const { adminUsers } = schema;

export interface AdminUser {
    id: number;
    name: string;
    email: string;
    phone_number?: string | null;
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

    const [result] = await db
        .insert(adminUsers)
        .values({
            name,
            email,
            phone_number,
            password: hashedPassword,
            role,
            approved,
        })
        .returning({
            id: adminUsers.id,
            name: adminUsers.name,
            email: adminUsers.email,
            phone_number: adminUsers.phone_number,
            role: adminUsers.role,
            approved: adminUsers.approved,
            created_at: adminUsers.created_at,
            updated_at: adminUsers.updated_at,
        });

    return result;
};

export const findAdminByEmail = async (email: string): Promise<AdminUser | null> => {
    const result = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.email, email))
        .limit(1);

    return result[0] || null;
};

export const findAdminById = async (id: number): Promise<Omit<AdminUser, 'password'> | null> => {
    const result = await db
        .select({
            id: adminUsers.id,
            name: adminUsers.name,
            email: adminUsers.email,
            phone_number: adminUsers.phone_number,
            role: adminUsers.role,
            approved: adminUsers.approved,
            created_at: adminUsers.created_at,
            updated_at: adminUsers.updated_at,
        })
        .from(adminUsers)
        .where(eq(adminUsers.id, id))
        .limit(1);

    return result[0] || null;
};

export const verifyPassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(plainPassword, hashedPassword);
};
