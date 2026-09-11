***# Elite Homes — Hostel/PG Management System***



***## 1. Project Overview***



***Build a modern, production-quality, responsive \*\*Hostel/PG Management Website\*\* for a PG named \*\*"Elite Homes"\*\*.***



***The purpose of this application is to replace the traditional notebook-based management system currently used by the PG owner.***



***The system should allow the administrator to manage:***



***\* Residents***

***\* Rooms***

***\* Beds***

***\* Floor allocation***

***\* Joining dates***

***\* Monthly rent***

***\* Rent due dates***

***\* Payment history***

***\* Payment receipts***

***\* Complaints***

***\* Complaint/ticket status***

***\* Room occupancy***

***\* Available beds***

***\* Resident records***

***\* Notifications***



***There should be two primary user experiences:***



***1. \*\*Resident Portal\*\* — residents can access only their own information using their unique Resident ID.***

***2. \*\*Admin Portal\*\* — the PG owner can securely log in and manage the entire PG.***



***The website must have a \*\*premium, modern SaaS-style interface\*\*, dark mode, responsive design, smooth animations, and a polished liquid/glass visual aesthetic.***



***---***



***# 2. PG Information***



***## PG Name***



***\*\*Elite Homes\*\****



***## Building Structure***



***The PG has the following floors:***



***### Ground Floor***



***Rooms:***



***\* G1***

***\* G2***



***Both rooms are:***



***\* 6-sharing***

***\* Capacity: 6 people***

***\* Monthly rent: ₹5,000 per person***



***### First Floor — A***



***Rooms:***



***\* A1***

***\* A2***

***\* A3***

***\* A4***

***\* A5***

***\* A6***

***\* A7***

***\* A8***

***\* A9***

***\* A10***

***\* A11***

***\* A12***



***### Second Floor — B***



***Rooms:***



***\* B1–B12***



***### Third Floor — C***



***Rooms:***



***\* C1–C12***



***### Fourth Floor — D***



***Rooms:***



***\* D1–D12***



***### Fifth Floor — E***



***Rooms:***



***\* E1–E12***



***For floors \*\*A–E\*\*, each floor follows this room-capacity distribution:***



***\* 3 rooms → 5-sharing***

***\* 3 rooms → 4-sharing***

***\* 2 rooms → 2-sharing***

***\* 4 rooms → 3-sharing***



***Therefore, each A–E floor has:***



***\* 3 × 5 beds = 15***

***\* 3 × 4 beds = 12***

***\* 2 × 2 beds = 4***

***\* 4 × 3 beds = 12***



***Total:***



***\*\*55 beds per floor\*\****



***Across five floors:***



***\*\*275 beds\*\****



***Ground floor:***



***\*\*12 beds\*\****



***Total PG capacity:***



***\*\*287 beds\*\****



***The system should store room capacity in the database rather than hard-coding it into the frontend.***



***---***



***# 3. Rent Structure***



***Monthly rent is based on sharing capacity.***



***| Sharing   | Monthly Rent |***

***| --------- | -----------: |***

***| 6 Sharing |       ₹5,000 |***

***| 5 Sharing |       ₹5,500 |***

***| 4 Sharing |       ₹6,000 |***

***| 3 Sharing |       ₹6,500 |***

***| 2 Sharing |       ₹7,000 |***

***| 1 Sharing |       ₹7,500 |***



***The rent should automatically be determined from the resident's room/sharing type.***



***The admin should be able to see the rent associated with every resident.***



***Avoid allowing residents to modify rent information.***



***---***



***# 4. User Roles***



***There should be two roles.***



***## Admin***



***The admin has complete access to the management system.***



***Admin can:***



***\* Log in***

***\* Add residents***

***\* Edit residents***

***\* Remove/deactivate residents***

***\* Assign rooms***

***\* Assign beds***

***\* View all residents***

***\* View all rooms***

***\* View all floors***

***\* View occupancy***

***\* View available beds***

***\* Record payments***

***\* View payment history***

***\* Generate/download receipts***

***\* View complaints***

***\* Update complaint status***

***\* Receive notifications***

***\* Search residents***

***\* Filter residents***

***\* View dashboard statistics***



***## Resident***



***Residents must have extremely limited access.***



***A resident can:***



***\* Log in using their unique Resident ID***

***\* View their own profile***

***\* View their own room***

***\* View their own floor***

***\* View their own bed***

***\* View their joining date***

***\* View their monthly rent***

***\* View their current due date***

***\* View their payment history***

***\* Filter their payment history***

***\* Download individual payment receipts***

***\* File a complaint***

***\* View their complaint/ticket***

***\* Track complaint status***



***A resident must NEVER be able to:***



***\* View another resident***

***\* View another resident's payment history***

***\* View room occupancy for the entire PG***

***\* Access admin dashboard***

***\* Modify their own room***

***\* Modify rent***

***\* Modify joining date***

***\* Modify payment records***

***\* Access another person's Resident ID information***



***Implement proper authorization on the backend, not merely frontend route hiding.***



***---***



***# 5. Admin Authentication***



***Create a secure Admin Login page.***



***Admin credentials will initially be configured by the owner.***



***The admin should log in using:***



***\* Username***

***\* Password***



***Do NOT store passwords in plaintext.***



***Use secure password hashing.***



***Admin session/authentication should be maintained securely.***



***Protect all admin API endpoints.***



***Unauthenticated users must not be able to access admin pages or APIs.***



***Include:***



***\* Login***

***\* Logout***

***\* Session/token handling***

***\* Authentication middleware***

