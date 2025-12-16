# 🎨 Multi-Tenant UI Customization Guide

## Can You Customize Individual GPs? YES! ✅

In a multi-tenant architecture, you can have:
- **Shared core functionality** (same for all GPs)
- **Per-tenant customization** (unique UI/features per GP)

---

## 🎯 Customization Levels

### Level 1: Theme & Styling (Easy)
Different colors, fonts, logos per GP

### Level 2: Content & Layout (Moderate)
Different page layouts, sections visibility

### Level 3: Features & Components (Advanced)
Unique components or features per GP

### Level 4: Complete Custom UI (Expert)
Entirely different UI for specific GP

---

## 🎨 Implementation Strategies

### Strategy 1: Theme-Based Customization (Recommended)

Each GP has its own theme configuration stored in Firestore.

#### Firestore Structure:
```
gramPanchayats/
  warghat/
    theme/
      config: {
        primaryColor: "#1e40af",      // Blue
        secondaryColor: "#059669",    // Green
        fontFamily: "Inter",
        logo: "url_to_logo",
        headerStyle: "modern",
        cardStyle: "elevated",
        useCustomHomepage: false
      }
  pindkepar/
    theme/
      config: {
        primaryColor: "#dc2626",      // Red
        secondaryColor: "#ea580c",    // Orange
        fontFamily: "Poppins",
        logo: "url_to_logo",
        headerStyle: "classic",
        cardStyle: "bordered",
        useCustomHomepage: true       // Custom UI!
      }
```

---

### Strategy 2: Conditional Component Rendering

Show/hide components based on tenant.

#### Example: Different Homepage for Pindkepar

```javascript
// src/pages/Home.jsx

import { getTenant } from '../utils/tenant';
import WarghatHomepage from './custom/WarghatHomepage';
import PindkeparHomepage from './custom/PindkeparHomepage';
import DefaultHomepage from './DefaultHomepage';

export default function Home() {
  const tenant = getTenant();
  
  // Route to custom homepage if exists
  if (tenant === 'warghat') {
    return <WarghatHomepage />;
  }
  
  if (tenant === 'pindkepar') {
    return <PindkeparHomepage />;
  }
  
  // Default homepage for all other GPs
  return <DefaultHomepage />;
}
```

---

### Strategy 3: Theme Provider with CSS Variables

Dynamic theming using CSS custom properties.

#### Create Theme Provider:

```javascript
// src/contexts/ThemeContext.jsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getTenant } from '../utils/tenant';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadTheme();
  }, []);
  
  const loadTheme = async () => {
    try {
      const tenant = getTenant();
      const themeRef = doc(db, 'gramPanchayats', tenant, 'theme', 'config');
      const themeDoc = await getDoc(themeRef);
      
      if (themeDoc.exists()) {
        const themeData = themeDoc.data();
        applyTheme(themeData);
        setTheme(themeData);
      } else {
        // Use default theme
        applyDefaultTheme();
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      applyDefaultTheme();
    } finally {
      setLoading(false);
    }
  };
  
  const applyTheme = (themeData) => {
    const root = document.documentElement;
    
    // Apply CSS variables
    root.style.setProperty('--color-primary', themeData.primaryColor || '#1e40af');
    root.style.setProperty('--color-secondary', themeData.secondaryColor || '#059669');
    root.style.setProperty('--font-family', themeData.fontFamily || 'Inter');
    root.style.setProperty('--header-height', themeData.headerHeight || '80px');
    root.style.setProperty('--border-radius', themeData.borderRadius || '8px');
  };
  
  const applyDefaultTheme = () => {
    const defaultTheme = {
      primaryColor: '#1e40af',
      secondaryColor: '#059669',
      fontFamily: 'Inter',
    };
    applyTheme(defaultTheme);
    setTheme(defaultTheme);
  };
  
  return (
    <ThemeContext.Provider value={{ theme, loading }}>
      {!loading && children}
    </ThemeContext.Provider>
  );
}
```

#### Update App.jsx:

```javascript
// src/App.jsx

import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      {/* Your app content */}
    </ThemeProvider>
  );
}
```

#### Use CSS Variables:

