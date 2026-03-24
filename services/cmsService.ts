import { pool } from '../db';

export interface HeroBanner {
    id: number;
    image_url: string;
    title: string;
    subtitle?: string;
    headtext?: string;
    text_color: string;
    cta_button_color: string;
    cta_button_text_color: string;
    cta_button_text?: string;
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
    const query = 'SELECT * FROM hero_banners ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
};

// Get active hero banners
export const getActiveHeroBanners = async (): Promise<HeroBanner[]> => {
    const query = 'SELECT * FROM hero_banners WHERE is_active = true ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
};

// Get single hero banner by ID
export const getHeroBannerById = async (id: number): Promise<HeroBanner | null> => {
    const query = 'SELECT * FROM hero_banners WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
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

    const query = `
        INSERT INTO hero_banners (
            image_url, title, subtitle, headtext, text_color,
            cta_button_color, cta_button_text_color, cta_button_text, is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
    `;

    const values = [
        image_url,
        title,
        subtitle,
        headtext,
        text_color,
        cta_button_color,
        cta_button_text_color,
        cta_button_text,
        is_active,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

// Update hero banner
export const updateHeroBanner = async (id: number, data: UpdateHeroBannerDTO): Promise<HeroBanner | null> => {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
            fields.push(`${key} = $${paramCount}`);
            values.push(value);
            paramCount++;
        }
    });

    if (fields.length === 0) {
        return getHeroBannerById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
        UPDATE hero_banners
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
};

// Delete hero banner
export const deleteHeroBanner = async (id: number): Promise<boolean> => {
    const query = 'DELETE FROM hero_banners WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
};
