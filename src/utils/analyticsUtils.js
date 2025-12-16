import { analytics } from '../config/firebaseConfig';

/**
 * Log a custom analytics event
 * @param {string} eventName - Name of the event
 * @param {object} eventParams - Additional event parameters
 */
export const logAnalyticsEvent = (eventName, eventParams = {}) => {
  if (!analytics) {
    console.debug('Analytics not available, skipping event:', eventName);
    return;
  }

  // Dynamic import to avoid blocking errors
  import('firebase/analytics')
    .then(({ logEvent }) => {
      try {
        logEvent(analytics, eventName, {
          timestamp: new Date().toISOString(),
          ...eventParams
        });
        console.debug('📊 Analytics event logged:', eventName, eventParams);
      } catch (error) {
        console.debug('Analytics event failed (likely blocked):', eventName);
      }
    })
    .catch(() => {
      // Silently fail if analytics is blocked
      console.debug('Analytics not available for event:', eventName);
    });
};

/**
 * Track page views
 * @param {string} pageName - Name of the page
 * @param {string} pageTitle - Title of the page
 */
export const trackPageView = (pageName, pageTitle) => {
  logAnalyticsEvent('page_view', {
    page_name: pageName,
    page_title: pageTitle,
    page_location: window.location.href,
    page_path: window.location.pathname
  });
};

/**
 * Track admin actions
 * @param {string} action - Type of action (create, update, delete, etc.)
 * @param {string} module - Module name (schemes, officials, etc.)
 * @param {object} metadata - Additional metadata
 */
export const trackAdminAction = (action, module, metadata = {}) => {
  logAnalyticsEvent('admin_action', {
    action,
    module,
    ...metadata
  });
};

/**
 * Track form submissions
 * @param {string} formName - Name of the form
 * @param {boolean} success - Whether submission was successful
 * @param {object} metadata - Additional metadata
 */
export const trackFormSubmission = (formName, success, metadata = {}) => {
  logAnalyticsEvent('form_submission', {
    form_name: formName,
    success,
    ...metadata
  });
};

/**
 * Track file downloads
 * @param {string} fileName - Name of the downloaded file
 * @param {string} fileType - Type of file (pdf, image, etc.)
 * @param {string} module - Module from which file was downloaded
 */
export const trackFileDownload = (fileName, fileType, module) => {
  logAnalyticsEvent('file_download', {
    file_name: fileName,
    file_type: fileType,
    module
  });
};

/**
 * Track search actions
 * @param {string} searchTerm - The search term
 * @param {string} module - Module where search was performed
 * @param {number} resultsCount - Number of results returned
 */
export const trackSearch = (searchTerm, module, resultsCount) => {
  logAnalyticsEvent('search', {
    search_term: searchTerm,
    module,
    results_count: resultsCount
  });
};

/**
 * Track user engagement
 * @param {string} engagementType - Type of engagement (click, scroll, etc.)
 * @param {string} target - Target element or section
 * @param {object} metadata - Additional metadata
 */
export const trackEngagement = (engagementType, target, metadata = {}) => {
  logAnalyticsEvent('user_engagement', {
    engagement_type: engagementType,
    target,
    ...metadata
  });
};

/**
 * Track errors
 * @param {string} errorMessage - Error message
 * @param {string} errorLocation - Where the error occurred
 * @param {boolean} isFatal - Whether error is fatal
 */
export const trackError = (errorMessage, errorLocation, isFatal = false) => {
  logAnalyticsEvent('app_error', {
    error_message: errorMessage,
    error_location: errorLocation,
    is_fatal: isFatal
  });
};

/**
 * Track language changes
 * @param {string} newLanguage - The new language selected
 */
export const trackLanguageChange = (newLanguage) => {
  logAnalyticsEvent('language_change', {
    language: newLanguage
  });
};

/**
 * Track announcement interactions
 * @param {string} action - Action type (view, dismiss, click)
 * @param {string} announcementId - ID of the announcement
 * @param {string} announcementType - Type of announcement
 */
export const trackAnnouncementInteraction = (action, announcementId, announcementType) => {
  logAnalyticsEvent('announcement_interaction', {
    action,
    announcement_id: announcementId,
    announcement_type: announcementType
  });
};

/**
 * Track grievance submissions
 * @param {string} category - Category of grievance
 * @param {boolean} isAnonymous - Whether submission is anonymous
 */
export const trackGrievanceSubmission = (category, isAnonymous) => {
  logAnalyticsEvent('grievance_submission', {
    category,
    is_anonymous: isAnonymous
  });
};

/**
 * Track financial data views
 * @param {string} reportType - Type of financial report viewed
 * @param {string} year - Financial year
 */
export const trackFinancialView = (reportType, year) => {
  logAnalyticsEvent('financial_view', {
    report_type: reportType,
    year
  });
};