```css
/* src/index.css */

:root {
  /* Default values (will be overridden) */
  --color-primary: #1e40af;
  --color-secondary: #059669;
  --font-family: 'Inter', sans-serif;
  --header-height: 80px;
  --border-radius: 8px;
}

body {
  font-family: var(--font-family);
}

.btn-primary {
  background-color: var(--color-primary);
  border-radius: var(--border-radius);
}

.header {
  height: var(--header-height);
  background-color: var(--color-primary);
}
```

---

### Strategy 4: Component Override System

Override specific components per tenant.

#### Create Component Factory:

```javascript
// src/utils/componentFactory.js

import { getTenant } from './tenant';

// Import default components
import DefaultNavbar from '../components/Navbar';
import DefaultFooter from '../components/Footer';
import DefaultHomepage from '../pages/Home';

// Import custom components
import PindkeparNavbar from '../components/custom/pindkepar/Navbar';
import PindkeparFooter from '../components/custom/pindkepar/Footer';
import PindkeparHomepage from '../pages/custom/pindkepar/Homepage';

import WarghatNavbar from '../components/custom/warghat/Navbar';

const componentOverrides = {
  warghat: {
    Navbar: WarghatNavbar,
    // Footer: DefaultFooter, // Use default
    // Homepage: DefaultHomepage, // Use default
  },
  pindkepar: {
    Navbar: PindkeparNavbar,
    Footer: PindkeparFooter,
    Homepage: PindkeparHomepage,
  },
  // Other GPs use defaults
};

export const getComponent = (componentName) => {
  const tenant = getTenant();
  const override = componentOverrides[tenant]?.[componentName];
  
  if (override) {
    return override;
  }
  
  // Return default component
  const defaults = {
    Navbar: DefaultNavbar,
    Footer: DefaultFooter,
    Homepage: DefaultHomepage,
  };
  
  return defaults[componentName] || null;
};
```

#### Use in Layout:

```javascript
// src/components/Layout.jsx

import { getComponent } from '../utils/componentFactory';

export default function Layout({ children }) {
  const Navbar = getComponent('Navbar');
  const Footer = getComponent('Footer');
  
  return (
    <div>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
```

#### Use in Routes:

```javascript
// src/App.jsx or Routes.jsx

import { getComponent } from './utils/componentFactory';

function AppRoutes() {
  const Homepage = getComponent('Homepage');
  
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      {/* Other routes */}
    </Routes>
  );
}
```

---

### Strategy 5: Feature Flags per Tenant

Enable/disable features per GP.

#### Firestore Structure:

```
gramPanchayats/
  warghat/
    features/
      config: {
        showGallery: true,
        showVillageStats: true,
        showFinancials: false,      // Hidden for Warghat
        showGrievances: true,
        enableOnlinePayments: false,
        customDashboard: false
      }
  pindkepar/
    features/
      config: {
        showGallery: true,
        showVillageStats: true,
        showFinancials: true,
        showGrievances: true,
        enableOnlinePayments: true,  // Enabled for Pindkepar
        customDashboard: true         // Custom UI
      }
```

#### Create Feature Flag Hook:

```javascript
// src/hooks/useFeatures.js

import { useState, useEffect } from 'react';
import { getTenant } from '../utils/tenant';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export function useFeatures() {
  const [features, setFeatures] = useState({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadFeatures();
  }, []);
  
  const loadFeatures = async () => {
    try {
      const tenant = getTenant();
      const featuresRef = doc(db, 'gramPanchayats', tenant, 'features', 'config');
      const featuresDoc = await getDoc(featuresRef);
      
      if (featuresDoc.exists()) {
        setFeatures(featuresDoc.data());
      } else {
        // Default features
        setFeatures({
          showGallery: true,
          showVillageStats: true,
          showFinancials: true,
          showGrievances: true,
          enableOnlinePayments: false,
          customDashboard: false,
        });
      }
    } catch (error) {
      console.error('Error loading features:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const isEnabled = (featureName) => {
    return features[featureName] === true;
  };
  
  return { features, loading, isEnabled };
}
```

#### Use Feature Flags:

