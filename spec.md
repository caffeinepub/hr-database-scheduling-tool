# Specification

## Summary
**Goal:** Build a full HR & Company Dashboard ("Magnum HR Dashboard") with a Black, Red & White colour scheme, role-based access, scheduling, payroll export, stock control, inventory management, and employee engagement features.

**Planned changes:**
- Apply a strict Black, Red & White colour scheme across all UI elements (backgrounds, navigation, buttons, badges, typography)
- Fix the sidebar so it sits beside the main content without overlapping; add a collapse/minimise toggle
- Implement username/password login with a seeded Admin account (username: `Admin`, password: `MagnumSal123`); new users register and await Admin approval before accessing the dashboard
- Add four privilege levels: Team Member, Supervisor, Management, and Admin; Admin can assign roles; Supervisors and Management can manage shifts and approve requests; Team Members see only their own data
- Build a Staff Dashboard (Admin/Management/Supervisor only) with employee profiles storing: name, email, job role, wage, phone number, address, training log, and a manager-only internal notes section hidden from the employee
- Build a Rota & Scheduling section with a Thursday–Wednesday 7-day calendar, day and week views; shifts are fully editable (start/end times, date, location, notes); paid time off, unpaid time off, and sickness can be scheduled on the calendar
- Allow employees to submit paid/unpaid time-off requests from the Employee Portal; requests appear in an approval queue for Supervisors/Management/Admin; include holiday and sickness statistics visible to Supervisors and Management
- Allow employees to set availability (preferred days, days off, preferred hours or open availability) visible to Supervisors and Management when scheduling
- Restrict the Employee Portal shift view to only the logged-in employee's own shifts
- Add a Payroll CSV export (Admin/Management only) with options for current week, 2-week period (Thu–Wed), or custom date range; CSV differentiates worked hours, paid leave, unpaid leave, sickness, and holiday
- Allow training/knowledge records to be assigned to staff profiles; provide a summary view showing which staff can run each experience
- Build an Appraisals section linked to employee profiles; each record stores date completed and notes; next due date defaults to 3 months after the most recent appraisal; overdue/upcoming appraisals are visually highlighted
- Build a Stock Request system with a form (Item, Experience/Building dropdown with 23 options, Quantity, Comment) and a three-column dashboard (Requested, Ordered, Delivered) with drag-and-drop or status-change controls
- Build an Inventory Management section for food & drink stock with a central aggregated list and individual stock views for Bar, FEC Cafe, and Battle Masters; location edits update the central total; each location entry supports an expiry date field
- Build an Employee of the Month section where all employees can submit recommendations (nominee + reason); submissions are Admin-only visible; Admin can select a winner and mark the £50 bonus as awarded
- Add a complete sidebar navigation including: Staff, Scheduling, Stock Control (Stock Requests + Inventory sub-sections), Employee of the Month, and Employee Portal

**User-visible outcome:** Staff can log in with role-appropriate access to a fully themed Black/Red/White HR dashboard featuring employee management, shift scheduling, time-off requests, payroll export, stock control, inventory tracking, appraisals, training records, and an Employee of the Month feature — all within a correctly laid-out sidebar navigation.
