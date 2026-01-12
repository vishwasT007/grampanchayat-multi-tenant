/**
 * Storage Paths Helper
 * Generates tenant-specific Firebase Storage paths for multi-tenant architecture
 */

import { getTenant } from './tenant';

/**
 * Get base storage path for current tenant
 * Format: gramPanchayats/{tenantId}
 */
export const getStorageBasePath = () => {
  const tenant = getTenant();
  return `gramPanchayats/${tenant}`;
};

/**
 * Storage paths for different types of files
 * All paths are tenant-specific to keep data isolated
 */
export const storagePaths = {
  // Members photos
  memberPhoto: (filename) => `${getStorageBasePath()}/members/${filename}`,
  
  // Staff photos
  staffPhoto: (filename) => `${getStorageBasePath()}/staff/${filename}`,
  
  // Notice files/attachments
  noticeFile: (filename) => `${getStorageBasePath()}/notices/${filename}`,
  noticeImage: (filename) => `${getStorageBasePath()}/notices/images/${filename}`,
  
  // Form files
  formFile: (filename) => `${getStorageBasePath()}/forms/${filename}`,
  
  // Gallery images
  galleryImage: (filename) => `${getStorageBasePath()}/gallery/${filename}`,
  
  // Office/site photos
  officePhoto: (filename) => `${getStorageBasePath()}/office/${filename}`,
  siteImage: (filename) => `${getStorageBasePath()}/site/${filename}`,
  
  // Service images
  serviceImage: (filename) => `${getStorageBasePath()}/services/${filename}`,
  
  // Scheme images
  schemeImage: (filename) => `${getStorageBasePath()}/schemes/${filename}`,
  
  // Program images
  programImage: (filename) => `${getStorageBasePath()}/programs/${filename}`,
  
  // Village images
  villageImage: (filename) => `${getStorageBasePath()}/villages/${filename}`,
  
  // Financial documents
  financialDocument: (filename) => `${getStorageBasePath()}/financials/${filename}`,
  
  // Grievance attachments
  grievanceAttachment: (filename) => `${getStorageBasePath()}/grievances/${filename}`,
  
  // General uploads
  upload: (category, filename) => `${getStorageBasePath()}/${category}/${filename}`,
  
  // Generic path generator
  path: (category, subcategory, filename) => {
    if (subcategory) {
      return `${getStorageBasePath()}/${category}/${subcategory}/${filename}`;
    }
    return `${getStorageBasePath()}/${category}/${filename}`;
  }
};

/**
 * Get storage path for a file
 * @param {string} category - Category of file (members, gallery, etc.)
 * @param {string} filename - Name of the file
 * @param {string} subcategory - Optional subcategory
 * @returns {string} Full storage path
 */
export const getStoragePath = (category, filename, subcategory = null) => {
  if (subcategory) {
    return `${getStorageBasePath()}/${category}/${subcategory}/${filename}`;
  }
  return `${getStorageBasePath()}/${category}/${filename}`;
};

/**
 * Extract tenant from storage path
 * Useful for file management
 */
export const extractTenantFromPath = (path) => {
  const parts = path.split('/');
  return parts[0]; // First part is always tenant
};

export default storagePaths;
