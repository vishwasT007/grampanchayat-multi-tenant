/**
 * Super Admin Service
 * Handles all super admin operations (GP management, user creation, etc.)
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updatePassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { db, auth } from '../config/firebaseConfig';

/**
 * Check if user is super admin
 */
export const isSuperAdmin = async (userId) => {
  try {
    const superAdminDoc = await getDoc(doc(db, 'globalConfig', 'superAdmins', 'users', userId));
    return superAdminDoc.exists() && superAdminDoc.data().role === 'superadmin';
  } catch (error) {
    console.error('Error checking super admin status:', error);
    return false;
  }
};

/**
 * Get super admin profile
 */
export const getSuperAdminProfile = async (userId) => {
  try {
    const superAdminDoc = await getDoc(doc(db, 'globalConfig', 'superAdmins', 'users', userId));
    if (superAdminDoc.exists()) {
      return {
        id: superAdminDoc.id,
        ...superAdminDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting super admin profile:', error);
    throw error;
  }
};

/**
 * Update super admin last login
 */
export const updateSuperAdminLastLogin = async (userId) => {
  try {
    await updateDoc(doc(db, 'globalConfig', 'superAdmins', 'users', userId), {
      lastLogin: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating last login:', error);
  }
};

/**
 * Get all Gram Panchayats
 */
export const getAllGramPanchayats = async () => {
  try {
    const gpsRef = collection(db, 'globalConfig', 'metadata', 'gramPanchayats');
    const snapshot = await getDocs(gpsRef);
    
    const gps = [];
    snapshot.forEach(doc => {
      gps.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort by creation date (newest first)
    return gps.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA;
    });
    
  } catch (error) {
    console.error('Error getting all GPs:', error);
    throw error;
  }
};

/**
 * Get single Gram Panchayat
 */
export const getGramPanchayat = async (gpId) => {
  try {
    const gpDoc = await getDoc(doc(db, 'globalConfig', 'metadata', 'gramPanchayats', gpId));
    if (gpDoc.exists()) {
      return {
        id: gpDoc.id,
        ...gpDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting GP:', error);
    throw error;
  }
};

/**
 * Create new Gram Panchayat
 */
export const createGramPanchayat = async (gpData) => {
  try {
    const { id, name, nameMarathi, domain, adminEmail, adminPassword, ...otherData } = gpData;
    
    // Validate required fields
    if (!id || !name || !domain || !adminEmail || !adminPassword) {
      throw new Error('Missing required fields');
    }
    
    // Check if GP ID already exists
    const existingGP = await getDoc(doc(db, 'globalConfig', 'metadata', 'gramPanchayats', id));
    if (existingGP.exists()) {
      throw new Error(`Gram Panchayat with ID "${id}" already exists`);
    }
    
    // 1. Add GP to globalConfig
    const gpDocData = {
      id,
      name,
      nameMarathi: nameMarathi || '',
      domain,
      domainStatus: 'pending',
      active: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      adminEmail,
      ...otherData
    };
    
    await setDoc(doc(db, 'globalConfig', 'metadata', 'gramPanchayats', id), gpDocData);
    
    // 2. Create admin user in Firebase Auth
    let adminUser;
    let userUid;
    try {
      adminUser = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
      userUid = adminUser.user.uid;
    } catch (authError) {
      // If user already exists, get the UID
      if (authError.code === 'auth/email-already-in-use') {
        console.log('User already exists, will update user document');
        // Sign in to get the UID
        try {
          const existingUser = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
          userUid = existingUser.user.uid;
          await firebaseSignOut(auth); // Sign out immediately
        } catch (signInError) {
          console.error('Error getting existing user:', signInError);
          // Rollback: delete GP doc
          await deleteDoc(doc(db, 'globalConfig', 'metadata', 'gramPanchayats', id));
          throw new Error('User exists but password is different. Please use a different email or update the existing user.');
        }
      } else {
        // Rollback: delete GP doc
        await deleteDoc(doc(db, 'globalConfig', 'metadata', 'gramPanchayats', id));
        throw authError;
      }
    }
    
    // 3. Set user role in Firestore (GP-specific users collection)
    if (userUid) {
      await setDoc(doc(db, `gramPanchayats/${id}/users`, userUid), {
        email: adminEmail,
        name: otherData.adminName || 'Admin',
        role: 'admin',
        tenantId: id,
        createdAt: Timestamp.now(),
        active: true,
        createdBy: 'superadmin',
        // Store password in PLAIN TEXT as requested
        password: adminPassword,
        passwordLastChanged: Timestamp.now()
      });
    }
    
    // 4. Log the activity
    await logSuperAdminActivity({
      action: 'create_gp',
      gpId: id,
      gpName: name,
      adminEmail,
      timestamp: Timestamp.now()
    });
    
    return {
      success: true,
      gpId: id,
      adminEmail,
      message: `Gram Panchayat "${name}" created successfully`
    };
    
  } catch (error) {
    console.error('Error creating GP:', error);
    throw error;
  }
};

/**
 * Update Gram Panchayat
 */
export const updateGramPanchayat = async (gpId, updates) => {
  try {
    await updateDoc(doc(db, 'globalConfig', 'metadata', 'gramPanchayats', gpId), {
      ...updates,
      updatedAt: Timestamp.now()
    });
    
    await logSuperAdminActivity({
      action: 'update_gp',
      gpId,
      updates,
      timestamp: Timestamp.now()
    });
    
    return { success: true, message: 'GP updated successfully' };
  } catch (error) {
    console.error('Error updating GP:', error);
    throw error;
  }
};

/**
 * Activate/Deactivate Gram Panchayat
 */
export const toggleGPStatus = async (gpId, active) => {
  try {
    await updateDoc(doc(db, 'globalConfig', 'metadata', 'gramPanchayats', gpId), {
      active,
      updatedAt: Timestamp.now()
    });
    
    await logSuperAdminActivity({
      action: active ? 'activate_gp' : 'deactivate_gp',
      gpId,
      timestamp: Timestamp.now()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error toggling GP status:', error);
    throw error;
  }
};

/**
 * Delete Gram Panchayat (Complete Deletion)
 */
export const deleteGramPanchayat = async (gpId) => {
  try {
    // Get GP data before deletion
    const gpData = await getGramPanchayat(gpId);
    
    if (!gpData) {
      throw new Error('GP not found');
    }
    
    console.log('🗑️ Starting deletion of GP:', gpId);
    
    // 1. Delete all users in the GP
    console.log('🗑️ Deleting GP users...');
    const usersSnapshot = await getDocs(collection(db, `gramPanchayats/${gpId}/users`));
    const userDeletions = [];
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      // Delete user from Firebase Auth
      try {
        // Note: We can't delete Firebase Auth users from client-side
        // This would need to be done via Firebase Admin SDK (Cloud Function)
        console.log('⚠️ User in Firebase Auth needs manual deletion:', userData.email);
      } catch (error) {
        console.error('Error noting user for deletion:', error);
      }
      
      // Delete user document from Firestore
      userDeletions.push(deleteDoc(doc(db, `gramPanchayats/${gpId}/users`, userDoc.id)));
    }
    
    await Promise.all(userDeletions);
    console.log('✅ User documents deleted');
    
    // 2. Delete all subcollections in the GP
    const subcollections = [
      'notices',
      'announcements', 
      'members',
      'services',
      'schemes',
      'gallery',
      'forms',
      'grievances',
      'financials',
      'downloads',
      'settings'
    ];
    
    for (const subcollection of subcollections) {
      console.log(`🗑️ Deleting ${subcollection}...`);
      const snapshot = await getDocs(collection(db, `gramPanchayats/${gpId}/${subcollection}`));
      const deletions = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletions);
    }
    
    console.log('✅ All subcollections deleted');
    
    // 3. Delete from globalConfig
    await deleteDoc(doc(db, 'globalConfig', 'metadata', 'gramPanchayats', gpId));
    console.log('✅ GP metadata deleted');
    
    // 4. Log the activity
    await logSuperAdminActivity({
      action: 'delete_gp',
      gpId,
      gpData,
      timestamp: Timestamp.now()
    });
    
    // 5. Return success with instructions for manual cleanup
    const subdomain = gpData.domain?.replace('.web.app', '');
    const manualSteps = [];
    
    // Check if it's a Firebase hosting subdomain
    if (gpData.domain?.includes('.web.app')) {
      manualSteps.push({
        title: 'Delete Firebase Hosting Site',
        description: `The website is still deployed at ${gpData.domain}`,
        action: 'Run this command in terminal:',
        command: `firebase hosting:sites:delete ${subdomain}`,
        alternative: `Or delete manually in Firebase Console: https://console.firebase.google.com/project/grampanchayat-multi-tenant/hosting/sites`
      });
    }
    
    // Add manual step for deleting users from Firebase Auth
    if (usersSnapshot.docs.length > 0) {
      const userEmails = usersSnapshot.docs.map(d => d.data().email).join(', ');
      manualSteps.push({
        title: 'Delete Firebase Auth Users',
        description: `${usersSnapshot.docs.length} user(s) need to be deleted from Firebase Authentication`,
        users: userEmails,
        action: 'Delete manually in Firebase Console:',
        url: 'https://console.firebase.google.com/project/grampanchayat-multi-tenant/authentication/users'
      });
    }
    
    return { 
      success: true, 
      message: 'GP deleted successfully from Firestore',
      warning: manualSteps.length > 0 ? 'Some manual cleanup required' : null,
      manualSteps
    };
  } catch (error) {
    console.error('Error deleting GP:', error);
    throw error;
  }
};

/**
 * Get all admin users across all GPs
 */
export const getAllAdminUsers = async () => {
  try {
    const users = [];
    const gps = await getAllGramPanchayats();
    
    for (const gp of gps) {
      const usersRef = collection(db, `gramPanchayats/${gp.id}/users`);
      const snapshot = await getDocs(query(usersRef, where('role', '==', 'admin')));
      
      snapshot.forEach(doc => {
        users.push({
          id: doc.id,
          gpId: gp.id,
          gpName: gp.name,
          ...doc.data()
        });
      });
    }
    
    return users;
  } catch (error) {
    console.error('Error getting all admin users:', error);
    throw error;
  }
};

/**
 * Reset admin user password
 */
export const resetAdminPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    
    await logSuperAdminActivity({
      action: 'reset_password',
      email,
      timestamp: Timestamp.now()
    });
    
    return { success: true, message: 'Password reset email sent' };
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

/**
 * Get initial password for a user
 * WARNING: This returns a Base64 encoded password. 
 * Only use for initial setup. Users should change password.
 */
export const getInitialPassword = async (gpId, userId) => {
  try {
    const userDoc = await getDoc(doc(db, `gramPanchayats/${gpId}/users`, userId));
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data();
    
    // Decode the Base64 encoded password
    const password = userData.initialPassword ? atob(userData.initialPassword) : null;
    
    await logSuperAdminActivity({
      action: 'view_password',
      userId,
      gpId,
      timestamp: Timestamp.now()
    });
    
    return {
      password,
      createdAt: userData.createdAt,
      passwordLastChanged: userData.passwordLastChanged
    };
  } catch (error) {
    console.error('Error getting initial password:', error);
    throw error;
  }
};

/**
 * Generate and set new password for admin user
 * Returns the new password so it can be shown to super admin
 */
export const generateAndSetNewPassword = async (gpId, userId, email, customPassword = null) => {
  try {
    // Generate new password or use custom one
    const newPassword = customPassword || generateSecurePassword(12);
    
    // We need to use Firebase Admin SDK for this in production
    // For now, we'll just store it and ask user to use password reset
    // Update the stored password
    await updateDoc(doc(db, `gramPanchayats/${gpId}/users`, userId), {
      initialPassword: btoa(newPassword),
      passwordLastChanged: Timestamp.now(),
      passwordChangedBy: 'superadmin'
    });
    
    // Send password reset email
    await sendPasswordResetEmail(auth, email);
    
    await logSuperAdminActivity({
      action: 'generate_new_password',
      userId,
      gpId,
      email,
      timestamp: Timestamp.now()
    });
    
    return {
      success: true,
      password: newPassword,
      message: 'Password updated. User should use the password reset email to set this password.'
    };
  } catch (error) {
    console.error('Error generating new password:', error);
    throw error;
  }
};

/**
 * Get system statistics
 */
export const getSystemStats = async () => {
  try {
    const gps = await getAllGramPanchayats();
    const users = await getAllAdminUsers();
    
    const activeGPs = gps.filter(gp => gp.active).length;
    const inactiveGPs = gps.filter(gp => !gp.active).length;
    const activeUsers = users.filter(user => user.active).length;
    
    // Domain status
    const domainsActive = gps.filter(gp => gp.domainStatus === 'active').length;
    const domainsPending = gps.filter(gp => gp.domainStatus === 'pending').length;
    
    return {
      totalGPs: gps.length,
      activeGPs,
      inactiveGPs,
      totalUsers: users.length,
      activeUsers,
      domainsActive,
      domainsPending,
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error('Error getting system stats:', error);
    throw error;
  }
};

/**
 * Log super admin activity (audit trail)
 */
export const logSuperAdminActivity = async (activityData) => {
  try {
    const logRef = collection(db, 'globalConfig/activityLogs');
    await setDoc(doc(logRef), {
      ...activityData,
      timestamp: activityData.timestamp || Timestamp.now()
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw - logging failure shouldn't break the operation
  }
};

/**
 * Get activity logs
 */
export const getActivityLogs = async (limit = 50) => {
  try {
    const logsRef = collection(db, 'globalConfig/activityLogs');
    const q = query(logsRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    
    const logs = [];
    let count = 0;
    snapshot.forEach(doc => {
      if (count < limit) {
        logs.push({
          id: doc.id,
          ...doc.data()
        });
        count++;
      }
    });
    
    return logs;
  } catch (error) {
    console.error('Error getting activity logs:', error);
    throw error;
  }
};

/**
 * Generate secure password
 * Uses only @ and # as special characters for simplicity
 */
export const generateSecurePassword = (length = 16) => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '@#';  // Only @ and # symbols
  
  const all = uppercase + lowercase + numbers + special;
  
  let password = '';
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  
  // Shuffle to randomize position of guaranteed characters
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Generate GP ID from name
 */
export const generateGPId = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20);
};

/**
 * Get all users for a specific GP
 */
export const getGPUsers = async (gpId) => {
  try {
    const usersRef = collection(db, `gramPanchayats/${gpId}/users`);
    const snapshot = await getDocs(usersRef);
    
    const users = [];
    snapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort by creation date
    return users.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA;
    });
    
  } catch (error) {
    console.error('Error getting GP users:', error);
    throw error;
  }
};

/**
 * Get statistics for a specific GP
 */
export const getGPStats = async (gpId) => {
  try {
    const stats = {
      totalUsers: 0,
      totalNotices: 0,
      totalGrievances: 0,
      storageUsed: 0
    };

    // Count users
    try {
      const usersSnapshot = await getDocs(collection(db, `gramPanchayats/${gpId}/users`));
      stats.totalUsers = usersSnapshot.size;
    } catch (err) {
      console.error('Error counting users:', err);
    }

    // Count notices
    try {
      const noticesSnapshot = await getDocs(collection(db, `gramPanchayats/${gpId}/notices`));
      stats.totalNotices = noticesSnapshot.size;
    } catch (err) {
      console.error('Error counting notices:', err);
    }

    // Count grievances
    try {
      const grievancesSnapshot = await getDocs(collection(db, `gramPanchayats/${gpId}/grievances`));
      stats.totalGrievances = grievancesSnapshot.size;
    } catch (err) {
      console.error('Error counting grievances:', err);
    }

    // Note: Storage calculation would require Firebase Storage API
    // For now, we'll leave it at 0

    return stats;
    
  } catch (error) {
    console.error('Error getting GP stats:', error);
    return null;
  }
};
