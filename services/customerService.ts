import bcrypt from 'bcryptjs';
import { db, schema } from '../db';
import { eq } from 'drizzle-orm';

const { customerUsers } = schema;

export const findCustomerByEmail = async (email: string) => {
    const result = await db.select().from(customerUsers).where(eq(customerUsers.email, email)).limit(1);
    return result[0] || null;
};

export const findCustomerById = async (id: number) => {
    const result = await db.select({
        id: customerUsers.id,
        name: customerUsers.name,
        email: customerUsers.email,
        phone: customerUsers.phone,
        is_active: customerUsers.is_active,
        created_at: customerUsers.created_at,
        updated_at: customerUsers.updated_at,
    }).from(customerUsers).where(eq(customerUsers.id, id)).limit(1);
    return result[0] || null;
};

export const registerCustomer = async (data: { name: string; email: string; phone?: string; password: string }) => {
    const existing = await findCustomerByEmail(data.email);
    if (existing) throw new Error('Email already registered');

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const result = await db.insert(customerUsers).values({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
    }).returning({
        id: customerUsers.id,
        name: customerUsers.name,
        email: customerUsers.email,
        phone: customerUsers.phone,
        created_at: customerUsers.created_at,
    });
    return result[0];
};

export const loginCustomer = async (email: string, password: string) => {
    const customer = await findCustomerByEmail(email);
    if (!customer) throw new Error('Invalid email or password');
    if (!customer.is_active) throw new Error('Account is deactivated');

    const valid = await bcrypt.compare(password, customer.password);
    if (!valid) throw new Error('Invalid email or password');

    return customer;
};

export const updateCustomerProfile = async (id: number, data: { name?: string; phone?: string }) => {
    const result = await db.update(customerUsers)
        .set({ ...data, updated_at: new Date() })
        .where(eq(customerUsers.id, id))
        .returning({
            id: customerUsers.id,
            name: customerUsers.name,
            email: customerUsers.email,
            phone: customerUsers.phone,
            updated_at: customerUsers.updated_at,
        });
    return result[0] || null;
};
