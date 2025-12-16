/**
 * Firebase Storage Service
 * Handles image/file uploads to Firebase Storage with multi-tenant support
 */

import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  uploadBytesResumable 
} from 'firebase/storage';
import { storage } from '../config/firebaseConfig';
import { getStoragePath } from '../utils/storagePaths';

/**
 * Upload image to Firebase Storage
 * @param {File} file - Image file to upload
 * @param {string} category - Category (e.g., 'members', 'gallery', 'notices')
 * @param {string} fileName - Optional custom filename
 * @param {string} subcategory - Optional subcategory
 * @returns {Promise<string>} - Download URL
 */
export async function uploadImage(file, category, fileName = null, subcategory = null) {
  try {
    const name = fileName || `${Date.now()}_${file.name}`;
    const path = getStoragePath(category, name, subcategory);
    const storageRef = ref(storage, path);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Upload image with progress callback
 * @param {File} file - Image file
 * @param {string} category - Category path
 * @param {function} onProgress - Progress callback (percentage)
 * @param {string} subcategory - Optional subcategory
 * @returns {Promise<string>} - Download URL
 */
export async function uploadImageWithProgress(file, category, onProgress, subcategory = null) {
  try {
    const name = `${Date.now()}_${file.name}`;
    const path = getStoragePath(category, name, subcategory);
    const storageRef = ref(storage, path);
    
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  } catch (error) {
    console.error('Error uploading with progress:', error);
    throw error;
  }
}

/**
 * Delete image from Firebase Storage
 * @param {string} fileUrl - Full download URL or path
 */
export async function deleteImage(fileUrl) {
  try {
    // Extract path from URL
    const path = extractPathFromUrl(fileUrl);
    if (!path) {
      throw new Error('Invalid file URL');
    }
    
    const fileRef = ref(storage, path);
    await deleteObject(fileRef);
    
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

/**
 * Extract storage path from download URL
 */
function extractPathFromUrl(url) {
  try {
    const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/';
    if (!url.startsWith(baseUrl)) return null;
    
    const path = url.split('/o/')[1]?.split('?')[0];
    return path ? decodeURIComponent(path) : null;
  } catch (error) {
    console.error('Error extracting path:', error);
    return null;
  }
}

/**
 * Upload multiple images
 * @param {FileList|Array} files - Array of files
 * @param {string} folder - Folder path
 * @returns {Promise<Array>} - Array of download URLs
 */
export async function uploadMultipleImages(files, folder) {
  try {
    const uploadPromises = Array.from(files).map(file => 
      uploadImage(file, folder)
    );
    
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
}
