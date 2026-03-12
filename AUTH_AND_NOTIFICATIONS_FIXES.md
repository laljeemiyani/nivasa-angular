# Nivasa – Authentication, Routing & Approval Notification Fixes

This document summarizes the analysis and fixes applied to the **authentication flow**, **routing**, and **approval notification workflow** without changing backend business logic or removing features.

---

## 1. Problems Found

### Routing
- **Issue:** Requirement was that the **Landing Page (Home)** should open first when the application starts; Login was reported as the first page.
- **Cause:** Route order was correct (landing first), but the default child route did not use `pathMatch: 'full'`, and the `unauthorized` route redirected to `/login` instead of letting the user return to the home page.

### Resident Registration & Login
- **Issue:** When a resident tried to log in before admin approval, the message was not exactly as required.
- **Required message:** *"Your registration request has been submitted successfully. Please wait until the administrator approves your account."*
- **Cause:** Backend used a different pending message; frontend did not guarantee this text for 403.

### Registration Success Message
- **Issue:** After registration, the success message did not clearly state that the user must wait for admin approval.
- **Cause:** The success text was generic (“Registration successful! Redirecting to login…”).

### Admin Notifications
- **Issue:** New resident registration notifications needed to be clearly identifiable and the list needed to update without a full page refresh.
- **Cause:** Type filter did not include `new_registration` / `status_update`; backend did not support filtering by `type` and `relatedModel`; no polling.

### Resident Approval Notification
- **Issue:** Resident should see approval/rejection quickly without refreshing.
- **Cause:** No polling on the resident notifications page; backend already sent the notification on approve/reject.

### Real-Time / Near Real-Time Updates
- **Issue:** Notifications and approval updates should be visible without manual refresh.
- **Cause:** Notification bell polled every 60s; admin and resident notification pages had no polling.

---

## 2. Code Fixes

### 2.1 Routing (Step 1)
- **`frontend/src/app/app.routes.ts`**
  - Set the default (landing) child route to `pathMatch: 'full'` so the root path clearly loads the landing page.
  - Added a short comment that the app opens on Landing and only authenticated users reach admin/resident.
  - Changed `path: 'unauthorized'` from `redirectTo: '/login'` to `redirectTo: '/'` so users without the right role are sent to the landing page instead of login.

### 2.2 Backend – Login Message (Step 2)
- **`backend/controllers/authController.js`**
  - For **pending** residents, the 403 message is now: *"Your registration request has been submitted successfully. Please wait until the administrator approves your account."*
  - Rejected and other status messages are unchanged (rejected still says to contact admin).

### 2.3 Frontend – Registration Success (Step 2)
- **`frontend/src/app/pages/auth/register/register.component.html`**
  - Success message updated to: *"Your registration request has been submitted successfully. Please wait until the administrator approves your account. You will be redirected to sign in shortly."*

### 2.4 Frontend – Login Error (Step 2)
- **`frontend/src/app/core/services/auth.service.ts`**
  - In `login()` `catchError`, if `error.status === 403` and the backend does not send a message, the fallback message is set to the same required pending text so the user always sees it when login is blocked due to pending approval.

### 2.5 Admin Notifications (Step 3)
- **`backend/controllers/notificationController.js`**
  - `getUserNotifications` now supports optional query params `type` and `relatedModel` so the admin can filter by notification type and related model.
- **`frontend/src/app/pages/admin/notifications/notifications.component.html`**
  - Type filter options extended with **New Registration** (`new_registration`) and **Status Update** (`status_update`).
  - Clear Filters button and dot color use theme-aware classes instead of hardcoded hex.
- **`frontend/src/app/pages/admin/notifications/notifications.component.ts`**
  - `getNotificationTypeClass`, `getNotificationIconStyle`, and `getNotificationIcon` now handle `new_registration` and `status_update`.
  - **Polling:** `interval(30000)` runs every 30s and calls `refreshSilent()` to update the list in the background without showing the loading spinner.
  - Implemented `doFetch()` and `refreshSilent()` so the first load shows loading and polling only updates data.

### 2.6 Resident Status Update & Login (Step 4)
- No backend change: `updateResidentStatus` in `adminController.js` already creates a notification for the resident on approve/reject, and login already returns 403 with the correct message for non-approved residents.
- Frontend login already displays the error message from the API (and now has the fallback message in auth.service for 403).

