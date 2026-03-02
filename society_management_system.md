# Society Management System - Project Plan

## 🧩 Project Overview

This Society Management System is designed for **a specific housing society** to simplify and digitize daily operations, such as resident management, complaint resolution, and notice circulation. It allows society admins and residents to interact securely and conveniently with the system.

The project will be implemented in **two versions**:

- **PHP + MySQL**
- **MERN/MEAN Stack** (MongoDB, Express/Node.js, React or Angular)

---

## 👥 User Roles and Panels

### 🧑‍💼 Admin Panel

**Who:** Society Manager/Committee Member

**Responsibilities:**

- Approve resident registrations
- View and resolve complaints
- Post and manage notices
- View vehicle records

### 🧑‍💻 Resident/User Panel

**Who:** Society Residents (Flat owners/tenants)

**Responsibilities:**

- Register self and wait for approval
- Raise complaints
- View notices
- View/edit own profile
- Add, edit, and delete own vehicle details

---

## 🧠 Finalized Modules (with CRUD)

| Module               | Admin Side (CRUD)            | Resident Side (Actions)           |
| -------------------- | ---------------------------- | --------------------------------- |
| Residents Management | Approve/Edit/Delete/View     | Register/View/Edit own profile    |
| Complaints           | View, Update status, Delete  | Add/View own complaints           |
| Notice Board         | Add/Edit/Delete/View notices | View notices                      |
| Vehicle Management   | View all vehicles            | Add/Edit/Delete/View own vehicles |

---

## 🛠️ Core Features (Demo Version)

| Feature                | Description                                     |
| ---------------------- | ----------------------------------------------- |
| Login & Authentication | Role-based login for admin and residents        |
| Resident Directory     | Admin approves and manages residents            |
| Complaint Management   | Resident raises complaints, admin resolves them |
| Notice Board           | Admin posts society announcements               |
| Vehicle Tracker        | Resident manages their own vehicle details      |
| Dashboard              | Admin view of key metrics and stats             |

---

## 📈 Use Case Table

| Use Case             | Actor           | Description                                   |
| -------------------- | --------------- | --------------------------------------------- |
| Login                | Admin, Resident | Secure login with role redirection            |
| Register as Resident | Resident        | Submit own profile for admin approval         |
| Approve Resident     | Admin           | Reviews and approves resident registrations   |
| Raise Complaint      | Resident        | Submits issue (e.g., plumbing) for resolution |
| Resolve Complaint    | Admin           | Updates complaint status                      |
| Post Notice          | Admin           | Posts messages/announcements for all users    |
| View Notices         | Resident        | Sees all current and past notices             |
| Manage Vehicle Info  | Resident        | Add/Edit/Delete their own vehicle info        |
| View Vehicle Records | Admin           | Admin views all registered vehicles           |

---

## 🔄 System Flow Diagram (Text Description)

```text
[Login Page]
   --> [Role Check]
      --> Admin → [Admin Dashboard]
         ├── Approve Residents
         ├── Manage Complaints
         ├── Post Notices
         └── View Vehicle Records

      --> Resident → [Resident Dashboard]
         ├── View Notices
         ├── Raise Complaint
         └── Add/Edit/Delete/View Vehicles
```

---

## 🧪 Tools & Technologies

**Frontend**:

- PHP Version: HTML, CSS, Bootstrap
- Advanced Version: React.js or Angular + TailwindCSS

**Backend**:

- PHP Version: Core PHP (or Laravel) + MySQL
- Advanced Version: Node.js + Express + MongoDB

**Other Tools**:

- Git/GitHub for version control
- Figma for UI Mockups (optional)
- Postman for API testing (Advanced version)

---

## 🎨 UI Design Guidelines

**Primary Color Palette:**

| Purpose         | Color Code | Description                     |
| --------------- | ---------- | ------------------------------- |
| Primary Color   | #2F80ED    | Main buttons, highlights, links |
| Secondary Color | #56CCF2    | Hover states, accents           |
| Background      | #F4F6F8    | Page background                 |
| Card Background | #FFFFFF    | Cards, content areas            |
| Text Primary    | #1F2D3D    | Main headings, content text     |
| Text Secondary  | #6B7280    | Hints, labels, muted text       |
| Success         | #27AE60    | Status indicators for success   |
| Error           | #EB5757    | Error messages, alerts          |

- Clean, modern, and professional aesthetic
- High contrast for readability
- Works well in light/dark modes

---

## 📅 Timeline (Sample)

| Week | Task                         |
| ---- | ---------------------------- |
| 1    | UI Design & Tech Stack Setup |
| 2    | Login System & Role Handling |
| 3    | Complaint & Notice Modules   |
| 4    | Resident and Vehicle Module  |
| 5    | Dashboard + Testing          |
| 6    | Polish + Final Submission    |

---

## 🎯 Learning Objectives

- Understand CRUD operations in both PHP and MERN/MEAN stack
- Apply RESTful API and database design concepts
- Learn frontend/backend integration
- Demonstrate responsive UI and role-based control