***\* Protected admin routes***



***Optionally include:***



***\* Change password***

***\* Forgot password/recovery mechanism***

***\* Session expiration***



***---***



***# 6. Resident Authentication***



***Residents should not need a complicated username/password system.***



***Each resident receives a unique:***



***\*\*Resident ID\*\****



***Example:***



***```text***

***EH-A07-R001***

***```***



***or another clean unique format.***



***The Resident ID must be automatically generated by the system.***



***The ID should be unique across the entire PG.***



***Do not depend only on a person's name or phone number because names and phone numbers can change.***



***The Resident ID should remain permanently associated with the resident record.***



***---***



***# 7. Resident ID Generation***



***When the admin creates a resident, automatically generate a unique Resident ID.***



***The ID should contain useful information where practical, such as:***



***\* PG prefix***

***\* Floor***

***\* Room***

***\* Unique sequence***



***Example:***



***```text***

***EH-A07-001***

***EH-B03-002***

***EH-G01-003***

***EH-E12-004***

***```***



***The ID should never collide with another resident.***



***If a resident leaves and another person occupies the same room later, the new resident must receive a new unique ID.***



***Do not reuse old Resident IDs.***



***---***



***# 8. Admin Dashboard***



***Create a premium admin dashboard.***



***At the top display important statistics.***



***Example:***



***```text***

***Total Residents***

***287***



***Occupied Beds***

***245***



***Available Beds***

***42***



***Occupancy Rate***

***85.37%***



***Rent Due Today***

***8***



***Overdue Payments***

***12***



***Open Complaints***

***5***

***```***



***Use attractive cards with icons and subtle animations.***



***Dashboard should include:***



***### Occupancy Overview***



***Show:***



***\* Total beds***

***\* Occupied beds***

***\* Available beds***

***\* Occupancy percentage***



***### Floor Overview***



***Show each floor:***



***```text***

***Ground***

***12 / 12 occupied***



***A***

***51 / 55 occupied***



***B***

***49 / 55 occupied***



***C***

***48 / 55 occupied***



***D***

***50 / 55 occupied***



***E***

***35 / 55 occupied***

***```***



***Use visual indicators.***



***### Rent Overview***



***Display:***



***\* Paid***

***\* Pending***

***\* Due today***

***\* Overdue***

***\* Due soon***



***### Complaint Overview***



***Display:***



***\* New***

***\* In Progress***

***\* Resolved***

***\* Closed***



***---***



***# 9. Room Management***



***Create a dedicated Room Management section.***



***Admin should be able to view rooms by floor.***



***Example:***



***```text***

***GROUND FLOOR***



***G1***

***6 Sharing***

***5 / 6 Occupied***

***1 Bed Available***



***G2***

***6 Sharing***

***6 / 6 Occupied***

***Full***

***```***



***For floor A:***



***```text***

***A1   5 Sharing   4/5***

***A2   5 Sharing   5/5***

***A3   5 Sharing   3/5***



***A4   4 Sharing   4/4***

***A5   4 Sharing   2/4***

***...***

***```***



***Use visual room cards.***



***Room status:***



***\* Available***

***\* Partially Occupied***

***\* Full***



***Each room should show:***



***\* Room number***

***\* Floor***

***\* Sharing capacity***

***\* Occupied beds***

***\* Available beds***

***\* Rent***

***\* Resident list***



***---***



***# 10. Bed Management***



***Each room should have individual bed slots.***



***Example:***



***```text***

***Room A7***



***Capacity: 4***



***Bed 1 — Rahul Kumar***

***Bed 2 — Aman Singh***

***Bed 3 — Available***

***Bed 4 — Rohit Sharma***

***```***



***Admin should be able to assign a resident to an available bed.***



***The system must prevent:***



***\* Assigning two residents to the same bed***

***\* Exceeding room capacity***

***\* Assigning a resident to an occupied room without an available bed***



***When a resident leaves, their bed automatically becomes available.***



***---***



***# 11. Add Resident***



***Create a clean form for adding a resident.***



***Fields:***



***### Personal Information***



***\* Full Name***

***\* Phone Number***



***### Accommodation***



***\* Floor***

***\* Room***

***\* Bed***



***The room dropdown should dynamically show only appropriate rooms.***



***For example:***



***```text***

***Select Floor***

***\[ A ]***



***Select Room***

***\[ A1 ]***

***\[ A2 ]***

***\[ A3 ]***

***...***

***```***



***After selecting a room:***



***```text***

***Room A3***

***5 Sharing***

***₹5,500/month***



***Available Beds:***

***Bed 2***

***Bed 4***

***```***



***Then allow the admin to select the available bed.***



***### Stay Information***



***\* Joining Date***

***\* Monthly Rent***



***Monthly rent should automatically populate according to sharing type.***



***The admin should be able to confirm the information before saving.***



***---***



***# 12. Joining Date***



***The admin must enter the exact date the resident joined the PG.***



***Example:***



***```text***

***Joining Date:***

***01 September 2026***

***```***



***Store dates properly in the database.***



***Do not store dates as formatted display strings.***



***---***



***# 13. Due Date Logic***



***The resident's monthly rent cycle begins from their joining date.***



***Example:***



***Joining date:***



***\*\*1 September 2026\*\****



***One-month validity:***



***\*\*1 September → 30 September\*\****



***Next payment due:***



***\*\*1 October 2026\*\****



***The UI can describe this as:***



***```text***

***Current Stay:***

***01 Sep 2026 – 30 Sep 2026***



***Next Due Date:***

***01 Oct 2026***

***```***



