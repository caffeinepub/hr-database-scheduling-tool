# Specification

## Summary
**Goal:** Fix all popup and overlay components to have fully opaque backgrounds so their content is always legible.

**Planned changes:**
- Ensure all modal dialogs (AddEmployeeModal, EditEmployeeModal, AddShiftModal, ShiftDetailModal, AddTrainingModal, EditTrainingModal, AssignBadgeModal, AddDocumentModal, EditDocumentModal, etc.) have fully opaque backgrounds
- Ensure all dropdown menus, popovers, tooltips, and select option lists have fully opaque backgrounds
- Apply the fix globally (e.g. via CSS or Tailwind utility classes) so all overlays benefit
- Leave backdrop/scrim dimming behavior unchanged

**User-visible outcome:** All popups, modals, and dropdowns display with solid, readable backgrounds and no underlying page content bleeds through them.
