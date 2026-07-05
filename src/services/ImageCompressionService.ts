export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface CompressionResult {
  compressedFile: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

class ImageCompressionService {
  private readonly DEFAULT_OPTIONS: CompressionOptions = {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.8,
    format: 'jpeg',
  };

  async compressImage(
    file: File,
    options: CompressionOptions = {}
  ): Promise<CompressionResult> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    const originalSize = file.size;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const img = new Image();
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Calculate new dimensions
          let { width, height } = img;
          const { maxWidth, maxHeight } = opts;

          if (maxWidth && width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          if (maxHeight && height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              const compressedFile = new File([blob], file.name, {
                type: `image/${opts.format}`,
                lastModified: Date.now(),
              });

              resolve({
                compressedFile,
                originalSize,
                compressedSize: compressedFile.size,
                compressionRatio: ((originalSize - compressedFile.size) / originalSize) * 100,
              });
            },
            `image/${opts.format}`,
            opts.quality
          );
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };

        img.src = event.target?.result as string;
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  async compressProfileImage(file: File): Promise<CompressionResult> {
    return this.compressImage(file, {
      maxWidth: 500,
      maxHeight: 500,
      quality: 0.85,
      format: 'jpeg',
    });
  }

  async compressProductImage(file: File): Promise<CompressionResult> {
    return this.compressImage(file, {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.8,
      format: 'webp',
    });
  }

  async compressThumbnail(file: File): Promise<CompressionResult> {
    return this.compressImage(file, {
      maxWidth: 300,
      maxHeight: 300,
      quality: 0.75,
      format: 'webp',
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

export const imageCompressionService = new ImageCompressionService();