***For someone joining on:***



***\*\*15 September 2026\*\****



***The first monthly cycle should be:***



***\*\*15 September → 14 October\*\****



***Next due date:***



***\*\*15 October\*\****



***Therefore, the due date should be calculated based on the resident's billing anniversary, not simply "last day of the calendar month."***



***Handle different month lengths correctly.***



***For example:***



***\* Joining on January 31***

***\* February has fewer days***



***Implement robust date handling.***



***---***



***# 14. Resident Home Page***



***Create a public landing page for residents.***



***The main purpose is to allow a resident to access their information.***



***Hero section:***



***```text***

***Welcome to Elite Homes***



***Manage your stay, payments and complaints***

***in one place.***



***\[ Enter Resident ID ]***



***\[ View My Details ]***

***```***



***Resident enters:***



***```text***

***EH-A07-001***

***```***



***After successful authentication, show only that resident's dashboard.***



***---***



***# 15. Resident Dashboard***



***Display:***



***```text***

***Welcome, Rahul 👋***



***Room***

***A7***



***Bed***

***2***



***Floor***

***1st Floor***



***Sharing***

***4 Sharing***



***Monthly Rent***

***₹6,000***



***Next Due Date***

***15 September 2026***

***```***



***Also display:***



***### Stay Information***



***\* Resident name***

***\* Phone number***

***\* Joining date***

***\* Room***

***\* Bed***

***\* Floor***

***\* Sharing***

***\* Monthly rent***



***### Payment Summary***



***```text***

***Last Payment***

***₹6,000***



***Paid On***

***15 Aug 2026***



***Next Due***

***15 Sep 2026***

***```***



***---***



***# 16. Payment History***



***Create a payment history page for residents.***



***Example:***



***```text***

***Payment History***



***Filter:***

***\[ All ] \[ Paid ] \[ Pending ]***



***Month:***

***\[ January ▼ ]***



***--------------------------------***

***15 Aug 2026***

***₹6,000***

***Monthly Rent***

***Paid ✅***



***\[ Download Receipt ]***

***--------------------------------***



***15 Jul 2026***

***₹6,000***

***Monthly Rent***

***Paid ✅***



***\[ Download Receipt ]***

***--------------------------------***

***```***



***Residents can only see their own transactions.***



***---***



***# 17. Payment Database***



***Each payment should store:***



***\* Payment ID***

***\* Resident ID***

***\* Resident name***

***\* Amount***

***\* Payment date***

***\* Billing period***

***\* Payment method***

***\* Status***

***\* Transaction/reference number***

***\* Created timestamp***



***Payment status:***



***\* Paid***

***\* Pending***

***\* Overdue***

***\* Cancelled***



***---***



***# 18. Admin Payment Management***



***Admin should have a complete payment management page.***



***Admin can:***



***\* Search resident***

***\* View payment history***

***\* Record payment***

***\* Edit payment if authorized***

***\* Mark payment as paid***

***\* See pending payments***

***\* See overdue payments***

***\* Filter by month***

***\* Filter by floor***

***\* Filter by room***

***\* Filter by payment status***



***Example:***



***```text***

***Rent Management***



***Search: \[ Rahul ]***



***Floor: \[ All ▼ ]***



***Status: \[ Overdue ▼ ]***



***Month: \[ September ▼ ]***

***```***



***---***



***# 19. Payment Receipt***



***Every successful payment should have a downloadable receipt.***



***Receipt should look like a professional modern invoice/receipt.***



***Header:***



***```text***

***ELITE HOMES***

***Hostel \& PG Accommodation***



***PAYMENT RECEIPT***

***```***



***Resident details:***



***```text***

***Resident Name: Rahul Kumar***

***Phone: 9876543210***

***Resident ID: EH-A07-001***



***Room: A7***

***Bed: 2***

***Sharing: 4***

***Joining Date: 15 June 2026***

***```***



***Payment details:***



***```text***

***Payment Date: 15 August 2026***

***Billing Period: 15 Aug – 14 Sep 2026***



***Monthly Rent: ₹6,000***

***Amount Paid: ₹6,000***



***Payment Status: PAID***

***```***



***Include:***



***\* Receipt number***

***\* Payment date***

***\* PG name***

***\* Resident information***

***\* Payment information***

***\* Amount***

***\* Professional footer***

***\* Optional signature area***



***The receipt must have a polished modern design.***



***Residents should be able to download the receipt as PDF.***



***Admin should also be able to download receipts.***



***---***



***# 20. Complaint Management***



***Residents should have a dedicated \*\*Complaints\*\* section.***



***Resident can create a complaint.***



***Form:***



***```text***

***Complaint Type***

***\[ Room Maintenance ▼ ]***



***Subject***

***\[\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_]***



***Description***

***\[\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_]***



***Priority***

***\[ Low ▼ ]***



***\[ Submit Complaint ]***

***```***



***Complaint categories can include:***



***\* Room Maintenance***

***\* Electrical***

***\* Plumbing***

***\* Wi-Fi***

***\* Cleaning***

***\* Furniture***

***\* Water***

***\* AC/Fan***

***\* Security***

***\* Noise***

***\* Other***



***---***



***# 21. Complaint Ticket Generation***



***When a resident submits a complaint, automatically generate a unique Ticket ID.***



***Example:***



***```text***

***EH-TKT-2026-0001***

***```***



***The ticket must be unique.***



***After submission:***



***```text***

***Complaint Submitted Successfully 🎉***



***Ticket ID:***

***EH-TKT-2026-0001***



***Status:***

***Submitted***



***We will review your complaint shortly.***

***```***



