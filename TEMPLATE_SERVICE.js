/**
 * Firebase Service Template
 * 
 * Use this template to migrate any module to Firebase
 * 
 * STEPS TO USE:
 * 1. Copy this file
 * 2. Rename to: [moduleName]Service.js (e.g., servicesService.js)
 * 3. Replace [MODULE] with your module name
 * 4. Replace [Item] with singular form (e.g., Service)
 * 5. Replace [Items] with plural form (e.g., Services)
 * 6. Customize fields as needed
 * 7. Import and use in your component
 */

import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { getCollectionPath } from '../utils/firestorePaths';

// Collection name (lowercase plural)
const COLLECTION_NAME = '[items]'; // e.g., 'services', 'members', 'schemes'

/**
 * Get all items for current tenant
 * @returns {Promise<Array>} Array of items
 */
export const getAll[Items] = async () => {
  try {
    const collectionPath = getCollectionPath(COLLECTION_NAME);
    const collectionRef = collection(db, collectionPath);
    
    // Optional: Add ordering
    // const q = query(collectionRef, orderBy('createdAt', 'desc'));
    // const snapshot = await getDocs(q);
    
    const snapshot = await getDocs(collectionRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting [items]:', error);
    throw error;
  }
};

/**
 * Get single item by ID
 * @param {string} id - Item ID
 * @returns {Promise<Object|null>} Item object or null
 */
export const get[Item]ById = async (id) => {
  try {
    const collectionPath = getCollectionPath(COLLECTION_NAME);
    const docRef = doc(db, collectionPath, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting [item]:', error);
    throw error;
  }
};

/**
 * Add new item
 * @param {Object} data - Item data
 * @returns {Promise<string>} New item ID
 */
export const add[Item] = async (data) => {
  try {
    const collectionPath = getCollectionPath(COLLECTION_NAME);
    const collectionRef = collection(db, collectionPath);
    
    // Add timestamps and metadata
    const itemData = {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      // Add any default fields
      // status: 'active',
      // isPublished: false,
    };
    
    const docRef = await addDoc(collectionRef, itemData);
    console.log('[Item] added with ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding [item]:', error);
    throw error;
  }
};

/**
 * Update existing item
 * @param {string} id - Item ID
 * @param {Object} data - Updated data
 * @returns {Promise<void>}
 */
export const update[Item] = async (id, data) => {
  try {
    const collectionPath = getCollectionPath(COLLECTION_NAME);
    const docRef = doc(db, collectionPath, id);
    
    // Add update timestamp
    const updateData = {
      ...data,
      updatedAt: Timestamp.now()
    };
    
    await updateDoc(docRef, updateData);
    console.log('[Item] updated:', id);
  } catch (error) {
    console.error('Error updating [item]:', error);
    throw error;
  }
};

/**
 * Delete item
 * @param {string} id - Item ID
 * @returns {Promise<void>}
 */
export const delete[Item] = async (id) => {
  try {
    const collectionPath = getCollectionPath(COLLECTION_NAME);
    const docRef = doc(db, collectionPath, id);
    
    await deleteDoc(docRef);
    console.log('[Item] deleted:', id);
  } catch (error) {
    console.error('Error deleting [item]:', error);
    throw error;
  }
};

/**
 * Search items (optional - add if needed)
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Filtered items
 */
export const search[Items] = async (searchTerm) => {
  try {
    const collectionPath = getCollectionPath(COLLECTION_NAME);
    const collectionRef = collection(db, collectionPath);
    
    // Note: Firestore doesn't support full-text search natively
    // For simple search, get all and filter client-side
    const snapshot = await getDocs(collectionRef);
    const allItems = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filter by search term (customize fields as needed)
    return allItems.filter(item => 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching [items]:', error);
    throw error;
  }
};

/**
 * Get items by status (optional - add if needed)
 * @param {string} status - Status to filter by
 * @returns {Promise<Array>} Filtered items
 */
export const get[Items]ByStatus = async (status) => {
  try {
    const collectionPath = getCollectionPath(COLLECTION_NAME);
    const collectionRef = collection(db, collectionPath);
    const q = query(collectionRef, where('status', '==', status));
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting [items] by status:', error);
    throw error;
  }
};

/**
 * Toggle item status (optional - add if needed)
 * @param {string} id - Item ID
 * @returns {Promise<void>}
 */
export const toggle[Item]Status = async (id) => {
  try {
    const item = await get[Item]ById(id);
    if (!item) throw new Error('[Item] not found');
    
    const newStatus = item.status === 'active' ? 'inactive' : 'active';
    await update[Item](id, { status: newStatus });
  } catch (error) {
    console.error('Error toggling [item] status:', error);
    throw error;
  }
};

// Export all functions
export default {
  getAll[Items],
  get[Item]ById,
  add[Item],
  update[Item],
  delete[Item],
  search[Items],
  get[Items]ByStatus,
  toggle[Item]Status
};
