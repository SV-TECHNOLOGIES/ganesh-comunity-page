# UKTA Website Rebuild
### Business & Product Requirement Document (BRD/PRD)

**Prepared for:** UK Telugu Association (UKTA)
**Reference site:** https://www.ukta.org.uk/
**Document Version:** 1.0
**Date:** 24 August 2026

---

## 1. Document Control

| Field | Detail |
|---|---|
| Project Name | UKTA Website Redesign & Rebuild with Admin Panel (CMS) |
| Current Site | https://www.ukta.org.uk/ (WordPress + Elementor) |
| Document Owner | Project Sponsor / UKTA IT Secretary |
| Prepared By | [Development Agency / Team Name] |
| Status | Draft v1.0 — for stakeholder review |
| Purpose | Define scope, sitemap, features and admin panel requirements for rebuilding the UKTA website with a refined UI and self-service content management system |

---

## 2. Project Overview & Objectives

The UK Telugu Association (UKTA) is a non-profit, non-religious organisation serving the Telugu-speaking community across the UK. The current website (built on WordPress/Elementor) is content-heavy, image-driven, and maintained manually by IT volunteers. This project aims to rebuild the website with a modern, refined, mobile-first UI, and introduce a dedicated Admin Panel so that non-technical committee members can independently manage content, events, membership, media and enquiries without developer involvement.

### 2.1 Goals

- Deliver a clean, modern, mobile-responsive public website that reflects UKTA's brand and community identity.
- Replace ad-hoc WordPress page editing with a purpose-built Admin Panel tailored to UKTA's actual workflows (events, membership, gallery, sponsors, charity requests).
- Improve site structure/navigation (reduce redundant menu items, fix broken/placeholder links such as Twitter and LinkedIn).
- Enable online membership sign-up, event registration and donations with proper record-keeping (currently routed to external tinyurl / third-party forms).
- Improve performance, SEO, and accessibility over the current Elementor-based build.
- Provide role-based access so different committee members (Media Secretary, IT Secretary, Membership Officer, etc.) can manage only their relevant sections.

### 2.2 In Scope

- Public-facing website (all sections listed in the sitemap below).
- Admin Panel / CMS for managing all dynamic content.
- Migration of existing content (text, images, videos, past event galleries) from the current site.
- Basic integrations: payment/donation gateway, email notifications, social media links, YouTube embeds.

### 2.3 Out of Scope (unless separately agreed)

- Native mobile apps (iOS/Android).
- Multi-language translation (site currently English + occasional Telugu script in images only).
- Complex CRM/accounting integration beyond basic membership & donation records.

---

## 3. Current Site Audit (As-Is)

Summary of the existing site structure and features, used as the baseline for the rebuild.

### 3.1 As-Is Sitemap & Features

