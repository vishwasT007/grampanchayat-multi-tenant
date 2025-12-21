/**
 * Services Module Firebase Service
 * 
 * Example of a completed Firebase service migration
 * Use this as a reference when migrating other modules
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
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { getCollectionPath } from '../utils/firestorePaths';

const COLLECTION_NAME = 'services';

/**
 * Get all services for current tenant
 */
export const getAllServices = async () => {
  try {
    const collectionPath = getCollectionPath(COLLECTION_NAME);
    const collectionRef = collection(db, collectionPath);
    const q = query(collectionRef, orderBy('createdAt', 'desc'));
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting services:', error);
    throw error;
  }
};

/**
 * Get single service by ID
 */
export const getServiceById = async (id) => {
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
    console.error('Error getting service:', error);
    throw error;
  }
};

/**
 * Add new service
 */
export const addService = async (data) => {
  try {
    const collectionPath = getCollectionPath(COLLECTION_NAME);
    const collectionRef = collection(db, collectionPath);
    
    const serviceData = {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      status: 'active'
    };
    
    const docRef = await addDoc(collectionRef, serviceData);
    console.log('Service added with ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding service:', error);
    throw error;
  }
};

/**
 * Update existing service
 */
export const updateService = async (id, data) => {
  try {
    const collectionPath = getCollectionPath(COLLECTION_NAME);
    const docRef = doc(db, collectionPath, id);
    
    const updateData = {
      ...data,
      updatedAt: Timestamp.now()
    };
    
    await updateDoc(docRef, updateData);
    console.log('Service updated:', id);
  } catch (error) {
    console.error('Error updating service:', error);
    throw error;
  }
};

/**
 * Delete service
 */
export const deleteService = async (id) => {
  try {
    const collectionPath = getCollectionPath(COLLECTION_NAME);
    const docRef = doc(db, collectionPath, id);
    
    await deleteDoc(docRef);
    console.log('Service deleted:', id);
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
};

/**
 * Toggle service status
 */
export const toggleServiceStatus = async (id) => {
  try {
    const service = await getServiceById(id);
    if (!service) throw new Error('Service not found');
    
    const newStatus = service.status === 'active' ? 'inactive' : 'active';
    await updateService(id, { status: newStatus });
  } catch (error) {
    console.error('Error toggling service status:', error);
    throw error;
  }
};

export default {
  getAllServices,
  getServiceById,
  addService,
  updateService,
  deleteService,
  toggleServiceStatus
};
