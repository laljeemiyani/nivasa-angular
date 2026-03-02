# Society Management System – Database Schema (Updated)

This document outlines the database structure for the Society Management System project. The schema includes detailed information for residents, family members, vehicles, notices, and complaints.

---

## 1. `users` Table

| Field Name           | Data Type                                      | Description                                  |
|----------------------|------------------------------------------------|----------------------------------------------|
| id                   | INT, Primary Key, Auto Increment               | Unique ID for each user                      |
| full_name            | VARCHAR(100), Not Null                         | Full name of the user                        |
| email                | VARCHAR(100), Not Null, Unique                 | Email address                                |
| password             | VARCHAR(255), Not Null                         | Hashed password                              |
| phone_number         | VARCHAR(15), Not Null                          | Contact number                               |
| age                  | INT, Optional                                  | Age of the user                              |
| gender               | ENUM('Male', 'Female', 'Other'), Optional      | Gender                                       |
| wing                 | VARCHAR(10)                                    | Wing name (e.g., 'A', 'B')                   |
| flat_number          | VARCHAR(20)                                    | Flat number (e.g., '101')                    |
| resident_type        | ENUM('Owner', 'Tenant'), Not Null              | Type of residency                            |
| profile_photo_url    | VARCHAR(255), Optional                         | URL to profile photo                         |
| aadhar_front_url     | VARCHAR(255), Optional                         | URL to Aadhar front image                    |
| aadhar_back_url      | VARCHAR(255), Optional                         | URL to Aadhar back image                     |
| address_proof_url    | VARCHAR(255), Optional                         | URL to address proof                         |
| rent_agreement_url   | VARCHAR(255), Optional                         | URL to rent agreement (for tenants)          |
| role                 | ENUM('admin', 'resident'), Default: 'resident' | Role of the user                             |
| status               | ENUM('pending', 'approved'), Default: 'pending'| Approval status                              |
| created_at           | TIMESTAMP, Default: Current Timestamp          | Account creation timestamp                   |

---

## 2. `family_members` Table

| Field Name    | Data Type                                      | Description                                  |
|---------------|------------------------------------------------|----------------------------------------------|
| id            | INT, Primary Key, Auto Increment               | Unique ID for each family member             |
| user_id       | INT, Not Null, Foreign Key to `users(id)`      | Linked user ID                               |
| full_name     | VARCHAR(100), Not Null                         | Full name                                    |
| relation      | VARCHAR(50), Not Null                          | Relationship to the user (e.g., 'Spouse')    |
| phone         | VARCHAR(15), Optional                          | Contact number                               |
| email         | VARCHAR(100), Optional                         | Email address                                |
| age           | INT, Optional                                  | Age                                          |
| gender        | ENUM('Male', 'Female', 'Other'), Optional      | Gender                                       |
| created_at    | TIMESTAMP, Default: Current Timestamp          | Record creation timestamp                    |

---

## 3. `vehicles` Table

| Field Name     | Data Type                                      | Description                                  |
|----------------|------------------------------------------------|----------------------------------------------|
| id             | INT, Primary Key, Auto Increment               | Unique ID for each vehicle                   |
| user_id        | INT, Not Null, Foreign Key to `users(id)`      | Linked user ID                               |
| vehicle_type   | ENUM('Two Wheeler', 'Four Wheeler'), Not Null  | Type of vehicle                              |
| vehicle_name   | VARCHAR(100), Not Null                         | Vehicle name (e.g., 'Honda Activa')          |
| vehicle_number | VARCHAR(20), Not Null                          | Vehicle registration number                  |
| created_at     | TIMESTAMP, Default: Current Timestamp          | Record creation timestamp                    |

---

## 4. `notices` Table

| Field Name   | Data Type                                      | Description                                  |
|--------------|------------------------------------------------|----------------------------------------------|
| id           | INT, Primary Key, Auto Increment               | Unique ID for each notice                    |
| user_id      | INT, Not Null, Foreign Key to `users(id)`      | Linked admin user ID                         |
| title        | VARCHAR(255), Not Null                         | Notice title                                 |
| description  | TEXT, Not Null                                 | Notice description                           |
| created_at   | TIMESTAMP, Default: Current Timestamp          | Notice creation timestamp                    |

---

## 5. `complaints` Table

| Field Name   | Data Type                                                | Description                                  |
|--------------|----------------------------------------------------------|----------------------------------------------|
| id           | INT, Primary Key, Auto Increment                         | Unique ID for each complaint                 |
| user_id      | INT, Not Null, Foreign Key to `users(id)`                | Linked user ID                               |
| title        | VARCHAR(255), Not Null                                   | Complaint title                              |
| description  | TEXT, Not Null                                           | Complaint details                            |
| status       | ENUM('pending', 'in_progress', 'resolved'), Default: 'pending' | Status of complaint                      |
| created_at   | TIMESTAMP, Default: Current Timestamp                    | Complaint creation timestamp                 |
| updated_at   | TIMESTAMP, Auto-updates when row is changed              | Last updated time                            |

