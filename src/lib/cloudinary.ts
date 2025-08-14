import { v2 as cloudinary } from 'cloudinary';

if (!process.env.CLOUDINARY_CLOUD_NAME) {
  throw new Error('CLOUDINARY_CLOUD_NAME is not set');
}

if (!process.env.CLOUDINARY_API_KEY) {
  throw new Error('CLOUDINARY_API_KEY is not set');
}

if (!process.env.CLOUDINARY_API_SECRET) {
  throw new Error('CLOUDINARY_API_SECRET is not set');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  public_id: string;
  url: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  bytes: number;
}

export async function uploadImage(
  file: Buffer | string,
  options?: {
    folder?: string;
    transformation?: Record<string, unknown>;
    public_id?: string;
  }
): Promise<CloudinaryUploadResult> {
  try {
    const result = await cloudinary.uploader.upload(file as string, {
      folder: options?.folder || 'purebite',
      transformation: options?.transformation,
      public_id: options?.public_id,
      resource_type: 'image',
      quality: 'auto',
      fetch_format: 'auto',
    });

    return result as CloudinaryUploadResult;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
}

export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image from Cloudinary');
  }
}

export function getOptimizedImageUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  }
): string {
  return cloudinary.url(publicId, {
    width: options?.width,
    height: options?.height,
    crop: options?.crop || 'fill',
    quality: options?.quality || 'auto',
    format: options?.format || 'auto',
    secure: true,
  });
}

export function getImageTransformations() {
  return {
    product_thumbnail: {
      width: 300,
      height: 300,
      crop: 'fill',
      quality: 'auto',
      format: 'auto',
    },
    product_medium: {
      width: 600,
      height: 600,
      crop: 'fill',
      quality: 'auto',
      format: 'auto',
    },
    product_large: {
      width: 1200,
      height: 1200,
      crop: 'fill',
      quality: 'auto',
      format: 'auto',
    },
    avatar: {
      width: 150,
      height: 150,
      crop: 'fill',
      quality: 'auto',
      format: 'auto',
      gravity: 'face',
    }
  };
}

export default cloudinary;