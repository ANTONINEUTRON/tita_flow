import { v2 as cloudinary } from 'cloudinary';

/**
 * CloudinaryService - A reusable service to handle uploads to Cloudinary
 */
export class CloudinaryService {
  private static instance: CloudinaryService;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Configure cloudinary with environment variables
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_SECRETS,
    });
  }

  /**
   * Get the singleton instance of CloudinaryService
   */
  public static getInstance(): CloudinaryService {
    if (!CloudinaryService.instance) {
      CloudinaryService.instance = new CloudinaryService();
    }
    return CloudinaryService.instance;
  }

    private async getFileUri(file: File): Promise<string> {
      const fileBuffer = await (file.arrayBuffer());

      const base64Data = fileBuffer
          ? Buffer.from(fileBuffer).toString("base64")
          : "";
      return "data:" + file.type + ";base64," + base64Data;
  }

  /**
   * Upload a file to Cloudinary
   * 
   * @param file - The file to upload (can be a buffer, base64 string, or URL)
   * @param options - Upload options
   * @returns Promise resolving to the upload result
   */
  public async uploadFile(
    file: File,
    options: {
      folder?: string;
      resourceType?: 'image' | 'video' | 'auto' | 'raw';
      publicId?: string;
      tags?: string[];
      transformation?: any;
      overwrite?: boolean;
    } = {}
  ): Promise<CloudinaryUploadResult> {
    return new Promise(async (resolve, reject) => {
      cloudinary.uploader.upload(
        await this.getFileUri(file),
        {
          resource_type: options.resourceType || 'auto',
          folder: options.folder,
          public_id: options.publicId,
          tags: options.tags,
          transformation: options.transformation,
          overwrite: options.overwrite !== undefined ? options.overwrite : true,
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          
          if (!result) {
            return reject(new Error("Upload failed: No result returned"));
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
            resourceType: result.resource_type,
            createdAt: result.created_at,
          });
        }
      );
    });
  }

  /**
   * Upload multiple files to Cloudinary
   * 
   * @param files - Array of files to upload
   * @param options - Upload options
   * @returns Promise resolving to array of upload results
   */
  public async uploadMultipleFiles(
    files: File[],
    options: {
      folder?: string;
      resourceType?: 'image' | 'video' | 'auto' | 'raw';
      tags?: string[];
    } = {}
  ): Promise<CloudinaryUploadResult[]> {
    const uploadPromises = files.map(file => 
      this.uploadFile(file, options)
    );
    
    return Promise.all(uploadPromises);
  }

  /**
   * Delete a file from Cloudinary
   * 
   * @param publicId - The public ID of the file to delete
   * @param options - Delete options
   * @returns Promise resolving to delete result
   */
  public async deleteFile(
    publicId: string,
    options: {
      resourceType?: 'image' | 'video' | 'raw';
    } = {}
  ): Promise<CloudinaryDeleteResult> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        publicId,
        {
          resource_type: options.resourceType || 'image',
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve({
            result: result?.result,
            publicId: publicId
          });
        }
      );
    });
  }
}

// Define result types for better TypeScript support
export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  format?: string;
  width?: number;
  height?: number;
  resourceType?: string;
  createdAt?: string;
}

export interface CloudinaryDeleteResult {
  result: string;
  publicId: string;
}