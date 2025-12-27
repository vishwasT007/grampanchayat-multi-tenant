/**
 * Firestore Paths Helper
 * Generates tenant-specific Firestore paths for multi-tenant architecture
 */

import { getTenant } from './tenant';

/**
 * Get base path for current tenant
 */
export const getBasePath = () => {
  const tenant = getTenant();
  return `gramPanchayats/${tenant}`;
};

/**
 * Collection and document paths for all app data
 * All paths are tenant-specific
 */
export const paths = {
  // Settings
  settings: () => `${getBasePath()}/settings`,
  siteSettings: () => `${getBasePath()}/settings/siteConfig`,
  
  // Theme configuration
  theme: () => `${getBasePath()}/theme`,
  themeConfig: () => `${getBasePath()}/theme/config`,
  
  // Features/flags
  features: () => `${getBasePath()}/features`,
  featuresConfig: () => `${getBasePath()}/features/config`,
  
  // Members
  members: () => `${getBasePath()}/members`,
  member: (id) => `${getBasePath()}/members/${id}`,
  
  // Staff
  staff: () => `${getBasePath()}/staff`,
  staffMember: (id) => `${getBasePath()}/staff/${id}`,
  
  // Notices
  notices: () => `${getBasePath()}/notices`,
  notice: (id) => `${getBasePath()}/notices/${id}`,
  
  // Announcements
  announcements: () => `${getBasePath()}/announcements`,
  announcement: (id) => `${getBasePath()}/announcements/${id}`,
  
  // Services
  services: () => `${getBasePath()}/services`,
  service: (id) => `${getBasePath()}/services/${id}`,
  
  // Schemes
  schemes: () => `${getBasePath()}/schemes`,
  scheme: (id) => `${getBasePath()}/schemes/${id}`,
  
  // Forms
  forms: () => `${getBasePath()}/forms`,
  form: (id) => `${getBasePath()}/forms/${id}`,
  
  // Programs
  programs: () => `${getBasePath()}/programs`,
  program: (id) => `${getBasePath()}/programs/${id}`,
  
  // Gallery
  gallery: () => `${getBasePath()}/gallery`,
  galleryItem: (id) => `${getBasePath()}/gallery/${id}`,
  
  // Villages
  villages: () => `${getBasePath()}/villages`,
  village: (id) => `${getBasePath()}/villages/${id}`,
  
  // Village Statistics
  demographics: () => `${getBasePath()}/demographics`,
  populationBreakdowns: () => `${getBasePath()}/populationBreakdowns`,
  villageGroups: () => `${getBasePath()}/villageGroups`,
  infrastructure: () => `${getBasePath()}/infrastructure`,
  statisticsYears: () => `${getBasePath()}/statisticsYears`,
  
  // Financials
  financials: () => `${getBasePath()}/financials`,
  financial: (id) => `${getBasePath()}/financials/${id}`,
  
  // Grievances
  grievances: () => `${getBasePath()}/grievances`,
  grievance: (id) => `${getBasePath()}/grievances/${id}`,
  
  // Pages (custom pages)
  pages: () => `${getBasePath()}/pages`,
  page: (id) => `${getBasePath()}/pages/${id}`,
  
  // Content (sliders, officials, etc.)
  content: () => `${getBasePath()}/content`,
  
  // Metadata
  metadata: () => `${getBasePath()}/metadata`,
  metadataConfig: () => `${getBasePath()}/metadata/config`,
};

/**
 * Get full path for a collection
 * @param {string} collectionName - Name of the collection
 * @returns {string} Full Firestore path
 */
export const getCollectionPath = (collectionName) => {
  const pathFunction = paths[collectionName];
  if (pathFunction && typeof pathFunction === 'function') {
    return pathFunction();
  }
  // Fallback: create path dynamically
  return `${getBasePath()}/${collectionName}`;
};

/**
 * Get full path for a document
 * @param {string} collectionName - Name of the collection
 * @param {string} documentId - ID of the document
 * @returns {string} Full Firestore path
 */
export const getDocumentPath = (collectionName, documentId) => {
  return `${getBasePath()}/${collectionName}/${documentId}`;
};

export default paths;