### 2.7 Real-Time / Near Real-Time (Step 5)
- **`frontend/src/app/shared/components/notification-bell/notification-bell.component.ts`**
  - Polling interval reduced from 60s to **30s** so new registrations and other updates appear sooner.
- **`frontend/src/app/pages/resident/notifications/notifications.component.ts`**
  - Added **30s polling** with a silent refresh (no loading spinner on poll) so residents see approval/rejection notifications without refreshing the page.

---

## 3. Files Modified

| File | Changes |
|------|--------|
| `frontend/src/app/app.routes.ts` | Default route `pathMatch: 'full'`, comment, `unauthorized` → `/` |
| `frontend/src/app/core/services/auth.service.ts` | 403 fallback message for login |
| `frontend/src/app/pages/auth/register/register.component.html` | Registration success message text |
| `backend/controllers/authController.js` | Pending login 403 message text |
| `backend/controllers/notificationController.js` | `type` and `relatedModel` filters in `getUserNotifications` |
| `frontend/src/app/pages/admin/notifications/notifications.component.html` | Type filter options, theme-aware button/dot classes |
| `frontend/src/app/pages/admin/notifications/notifications.component.ts` | new_registration/status_update display, 30s polling, silent refresh |
| `frontend/src/app/shared/components/notification-bell/notification-bell.component.ts` | Polling interval 60s → 30s |
| `frontend/src/app/pages/resident/notifications/notifications.component.ts` | 30s polling, silent refresh, OnDestroy unsubscribe |

---

## 4. Final Corrected Workflow

### Application start
1. User opens the app (e.g. `http://localhost:4200/`).
2. **Landing Page** is shown (path `''` with `pathMatch: 'full'`).
3. From the landing page, the user can go to **Login** or **Register** via the navbar/buttons.

### Resident registration
1. User goes to **Register** and submits the form.
2. Backend creates the user with `status: 'pending'` and calls `notifyAdmins()` so every admin gets a **New Resident Registration** notification.
3. Frontend shows: *"Your registration request has been submitted successfully. Please wait until the administrator approves your account. You will be redirected to sign in shortly."* and redirects to Login after 2 seconds.

### Login before approval
1. If the resident tries to log in before approval, the backend returns **403** with the message: *"Your registration request has been submitted successfully. Please wait until the administrator approves your account."*
2. The frontend displays this message (or the same fallback if the API does not send a body).
3. Resident **cannot** access dashboard until status is `approved`.

### Admin approval flow
1. Admin receives a **New Resident Registration** notification (in the bell and on the Notifications page); the list refreshes every 30s.
2. Admin can filter by type **New Registration** and by related model **User**.
3. Admin goes to **Residents**, sets filter to **Pending Approval**, and approves or rejects the resident (with optional rejection reason).
4. Backend updates the user’s `status` and creates a **status_update** notification for that resident.

### Resident after approval/rejection
1. Resident’s notification list (and bell) refresh every 30s, so they see the approval or rejection notification without reloading.
2. If **approved:** resident can log in and is redirected to the resident dashboard.
3. If **rejected:** login remains blocked with the rejection message; resident sees the rejection notification.

### Unauthorized access
1. If a user hits a route that requires a different role (e.g. resident opens an admin URL), the guard redirects to **`/`** (landing), not login.

---

## 5. How to Test

1. **Landing first:** Open `http://localhost:4200/` → Landing page. Click “Sign In” / “Get Started” to go to Login/Register.
2. **Register:** Register a new resident → see the new success message → redirect to Login.
3. **Login before approval:** Log in with that resident → see the pending message; no dashboard access.
4. **Admin notification:** Log in as admin → open Notifications or the bell → see “New Resident Registration” (and filter by “New Registration” if desired). Approve from **Residents** (filter: Pending).
5. **Resident after approval:** As that resident, open Notifications or wait for the bell to refresh (or refresh once) → see approval notification; then log in → access resident dashboard.
6. **Rejection:** Reject another pending resident → resident sees rejection on login and in notifications.
7. **Polling:** Stay on Admin or Resident notifications page; trigger a new registration or an approval → within about 30s the list should update without manual refresh.

No backend workflows or features were removed or redesigned; only routing, messages, filters, and polling were added or adjusted as above.