***---***



***# 22. Complaint Status***



***Complaint status should follow a clear workflow.***



***Suggested statuses:***



***```text***

***Submitted***

&#x20;   ***↓***

***Under Review***

&#x20;   ***↓***

***Assigned***

&#x20;   ***↓***

***In Progress***

&#x20;   ***↓***

***Resolved***

&#x20;   ***↓***

***Closed***

***```***



***Admin should be able to update the status.***



***Resident should be able to track the current status.***



***---***



***# 23. Complaint Tracking***



***Resident complaint page:***



***```text***

***Ticket:***

***EH-TKT-2026-0001***



***Wi-Fi not working***



***Status:***

***In Progress***



***Timeline:***



***✓ Complaint Submitted***

&#x20; ***07 Sep 2026, 10:32 AM***



***✓ Under Review***

&#x20; ***07 Sep 2026, 11:10 AM***



***✓ Assigned***

&#x20; ***07 Sep 2026, 12:30 PM***



***● In Progress***

&#x20; ***07 Sep 2026, 02:00 PM***



***○ Resolved***



***○ Closed***

***```***



***Use a beautiful animated timeline.***



***---***



***# 24. Admin Notifications***



***The admin dashboard must contain a notification system.***



***Notifications should appear when:***



***\* New resident is added***

***\* Rent becomes due***

***\* Rent becomes overdue***

***\* New complaint is submitted***

***\* Complaint status changes***

***\* Resident leaves***

***\* Room becomes available***



***Example:***



***```text***

***Notifications***



***🔴 New Complaint***

***Rahul Kumar submitted:***

***"Fan not working"***

***Room A7***

***5 minutes ago***



***🟡 Rent Due***

***Aman Singh's rent is due today.***

***Room B4***



***🟢 Room Available***

***Bed 3 in Room C7 is now available.***

***```***



***Allow admin to:***



***\* Mark notification as read***

***\* Mark all as read***

***\* View notification history***



***---***



***# 25. Resident Search***



***Admin should have powerful search functionality.***



***Search by:***



***\* Name***

***\* Phone***

***\* Resident ID***

***\* Room number***



***Example:***



***```text***

***Search resident...***



***Rahul***

***```***



***Result:***



***```text***

***Rahul Kumar***

***EH-A07-001***

***Room A7***

***Bed 2***

***₹6,000***

***Paid***

***```***



***---***



***# 26. Resident Filters***



***Admin should be able to filter residents by:***



***\* Floor***

***\* Room***

***\* Sharing***

***\* Payment status***

***\* Active/Inactive***

***\* Joining date***

***\* Due date***



***Example:***



***```text***

***Floor: A***

***Sharing: 4***

***Payment: Overdue***

***Status: Active***

***```***



***---***



***# 27. Resident Profile***



***Admin should be able to open a complete resident profile.***



***Example:***



***```text***

***Rahul Kumar***



***Resident ID***

***EH-A07-001***



***Phone***

***9876543210***



***Room***

***A7***



***Bed***

***2***



***Floor***

***A / First Floor***



***Sharing***

***4***



***Monthly Rent***

***₹6,000***



***Joined***

***15 June 2026***



***Status***

***Active***

***```***



***Below this show:***



***### Payment History***



***All transactions.***



***### Complaint History***



***All tickets raised by this resident.***



***### Stay History***



***Room/bed changes if applicable.***



***---***



***# 28. Resident Leaving / Checkout***



***Admin must be able to mark a resident as:***



***\*\*Checked Out\*\****



***Store:***



***\* Leaving date***

***\* Final payment status***

***\* Previous room***

***\* Previous bed***

***\* Reason, if needed***



***Do NOT permanently delete the resident record.***



***Historical information should remain available.***



***Once checked out:***



***\* Resident status becomes inactive***

***\* Bed becomes available***

***\* Room occupancy updates***

***\* Future rent calculations stop***

***\* Resident login should be disabled***



***---***



***# 29. Room Transfer***



***Admin should optionally be able to transfer a resident to another room.***



***Example:***



***```text***

***Current:***

***A7 / Bed 2***



***Transfer To:***

***B4 / Bed 3***

***```***



***Maintain transfer history.***



***Do not overwrite historical room information.***



***The system should record:***



***```text***

***A7 / Bed 2***

***15 Jun 2026 – 10 Sep 2026***



***B4 / Bed 3***

***10 Sep 2026 – Present***

***```***



***---***



***# 30. Admin Room Overview***



***Create an interactive visual representation of the entire building.***



***Example:***



***```text***

***GROUND***

***\[G1] \[G2]***



***FIRST FLOOR***

***\[A1] \[A2] \[A3] \[A4] ...***

***```***



***Each room should visually indicate:***



***\* Full***

***\* Partially occupied***

***\* Available***



***Clicking a room opens its detailed information.***



***This should be one of the visually strongest parts of the application.***



***---***



***# 31. Dashboard Analytics***



***Add useful analytics.***



***Examples:***



***### Occupancy Rate***



***```text***

***Occupied: 245***

***Available: 42***



***Occupancy: 85.36%***

***```***



***### Monthly Revenue***



***Display revenue by month.***



***### Rent Collection***



***```text***

***Expected: ₹15,00,000***

***Collected: ₹14,25,000***

***Pending: ₹75,000***

***```***



***### Floor Occupancy***



***Chart showing occupancy percentage by floor.***



***### Complaints***



***Chart showing:***



***\* Submitted***

