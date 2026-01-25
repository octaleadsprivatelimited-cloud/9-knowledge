/**
 * Firestore Image Storage Helper Functions
 * 
 * Images are stored directly in Firestore as base64 data
 * Images are automatically compressed to ~14KB before storage
 * 
 * Firestore Collection: "media"
 * Document structure:
 * {
 *   name: string,
 *   url: string, // data URL (data:image/webp;base64,...)
 *   imageData: string, // base64 encoded image data
 *   path: string, // virtual path for reference
 *   folder: string,
 *   size: number,
 *   contentType: string,
 *   uploadedBy: string (user ID),
 *   originalSize: number, // Original file size before compression
 *   createdAt: Timestamp,
 *   updatedAt: Timestamp
 * }
 */

import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from './config';
import { compressImage, getFileSizeKB } from '@/lib/imageCompression';

export interface MediaDocument {
  id: string;
  name: string;
  url: string; // data URL
  imageData?: string; // base64 data
  path: string;
  folder: string;
  size: number;
  contentType: string;
  uploadedBy?: string;
  originalSize?: number; // Original file size before compression
  createdAt: string;
  updatedAt: string;
}

// Firestore document size limit is 1MB
// Base64 increases size by ~33%, so max image size is ~750KB
// Our compression to 14KB ensures we're well under the limit
const MAX_FIRESTORE_DOCUMENT_SIZE = 1000000; // 1MB
const MAX_BASE64_IMAGE_SIZE = 750000; // ~750KB before base64 encoding

/**
 * Convert File to base64 data URL
 * @param {File} file - File to convert
 * @returns {Promise<string>} Base64 data URL
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Get image URL from Firestore document (returns data URL)
 * @param {string} docId - Firestore document ID
 * @returns {Promise<string>} Data URL of the image
 */
export const getImageUrl = async (docId: string): Promise<string> => {
  if (!db) {
    throw new Error('Firestore is not configured');
  }
  
  try {
    const docSnapshot = await getDoc(doc(db, 'media', docId));
    
    if (!docSnapshot.exists()) {
      throw new Error('Image not found');
    }
    
    const data = docSnapshot.data();
    // Return data URL from Firestore
    return data.url || data.imageData || '';
  } catch (error) {
    console.error('Error getting image URL:', error);
    throw error;
  }
};

/**
 * Get image metadata from Firestore by path
 * @param {string} path - Image path
 * @returns {Promise<MediaDocument | null>} Image document or null
 */
export const getImageFromFirestore = async (path: string): Promise<MediaDocument | null> => {
  if (!db) {
    throw new Error('Firestore is not configured');
  }

  try {
    const mediaQuery = query(
      collection(db, 'media'),
      where('path', '==', path),
      firestoreLimit(1)
    );

    const snapshot = await getDocs(mediaQuery);
    
    if (snapshot.empty) {
      return null;
    }

    const docSnapshot = snapshot.docs[0];
    const data = docSnapshot.data();
    
    return {
      id: docSnapshot.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
    } as MediaDocument;
  } catch (error) {
    console.error('Error getting image from Firestore:', error);
    return null;
  }
};

/**
 * List images from Firestore
 * @param {string} folder - Folder name ('uploads' or 'articles')
 * @param {number} limit - Maximum number of images to return
 * @returns {Promise<MediaDocument[]>} Array of image documents
 */
export const listImages = async (folder: string = 'uploads', limit: number = 100): Promise<MediaDocument[]> => {
  if (!db) {
    console.warn('Firestore is not configured');
    return [];
  }

  try {
    let mediaQuery = query(
      collection(db, 'media'),
      orderBy('createdAt', 'desc'),
      firestoreLimit(limit)
    );

    if (folder) {
      mediaQuery = query(
        collection(db, 'media'),
        where('folder', '==', folder),
        orderBy('createdAt', 'desc'),
        firestoreLimit(limit)
      );
    }

    const snapshot = await getDocs(mediaQuery);
    const images: MediaDocument[] = [];

    snapshot.docs.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      images.push({
        id: docSnapshot.id,
        name: data.name,
        url: data.url || data.imageData || '', // Use data URL from Firestore
        path: data.path,
        folder: data.folder,
        size: data.size,
        contentType: data.contentType,
        uploadedBy: data.uploadedBy,
        originalSize: data.originalSize,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      });
    });

    return images;
  } catch (error) {
    console.error('Error listing images from Firestore:', error);
    return [];
  }
};

/**
 * List all images from Firestore (all folders)
 * @param {number} limit - Maximum number of images to return
 * @returns {Promise<MediaDocument[]>} Array of image documents
 */
export const listAllImages = async (limit: number = 100): Promise<MediaDocument[]> => {
  if (!db) {
    console.warn('Firestore is not configured');
    return [];
  }

  try {
    const mediaQuery = query(
      collection(db, 'media'),
      orderBy('createdAt', 'desc'),
      firestoreLimit(limit)
    );

    const snapshot = await getDocs(mediaQuery);
    const images: MediaDocument[] = [];

    snapshot.docs.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      images.push({
        id: docSnapshot.id,
        name: data.name,
        url: data.url || data.imageData || '', // Use data URL from Firestore
        path: data.path,
        folder: data.folder,
        size: data.size,
        contentType: data.contentType,
        uploadedBy: data.uploadedBy,
        originalSize: data.originalSize,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      });
    });

    return images;
  } catch (error) {
    console.error('Error listing all images from Firestore:', error);
    return [];
  }
};

