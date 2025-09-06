// Image Upload Service - Coffee & Tea E-commerce
// Handles image upload, processing, and management for products

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { AppError, ValidationError } from '../utils/errors';

// ================================
// TYPE DEFINITIONS
// ================================

interface ImageUploadOptions {
  maxSize?: number; // in bytes
  allowedFormats?: string[];
  quality?: number;
  resize?: {
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  };
}

interface ProcessedImage {
  filename: string;
  originalName: string;
  path: string;
  url: string;
  size: number;
  width: number;
  height: number;
  format: string;
  thumbnails?: {
    small: ProcessedImage;
    medium: ProcessedImage;
    large: ProcessedImage;
  };
}

interface ImageVariant {
  name: string;
  width: number;
  height: number;
  quality: number;
  suffix: string;
}

// ================================
// CONFIGURATION
// ================================

const UPLOAD_CONFIG = {
  // Maximum file size: 10MB
  maxSize: 10 * 1024 * 1024,
  
  // Allowed image formats
  allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  
  // Default quality for compression
  defaultQuality: 85,
  
  // Image variants to generate
  variants: [
    { name: 'thumbnail', width: 150, height: 150, quality: 80, suffix: '_thumb' },
    { name: 'small', width: 300, height: 300, quality: 85, suffix: '_small' },
    { name: 'medium', width: 600, height: 600, quality: 85, suffix: '_medium' },
    { name: 'large', width: 1200, height: 1200, quality: 90, suffix: '_large' }
  ] as ImageVariant[],
  
  // Upload directories
  uploadDir: 'uploads',
  productImageDir: 'uploads/products',
  categoryImageDir: 'uploads/categories',
  tempDir: 'uploads/temp'
};

// ================================
// IMAGE UPLOAD SERVICE
// ================================

export class ImageUploadService {
  
  constructor() {
    this.ensureDirectoriesExist();
  }

  // ================================
  // DIRECTORY MANAGEMENT
  // ================================

