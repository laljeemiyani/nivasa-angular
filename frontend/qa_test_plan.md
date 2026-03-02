# Nivasa Web: React to Angular Migration QA Test Plan

This document serves as a comprehensive Quality Assurance guide for the React to Angular frontend migration.

## 1. Complete Migration Inventory

### Services & Interceptors

- `AuthService` (Authentication, generic state management via BehaviorSubject)
- `ApiService` (Generic HTTP wrapper)
- `NotificationService` (Resident notifications)
- `AdminNotificationService` (Admin notifications)
- `ApiInterceptor` (Bearer token injection for HTTP requests)

### Guards & Routing

- `AuthGuard` (Protects authenticated routes)
- `AdminGuard` (Role-based access: Admin only)
- `ResidentGuard` (Role-based access: Resident only)
- Public Routes: `/login`, `/register`
- Admin Routes: `/admin/dashboard`, `/admin/residents`, `/admin/vehicles`, `/admin/complaints`, `/admin/notices`, `/admin/family-members`
- Resident Routes: `/resident/dashboard`, `/resident/profile`, `/resident/family`, `/resident/vehicles`, `/resident/complaints`, `/resident/notices`

### Layouts

- `AuthLayoutComponent`
- `MainLayoutComponent` (Header and overall shell)
- `AdminLayoutComponent` (Sidebar and layout container)
- `ResidentLayoutComponent` (Sidebar and layout container)

### Features & Pages

- **Auth**: LoginComponent, RegisterComponent
- **Admin**: AdminDashboardComponent, AdminResidentsComponent, AdminVehiclesComponent, AdminComplaintsComponent, AdminNoticesComponent, AdminFamilyMembersComponent
- **Resident**: ResidentDashboardComponent, ProfileComponent, FamilyComponent, ResidentVehiclesComponent, ResidentComplaintsComponent, ResidentNoticesComponent

### Shared UI Components

- `BadgeComponent`, `ButtonComponent`, `CardComponent` (Header, Title, Description, Content), `InputComponent`, `LabelComponent`, `ModalComponent`, `SelectComponent`, `TabsComponent` (List, Trigger, Content), `FileUploadComponent`, `NotificationBellComponent`
- `IconsComponent` (Lucide-based SVG icons)

---

## 2. High-Risk Areas (React → Angular Paradigm Shifts)

When migrating from React to Angular, the following areas are the most prone to bugs due to fundamental architectural differences:

1. **Reactive State vs `useState`/`useEffect`**:
   - **Risk**: React component re-renders are triggered by state mutations. Angular relies on Zone.js and input references. Replacing `useState` with RxJS `BehaviorSubject` requires explicit subscriptons.
   - **Test**: Look for stale data on screens after an update (e.g. adding a complaint, does the list update immediately without a refresh?). Check for memory leaks if subscriptions are not torn down in `ngOnDestroy`.
2. **Formik to Angular Reactive Forms**:
   - **Risk**: Formik manages touched/dirty state internally differently than `FormGroup`. Validation logic translates differently.
   - **Test**: Verify that form submission is blocked when fields are invalid. Verify that error messages appear _only_ after a field is touched or the form is submitted.
3. **Data Mutation & Two-Way Binding**:
   - **Risk**: React strictly enforces immutable prop passing. Angular allows `[(ngModel)]` two-way binding. Unintended side-effects can occur if object references are mutated directly in child components.
   - **Test**: Open edit modals (like Edit Vehicle), change a value, but click "Cancel". Ensure the underlying data in the table didn't change (it should only update on "Save").
4. **Lifecycle Execution (`useEffect` vs `ngOnInit`)**:
   - **Risk**: Data fetching in React `useEffect` might have dependencies that trigger refetches. In Angular, this is often handled explicitly or via `switchMap` on a parameter observable.
   - **Test**: Navigate between different tabs or pages quickly. Ensure that HTTP requests aren't duplicated and that the correct data is shown for the current view.

---

## 3. Targeted Testing Checklist

### 🔑 Authentication & Guards

- [ ] **Unauthenticated Access**: Attempt to access `/admin/dashboard` or `/resident/dashboard` while logged out. Verify redirect to `/login`.
- [ ] **Role-Based Routing**: Attempt to access `/admin/residents` or `/admin/notices` directly via URL bar while logged in as a Resident. Verify redirect to unauthorised page or `/resident/dashboard`.
- [ ] **Token Validation**: Manually replace the `token` in `localStorage` with a malformed string or an expired JWT. Refresh the page. Verify the `AuthGuard` or `ApiInterceptor` detects it, clears the invalid token, and forces a redirect to `/login`.
- [ ] **Login State**: Verify token is stored correctly and `AuthService.state$` reflects true user data on successful login.
- [ ] **Logout Flow**: Verify token is cleared from storage and memory, and user is redirected.