***\* In Progress***

***\* Resolved***

***\* Closed***



***Charts should be clean and modern.***



***---***



***# 32. Responsive Design***



***The website must work perfectly on:***



***\* Desktop***

***\* Laptop***

***\* Tablet***

***\* Mobile***



***Admin dashboard should be responsive.***



***Resident portal should be \*\*mobile-first\*\* because residents will most likely access it from their phones.***



***Avoid layouts that require horizontal scrolling on mobile.***



***---***



***# 33. Modern UI/UX Design***



***The website should have a premium modern SaaS aesthetic.***



***Use:***



***\* Glassmorphism***

***\* Soft gradients***

***\* Rounded cards***

***\* Subtle shadows***

***\* Clean typography***

***\* Spacious layouts***

***\* Smooth transitions***

***\* Modern icons***

***\* Interactive hover states***

***\* Micro-interactions***

***\* Animated counters***

***\* Smooth page transitions***



***Do NOT overdo animations.***



***The design should feel:***



***\*\*Premium + Clean + Fast + Modern\*\****



***rather than flashy or distracting.***



***---***



***# 34. Liquid Design / Animation***



***Use subtle liquid-style visual effects.***



***Possible effects:***



***\* Animated gradient blobs***

***\* Soft background waves***

***\* Liquid glass cards***

***\* Morphing shapes***

***\* Smooth gradient transitions***

***\* Floating elements***

***\* Blur effects***

***\* Subtle parallax***

***\* Animated page transitions***



***Animations should respect:***



***```text***

***prefers-reduced-motion***

***```***



***and should not negatively affect performance.***



***Avoid excessive animation on forms or data-heavy admin screens.***



***---***



***# 35. Dark Mode***



***Implement full dark mode.***



***Users should be able to switch between:***



***\* Light Mode***

***\* Dark Mode***

***\* System Preference***



***Store the preference locally.***



***Dark mode should not simply invert colors.***



***Create a properly designed dark theme with:***



***\* Appropriate contrast***

***\* Readable text***

***\* Clear borders***

***\* Good card hierarchy***

***\* Accessible buttons***

***\* Proper chart colors***



***---***



***# 36. Accessibility***



***Follow accessibility best practices.***



***Include:***



***\* Keyboard navigation***

***\* Proper labels***

***\* Accessible form controls***

***\* Sufficient color contrast***

***\* Focus indicators***

***\* Screen-reader-friendly structure***

***\* Accessible buttons***

***\* Error messages***



***Do not rely solely on color to indicate status.***



***For example:***



***```text***

***🟢 Available***

***🟡 Partially Occupied***

***🔴 Full***

***```***



***should also include textual status.***



***---***



***# 37. Security***



***Security is extremely important.***



***Implement:***



***\* Secure password hashing***

***\* Authentication middleware***

***\* Authorization***

***\* Input validation***

***\* Server-side validation***

***\* SQL injection protection***

***\* XSS protection***

***\* CSRF protection where applicable***

***\* Rate limiting for authentication***

***\* Secure cookies/tokens***

***\* Environment variables for secrets***

***\* Proper error handling***



***Never expose:***



***\* Admin password***

***\* Database credentials***

***\* Secret keys***

***\* Internal system information***



***Do not trust frontend validation alone.***



***---***



***# 38. Database Design***



***Use a relational database.***



***Recommended entities:***



***### Admin***



***```text***

***id***

***username***

***password\_hash***

***created\_at***

***updated\_at***

***```***



***### Floors***



***```text***

***id***

***name***

***floor\_number***

***display\_name***

***```***



***### Rooms***



***```text***

***id***

***room\_number***

***floor\_id***

***sharing\_capacity***

***monthly\_rent***

***status***

***created\_at***

***updated\_at***

***```***



***### Beds***



***```text***

***id***

***room\_id***

***bed\_number***

***status***

***```***



***### Residents***



***```text***

***id***

***resident\_id***

***name***

***phone***

***joining\_date***

***leaving\_date***

***room\_id***

***bed\_id***

***monthly\_rent***

***status***

***created\_at***

***updated\_at***

***```***



***### Payments***



***```text***

***id***

***payment\_id***

***resident\_id***

***amount***

***payment\_date***

***billing\_start\_date***

***billing\_end\_date***

***payment\_method***

***transaction\_reference***

***status***

***created\_at***

***```***



***### Complaints***



***```text***

***id***

***ticket\_id***

***resident\_id***

***category***

***subject***

***description***

***priority***

***status***

***created\_at***

***updated\_at***

***resolved\_at***

***```***



***### Complaint Status History***



***```text***

***id***

***complaint\_id***

***old\_status***

***new\_status***

***comment***

***changed\_by***

***created\_at***

***```***



***### Notifications***



***```text***

***id***

***admin\_id***

***type***

***title***

***message***

***is\_read***

***created\_at***

***```***



***### Room Transfer History***



***```text***

***id***

***resident\_id***

***old\_room\_id***

***old\_bed\_id***

***new\_room\_id***

***new\_bed\_id***

***transfer\_date***

***reason***

***```***



***---***



***# 39. API Structure***



***Create a clean REST API or equivalent backend architecture.***



***Example:***



***## Authentication***



***```text***

***POST /api/admin/login***

***POST /api/admin/logout***

***```***



***## Residents***



***```text***

***GET    /api/residents***

***GET    /api/residents/:id***

***POST   /api/residents***

***PUT    /api/residents/:id***

***PATCH  /api/residents/:id/checkout***

***```***



***## Rooms***



