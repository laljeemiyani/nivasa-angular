# Nivasa — Database Schema Documentation

> **Total Collections: 12** | Database: MongoDB | ODM: Mongoose

---

## 1. `users`

| Field Name | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated primary key |
| `fullName` | String | Full name of the user |
| `email` | String | Unique login email, stored lowercase |
| `password` | String | Bcrypt-hashed password |
| `phoneNumber` | String | 10-digit mobile number |
| `age` | Number | Age in years (min 18, max 120) |
| `gender` | String | Male / Female / Other |
| `wing` | String | Society wing (A to F) |
| `flatNumber` | String | Flat number e.g. 101, 1404 (unique per wing) |
| `residentType` | String | Owner or Tenant |
| `profilePhotoUrl` | String | Uploaded profile photo filename |
| `aadharFrontUrl` | String | Aadhaar card front image |
| `aadharBackUrl` | String | Aadhaar card back image |
| `addressProofUrl` | String | Address proof document |
| `rentAgreementUrl` | String | Rent agreement (tenants only) |
| `parkingAllocation` | Number | Number of parking slots allocated (default 2) |
| `adminDesignation` | String | Job title shown for admin users |
| `adminBio` | String | Short bio for admin profile |
| `lastLoginAt` | Date | Timestamp of admin's last login |
| `lastLoginIp` | String | IP address of admin's last login |
| `role` | String | admin or resident |
| `status` | String | pending / approved / rejected / deleted |
| `rejectionReason` | String | Reason provided when account is rejected |
| `sessionVersion` | Number | Incremented on password change to invalidate old JWTs |
| `isDeleted` | Boolean | Soft delete flag |
| `deletedAt` | Date | When the account was soft-deleted |
| `deletedBy` | ObjectId | ID of admin who deleted the account |
| `deletionReason` | String | Why the account was deleted |
| `deletionSource` | String | manual / property_sale / tenant_move_out / system |
| `accountStatus` | String | active / inactive / suspended |
| `dataRetained` | Boolean | Always true — data never permanently removed |
| `createdAt` | Date | Auto-generated creation timestamp |
| `updatedAt` | Date | Auto-generated last update timestamp |

---

## 2. `vehicles`

| Field Name | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated primary key |
| `userId` | ObjectId | Resident who owns this vehicle |
| `vehicleType` | String | Car / Bike / EV / Truck / Bus |
| `vehicleName` | String | Brand name e.g. Honda, Maruti |
| `vehicleModel` | String | Model name e.g. City, Swift (optional) |
| `vehicleColor` | String | Vehicle color (optional) |
| `vehicleNumber` | String | Unique Indian registration number e.g. MH04AB1234 |
| `parkingSlot` | String | Assigned slot e.g. A-101-P1 (unique among active vehicles) |
| `registrationDate` | Date | Date vehicle was added to the system |
| `status` | String | pending / approved / rejected |
| `isDeleted` | Boolean | Soft delete flag |
| `deletedAt` | Date | When the record was deleted |
| `deletedBy` | ObjectId | Admin who deleted the record |
| `createdAt` | Date | Auto-generated creation timestamp |
| `updatedAt` | Date | Auto-generated last update timestamp |

---

## 3. `complaints`

| Field Name | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated primary key |
| `userId` | ObjectId | Resident who filed the complaint |
| `title` | String | Short subject of the complaint |
| `description` | String | Detailed complaint description |
| `category` | String | e.g. Maintenance, Security, Noise (dynamic list) |
| `priority` | String | low / medium / high / urgent |
| `status` | String | pending / in_progress / resolved / closed |
| `adminResponse` | String | Admin's reply or resolution note |
| `adminId` | ObjectId | Admin who responded to the complaint |
| `attachmentUrls` | [String] | List of uploaded file URLs |
| `resolvedAt` | Date | When complaint was marked resolved |
| `isDeleted` | Boolean | Soft delete flag |
| `deletedAt` | Date | When the complaint was deleted |
| `deletedBy` | ObjectId | Who deleted the complaint |
| `createdAt` | Date | Auto-generated creation timestamp |
| `updatedAt` | Date | Auto-generated last update timestamp |

---

## 4. `notices`

| Field Name | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated primary key |
| `userId` | ObjectId | Admin who created the notice |
| `title` | String | Notice heading |
| `description` | String | Full notice content |
| `priority` | String | low / medium / high |
| `category` | String | general / maintenance / security / event / payment / other |
| `isActive` | Boolean | Whether the notice is visible to residents |
| `attachmentUrl` | String | Optional file attached to the notice |
| `expiryDate` | Date | Date after which notice is no longer shown |
| `createdAt` | Date | Auto-generated creation timestamp |
| `updatedAt` | Date | Auto-generated last update timestamp |

