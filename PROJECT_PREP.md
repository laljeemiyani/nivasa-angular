# Nivasa Society Management – Project Overview & Prep

## 1. What is this project?

**Nivasa** is a **Society / Residential Management System** with:
- **Admin panel**: Manage residents, complaints, notices, vehicles, parking, family members, notifications, and platform settings.
- **Resident panel**: Register, profile, complaints, notices, notifications, family members, vehicles, parking slot requests.
- **Auth**: Login, register (resident), JWT-based auth; admin vs resident roles.

---

## 2. Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Angular 19, TypeScript 5.7, RxJS 7.8, Standalone components |
| **Styling** | Tailwind CSS 3.4, custom components (cards, modals, badges, icons) |
| **Backend** | Node.js, Express 4.x |
| **Database** | MongoDB (Mongoose 8.x ODM) |
| **Auth** | JWT (jsonwebtoken), bcryptjs for password hashing |
| **File upload** | Multer (profile photos, notices, documents) |
| **Validation** | express-validator (backend), Angular Reactive/Forms (frontend) |
| **Security** | Helmet, CORS, rate limiting, env-based config |
| **Dev** | Nodemon, dotenv, Jest (backend), Karma/Jasmine (frontend) |

---

## 3. Database (MongoDB Collections / “Tables”)

MongoDB is **schemaless** but Mongoose defines **models** (≈ tables). Database name: **`nivasa_society`** (or from `MONGODB_URI`).

| Collection (Model) | Purpose |
|--------------------|--------|
| **users** | All users: residents and admins. Fields: fullName, email, password (hashed), phoneNumber, role (admin/resident), status (pending/approved/rejected/inactive), wing, flatNumber, residentType, profilePhotoUrl, parkingAllocation, familyMembers[], vehicles[] refs. |
| **adminprofiles** | Admin-only profile: userId, profilePhotoUrl, username, designation, bio, lastLoginAt, lastLoginIp. |
| **complaints** | Resident complaints: userId, title, description, category, priority, status (pending/in_progress/resolved/closed), adminResponse, adminId, attachmentUrls, resolvedAt. |
| **vehicles** | Resident vehicles: userId, vehicleType, vehicleName, vehicleModel, vehicleColor, vehicleNumber (unique), parkingSlot, status (pending/approved/rejected). |
| **parkingslots** | Parking slots: slotNumber (e.g. C-102-P1), wing, floor, flatNumber, position, isOccupied, userId, vehicleId. |
| **parkingslotrequests** | Resident requests for extra slots: userId, requestedSlots, reason, status (pending/approved/rejected). |
| **familymembers** | Family members per resident: userId, fullName, relation, phone, email, age, gender. |
| **notices** | Notices (admin-created): userId (creator), title, description, priority, category, isActive, attachmentUrl, expiryDate. |
| **notifications** | In-app notifications: userId, title, message, type, routingType, referenceId, isRead, relatedModel, relatedId. |
| **platformsettings** | Platform-wide config: platformName, tagline, maintenanceMode, feature flags, etc. |
| **societysettings** | Society limits: maxResidentsPerSociety, complaintCategories, visitorPassValidityHours, etc. |
| **residentsettings** | Resident policies: approvalMode, maxFailedLoginAttempts, lockoutDurationMinutes, etc. |
| **notificationpreferences** | Admin notification preferences (which events to notify). |
| **adminactivitylogs** | Admin action logs (audit). |
| **residentloginlogs** | Resident login history. |
| **activesessions** | Active sessions (if used). |
| **deletionaudits** | Audit trail for deletions. |

---

## 4. Main Relationships

- **User** → has many **Complaints**, **Vehicles**, **FamilyMembers**; references in User (familyMembers[], vehicles[]) are optional.
- **Complaint** → belongs to **User** (userId); optional **adminId** (User) for who resolved it.
- **Vehicle** → belongs to **User** (userId); links to **ParkingSlot** via parkingSlot string (slotNumber).
- **ParkingSlotRequest** → belongs to **User**; on approval, User.parkingAllocation is increased.
- **Notice** → created by **User** (admin).
- **Notification** → belongs to **User** (recipient); can reference Complaint, Vehicle, etc. via relatedModel/relatedId.
- **AdminProfile** → 1:1 with admin **User** (userId).

---

## 5. API Structure (Backend)

