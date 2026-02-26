# Specification

## Summary
**Goal:** Overhaul the UI with a bold red, white, and black colour theme; fix transparent dropdowns; and add a manager-assigned staff badge gamification system to employee profiles.

**Planned changes:**
- Restyle the entire application with a red, white, and black colour scheme — deep/vivid reds as primary accents, black/near-black for sidebar and header backgrounds, white/off-white for content surfaces — applied consistently across all pages, components, buttons, badges, stat cards, tables, and form controls
- Fix all dropdown and select menus to display a fully opaque, solid-colour background (white/off-white on light surfaces, dark on dark surfaces) so they are always readable regardless of what is behind them
- Add `Badge` and `StaffBadge` types to the backend (`main.mo`) with stable HashMaps persisting badge definitions and staff badge assignments
- Seed initial themed badges across categories: Attendance (Perfect Attendance, Early Bird, Reliable Hero), Performance (Five Star Review, Crowd Favourite, Top Performer), Experience (Escape Master, Party Starter, Axe Legend, Laser Commander, Game Show Star), Team (Team Player, Mentorship Badge, Going the Extra Mile), and Milestones (1, 3, 5 Year Anniversary)
- Expose backend methods: `getBadges`, `addBadge`, `getStaffBadges`, `assignBadgeToStaff` (manager/admin only), and `removeBadgeFromStaff` (manager/admin only)
- Add React Query hooks in `useQueries.ts`: `useGetBadges`, `useGetStaffBadges`, `useAssignBadgeToStaff`, and `useRemoveBadgeFromStaff`, with cache invalidation on assign/remove
- Add a Badges tab to the Employee Profile page showing assigned badge cards (emoji, name, description, category chip, assigned date, assigning manager, optional note)
- Show an Assign Badge button (managers/admins only) that opens a modal with all badges grouped by category; allow removal of assigned badges from each badge card

**User-visible outcome:** The app has a vivid red, white, and black escape-room brand feel throughout, dropdowns are fully readable with solid backgrounds, and managers can assign and remove themed gamification badges on employee profiles which staff can view on their profile's Badges tab.
