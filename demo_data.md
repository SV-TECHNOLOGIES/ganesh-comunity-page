Listed directory UKTA
Listed directory src
Listed directory data
Listed directory config
Viewed schema.prisma:1-200
Searched for "@/data"
Searched for "from ['\"].*data"
Listed directory app
Listed directory components
Viewed charity.ts:1-44
Viewed events.ts:1-21
Viewed leadership.ts:1-7
Viewed media.ts:1-44
Viewed members.ts:1-41
Viewed news.ts:1-33
Viewed settings.ts:1-17
Viewed sponsors.ts:1-160
Searched for "prisma."
Viewed page.tsx:1-153
Listed directory admin
Viewed page.tsx:1-800
Viewed page.tsx:1-293
Viewed page.tsx:1-201
Viewed page.tsx:1-39
Viewed page.tsx:1-221
Viewed route.ts:1-102
Viewed route.ts:1-80
Viewed route.ts:1-39
Viewed route.ts:1-72
Viewed route.ts:1-16
Viewed route.ts:1-56
Viewed page.tsx:1-197
Viewed page.tsx:1-284
Viewed page.tsx:1-72
Viewed page.tsx:1-58
Viewed page.tsx:1-174
Viewed page.tsx:1-177
Viewed SponsorRibbonBand.tsx:1-59
Viewed page.tsx:1-140
Viewed page.tsx:1-104
Viewed page.tsx:1-131
Viewed page.tsx:1-416
Viewed page.tsx:1-37
Viewed OfferingPlaques.tsx:1-208
Viewed MitraCommunitySection.tsx:1-126
Viewed MediaTeaserSection.tsx:1-155
Viewed page.tsx:1-117
Viewed page.tsx:1-467
Viewed page.tsx:1-800
Viewed page.tsx:1-36
Viewed page.tsx:1-85
Viewed page.tsx:1-116
Viewed page.tsx:1-66
Viewed page.tsx:1-74
Viewed page.tsx:1-195
Viewed EventDetailsSection.tsx:1-230
Viewed IdolSpecsCard.tsx:1-108
Viewed Header.tsx:1-452
Viewed Footer.tsx:1-121
Viewed PoojaBookingModal.tsx:1-800
Viewed CharityTicketModal.tsx:1-210

Here is the comprehensive audit of all files and locations across your codebase where **demo data, mock arrays, static fallbacks, or placeholder content** are used instead of real data from the database.

---

### 1. Static Mock / Demo Data Source Files (`src/data/`)

These files contain hardcoded sample data exported across the app:

| File | Content / Demo Details | Database Model Equivalent |
| :--- | :--- | :--- |
| [`src/data/events.ts`](file:///Users/venkey/Documents/svr/UKTA/src/data/events.ts) | `EVENTS_DATA` array containing demo event records (e.g. `evt-ganesh-chaturthi`). | `Event` model in Prisma |
| [`src/data/members.ts`](file:///Users/venkey/Documents/svr/UKTA/src/data/members.ts) | `INITIAL_MEMBERS` array with 3 mock members (`Mahesh Babu G`, `Priyanka Reddy`, `Venkatesh Naidu`). | `Member` model in Prisma |
| [`src/data/charity.ts`](file:///Users/venkey/Documents/svr/UKTA/src/data/charity.ts) | `INITIAL_CHARITY_CASES` with 3 dummy support tickets (`MITRA-HELP-1092`, `MITRA-HELP-1093`, etc.). | `CharityCase` model in Prisma |
| [`src/data/news.ts`](file:///Users/venkey/Documents/svr/UKTA/src/data/news.ts) | `NEWS_DATA` with 2 dummy press releases (`mitra-announces-ugadi-fest-2026`, `guinness-world-record-recognition`). | `BlogPost` model in Prisma |
| [`src/data/media.ts`](file:///Users/venkey/Documents/svr/UKTA/src/data/media.ts) | `MEDIA_DATA` with 4 mock albums/magazines with Unsplash image URLs and dummy YouTube IDs. | `MediaItem` model in Prisma |
| [`src/data/sponsors.ts`](file:///Users/venkey/Documents/svr/UKTA/src/data/sponsors.ts) | `SPONSORS_DATA` with 13 hardcoded sponsor objects and placeholder website URLs (`#`). | `Sponsor` model in Prisma |
| [`src/data/settings.ts`](file:///Users/venkey/Documents/svr/UKTA/src/data/settings.ts) | `SITE_SETTINGS` with default placeholder contact info and dummy Google Analytics ID (`G-MITRA2026SEO`). | Dynamic settings / `.env` |

---

### 2. Admin Portal Pages

| File | Demo / Hardcoded Data Details |
| :--- | :--- |
| [`src/app/admin/dashboard/page.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/app/admin/dashboard/page.tsx) | • Hardcoded `donationsTotal: 750`<br>• Hardcoded `analyticsCount: 12`<br>• Hardcoded `recentLogs` array (4 mock log items)<br>• Initial state initialized from `INITIAL_MEMBERS`, `EVENTS_DATA`, `INITIAL_CHARITY_CASES` |
| [`src/app/admin/media/page.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/app/admin/media/page.tsx) | • Directly binds to static `MEDIA_DATA` with no DB fetching or CRUD API connection |
| [`src/app/admin/seo-analytics/page.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/app/admin/seo-analytics/page.tsx) | • Hardcoded `events` array with 4 mock client tracking events<br>• Hardcoded Lighthouse score badge (`SCORE: 100/100`) |
| [`src/app/admin/payments/page.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/app/admin/payments/page.tsx) | • Default fallback settings contain `pk_test_mitra_default_key` and `sk_test_mitra_default_key` |
| [`src/app/admin/events/page.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/app/admin/events/page.tsx) | • Initial state pre-loaded with `EVENTS_DATA` |
| [`src/app/admin/members/page.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/app/admin/members/page.tsx) | • Initial state pre-loaded with `INITIAL_MEMBERS` |
| [`src/app/admin/charity-cases/page.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/app/admin/charity-cases/page.tsx) | • Initial state pre-loaded with `INITIAL_CHARITY_CASES` |

---

### 3. Public Frontend Pages

| File | Demo / Hardcoded Data Details |
| :--- | :--- |
| [`src/app/news/page.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/app/news/page.tsx) | • Renders `NEWS_DATA` from `src/data/news.ts` directly instead of querying Prisma `BlogPost` or an API |
| [`src/app/news/[slug]/page.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/app/news/%5Bslug%5D/page.tsx) | • Finds article by slug inside static `NEWS_DATA` instead of querying the DB |
| [`src/app/media/page.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/app/media/page.tsx) | • Hardcoded array of 6 Unsplash photo gallery items<br>• Hardcoded video gallery items<br>• PDF magazines filtered directly from static `MEDIA_DATA` |
| [`src/app/sponsors/page.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/app/sponsors/page.tsx) | • Renders `SPONSORS_DATA` directly without calling `/api/sponsors` |
| [`src/app/search/page.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/app/search/page.tsx) | • Fallback and initial search states use `EVENTS_DATA` and `NEWS_DATA` |
| [`src/app/events/page.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/app/events/page.tsx) | • Initial state populated with `EVENTS_DATA` |
| [`src/app/events/[id]/page.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/app/events/%5Bid%5D/page.tsx) | • Initial state populated with `EVENTS_DATA` and fallback RSVP count `1420` |
| [`src/app/chairman-message/page.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/app/chairman-message/page.tsx) | • Hardcoded text and placeholder Unsplash chairman portrait URL |
| [`src/app/history/page.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/app/history/page.tsx) | • Hardcoded static `timeline` array (2012–2025 milestones) |

---

### 4. Components & Modals

| File | Demo / Hardcoded Data Details |
| :--- | :--- |
| [`src/components/SponsorRibbonBand.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/components/SponsorRibbonBand.tsx) | • Reads directly from static `SPONSORS_DATA` |
| [`src/components/MediaTeaserSection.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/components/MediaTeaserSection.tsx) | • Hardcoded `galleryImages` array (local mock poster assets) |
| [`src/components/CharityTicketModal.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/components/CharityTicketModal.tsx) | • Generates synthetic ticket ID (`MITRA-HELP-${Math.floor(...)}`) on the client side |

---

### 5. API Routes with Static Fallbacks

These API routes fall back to static demo data in `catch` blocks or if the DB returns 0 rows:

| File | Fallback Behavior |
| :--- | :--- |
| [`src/app/api/events/route.ts`](file:///Users/venkey/Documents/svr/UKTA/src/app/api/events/route.ts) | Returns `EVENTS_DATA` if database query fails |
| [`src/app/api/sponsors/route.ts`](file:///Users/venkey/Documents/svr/UKTA/src/app/api/sponsors/route.ts) | Returns `SPONSORS_DATA` if DB is empty or fails |
| [`src/app/api/admin/events/route.ts`](file:///Users/venkey/Documents/svr/UKTA/src/app/api/admin/events/route.ts) | Returns `EVENTS_DATA` on error; creates in-memory fallback ID |
| [`src/app/api/admin/members/route.ts`](file:///Users/venkey/Documents/svr/UKTA/src/app/api/admin/members/route.ts) | Returns `INITIAL_MEMBERS` on error |
| [`src/app/api/admin/charity-cases/route.ts`](file:///Users/venkey/Documents/svr/UKTA/src/app/api/admin/charity-cases/route.ts) | Returns `INITIAL_CHARITY_CASES` on error |
| [`src/app/api/admin/sponsors/route.ts`](file:///Users/venkey/Documents/svr/UKTA/src/app/api/admin/sponsors/route.ts) | Returns `SPONSORS_DATA` on error |

---

## 📋 Migration Checklist

Use this checklist to track replacing demo data with real DB queries:

- [ ] **1. News / Blog System (`BlogPost` Model)**
  - [ ] Create `/api/news` (GET) and `/api/news/[slug]` (GET) API routes connected to `prisma.blogPost`
  - [ ] Connect [`src/app/news/page.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/app/news/page.tsx) to fetch live blog posts
  - [ ] Connect [`src/app/news/[slug]/page.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/app/news/%5Bslug%5D/page.tsx) to query the post by slug from the DB
  - [ ] Build admin CRUD interface for news articles

- [ ] **2. Media & Galleries (`MediaItem` Model)**
  - [ ] Create `/api/media` (GET/POST/DELETE) connected to `prisma.mediaItem`
  - [ ] Update [`src/app/media/page.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/app/media/page.tsx) to fetch photos, videos, and Patrika PDFs dynamically
  - [ ] Update [`src/app/admin/media/page.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/app/admin/media/page.tsx) to support real media uploads and DB management

- [ ] **3. Sponsors & Partners (`Sponsor` Model)**
  - [ ] Update [`src/app/sponsors/page.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/app/sponsors/page.tsx) to fetch sponsors from `/api/sponsors`
  - [ ] Update [`src/components/SponsorRibbonBand.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/components/SponsorRibbonBand.tsx) to consume live sponsors

- [ ] **4. Admin Dashboard Metrics**
  - [ ] Replace hardcoded `donationsTotal: 750` in [`src/app/admin/dashboard/page.tsx`](file:///Users/venkey/Documents/svr/UKTA/src/app/admin/dashboard/page.tsx) with a real DB aggregation (`prisma.payment.aggregate({ _sum: { amount: true } })`)
  - [ ] Replace hardcoded `recentLogs` with real audit/activity logs from the database

- [ ] **5. Fallback & Initial State Cleanup**
  - [ ] Set initial state in pages ([`admin/events`](file:///Users/venkey/Documents/svr/UKTA/src/app/admin/events/page.tsx), [`admin/members`](file:///Users/venkey/Documents/svr/UKTA/src/app/admin/members/page.tsx), [`admin/charity-cases`](file:///Users/venkey/Documents/svr/UKTA/src/app/admin/charity-cases/page.tsx)) to empty arrays (`[]`) and show loading skeletons while loading from DB