```javascript
// src/components/Navbar.jsx

import { useFeatures } from '../hooks/useFeatures';

export default function Navbar() {
  const { isEnabled } = useFeatures();
  
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/panchayat">Panchayat</Link>
      
      {isEnabled('showGallery') && (
        <Link to="/gallery">Gallery</Link>
      )}
      
      {isEnabled('showVillageStats') && (
        <Link to="/villages">Village Statistics</Link>
      )}
      
      {isEnabled('showFinancials') && (
        <Link to="/financials">Financials</Link>
      )}
      
      {isEnabled('showGrievances') && (
        <Link to="/grievances">Grievances</Link>
      )}
    </nav>
  );
}
```

---

### Strategy 6: Layout Variations

Different page layouts per tenant.

```javascript
// src/components/layouts/LayoutFactory.jsx

import { getTenant } from '../../utils/tenant';
import ModernLayout from './ModernLayout';
import ClassicLayout from './ClassicLayout';
import MinimalLayout from './MinimalLayout';

const layoutMap = {
  warghat: 'modern',
  pindkepar: 'classic',
  // Default: 'modern' for others
};

export default function LayoutFactory({ children }) {
  const tenant = getTenant();
  const layoutType = layoutMap[tenant] || 'modern';
  
  switch (layoutType) {
    case 'modern':
      return <ModernLayout>{children}</ModernLayout>;
    case 'classic':
      return <ClassicLayout>{children}</ClassicLayout>;
    case 'minimal':
      return <MinimalLayout>{children}</MinimalLayout>;
    default:
      return <ModernLayout>{children}</ModernLayout>;
  }
}
```

---

## 📁 Recommended Folder Structure

```
src/
├── components/
│   ├── Navbar.jsx                    ← Default (used by 18 GPs)
│   ├── Footer.jsx                    ← Default
│   ├── Card.jsx                      ← Default
│   └── custom/                       ← Custom components
│       ├── pindkepar/
│       │   ├── Navbar.jsx           ← Pindkepar custom
│       │   ├── Footer.jsx
│       │   └── CustomDashboard.jsx
│       └── warghat/
│           └── Navbar.jsx           ← Warghat custom
│
├── pages/
│   ├── Home.jsx                      ← Default homepage
│   ├── Panchayat.jsx                 ← Default
│   └── custom/
│       └── pindkepar/
│           └── Homepage.jsx          ← Pindkepar custom homepage
│
├── styles/
│   ├── default.css                   ← Default styles
│   └── tenants/
│       ├── pindkepar.css            ← Pindkepar-specific CSS
│       └── warghat.css              ← Warghat-specific CSS
│
├── utils/
│   ├── tenant.js                     ← Tenant detection
│   ├── componentFactory.js           ← Component override system
│   └── firestorePaths.js
│
└── contexts/
    └── ThemeContext.jsx              ← Theme provider
```

---

## 🎯 Real-World Example: Pindkepar Custom UI

Let's say Pindkepar wants a completely different homepage.

### Step 1: Create Custom Homepage

```javascript
// src/pages/custom/pindkepar/Homepage.jsx

import React from 'react';
import { useSettings } from '../../../hooks/useSettings';

export default function PindkeparHomepage() {
  const { settings } = useSettings();
  
  return (
    <div className="pindkepar-homepage">
      {/* Completely custom design */}
      <header className="hero-section bg-gradient-to-r from-red-600 to-orange-500">
        <h1 className="text-6xl font-bold text-white">
          {settings?.title?.en}
        </h1>
        <p className="text-2xl text-white mt-4">
          A Modern Village, A Bright Future
        </p>
      </header>
      
      {/* Custom sections */}
      <section className="services-grid">
        {/* Unique layout for Pindkepar */}
      </section>
      
      <section className="achievements">
        {/* Show achievements (not on other GPs) */}
      </section>
    </div>
  );
}
```

### Step 2: Create Custom Styles

```css
/* src/styles/tenants/pindkepar.css */

.pindkepar-homepage .hero-section {
  min-height: 600px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.pindkepar-homepage .services-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  /* Unique grid layout */
}
```

### Step 3: Load Custom Styles Conditionally

