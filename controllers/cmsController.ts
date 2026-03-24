import { Request, Response } from 'express';
import {
    getAllHeroBanners,
    getActiveHeroBanners,
    getHeroBannerById,
    createHeroBanner,
    updateHeroBanner,
    deleteHeroBanner,
} from '../services/cmsService';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary';

// Get all hero banners (admin)
export const getAllBanners = async (req: Request, res: Response): Promise<void> => {
    try {
        const banners = await getAllHeroBanners();
        res.status(200).json({
            success: true,
            data: banners,
        });
    } catch (error) {
        console.error('Get all banners error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch banners',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

// Get active hero banners (public)
export const getActiveBanners = async (req: Request, res: Response): Promise<void> => {
    try {
        const banners = await getActiveHeroBanners();
        res.status(200).json({
            success: true,
            data: banners,
        });
    } catch (error) {
        console.error('Get active banners error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch active banners',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

// Get single banner by ID
export const getBannerById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const banner = await getHeroBannerById(parseInt(id as string));

        if (!banner) {
            res.status(404).json({
                success: false,
                message: 'Banner not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: banner,
        });
    } catch (error) {
        console.error('Get banner error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch banner',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

// Create new hero banner with image upload
export const createBanner = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({
                success: false,
                message: 'Image file is required',
            });
            return;
        }

        // Upload image to Cloudinary
        const uploadResult = await uploadToCloudinary(req.file.buffer, 'hero-banners');

        // Create banner in database
        const bannerData = {
            image_url: uploadResult.secure_url,
            title: req.body.title,
            subtitle: req.body.subtitle,
            headtext: req.body.headtext,
            text_color: req.body.text_color,
            cta_button_color: req.body.cta_button_color,
            cta_button_text_color: req.body.cta_button_text_color,
            cta_button_text: req.body.cta_button_text,
            is_active: req.body.is_active === 'true' || req.body.is_active === true,
        };

        const newBanner = await createHeroBanner(bannerData);

        res.status(201).json({
            success: true,
            message: 'Banner created successfully',
            data: newBanner,
        });
    } catch (error) {
        console.error('Create banner error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create banner',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

// Update hero banner
export const updateBannerById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        let updateData: any = { ...req.body };

        // If new image is uploaded, upload to Cloudinary
        if (req.file) {
            const uploadResult = await uploadToCloudinary(req.file.buffer, 'hero-banners');
            updateData.image_url = uploadResult.secure_url;
        }

        // Convert is_active to boolean if present
        if (updateData.is_active !== undefined) {
            updateData.is_active = updateData.is_active === 'true' || updateData.is_active === true;
        }

        const updatedBanner = await updateHeroBanner(parseInt(id as string), updateData);

        if (!updatedBanner) {
            res.status(404).json({
                success: false,
                message: 'Banner not found',
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Banner updated successfully',
            data: updatedBanner,
        });
    } catch (error) {
        console.error('Update banner error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update banner',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};

// Delete hero banner
export const deleteBannerById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Get banner to retrieve image URL for Cloudinary deletion
        const banner = await getHeroBannerById(parseInt(id as string));

        if (!banner) {
            res.status(404).json({
                success: false,
                message: 'Banner not found',
            });
            return;
        }

        // Extract public_id from Cloudinary URL and delete image
        const urlParts = banner.image_url.split('/');
        const publicIdWithExt = urlParts.slice(-2).join('/');
        const publicId = publicIdWithExt.split('.')[0];

        try {
            await deleteFromCloudinary(publicId);
        } catch (cloudinaryError) {
            console.error('Cloudinary deletion error:', cloudinaryError);
            // Continue with database deletion even if Cloudinary deletion fails
        }

        // Delete from database
        const deleted = await deleteHeroBanner(parseInt(id as string));

        if (!deleted) {
            res.status(404).json({
                success: false,
                message: 'Failed to delete banner',
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Banner deleted successfully',
        });
    } catch (error) {
        console.error('Delete banner error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete banner',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
