/**
 * Super Admin Configuration
 * Defines super admin credentials and permissions
 */

// Super Admin Credentials
// IMPORTANT: Change these after first deployment!
export const SUPER_ADMIN_CONFIG = {
  // Default super admin email
  email: 'superadmin@grampanchayat.in',
  
  // Default super admin password (CHANGE THIS!)
  defaultPassword: 'SuperAdmin@2025!',
  
  // Super admin role
  role: 'superadmin',
  
  // Permissions
  permissions: [
    'manage_gps',           // Can create/edit/delete GPs
    'create_admins',        // Can create GP admin users
    'view_analytics',       // Can view system analytics
    'system_settings',      // Can modify system settings
    'manage_domains',       // Can configure custom domains
    'backup_restore',       // Can backup/restore data
    'view_logs',           // Can view system logs
    'manage_users'         // Can manage all users
  ]
};

// Route protection
export const SUPER_ADMIN_ROUTES = {
  login: '/superadmin/login',
  dashboard: '/superadmin/dashboard',
  gramPanchayats: '/superadmin/gram-panchayats',
  addGP: '/superadmin/gram-panchayats/new',
  editGP: '/superadmin/gram-panchayats/:id/edit',
  users: '/superadmin/users',
  analytics: '/superadmin/analytics',
  settings: '/superadmin/settings'
};

// UI Configuration
export const SUPER_ADMIN_UI = {
  theme: {
    primary: '#4F46E5',      // Indigo
    secondary: '#10B981',    // Green
    warning: '#F59E0B',      // Amber
    danger: '#EF4444',       // Red
    background: '#F9FAFB'    // Light gray
  },
  
  branding: {
    name: 'Super Admin Panel',
    logo: '/logo.png',
    tagline: 'Manage All Gram Panchayats'
  }
};

// Feature flags
export const SUPER_ADMIN_FEATURES = {
  emailNotifications: true,  // Send email when GP is created
  autoGeneratePassword: true, // Auto-generate secure passwords
  domainManagement: true,     // Enable custom domain management
  bulkImport: true,          // Enable bulk GP import from CSV
  analytics: true,           // Enable analytics dashboard
  auditLogs: true           // Enable audit logging
};
