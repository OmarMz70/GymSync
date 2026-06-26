# GymSync — Claude Code Memory

## Project Overview
GymSync is a social gym tracking app built with React Native (Expo SDK 54). It lets friends track each other's gym status, log workouts, and compete in weekly group leaderboards.

## Tech Stack
- **Frontend:** React Native with Expo SDK 54
- **Navigation:** @react-navigation/native + @react-navigation/stack + @react-navigation/bottom-tabs
- **Backend (planned):** Firebase (Auth + Firestore)
- **Language:** JavaScript (not TypeScript)
- **Entry point:** `App.js` (not index.tsx — this project uses the bare Expo template)

## Project Structure
```
GymSync2/
├── App.js          ← All screens and logic live here for now
├── index.js        ← Entry point, registers App.js
├── app.json        ← Expo config
└── assets/         ← Images and icons
```

## App Screens & Tab Order
1. **Settings** (far left) — theme, language, account info
2. **Activity** — workout logger, posts to Home feed on finish
3. **Home** (center, red circle button) — social feed of friend workouts, newest first
4. **Friends** — friend list sorted by status, Add friend by ID, groups
5. **Profile** (far right) — PFP, name, gym(s), split, log out

## Design System
- Background: `#0d0d0d`
- Cards: `#1a1a1a`
- Input fields: `#111`
- Primary/accent: `#e63946` (red)
- Active teal (already went): `#2a9d8f`
- Warning orange (will go): `#f4a261`
- Inactive grey: `#555` or `#888`
- Text primary: `#fff`
- Text secondary: `#888`

## Key Features & Logic

### Activity Screen
- User picks workout day based on their split (PPL hardcoded for now, will come from Profile)
- User types exercise name (free text, no preset list)
- Per exercise: add sets with reps + weight (kg)
- Delete exercise with ✕ button
- "Finish Workout 💪" button appears when at least 1 exercise is logged
- On finish → post appears in Home feed + updates Friends screen status

### Home Screen
- Feed of completed friend workouts, newest first
- Each card: avatar (first letter), name, workout type, relative time (e.g. "2h ago")
- Collapsed by default, "More ▼" button expands to show all exercises and sets
- Song sharing cards will appear here later (cosmetic feature, build last)

### Friends Screen
- Sorted by status: Will Go → In Gym → Already Went → Won't Go
- Each card: colored avatar, name, workout day, status badge
- "Add +" button → add friend by unique user ID
- Groups button → create group with friends, weekly leaderboard resets Saturday midnight
- Weekly winner announced when any group member opens app on Sunday

### Profile Screen
- Avatar (first letter placeholder, real PFP later)
- Fields: Full Name, Gym(s), Current Split (shown stacked, label bold, value smaller grey)
- Edit Profile button toggles edit mode — split picker appears with options + Custom
- Log out button (red text, grey border)

### Settings Screen
- Dark mode toggle
- Language picker: English / العربية
- Account Info (change email + password)
- Notifications, Privacy (placeholders)
- Version number

## Split Options
PPL, Upper/Lower, Bro Split, Full Body, Arnold Split, 5/3/1, Custom (user defines own days)

## Status Types
- `will_go` → orange `#f4a261`
- `in_gym` → red `#e63946`
- `already_went` → teal `#2a9d8f`
- `wont_go` → dark grey `#444`

## What's NOT built yet
- Firebase auth + Firestore (planned after UI is complete)
- Real friend adding by ID
- Group chat
- Weekly leaderboard logic
- Song sharing (cosmetic, build last)
- Real PFP upload
- Arabic language support
- Light mode

## Install & Run
```bash
cd GymSync2
npm install
npx expo start --clear
```
Scan QR with Expo Go app (SDK 54 version). Both PC and phone must be on same WiFi.

## Important Notes
- Use `--legacy-peer-deps` for npm installs due to react-native version conflicts
- All screens are currently in one `App.js` file — refactor into separate files later
- Fake/hardcoded data is used throughout — will be replaced with Firebase
- Do NOT use TypeScript, keep everything in .js