---

## 5. `notifications`

| Field Name | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated primary key |
| `userId` | ObjectId | User who receives this notification |
| `title` | String | Notification heading |
| `message` | String | Notification body text |
| `type` | String | info / success / warning / error / status_update / new_registration / parking_request |
| `routingType` | String | Frontend navigation hint: COMPLAINT_UPDATE / PARKING_REQUEST / BROADCAST / SYSTEM |
| `referenceId` | ObjectId | Generic reference to a related document |
| `isRead` | Boolean | Whether the user has read this notification |
| `relatedModel` | String | Collection this notification relates to e.g. Complaint, Vehicle |
| `relatedId` | ObjectId | ID of the specific related document |
| `isDeleted` | Boolean | Soft delete flag |
| `deletedAt` | Date | When the notification was deleted |
| `deletedBy` | ObjectId | Who deleted the notification |
| `createdAt` | Date | Auto-generated creation timestamp |
| `updatedAt` | Date | Auto-generated last update timestamp |

---

## 6. `familymembers`

| Field Name | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated primary key |
| `userId` | ObjectId | Resident this family member belongs to |
| `fullName` | String | Family member's full name |
| `relation` | String | Relationship e.g. Spouse, Son, Daughter |
| `phone` | String | 10-digit phone number (optional) |
| `email` | String | Email address (optional) |
| `age` | Number | Age in years (0–120) |
| `gender` | String | Male / Female / Other |
| `isDeleted` | Boolean | Soft delete flag |
| `deletedAt` | Date | When the record was deleted |
| `deletedBy` | ObjectId | Who deleted the record |
| `createdAt` | Date | Auto-generated creation timestamp |
| `updatedAt` | Date | Auto-generated last update timestamp |

---

## 7. `parkingslotrequests`

| Field Name | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated primary key |
| `userId` | ObjectId | Resident requesting additional parking |
| `requestedSlots` | Number | Number of extra slots needed (1 or 2) |
| `reason` | String | Reason for the request |
| `status` | String | pending / approved / rejected |
| `adminNote` | String | Admin's internal note during review |
| `rejectionReason` | String | Reason provided if request is rejected |
| `reviewedBy` | ObjectId | Admin who reviewed the request |
| `reviewedAt` | Date | When the admin reviewed it |
| `createdAt` | Date | Auto-generated creation timestamp |
| `updatedAt` | Date | Auto-generated last update timestamp |

---

## 8. `activesessions`

| Field Name | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated primary key |
| `userId` | ObjectId | User who is currently logged in |
| `userName` | String | Snapshot of user's name at login |
| `userRole` | String | admin or resident |
| `societyId` | ObjectId | Reserved for multi-society support |
| `societyName` | String | Wing label used as society identifier |
| `flatNumber` | String | Resident's flat at login time |
| `sessionToken` | String | Unique JWT token for this session |
| `ipAddress` | String | IP address of login |
| `device` | String | Mobile or Desktop |
| `browser` | String | Browser name e.g. Chrome, Firefox |
| `os` | String | Operating system e.g. Windows, Android |
| `loginAt` | Date | Exact login time |
| `lastActivityAt` | Date | Timestamp of most recent API call |
| `isActive` | Boolean | Whether this session is currently live |
| `createdAt` | Date | Auto-generated creation timestamp |
| `updatedAt` | Date | Auto-generated last update timestamp |

---

## 9. `residentloginlogs`

| Field Name | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated primary key |
| `userId` | ObjectId | Resident who logged in or out |
| `userName` | String | Snapshot of resident's name |
| `societyId` | ObjectId | Reserved for future use |
| `societyName` | String | Wing label at time of event |
| `flatNumber` | String | Flat number at time of event |
| `action` | String | login / logout / forced_logout |
| `ipAddress` | String | Client IP address |
| `device` | String | Mobile or Desktop |
| `browser` | String | Browser name |
| `os` | String | Operating system |
| `timestamp` | Date | Exact time of the event |
| `sessionId` | String | JWT token linked to this event |
| `createdAt` | Date | Auto-generated creation timestamp |
| `updatedAt` | Date | Auto-generated last update timestamp |

---

## 10. `adminactivitylogs`