### 🛣️ Routing, Layouts & Shared UI

- [ ] **Modal Components**: Open and close every modal type (e.g., Add Complaint, Edit Vehicle). Verify that clicking the backdrop closes the modal, and clicking the X button closes the modal. Verify that state within the modal resets if closed and reopened.
- [ ] **Tabs & Selectors**: Verify active tab styling applies correctly in `ProfileComponent`. Verify dropdown selects update the underlying Angular Reactive Form controls cleanly.
- [ ] **Sidebars**: Verify sidebars render correct links based on role (Admin vs Resident). Ensure the `<router-outlet>` properly switches components without full page reloads.

### 📝 Forms & Inputs (Reactive Forms)

- [ ] **Login/Register**: Test blank submissions, invalid emails, and wrong passwords. Verify inline Angular form validation errors appear _only_ after a field is touched or submitted.
- [ ] **Pipes & Directives**: Verify Date pipes accurately format Notice dates and Complaint creation dates. Check for any custom structural directives (e.g., a role-based wrapper) hiding/showing admin buttons.
- [ ] **File Upload Variations**:
  - Upload a valid `.jpg` or `.png` image (e.g., under 2MB). Verify preview or success state.
  - Upload a file that exceeds the size limit (e.g., a 15MB file). Verify a meaningful error message is displayed and the upload is blocked.
  - Upload a non-image file (e.g., a `.pdf`). Verify the file input rejects it or validation catches it.

### 🌐 API Data, Interceptors & Error States

- [ ] **Happy Path**: Inspect Network tab. Ensure `Authorization: Bearer <token>` is attached to all backend requests.
- [ ] **401/403 Errors**: Trigger a 401 Unauthorized response. Verify the `ApiInterceptor` intercepts it, triggers a global logout, and displays a generic "Session Expired" toast or alert.
- [ ] **500 Server Errors & Network Failures**: Disconnect the proxy or stop the backend server. Trigger an action yielding a 500 or network error. Does the app show a meaningful "Network Error / Try Again Later" error message, or does it silently fail and freeze forms in a 'loading' state indefinitely? Verify the UI recovers gracefully.

### 🔄 State & Notifications

- [ ] **Resident Notifications**: Open the Resident Notification Bell. Verify the count updates accurately when new notifications arrive or are marked as read via the `NotificationService`.
- [ ] **Admin Notifications**: Login as an Admin. Open the Admin Notification Bell. Verify that specific Admin events (new user registrations, new complaints submitted) are accurately pulled and displayed via the `AdminNotificationService`.
- [ ] **Data Reactivity**: Add a Vehicle. Verify the new vehicle immediately appended to the table without a manual page refresh.

---

## 4. Manual Testing Walkthrough

Follow these exact steps in the browser to cover 80% of critical paths:

1. **Registration Flow**:
   - Go to `http://localhost:4200/register`.
   - Fill out the form as a new Resident. Submit.
   - Verify you are redirected to Login and a success message appears.
2. **Resident Flow**:
   - Login with `owner@nivasa.com` / `Password@123`.
   - Ensure you land on the Resident Dashboard. Check that stats cards have data.
   - **Family & Edit Data Mutation**: Navigate to **Family**. Click "Add Member", fill form, and save. Verify the new member appears. Click "Edit" on the member, change the name, but click **Cancel**. Verify the table name did _not_ mutate. Click "Edit" again, change the name, hit "Save", and verify the name _does_ update in the table.
   - **Complaints**: Navigate to **My Complaints**. Click "Add Complaint". Fill form and save. Verify the new complaint appears in the table.
   - **Profile Persistence**: Navigate to **Profile**. Change your phone number. Save. Navigate away and back to verify the state persisted via backend.
   - Click the **Log Out** button in the sidebar. Verify redirect to `/login`.
3. **Admin Flow**:
   - Login with `admin@nivasa.com` / `Password@123` (or the seeded admin credentials).
   - Ensure you land on the Admin Dashboard.
   - **Residents**: Navigate to **Residents**. Verify the full directory table loads correctly.
   - **Notices**: Navigate to **Notices**. Create a new "High" priority notice. Edit the notice and change it to "Medium". Verify the updated value reflects correctly in the table.
   - **Complaints & Vehicles (Tables)**: Navigate to **Complaints** and **Vehicles**. Verify that all resident complaints and vehicles are listed and that any server-side filtering/sorting works.
   - Log out.
