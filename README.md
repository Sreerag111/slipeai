# Slipe AI Enterprise — Batch Media Enhancement Platform

A production-grade, enterprise AI photo enhancement and advertising creative generation web platform built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, **Topaz Labs Platform API**, and **Google Firebase**.

---

## 🚀 Key Highlights & Architecture

- **Brand & Theme**: Enterprise dark aesthetic inspired by *Linear*, *Stripe Dashboard*, and *Vercel* with deep obsidian `#080B10`, charcoal panels, sharp typography, and subtle blue accents (`#2563EB`, `#3B82F6`).
- **Main Dashboard**:
  - Hero with prompt headline: **“Enhance at Scale.”**
  - Subtitle: *“Batch-process photos and generate advertising creatives with AI. Upload thousands of assets, process them efficiently, and download your results in bulk.”*
  - Compact KPI metrics: Total Files Processed, Active Batches, Completed Batches, SLA/Failed files, API Credits Remaining, Total Output Storage Volume.
  - **The 11 Feature Square Cards Grid**:
    1. **Upscale Photos** — Up to 8x resolution scaling with neural facial detail reconstruction.
    2. **B&W to Colour** — Deep historical and portrait archival colorization.
    3. **Refine Photos** — Texture synthesis, micro-contrast, and dynamic range recovery.
    4. **Fix Dust & Scratches** — Museum-grade inpainting of creases, film tears, and dust specks.
    5. **Clean Up Photos** — Automated sensor speck, blemish, and distraction cleanup.
    6. **Fix Lighting** — Topaz Adjust dynamic range, exposure compensation, and shadow lift.
    7. **Sharpen Photos** — Topaz Sharpen AI reversing lens blur and motion camera shake.
    8. **Remove Background** — Production alpha cutouts for e-commerce products and portraits.
    9. **Enhance Photo Quality** — Topaz Denoise luminance and chrominance cleanup.
    10. **Balance Colour** — Studio white balance and chromatic consistency across collections.
    11. **AI Ad Image Generator** — Separate campaign generation engine with multi-aspect ratio presets (1:1, 4:5, 16:9, 9:16), platform presets (Instagram, Facebook, Google Ads, E-commerce), variation gallery, and bulk ZIP export.
- **Dedicated Batch Workspaces**:
  - Every one of the 11 features has its own dedicated workspace at `/workspace/[featureId]` with drag & drop, multi-file uploads, file removal, select all, custom feature settings, progress bars, queue table, and real client-side ZIP packaging via `JSZip`.
  - **1-Click "Load Sample Batch"**: Test batch processing immediately with high-resolution portrait, product, architecture, and vintage assets.
  - **Interactive Before/After Split Viewer**: Inspect high-magnification split slider comparisons between original and enhanced images.
- **Backend Topaz Labs Integration**:
  - Connects securely via `/api/topaz/enhance` using API Key `5012739d-5a5b-48ca-a5e3-1b808ba3d9a8`. Keys are stored strictly on the server (`.env.local`) and never exposed to browser code.
  - Live status verified against Topaz Image v1 API (`https://api.topazlabs.com/image/v1`).
- **Google Firebase Firestore**:
  - Connected to Firebase project `paceai-4733a` with continuous synchronization of batch metadata, queue jobs, and organization telemetry.
- **Enterprise Download Center**:
  - Search, filter by feature/batch/status, multi-selection, and real-time ZIP archive creation.
- **Management & Security**:
  - Audit-friendly batch history, API usage telemetry with daily consumption charts, RBAC team management, credit billing tiers, and naming rule templates.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14.2 (App Router)
- **Language**: TypeScript 5.6
- **Styling**: Tailwind CSS, Custom Dark Theme CSS
- **Icons**: Lucide React
- **Packaging**: JSZip & FileSaver
- **State Management**: Zustand
- **Database**: Google Firebase SDK (`paceai-4733a`)
- **API Engine**: Topaz Labs Platform API (`https://api.topazlabs.com/image/v1`)

---

## 🏃 Getting Started

### 1. Environment Configuration (`.env.local`)
```env
# Topaz Labs Platform API (Server-Side Only)
TOPAZ_API_KEY=5012739d-5a5b-48ca-a5e3-1b808ba3d9a8
TOPAZ_API_BASE=https://api.topazlabs.com/image/v1

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_PROJECT_ID=paceai-4733a
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=paceai-4733a.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=paceai-4733a.appspot.com
```

### 2. Run the Application
```bash
# Start Production Server
npm run start -p 3000

# Or Start Development Server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