***```text***

***GET /api/floors***

***GET /api/rooms***

***GET /api/rooms/:id***

***GET /api/rooms/:id/beds***

***```***



***## Payments***



***```text***

***GET  /api/payments***

***POST /api/payments***

***GET  /api/payments/:id***

***GET  /api/payments/:id/receipt***

***```***



***## Complaints***



***```text***

***POST  /api/complaints***

***GET   /api/complaints***

***GET   /api/complaints/:id***

***PATCH /api/complaints/:id/status***

***```***



***## Notifications***



***```text***

***GET   /api/notifications***

***PATCH /api/notifications/:id/read***

***PATCH /api/notifications/read-all***

***```***



***Protect admin endpoints with authentication.***



***Resident endpoints must verify that the requested resource belongs to the authenticated resident.***



***---***



***# 40. Suggested Frontend Pages***



***## Public***



***```text***

***/***

***```***



***Landing / Resident Login***



***## Resident***



***```text***

***/resident***

***/resident/profile***

***/resident/payments***

***/resident/complaints***

***/resident/complaints/:ticketId***

***```***



***## Admin***



***```text***

***/admin/login***

***/admin/dashboard***

***/admin/residents***

***/admin/residents/:id***

***/admin/rooms***

***/admin/floors***

***/admin/payments***

***/admin/complaints***

***/admin/notifications***

***/admin/settings***

***```***



***---***



***# 41. Admin Sidebar***



***Use a modern collapsible sidebar.***



***Navigation:***



***```text***

***🏠 Dashboard***



***👥 Residents***



***🏢 Rooms***



***🛏 Beds***



***💰 Payments***



***📋 Complaints***



***🔔 Notifications***



***📊 Reports***



***⚙️ Settings***

***```***



***Bottom:***



***```text***

***Admin***

***Elite Homes***



***\[ Logout ]***

***```***



***On mobile, convert the sidebar into a drawer/bottom navigation.***



***---***



***# 42. Resident Navigation***



***Keep the resident portal much simpler.***



***```text***

***🏠 Home***



***👤 My Profile***



***💰 Payments***



***📋 Complaints***

***```***



***Header:***



***```text***

***Elite Homes***

***Resident Portal***



***\[ Logout ]***

***```***



***---***



***# 43. Search and Performance***



***The application may eventually contain hundreds of residents and thousands of payment records.***



***Therefore:***



***\* Use database pagination***

***\* Add indexed fields***

***\* Debounce search inputs***

***\* Avoid loading all records unnecessarily***

***\* Lazy-load heavy components***

***\* Optimize API requests***

***\* Cache appropriate data***

***\* Use efficient database queries***



***Search should remain fast as the database grows.***



***---***



***# 44. Data Validation***



***Validate:***



***### Phone***



***Accept valid Indian phone numbers.***



***### Name***



***Prevent obviously invalid input.***



***### Dates***



***Joining date cannot be invalid.***



***### Room***



***Resident can only be assigned to a valid room.***



***### Bed***



***Bed must belong to selected room and must be available.***



***### Rent***



***Rent must correspond to the configured sharing type unless the admin explicitly overrides it.***



***### Resident ID***



***Must always be unique.***



***---***



***# 45. Error Handling***



***Create friendly error states.***



***Examples:***



***```text***

***Resident not found.***



***Please check your Resident ID.***

***```***



***```text***

***This bed is no longer available.***



***Please select another bed.***

***```***



***```text***

***Unable to submit complaint.***



***Please try again.***

***```***



***Do not expose raw database/server errors to users.***



***---***



***# 46. Loading States***



***Use skeleton loaders rather than blank screens.***



***Examples:***



***\* Dashboard cards skeleton***

***\* Resident table skeleton***

***\* Payment history skeleton***

***\* Complaint timeline skeleton***

***\* Room cards skeleton***



***Use smooth transitions when data loads.***



***---***



***# 47. Empty States***



***Create polished empty states.***



***Example:***



***```text***

***No complaints yet 🎉***



***Looks like everything is running smoothly.***

***```***



***Payment:***



***```text***

***No payment records found.***

***```***



***Room:***



***```text***

***No available beds.***

***```***



***---***



***# 48. Confirmation Dialogues***



***Important actions should require confirmation.***



***Examples:***



***```text***

***Are you sure you want to mark Rahul Kumar as checked out?***

***```***



***```text***

***Are you sure you want to transfer this resident?***

***```***



***```text***

***Are you sure you want to update this payment?***

***```***



***Avoid accidental destructive actions.***



***---***



***# 49. Notifications and Due Dates***



***The system should automatically determine upcoming rent deadlines.***



***Categories:***



***### Due Soon***



***Rent due within a configurable number of days.***



***### Due Today***



***Rent due today.***



***### Overdue***



***Due date has passed and payment has not been recorded.***



***Admin dashboard should clearly highlight these.***



***---***



***# 50. Reports***



***Create an admin Reports section.***



***Allow reports such as:***



***### Resident Report***



***\* Active residents***

***\* Checked-out residents***

***\* Residents by floor***

***\* Residents by sharing***



***### Occupancy Report***



***\* Total beds***

***\* Occupied beds***

***\* Available beds***

***\* Floor-wise occupancy***



***### Revenue Report***



***\* Monthly collection***

***\* Pending rent***

***\* Overdue rent***



***### Complaint Report***



***\* Total complaints***

***\* Open complaints***

***\* Resolved complaints***

***\* Category breakdown***



***Allow exporting relevant data to:***



***\* CSV***

***\* Excel***

***\* PDF***



***---***