| Section / Page | URL Path | Existing Features / Content |
|---|---|---|
| Home | `/` | Hero banner/slider of event photos, About UKTA summary, Guinness World Record feature, Video highlights (Yadagirigutta Swamy & TTD Srinivasa Kalyanam tour), Photo gallery preview, Message from 10 Downing Street, Upcoming events (external tinyurl links), Committee member preview grid, Sponsor logo strip |
| Home > Welcome to UKTA | `/welcome-to-ukta/` | About/mission long-form content |
| Home > Chairman Message | `/president-message/` | Static message page |
| Home > Prominent Message | `/prominent-message/` | Static message page |
| Home > History | `/history/` | Organisation history |
| Home > Governing Documents | `/governing-documents/` | Downloadable constitution/policy docs |
| Leadership > Founders | `/founders/` | Founder profiles |
| Leadership > Patrons | `/patrons/` | Patron profiles |
| Leadership > Trustees | `/trustees/` | Trustee profiles |
| Leadership > Executive Committee | `/executive-committee/` | Committee member grid with photos & designations |
| Leadership > Nari Shakthi | `/nari-shakthi/` | Women's wing profile page |
| Media > Photo Gallery | `/photo-gallery/` | Albums of past events |
| Media > Video Gallery | `/video-gallery/` | Embedded YouTube videos |
| Media > Press Releases > Print Media | `/print-media/` | Newspaper/press clippings |
| Media > Press Releases > Videos | `/videos/` | Press video clips |
| Media > UKTA Patrika | `/ukta-patrika/` | Newsletter/magazine archive |
| Media > UKTA Souvenir | `/ukta-souvenir/` | Souvenir publication archive |
| Media > UKTA YouTube Channel | `/ukta-youtube-channel/` | Link/embed to channel |
| Events > UKTA Events | `/ukta-events/` | General events listing |
| Events > Business Networking | `/business-nerworking/` | Business event listing (note: URL typo "nerworking") |
| Events > Cultural Events | `/cultural-events/` | Cultural event listing |
| Events > Sports | `/sports/` | Sports event listing |
| Events > Women Empowerment | `/women-empowerment/` | Women empowerment event listing |
| Events > World Conferences (4 sub-pages) | various | Archive pages for past world conferences (2012, 2014, 2016, 2019 Guinness Record, 2022 TTD Kalyanam) |
| Charity Services > Student Counselling | `/student-counselling/` | Service info + contact |
| Charity Services > Repatriation | `/reparitation/` | Service info (note: URL typo "reparitation") |
| Charity Services > Women Helpline | `/women-helpline/` | Helpline info |
| Charity Services > Request For Help | `/request-for-help/` | Help request form |
| Charity Services > Community Service | `/community-service/` | Service info |
| Charity Services > UKTA Awards | `/ukta-awards/` | Awards info |
| Membership > Life Membership | `/life-membership/` | Membership info + sign-up |
| Membership > Event Registration | `/event-registration/` | Event sign-up form |
| Membership > Volunteer | `/volunteer/` | Volunteer sign-up form |
| Membership > Business Enquiry | `/business-enquiry/` | Business enquiry form |
| Sponsors | `/sponsors/` | Grid of sponsor logos (some linked, some static) |
| Contact Us | `/contact-us/` | Contact form + address (Chiswick Park, London) |

### 3.2 Observed Issues / Improvement Opportunities

- Duplicate navigation menu markup on load (accessibility/SEO concern) — to be resolved with clean component-based nav.
- Broken/placeholder social links (Twitter and LinkedIn point to `#`).
- Inconsistent URL slugs with typos (e.g., `reparitation`, `business-nerworking`).
- Event registration relies on external tinyurl.com links rather than native, trackable forms.
- No visible online donation/payment flow despite a "Donate Now" footer link.
- No admin/self-service panel — content changes require direct WordPress/Elementor access.
- Heavy unoptimised images affecting page load speed.
- No structured events calendar with dates/venues/RSVP counts — events are listed as static links/photos.
- No membership database — member sign-ups are not centrally tracked or searchable.

---

## 4. Proposed Sitemap (To-Be — Public Website)

Refined information architecture — consolidates redundant menus, fixes naming/URL issues, and adds functional depth (search, filters, structured events, member portal).

```
01. Home
    - Hero (rotating banner: current campaign / featured event)
    - About UKTA snapshot + CTA to full About page
    - Featured achievement (e.g., Guinness World Record spotlight)
    - Upcoming Events strip (live from Events module, with 'Register' buttons)
    - Latest News / Press strip
    - Photo/Video highlight carousel
    - Committee snapshot + CTA
    - Sponsors strip
    - Newsletter signup + Donate CTA

02. About
    - Our Mission & Vision
    - History & Timeline
    - Chairman's Message
    - Prominent Message
    - Governing Documents (downloadable PDFs)
    - FAQs

03. Leadership
    - Founders
    - Patrons
    - Trustees
    - Executive Committee (with search/filter by role)
    - Nari Shakthi (Women's Wing)

04. Events (dynamic, calendar + list + filter views)
    - All Events (filter: Upcoming / Past, Category, Location)
    - Cultural Events
    - Business Networking
    - Sports
    - Women Empowerment
    - World Conferences (archive, chronological)
    - Event Detail Page (date, venue, map, description, gallery, register/RSVP button, ticket info if any)

05. Media & Press
    - Photo Gallery (album/category structure, lightbox, lazy-load)
    - Video Gallery (YouTube embed grid, filter by event/year)
    - Press Releases (Print Media, Video clips)
    - UKTA Patrika (newsletter archive, PDF viewer/download)
    - UKTA Souvenir (archive, PDF viewer/download)
    - UKTA YouTube Channel (embed + subscribe CTA)

06. Charity & Community Services
    - Student Counselling
    - Repatriation Support
    - Women's Helpline
    - Community Service Programmes
    - UKTA Awards (nomination form + past winners)
    - Request for Help (structured form -> admin case queue)

07. Membership
    - Membership Plans (Life Membership, tiers if any) + online payment
    - My Membership (member login: view status, renewal, download card/certificate)
    - Event Registration (linked to Events module)
    - Volunteer Sign-up
    - Business Enquiry

08. Sponsors & Partners
    - Sponsor tiers (Platinum/Gold/Silver, if applicable)
    - Sponsor directory with logos + links
    - 'Become a Sponsor' enquiry form

09. Donate
    - Donation form (one-time / recurring) with secure payment gateway
    - Transparency: how funds are used

10. News / Blog (new)
    - Announcements, community news, press mentions

11. Contact Us
    - Contact form (routed to correct department/committee via admin routing rules)
    - Address, map embed, social links (corrected)

12. Legal / Utility
    - Privacy Policy
    - Terms of Use
    - Cookie Policy
    - Sitemap (XML + HTML)

13. Search (global site search, header-accessible)
```

