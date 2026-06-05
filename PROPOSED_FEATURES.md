# PawPortal — Proposed Features

> A product + engineering proposal for the next wave of PawPortal features, designed to lift **engagement, retention, and monetisation** while reusing existing platform patterns (`geminiService`, role-based `DashboardLayout`, `SuperAdminDashboard` structure, `PetProfileManager`, `ChatWidget`).

Each feature below is scoped to integrate cleanly with the current routing (`App.tsx` view-state + `DashboardLayout` `Tab` enum) and role model (`UserRole`).

---

## Feature 1 — PawTag: Lost & Found + Scan-to-Return

**Goal.** Turn every pet profile into a safety net. A QR/microchip-linked public page lets anyone who finds a lost pet contact the owner instantly, and a one-tap "Lost Pet" broadcast rallies the local community. This is the most emotionally resonant, viral, and shareable feature PawPortal can ship — and ~80% of its data model already exists (`Pet.microchip`, `Pet.isPublic`, `PostType = 'ALERT'`, the `Connection` graph).

**Roles that benefit.**
- **Owner** — primary: peace of mind, fast recovery.
- **Caregiver** — can report/scan a found pet on a walk.
- **Vet / Clinic** — scan a microchip tag at intake to pull the owner + medical alerts.
- **Super Admin** — moderation of public pages and alert abuse; recovery analytics.

**Technical outline.**
- **Components**
  - `components/safety/PawTagPage.tsx` — public, unauthenticated profile view (gated by `Pet.isPublic`): photo, name, "I found this pet" CTA, medical alerts, masked owner contact via in-app relay.
  - `components/safety/LostPetModal.tsx` — owner flow to flip a pet to "Lost," set last-seen geo + radius, auto-post to Community.
  - `components/safety/FoundReportModal.tsx` — finder flow (works logged-out).
  - `components/safety/LostFoundFeed.tsx` — a filtered Community view of active alerts on a map + list.
- **Routing.** Add a public route branch in `App.tsx` (`ViewState` gains `'pawtag'`) keyed off a tag id in the URL, bypassing auth like the existing `admin-login` branch. Add `Tab.SAFETY` to the Owner/Caregiver nav in `DashboardLayout`.
- **State.** New `SafetyContext` (mirrors how cart/auth state is held) exposing `lostPets`, `reportFound()`, `markLost()`, `resolve()`. Reuse the existing `Post`/`Connection` stores for the broadcast.
- **Data models** (extend `types.ts`):
  ```ts
  export interface PetSafetyStatus {
    petId: string;
    state: 'SAFE' | 'LOST' | 'FOUND_PENDING';
    lastSeen?: GeoPoint;        // already defined
    radiusKm?: number;
    note?: string;
    updatedAt: string;
  }
  export interface FoundReport {
    id: string;
    petId?: string;            // resolved if scanned via tag
    finderContact: string;
    location: GeoPoint;
    photo?: string;
    timestamp: string;
  }
  ```
- **API endpoints** (when the backend lands): `GET /pawtag/:tagId` (public), `POST /pets/:id/lost`, `POST /found-reports`, `POST /pawtag/:tagId/contact` (relayed message). Until then, back it with the existing mock stores.

**UX flow.**
1. Owner opens a pet → **Generate PawTag** → gets a QR code (printable for a collar tag) linked to the public page.
2. If the pet goes missing: **Report Lost** → drops a map pin + radius → auto-broadcasts an `ALERT` post to nearby community members.
3. A finder scans the tag (or opens the public page) → sees the pet + "Contact owner" → sends a relayed message and optional location; owner is notified in real time via `ChatWidget`.
4. Owner taps **Mark as Found** → alert resolves, a celebratory toast fires, and a "reunited" story can be shared.

**Effort & dependencies.** **Medium.** No new AI. Needs a QR generator (`qrcode.react`), a lightweight map (Leaflet/Mapbox — already justified by `WalkSession` GPS), and a public unauthenticated route. Geolocation permission handling required.