  private ensureDirectoriesExist(): void {
    const directories = [
      UPLOAD_CONFIG.uploadDir,
      UPLOAD_CONFIG.productImageDir,
      UPLOAD_CONFIG.categoryImageDir,
      UPLOAD_CONFIG.tempDir
    ];

    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // ================================
  // MULTER CONFIGURATION
  // ================================

  getMulterConfig(options: ImageUploadOptions = {}): multer.Options {
    const maxSize = options.maxSize || UPLOAD_CONFIG.maxSize;
    const allowedFormats = options.allowedFormats || UPLOAD_CONFIG.allowedFormats;

    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, UPLOAD_CONFIG.tempDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = uuidv4();
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${uniqueSuffix}${ext}`);
      }
    });

    const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      const ext = path.extname(file.originalname).toLowerCase().substring(1);
      
      if (!allowedFormats.includes(ext)) {
        cb(new ValidationError(`Invalid file format. Allowed formats: ${allowedFormats.join(', ')}`));
        return;
      }

      if (file.mimetype && !file.mimetype.startsWith('image/')) {
        cb(new ValidationError('File must be an image'));
        return;
      }

      cb(null, true);
    };

    return {
      storage,
      fileFilter,
      limits: {
        fileSize: maxSize,
        files: 10 // Maximum 10 files per upload
      }
    };
  }

  // ================================
  // IMAGE PROCESSING
  // ================================

  async processImage(
    inputPath: string,
    outputDir: string,
    options: ImageUploadOptions = {}
  ): Promise<ProcessedImage> {
    try {
      const filename = path.basename(inputPath, path.extname(inputPath));
      const ext = path.extname(inputPath);
      const originalName = filename + ext;
      
      // Get image metadata
      const metadata = await sharp(inputPath).metadata();
      
      if (!metadata.width || !metadata.height) {
        throw new ValidationError('Unable to read image dimensions');
      }

      // Process main image
      const mainFilename = `${filename}.webp`;
      const mainPath = path.join(outputDir, mainFilename);
      
      let sharpInstance = sharp(inputPath);

      // Resize if specified
      if (options.resize) {
        sharpInstance = sharpInstance.resize({
          width: options.resize.width,
          height: options.resize.height,
          fit: options.resize.fit || 'cover',
          withoutEnlargement: true
        });
      }

      // Convert to WebP with quality setting
      const quality = options.quality || UPLOAD_CONFIG.defaultQuality;
      await sharpInstance
        .webp({ quality })
        .toFile(mainPath);

      // Get processed image metadata
      const processedMetadata = await sharp(mainPath).metadata();

      const processedImage: ProcessedImage = {
        filename: mainFilename,
        originalName,
        path: mainPath,
        url: this.getImageUrl(mainPath),
        size: fs.statSync(mainPath).size,
        width: processedMetadata.width || 0,
        height: processedMetadata.height || 0,
        format: 'webp'
      };

      // Generate thumbnails
      const thumbnails = await this.generateThumbnails(inputPath, outputDir, filename);
      if (thumbnails) {
        processedImage.thumbnails = thumbnails;
      }

      // Clean up temporary file
      if (inputPath.includes(UPLOAD_CONFIG.tempDir)) {
        fs.unlinkSync(inputPath);
      }

      return processedImage;

    } catch (error) {
      // Clean up on error
      if (inputPath.includes(UPLOAD_CONFIG.tempDir) && fs.existsSync(inputPath)) {
        fs.unlinkSync(inputPath);
      }
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError('Failed to process image', 500);
    }
  }

  // ================================
  // THUMBNAIL GENERATION
  // ================================

  private async generateThumbnails(
    inputPath: string,
    outputDir: string,
    baseFilename: string
  ): Promise<{ small: ProcessedImage; medium: ProcessedImage; large: ProcessedImage } | undefined> {
    try {
      const thumbnails: any = {};

      for (const variant of UPLOAD_CONFIG.variants) {
        if (['small', 'medium', 'large'].includes(variant.name)) {
          const thumbnailFilename = `${baseFilename}${variant.suffix}.webp`;
          const thumbnailPath = path.join(outputDir, thumbnailFilename);

          await sharp(inputPath)
            .resize({
              width: variant.width,
              height: variant.height,
              fit: 'cover',
              withoutEnlargement: true
            })
            .webp({ quality: variant.quality })
            .toFile(thumbnailPath);

          const metadata = await sharp(thumbnailPath).metadata();

          thumbnails[variant.name] = {
            filename: thumbnailFilename,
            originalName: `${baseFilename}${variant.suffix}`,
            path: thumbnailPath,
            url: this.getImageUrl(thumbnailPath),
            size: fs.statSync(thumbnailPath).size,
            width: metadata.width || 0,
            height: metadata.height || 0,
            format: 'webp'
          };
        }
      }

      return thumbnails;

    } catch (error) {
      console.error('Error generating thumbnails:', error);
      return undefined;
    }
  }

  // ================================
  // BATCH PROCESSING
  // ================================

  async processMultipleImages(
    files: Express.Multer.File[],
    outputDir: string,
    options: ImageUploadOptions = {}
  ): Promise<ProcessedImage[]> {
    const results: ProcessedImage[] = [];

    for (const file of files) {
      try {
        const processedImage = await this.processImage(file.path, outputDir, options);
        results.push(processedImage);
      } catch (error) {
        console.error(`Error processing file ${file.originalname}:`, error);
        // Continue with other files even if one fails
      }
    }

    return results;
  }

  // ================================
  // IMAGE MANAGEMENT
  // ================================

  async deleteImage(imagePath: string): Promise<void> {
    try {
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      // Also delete thumbnails if they exist
      const dir = path.dirname(imagePath);
      const filename = path.basename(imagePath, path.extname(imagePath));
      
      for (const variant of UPLOAD_CONFIG.variants) {
        const thumbnailPath = path.join(dir, `${filename}${variant.suffix}.webp`);
        if (fs.existsSync(thumbnailPath)) {
          fs.unlinkSync(thumbnailPath);
        }
      }

    } catch (error) {
      console.error('Error deleting image:', error);
      // Don't throw error for deletion failures
    }
  }

  async deleteMultipleImages(imagePaths: string[]): Promise<void> {
    for (const imagePath of imagePaths) {
      await this.deleteImage(imagePath);
    }
  }

  // ================================
  // URL GENERATION
  // ================================

  private getImageUrl(filePath: string): string {
    // Convert absolute path to relative URL
    const relativePath = path.relative(process.cwd(), filePath);
    return `/${relativePath.replace(/\\/g, '/')}`;
  }

  getProductImageDir(productId: string): string {
    const dir = path.join(UPLOAD_CONFIG.productImageDir, productId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  getCategoryImageDir(categoryId: string): string {
    const dir = path.join(UPLOAD_CONFIG.categoryImageDir, categoryId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  // ================================
  // VALIDATION
  // ================================

  validateImageFile(file: Express.Multer.File): void {
    const ext = path.extname(file.originalname).toLowerCase().substring(1);
    
    if (!UPLOAD_CONFIG.allowedFormats.includes(ext)) {
      throw new ValidationError(`Invalid file format. Allowed formats: ${UPLOAD_CONFIG.allowedFormats.join(', ')}`);
    }

    if (file.size > UPLOAD_CONFIG.maxSize) {
      throw new ValidationError(`File size too large. Maximum size: ${UPLOAD_CONFIG.maxSize / (1024 * 1024)}MB`);
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new ValidationError('File must be an image');
    }
  }

  // ================================
  // UTILITY METHODS
  // ================================

  getImageInfo(imagePath: string): Promise<sharp.Metadata> {
    return sharp(imagePath).metadata();
  }

  async optimizeExistingImage(imagePath: string, quality: number = 85): Promise<void> {
    const tempPath = `${imagePath}.temp`;
    
    await sharp(imagePath)
      .webp({ quality })
      .toFile(tempPath);
    
    fs.renameSync(tempPath, imagePath);
  }

  // ================================
  // STORAGE STATS
  // ================================

  getStorageStats(): {
    totalSize: number;
    fileCount: number;
    directories: { [key: string]: { size: number; files: number } };
  } {
    const stats = {
      totalSize: 0,
      fileCount: 0,
      directories: {} as { [key: string]: { size: number; files: number } }
    };

    const scanDirectory = (dir: string): { size: number; files: number } => {
      if (!fs.existsSync(dir)) {
        return { size: 0, files: 0 };
      }

      let dirSize = 0;
      let dirFiles = 0;

      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          const subStats = scanDirectory(filePath);
          dirSize += subStats.size;
          dirFiles += subStats.files;
        } else {
          dirSize += stat.size;
          dirFiles += 1;
        }
      }

      return { size: dirSize, files: dirFiles };
    };

    // Scan each upload directory
    const directories = [
      UPLOAD_CONFIG.productImageDir,
      UPLOAD_CONFIG.categoryImageDir,
      UPLOAD_CONFIG.tempDir
    ];

    for (const dir of directories) {
      const dirStats = scanDirectory(dir);
      stats.directories[path.basename(dir)] = dirStats;
      stats.totalSize += dirStats.size;
      stats.fileCount += dirStats.files;
    }

    return stats;
  }
}

// ================================
// SINGLETON INSTANCE
// ================================

export const imageUploadService = new ImageUploadService();
export default ImageUploadService;
