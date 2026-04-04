import { db, schema } from '../db';
import { eq, desc } from 'drizzle-orm';

const { heroBanners } = schema;

export interface HeroBanner {
    id: number;
    image_url: string;
    title: string;
    subtitle?: string | null;
    headtext?: string | null;
    text_color: string | null;
    cta_button_color: string | null;
    cta_button_text_color: string | null;
    cta_button_text?: string | null;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface CreateHeroBannerDTO {
    image_url: string;
    title: string;
    subtitle?: string;
    headtext?: string;
    text_color?: string;
    cta_button_color?: string;
    cta_button_text_color?: string;
    cta_button_text?: string;
    is_active?: boolean;
}

export interface UpdateHeroBannerDTO {
    image_url?: string;
    title?: string;
    subtitle?: string;
    headtext?: string;
    text_color?: string;
    cta_button_color?: string;
    cta_button_text_color?: string;
    cta_button_text?: string;
    is_active?: boolean;
}

// Get all hero banners
export const getAllHeroBanners = async (): Promise<HeroBanner[]> => {
    const result = await db
        .select()
        .from(heroBanners)
        .orderBy(desc(heroBanners.created_at));

    return result;
};

// Get active hero banners
export const getActiveHeroBanners = async (): Promise<HeroBanner[]> => {
    const result = await db
        .select()
        .from(heroBanners)
        .where(eq(heroBanners.is_active, true))
        .orderBy(desc(heroBanners.created_at));

    return result;
};

// Get single hero banner by ID
export const getHeroBannerById = async (id: number): Promise<HeroBanner | null> => {
    const result = await db
        .select()
        .from(heroBanners)
        .where(eq(heroBanners.id, id))
        .limit(1);

    return result[0] || null;
};

// Create new hero banner
export const createHeroBanner = async (data: CreateHeroBannerDTO): Promise<HeroBanner> => {
    const {
        image_url,
        title,
        subtitle,
        headtext,
        text_color = '#000000',
        cta_button_color = '#000000',
        cta_button_text_color = '#FFFFFF',
        cta_button_text,
        is_active = true,
    } = data;

    const [result] = await db
        .insert(heroBanners)
        .values({
            image_url,
            title,
            subtitle,
            headtext,
            text_color,
            cta_button_color,
            cta_button_text_color,
            cta_button_text,
            is_active,
        })
        .returning();

    return result;
};

// Update hero banner
export const updateHeroBanner = async (id: number, data: UpdateHeroBannerDTO): Promise<HeroBanner | null> => {
    if (Object.keys(data).length === 0) {
        return getHeroBannerById(id);
    }

    const result = await db
        .update(heroBanners)
        .set({
            ...data,
            updated_at: new Date(),
        })
        .where(eq(heroBanners.id, id))
        .returning();

    return result[0] || null;
};

// Delete hero banner
export const deleteHeroBanner = async (id: number): Promise<boolean> => {
    const result = await db
        .delete(heroBanners)
        .where(eq(heroBanners.id, id))
        .returning({ id: heroBanners.id });

    return result.length > 0;
};
