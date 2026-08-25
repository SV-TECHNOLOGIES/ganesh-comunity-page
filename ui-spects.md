# MAHA GANAPATHI — LONDON GANESH MAHOSTAV
### UI / UX & Website Design Requirement Document

**Client:** MITRA UK (Mana Indian Telugu Roots Abroad) — in association with ELE Entertainments, presented by Biryanis and more!
**Event:** The Biggest Maha Ganapathi — London Ganesh Mahostav, Langley, Slough
**Countdown Target:** 14 September 2026 (Ganesh Chaturthi)
**Reference Assets:** Event poster (Maha Ganapathi — Big Ben/Tower Bridge divine composite) + teaser reel (temple sanctum, diyas, bells, sparks, MITRA UK logo bloom)

**Design Brief in one line:** *A single-page devotional "reveal" experience — part temple sanctum, part cinematic movie-launch site — built around a 3D Ganesha, a countdown that feels like a ritual, and a wave of gold light that makes a visitor feel like they just walked into the mandap.*

---

## 1. Creative Direction

### 1.1 Mood
Not a typical "event landing page." This should feel like the opening scene of the teaser video — dark sanctum, floating diyas, gold particles catching light, bells swaying, a hush before something big is revealed. The emotional arc of the site should mirror the poster: **darkness → divine gold light → the veiled idol → anticipation → "Coming Soon."**

Three feelings the UI must deliver, in order:
1. **Awe** — the first 3 seconds should stop the scroll (temple darkness, sparks igniting, bells chiming).
2. **Devotion** — every section should feel respectful, ornate, warm — not "corporate event site."
3. **Excitement** — the countdown, the reveal animation, and the CTA sections should feel like a movie countdown, not a boring timer widget.

### 1.2 Visual Language (from the supplied poster & teaser)
- **Deep maroon-black backgrounds** (`#160B08`, `#0D0705`) as the canvas — like the temple sanctum in the video.
- **Molten gold** as the hero accent (`#D4AF37`, `#F4C542`, gradient into `#FFD87A`) — used for typography, particle effects, borders.
- **Royal red velvet** (`#7A1620`, `#9C1F2E`) echoing the drape covering the idol in the poster — used in banners, ribbons, card backgrounds.
- **MITRA UK brand pink/orange marigold burst** (`#EC1E79`, `#F7941D`) — used sparingly as a secondary accent (sponsor badges, CTA highlights) so the brand mark isn't lost against the maroon/gold palette.
- Ornamentation: mandala line-art, temple arch (gopuram) silhouettes, diya (oil lamp) icons, bell (ghanta) icons, marigold garlands — used as dividers and section frames, never as clutter.
- Photography/3D treatment: smoke/incense wisps, floating spark particles, soft volumetric gold light — consistent with the teaser video's temple interior shot.

### 1.3 What to explicitly avoid
- No generic "corporate event" blues/whites, no flat SaaS-style cards.
- No stock countdown-timer widgets that look like a sale banner.
- No overcrowding — the poster works because of negative space around the idol; the site should breathe the same way.

---

## 2. The Centerpiece: 3D Ganesha Hero

This is the single most important element of the site — everything else is built around it.

