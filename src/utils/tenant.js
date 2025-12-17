/**
 * Multi-Tenant Utility
 * Detects which Gram Panchayat based on domain or query parameter
 */

// Domain to tenant mapping
// Add your domains here as you purchase them
const DOMAIN_MAP = {
  // Production domains (add as you purchase)
  'grampanchayatpindkepaarlodha.in': 'pindkepar',
  'www.grampanchayatpindkepaarlodha.in': 'pindkepar',
  
  // Add more domains as you purchase them:
  // 'grampanchayat-gp3.in': 'gp3',
  // 'grampanchayat-gp4.in': 'gp4',
  // etc.
  
  // Development/Testing
  'localhost': 'development',
  '127.0.0.1': 'development',
};

// List of all tenants/GPs
// Add new GPs here as you onboard them
export const ALL_TENANTS = [
  { 
    id: 'pindkepar', 
    name: 'Gram Panchayat Pindkepar Lodha',
    nameHi: 'ग्राम पंचायत पिंडकेपार लोधा',
    domain: 'grampanchayatpindkepaarlodha.in',
    active: true
  },
  { 
    id: 'demo', 
    name: 'Demo Gram Panchayat',
    nameHi: 'डेमो ग्राम पंचायत',
    domain: 'demo',
    active: true
  },
  // Add more GPs here:
  // { 
  //   id: 'gp3', 
  //   name: 'Gram Panchayat Name 3',
  //   nameHi: 'ग्राम पंचायत नाम 3',
  //   domain: 'grampanchayat-gp3.in',
  //   active: true
  // },
];

/**
 * Detect tenant from domain or query parameter
 * Priority: URL query param > Domain mapping > Default
 */
export const detectTenant = () => {
  // Check for query parameter first (for localhost testing)
  // Example: http://localhost:5173?tenant=pindkepar
  const params = new URLSearchParams(window.location.search);
  const tenantParam = params.get('tenant');
  
  if (tenantParam) {
    // Validate tenant exists
    const tenant = ALL_TENANTS.find(t => t.id === tenantParam);
    if (tenant) {
      console.log('🏛️ Tenant from query parameter:', tenantParam);
      return tenantParam;
    }
  }
  
  // Check domain mapping
  const hostname = window.location.hostname;
  
  if (DOMAIN_MAP[hostname]) {
    const tenant = DOMAIN_MAP[hostname];
    
    // In development mode, require query parameter
    if (tenant === 'development') {
      // Default to first active tenant for development
      const defaultTenant = ALL_TENANTS.find(t => t.active);
      if (defaultTenant) {
        console.log('🏛️ Development mode - Using default tenant:', defaultTenant.id);
        console.log('💡 Tip: Use ?tenant=TENANT_ID to test other GPs');
        return defaultTenant.id;
      }
    }
    
    console.log('🏛️ Tenant from domain:', tenant);
    return tenant;
  }
  
  // Subdomain detection (e.g., pindkepar.grampanchayats.in)
  if (hostname.includes('.grampanchayats.in')) {
    const subdomain = hostname.split('.')[0];
    if (subdomain !== 'www') {
      console.log('🏛️ Tenant from subdomain:', subdomain);
      return subdomain;
    }
  }
  
  // Firebase .web.app subdomain detection (e.g., pindkeparlodha-gpmulti.web.app)
  if (hostname.endsWith('.web.app') || hostname.endsWith('.firebaseapp.com')) {
    const subdomain = hostname.split('.')[0];
    if (subdomain && subdomain !== 'www') {
      // Convert subdomain to tenant ID
      // First remove the '-gpmulti' suffix, THEN remove remaining hyphens
      // Example: 'pindkeparlodha-gpmulti' -> 'pindkeparlodha' -> 'pindkeparlodha'
      // Example: 'pindkepar-lodha-gpmulti' -> 'pindkepar-lodha' -> 'pindkeparlodha'
      let tenantId = subdomain.replace('-gpmulti', '').replace(/-/g, '').toLowerCase();
      console.log('🏛️ Tenant from Firebase subdomain:', tenantId, '(from', subdomain + ')');
      return tenantId;
    }
  }
  
  // Default to first active tenant
  const defaultTenant = ALL_TENANTS.find(t => t.active);
  if (defaultTenant) {
    console.log('🏛️ Using default tenant:', defaultTenant.id);
    return defaultTenant.id;
  }
  
  // Fallback
  console.warn('⚠️ No tenant detected, using fallback');
  return 'pindkepar';
};

// Cache the tenant to avoid recalculation
let currentTenant = null;

/**
 * Get current tenant ID
 * Cached for performance
 */
export const getTenant = () => {
  if (!currentTenant) {
    currentTenant = detectTenant();
    console.log('🏛️ Current Tenant:', currentTenant);
  }
  return currentTenant;
};

/**
 * Reset tenant cache (useful for testing)
 */
export const resetTenant = () => {
  currentTenant = null;
  return getTenant();
};

/**
 * Get tenant information object
 */
export const getTenantInfo = () => {
  const tenantId = getTenant();
  const tenant = ALL_TENANTS.find(t => t.id === tenantId);
  
  if (!tenant) {
    console.warn(`⚠️ Tenant "${tenantId}" not found in ALL_TENANTS`);
    return { 
      id: tenantId, 
      name: `GP ${tenantId}`,
      nameHi: `ग्राम पंचायत ${tenantId}`,
      active: false 
    };
  }
  
  return tenant;
};

/**
 * Check if user has access to current tenant
 * For admin authorization
 */
export const checkTenantAccess = (userTenants = []) => {
  const currentTenant = getTenant();
  
  // Super admin has access to all tenants
  if (userTenants.includes('*')) {
    return true;
  }
  
  // Check if user has access to current tenant
  return userTenants.includes(currentTenant);
};

/**
 * Get all active tenants
 */
export const getActiveTenants = () => {
  return ALL_TENANTS.filter(t => t.active);
};

/**
 * Switch tenant (for testing/super admin)
 * Updates URL with tenant parameter
 */
export const switchTenant = (tenantId) => {
  const tenant = ALL_TENANTS.find(t => t.id === tenantId);
  
  if (!tenant) {
    console.error(`Tenant "${tenantId}" not found`);
    return false;
  }
  
  // Update URL with tenant parameter
  const url = new URL(window.location.href);
  url.searchParams.set('tenant', tenantId);
  window.location.href = url.toString();
  
  return true;
};

export default {
  getTenant,
  getTenantInfo,
  detectTenant,
  resetTenant,
  checkTenantAccess,
  getActiveTenants,
  switchTenant,
  ALL_TENANTS
};