/**
 * Upload an image to Firestore as base64 data
 * Images are automatically compressed to ~14KB before storage
 * @param {File} file - File to upload
 * @param {string} folder - Folder name ('uploads' or 'articles')
 * @param {string} fileName - Optional custom file name
 * @param {string} uploadedBy - User ID who uploaded the image
 * @returns {Promise<{url: string, path: string, id: string}>} Object with data URL, path, and Firestore document ID
 */
export const uploadImage = async (
  file: File,
  folder: string = 'uploads',
  fileName?: string,
  uploadedBy?: string
): Promise<{ url: string; path: string; id: string }> => {
  if (!db) {
    throw new Error('Firestore is not configured');
  }

  // Compress image to ~14KB before storing
  let compressedFile: File;
  const originalSizeKB = getFileSizeKB(file);
  
  try {
    if (import.meta.env.DEV) {
      console.log(`Compressing image from ${originalSizeKB.toFixed(2)}KB to ~14KB...`);
    }
    
    compressedFile = await compressImage(file);
    const compressedSizeKB = getFileSizeKB(compressedFile);
    
    if (import.meta.env.DEV) {
      console.log(`✅ Image compressed: ${originalSizeKB.toFixed(2)}KB → ${compressedSizeKB.toFixed(2)}KB`);
    }
  } catch (error) {
    console.error('Compression failed, using original file:', error);
    compressedFile = file; // Fallback to original if compression fails
  }

  // Check file size before base64 encoding
  if (compressedFile.size > MAX_BASE64_IMAGE_SIZE) {
    throw new Error(`Image too large (${(compressedFile.size / 1024).toFixed(2)}KB). Maximum size is ${(MAX_BASE64_IMAGE_SIZE / 1024).toFixed(2)}KB`);
  }

  // Convert compressed file to base64 data URL
  const dataUrl = await fileToBase64(compressedFile);
  
  // Check if base64 data exceeds Firestore limit
  if (dataUrl.length > MAX_FIRESTORE_DOCUMENT_SIZE) {
    throw new Error(`Image data too large for Firestore. Please compress the image further.`);
  }

  // Generate filename with .webp extension (compressed images are WebP)
  const originalName = fileName || file.name;
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  const name = `${Date.now()}-${nameWithoutExt}.webp`;
  const storagePath = `${folder}/${name}`;
  
  // Save image data and metadata to Firestore
  const mediaDoc = {
    name: file.name, // Keep original filename for reference
    url: dataUrl, // Store as data URL
    imageData: dataUrl, // Also store as imageData for clarity
    path: storagePath,
    folder,
    size: compressedFile.size, // Store compressed size
    contentType: 'image/webp', // Compressed images are WebP
    uploadedBy: uploadedBy || null,
    originalSize: file.size, // Store original size for reference
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  const docRef = await addDoc(collection(db, 'media'), mediaDoc);
  
  if (import.meta.env.DEV) {
    console.log(`✅ Image stored in Firestore: ${docRef.id}`);
  }
  
  return {
    url: dataUrl, // Return data URL
    path: storagePath,
    id: docRef.id,
  };
};

/**
 * Delete an image from Firestore
 * @param {string} path - Full path to the image (e.g., "uploads/image-name.webp")
 * @param {string} docId - Optional Firestore document ID (if not provided, will be looked up)
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export const deleteImage = async (path: string, docId?: string): Promise<boolean> => {
  if (!db) {
    console.error('Firestore is not configured');
    return false;
  }

  try {
    // Delete from Firestore
    let documentId = docId;
    
    if (!documentId) {
      // Look up the document ID by path
      const mediaQuery = query(
        collection(db, 'media'),
        where('path', '==', path),
        firestoreLimit(1)
      );
      
      const snapshot = await getDocs(mediaQuery);
      if (!snapshot.empty) {
        documentId = snapshot.docs[0].id;
      }
    }

    if (documentId) {
      await deleteDoc(doc(db, 'media', documentId));
      if (import.meta.env.DEV) {
        console.log(`✅ Image deleted from Firestore: ${documentId}`);
      }
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

/**
 * Search images in Firestore
 * @param {string} searchTerm - Search term to match against image name
 * @param {string} folder - Optional folder filter
 * @param {number} limit - Maximum number of results
 * @returns {Promise<MediaDocument[]>} Array of matching image documents
 */
export const searchImages = async (
  searchTerm: string,
  folder?: string,
  limit: number = 50
): Promise<MediaDocument[]> => {
  if (!db) {
    console.warn('Firestore is not configured');
    return [];
  }

  try {
    // Note: Firestore doesn't support full-text search natively
    // We'll fetch all images and filter in memory for now
    // For production, consider using Algolia or similar for better search
    let mediaQuery = query(
      collection(db, 'media'),
      orderBy('createdAt', 'desc'),
      firestoreLimit(limit * 2) // Fetch more to filter
    );

    if (folder) {
      mediaQuery = query(
        collection(db, 'media'),
        where('folder', '==', folder),
        orderBy('createdAt', 'desc'),
        firestoreLimit(limit * 2)
      );
    }

    const snapshot = await getDocs(mediaQuery);
    const images: MediaDocument[] = [];
    const searchLower = searchTerm.toLowerCase();

    snapshot.docs.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      const name = (data.name || '').toLowerCase();
      
      if (name.includes(searchLower)) {
        images.push({
          id: docSnapshot.id,
          name: data.name,
          url: data.url || data.imageData || '', // Use data URL from Firestore
          path: data.path,
          folder: data.folder,
          size: data.size,
          contentType: data.contentType,
          uploadedBy: data.uploadedBy,
          originalSize: data.originalSize,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        });
      }
    });

    return images.slice(0, limit);
  } catch (error) {
    console.error('Error searching images:', error);
    return [];
  }
};
