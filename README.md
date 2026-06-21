# Taskify Mobile

A secure, high-performance task management application built with React Native (Expo) and strictly typed with TypeScript. 

## Architecture & Tech Stack
* **Framework:** React Native / Expo Router
* **State Management:** Zustand (Client State) & TanStack Query (Server State/Caching)
* **Network Layer:** Axios with centralized JWT interceptors
* **Security:** `expo-secure-store` for native keychain token encryption

## Local Setup
1. Clone the repository.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and update your local IP address for the API url.
4. Run `npx expo start` to launch the development server.

## Engineering Principles
This codebase strictly adheres to Separation of Concerns (SOC). Business logic and network requests are decoupled from UI components using custom hooks.
