import { performance } from '../config/firebaseConfig';

// Dummy trace object for when performance monitoring is not available
const dummyTrace = {
  stop: () => {},
  putAttribute: () => {},
  putMetric: () => {},
  incrementMetric: () => {}
};

/**
 * Create and start a custom trace
 * @param {string} traceName - Name of the trace
 * @returns {object} - Trace object with stop method
 */
export const startTrace = (traceName) => {
  if (!performance) {
    console.debug('Performance monitoring not available, skipping trace:', traceName);
    return dummyTrace;
  }

  // Use dynamic import to avoid blocking
  return import('firebase/performance')
    .then(({ trace }) => {
      try {
        const customTrace = trace(performance, traceName);
        customTrace.start();
        console.debug('⚡ Performance trace started:', traceName);
        return customTrace;
      } catch (error) {
        console.debug('Performance trace failed (likely blocked):', traceName);
        return dummyTrace;
      }
    })
    .catch(() => {
      console.debug('Performance monitoring not available for trace:', traceName);
      return dummyTrace;
    });
};

/**
 * Measure async operation performance
 * @param {string} operationName - Name of the operation
 * @param {Function} operation - Async function to measure
 * @param {object} attributes - Additional attributes to attach
 * @returns {Promise} - Result of the operation
 */
export const measureAsyncOperation = async (operationName, operation, attributes = {}) => {
  const customTrace = startTrace(operationName);
  
  try {
    // Add custom attributes
    Object.entries(attributes).forEach(([key, value]) => {
      customTrace.putAttribute(key, String(value));
    });

    const startTime = performance?.now?.() || Date.now();
    const result = await operation();
    const duration = (performance?.now?.() || Date.now()) - startTime;

    customTrace.putMetric('duration_ms', Math.round(duration));
    customTrace.stop();

    console.debug(`⚡ Operation completed in ${duration.toFixed(2)}ms:`, operationName);
    return result;
  } catch (error) {
    customTrace.putAttribute('error', 'true');
    customTrace.putAttribute('error_message', error.message || 'Unknown error');
    customTrace.stop();
    throw error;
  }
};

/**
 * Measure Firestore query performance
 * @param {string} queryName - Name of the query
 * @param {Function} queryFn - Query function to execute
 * @param {string} collection - Collection name
 * @returns {Promise} - Query results
 */
export const measureFirestoreQuery = async (queryName, queryFn, collection) => {
  return measureAsyncOperation(`firestore_${queryName}`, queryFn, {
    collection,
    operation_type: 'query'
  });
};

/**
 * Measure page load performance
 * @param {string} pageName - Name of the page
 */
export const measurePageLoad = (pageName) => {
  if (!performance || typeof window === 'undefined') {
    return;
  }

  try {
    // Use the Navigation Timing API
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;

        const pageTrace = trace(performance, `page_load_${pageName}`);
        pageTrace.start();
        pageTrace.putMetric('load_time_ms', pageLoadTime);
        pageTrace.putMetric('dom_ready_ms', domReadyTime);
        pageTrace.putAttribute('page_name', pageName);
        pageTrace.stop();

        console.debug(`⚡ Page load metrics for ${pageName}:`, {
          loadTime: pageLoadTime,
          domReady: domReadyTime
        });
      }, 0);
    });
  } catch (error) {
    console.error('Failed to measure page load:', error);
  }
};

/**
 * Measure component render performance
 * @param {string} componentName - Name of the component
 * @returns {object} - Object with complete method
 */
export const measureComponentRender = (componentName) => {
  const startTime = performance?.now?.() || Date.now();
  
  return {
    complete: () => {
      const duration = (performance?.now?.() || Date.now()) - startTime;
      const renderTrace = startTrace(`component_render_${componentName}`);
      renderTrace.putMetric('render_time_ms', Math.round(duration));
      renderTrace.putAttribute('component', componentName);
      renderTrace.stop();
    }
  };
};

/**
 * Measure API call performance
 * @param {string} apiName - Name of the API
 * @param {Function} apiFn - API function to execute
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @returns {Promise} - API response
 */
export const measureApiCall = async (apiName, apiFn, method = 'GET') => {
  return measureAsyncOperation(`api_${apiName}`, apiFn, {
    api_name: apiName,
    http_method: method
  });
};

/**
 * Measure file upload performance
 * @param {string} fileName - Name of the file
 * @param {Function} uploadFn - Upload function to execute
 * @param {number} fileSize - Size of the file in bytes
 * @returns {Promise} - Upload result
 */
export const measureFileUpload = async (fileName, uploadFn, fileSize) => {
  return measureAsyncOperation('file_upload', uploadFn, {
    file_name: fileName,
    file_size_bytes: String(fileSize)
  });
};

/**
 * Measure form submission performance
 * @param {string} formName - Name of the form
 * @param {Function} submitFn - Submit function to execute
 * @returns {Promise} - Submission result
 */
export const measureFormSubmission = async (formName, submitFn) => {
  return measureAsyncOperation('form_submission', submitFn, {
    form_name: formName
  });
};

/**
 * Measure data processing performance
 * @param {string} processName - Name of the process
 * @param {Function} processFn - Process function to execute
 * @param {number} itemCount - Number of items being processed
 * @returns {Promise} - Process result
 */
export const measureDataProcessing = async (processName, processFn, itemCount) => {
  return measureAsyncOperation(`data_processing_${processName}`, processFn, {
    item_count: String(itemCount)
  });
};

/**
 * Monitor custom metrics
 * @param {string} metricName - Name of the metric
 * @param {number} value - Value of the metric
 * @param {object} attributes - Additional attributes
 */
export const recordMetric = (metricName, value, attributes = {}) => {
  if (!performance) {
    return;
  }

  try {
    const customTrace = trace(performance, `metric_${metricName}`);
    customTrace.start();
    customTrace.putMetric(metricName, value);
    
    Object.entries(attributes).forEach(([key, val]) => {
      customTrace.putAttribute(key, String(val));
    });
    
    customTrace.stop();
    console.debug(`📈 Metric recorded: ${metricName} = ${value}`);
  } catch (error) {
    console.error('Failed to record metric:', error);
  }
};
