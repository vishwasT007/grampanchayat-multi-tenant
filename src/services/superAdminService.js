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
    const { id, name, nameMarathi, domain, adminEmail, adminPassword, adminName, ...otherData } = gpData;
    
    // Validate required fields
    if (!id || !name || !domain || !adminEmail || !adminPassword) {
      throw new Error('Missing required fields: id, name, domain, adminEmail, adminPassword');
    }
    
    if (!adminName) {
      throw new Error('Admin name is required');
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail)) {
      throw new Error('Invalid email format');
    }
    
    // Validate password length
    if (adminPassword.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    
    // Check if GP ID already exists
    const existingGP = await getDoc(doc(db, 'globalConfig', 'metadata', 'gramPanchayats', id));
    if (existingGP.exists()) {
      throw new Error(`Gram Panchayat with ID "${id}" already exists. Please use a different name.`);
    }
    
    console.log('✅ Creating GP:', { id, name, domain, adminEmail });
    
    // 1. Add GP to globalConfig
    const gpDocData = {
      id,
      name,
      nameMarathi: nameMarathi || '',
      domain,
      subdomain: otherData.subdomain || domain.replace('.web.app', ''),
      domainStatus: 'pending',
      active: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      adminEmail,
      adminPassword, // Store for Cloud Function to create user
      adminName,
      ...otherData
    };
    
    await setDoc(doc(db, 'globalConfig', 'metadata', 'gramPanchayats', id), gpDocData);
    console.log('✅ GP document created in Firestore');
    
    // 2. Create placeholder user document in Firestore
    // The actual Firebase Auth user will be created by Cloud Function on first login
    const placeholderUid = `pending_${id}_${Date.now()}`;
    
    await setDoc(doc(db, `gramPanchayats/${id}/users`, placeholderUid), {
      email: adminEmail,
      name: adminName,
      role: 'admin',
      tenantId: id,
      createdAt: Timestamp.now(),
      active: true,
      createdBy: 'superadmin',
      password: adminPassword, // Plain text for Cloud Function to verify
      passwordLastChanged: Timestamp.now(),
      isPending: true, // Mark as pending Auth user creation
      note: 'Auth user will be created on first login or by Cloud Function'
    });
    console.log('✅ Placeholder user document created');
    
    // 3. Log the activity
    await logSuperAdminActivity({
      action: 'create_gp',
      gpId: id,
      gpName: name,
      adminEmail,
      timestamp: Timestamp.now()
    });
    console.log('✅ Activity logged');
    
    return {
      success: true,
      gpId: id,
      adminEmail,
      message: `Gram Panchayat "${name}" created successfully. Admin can login with provided credentials.`
    };
    
  } catch (error) {
    console.error('❌ Error creating GP:', error);
    // Re-throw with more context
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please ensure you are logged in as a Super Admin.');
    }
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
    
    // 3. Delete from globalConfig - This triggers Cloud Function for 100% automation
    await deleteDoc(doc(db, 'globalConfig', 'metadata', 'gramPanchayats', gpId));
    console.log('✅ GP metadata deleted - Cloud Functions will handle hosting site & Auth user cleanup');
    
    // 4. Log the activity
    await logSuperAdminActivity({
      action: 'delete_gp',
      gpId,
      gpData,
      timestamp: Timestamp.now()
    });
    
    return { 
      success: true, 
      message: '✅ GP deleted successfully! Cloud Functions are automatically cleaning up hosting site and Auth users.',
      automated: true,
      note: 'No manual steps required - everything is handled automatically by Cloud Functions.'
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
    const logRef = collection(db, 'globalConfig', 'metadata', 'activityLogs');
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
    const logsRef = collection(db, 'globalConfig', 'metadata', 'activityLogs');
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

/**
 * Auto-detect and sync Firebase Hosting domain
 * Checks if the actual Firebase hosting site exists and updates the GP domain
 */
export const syncFirebaseHostingDomain = async (gpId) => {
  try {
    console.log('🔄 Auto-syncing Firebase Hosting domain for GP:', gpId);
    
    // Get current GP data
    const gpData = await getGramPanchayat(gpId);
    if (!gpData) {
      throw new Error('GP not found');
    }

    const currentSubdomain = gpData.subdomain || '';
    const currentDomain = gpData.domain || '';
    
    console.log('Current subdomain:', currentSubdomain);
    console.log('Current domain:', currentDomain);

    // Try to detect the actual Firebase hosting site
    // Pattern: base-gpmulti or base-gpmulti-suffix
    const baseSubdomain = currentSubdomain.replace(/-gpmulti.*$/, '');
    const possibleSites = [
      `${currentSubdomain}`, // exact match
      `${baseSubdomain}-gpmulti`, // without suffix
    ];

    // Also check common suffix patterns
    const suffixPatterns = ['lp9lcu', 'y757r4', 'x8k2m9', 'w3n5p7'];
    suffixPatterns.forEach(suffix => {
      possibleSites.push(`${baseSubdomain}-gpmulti-${suffix}`);
    });

    console.log('Checking possible sites:', possibleSites);

    // Try to fetch each possible URL to see which one exists
    let actualSite = null;
    
    for (const site of possibleSites) {
      const testUrl = `https://${site}.web.app`;
      try {
        console.log('Testing:', testUrl);
        const response = await fetch(testUrl, { 
          method: 'HEAD',
          mode: 'no-cors' // Avoid CORS issues
        });
        
        // If we get here without error, the site likely exists
        console.log('✅ Site found:', site);
        actualSite = site;
        break;
      } catch (error) {
        console.log('❌ Site not found:', site);
        continue;
      }
    }

    // If no site found through testing, try to extract from Firebase Hosting API
    // Since we can't access Firebase Hosting API directly from client,
    // we'll use a different approach: check the .firebaserc configuration
    
    if (!actualSite) {
      console.log('⚠️  Could not auto-detect site. Using Firebase project configuration...');
      
      // Try to fetch the project configuration
      try {
        const configUrl = `https://grampanchayat-multi-tenant.web.app/__/firebase/init.json`;
        const configResponse = await fetch(configUrl);
        const config = await configResponse.json();
        console.log('Firebase config:', config);
      } catch (err) {
        console.error('Could not fetch Firebase config:', err);
      }
      
      // If still no site detected, return current domain
      console.log('⚠️  Keeping current domain. Manual update may be required.');
      return {
        success: false,
        message: 'Could not auto-detect Firebase hosting site. Please update manually.',
        currentDomain,
        currentSubdomain
      };
    }

    // Update the GP with the detected site
    const newDomain = `${actualSite}.web.app`;
    const updates = {
      domain: newDomain,
      subdomain: actualSite,
      lastDomainSync: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    await updateDoc(doc(db, 'globalConfig', 'metadata', 'gramPanchayats', gpId), updates);
    
    await logSuperAdminActivity({
      action: 'sync_domain',
      gpId,
      oldDomain: currentDomain,
      newDomain,
      timestamp: Timestamp.now()
    });

    console.log('✅ Domain synced successfully!');
    console.log('Old domain:', currentDomain);
    console.log('New domain:', newDomain);

    return {
      success: true,
      message: 'Domain synced successfully!',
      oldDomain: currentDomain,
      newDomain,
      oldSubdomain: currentSubdomain,
      newSubdomain: actualSite
    };

  } catch (error) {
    console.error('❌ Error syncing domain:', error);
    throw error;
  }
};

/**
 * Manual domain update (when auto-sync doesn't work)
 * Allows SuperAdmin to manually specify the correct domain
 */
export const updateGPDomain = async (gpId, newSubdomain) => {
  try {
    console.log('📝 Manually updating domain for GP:', gpId);
    console.log('New subdomain:', newSubdomain);

    const newDomain = `${newSubdomain}.web.app`;
    const updates = {
      domain: newDomain,
      subdomain: newSubdomain,
      lastDomainUpdate: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    await updateDoc(doc(db, 'globalConfig', 'metadata', 'gramPanchayats', gpId), updates);
    
    await logSuperAdminActivity({
      action: 'update_domain',
      gpId,
      newDomain,
      timestamp: Timestamp.now()
    });

    console.log('✅ Domain updated successfully!');

    return {
      success: true,
      message: 'Domain updated successfully!',
      newDomain,
      newSubdomain
    };

  } catch (error) {
    console.error('❌ Error updating domain:', error);
    throw error;
  }
};
