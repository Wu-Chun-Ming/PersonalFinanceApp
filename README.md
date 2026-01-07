# Personal Finance App (Expo)

A personal finance mobile app built with **Expo**, **React Native**, and **TypeScript**, using **Expo Router** for file-based navigation and a local **SQLite** database for offline-first data storage.

## Get Started

**Install dependencies:**

```bash
npm install
```

**Start Metro / Expo Dev Tools:**

```bash
npm start
# or
npx expo start
```

**Run on Android:**

```bash
npx expo run:android
```

## Project Structure

- `app/`        — App entry point and screens (file-based routing via expo-router)
- `__tests__`   — Automated tests
- `assets/`     — Fonts, images, and static assets
- `components/` — Reusable UI components
- `constants/`  — Shared constants and configuration
- `database/`   — SQLite setup and schema
- `hooks/`      — Custom React hooks
- `modules/`    — Custom Expo native modules
- `services/`   — App services and APIs
- `types/`      — TypeScript type definitions
- `utils/`      — Utility helpers
- `validation/` — Validation schemas

## Technology Stack

- **Framework:** Expo
- **Mobile:** React Native 0.79.x, React 19
- **Language:** TypeScript
- **Styling:** Tailwind / `nativewind` and `gluestack-ui`
- **State & Data:**
  - `@tanstack/react-query` — async state management
  - `expo-sqlite` — local database storage
- **Testing:** Jest with `jest-expo` and `@testing-library/react-native`

### Testing

Run all tests in watch mode:
```bash
npm test
```

Run unit tests under `__tests__/unit`
```bash
npm run test:unit
```