---

## Feature 2 — Pet Health Hub: Timeline, Smart Reminders & AI Care Plans

**Goal.** Convert PawPortal from a "find-a-service" app into the **system of record for a pet's health** — the single highest driver of daily/weekly retention. The landing page already advertises "Vaccination with Dr. Sarah," but there is no real timeline or reminder engine behind it. This closes that gap and creates recurring touchpoints (reminders → bookings → marketplace refills).

**Roles that benefit.**
- **Owner** — primary: never miss a vaccine, med dose, or checkup.
- **Vet / Clinic** — visits and prescriptions written here populate the owner's timeline automatically; reduces no-shows.
- **Vendor** — refill reminders deep-link to marketplace re-orders (monetisation).

**Technical outline.**
- **Components**
  - `components/health/HealthTimeline.tsx` — vertical timeline of events (vaccine, med, visit, weight) per pet.
  - `components/health/ReminderCenter.tsx` — upcoming + overdue cards with snooze/complete.
  - `components/health/CarePlanCard.tsx` — renders an AI-generated preventive-care plan.
  - Surface a "Health" tab in the Owner dashboard and an "Upcoming Care" widget on the Owner `Dashboard` overview.
- **State.** `HealthContext` holding `records[]`, `reminders[]`, derived `overdue`/`upcoming`. Reuse `Pet.history` / `Pet.vitals` as the seed.
- **AI (new `geminiService` functions, same async/typed pattern as `analyzeSymptom`):**
  ```ts
  export const generateCarePlan = async (
    pet: Pet, history: HealthRecord[]
  ): Promise<{ summary: string; tasks: { title: string; dueInDays: number; category: string }[] }>
  ```
  Prompt seeded with breed, age, weight, neuter status, and existing records → returns a structured, scheduled preventive plan (vaccines due, dental, weight goals).
- **Data models:**
  ```ts
  export type HealthEventType = 'VACCINE' | 'MEDICATION' | 'VISIT' | 'WEIGHT' | 'NOTE';
  export interface HealthRecord {
    id: string; petId: string; type: HealthEventType;
    title: string; date: string; notes?: string;
    vetId?: string; attachmentUrl?: string;
  }
  export interface Reminder {
    id: string; petId: string; title: string;
    dueDate: string; recurrence?: 'NONE'|'MONTHLY'|'YEARLY';
    relatedProductId?: string;   // for marketplace refill deep-link
    done: boolean;
  }
  ```
- **API.** `GET/POST /pets/:id/health-records`, `GET/POST/PATCH /pets/:id/reminders`. Web Push / email reminders later via the existing **API Integrations** module in `SuperAdminDashboard` (it already models `PUSH`/`EMAIL` triggers).

**UX flow.**
1. Owner opens a pet → **Health** tab → sees a timeline + "Next up" reminders.
2. Taps **Generate Care Plan** → Gemini returns a scheduled plan → owner accepts → tasks become reminders.
3. A reminder fires ("Heartworm med due in 3 days") → tap **Reorder** (marketplace) or **Book vet** (Feature 3).
4. After a vet visit, the vet's notes auto-append to the timeline.

**Effort & dependencies.** **Medium.** Reuses `geminiService` and `SuperAdminDashboard` integration triggers. Real push notifications depend on the backend; in-app reminders work immediately against mock state.

---

## Feature 3 — Unified Booking & Telehealth

**Goal.** Today owners can *find* providers (`FindCare`/`ServiceFinder`) and providers can *manage* a schedule (`ScheduleManager`), but the two halves never connect. Bridging them into real-time booking — plus a **video telehealth** front door fed by the existing AI symptom checker — captures transactions on-platform and creates a clear monetisation point (booking fees, paid consults).

