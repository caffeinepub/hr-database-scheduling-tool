# Specification

## Summary
**Goal:** Add a Stock Requests system with a Kanban dashboard, auto-archive functionality, and an archive history page to the Escape Room Hub app.

**Planned changes:**
- Add backend Motoko data structures and methods for stock requests, storing item name, experience/building, quantity, comment, status, timestamps, and submitter name
- Expose backend methods to create requests, update status, query by status, archive delivered requests older than 7 days, and retrieve archived requests
- Create a Stock Requests page with a submission form (item name, experience/building dropdown with 23 locations, quantity, comment)
- Implement a Kanban dashboard with three columns: Requested, Ordered, and Delivered — cards support drag-and-drop and manual status-change controls
- On page load, automatically trigger archiving of any delivered requests older than 7 days
- Create a Stock Request Archive page displaying all archived requests in a table/list with item name, experience/building, quantity, comment, submitted date, and delivered date
- Add React Query hooks for all stock request operations
- Register both new pages as routes in the app router and add Stock Requests to the sidebar navigation

**User-visible outcome:** Users can submit stock requests, manage them through a Kanban board (Requested → Ordered → Delivered), and items delivered more than 7 days ago are automatically archived. A linked archive page shows the full history of delivered requests.
