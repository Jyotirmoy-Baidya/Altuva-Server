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
        const products = await getAllProductsService({});
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Server error' });
    }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await getProductByIdService(parseInt(req.params.id));
        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Server error' });
    }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const file = req.file;
        let primary_image = req.body.primary_image;

        if (file) {
            const uploaded = await uploadToCloudinary(file.buffer, 'products');
            primary_image = uploaded.secure_url;
        }

        if (!primary_image) {
            res.status(400).json({ success: false, message: 'Primary image is required' });
            return;
        }

        const product = await createProductService({
            ...req.body,
            primary_image,
            stock: parseInt(req.body.stock ?? '0'),
            images: req.body.images ? JSON.parse(req.body.images) : [],
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
        const id = parseInt(req.params.id);
        const file = req.file;
        let updateData = { ...req.body };

        if (file) {
            const uploaded = await uploadToCloudinary(file.buffer, 'products');
            updateData.primary_image = uploaded.secure_url;
        }

        // Parse JSON fields if sent as strings
        const jsonFields = ['images', 'key_features', 'ingredients', 'nutrition_info', 'manufacturer', 'tags', 'flavors'];
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
        const product = await deleteProductService(parseInt(req.params.id));
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
            category,
            sub_category,
            brand,
            is_featured,
            search,
            min_price,
            max_price,
            tags,
            flavors,
            limit,
            offset,
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
            limit: limit ? parseInt(limit as string) : 20,
            offset: offset ? parseInt(offset as string) : 0,
        };

        const products = await getAllProductsService(filters);
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Server error' });
    }
};

export const getPublicProductBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
        const product = await getProductBySlugService(req.params.slug);
        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Server error' });
    }
};