**Roles that benefit.**
- **Owner** — book vets, groomers, sitters, and instant telehealth.
- **Vet / Clinic / Caregiver** — fill open slots, reduce no-shows, get paid.
- **Super Admin** — booking/commission analytics.

**Technical outline.**
- **Components**
  - `components/booking/AvailabilityCalendar.tsx` — reads provider availability from `ScheduleManager`'s data.
  - `components/booking/BookingModal.tsx` — pick pet + service + slot + pay.
  - `components/booking/MyAppointments.tsx` — owner-side upcoming/past.
  - `components/booking/TelehealthRoom.tsx` — video consult shell (WebRTC/Daily/Twilio), with an AI triage summary panel.
- **Routing/State.** Add `Tab.APPOINTMENTS` (owner) and surface "Open slots / Requests" in vet & caregiver dashboards. `BookingContext` for `slots`, `appointments`, `book()`, `cancel()`.
- **AI reuse.** The "talk to a vet now" path runs the existing `analyzeSymptom` first; at consult end, reuse `generateDischargeSummary` to draft the visit note.
- **Data models:**
  ```ts
  export interface AvailabilitySlot {
    id: string; providerId: string; start: string; end: string;
    serviceType: ServiceType; isBooked: boolean;
  }
  export interface Appointment {
    id: string; petId: string; providerId: string; slotId: string;
    mode: 'IN_PERSON' | 'TELEHEALTH';
    status: 'REQUESTED'|'CONFIRMED'|'COMPLETED'|'CANCELLED';
    priceCents: number;
  }
  ```
- **API.** `GET /providers/:id/availability`, `POST /appointments`, `PATCH /appointments/:id`, `POST /telehealth/token`.

**UX flow.**
1. From a provider profile, owner taps **Book** → calendar → pick slot + pet → pay → confirmation lands in `MyAppointments` and the provider's `ScheduleManager`.
2. Telehealth: from the AI symptom checker, an urgent result shows **Talk to a vet now** → joins a video room → after the call, an AI-drafted summary is saved to the Health Hub timeline (Feature 2).

**Effort & dependencies.** **Large.** Real-time video and payments are the heavy parts (Daily/Twilio + Stripe). Booking-without-video is a **Medium** first slice and ships independently.

---

## Feature 4 — Paw Points: Gamified Wellness & Loyalty

**Goal.** Drive habitual engagement and marketplace spend with a rewards loop. Real care actions you already track — **GPS walks (`WalkSession`)**, completed reminders, attended appointments — earn points that unlock real marketplace discounts. Adds streaks, badges, and neighbourhood leaderboards on top of the existing social graph.

**Roles that benefit.**
- **Owner** — primary: fun, habit formation, discounts.
- **Caregiver** — earns reputation/points for completed walks & jobs.
- **Vendor** — sponsors reward redemptions (paid placement / discount funding).
- **Super Admin** — configure earning rules & reward catalog (new tab in the console).

**Technical outline.**
- **Components**
  - `components/rewards/PawPointsWidget.tsx` — balance + streak, placed in the header (next to `ChatWidget`).
  - `components/rewards/BadgesGrid.tsx`, `components/rewards/Leaderboard.tsx` (geo-scoped via the `Connection` graph + walk geo).
  - `components/rewards/RewardsCatalog.tsx` — redeem points for marketplace discounts.
  - Admin: a `Rewards` section in `SuperAdminDashboard` (mirrors the existing tab pattern) to set earning rules.
- **State.** `RewardsContext` with `balance`, `streak`, `badges`, `earn(event)`, `redeem(reward)`. Earning is event-driven: emit on walk completion, reminder done, appointment attended.
- **Data models:**
  ```ts
  export interface PawPointsLedgerEntry {
    id: string; userId: string; delta: number;
    reason: 'WALK'|'REMINDER'|'APPOINTMENT'|'REDEEM'|'REFERRAL';
    timestamp: string;
  }
  export interface Badge { id: string; name: string; icon: string; earnedAt?: string; }
  export interface Reward { id: string; title: string; costPoints: number; vendorId?: string; }
  ```
