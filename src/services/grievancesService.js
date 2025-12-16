import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import paths from '../utils/firestorePaths';

// Multi-tenant: using paths.grievances()

/**
 * Get all grievances from Firebase
 */
export const getGrievances = async () => {
  try {
    const grievancesRef = collection(db, paths.grievances());
    const q = query(grievancesRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const grievances = [];
    querySnapshot.forEach((doc) => {
      grievances.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return grievances;
  } catch (error) {
    console.error('Error fetching grievances:', error);
    throw error;
  }
};

/**
 * Get grievances by status
 */
export const getGrievancesByStatus = async (status) => {
  try {
    const grievancesRef = collection(db, paths.grievances());
    const q = query(
      grievancesRef, 
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const grievances = [];
    querySnapshot.forEach((doc) => {
      grievances.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return grievances;
  } catch (error) {
    console.error('Error fetching grievances by status:', error);
    throw error;
  }
};

/**
 * Get a single grievance by ID
 */
export const getGrievance = async (grievanceId) => {
  try {
    const docRef = doc(db, paths.grievances(), grievanceId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching grievance:', error);
    throw error;
  }
};

/**
 * Create a new grievance
 */
export const createGrievance = async (grievanceData) => {
  try {
    const grievancesRef = collection(db, paths.grievances());
    const docRef = await addDoc(grievancesRef, {
      ...grievanceData,
      status: grievanceData.status || 'PENDING',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    console.log('Grievance created successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating grievance:', error);
    throw error;
  }
};

/**
 * Update an existing grievance
 */
export const updateGrievance = async (grievanceId, grievanceData) => {
  try {
    const docRef = doc(db, paths.grievances(), grievanceId);
    await updateDoc(docRef, {
      ...grievanceData,
      updatedAt: Timestamp.now()
    });
    
    console.log('Grievance updated successfully:', grievanceId);
    return grievanceId;
  } catch (error) {
    console.error('Error updating grievance:', error);
    throw error;
  }
};

/**
 * Delete a grievance
 */
export const deleteGrievance = async (grievanceId) => {
  try {
    const docRef = doc(db, paths.grievances(), grievanceId);
    await deleteDoc(docRef);
    
    console.log('Grievance deleted successfully:', grievanceId);
    return true;
  } catch (error) {
    console.error('Error deleting grievance:', error);
    throw error;
  }
};