| Field Name | Type | Description |
|---|---|---|
| `_id` | ObjectId | Auto-generated primary key |
| `adminId` | ObjectId | Admin who performed the action |
| `adminName` | String | Snapshot of admin's name |
| `action` | String | What was done e.g. approved_resident, updated_settings |
| `entityType` | String | What was affected: profile / platform / society / resident / notification / resident_account / danger_zone / login |
| `entityId` | ObjectId | ID of the document affected |
| `details` | Mixed | Extra context or changed field values (JSON) |
| `ipAddress` | String | Admin's IP at time of action |
| `userAgent` | String | Browser user-agent string |
| `timestamp` | Date | When the action was performed |
| `createdAt` | Date | Auto-generated creation timestamp |
| `updatedAt` | Date | Auto-generated last update timestamp |

---

## 11. `appsettings` *(Singleton — always 1 document)*

### Platform

| Field Name | Type | Description |
|---|---|---|
| `platformName` | String | Name of the platform |
| `tagline` | String | Platform tagline shown on the UI |
| `logoUrl` | String | Platform logo image |
| `faviconUrl` | String | Browser tab favicon |
| `contactEmail` | String | Support email address |
| `contactPhone` | String | Support phone number |
| `contactAddress` | String | Office or support address |
| `socialLinks.facebook` | String | Facebook page URL |
| `socialLinks.instagram` | String | Instagram profile URL |
| `socialLinks.twitter` | String | Twitter/X profile URL |
| `socialLinks.linkedin` | String | LinkedIn page URL |
| `maintenanceMode` | Boolean | If true, platform is locked for all users |
| `allowSocietyRegistration` | Boolean | Toggle new society sign-ups |
| `allowResidentRegistration` | Boolean | Toggle new resident sign-ups |
| `enableComplaints` | Boolean | Enable or disable the complaints module |
| `enableNoticeBoard` | Boolean | Enable or disable the notice board |
| `enableVisitorLog` | Boolean | Enable or disable the visitor log |
| `timezone` | String | System timezone e.g. Asia/Kolkata |
| `dateFormat` | String | Display format for dates e.g. DD/MM/YYYY |

### Society

| Field Name | Type | Description |
|---|---|---|
| `maxResidentsPerSociety` | Number | Max residents allowed per society |
| `maxVehiclesPerResident` | Number | Max vehicles per resident |
| `maxComplaintsPerMonth` | Number | Max complaints a resident can file per month |
| `complaintCategories` | Array | Dynamic list: `[{ name, order, isActive }]` |
| `visitorPassValidityHours` | Number | How long a visitor pass stays valid |
| `noticeExpiryDays` | Number | Default notice expiry in days |
| `autoApproveSocieties` | Boolean | Auto-approve new society registrations |
| `autoCloseComplaints` | Boolean | Auto-close resolved complaints after timeout |
| `allowReopenComplaints` | Boolean | Allow residents to reopen closed complaints |

### Security & Resident Settings

| Field Name | Type | Description |
|---|---|---|
| `approvalMode` | String | auto / society_admin / super_admin |
| `maxFailedLoginAttempts` | Number | Failed attempts before account lockout |
| `lockoutDurationMinutes` | Number | How long the lockout lasts in minutes |
| `allowProfileEdit` | Boolean | Whether residents can edit their own profile |
| `allowPasswordChange` | Boolean | Whether residents can change their password |
| `strongPasswordRequired` | Boolean | Enforce strong password policy |
| `accountDeletionPolicy` | String | Immutable policy text — data retained forever |
| `createdAt` | Date | Auto-generated creation timestamp |
| `updatedAt` | Date | Auto-generated last update timestamp |

---

## 12. `notificationpreferences` *(Singleton — always 1 document)*

| Field Name | Type | Description |
|---|---|---|
| `newSocietyRegistered` | Boolean | Notify admin when a new society registers |
| `newResident` | Boolean | Notify admin when a new resident registers |
| `complaintFiled` | Boolean | Notify admin when a complaint is filed |
| `complaintEscalated` | Boolean | Notify admin when a complaint is escalated |
| `residentAccountInactivated` | Boolean | Notify admin when a resident is deactivated |
| `residentReactivated` | Boolean | Notify admin when a resident is reactivated |
| `suspiciousLogin` | Boolean | Notify admin on suspicious login activity |
| `weeklyReport` | Boolean | Send admin a weekly activity summary |
| `weeklyReportDay` | String | Day to send the weekly report e.g. Monday |
| `createdAt` | Date | Auto-generated creation timestamp |
| `updatedAt` | Date | Auto-generated last update timestamp |
