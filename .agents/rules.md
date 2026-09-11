# Project Development Rules & Guidelines

1. **Rule File Updates**:
   - The agent must frequently and promptly update this rules file (`.agents/rules.md`) whenever requested by the user. If the user asks to add or adjust a rule, add it immediately.

2. **Database Changes via Migrations**:
   - All database schema modifications must strictly be executed through Prisma migrations (`npx prisma migrate dev ...`).
   - Never use direct un-migrated pushes or manual schema alterations.

3. **No LocalStorage**:
   - Never use `localStorage` (or similar browser persistent client storage) to store any kind of information in the application.

4. **Single Source of Truth for Static Data**:
   - Never duplicate static JSON data or hardcoded configuration objects/arrays (such as `POOJA_CATEGORIES` in `src/components/PoojaBookingModal.tsx`) across multiple files in the code.
   - If static JSON/constant configurations are used, maintain a single shared definition in one centralized location across the entire project.

5. **No Agent Testing**:
   - Never perform tests from the agent's end (no running browser testing subagents, test suites, or manual verification loops from the agent). The user will test and verify everything themselves.
