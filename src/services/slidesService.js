import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import paths from '../utils/firestorePaths';

/**
 * Get all homepage slides for the current tenant
 */
export const getSlides = async () => {
  try {
    const slidesDoc = await getDoc(doc(db, paths.content(), 'homeSlides'));
    
    if (slidesDoc.exists()) {
      const data = slidesDoc.data();
      return data.slides || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error getting slides:', error);
    throw error;
  }
};

/**
 * Update homepage slides for the current tenant
 */
export const updateSlides = async (slides) => {
  try {
    await setDoc(
      doc(db, paths.content(), 'homeSlides'),
      {
        slides,
        updatedAt: new Date().toISOString(),
      }
    );
    
    return true;
  } catch (error) {
    console.error('Error updating slides:', error);
    throw error;
  }
};