- Base: **`/api`**
- **Auth**: `/api/auth` – login, register, logout, profile, change-password, update-profile-photo.
- **Admin**: `/api/admin` – profile, settings, residents, complaints, notices, vehicles, family-members, notifications, parking, activity/logs, danger-zone actions.
- **Resident-facing**: `/api/complaints`, `/api/notices`, `/api/family`, `/api/vehicles`, `/api/notifications`, `/api/parking` (plus auth for profile, etc.).
- **Health**: `GET /api/health`
- **Static**: `/uploads` for profile photos and attachments.

Frontend uses **`apiUrl: '/api'`** and in dev a **proxy** (e.g. to `http://localhost:5001`) so all calls go to the same origin.

---

## 6. Common Questions for Preparation

**Q1: What is the tech stack of this project?**  
Frontend: Angular 19 + TypeScript + Tailwind. Backend: Node.js + Express. Database: MongoDB with Mongoose. Auth: JWT + bcrypt.

**Q2: How is authentication implemented?**  
JWT tokens issued on login, stored (e.g. localStorage). Requests send token in headers. Backend middleware verifies JWT and attaches user. Role (admin/resident) checked for protected routes.

**Q3: How are passwords stored?**  
Hashed with **bcrypt** (bcryptjs) before saving in User model; never stored in plain text.

**Q4: What is the database? Why MongoDB?**  
MongoDB. No fixed “tables”; Mongoose schemas define structure. Good for flexible, document-style data (users, complaints, notices, etc.) and fast iteration.

**Q5: Name the main collections (tables) and their purpose.**  
Users (accounts + resident/admin), Complaints, Vehicles, ParkingSlots, ParkingSlotRequests, FamilyMembers, Notices, Notifications, AdminProfiles, Platform/Society/Resident Settings, and audit/log collections.

**Q6: How does the resident approval flow work?**  
Resident registers → status “pending”. Admin approves/rejects in admin panel. Only “approved” residents can log in and use resident features.

**Q7: How is file upload handled?**  
**Multer** on Express: profile photos, notice attachments, etc. Stored under `uploads/` (e.g. `uploads/profile_photos/`). URLs saved in DB; served via `/uploads` static route.

**Q8: What is the parking slot format?**  
Format: `{Wing}-{Flat}-P{Position}` e.g. `C-102-P3`. Wing A–F, flat like 101–1404, position P1–P9. Validated by regex on backend and in Vehicle/ParkingSlot models.

**Q9: How do you ensure API security?**  
Helmet, CORS (allowed origin from config), rate limiting on `/api`, JWT verification, express-validator for input, env-based secrets (e.g. JWT_SECRET, DB URI).

**Q10: What is the role of express-validator?**  
Request body/query validation (e.g. registration, login, complaint, vehicle). Returns 400 with “Validation failed” and error list if invalid.

**Q11: Difference between admin and resident flows?**  
Admin: full CRUD on residents, complaints, notices, vehicles, family members; platform/society settings; parking slot requests approval; notifications. Resident: own profile, complaints, notices, family, vehicles, parking requests; view notifications.

**Q12: How is the frontend structured?**  
Angular with **standalone components**; lazy-loaded routes for admin and resident modules; shared UI (cards, modals, badges); AuthGuard for protected routes; role-based redirect after login.

**Q13: What if MongoDB is not running?**  
In development, backend can fall back to **in-memory MongoDB** (mongodb-memory-server), optionally with seed data, so the app can run without a real DB for demo/dev.

**Q14: How are profile photos stored and displayed?**  
Uploaded via Multer to `uploads/profile_photos/`. URL (path or filename) saved in User or AdminProfile. Frontend uses `/uploads/...` (proxied in dev) in `img` src; helper (e.g. `getProfilePhotoUrl`) builds full path if needed.

**Q15: What is the complaint lifecycle?**  
Created by resident (status: pending) → admin can set in_progress → resolve with optional adminResponse (resolved) → can be closed. Status values: pending, in_progress, resolved, closed.

---

## 7. Quick Commands

- **Backend**: `cd backend && npm run start-full` (full API) or `npm start` (simple server).
- **Frontend**: `cd frontend && npm start` (dev server with proxy).
- **Build**: `cd frontend && npm run build`.
- **DB**: Ensure MongoDB running on URI in `.env` (e.g. `MONGODB_URI`) or rely on in-memory fallback in dev.

Use this document to explain the project, list technologies, “tables” (collections), and answer common technical and design questions in interviews or presentations.
