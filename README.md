# Taskify Mobile

A polished **React Native (Expo)** mobile client for the **Taskify** task management system.

Taskify Mobile provides a clean, responsive, and secure task management experience with:
- authenticated user sessions,
- task creation and tracking,
- offline-friendly server-state caching,
- mobile-first UI flows,
- and a professional Expo-based development workflow.

---

## Overview

Taskify Mobile is the front-end application for the Taskify ecosystem. It is built with modern React Native tooling and is designed to work seamlessly with the Taskify backend API.

The app uses a **bifurcated state model**:
- **Client state** is managed with **Zustand** for lightweight UI and auth metadata.
- **Server state** is managed with **TanStack Query** for fetching, caching, and syncing API data.

This separation keeps the codebase clean, maintainable, and highly scalable.

---

## Key Features

- Secure authentication flow
- Task creation, listing, updating, and deletion
- Persistent auth/session state
- Optimistic UI patterns through query caching
- Mobile-first interface built with Expo Router
- Clean architecture with separation of concerns
- Environment-based API configuration
- Prepared for Android and iOS builds

---

## Tech Stack

- **React Native**
- **Expo**
- **Expo Router**
- **Zustand**
- **TanStack Query**
- **AsyncStorage**
- **expo-secure-store**
- **expo-mail-composer**
- **TypeScript**

---

## Project Structure

```text
taskify-mobile/
├── app/                  # Expo Router screens and navigation
├── assets/               # Images, icons, and static resources
├── src/
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Custom hooks and query hooks
│   ├── lib/              # API client and configuration
│   ├── store/            # Zustand state stores
│   ├── utils/            # Helpers and shared utilities
│   └── types/            # Shared TypeScript types
├── .env.example          # Example environment variables
├── package.json          # Dependencies and scripts
└── README.md             # Project documentation
```

> Folder names may differ slightly depending on your implementation, but this is the recommended professional structure.

---

## Prerequisites

Before running the app, make sure you have:

- **Node.js** installed
- **npm** or **yarn**
- **Expo CLI** support through `npx`
- A running **Taskify backend API**
- Android Studio, an emulator, or a physical device for mobile testing

---

## Environment Setup

Create a `.env` file in the `taskify-mobile/` directory.

### Example

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

If your backend runs on a different port, update the value accordingly.

---

## Installation

From the `taskify-mobile/` folder:

```bash
npm install
```

---

## Running the App

Start the Expo development server:

```bash
npx expo start
```

Then:
- press `a` to open Android emulator
- scan the QR code with Expo Go on a physical device
- or run the web preview if supported by the project setup

---

## Backend Requirement

This app depends on the Taskify backend API being available.

Make sure the API is running before testing login, tasks, or sync functionality.

Typical backend endpoint base:

```text
http://localhost:3000/api
```

---

## Authentication Flow

Taskify Mobile supports secure authentication with:
- user registration,
- login,
- token-based session handling,
- secure token storage using native storage mechanisms.

Auth metadata such as hydration and login state is managed locally for a smoother startup experience.

---

## State Management

### Client State
Client-only UI state is handled using **Zustand**. This includes:
- authentication flags,
- hydration status,
- transient UI state,
- small shared app states.

### Server State
API-driven data is handled using **TanStack Query**. This includes:
- tasks,
- user profile data,
- mutations,
- refetching,
- caching and background updates.

This structure keeps UI logic separate from network logic.

---

## Security Notes

- Sensitive values should never be committed to Git.
- Use `.env` for local secrets and API URLs.
- Store auth tokens securely using native secure storage.
- Keep the backend and frontend environment variables aligned.

---

## Development Guidelines

- Keep reusable UI in `src/components/`
- Keep API logic in `src/lib/` or `src/hooks/`
- Keep state isolated in `src/store/`
- Use strong TypeScript typing throughout
- Prefer small, testable components
- Avoid hardcoding environment-specific values

---

## Example Scripts

Depending on your project configuration, your `package.json` may include scripts similar to these:

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  }
}
```

Use the scripts defined in your actual `package.json` if they differ.

---

## Common Workflow

```bash
# Install dependencies
npm install

# Start the app
npx expo start

# Run Android
npx expo start --android

# Run iOS
npx expo start --ios
```


---

## Professional Summary

Taskify Mobile is built to demonstrate production-minded mobile engineering with a modern React Native stack, clean architecture, and secure state handling. It is designed to be modular, maintainable, and ready for further expansion.

---

## License


---

## Contact

Video link to the demo: [text](https://drive.google.com/file/d/1FfhiN7sivxA-QsWVwn3c-u8xJw4yeOOR/view?usp=sharing)