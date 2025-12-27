# 🏛️ Gram Panchayat Website - Setup Guide for Team Members

## 📋 Prerequisites
- Node.js (v18 or higher)
- Git
- Firebase account

## 🚀 Quick Start (5 Minutes Setup)

### Step 1: Clone the Repository
```bash
git clone https://github.com/vishwasT007/grampanchayat-multi-tenant.git
cd grampanchayat-multi-tenant/grampanchayat
```

### Step 2: Checkout the Develop Branch
```bash
git checkout develop
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Setup Firebase Configuration

Create a `.env` file in the root directory:
```bash
touch .env
```

Add your Firebase credentials to `.env`:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=grampanchayat-dev
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
```

**Note:** Contact the project admin for Firebase credentials.

### Step 5: Start Development Server
```bash
npm run dev
```

The website will open at: **http://localhost:5173/**

---

## 🎯 What You'll See (Latest Features)

### ✅ New Components Implemented
1. **Government Header** (`src/components/layout/GovernmentHeader.jsx`)
   - Maharashtra Government style design
   - TOP UTILITY BAR (36px): Flag + government text, language toggle
   - MAIN HEADER BAR (110px): Emblem + department name, search bar, logos
   - Navigation bar with orange background
   - 4 logo upload positions

2. **Officials Showcase** (`src/components/home/OfficialsShowcase.jsx`)
   - 1:1 replica of Maharashtra govt website
   - Circular photos (140px × 140px)
   - Clean 3-column grid layout
   - No cards, no shadows - pure government style

3. **Homepage Slider** (`src/components/home/HomeSlider.jsx`)
   - Auto-playing carousel
   - Bilingual support (English/Marathi)
   - Navigation arrows and dot indicators

4. **Admin Panels**
   - Slider Management (`/admin/slider`)
   - Officials Management (`/admin/officials`)
   - Site Settings with 4 header logo upload fields

---

## 🎨 Design Features

### Typography
- **Primary Font:** Noto Sans
- **Marathi Font:** Noto Sans Devanagari
- Clean, professional, government-approved fonts

### Color Palette (Locked - Government Standards)
- White background: `#FFFFFF`
- Primary orange: `#F59E0B`
- Dark heading: `#1F2937`
- Normal text: `#374151`
- Light border: `#E5E7EB`

### Layout Specifications
- Max-width: 1200px
- Officials grid: 3 columns, 64px column gap, 56px row gap
- Image border: 1.5px solid #D1D5DB
- Circular photos: 140px × 140px

---

## 🔑 Admin Access

**Development Admin Credentials:**
- Email: `admin@pindkepar.in`
- Password: `DevAdmin@123`

**Admin Dashboard:** http://localhost:5173/admin/dashboard

---

## 📂 Project Structure

```
grampanchayat/
├── src/
│   ├── components/
│   │   ├── home/
│   │   │   ├── HomeSlider.jsx          ← NEW: Homepage carousel
│   │   │   └── OfficialsShowcase.jsx   ← NEW: Officials display
│   │   └── layout/
│   │       └── GovernmentHeader.jsx    ← NEW: Govt-style header
│   ├── pages/
│   │   ├── Home.jsx                     ← UPDATED: Integrated new components
│   │   └── admin/
│   │       ├── SliderManagement.jsx     ← NEW: Manage slides
│   │       ├── OfficialsManagement.jsx  ← NEW: Manage officials
│   │       ├── AdminDashboard.jsx       ← UPDATED: New cards
│   │       └── SiteSettings.jsx         ← UPDATED: Logo uploads
│   ├── services/
│   │   ├── slidesService.js             ← NEW: Slides CRUD
│   │   └── officialsService.js          ← NEW: Officials CRUD
│   └── config/
│       └── firebaseConfig.js            ← UPDATED: Dev environment
├── index.html                            ← UPDATED: Google Fonts
├── tailwind.config.js                    ← UPDATED: Noto Sans fonts
└── .env                                  ← CREATE THIS!
```

---

## 🧪 Testing the New Features

### 1. View Homepage
- Open http://localhost:5173/
- Officials showcase should appear at the top
- Scroll to see the slider with 3 dummy slides
- All text should render properly in both languages

### 2. Test Language Toggle
- Click "A | अ" in the top utility bar
- All content should switch between English and Marathi

### 3. Test Admin Panels
1. Login: http://localhost:5173/admin/login
2. Go to Dashboard
3. Click "Homepage Slider" card
4. Try adding a new slide with image upload
5. Click "Government Officials" card
6. Try adding a new official with photo

### 4. Test Header Logo Uploads
1. Go to Site Settings
2. Scroll to "Government Header Logos"
3. Upload test images for all 4 positions:
   - Left Logo (Indian Flag)
   - Center Emblem (National Emblem)
   - Right Logo 1 (Badge)
   - Right Logo 2 (Logo)

---

## 📝 Dummy Data Included

### Homepage Slider (3 Slides)
1. "Welcome to Our Gram Panchayat"
2. "Digital India Initiative"
3. "Clean & Green Village"

### Government Officials (4 People)
1. Shri Ramesh Kumar Patil - Sarpanch
2. Smt. Sunita Devi Sharma - Deputy Sarpanch
3. Shri Vijay Singh Thakur - Gram Sevak
4. Smt. Anjali Deshmukh - Secretary

All use professional placeholder images from Unsplash.

---

## 🐛 Troubleshooting

### Issue: Firebase errors
**Solution:** Make sure you created `.env` file with correct Firebase credentials.

### Issue: "Module not found" errors
**Solution:** Run `npm install` again.

### Issue: Port 5173 already in use
**Solution:** Kill the existing process:
```bash
pkill -f "vite"
npm run dev
```

### Issue: Fonts not loading
**Solution:** Check internet connection (Google Fonts are loaded from CDN).

---

## 🔄 Staying Up to Date

Pull the latest changes from develop branch:
```bash
git pull origin develop
npm install  # In case new dependencies were added
npm run dev
```

---

## 📚 Documentation Files

- `GOVERNMENT_WEBSITE_ENHANCEMENT_GUIDE.md` - Complete implementation guide
- `LOCAL_DEV_SUCCESS.md` - Development environment setup
- `README.md` - Project overview

---

## 🤝 Contributing

1. Create a new branch from `develop`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Commit with clear messages:
   ```bash
   git add .
   git commit -m "feat: Add your feature description"
   ```

4. Push to your branch:
   ```bash
   git push origin feature/your-feature-name
   ```

5. Create a Pull Request to `develop` branch

---

## 📞 Support

If you face any issues:
1. Check the troubleshooting section above
2. Read the documentation files
3. Contact the project admin

---

## 🎊 You're All Set!

Your development environment is ready. Start building amazing government websites! 🏛️

Happy Coding! 🚀
