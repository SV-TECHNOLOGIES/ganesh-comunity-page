# Walkthrough: Database Config Table & Preferences Architecture

We migrated the hero and event template configurations into a dedicated PostgreSQL database table (`Config`) managed via Prisma Migrate, created typed preference constant variables, built dedicated preference endpoints, and integrated them across the application.

---

## 1. Database Migration & Schema

### `Config` Model in `prisma/schema.prisma`
```prisma
model Config {
  id         String   @id @default(cuid())
  configKey  String   @unique // Format: "global:${preference}" or "${eventId}:${preference}"
  prefix     String   // e.g. "home", "featuredEvent", "event"
  preference String   // e.g. "home.activeHomeEventId", "event.hero.heroType"
  value      String   @db.Text
  dataType   String   @default("string") // "string" | "boolean" | "number" | "json"
  eventId    String?
  event      Event?   @relation(fields: [eventId], references: [id], onDelete: Cascade)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([prefix])
  @@index([eventId])
  @@index([preference])
}
```

- **Migration**: [20260914181000_add_config_table](file:///Users/venkey/Documents/svr/UKTA/prisma/migrations/20260914181000_add_config_table/migration.sql)
- Successfully deployed via `npx prisma migrate deploy` and client generated via `npx prisma generate`.

---

## 2. Preference Constants Registry

All preferences and prefixes are declared as constant variables in:
[src/constants/preferences.ts](file:///Users/venkey/Documents/svr/UKTA/src/constants/preferences.ts)

### Prefixes
- `PREFERENCE_PREFIX.HOME`: `'home'`
- `PREFERENCE_PREFIX.FEATURED_EVENT`: `'featuredEvent'`
- `PREFERENCE_PREFIX.EVENT`: `'event'`

### Key Constants
- `PREF_HOME_ACTIVE_EVENT_ID`: `'home.activeHomeEventId'`
- `PREF_FEATURED_HERO_TYPE`: `'featuredEvent.hero.heroType'`
- `PREF_FEATURED_HERO_VARIANT`: `'featuredEvent.hero.heroVariant'`
- `PREF_EVENT_HERO_TYPE`: `'event.hero.heroType'`
- `PREF_EVENT_HERO_VARIANT`: `'event.hero.heroVariant'`
- `PREF_EVENT_MODEL_URL`: `'event.hero.modelUrl'`
- `PREF_EVENT_MODEL_SCALE`: `'event.hero.modelScale'`
- `PREF_EVENT_PROCEDURAL_FALLBACK`: `'event.hero.proceduralFallback'`
- `PREF_EVENT_SHOW_PARTICLES`: `'event.hero.showParticles'`
- `PREF_EVENT_SHOW_CORNER_MOTIFS`: `'event.hero.showCornerMotifs'`
- `PREF_EVENT_SHOW_RADIAL_AURA`: `'event.hero.showRadialAura'`
- `PREF_EVENT_BANNER_IMAGE_URL`: `'event.hero.bannerImageUrl'`
- `PREF_EVENT_VIDEO_URL`: `'event.hero.videoUrl'`
- `PREFERENCES` map grouping all preferences hierarchically.
- `FIELD_DATA_TYPES` defining data types (`string`, `boolean`, `number`, `json`) for automatic serialisation and type conversion.
- `buildConfigKey(preference, eventId)` helper to ensure deterministic keys for upserts.

---

## 3. Preferences Service

Created [src/lib/config-preferences.ts](file:///Users/venkey/Documents/svr/UKTA/src/lib/config-preferences.ts):
- `getPreferencesForEvent(eventId)`: Fetches and auto-casts all preference rows for a given event, reconstructing the full typed `EventTemplateConfig` and `EventHeroConfig`.
- `getFeaturedEventPreferences()`: Looks up `home.activeHomeEventId`, queries the featured event's preferences + global overlays, and returns the merged config.
- `saveEventPreferences(eventId, config)`: Atomically upserts all fields into the `Config` table.
- `setActiveHomeEventId(eventId)`: Sets which event is currently featured on the home page.
- `setPreference(preference, value, eventId?, dataType?)`: General upsert utility.
- `seedConfigFromHeroJson()`: Automatically seeds all configurations from `event-hero-config.json` into the `Config` table.

---

## 4. API Endpoints

### Dedicated Preferences API: `/api/config/preferences`
- **GET `?eventId=<id>`**: Fetches all preferences for a specific event.
  ```bash
  curl -s "http://localhost:3000/api/config/preferences?eventId=evt-ganesh-chaturthi"
  ```
- **GET `?featured=true`**: Fetches all preferences for the currently featured event.
  ```bash
  curl -s "http://localhost:3000/api/config/preferences?featured=true"
  ```
- **POST `/api/config/preferences`**:
  - Set active home event: `{ "action": "setActiveHomeEvent", "eventId": "evt-business-summit-2027" }`
  - Update single preference: `{ "preference": "event.hero.tagline", "value": "...", "eventId": "evt-diwali-2026" }`
  - Save entire event: `{ "eventId": "...", "config": { ... } }`

### Updated Existing Endpoints:
- [src/app/api/events/hero-config/route.ts](file:///Users/venkey/Documents/svr/UKTA/src/app/api/events/hero-config/route.ts): Now reads directly from the database `Config` table via `getPreferencesForEvent` and `getFeaturedEventPreferences`.
- [src/app/api/admin/event-hero-config/route.ts](file:///Users/venkey/Documents/svr/UKTA/src/app/api/admin/event-hero-config/route.ts): Saves directly to the `Config` table with a backup write to the JSON file.

---

## 5. UI Integration

- [src/app/page.tsx](file:///Users/venkey/Documents/svr/UKTA/src/app/page.tsx): Updated to fetch the featured event from `/api/config/preferences?featured=true`.
- [src/components/EventLandingTemplate.tsx](file:///Users/venkey/Documents/svr/UKTA/src/components/EventLandingTemplate.tsx): Updated to load event configuration from `/api/config/preferences?eventId=...`.

---

## 6. Verification Results

| Test Item | Command / URL | Result |
| :--- | :--- | :--- |
| **Prisma Migration** | `npx prisma migrate deploy` | 12 migrations applied, schema up to date |
| **Database Seed** | `npx tsx scripts/seed-preferences.ts` | 134 records seeded across 6 events + home active event |
| **TypeScript Compilation** | `npx tsc --noEmit` | Exit code 0, clean build |
| **Featured Preferences API** | `GET /api/config/preferences?featured=true` | HTTP 200, returns active event and parsed preferences |
| **Event Preferences API** | `GET /api/config/preferences?eventId=evt-diwali-2026` | HTTP 200, returns image-editorial preferences |
| **Film Carnival API** | `GET /api/config/preferences?eventId=evt-film-carnival-2027` | HTTP 200, returns video-cinema preferences |
| **Mutation API** | `POST /api/config/preferences` | Atomically upserts `configKey`, changes persist immediately |
| **Page Rendering** | `http://localhost:3000/` & `/events/*` | HTTP 200 OK across all routes |
