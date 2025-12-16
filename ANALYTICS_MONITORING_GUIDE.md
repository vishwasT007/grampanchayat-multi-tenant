# 📊 Analytics & Performance Monitoring Guide

## Overview

Firebase Analytics and Performance Monitoring have been integrated to track user behavior, app performance, and system health in production.

## ✅ What's Implemented

### 1. **Firebase Analytics**
- **Location**: `src/config/firebaseConfig.js`
- **Status**: ✅ Initialized with browser support detection
- **Features**:
  - Automatic page view tracking
  - Custom event logging
  - User engagement metrics
  - Error tracking

### 2. **Firebase Performance Monitoring**
- **Location**: `src/config/firebaseConfig.js`
- **Status**: ✅ Initialized with error handling
- **Features**:
  - Page load time tracking
  - API call performance
  - Firestore query performance
  - File upload/download metrics

### 3. **Analytics Utility Functions**
- **Location**: `src/utils/analyticsUtils.js`
- **Functions**:
  - `trackPageView()` - Track page navigation
  - `trackAdminAction()` - Track admin operations
  - `trackFormSubmission()` - Track form events
  - `trackFileDownload()` - Track file downloads
  - `trackSearch()` - Track search queries
  - `trackEngagement()` - Track user interactions
  - `trackError()` - Track application errors
  - `trackLanguageChange()` - Track language switches
  - `trackAnnouncementInteraction()` - Track announcement clicks
  - `trackGrievanceSubmission()` - Track grievance forms
  - `trackFinancialView()` - Track financial report views

### 4. **Performance Utility Functions**
- **Location**: `src/utils/performanceUtils.js`
- **Functions**:
  - `measureAsyncOperation()` - Measure any async task
  - `measureFirestoreQuery()` - Measure database queries
  - `measurePageLoad()` - Measure page load times
  - `measureComponentRender()` - Measure React component renders
  - `measureApiCall()` - Measure API requests
  - `measureFileUpload()` - Measure file upload speed
  - `measureFormSubmission()` - Measure form submission time
  - `measureDataProcessing()` - Measure data processing
  - `recordMetric()` - Record custom metrics

---

## 🚀 How to Use

### Step 1: Get Your Measurement ID

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **grampanchayat-multi-tenant**
3. Click the ⚙️ gear icon → **Project Settings**
4. Scroll down to **Your apps** section
5. Find your web app → Click **Firebase SDK snippet** → Choose **Config**
6. Copy the `measurementId` value (looks like `G-XXXXXXXXXX`)

### Step 2: Add Measurement ID to Environment

**For Development (.env)**:
```bash
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

**For Production (.env.production)**:
```bash
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Step 3: Enable Analytics in Firebase Console

1. In Firebase Console, go to **Analytics** in the left sidebar
2. Click **Get Started** if not already enabled
3. Follow the setup wizard
4. Enable **Google Analytics** for your project
5. Wait 24 hours for initial data collection

---

## 📈 Usage Examples

### Track Page Views
```javascript
import { trackPageView } from '../utils/analyticsUtils';

// In your component
useEffect(() => {
  trackPageView('home', 'Gram Panchayat Home');
}, []);
```

### Track Admin Actions
```javascript
import { trackAdminAction } from '../utils/analyticsUtils';

const handleCreateScheme = async (schemeData) => {
  await createScheme(schemeData);
  trackAdminAction('create', 'schemes', { 
    schemeType: schemeData.type 
  });
};
```

### Measure Firestore Queries
```javascript
import { measureFirestoreQuery } from '../utils/performanceUtils';

const fetchSchemes = async () => {
  return measureFirestoreQuery(
    'get_active_schemes',
    () => getSchemesFromFirestore(),
    'schemes'
  );
};
```

### Track Form Submissions
```javascript
import { trackFormSubmission } from '../utils/analyticsUtils';

const handleSubmit = async (formData) => {
  try {
    await submitForm(formData);
    trackFormSubmission('grievance_form', true);
  } catch (error) {
    trackFormSubmission('grievance_form', false, { 
      error: error.message 
    });
  }
};
```

### Measure Component Performance
```javascript
import { measureComponentRender } from '../utils/performanceUtils';

const MyComponent = () => {
  useEffect(() => {
    const renderMeasure = measureComponentRender('MyComponent');
    
    // Component rendering logic here
    
    renderMeasure.complete();
  }, []);
};
```

---

## 📊 What Gets Tracked Automatically

### Analytics Events
- ✅ Page views with URL and title
- ✅ User sessions and engagement time
- ✅ Screen resolution and device type
- ✅ Geographic location (country/city)
- ✅ Browser and OS information

### Performance Metrics
- ✅ Page load time
- ✅ First Contentful Paint (FCP)
- ✅ First Input Delay (FID)
- ✅ Network latency
- ✅ JavaScript bundle size

---

## 🎯 Key Metrics to Monitor

### User Engagement
- **Active Users**: Daily/Weekly/Monthly active users
- **Session Duration**: Average time spent on site
- **Pages per Session**: How many pages users visit
- **Bounce Rate**: Percentage of single-page sessions

### Admin Productivity
- **Admin Actions**: Create/Update/Delete operations
- **Module Usage**: Which modules admins use most
- **Form Completion Time**: How long forms take to complete
- **Error Rate**: Percentage of failed operations

### Performance
- **Page Load Time**: Should be < 3 seconds
- **Firestore Query Time**: Should be < 500ms
- **API Response Time**: Should be < 1 second
- **Component Render Time**: Should be < 100ms

