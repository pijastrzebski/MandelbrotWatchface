# Amazfit Zepp OS Watchface with Real-Time Progressive Mandelbrot Zoom & Pure Digital AOD

A sleek, minimalist, feature-packed digital watchface built with **Zepp OS** (compatible with Zepp OS 2.0, 3.0, 3.5, and 4.0+) targeting **circular Amazfit smartwatches** (Amazfit T-Rex 3, Balance, Cheetah, Active, GTR 4, etc.).

---

## Features

- 🎯 **Round Display Optimized**:
  - Exclusively configured for round Amazfit devices (`"st": "r"`, 480x480 resolution) compliant with Zepp Open Platform submission standards.

- 🌙 **Dedicated Pure Digital AOD (Always-On Display)**:
  - Automatically detected via `getScene() === SCENE_AOD`.
  - **Zero Animations & Zero Background**: Pure solid OLED black (`#000000`) background with no canvas drawing or fractal loops running, ensuring optimal power efficiency.
  - Displays large, centered, crisp white digital time (`HH:MM`) and subtle date header.
  - Reduced timer tick interval during AOD to protect battery life.

- ✨ **Ultra-Bold Modern Typography**:
  - Direct overlay of **Outfit Black (900 Weight)** typography directly across the screen.
  - Punchy, heavy `132px` time digits with maximum glanceability.

- ⚡ **Hardware-Optimized Active Zoom Engine**:
  - Continuous potential shading guarantees **zero black or blank frames**.
  - Reduced native Canvas bridge calls by **>90%** (~100 line spans per frame) for fluid 1 Hz animation on physical watch hardware.
  - Rotates through 8 iconic landmarks each minute (*Seahorse Valley*, *Triple Spiral*, *Elephant Valley*, *Mini-Brot Satellite*, *Starfish Galaxy*, *Feather Valley*, *Julia Islands*, *Golden Spiral*).

- 🕒 **Digital Clock**: Large `HH:MM` display (no seconds) with 12h/24h format support.
- 📅 **Date & Day**: Full day of week and month calendar header (`MONDAY, AUG 24`).
- 👟 **Step Tracker**: Live step counter with daily goal percentage (`GOAL 85%`) and visual left-bezel progress arc.
- ⚡ **Battery Monitor**: Live battery percentage with power status and visual right-bezel dynamic color arc (Green / Amber / Red).
- ♥️ **Heart Rate Monitor**: Real-time heart rate sensor tracking in BPM.
- 🔥 **Calorie Burned**: Active daily calorie expenditure counter.
- 🔄 **Lifecycle Safe**: Proper resource cleanup in `onDestroy` to prevent battery drain.

---

## Project Structure

```
├── app.json              # Zepp OS application configuration (Round platforms only)
├── app.js                # Global application lifecycle
├── watchface/
│   └── index.js          # Active watchface, AOD digital mode, Mandelbrot zoom engine
├── assets/               # Application icons and custom fonts
│   ├── icon.png
│   ├── fonts/
│   │   ├── outfit-black.ttf  # Ultra-bold Outfit 900 typography
│   │   └── outfit.ttf
│   ├── default.r/
│   └── default.s/
├── dist/                 # Compiled Zepp Application Bundles (.zab)
├── package.json          # Project metadata and build scripts
└── README.md             # Project documentation
```

---

## Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **Zeus CLI**: `@zeppos/zeus-cli` (`npm install -g @zeppos/zeus-cli`)

### Commands

#### 1. Build Production Package
```bash
zeus build
```

#### 2. Run Simulator (Development Mode)
```bash
zeus dev
```

#### 3. Preview on Physical Watch
```bash
zeus preview
```
