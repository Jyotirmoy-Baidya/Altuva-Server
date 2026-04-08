import { db, schema } from '../db';
import { eq, desc, asc, ilike, and, or, SQL, gte, lte, sql, count } from 'drizzle-orm';

// Run once: CREATE EXTENSION IF NOT EXISTS pg_trgm;

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
    sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
    limit?: number;
    offset?: number;
}

const buildConditions = (filters: ProductFilters): SQL[] => {
    const conditions: SQL[] = [];

    if (filters.is_active !== undefined) conditions.push(eq(products.is_active, filters.is_active));
    if (filters.category)    conditions.push(ilike(products.category, filters.category));
    if (filters.sub_category) conditions.push(ilike(products.sub_category, filters.sub_category));
    if (filters.brand)       conditions.push(ilike(products.brand, filters.brand));
    if (filters.is_featured !== undefined) conditions.push(eq(products.is_featured, filters.is_featured));
    if (filters.min_price !== undefined) conditions.push(gte(products.price, String(filters.min_price)));
    if (filters.max_price !== undefined) conditions.push(lte(products.price, String(filters.max_price)));

    if (filters.tags?.length) {
        conditions.push(sql`${products.tags}::jsonb ?| array[${sql.raw(filters.tags.map(t => `'${t.replace(/'/g, "''")}'`).join(','))}]`);
    }

    if (filters.search) {
        const s = filters.search.trim();
        // pg_trgm similarity OR plain ilike fallback for short queries
        conditions.push(or(
            ilike(products.name, `%${s}%`),
            ilike(products.brand, `%${s}%`),
            ilike(products.description, `%${s}%`),
            sql`similarity(${products.name}, ${s}) > 0.15`,
        ) as SQL);
    }

    return conditions;
};

const buildOrderBy = (filters: ProductFilters, hasSearch: boolean) => {
    if (hasSearch) {
        const s = filters.search!.trim();
        return [
            desc(sql`similarity(${products.name}, ${s})`),
            desc(products.created_at),
        ];
    }
    switch (filters.sort) {
        case 'price_asc':  return [asc(products.price)];
        case 'price_desc': return [desc(products.price)];
        case 'popular':    return [desc(products.ratings_count), desc(products.ratings_average)];
        default:           return [desc(products.created_at)];
    }
};

export const getAllProductsService = async (filters: ProductFilters = {}) => {
    const conditions = buildConditions(filters);
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const orderBy = buildOrderBy(filters, !!filters.search);
    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;

    const [rows, [{ total }]] = await Promise.all([
        db.select().from(products).where(where).orderBy(...orderBy).limit(limit).offset(offset),
        db.select({ total: count() }).from(products).where(where),
    ]);

    return { products: rows, total: Number(total) };
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
