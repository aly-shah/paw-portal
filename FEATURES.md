# PawPortal — Current Features

> **The super-app for pets.** Veterinarians, groomers, sitters, a marketplace, and a thriving community — everything a pet needs in one place.

PawPortal is a multi-role React application serving pet owners, veterinarians, clinics, vendors, caregivers, and platform administrators. This document catalogs every feature currently implemented in the system.

---

## 👥 Roles & Access

The platform supports six distinct user roles, each with a tailored dashboard and navigation:

| Role | Description |
|------|-------------|
| **Owner** | Pet parents — manage pets, find care, shop, and connect with the community |
| **Vet** | Independent / home-visit veterinarians — patients, schedule, clinical tools |
| **Clinic** | Clinic staff — full clinic operations, inventory, billing |
| **Vendor** | Product sellers — inventory, orders, analytics |
| **Care Giver** | Walkers, groomers, sitters — jobs, schedule, reviews |
| **Super Admin** | Platform operators — users, inventory, integrations, audit |

---

## 🌐 Public / Pre-Login

- **Landing page** — animated hero, feature highlights, "How it Works," community preview, social proof ("10,000+ pet parents").
- **Quick-nav CTAs** — jump straight toward Services, Marketplace, or Community (routes through sign-up).
- **Authentication** — login and sign-up flows (`AuthPage`).
- **Admin Portal entry** — separate hardened login (`AdminLogin`) with credentials + two-factor (2FA) step.

---

## 🐾 Pet Owner Features

### Pet Profiles (`PetProfileManager`, `PetDirectory`)
- Rich pet profiles: name, type, breed, age, weight, gender, color, microchip, neuter status, photo.
- **Personality & behavior** tracking — energy level, trainability, behavior tags (Friendly, Anxious, Vocal, …).
- Dietary notes, vitals, and medical history.
- Privacy controls — mark a pet profile public or private.
- **Pet Directory** — browse public pets across the platform.

### Find Care (`FindCare`, `ServiceFinder`)
- Discover service providers: **home-visit vets, clinics, and walkers/caregivers**.
- Provider profiles with services offered, ratings, and details.
- **AI provider insights** — generates a compatibility score and tailored questions to ask a provider for a specific pet.

### Marketplace (`Marketplace`)
- Browse and shop pet products by category.
- Shopping cart with cart-item management.
- Product listings with pricing.

### Community (`Community`)
- Social feed with multiple post types: **General, Tip, Promotion, Alert, Service**.
- Posts, comments, and engagement.
- **Connections** — a pet-centric social graph (request / pending / connected / rejected) where connections are framed around pets.

### Messaging (`Messages`, `ChatWidget`)
- Direct messaging between users.
- Floating chat widget for quick conversations.

### AI Pet Assistant (`PetAssistant`)
- Conversational AI assistant for pet-care questions.
- **AI symptom checker** — describe a symptom and receive an urgency level (Low / Medium / High) plus advice.

### Adoption Center (`AdoptionCenter`)
- Browse adoptable pet listings.
- Adoption / pet-listing flow.

### Profile & Settings (`ProfileSettings`)
- Manage account and profile settings.

---

## 🧬 Genetics & Heritage Engine

A standout, domain-specific feature set:

- **Lineage Builder** (`LineageBuilder`) — construct a pet's parentage (sire & dam) from purebred, mixed, or unknown sources, with a confidence score.
- **Heritage Dashboard** (`HeritageDashboard`) — view genetic profile, breed traits, and lineage.
- Models for genetic profiles, breed traits, and parent details.

---

## 🚶 Walking & Caregiving

### Caregiver Tools (`CareGiverDashboard`, `ActiveWalkSession`)
- **GPS-tracked walk sessions** — live walk tracking with geo-points and walk events.
- Active walk session management.
- Caregiver dashboard for managing assignments.

### Jobs (`JobFinder`)
- **Job board** — caregivers browse and apply to job listings.
- Job applicants and listing management.
- Schedule and reviews for caregivers.

---

## 🩺 Veterinary & Clinic Suite

### Vet Tools
- **Patient Manager** (`PatientManager`) — patient directory with extended profiles, vitals, and history.
- **Schedule Manager** (`ScheduleManager`) — appointment scheduling.
- **Active Visit** (`ActiveVisit`) — manage an in-progress consultation.
- **Day Stream** (`DayStream`) — daily activity / visit stream.
- **Transaction Engine** (`TransactionEngine`) — billing and transactions.
- **Vet Analytics** (`VetAnalytics`) — practice analytics.

### Clinic Operations
- **Clinic Dashboard** (`ClinicDashboard`) — comprehensive clinic management hub.
- Inventory management for clinics.

### Clinical AI Toolkit (`geminiService`)
A suite of AI assists for clinical workflows:
- **Medical record formatting** — turn rough notes into structured records.
- **Clinical risk analysis** — surface risks from current notes + patient history.
- **Differential diagnosis** — generate likely diagnoses from symptoms, breed, and age.
- **Drug interaction checks** — flag interactions against current medication history.
- **Discharge summaries** — auto-generate owner-friendly discharge documents.
- **Billing code suggestions** — propose billing codes from notes and treatment.

---

## 🛒 Vendor Features (`VendorDashboard`)

- Inventory management.
- **Orders** management.
- **Analytics** dashboard.
- **AI product listing generator** — auto-write product descriptions, tags, category, and a suggested price from a product name.
- **Inventory Import** (`InventoryImportModal`) — bulk inventory import.

