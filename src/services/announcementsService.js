/**
 * Announcements Service
 * Manages announcements/news banner for homepage
 */

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
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { paths } from '../utils/firestorePaths';

/**
 * Get all announcements
 */
export async function getAnnouncements() {
  try {
    const announcementsRef = collection(db, paths.announcements());
    const q = query(announcementsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    // Sort by priority in JavaScript after fetching
    const announcements = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
    }));
    
    // Sort by priority (high -> medium -> low) and then by createdAt
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return announcements.sort((a, b) => {
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return b.createdAt - a.createdAt;
    });
  } catch (error) {
    console.error('Error getting announcements:', error);
    throw error;
  }
}

/**
 * Get active announcements (for homepage display)
 */
export async function getActiveAnnouncements() {
  try {
    const announcementsRef = collection(db, paths.announcements());
    
    // Simple query without orderBy to avoid index requirement
    // We'll sort everything in JavaScript instead
    const q = query(
      announcementsRef, 
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);
    
    // Get all announcements and convert timestamps
    const announcements = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date()
    }));
    
    // Sort by priority (high -> medium -> low) and then by createdAt
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return announcements.sort((a, b) => {
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      return b.createdAt - a.createdAt;
    });
  } catch (error) {
    console.error('Error getting active announcements:', error);
    throw error;
  }
}

/**
 * Get single announcement by ID
 */
export async function getAnnouncement(id) {
  try {
    const docRef = doc(db, paths.announcement(id));
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date()
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting announcement:', error);
    throw error;
  }
}

/**
 * Create new announcement
 */
export async function createAnnouncement(announcementData) {
  try {
    const announcementsRef = collection(db, paths.announcements());
    const docRef = await addDoc(announcementsRef, {
      ...announcementData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating announcement:', error);
    throw error;
  }
}

/**
 * Update announcement
 */
export async function updateAnnouncement(id, announcementData) {
  try {
    const docRef = doc(db, paths.announcement(id));
    await updateDoc(docRef, {
      ...announcementData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating announcement:', error);
    throw error;
  }
}

/**
 * Delete announcement
 */
export async function deleteAnnouncement(id) {
  try {
    const docRef = doc(db, paths.announcement(id));
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting announcement:', error);
    throw error;
  }
}

/**
 * Toggle announcement active status
 */
export async function toggleAnnouncementStatus(id, isActive) {
  try {
    await updateAnnouncement(id, { isActive });
  } catch (error) {
    console.error('Error toggling announcement status:', error);
    throw error;
  }
}
