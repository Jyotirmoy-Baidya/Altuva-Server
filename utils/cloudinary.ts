import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'ddkuoffft',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
    secure_url: string;
    public_id: string;
    format: string;
    width: number;
    height: number;
}

/**
 * Upload image to Cloudinary
 * @param fileBuffer - Image buffer from multer
 * @param folder - Cloudinary folder name
 * @returns Upload result with secure URL
 */
export const uploadToCloudinary = (
    fileBuffer: Buffer,
    folder: string = 'hero-banners'
): Promise<CloudinaryUploadResult> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                upload_preset: 'Altuva',
                resource_type: 'image',
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else if (result) {
                    resolve({
                        secure_url: result.secure_url,
                        public_id: result.public_id,
                        format: result.format,
                        width: result.width,
                        height: result.height,
                    });
                } else {
                    reject(new Error('Upload failed'));
                }
            }
        );

        uploadStream.end(fileBuffer);
    });
};

/**
 * Delete image from Cloudinary
 * @param publicId - Cloudinary public ID
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
};

export default cloudinary;