---

## 🛡️ Super Admin Platform Console (`SuperAdminDashboard`)

A full operations console with six sections:

1. **Overview** — KPI cards (total users, active vendors, system inventory, API health), a system-growth chart, and a recent-activity audit feed.
2. **User Management** (`UserManagement`) — manage platform users (ban, permissions, roles).
3. **Global Inventory** (`GlobalInventory`) — platform-wide inventory oversight.
4. **API Integrations** — manage integrations (Email, SMS, Push, OTP, Payment, Custom) and trigger events (signup, order created, OTP request, inventory update, payment success, custom).
5. **Audit Logs** — system-wide activity logging.
6. **System Settings** — platform configuration.

---

## 🤖 AI Capabilities (Powered by Google Gemini)

All AI features run through `services/geminiService.ts`:

| Feature | Used by |
|---------|---------|
| Pet-care advice (conversational) | Owners |
| Symptom triage with urgency level | Owners |
| Provider compatibility insights & questions | Owners |
| Medical record formatting | Vets |
| Clinical risk analysis | Vets |
| Differential diagnosis | Vets |
| Drug interaction checks | Vets |
| Discharge summary generation | Vets |
| Billing code suggestions | Vets / Clinics |
| Product listing generation | Vendors |
| **Preventive care-plan generation** | **Owners** |
| **PawScan — visual health triage (image input)** | **Owners** |

---

## 🆕 New Features

The following modules were added on top of the original platform. They share a single
client-side data layer (`contexts/PawDataContext`) so they interconnect — a PawScan
saves to the Health Hub, booking an appointment earns Paw Points, completing a reminder
updates the live balance, and so on. UI is built on a shared primitive library
(`components/ui`: `Button`, `Card`, `KpiCard`, `Badge`, `Modal`, `Toast`, `Tabs`, etc.).

### 1. 🩺 PawScan — AI Visual Health Triage (`components/ai/PawScan.tsx`)
The first **multimodal** use of Gemini in the app. The owner uploads a photo of a
concern (rash, limp, eye), selects the pet, and adds context. `scanPetPhoto()` sends the
image + prompt to Gemini and returns a structured triage: urgency (Low/Medium/High),
observations, possible causes, and a recommendation. Medium/High results offer a one-tap
**Book a vet** handoff, and every scan is appended to the pet's health timeline.

### 2. ❤️ Health Hub (`components/health/HealthHub.tsx`)
The pet's system of record:
- **Health timeline** of events (vaccine, medication, visit, weight, note, scan).
- **Smart reminders** with due / overdue states and Marketplace refill deep-links.
- **AI Care Plan** — `generateCarePlan()` builds a personalised 12-month preventive plan
  from breed, age, weight, and history; accepted tasks become reminders.

### 3. 🛡️ PawTag — Lost & Found (`components/safety/`)
- **QR PawTag** per pet (printable for a collar tag).
- **Public scan-to-return page** at `#/tag/:petId` — an unauthenticated route
  (`PawTagPage`) anyone can open to privately notify the owner; personal contact details
  are never exposed.
- **Report Lost** broadcasts an alert with last-seen location, note, and optional reward;
  **found-pet reports** surface in the owner's Safety Center.

### 4. 🎁 Paw Points — Gamified Loyalty (`components/rewards/RewardsCenter.tsx`)
Earn points for real care actions (walks, completed reminders, booked/attended
appointments, scans). Live balance + day streak, a **rewards catalog** (redeemable for
real perks), **badges**, a neighbourhood **leaderboard**, and a points ledger. The
sidebar balance card is now live and links here.

### 5. 📅 Unified Booking & Telehealth (`components/booking/BookingCenter.tsx`)
Bridges "find a provider" and "actually book one": browse real availability slots
(in-person **or** video telehealth), book with a pet + reason via a modal, and manage
upcoming/past appointments under **My Appointments**. Booking awards Paw Points.

### Data models added (`types.ts`)
`PetSafetyStatus`, `FoundReport`, `HealthRecord`, `Reminder`, `CarePlan`, `CarePlanTask`,
`PawScanResult`, `AvailabilitySlot`, `Appointment`, `PawPointsEntry`, `PawBadge`,
`Reward`, `LeaderboardEntry`.

### Design-system foundation
- Tailwind migrated from the CDN to a proper **PostCSS build** with design tokens
  (`tailwind.config.js`, `index.css`): primary/secondary/accent + semantic colours,
  the **Fraunces** display font, radius & elevation tokens, and `tailwindcss-animate`.
- Shared **UI primitive library** (`components/ui`), **Framer Motion** page transitions,
  a **mobile bottom navigation** for consumer roles, and a toast system.

---

## 🧱 Tech Stack

- **Framework:** React 19 + TypeScript
- **Build tool:** Vite 6
- **Styling:** Tailwind CSS (PostCSS build + design tokens)
- **Animation:** Framer Motion
- **Charts:** Recharts
- **Icons:** lucide-react
- **QR codes:** qrcode.react
- **AI:** `@google/genai` (Google Gemini)

---

## 📊 Feature Summary

- **6** user roles
- **12** distinct AI-powered capabilities
- **Major modules:** Pet Profiles · Find Care · Marketplace · Community · Messaging · Adoption · Genetics Engine · Walk Tracking · Job Board · Vet Suite · Clinic Operations · Vendor Tools · Admin Console
- **New modules:** PawScan (AI) · Health Hub · PawTag Lost & Found · Paw Points · Unified Booking & Telehealth
