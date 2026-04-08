import { db, schema } from '../db';
import { eq } from 'drizzle-orm';

const { taxes } = schema;

export const getAllTaxes = async (activeOnly = false) => {
    if (activeOnly) {
        return db.select().from(taxes).where(eq(taxes.is_active, true));
    }
    return db.select().from(taxes);
};

export const createTax = async (data: { name: string; type: string; value: string; is_active?: boolean }) => {
    const result = await db.insert(taxes).values(data).returning();
    return result[0];
};

export const updateTax = async (id: number, data: Partial<{ name: string; type: string; value: string; is_active: boolean }>) => {
    const result = await db.update(taxes)
        .set({ ...data, updated_at: new Date() })
        .where(eq(taxes.id, id))
        .returning();
    return result[0] || null;
};

export const deleteTax = async (id: number) => {
    const result = await db.delete(taxes).where(eq(taxes.id, id)).returning();
    return result[0] || null;
};