---

## 5. Public Website — Feature Requirements by Module

| Module | Key Features (rebuilt/refined) |
|---|---|
| Home | Dynamic hero slider, live upcoming-events feed, news feed, photo/video carousel, sponsor strip, newsletter capture, donate CTA — all editable from Admin without code changes |
| About | Rich-text managed pages, downloadable governing documents (versioned), timeline component for History |
| Leadership | Searchable/filterable member directory, profile cards (photo, name, designation, bio, social link), grouped by category (Founders/Patrons/Trustees/Exec Committee/Nari Shakthi) |
| Events | Structured event objects (title, category, date/time, venue, map, description, banner image, gallery, registration form, capacity/RSVP count, status: upcoming/past), calendar view + list view, filters, ICS "add to calendar" export |
| Media & Press | Album-based photo gallery with lightbox and lazy-loading, video grid with YouTube embed, press clipping viewer, PDF-based newsletter/souvenir archive with cover-thumbnail + download/view |
| Charity Services | Per-service info pages, structured "Request for Help" form that creates a case ticket in Admin, awards nomination workflow |
| Membership | Online membership application + payment, auto-generated digital membership card/number, member login portal (view/renew status), volunteer and business enquiry forms routed to Admin |
| Sponsors | Tiered sponsor directory, sponsor enquiry form |
| Donate | One-time/recurring donation form via payment gateway (Stripe/PayPal/GoCardless), auto email receipt |
| News/Blog | Categorised posts, tags, search, related posts, social share buttons |
| Contact | Smart contact form with department routing, Google Map embed, corrected/working social icons |
| Global | Site-wide search, responsive mobile-first design, multi-image lazy loading, SEO meta management, cookie consent, accessibility (WCAG 2.1 AA) compliant components |

---

## 6. Admin Panel — Requirements

The Admin Panel is the core new capability requested. It should let authorised UKTA committee members manage all dynamic content and submissions from a single dashboard, without developer involvement, replacing direct WordPress/Elementor editing.

### 6.1 Admin Panel — Module List & Capabilities

