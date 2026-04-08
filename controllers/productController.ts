import { Request, Response } from 'express';
import {
    getAllProductsService,
    getProductByIdService,
    getProductBySlugService,
    createProductService,
    updateProductService,
    deleteProductService,
    ProductFilters,
} from '../services/productService';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary';

// ─── Admin Controllers ────────────────────────────────────────────────────────

export const getAllProductsAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { products } = await getAllProductsService({});
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Server error' });
    }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await getProductByIdService(parseInt(req.params.id as string));
        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Server error' });
    }
};

const uploadProductFiles = async (files: Record<string, Express.Multer.File[]>) => {
    const result: { primary_image?: string; secondary_image?: string; images?: { url: string; altText: string }[] } = {};

    if (files.primary_image?.[0]) {
        const uploaded = await uploadToCloudinary(files.primary_image[0].buffer, 'products');
        result.primary_image = uploaded.secure_url;
    }

    if (files.secondary_image?.[0]) {
        const uploaded = await uploadToCloudinary(files.secondary_image[0].buffer, 'products');
        result.secondary_image = uploaded.secure_url;
    }

    if (files.product_images?.length) {
        const uploaded = await Promise.all(
            files.product_images.map(f => uploadToCloudinary(f.buffer, 'products'))
        );
        result.images = uploaded.map(u => ({ url: u.secure_url, altText: '' }));
    }

    return result;
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const files = (req.files as Record<string, Express.Multer.File[]>) || {};
        const uploaded = await uploadProductFiles(files);

        const primary_image = uploaded.primary_image || req.body.primary_image;
        if (!primary_image) {
            res.status(400).json({ success: false, message: 'Primary image is required' });
            return;
        }

        const existingImages = req.body.images ? JSON.parse(req.body.images) : [];

        const product = await createProductService({
            ...req.body,
            primary_image,
            secondary_image: uploaded.secondary_image || req.body.secondary_image,
            stock: parseInt(req.body.stock ?? '0'),
            images: uploaded.images?.length ? uploaded.images : existingImages,
            key_features: req.body.key_features ? JSON.parse(req.body.key_features) : [],
            ingredients: req.body.ingredients ? JSON.parse(req.body.ingredients) : [],
            nutrition_info: req.body.nutrition_info ? JSON.parse(req.body.nutrition_info) : {},
            manufacturer: req.body.manufacturer ? JSON.parse(req.body.manufacturer) : {},
            tags: req.body.tags ? JSON.parse(req.body.tags) : [],
            flavors: req.body.flavors ? JSON.parse(req.body.flavors) : [],
        });

        res.status(201).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Server error' });
    }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id as string);
        const files = (req.files as Record<string, Express.Multer.File[]>) || {};
        const uploaded = await uploadProductFiles(files);

        let updateData: any = { ...req.body };

        if (uploaded.primary_image) updateData.primary_image = uploaded.primary_image;
        if (uploaded.secondary_image) updateData.secondary_image = uploaded.secondary_image;

        // Merge new gallery images with existing ones
        if (uploaded.images?.length) {
            const existing = updateData.images ? JSON.parse(updateData.images) : [];
            updateData.images = [...existing, ...uploaded.images];
        }

        const jsonFields = ['key_features', 'ingredients', 'nutrition_info', 'manufacturer', 'tags', 'flavors', 'images'];
        for (const field of jsonFields) {
            if (updateData[field] && typeof updateData[field] === 'string') {
                updateData[field] = JSON.parse(updateData[field]);
            }
        }
        if (updateData.stock) updateData.stock = parseInt(updateData.stock);

        const product = await updateProductService(id, updateData);
        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Server error' });
    }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await deleteProductService(parseInt(req.params.id as string));
        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        res.status(200).json({ success: true, message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Server error' });
    }
};

// ─── Public Controllers ───────────────────────────────────────────────────────

export const getPublicProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            category, sub_category, brand, is_featured,
            search, min_price, max_price, tags, flavors,
            sort, limit, offset,
        } = req.query;

        const filters: ProductFilters = {
            is_active: true,
            category: category as string,
            sub_category: sub_category as string,
            brand: brand as string,
            is_featured: is_featured === 'true' ? true : undefined,
            search: search as string,
            min_price: min_price ? parseFloat(min_price as string) : undefined,
            max_price: max_price ? parseFloat(max_price as string) : undefined,
            tags: tags ? (tags as string).split(',') : undefined,
            flavors: flavors ? (flavors as string).split(',') : undefined,
            sort: (sort as ProductFilters['sort']) || 'newest',
            limit: limit ? parseInt(limit as string) : 24,
            offset: offset ? parseInt(offset as string) : 0,
        };

        const { products, total } = await getAllProductsService(filters);
        res.status(200).json({ success: true, data: products, total, limit: filters.limit, offset: filters.offset });
    } catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Server error' });
    }
};

export const getPublicProductBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await getProductBySlugService(req.params.slug as string);
        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Server error' });
    }
};
