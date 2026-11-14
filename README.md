# LifeOS

> **Your life. Your goals. Your next step.**  
> *One platform. Every part of your life.*

LifeOS is an intelligent, modular personal life management platform designed to unify tasks, goals, habits, careers, finances, learning, and daily reflection into a single cohesive mobile experience.

Built with a **Dark Premium**, **Violet Accent**, and **Balanced UI** design system, LifeOS avoids visual clutter while delivering powerful utility.

---

## 📱 Features (MVP - Phase 1)

### 1. Authentication & Onboarding (P0)
- **Login Screen:** Clean credential inputs, form validation, show/hide password toggle, and graceful error handling.
- **Register Screen:** User profile creation, password strength validation, password match verification, and Terms & Privacy consent.
- **Security-First UX:** No misleading placeholder buttons; clear feedback states and safe error messages.

### 2. Main Dashboard (P0)
- **Top App Bar:** Brand wordmark, notification center badge, and interactive profile avatar.
- **Time-Aware Greeting:** Personalized greeting (`Good morning / afternoon / evening, [Name]!`) with daily motivation.
- **Weekly Progress Tracker:** A real calculation based strictly on user-defined tasks and goals (**72% completed**). No artificial or arbitrary scores.
- **Quick Stats:** 2-column metric cards highlighting `5/8 Tasks completed` and `3 Active goals`.
- **Today's Agenda:** Chronological view of today's schedule with category tags (Learning, Career, Personal) and interactive checkboxes.
- **Dynamic Empty States:** Built-in empty-state illustrations and *"Add your first task"* actions, switchable for testing.
- **Your Spaces (8 Modular Hubs):** Dedicated hubs for *Career*, *Academic*, *Finance*, *Health & Wellness*, *Learning*, *Social*, *Personal*, and *LifeOS AI*.
- **5-Tab Navigation:** Streamlined bottom navigation covering `Home`, `Calendar`, `Tasks`, `AI`, and `Profile`.

---

## 🎨 Design System

| Token | Hex | Usage |
|---|---|---|
| **Background** | `#11121C` | Deep dark application background |
| **Surface** | `#1B1C2B` | Cards, input fields, containers |
| **Surface Elevated** | `#24253A` | Modals, active sheets, dialogs |
| **Primary / Violet** | `#8B7CF6` | Primary action buttons, active tabs |
| **Primary Pressed** | `#7969E8` | Pressed / interactive states |
| **Secondary Violet** | `#B6ABFF` | Secondary text, subtle highlights |
| **Success / Mint** | `#51D4B5` | Task completion, positive progress |
| **Warning** | `#F3B86C` | Approaching deadlines, alerts |
| **Danger** | `#F07891` | Errors, critical actions |
| **Text Primary** | `#F5F5FA` | Headings and primary text |
| **Text Secondary** | `#A4A5B8` | Subtitles, labels, placeholders |
| **Border** | `#303146` | Subtle dividers and card borders |

---

## 🛠️ Technology Stack

### Mobile Application
- **Framework:** [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/) (SDK 58)
- **Language:** TypeScript
- **Icons:** Lucide Icons (`lucide-react-native`)
- **Platform Support:** iOS, Android, and Web preview

### Backend & Infrastructure (Planned)
- **API Framework:** ASP.NET Core .NET 10 Web API
- **Architecture:** Modular Monolith / Clean Architecture
- **Database:** PostgreSQL with EF Core
- **Caching & Real-time:** Redis & SignalR
- **Authentication:** ASP.NET Core Identity with JWT & Refresh Tokens
- **Containerization:** Docker & Docker Compose

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+ or v22+)
- npm or bun
- Expo Go on iOS/Android (for testing on physical devices)

### Installation

```bash
# Clone the repository
git clone https://github.com/mmerve1/lifeos.git
cd lifeos

# Install dependencies
npm install

# Start the Expo development server
npx expo start
```

### Available Scripts

- `npm run start` - Launches Expo development server
- `npm run web` - Runs the application in the web browser
- `npm run android` - Runs on connected Android device/emulator
- `npm run ios` - Runs on iOS simulator (macOS only)
- `npx tsc --noEmit` - Executes TypeScript typechecking

---

## 🗺️ Roadmap

- [x] **Phase 1: Mobile UI Foundation**
  - [x] Design token system and typography setup
  - [x] Core reusable component library
  - [x] Login, Register, and Main Dashboard screens
  - [x] Empty & populated state management
- [ ] **Phase 2: Backend & Authentication**
  - [ ] .NET 10 Web API Modular Monolith skeleton
  - [ ] PostgreSQL schema & EF Core migrations
  - [ ] JWT authentication & refresh token flow
- [ ] **Phase 3: Modular Spaces & AI Layer**
  - [ ] Habit & Task management engines
  - [ ] Provider-agnostic AI Daily Review service
  - [ ] Real-time updates via SignalR

---

## 📄 License
This project is licensed under the MIT License.