### Public Engagement
- **Grievance Submissions**: Number and categories
- **Announcement Views**: How many people see announcements
- **File Downloads**: Which documents are downloaded most
- **Search Queries**: What users are looking for

---

## 📱 Viewing Analytics Data

### Firebase Console

**Analytics Dashboard**:
1. Go to Firebase Console → **Analytics** → **Dashboard**
2. View real-time users, events, and conversions
3. Filter by date range, platform, or user properties

**Events**:
1. Go to **Analytics** → **Events**
2. See all custom events you're tracking
3. Click any event to see detailed parameters

**Performance**:
1. Go to **Performance** in left sidebar
2. View page load times, network requests
3. See performance by device, country, browser

### Google Analytics 4 (GA4)

For more advanced analysis:
1. Click **View in Google Analytics** in Firebase Console
2. Access detailed reports, funnels, and custom dashboards
3. Set up alerts for anomalies

---

## 🔧 Advanced Configuration

### Disable Analytics in Development

Already configured! Analytics only runs in production when:
```bash
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PERFORMANCE=true
```

### Custom User Properties

Track additional user information:
```javascript
import { setUserProperties } from 'firebase/analytics';
import { analytics } from '../config/firebaseConfig';

setUserProperties(analytics, {
  tenant_id: 'pindkepar',
  user_role: 'admin',
  language_preference: 'marathi'
});
```

### Debug Mode (Development)

Enable debug mode to see events in real-time:
```bash
# In browser console
analytics.setConsent({
  analytics_storage: 'granted',
  ad_storage: 'denied'
});
```

Or install the [GA Debugger Chrome Extension](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna)

---

## 🛡️ Privacy & GDPR Compliance

### Data Collected
- ✅ Anonymous usage patterns
- ✅ Performance metrics
- ✅ Error logs (no sensitive data)
- ❌ No personal identifiable information (PII)
- ❌ No user content or form data

### User Consent

If required for GDPR/CCPA compliance, add a cookie consent banner:

```javascript
// After user accepts cookies
import { setAnalyticsCollectionEnabled } from 'firebase/analytics';
import { analytics } from '../config/firebaseConfig';

setAnalyticsCollectionEnabled(analytics, true);
```

---

## 🎯 Recommended Custom Events to Add

### For Admin Panel
- Login success/failure
- Password changes
- Role assignments
- Bulk operations
- Export/Import data

### For Public Portal
- Contact form submissions
- Service requests
- Feedback submissions
- Social media shares
- Newsletter signups

### For Performance
- Slow Firestore queries (> 1s)
- Failed image uploads
- Bundle size warnings
- Memory usage spikes

---

## 📊 Sample Dashboard Queries

### Most Active Admins
```
Event: admin_action
Group by: user_id
Count: Total events
```

### Popular Modules
```
Event: page_view
Filter: page_name contains 'admin'
Group by: page_name
```

### Slowest Pages
```
Metric: page_load_time_ms
Group by: page_name
Sort: Descending
```

### Error Hotspots
```
Event: app_error
Group by: error_location
Count: Total errors
```

---

## ✅ Production Checklist

- [ ] Add `VITE_FIREBASE_MEASUREMENT_ID` to `.env.production`
- [ ] Enable Google Analytics in Firebase Console
- [ ] Set `VITE_ENABLE_ANALYTICS=true`
- [ ] Set `VITE_ENABLE_PERFORMANCE=true`
- [ ] Test analytics in development with debug mode
- [ ] Verify events appear in Firebase Console (24hr delay)
- [ ] Set up custom dashboards in Google Analytics
- [ ] Configure alerts for critical metrics
- [ ] Add cookie consent banner (if required)
- [ ] Document key metrics for stakeholders

---

## 🆘 Troubleshooting

### Analytics Not Working

**Check browser console for errors**:
```javascript
// Should see:
// ✅ Firebase Analytics initialized
// ✅ Firebase Performance Monitoring initialized
```

**Verify environment variable**:
```bash
echo $VITE_FIREBASE_MEASUREMENT_ID
# Should output: G-XXXXXXXXXX
```

**Check if supported**:
```javascript
import { isSupported } from 'firebase/analytics';
isSupported().then(console.log); // Should be true
```

### Events Not Appearing

- **Wait 24 hours**: Initial data takes time to process
- **Check debug mode**: Use GA Debugger extension
- **Verify event names**: Must follow [naming conventions](https://support.google.com/analytics/answer/9267735)
- **Check quotas**: Free tier has 500 events/month limit

### Performance Data Missing

- **Enable in Firebase Console**: Performance → Get Started
- **Check browser support**: Works in modern browsers only
- **Verify network**: Ensure outbound connections to Firebase

---

## 📚 Resources

- [Firebase Analytics Docs](https://firebase.google.com/docs/analytics)
- [Performance Monitoring Docs](https://firebase.google.com/docs/perf-mon)
- [GA4 Event Reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)
- [Best Practices Guide](https://firebase.google.com/docs/analytics/best-practices)

---

## 🎉 Next Steps

1. ✅ **Add Measurement ID** to environment variables
2. ✅ **Enable Analytics** in Firebase Console
3. 🔄 **Integrate tracking calls** in your components
4. 📊 **Monitor metrics** in Firebase Console
5. 🎯 **Set up alerts** for critical events
6. 📈 **Analyze trends** and optimize UX

---

**Status**: ✅ Analytics & Performance Monitoring Ready
**Version**: 1.0.0
**Last Updated**: December 2024