| Admin Module | Capabilities |
|---|---|
| Dashboard | At-a-glance stats: total members, upcoming events, pending help requests, new enquiries, recent donations, site traffic snapshot |
| Content / Pages Manager | Create/edit/delete static pages (About, History, Chairman Message, etc.) with a rich-text/block editor; SEO fields (title, meta description, slug); draft/publish/schedule workflow; version history |
| Events Manager | CRUD for events: title, category, date/time, venue + map pin, description, banner & gallery images, registration form builder, capacity limits, RSVP/attendee list export (CSV), send reminder emails, mark event as past/archived |
| Media Library | Central upload/storage for images, videos (or YouTube links), and PDFs; organise into albums/categories; bulk upload; auto image compression/resizing; used across all modules (no duplicate uploads) |
| Leadership / Committee Manager | Add/edit/remove leadership profiles (Founders, Patrons, Trustees, Exec Committee, Nari Shakthi), reorder display order, mark active/past terms |
| Membership Manager | View/search member database, approve/reject applications, track payment/renewal status, export member list (CSV), send bulk email/SMS to members, generate digital membership cards |
| Charity / Case Manager | Queue of "Request for Help" submissions with status tracking (New/In Progress/Resolved), internal notes, assign to committee member, confidential handling for sensitive cases (e.g., Women Helpline) |
| Volunteer & Business Enquiry Manager | List of volunteer sign-ups and business enquiries with status tracking and response logging |
| Sponsors Manager | CRUD for sponsor logos, tiers, links; sponsor enquiry lead list |
| Donations Manager | View donation transactions (via payment gateway webhook/API), export for accounting, issue/download receipts |
| News/Press Manager | CRUD for news posts, press releases, print media clippings (image/PDF upload), categorise and tag |
| Newsletter / Patrika Manager | Upload new newsletter/souvenir issues (PDF + cover image), manage archive list and download counts |
| Forms & Submissions | Central inbox for all form submissions site-wide (Contact Us, Event Registration, Volunteer, Business Enquiry, Request for Help) with export and email-forwarding rules |
| Users & Roles (RBAC) | Create admin users, assign roles/permissions per module, activity/audit log of who changed what and when |
| Site Settings | Global settings: site logo, contact details, social links, footer content, SEO defaults, homepage widget ordering, maintenance mode |
| Analytics / Reports | Basic traffic overview (or Google Analytics embed), form conversion stats, membership growth chart, donation totals over time |

### 6.2 Roles & Permissions (RBAC)

| Role | Typical Access |
|---|---|
| Super Admin | Full access to all modules including Users & Roles, Site Settings, Donations |
| Content Editor (Media/PR Secretary) | Pages, Media Library, News/Press, Newsletter modules |
| Events Coordinator | Events Manager, Media Library (event photos), RSVP export |
| Membership Officer | Membership Manager, Volunteer & Business Enquiry Manager |
| Charity/Welfare Officer | Charity/Case Manager only (restricted, confidential data) |
| Committee Viewer | Read-only dashboard + reports access |

### 6.3 Admin Panel — Non-Functional Notes

- Secure authentication (email/password + optional 2FA) separate from public site accounts.
- Full audit trail: log of create/update/delete actions per user.
- Responsive admin UI usable from tablet/mobile (committee members are largely volunteers using personal devices).
- Role-based visibility — users only see modules relevant to their role.
- Data export (CSV/PDF) available for members, event RSVPs, donations, and case logs.

---

## 7. Functional Requirements Traceability

| ID | Requirement | Related Admin Module(s) |
|---|---|---|
| FR-01 | Public user can browse all site sections without login | Home, About, Leadership, Events, Media, Charity, Sponsors, Contact |
| FR-02 | Public user can register/apply for Life Membership online with payment | Membership Manager, Donations Manager |
| FR-03 | Public user can register for a specific event and receive confirmation email | Events Manager, Forms & Submissions |
| FR-04 | Public user can submit a "Request for Help" form privately | Charity / Case Manager |
| FR-05 | Public user can submit Volunteer / Business Enquiry forms | Volunteer & Business Enquiry Manager |
| FR-06 | Public user can make a one-time or recurring donation | Donations Manager |
| FR-07 | Public user can view/download newsletters (Patrika) and souvenirs as PDFs | Newsletter / Patrika Manager |
| FR-08 | Public user can browse photo/video galleries filtered by event/year | Media Library |
| FR-09 | Admin can create/edit/publish any static or dynamic page content without code | Content / Pages Manager |
| FR-10 | Admin can create an event and it automatically appears on Home + Events pages until its date passes | Events Manager |
| FR-11 | Admin can manage committee/leadership listings and control display order | Leadership / Committee Manager |
| FR-12 | Admin can view and export a searchable member database | Membership Manager |
| FR-13 | Admin can track and resolve charity/help-request cases with status and notes | Charity / Case Manager |
| FR-14 | Admin can manage sponsor logos/tiers shown on the public Sponsors page | Sponsors Manager |
| FR-15 | Super Admin can create additional admin users and assign specific role permissions | Users & Roles (RBAC) |
| FR-16 | System sends automated email notifications for form submissions, event registration confirmations, and payment receipts | Forms & Submissions, Donations Manager |

---