### 2.1 Behaviour
- **Load sequence (first visit, ~4–6s, skippable on repeat visits):**
  1. Screen is near-black with faint temple pillar silhouettes (as in the teaser).
  2. A ring of diyas ignites one by one, gold light blooms from the centre (mirrors teaser video's spark-circle moment).
  3. Temple bells chime (subtle sound cue, muted by default with a one-tap "🔔 Enable Sound" toggle — never autoplay audio loudly).
  4. The 3D Ganesha idol fades/rises into view, **veiled in the same red drape as the poster**, slowly rotating.
  5. Gold rays sweep across the screen; MITRA UK's marigold logo blooms in like the teaser's closing shot.
  6. Headline type ("THE BIGGEST MAHA GANAPATHI") assembles letter-by-letter in gold foil style.
- **Idle state:** the 3D idol gently rotates (auto-rotate, ~20s per revolution), with ambient floating particles (gold dust / faint smoke) drifting upward continuously.
- **Interaction:** visitor can drag/swipe to rotate the idol manually (orbit control), pinch/scroll to zoom slightly. On mobile, a subtle "↔ swipe to view" hint fades in/out once.
- **Reveal moment (build-up to Sep 14):** the drape should visually tease an *unveiling* — e.g., the cloth shifts slightly in the breeze/idle animation, hinting the big reveal is the actual 6ft Ganesha unveiling on-site. Do not fully unveil the face pre-launch — this preserves the "Coming Soon" suspense from the brief.
- **After countdown ends:** hero transitions into full unveil animation (drape falls away with light burst) — this state should be built now and simply gated behind the countdown so it's ready to flip live on the day.

### 2.2 Technical Notes
- Recommend **Three.js / React Three Fiber** (or **Spline** for faster iteration) for the 3D model, with a `.glb`/`.gltf` idol asset (sculpted or AI-generated to match the poster's bronze-idol-under-red-velvet look).
- Provide a **static, high-quality fallback** (poster-style hero image with light CSS parallax + particles) for low-power devices / reduced-motion preference — detect via `prefers-reduced-motion` and low-end GPU heuristics.
- Keep the 3D model under a reasonable poly/texture budget so first paint isn't blocked — show the temple-bloom loader (Section 1) while the model streams in.
- All particle/gold-dust effects: lightweight CSS/WebGL particles, not heavy video loops, to protect performance on mobile.

---

## 3. Countdown Section — "The Ritual Clock"

The countdown should not look like an e-commerce sale timer. Concept: **a temple oil-lamp / diya countdown.**

- Four gold diya-shaped or bell-shaped dials for **Days / Hours / Minutes / Seconds**, each sitting inside a carved circular frame (echoing the mandala behind the idol in the poster).
- As seconds tick, a small flame flicker / spark animation pulses inside each dial — subtle, not distracting.
- Above the counter: **"UNTIL THE MAHA GANAPATHI ARRIVES IN LONDON"**; below it, the fixed date **"14th September 2026 · Langley, Slough."**
- Milestone micro-celebrations: when the countdown crosses each 7-day mark, trigger a brief gold-spark burst across the section (rewards repeat visitors for checking back).
- On countdown completion: this section morphs into a **"HE HAS ARRIVED"** banner with venue/live-darshan info (button through to livestream/registration, whatever the client provides at that stage).
- Sticky mini-countdown chip in the header (small, unobtrusive) once the visitor scrolls past the hero — keeps urgency present throughout the whole scroll.

---

## 4. Full Page Structure (Single-Page Scroll Experience)

The site is best delivered as one immersive scrolling page (typical for high-hype event reveals), not a traditional multi-menu corporate site. Suggested order:

1. **Hero — 3D Veiled Ganesha + Sound-on prompt + primary CTA** ("Notify Me" / "Join WhatsApp Group")
2. **Countdown — Ritual Clock** (Section 3)
3. **The Story** — 2–3 line devotional narrative (from the caption): *"From Lalbaugcha Raja to Khairatabad Ganesh… now London's own iconic Ganesha"* — set as large gold serif type over a slow-panning temple/London skyline blend background (Big Ben + Tower Bridge silhouette, matching the poster).
4. **The Idol — Specs Card** — "06 FT (Approx.) · Visually Stunning Bappa" presented as an ornate carved plaque/medallion (directly lifted from the poster's badge styling), plus 2–3 supporting facts (materials, artistry, transportation-to-London story if available).
5. **Event Details** — Date (14 Sep 2026), Venue (Langley, Slough — embed map), theme of the Mahostav, days of celebration if multi-day.
6. **Gallery / Teaser Media** — embed the teaser video (autoplay muted on scroll-into-view, tap to unmute), plus a photo strip if more assets are supplied later (masonry grid with gold-foil hover frame).
7. **Get Involved** — three cards: *Join the WhatsApp Group* (deep-link to the provided invite), *Volunteer*, *Sponsor/Support the Mahostav* — styled as temple donation/offering plaques, not generic buttons.
8. **Brought To You By** — Biryanis and more! + MITRA UK emblem + ELE Entertainments, styled exactly like the poster's bottom band (two "brought to you by / in association with" ribbon labels either side of the central Ganesha emblem seal).
9. **Stay Tuned / Reveal Footer** — restates "Coming Soon," social links (Instagram/Facebook/YouTube for MITRA UK), WhatsApp CTA repeated, newsletter/notify-me email capture.
10. **Footer** — MITRA UK branding, sponsor logos, contact, social icons, small print.

---

## 5. Section-by-Section Feature & Interaction Notes

| Section | Must-have UI Features |
|---|---|
| Hero | 3D rotating veiled Ganesha, particle/gold-dust field, sound toggle, animated gold-foil headline, primary CTA button with pulsing glow, scroll-down cue styled as a hanging temple bell |
| Countdown | 4 animated diya/bell dials (D/H/M/S), milestone spark bursts, sticky mini version on scroll, auto-morph to "Arrived" state at zero |
| Story | Scroll-triggered fade/parallax text reveal, ambient temple-skyline background loop |
| Idol Specs | Ornate medallion/plaque component (reused visual style from poster's "06 FT · BAPPA" badge), subtle shine sweep on hover/in-view |
| Event Details | Embedded map (styled dark to match theme), date/venue as large gold numerals, "Add to Calendar" button |
| Gallery/Video | Muted autoplay-on-view video embed, tap-to-unmute, lightbox for photos, gold-foil frame hover state |
| Get Involved | 3 offering-plaque cards with icons (WhatsApp/diya/marigold), hover lift + glow |
| Sponsors | Ribbon-label layout mirroring the poster exactly (Brought to you by ‹Biryanis› — center seal — In association with ‹ELE Entertainments›) |
| Footer/CTA | Repeated WhatsApp CTA, social icons in gold-line style, "Stay Tuned" scratchy gold script treatment (match poster's "Coming soon" font style) |

---

## 6. Motion & Micro-interaction Principles

- **Everything gold should shimmer, not blink** — use slow shine-sweep gradients (3–6s loops), not flashing.
- **Scroll = ritual pacing.** Sections should fade/rise in like temple curtains parting, not snap in. Stagger text and imagery reveals by ~150–250ms.
- **Sound design (optional, user-controlled):** soft temple bell on load, gentle ambient shehnai/bell loop (very low volume, togglable), tick-chime on countdown digit change (subtle, mutable) — never forced/autoplaying loudly.
- **Cursor/touch feedback:** gold spark trail on hover for buttons/CTAs (desktop), soft haptic-style bounce for tap states on mobile.
- **Reduced-motion mode:** respect OS setting — swap rotating 3D + particles for the static poster art with gentle opacity fades only.

---

## 7. Visual System

### 7.1 Colour Palette
| Role | Colour | Hex |
|---|---|---|
| Background — deepest | Temple black-maroon | `#0D0705` |
| Background — panel | Warm dark maroon | `#160B08` |
| Primary accent | Molten gold | `#D4AF37` |
| Primary accent — bright | Bright gold | `#F4C542` |
| Secondary accent | Royal red velvet | `#7A1620` |
| Brand pop | MITRA pink | `#EC1E79` |
| Brand pop | Marigold orange | `#F7941D` |
| Text — primary | Warm ivory | `#F7EFE1` |
| Text — muted | Soft gold-grey | `#C9B79C` |

### 7.2 Typography
- **Display headline font:** a bold serif/slab with temple-carving character (e.g., Cinzel Decorative, Playfair Display Black, or a custom gold-foil styled face) — used for "MAHA GANAPATHI" style headers.
- **Script/accent font:** a brush script for "Coming soon" / devotional taglines, matching the poster's scratchy gold script.
- **Body font:** a clean, highly legible sans (e.g., Inter, Poppins) for details/dates/venue/forms — keeps long-form content readable against the ornate backdrop.
- All headline type should carry a subtle gold-foil texture/gradient + soft drop shadow, echoing the poster's metallic lettering.

### 7.3 Iconography & Motifs
- Diya (oil lamp), temple bell, mandala circle, marigold garland, gopuram (temple tower) silhouette, Om/Modak motifs used as dividers, bullet markers, and section-frame corners — never as literal deity imagery outside the main 3D hero (to keep the idol as the singular devotional focal point).

---

## 8. Content & Functional Requirements

- **Countdown logic:** server-time-synced countdown to `2026-09-14 00:00 BST`, not client-clock dependent (avoids visitors with wrong device time seeing incorrect countdowns).
- **WhatsApp CTA:** primary, repeated at least twice (hero + footer) — links directly to `https://chat.whatsapp.com/IVqirWWzM96IBNRfhSWGEd`.
- **Notify Me / Email capture:** simple form (name + email or phone) to alert people when the full reveal/registration goes live — store submissions for later event-registration follow-up.
- **Social share:** built-in share buttons so the "reveal hype" spreads (WhatsApp, Instagram, Facebook, X) — pre-filled share text using the campaign caption tone ("London, are you ready? 🕉️").
- **SEO/meta/OG image:** use the supplied poster as the Open Graph share image so WhatsApp/social links preview beautifully.
- **Mobile-first:** majority of this community audience will discover and share this via WhatsApp on mobile — every animation/interaction must be tuned and tested mobile-first, not desktop-first.
- **Fast first paint:** critical hero text + poster-fallback image must render immediately; 3D model and particle systems can lazy-load in afterward.
- **Analytics:** track WhatsApp click-throughs, notify-me signups, and scroll-depth per section (to gauge which section holds attention, useful for the client's next campaign).

---

## 9. Accessibility & Performance Guardrails

- Respect `prefers-reduced-motion`; provide static hero fallback.
- Ensure gold-on-maroon text passes at least WCAG AA contrast for body copy (headline/display type can be more decorative/lower-contrast as long as body/CTA text stays accessible).
- Sound is opt-in only, never autoplay with audio.
- Provide alt text for all imagery/video (describing the idol, event, and branding contextually).
- Target Largest Contentful Paint under ~2.5s on 4G even with the 3D hero, via progressive loading (poster image → 3D model streaming in).

---

## 10. Suggested Tech Approach

| Layer | Recommendation |
|---|---|
| Framework | Next.js (React) — static generation with the countdown/notify-me as light dynamic pieces |
| 3D/Animation | React Three Fiber + drei (orbit controls, particles) or Spline embed for faster asset iteration |
| Motion/scroll | Framer Motion + a scroll library (e.g., GSAP ScrollTrigger) for the "ritual pacing" reveal effects |
| Styling | Tailwind CSS with a custom gold/maroon design-token theme matching Section 7 |
| Forms/data | Lightweight serverless form handler (e.g., for Notify Me capture) feeding into an email list / sheet for the client's team |
| Hosting | Vercel/Netlify — CDN-served, fast global delivery for a UK + diaspora audience |

---

## 11. Open Questions for the Client

- Will the actual venue address/full schedule (multiple days, aarti timings, food stalls, cultural programme) be shared before the countdown ends, to populate Section 4 ("Event Details")?
- Is there a registration/RSVP or ticketing requirement, or is this purely a public darshan (walk-in) event?
- Should the "reveal" on Sep 14 unlock a livestream embed for those who can't attend in person?
- Do you want the 3D idol modeled to closely resemble the actual 6ft murti being installed, or is a stylised/generic idol (as in the poster) acceptable for this teaser phase?
- Any additional sponsor/association logos expected before launch, beyond Biryanis and more! and ELE Entertainments?