/**
 * Image Compression Utility
 * Compresses images to approximately 14KB target size
 * Optimized for maximum speed with smart quality estimation
 */

const TARGET_SIZE_KB = 14;
const TARGET_SIZE_BYTES = TARGET_SIZE_KB * 1024; // 14KB in bytes
const MAX_WIDTH = 1000; // Reduced for faster processing
const MAX_HEIGHT = 700; // Reduced for faster processing
const MIN_QUALITY = 0.15;
const MAX_ITERATIONS = 4; // Very few iterations for speed

/**
 * Compress an image file to approximately 14KB
 * @param {File} file - Original image file
 * @returns {Promise<File>} Compressed image file
 */
export const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        
        // Aggressive initial resizing for faster compression
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }
        
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Fast rendering settings
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'low'; // Fastest rendering
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);
        
        // Smart quality estimation based on original file size
        const originalSizeMB = file.size / (1024 * 1024);
        let initialQuality = 0.5; // Start lower for speed
        
        // Estimate initial quality based on file size
        if (originalSizeMB > 5) {
          initialQuality = 0.3; // Very large files
        } else if (originalSizeMB > 2) {
          initialQuality = 0.4; // Large files
        } else if (originalSizeMB > 1) {
          initialQuality = 0.5; // Medium files
        } else {
          initialQuality = 0.6; // Smaller files
        }
        
        // Fast compression with smart quality steps
        compressFast(canvas, file.name, initialQuality, resolve, reject);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Fast compression with predefined quality steps
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {string} originalFileName - Original file name
 * @param {number} initialQuality - Starting quality
 * @param {Function} resolve - Success callback
 * @param {Function} reject - Error callback
 */
const compressFast = (
  canvas: HTMLCanvasElement,
  originalFileName: string,
  initialQuality: number,
  resolve: (file: File) => void,
  reject: (error: Error) => void
) => {
  // Predefined quality steps for fast compression
  const qualitySteps = [initialQuality, initialQuality * 0.7, initialQuality * 0.5, initialQuality * 0.3, MIN_QUALITY];
  let currentStep = 0;
  
  const tryCompress = (): void => {
    if (currentStep >= qualitySteps.length || currentStep >= MAX_ITERATIONS) {
      // Use last attempt or return error
      reject(new Error('Failed to compress image to target size'));
      return;
    }
    
    const quality = Math.max(MIN_QUALITY, qualitySteps[currentStep]);
    currentStep++;
    
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          if (currentStep < qualitySteps.length) {
            tryCompress();
            return;
          }
          reject(new Error('Failed to compress image'));
          return;
        }
        
        const sizeKB = blob.size / 1024;
        
        // Accept if within 30% of target or below target (more lenient for speed)
        const sizeDiff = Math.abs(sizeKB - TARGET_SIZE_KB) / TARGET_SIZE_KB;
        if (blob.size <= TARGET_SIZE_BYTES || sizeDiff <= 0.3 || currentStep >= MAX_ITERATIONS) {
          const fileName = originalFileName.replace(/\.[^/.]+$/, '') || 'compressed';
          const compressedFile = new File(
            [blob],
            `${fileName}.webp`,
            { type: 'image/webp' }
          );
          
          if (import.meta.env.DEV) {
            console.log(`✅ Image compressed: ${sizeKB.toFixed(2)}KB (target: ${TARGET_SIZE_KB}KB) in ${currentStep} step(s)`);
          }
          
          resolve(compressedFile);
          return;
        }
        
        // Try next quality step
        tryCompress();
      },
      'image/webp',
      quality
    );
  };
  
  tryCompress();
};

/**
 * Get file size in KB
 * @param {File} file - File to check
 * @returns {number} Size in KB
 */
export const getFileSizeKB = (file: File): number => {
  return file.size / 1024;
};

/**
 * Format file size for display
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 KB';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
