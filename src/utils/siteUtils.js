/**
 * Utility to update favicon dynamically based on settings
 */

export const updateFavicon = (logoURL) => {
  if (!logoURL) return;
  
  // Remove existing favicon links
  const existingLinks = document.querySelectorAll("link[rel*='icon']");
  existingLinks.forEach(link => link.remove());
  
  // Add new favicon link
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/png';
  link.href = logoURL;
  document.head.appendChild(link);
  
  // Also add apple-touch-icon for iOS
  const appleLink = document.createElement('link');
  appleLink.rel = 'apple-touch-icon';
  appleLink.href = logoURL;
  document.head.appendChild(appleLink);
  
  console.log('✅ Favicon updated to:', logoURL);
};

/**
 * Update document title based on settings
 */
export const updateDocumentTitle = (panchayatName) => {
  if (!panchayatName) return;
  
  // Handle bilingual name (en/mr object or plain string)
  const title = typeof panchayatName === 'object' && panchayatName.en
    ? panchayatName.en
    : panchayatName;
  
  document.title = title || 'Gram Panchayat';
  console.log('✅ Document title updated to:', document.title);
};
