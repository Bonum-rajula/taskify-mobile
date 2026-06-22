# Taskify Mobile Client 🚀

**Executive Engineering Assessment Submission**

A production-grade, offline-resilient React Native mobile application built to interface with the Spearhead Express backend. Engineered with strict adherence to SOLID principles, Single Source of Truth (SSOT) state management, and native OS integrations.

---

## 🛠️ Visual Verification & Links

* **📺 Video Walkthrough (2-mins):** `[INSERT_YOUTUBE_OR_LOOM_LINK_HERE]`
* **🌐 Live Web Staging Build:** `[INSERT_VERCEL_OR_EXPO_WEB_LINK_HERE]`
* **📦 Android APK Download:** `[INSERT_DRIVE_LINK_TO_APK_HERE]`

*(Note: The web staging build features functional graceful fallbacks for native-only modules like the HTML5 date picker and `mailto:` protocol handlers).*

---

## 🚀 Quick Start & Environment Initialization

### 1. Prerequisites
* **Node.js**: v18.x or higher
* **Package Manager**: `npm` or `yarn`
* **Environment**: iOS Simulator (Xcode) or Android Emulator (Android Studio), or the Expo Go app on a physical device.

### 2. Environment Configuration
Create a `.env` file in the root of the project. Use the following template to map the mobile client to your local Spearhead Express backend:

```env
# .env.example
EXPO_PUBLIC_API_URL=http://localhost:5000/api

# Note: If testing via physical device/Expo Go, replace 'localhost' with your 
# machine's local IPv4 address (e.g., [http://192.168.1.50:5000/api](http://192.168.1.50:5000/api))