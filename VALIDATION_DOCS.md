# Nivasa Society Management - Validation Documentation

## Overview

This document contains all validation rules for the Nivasa Society Management System. It covers all validations for
Insert, Update, and Delete operations across the application.

## Table of Contents

1. [Auth Validation](#auth-validation)
2. [Vehicle Validation](#vehicle-validation)
3. [Notice Validation](#notice-validation)
4. [Complaint Validation](#complaint-validation)
5. [Family Member Validation](#family-member-validation)
6. [Admin Validation](#admin-validation)
7. [Other Validations](#other-validations)

---

## Auth Validation

### Registration Validation

- **Full Name**
    - Required: Yes
    - Type: String
    - Min Length: 2 characters
    - Max Length: 100 characters
    - Validation: No special characters restrictions

- **Email**
    - Required: Yes
    - Type: String
    - Format: Valid email format
    - Validation: Uses common email validator

- **Password**
    - Required: Yes
    - Type: String
    - Min Length: 6 characters

- **Phone Number**
    - Required: Yes
    - Type: String
    - Format: Exactly 10 digits
    - Validation: Only numeric characters

- **Resident Type**
    - Required: Yes
    - Type: String
    - Format: Must be either "Owner" or "Tenant"

- **Wing**
    - Required: No
    - Type: String
    - Format: Single letter from A to F (case-insensitive)
    - Validation: Must match format /^[A-F]$/

- **Flat Number**
    - Required: No
    - Type: String
    - Format: Floor (1-14) + Flat (01-04) like "101", "502", "1404"
    - Validation: Must match format /^([1-9]|1[0-4])(0[1-4])$/

- **Age**
    - Required: No
    - Type: Number
    - Range: 18-120 years (only adults can register)

- **Gender**
    - Required: No
    - Type: String
    - Values: "Male", "Female", "Other"

### Login Validation

- **Email**
    - Required: Yes
    - Type: String
    - Format: Valid email format
    - Validation: Uses common email validator

- **Password**
    - Required: Yes
    - Type: String
    - Validation: Not empty

---

## Vehicle Validation

### Vehicle Creation/Update Validation

- **Vehicle Type**
    - Required: Yes
    - Type: String
    - Case-insensitive: Yes (accepts "car", "Car", "CAR", etc.)
    - Values: "Car", "Bike", "EV", "Truck", "Bus"

- **Vehicle Name**
    - Required: Yes
    - Type: String
    - Min Length: 2 characters
    - Max Length: 50 characters

- **Vehicle Model**
    - Required: Yes
    - Type: String
    - Min Length: 1 character
    - Max Length: 50 characters

- **Vehicle Color**
    - Required: Yes
    - Type: String
    - Min Length: 1 character
    - Max Length: 30 characters

- **Vehicle Number**
    - Required: Yes
    - Type: String
    - Format: Indian registration number format
    - Max Length: 20 characters
    - Validation: Must match /^[A-Z]{2}\\d{2}[A-Z]{1,2}\\d{4}$/i (e.g., MH04AB1234)

- **Parking Slot** (Optional)
    - Type: String
    - Format: Wing-ParkingSpace-ParkType (e.g., A-503-P1)
    - Validation: Must match /^[A-F]-([1-9]|1[0-9])[1-9]-P[1-2]$/

---

## Notice Validation

### Notice Creation/Update Validation

- **Title**
    - Required: Yes
    - Type: String
    - Min Length: 5 characters
    - Max Length: 255 characters

- **Description**
    - Required: Yes
    - Type: String
    - Min Length: 10 characters

- **Priority** (Optional)
    - Type: String
    - Values: "low", "medium", "high"

- **Category** (Optional)
    - Type: String
    - Values: "general", "maintenance", "security", "event", "payment", "other"

### Notice Retrieval Validation

- **Page** (Optional)
    - Type: Number
    - Min Value: 1
    - Default: 1

- **Limit** (Optional)
    - Type: Number
    - Min Value: 1, Max Value: 100
    - Default: 10

- **Category** (Optional)
    - Type: String
    - Format: Same as creation validation

- **Priority** (Optional)
    - Type: String
    - Format: Same as creation validation

- **Search** (Optional)
    - Type: String
    - Validation: Will search in title and description

---

## Complaint Validation

### Complaint Creation/Update Validation

- **Title**
    - Required: Yes
    - Type: String
    - Min Length: 5 characters
    - Max Length: 255 characters

- **Description**
    - Required: Yes
    - Type: String
    - Min Length: 10 characters

- **Category**
    - Required: Yes
    - Type: String
    - Values: "plumbing", "electrical", "security", "maintenance", "noise", "parking", "cleaning", "other"

- **Priority** (Optional)
    - Type: String
    - Values: "low", "medium", "high", "urgent"

### Complaint Retrieval Validation

- **Page** (Optional)
    - Type: Number
    - Min Value: 1
    - Default: 1

- **Limit** (Optional)
    - Type: Number
    - Min Value: 1, Max Value: 100
    - Default: 10

- **Status** (Optional)
    - Type: String
    - Values: "Open", "In Progress", "Resolved", "Closed"

- **Category** (Optional)
    - Type: String
    - Format: Same as creation validation

- **Search** (Optional)
    - Type: String
    - Validation: Will search in title and description

---

## Family Member Validation

### Family Member Creation/Update Validation

- **Full Name**
    - Required: Yes
    - Type: String
    - Min Length: 2 characters
    - Max Length: 100 characters

- **Relation**
    - Required: Yes
    - Type: String
    - Min Length: 2 characters
    - Max Length: 50 characters

- **Phone** (Optional)
    - Type: String
    - Format: Exactly 10 digits
    - Validation: Only numeric characters

- **Email** (Optional)
    - Type: String
    - Format: Valid email format
    - Validation: Uses common email validator

- **Age** (Optional)
    - Type: Number
    - Range: 0-120 years

- **Gender** (Optional)
    - Type: String
    - Values: "Male", "Female", "Other"

---

## Admin Validation

### Resident Status Update Validation

- **User ID**
    - Required: Yes
    - Type: MongoDB ObjectId
    - Validation: Must be a valid MongoDB ObjectId

- **Status**
    - Required: Yes
    - Type: String
    - Values: "approved", "rejected", "pending"

### Complaint Status Update Validation

- **Complaint ID**
    - Required: Yes
    - Type: MongoDB ObjectId
    - Validation: Must be a valid MongoDB ObjectId

- **Status**
    - Required: Yes
    - Type: String
    - Values: "open", "in_progress", "resolved", "closed"

- **Admin Response** (Optional)
    - Type: String
    - Validation: Required when status is "in_progress" or "resolved"

### Vehicle Status Update Validation

- **Vehicle ID**
    - Required: Yes
    - Type: MongoDB ObjectId
    - Validation: Must be a valid MongoDB ObjectId

- **Status**
    - Required: Yes
    - Type: String
    - Values: "approved", "rejected"

---

## Other Validations

### Object ID Validation

- **Pattern**: Used across all endpoints that require MongoDB ObjectIds
- **Validation**: Must be a valid 24-character hexadecimal string

### Pagination Validation

- **Page**
    - Type: Number
    - Min Value: 1
    - Default: 1

- **Limit**
    - Type: Number
    - Min Value: 1
    - Max Value: 100 (for security)
    - Default: 10

### File Upload Validation

- **Profile Photos**:
    - Format: image/jpeg, image/jpg, image/png
    - Size Limit: Configurable (default 10MB)
    - Field Name: "profilePhoto"

- **Notice Attachments**:
    - Format: image/jpeg, image/jpg, image/png, application/pdf
    - Size Limit: Configurable (default 10MB)
    - Field Name: "noticeAttachment"

- **Complaint Attachments**:
    - Format: image/jpeg, image/jpg, image/png, application/pdf
    - Size Limit: Configurable (default 10MB)
    - Field Name: "complaintAttachment"

### Database Constraints

- **Unique Constraints**:
    - Email: Per-user (no duplicates allowed)
    - Vehicle Number: Per-user (each user can't register same vehicle number twice)
    - Parking Slot: Global (each parking slot can only be assigned to one vehicle)

---

## Validation Middleware Patterns

### Common Error Handling

- All validation errors return HTTP 400 status code
- Response format: `{ success: false, message: 'Validation failed', errors: [...] }`
- Field-specific error messages are provided for each validation failure

### Required vs Optional Fields

- Required fields will have explicit "Required" notation
- Optional fields are marked as "(Optional)"
- Some fields may be conditionally required based on other field values

---

## Notes

- All validation occurs on the backend before data processing
- Frontend uses same validation rules for better UX
- File size limits are configurable via environment variables
- Regex patterns are case-sensitive unless noted otherwise