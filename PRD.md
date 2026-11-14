# LifeOS — Product Requirements Document (PRD)

**Document Version:** 1.0.0 (MVP)  
**Author:** Product & Architecture Team  
**Status:** Approved / In Implementation  
**Target Release:** Q1 2027  
**Repository:** [github.com/mmerve1/lifeos](https://github.com/mmerve1/lifeos)

---

## 1. Executive Summary & Vision

### 1.1 Product Vision
**LifeOS** is an intelligent, modular personal operating system designed to unify all aspects of personal management into a single, cohesive platform. Rather than forcing users to juggle disconnected tools for task tracking, habits, financial budgets, academic milestones, and career planning, LifeOS connects these domains into an actionable daily hub.

> **Slogan:** *Your life. Your goals. Your next step.*  
> **Brand Message:** *One platform. Every part of your life.*

### 1.2 Core Pillars
1. **Modularity:** 8 distinct lifestyle domains that can be used independently or collaboratively.
2. **Actionable Simplicity:** High information density balanced with clean, distraction-free visual design.
3. **Privacy & Control:** User data remains under the user's control, with transparent calculations (no opaque or randomized "Life Scores").
4. **Resilient Architecture:** Modular Monolith backend powering cross-platform native mobile clients.

---

## 2. Target Audience & Persona

- **The Continuous Learner / Professional (Primary Persona):**  
  Tech-savvy individuals, students, developers, and knowledge workers who maintain goals across career progression, health, and personal learning. They value speed, dark mode, keyboard navigation, and reliable cross-device synchronization.

---

## 3. Design System & UX Standards

### 3.1 Design Direction: Dark Premium · Violet Accent · Balanced UI
- **Primary Color Palette:**
  - `Background`: `#11121C` (Deep void dark)
  - `Surface`: `#1B1C2B` (Cards, panels, forms)
  - `Surface Elevated`: `#24253A` (Modals, sheets, tooltips)
  - `Primary / Violet`: `#8B7CF6` (Main interaction color)
  - `Primary Pressed`: `#7969E8` (Active click feedback)
  - `Secondary Violet`: `#B6ABFF` (Subtle badges, highlighted links)
  - `Success / Mint`: `#51D4B5` (Completed milestones, positive progress)
  - `Warning`: `#F3B86C` (Upcoming deadlines)
  - `Danger`: `#F07891` (Validation errors, destructive actions)
  - `Border`: `#303146` (Subtle stroke definition)

### 3.2 Spacing & Metrics
- Horizontal screen padding: `20–24px`
- Input & primary button height: `52–56px`
- Corner Radii: Cards `16px`, Inputs `12px`, Modals `20px`
- Minimum touch targets: `44–48px`
- Iconography: Lucide line icons with consistent `2px` stroke

---

## 4. Functional Requirements (P0 - MVP Scope)

### 4.1 Authentication & User Management (P0)
| ID | Requirement | Description |
|---|---|---|
| **AUTH-01** | User Registration | Supports Full Name, Email, Password, and Password Confirmation with live client-side validation. |
| **AUTH-02** | Terms Consent | Explicit checkbox acceptance for Terms of Service and Privacy Policy before account creation. |
| **AUTH-03** | User Login | Authenticates with email and password, returning JWT access & refresh tokens. |
| **AUTH-04** | Input States | Persistent labels, custom placeholders, password visibility toggle, focused borders, error inline helpers. |
| **AUTH-05** | Honest UI | No non-functional third-party OAuth placeholders until active integrations exist. |

### 4.2 Main Dashboard (P0)
| ID | Requirement | Description |
|---|---|---|
| **DASH-01** | Top App Bar | Displays LifeOS wordmark, interactive notifications icon with count badge, and user avatar. |
| **DASH-02** | Dynamic Greeting | Time-aware greeting (`Good morning`, `Good afternoon`, `Good evening`) with localized user name. |
| **DASH-03** | Weekly Progress | Visual progress bar calculated strictly from active user tasks and milestones (target: 72% demo data). |
| **DASH-04** | Quick Stats | 2-column key performance metrics (`Tasks Completed: 5/8`, `Active Goals: 3`). |
| **DASH-05** | Today's Agenda | Chronological agenda list with time, category tag, and completion checkbox toggle. |
| **DASH-06** | Empty State Support | Full support for empty agenda view with informative message and "Add your first task" action. |
| **DASH-07** | Modular Spaces List | Direct access cards for all 8 modular spaces. |
| **DASH-08** | Bottom Navigation | 5 fixed tabs: Home, Calendar, Tasks, AI, Profile with active violet indicator. |

---

## 5. The 8 Modular Spaces (Ecosystem Scope)

1. **Career:** Job applications, project roadmaps, work logs, CV document handling.
2. **Academic:** Courses, exam calendars, lecture notes, semester GPA tracking.
3. **Finance:** Income/expense logging, monthly budget thresholds, subscription tracker.
4. **Health & Wellness:** Workout routines, hydration, sleep quality, and daily habit streaks.
5. **Learning:** Books reading list, language flashcards, course certificates.
6. **Social:** Important relationship milestones, networking contacts, event calendar.
7. **Personal:** Daily gratitude journal, personal reflections, life vision board.
8. **LifeOS AI:** Cross-module daily briefing, bottleneck detection, and weekly reviews.

---

## 6. Technical Architecture

### 6.1 System Architecture Diagram
```
┌────────────────────────────────────────────────────────┐
│               React Native (Expo SDK 58)               │
│         iOS  │  Android  │  Web Development Preview    │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / WSS
                            ▼
┌────────────────────────────────────────────────────────┐
│             ASP.NET Core .NET 10 Web API               │
│          Modular Monolith / Clean Architecture         │
├────────────────────────────────────────────────────────┤
│  Modules:                                              │
│  [Identity] [Personal] [Career] [Academic] [Finance]   │
│  [Health]   [Learning] [Social] [AI Orchestration]     │
└──────────────┬────────────────────────────┬────────────┘
               ▼                            ▼
┌──────────────────────────────┐ ┌───────────────────────┐
│     PostgreSQL Database      │ │      Redis Cache      │
│  (Users, Tasks, Spaces, Logs)│ │(Sessions, Fast States)│
└──────────────────────────────┘ └───────────────────────┘
```

### 6.2 Data Security & Storage
- Passwords hashed using PBKDF2 / Argon2 via ASP.NET Core Identity.
- JWT Access Tokens (15 min lifespan) with rotating Refresh Tokens stored securely in native keychain/keystore.
- File assets (CVs, profile avatars) stored in S3-compatible object storage via signed URLs.

---

## 7. Quality & Acceptance Criteria

- **Zero TypeScript Errors:** Verified via `npx tsc --noEmit`.
- **Responsive Across Viewports:** Mobile-first layout with `KeyboardAvoidingView` to prevent keyboard occlusion.
- **Accessible Contrast:** Meets WCAG 2.1 AA contrast requirements for dark interfaces.
- **Component Reusability:** Every form field, button, and card abstracted into the `src/components/` library.