***# 51. Receipt Design***



***The receipt should look like a professional real-world document.***



***Use the branding:***



***\*\*ELITE HOMES\*\****



***Possible design:***



***```text***

***┌─────────────────────────────────────────────┐***

***│                                             │***

***│  ELITE HOMES                    RECEIPT      │***

***│  Hostel \& PG Accommodation                  │***

***│                                             │***

***│  Receipt No: EH-REC-2026-00123              │***

***│  Date: 15 Aug 2026                          │***

***│                                             │***

***│  RESIDENT                                   │***

***│  Rahul Kumar                                │***

***│  +91 XXXXX XXXXX                            │***

***│  EH-A07-001                                 │***

***│                                             │***

***│  ACCOMMODATION                              │***

***│  Room A7 • Bed 2 • 4 Sharing                │***

***│                                             │***

***│  BILLING PERIOD                             │***

***│  15 Aug 2026 – 14 Sep 2026                  │***

***│                                             │***

***│  Monthly Rent                 ₹6,000         │***

***│  Amount Paid                  ₹6,000         │***

***│                                             │***

***│  STATUS                         PAID ✓       │***

***│                                             │***

***│  Thank you for staying with Elite Homes.    │***

***│                                             │***

***└─────────────────────────────────────────────┘***

***```***



***Make the actual implementation visually much more polished than this ASCII example.***



***---***



***# 52. Technology Recommendation***



***Use a modern full-stack architecture.***



***Recommended:***



***### Frontend***



***\*\*Next.js / React\*\****



***### Styling***



***\*\*Tailwind CSS\*\****



***### UI***



***Use a consistent component system.***



***### Backend***



***Either:***



***\* Next.js server/API architecture***



***or***



***\* Node.js + Express***



***### Database***



***\*\*PostgreSQL\*\****



***### ORM***



***\*\*Prisma\*\****



***### Authentication***



***Secure session-based authentication or a robust authentication library.***



***### PDF***



***Generate payment receipts as PDFs server-side.***



***### Deployment***



***The application should be deployable to modern cloud hosting.***



***Use environment variables for:***



***```text***

***DATABASE\_URL***

***AUTH\_SECRET***

***OTHER\_SECRETS***

***```***



***Never hard-code secrets.***



***---***



***# 53. Code Architecture***



***Keep the project modular.***



***Separate:***



***```text***

***components***

***pages/routes***

***api***

***database***

***services***

***utils***

***types***

***validation***

***authentication***

***```***



***Create reusable components for:***



***\* Cards***

***\* Tables***

***\* Modals***

***\* Buttons***

***\* Inputs***

***\* Selects***

***\* Badges***

***\* Status indicators***

***\* Charts***

***\* Notifications***

***\* Room cards***

***\* Resident cards***



***Avoid duplicating UI logic.***



***---***



***# 54. Important Business Rules***



***The following rules must always be enforced:***



***1. A bed belongs to exactly one room.***

***2. A resident can occupy only one active bed at a time.***

***3. A bed cannot have two active residents.***

***4. Room occupancy cannot exceed room capacity.***

***5. Every active resident must have a valid room and bed.***

***6. Every resident must have a unique Resident ID.***

***7. Resident IDs must never be reused.***

***8. Checked-out residents remain in historical records.***

***9. Checked-out residents cannot continue generating future rent.***

***10. Residents can only access their own information.***

***11. Admin can access all PG information.***

***12. Rent is determined by sharing type.***

***13. Payment records should not be silently deleted.***

***14. Complaint tickets must remain traceable.***

***15. Complaint status changes should be recorded in history.***

***16. Room transfers should preserve historical room information.***

***17. All sensitive operations must be authorized server-side.***



***---***



***# 55. Visual Design Direction***



***The website should feel like a modern premium SaaS product.***



***Reference the design philosophy of modern products rather than traditional hostel software.***



***Use:***



***\* Minimal interface***

***\* Premium typography***

***\* Glassmorphism***

***\* Liquid gradients***

***\* Soft shadows***

***\* Rounded corners***

***\* Subtle borders***

***\* Clean icons***

***\* Spacious layouts***

***\* Smooth transitions***



***Color direction:***



***### Light Mode***



***\* Off-white background***

***\* Deep charcoal text***

***\* Subtle neutral cards***

***\* Premium accent color***



***### Dark Mode***



***\* Deep dark background***

***\* Slightly lighter cards***

***\* Soft borders***

***\* Bright but controlled accent color***



***Do not use excessive neon colors.***



***---***



***# 56. Animation Principles***



***Animations should be:***



***\* Smooth***

***\* Fast***

***\* Subtle***

***\* Purposeful***



***Examples:***



***\* Dashboard cards fade/slide in***

***\* Numbers count up***

***\* Room status transitions smoothly***

***\* Modal opens with scale/fade***

***\* Sidebar slides***

***\* Notifications animate in***

***\* Complaint timeline progresses smoothly***

***\* Buttons have subtle hover feedback***



***Avoid animation that makes the website feel slow.***



***---***



***# 57. Mobile Experience***



***On mobile:***



***Dashboard cards should stack naturally.***



***Room grid should become:***



***```text***

***A1***

***4 Sharing***

***3/4 occupied***



***\[View Room]***

***```***



***Tables should become responsive cards where appropriate.***



***The resident portal should be extremely easy to use with one hand.***



***Large touch targets.***



***Simple navigation.***



***Fast loading.***



***---***



***# 58. Future Scalability***



***Design the database and architecture so that future features can be added without rebuilding the application.***



