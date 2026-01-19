/**
 * Multi-Tenant Utility
 * Detects which Gram Panchayat based on domain or query parameter
 */

// Domain to tenant mapping
// Add your domains here as you purchase them
const DOMAIN_MAP = {
  // Production domains - Custom Domains
  'grampanchayatpindkeparlodha.in': 'pindkeparlodha',
  'www.grampanchayatpindkeparlodha.in': 'pindkeparlodha',
  'grampanchayatdongartal.in': 'dongartal',
  'www.grampanchayatdongartal.in': 'dongartal',
  'grampanchayatkatta.in': 'katta',
  'www.grampanchayatkatta.in': 'katta',
  'grampanchayatnawargaon.in': 'nawargaon',
  'www.grampanchayatnawargaon.in': 'nawargaon',
  
  // Old domain (if exists)
  'grampanchayatpindkepaarlodha.in': 'pindkepar',
  'www.grampanchayatpindkepaarlodha.in': 'pindkepar',
  
  // Development/Testing
  'localhost': 'development',
  '127.0.0.1': 'development',

  // gatgrampanchayat.in custom domains (subdomain -> tenant)
  // Note: `hiwarabazar` domain maps to tenant id `hiwrabajar` (spelling differs)
  'hiwarabazar.gatgrampanchayat.in': 'hiwrabajar',
  'www.hiwarabazar.gatgrampanchayat.in': 'hiwrabajar',
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
 * Normalize Firebase Hosting site subdomain to a tenant ID.
 *
 * Supports:
 * - gp-<gpId> (new format)
 * - gp-<gpId>-<randomSuffix> (new format with Firebase suffix)
 * - <gpId>-gpmulti (old format)
 * - <gpId>-gpmulti-<randomSuffix> (old format with suffix)
 *
 * NOTE: We preserve hyphens in gpId. Hyphen removal previously caused tenant mismatches
 * (e.g. `pindkeparlodha-gpmulti-y757r4` becoming `pindkeparlodhay757r4`).
 */
export const normalizeFirebaseHostingSubdomainToTenantId = (subdomain) => {
  if (!subdomain || typeof subdomain !== 'string') return '';
  let s = subdomain.toLowerCase();

  // NEW FORMAT: gp-<gpId> or gp-<gpId>-<randomSuffix> or gp-<gpId><randomSuffix>
  // Examples:
  // - gp-pindkeparlodha -> pindkeparlodha
  // - gp-pindkeparlodha-wsye6o -> pindkeparlodha
  // - gp-kachurwahiybxjq9 -> kachurwahi (removes ybxjq9 suffix)
  // - gp-test-village -> test-village
  // - gp-test-village-abc123 -> test-village
  if (s.startsWith('gp-')) {
    // Remove 'gp-' prefix
    s = s.substring(3);
    
    // Firebase adds random suffixes when site names collide
    // These are typically exactly 6 alphanumeric characters
    // Can be added with or without a hyphen: -abc123 or abc123
    
    // Pattern 1: With hyphen: <gpId>-<6chars>
    // Example: kachurwahi-ybxjq9 -> kachurwahi
    const suffixWithHyphen = s.match(/^(.+)-([a-z0-9]{6})$/);
    if (suffixWithHyphen) {
      s = suffixWithHyphen[1];
      return s;
    }
    
    // Pattern 2: Without hyphen: <gpId><6chars>
    // Example: kachurwahiybxjq9 -> kachurwahi
    // Use greedy match for gpId and exactly 6 chars for suffix
    const suffixWithoutHyphen = s.match(/^(.+)([a-z0-9]{6})$/);
    if (suffixWithoutHyphen) {
      const potentialGpId = suffixWithoutHyphen[1];
      const potentialSuffix = suffixWithoutHyphen[2];
      
      // Only remove if the suffix looks random (all lowercase + numbers)
      // and the gpId part is at least 4 characters (to avoid false positives)
      if (potentialGpId.length >= 4) {
        s = potentialGpId;
      }
    }
    
    return s;
  }

  // OLD FORMAT: <gpId>-gpmulti or <gpId>-gpmulti-<randomSuffix>
  // Strip the `-gpmulti` marker and any suffix after it.
  // Examples:
  // - pindkepar-lodha-gpmulti -> pindkepar-lodha
  // - pindkepar-lodha-gpmulti-y757r4 -> pindkepar-lodha
  if (s.includes('-gpmulti')) {
    s = s.split('-gpmulti')[0];
  }

  // Trim any accidental trailing hyphens
  s = s.replace(/-+$/g, '');

  // If you ever have old `-gpmulti` without the leading dash, handle it too.
  // (e.g. `pindkeparlodha-gpmulti` is already covered above)
  s = s.replace(/gpmulti$/g, '').replace(/-+$/g, '');

  return s;
};

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
  
  // Subdomain detection (e.g., pindkepar.grampanchayats.in or kachurwahi.gatgrampanchayat.in)
  // For `www.<tenant>.<rootDomain>` we use the second label as tenant.
  if (hostname.includes('.grampanchayats.in') || hostname.includes('.gatgrampanchayat.in')) {
    const parts = hostname.split('.');
    const subdomain = parts[0] === 'www' ? parts[1] : parts[0];
    if (subdomain) {
      console.log('🏛️ Tenant from subdomain:', subdomain);
      return subdomain;
    }
  }
  
  // Firebase .web.app subdomain detection (e.g., pindkeparlodha-gpmulti.web.app)
  if (hostname.endsWith('.web.app') || hostname.endsWith('.firebaseapp.com')) {
    const subdomain = hostname.split('.')[0];
    if (subdomain && subdomain !== 'www') {
      const tenantId = normalizeFirebaseHostingSubdomainToTenantId(subdomain);
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
 * For multi-tenant system, returns a dynamic object for any tenant
 */
export const getTenantInfo = () => {
  const tenantId = getTenant();
  const tenant = ALL_TENANTS.find(t => t.id === tenantId);
  
  if (!tenant) {
    // For dynamic multi-tenant system, return a default object
    // The actual GP data will be loaded from Firestore
    console.log(`ℹ️ Tenant "${tenantId}" using dynamic configuration (will load from Firestore)`);
    return { 
      id: tenantId, 
      name: `GP ${tenantId.charAt(0).toUpperCase() + tenantId.slice(1)}`,
      nameHi: `ग्राम पंचायत ${tenantId}`,
      domain: `gp-${tenantId}.web.app`,
      active: true  // Assume active, will be validated from Firestore
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
