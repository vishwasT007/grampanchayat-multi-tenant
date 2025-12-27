import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import paths from '../utils/firestorePaths';

/**
 * Get all government officials for the current tenant
 */
export const getOfficials = async () => {
  try {
    const officialsDoc = await getDoc(doc(db, paths.content(), 'officials'));
    
    if (officialsDoc.exists()) {
      const data = officialsDoc.data();
      return data.officials || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error getting officials:', error);
    throw error;
  }
};

/**
 * Update government officials for the current tenant
 */
export const updateOfficials = async (officials) => {
  try {
    await setDoc(
      doc(db, paths.content(), 'officials'),
      {
        officials,
        updatedAt: new Date().toISOString(),
      }
    );
    
    return true;
  } catch (error) {
    console.error('Error updating officials:', error);
    throw error;
  }
};