```javascript
// src/App.jsx

import { getTenant } from './utils/tenant';
import { useEffect } from 'react';

function App() {
  const tenant = getTenant();
  
  useEffect(() => {
    // Load tenant-specific CSS
    if (tenant === 'pindkepar') {
      import('./styles/tenants/pindkepar.css');
    } else if (tenant === 'warghat') {
      import('./styles/tenants/warghat.css');
    }
  }, [tenant]);
  
  return (
    // Your app
  );
}
```

### Step 4: Route to Custom Component

```javascript
// src/App.jsx or Router

import { getComponent } from './utils/componentFactory';

function AppRoutes() {
  const Homepage = getComponent('Homepage');
  
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      {/* Other routes use shared components */}
    </Routes>
  );
}
```

---

## 💡 Best Practices

### 1. Keep Defaults Strong
- Design the default UI well
- Most GPs (18 out of 20) will use defaults
- Only customize when necessary

### 2. Use Progressive Enhancement
```javascript
// Start with default
<DefaultComponent />

// Add theme customization
<DefaultComponent theme={tenantTheme} />

// Override only if needed
{tenant === 'pindkepar' ? <CustomComponent /> : <DefaultComponent />}
```

### 3. Centralize Configuration
Store all customizations in Firestore, not hardcoded:

```
gramPanchayats/
  pindkepar/
    customization/
      config: {
        useCustomHomepage: true,
        customNavbarStyle: "bordered",
        hideFinancials: false,
        customColors: {
          primary: "#dc2626",
          secondary: "#ea580c"
        }
      }
```

### 4. Document Customizations
```javascript
// src/components/custom/README.md

# Custom Components

## Pindkepar
- Custom Homepage: Modern design with hero section
- Custom Navbar: Bordered style with red theme
- Custom Footer: Extended with social media links

## Warghat
- Custom Navbar: Blue theme with dropdown menus
```

---

## 📊 Customization Decision Matrix

| What to Customize | How to Implement | Complexity |
|-------------------|------------------|------------|
| Colors, Fonts, Logo | Theme Config in Firestore | ⭐ Easy |
| Hide/Show Features | Feature Flags | ⭐ Easy |
| Different Layouts | Layout Factory | ⭐⭐ Moderate |
| Custom Components | Component Override | ⭐⭐ Moderate |
| Entire Page Redesign | Custom Page Component | ⭐⭐⭐ Advanced |
| Different Features | Conditional Rendering | ⭐⭐⭐ Advanced |

---

## 🎨 Example: 20 GPs with Mix of Custom & Default

```
20 Gram Panchayats:

18 GPs:  Use DEFAULT UI
         - Shared Navbar, Footer, Homepage
         - Only customize: colors, logo, content

1 GP:    PINDKEPAR (Partial Customization)
         - Custom Homepage
         - Custom Theme (Red/Orange)
         - Default components for rest

1 GP:    WARGHAT (Minimal Customization)
         - Custom Navbar style
         - Everything else default
```

**Code Maintenance:**
- 95% shared code
- 5% custom code (only where needed)
- Still deploy once, updates all 20 GPs!

---

## 🚀 Implementation Steps for Custom UI

### Quick Version (Theme Only):
1. Add theme config to Firestore ✅
2. Create ThemeProvider ✅
3. Use CSS variables ✅
**Time: 2 hours**

### Medium Version (Component Overrides):
1. Setup component factory ✅
2. Create custom components folder ✅
3. Implement override system ✅
**Time: 4-6 hours**

### Full Version (Complete Custom UI):
1. Create custom pages ✅
2. Add conditional routing ✅
3. Implement feature flags ✅
4. Create custom styles ✅
**Time: 1-2 days**

---

## ✅ Summary

**Can you customize individual GPs? ABSOLUTELY YES!**

You can have:
- ✅ **Pindkepar**: Completely custom UI, red theme, unique homepage
- ✅ **Warghat**: Blue theme, custom navbar
- ✅ **18 other GPs**: Use default UI with minimal theme changes

**Key Benefits:**
- 95% code shared
- Only customize what's different
- One deployment updates all
- Easy to maintain

**Next:** Want me to implement this customization system for you?
