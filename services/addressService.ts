import { db, schema } from '../db';
import { eq, and } from 'drizzle-orm';

const { addresses } = schema;

export interface AddressDTO {
    name: string;
    address_line_1: string;
    address_line_2?: string;
    landmark?: string;
    pin: string;
    city: string;
    state: string;
    country?: string;
    is_default?: boolean;
}

export const getCustomerAddresses = async (customerId: number) => {
    return db.select().from(addresses).where(eq(addresses.customer_id, customerId));
};

export const getAddressById = async (id: number, customerId: number) => {
    const result = await db.select().from(addresses)
        .where(and(eq(addresses.id, id), eq(addresses.customer_id, customerId)))
        .limit(1);
    return result[0] || null;
};

export const addAddress = async (customerId: number, data: AddressDTO) => {
    // If this is set as default, unset others first
    if (data.is_default) {
        await db.update(addresses).set({ is_default: false }).where(eq(addresses.customer_id, customerId));
    }
    const result = await db.insert(addresses).values({ ...data, customer_id: customerId }).returning();
    return result[0];
};

export const updateAddress = async (id: number, customerId: number, data: Partial<AddressDTO>) => {
    if (data.is_default) {
        await db.update(addresses).set({ is_default: false }).where(eq(addresses.customer_id, customerId));
    }
    const result = await db.update(addresses)
        .set({ ...data, updated_at: new Date() })
        .where(and(eq(addresses.id, id), eq(addresses.customer_id, customerId)))
        .returning();
    return result[0] || null;
};

export const deleteAddress = async (id: number, customerId: number) => {
    const result = await db.delete(addresses)
        .where(and(eq(addresses.id, id), eq(addresses.customer_id, customerId)))
        .returning();
    return result[0] || null;
};

export const setDefaultAddress = async (id: number, customerId: number) => {
    await db.update(addresses).set({ is_default: false }).where(eq(addresses.customer_id, customerId));
    const result = await db.update(addresses)
        .set({ is_default: true, updated_at: new Date() })
        .where(and(eq(addresses.id, id), eq(addresses.customer_id, customerId)))
        .returning();
    return result[0] || null;
};
