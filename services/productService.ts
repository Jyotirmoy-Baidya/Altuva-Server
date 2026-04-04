import { db, schema } from '../db';
import { eq, desc, ilike, and, SQL, gte, lte, inArray } from 'drizzle-orm';

const { products } = schema;

export interface CreateProductDTO {
    name: string;
    slug: string;
    brand: string;
    category: string;
    sub_category?: string;
    type?: string;
    price: string;
    discounted_price?: string;
    discount_percentage?: string;
    currency?: string;
    stock: number;
    low_stock_threshold?: number;
    is_in_stock?: boolean;
    sku?: string;
    primary_image: string;
    secondary_image?: string;
    images?: { url: string; altText: string }[];
    description: string;
    detailed_description?: string;
    key_features?: string[];
    ingredients?: string[];
    nutrition_info?: { calories?: string; fat?: string; carbs?: string; protein?: string };
    shelf_life?: string;
    storage_instructions?: string;
    care_instructions?: string;
    country_of_origin?: string;
    manufacturer?: { name?: string; address?: string };
    contact_email?: string;
    contact_phone?: string;
    amazon_link?: string;
    tags?: string[];
    flavors?: string[];
    weight?: string;
    is_active?: boolean;
    is_featured?: boolean;
}

export interface ProductFilters {
    category?: string;
    sub_category?: string;
    brand?: string;
    is_featured?: boolean;
    is_active?: boolean;
    min_price?: number;
    max_price?: number;
    tags?: string[];
    flavors?: string[];
    search?: string;
    limit?: number;
    offset?: number;
}

export const getAllProductsService = async (filters: ProductFilters = {}) => {
    const conditions: SQL[] = [];

    if (filters.is_active !== undefined) {
        conditions.push(eq(products.is_active, filters.is_active));
    }
    if (filters.category) {
        conditions.push(ilike(products.category, filters.category));
    }
    if (filters.sub_category) {
        conditions.push(ilike(products.sub_category, filters.sub_category));
    }
    if (filters.brand) {
        conditions.push(ilike(products.brand, filters.brand));
    }
    if (filters.is_featured !== undefined) {
        conditions.push(eq(products.is_featured, filters.is_featured));
    }
    if (filters.search) {
        conditions.push(ilike(products.name, `%${filters.search}%`));
    }

    const query = db
        .select()
        .from(products)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(products.created_at))
        .limit(filters.limit ?? 20)
        .offset(filters.offset ?? 0);

    return await query;
};

export const getProductByIdService = async (id: number) => {
    const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return result[0] || null;
};

export const getProductBySlugService = async (slug: string) => {
    const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
    return result[0] || null;
};

export const createProductService = async (data: CreateProductDTO) => {
    const result = await db.insert(products).values({
        ...data,
        price: data.price,
        discounted_price: data.discounted_price,
        discount_percentage: data.discount_percentage ?? '0',
        stock: data.stock,
        images: data.images ?? [],
        key_features: data.key_features ?? [],
        ingredients: data.ingredients ?? [],
        nutrition_info: data.nutrition_info ?? {},
        manufacturer: data.manufacturer ?? {},
        tags: data.tags ?? [],
        flavors: data.flavors ?? [],
    }).returning();
    return result[0];
};

export const updateProductService = async (id: number, data: Partial<CreateProductDTO>) => {
    const result = await db
        .update(products)
        .set({ ...data, updated_at: new Date() })
        .where(eq(products.id, id))
        .returning();
    return result[0] || null;
};

export const deleteProductService = async (id: number) => {
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result[0] || null;
};