## 8. Non-Functional Requirements

### 8.1 Performance
- Page load under 2.5s on 4G for key pages (Home, Events).
- Images auto-optimised/compressed on upload via Media Library.

### 8.2 Responsiveness & Accessibility
- Fully responsive across mobile, tablet, and desktop breakpoints.
- WCAG 2.1 AA compliance target (colour contrast, alt text, keyboard navigation).

### 8.3 Security
- HTTPS everywhere; secure payment gateway (PCI-DSS compliant, e.g., Stripe).
- Admin authentication with password policy + optional 2FA; role-based access control.
- Regular automated backups of database and media.
- GDPR-compliant handling of member and charity-case personal data (esp. Women Helpline / Request for Help submissions).

### 8.4 SEO & Analytics
- Clean URL slugs (fix current typos), editable meta titles/descriptions per page.
- XML sitemap auto-generated; Google Analytics / Search Console integration.

### 8.5 Maintainability
- Component-based front end for reuse (event cards, profile cards, galleries).
- Content changes (text, images, events, members) must be editable by non-technical admins with no code deployment required.

---

## 9. Suggested Technology Approach (for discussion)

| Layer | Option A (Headless/Custom) | Option B (CMS-based) |
|---|---|---|
| Frontend | Next.js / React + Tailwind CSS | WordPress theme (block editor) with custom templates |
| Backend/Admin | Custom Admin Panel (Node.js/Express or Django) with role-based auth | WordPress Admin + custom plugin for Events/Membership/Cases |
| Database | PostgreSQL / MySQL | MySQL (native to WordPress) |
| Media Storage | Cloud storage (S3/Cloudinary) with CDN | WordPress Media Library + CDN plugin |
| Payments | Stripe / GoCardless / PayPal | Stripe / PayPal WooCommerce or plugin |
| Hosting | Vercel/Netlify (frontend) + managed DB/host (backend) | Managed WordPress hosting (e.g., WP Engine, SiteGround) |
| Best for | Full custom UI/UX, best performance, tailored admin workflows | Faster build, lower cost, easier for volunteer IT admins already familiar with WordPress |

**Recommendation:** given UKTA is volunteer-run and content changes are frequent (events, galleries), a hybrid approach — modern custom-designed frontend with either a headless CMS (e.g., WordPress as headless API, or Strapi) or an extended WordPress admin with custom plugins for Events/Membership/Charity Cases — offers the best balance of refined UI and manageable long-term maintenance.

---

## 10. Content Migration & Rollout Plan

### 10.1 Content to Migrate
- All existing static page content (About, History, Messages, Governing Documents).
- Leadership profiles and photos (Founders, Patrons, Trustees, Exec Committee, Nari Shakthi).
- Photo & video galleries (organise into albums/events during migration).
- Press releases, Patrika and Souvenir PDF archives.
- Sponsor logos and tiers.
- Past event archive (World Conferences, Guinness Record, cultural events).

### 10.2 Suggested Phases
1. Discovery & content audit (confirm this document, finalise sitemap).
2. UI/UX design (wireframes -> visual design system -> stakeholder sign-off).
3. Admin Panel build (Events, Membership, Charity Cases, Media, Users/Roles first — highest value).
4. Public site build against Admin Panel APIs/content.
5. Content migration & QA.
6. UAT with committee members (each role tests their module).
7. Go-live + DNS cutover + monitoring.
8. Post-launch support & training (admin panel user guide/videos for volunteers).

---

## 11. Assumptions & Open Questions

### 11.1 Assumptions
- UKTA will provide access to existing WordPress export and media files for migration.
- A payment gateway account (Stripe/PayPal/GoCardless) will be set up by UKTA for donations/membership fees.
- Committee will nominate at least one Super Admin and module owners for each admin role.

### 11.2 Open Questions for Stakeholders
- Are membership fees tiered (e.g., Life Membership vs Annual), and what is the exact fee structure?
- Should the member portal allow members to update their own profile/contact details?
- Is a multi-language (English/Telugu) requirement needed now or in a future phase?
- Should "Request for Help" and "Women Helpline" submissions have extra confidentiality/data-retention rules?
- Preferred hosting/budget constraints — does this favour Option A (custom) or Option B (WordPress-based) from Section 9?