- **API.** `GET /rewards/ledger`, `POST /rewards/earn`, `POST /rewards/redeem`, `GET /leaderboard?geo=`.

**UX flow.** Finish a GPS walk → "+50 Paw Points, 5-day streak 🔥" toast → climb the local leaderboard → redeem points for a discount at checkout in the Marketplace.

**Effort & dependencies.** **Medium.** Pure event wiring + UI; no AI required. Depends on `WalkSession` completion events and Marketplace checkout for redemption.

---

## ⭐ Bonus — AI-First: PawScan (Visual Health Scan)

**Goal.** A genuinely new use of Gemini: **multimodal image analysis**. The current AI is all text. Let owners photograph a concern — a skin rash, cloudy eye, limp (short clip), or even a food label — and get an instant, structured triage with an urgency level and a one-tap handoff to booking. This is the most demo-able, differentiated AI feature on the roadmap and it reinforces Features 2 and 3.

**Roles that benefit.** **Owner** (primary). **Vet** (receives the photo + AI pre-assessment attached to a telehealth/booking request, speeding triage).

**Technical outline.**
- **Component.** `components/ai/PawScan.tsx` — camera/upload, preview, streamed result card; reachable from the `PetAssistant` and the Health Hub.
- **AI (new `geminiService` function, multimodal — the only structural change vs. existing text calls):**
  ```ts
  export const scanPetPhoto = async (
    imageBase64: string, mimeType: string, pet: Pet, concern: string
  ): Promise<{
    urgency: 'LOW' | 'MEDIUM' | 'HIGH';
    observations: string[];
    possibleCauses: string[];
    recommendation: string;       // e.g. "Book a vet within 24h"
    disclaimer: string;
  }>
  ```
  Uses Gemini's vision input (`{ inlineData: { data, mimeType } }` part alongside the text prompt) — same `GoogleGenAI` client already configured in `geminiService.ts`, just with an image part and a JSON-shaped response, mirroring how `analyzeSymptom` returns a typed object.
- **Data model.** Persist results as a `HealthRecord` of type `'NOTE'` with `attachmentUrl` (ties into Feature 2). No new top-level model required.
- **Safety.** Always returns a non-diagnostic disclaimer and routes HIGH urgency straight to **Book / Telehealth** (Feature 3).

**UX flow.** Owner taps **PawScan** → snaps/uploads a photo → adds one line of context → streamed result with urgency badge → if MEDIUM/HIGH, a **Book a vet** button appears and attaches the photo + AI notes to the request.

**Effort & dependencies.** **Medium.** Reuses the existing Gemini client; the new work is the multimodal request shape, image capture/compression, and the result UI. Pairs naturally with Features 2 & 3.

---

## Prioritisation Summary

| # | Feature | Primary win | Effort | Reuses |
|---|---------|-------------|--------|--------|
| 1 | PawTag (Lost & Found) | Virality / acquisition | Medium | `microchip`, `isPublic`, `PostType.ALERT`, public route |
| 2 | Pet Health Hub | Retention (daily/weekly) | Medium | `geminiService`, `Pet.history`, integration triggers |
| 3 | Unified Booking & Telehealth | Monetisation (transactions) | Large* | `ScheduleManager`, `FindCare`, `analyzeSymptom` |
| 4 | Paw Points | Engagement / habit + spend | Medium | `WalkSession`, Marketplace, social graph |
| ⭐ | PawScan (AI vision) | Differentiation / demo | Medium | `geminiService` (new multimodal call) |

\* Booking-only first slice is Medium; video + payments make the full feature Large.

**Recommended build order:** **2 → ⭐ → 1 → 4 → 3.** Health Hub creates the retention spine, PawScan plugs into it as the standout AI moment, PawTag drives acquisition, Paw Points compounds engagement, and Booking/Telehealth monetises the audience the others have built.
