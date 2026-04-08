import { db, schema } from '../db';
import { eq } from 'drizzle-orm';

const { deliveryCharges } = schema;

export const getAllDeliveryCharges = async () => {
    return db.select().from(deliveryCharges);
};

export const getApplicableDeliveryCharge = async (orderTotal: number) => {
    const slabs = await db.select().from(deliveryCharges).where(eq(deliveryCharges.is_active, true));

    // Find the matching slab
    const match = slabs.find(slab => {
        const min = Number(slab.min_order_amount);
        const max = slab.max_order_amount !== null ? Number(slab.max_order_amount) : Infinity;
        return orderTotal >= min && orderTotal <= max;
    });

    return match || null;
};

export const createDeliveryCharge = async (data: {
    name: string;
    min_order_amount: string;
    max_order_amount?: string;
    charge: string;
    is_active?: boolean;
}) => {
    const result = await db.insert(deliveryCharges).values(data).returning();
    return result[0];
};

export const updateDeliveryCharge = async (id: number, data: Partial<{
    name: string;
    min_order_amount: string;
    max_order_amount: string;
    charge: string;
    is_active: boolean;
}>) => {
    const result = await db.update(deliveryCharges)
        .set({ ...data, updated_at: new Date() })
        .where(eq(deliveryCharges.id, id))
        .returning();
    return result[0] || null;
};

export const deleteDeliveryCharge = async (id: number) => {
    const result = await db.delete(deliveryCharges).where(eq(deliveryCharges.id, id)).returning();
    return result[0] || null;
};