***Potential future features:***



***\* WhatsApp rent reminders***

***\* SMS notifications***

***\* Online rent payment***

***\* UPI integration***

***\* Visitor management***

***\* Attendance***

***\* Food/mess management***

***\* Electricity tracking***

***\* Maintenance charges***

***\* Security deposit tracking***

***\* Document upload***

***\* Aadhaar/document verification***

***\* Multiple PG properties***

***\* Multiple admins/staff***

***\* Role-based permissions***

***\* Automatic monthly invoices***

***\* Email notifications***



***Do not implement these unless explicitly requested, but keep the architecture extensible.***



***---***



***# 59. Seed Data***



***During development, create realistic sample data.***



***Include:***



***\* All floors***

***\* All rooms***

***\* Correct sharing capacities***

***\* Sample residents***

***\* Sample payments***

***\* Sample complaints***

***\* Different room occupancy levels***



***This will make the dashboard and UI easier to test.***



***Do not use real people's personal information.***



***---***



***# 60. Final Acceptance Criteria***



***The application is considered complete only when:***



***### Admin***



***\* \[ ] Admin can securely log in.***

***\* \[ ] Admin can log out.***

***\* \[ ] Admin dashboard works.***

***\* \[ ] Admin can add residents.***

***\* \[ ] Resident ID is automatically generated.***

***\* \[ ] Admin can assign floor/room/bed.***

***\* \[ ] System prevents duplicate bed allocation.***

***\* \[ ] Room capacity is enforced.***

***\* \[ ] Admin can view all residents.***

***\* \[ ] Admin can search/filter residents.***

***\* \[ ] Admin can manage payments.***

***\* \[ ] Admin can generate receipts.***

***\* \[ ] Admin can view room occupancy.***

***\* \[ ] Admin can view available beds.***

***\* \[ ] Admin receives notifications.***

***\* \[ ] Admin can view complaints.***

***\* \[ ] Admin can update complaint status.***

***\* \[ ] Admin can check out residents.***

***\* \[ ] Admin can transfer residents.***

***\* \[ ] Admin can view reports.***



***### Resident***



***\* \[ ] Resident can authenticate using Resident ID.***

***\* \[ ] Resident sees only their own information.***

***\* \[ ] Resident can see room/bed information.***

***\* \[ ] Resident can see joining date.***

***\* \[ ] Resident can see monthly rent.***

***\* \[ ] Resident can see due date.***

***\* \[ ] Resident can view payment history.***

***\* \[ ] Resident can filter payments.***

***\* \[ ] Resident can download receipts.***

***\* \[ ] Resident can submit complaints.***

***\* \[ ] Resident receives a unique Ticket ID.***

***\* \[ ] Resident can track complaint status.***

***\* \[ ] Resident cannot access admin functionality.***

***\* \[ ] Resident cannot access another resident's data.***



***### UI***



***\* \[ ] Responsive on desktop.***

***\* \[ ] Responsive on tablet.***

***\* \[ ] Responsive on mobile.***

***\* \[ ] Light mode works.***

***\* \[ ] Dark mode works.***

***\* \[ ] Animations are smooth.***

***\* \[ ] Loading states exist.***

***\* \[ ] Empty states exist.***

***\* \[ ] Error states exist.***

***\* \[ ] Accessibility basics are implemented.***



***---***



***# 61. Development Approach***



***Build the project incrementally.***



***### Phase 1 — Foundation***



***\* Project setup***

***\* Database***

***\* Authentication***

***\* Floor/room/bed structure***

***\* Admin layout***

***\* Resident authentication***



***### Phase 2 — Resident Management***



***\* Add resident***

***\* Edit resident***

***\* Resident profile***

***\* Room allocation***

***\* Bed allocation***

***\* Checkout***



***### Phase 3 — Payments***



***\* Payment records***

***\* Due-date calculation***

***\* Payment history***

***\* Rent status***

***\* Receipt generation***



***### Phase 4 — Complaints***



***\* Complaint creation***

***\* Ticket generation***

***\* Status workflow***

***\* Complaint timeline***

***\* Admin notifications***



***### Phase 5 — Dashboard***



***\* Occupancy analytics***

***\* Revenue analytics***

***\* Rent statistics***

***\* Complaint statistics***

***\* Floor overview***



***### Phase 6 — UI Polish***



***\* Dark mode***

***\* Liquid effects***

***\* Animations***

***\* Responsive design***

***\* Accessibility***

***\* Loading/empty/error states***



***### Phase 7 — Testing***



***Test:***



***\* Authentication***

***\* Authorization***

***\* Resident creation***

***\* Room allocation***

***\* Bed allocation***

***\* Rent calculation***

***\* Due dates***

***\* Payments***

***\* Receipts***

***\* Complaints***

***\* Notifications***

***\* Checkout***

***\* Room transfers***

***\* Mobile responsiveness***

***\* Security***



***---***



***# 62. Most Important Instruction***



***Do not build this as a simple demo CRUD application.***



***Treat \*\*Elite Homes\*\* as a real-world Hostel/PG Management SaaS application.***



***Prioritize:***



***1. Data correctness***

***2. Security***

***3. Room/bed allocation accuracy***

***4. Payment accuracy***

***5. Resident privacy***

***6. Good UX***

***7. Responsive design***

***8. Maintainable architecture***

***9. Scalability***

***10. Premium visual quality***



***Before implementing major features, make sure the underlying business rules and database relationships are correct.***



***The final application should feel like a \*\*real product that a PG owner could actually use every day\*\*, not merely a college project.***



