const {body, param, query, validationResult} = require('express-validator');
const {validateCommonEmail} = require('../utils/validators');

const SENSITIVE_LOG_FIELD_PATTERNS = [
    /password/i,
    /token/i,
    /secret/i,
    /authorization/i,
    /cookie/i,
    /email/i,
    /phone/i,
    /mobile/i,
    /otp/i,
    /code/i,
    /fullName/i,
    /wing/i,
    /flat/i,
    /unit/i,
    /address/i,
    /vehicleNumber/i,
    /parkingSlot/i
];

const isSensitiveLogField = (fieldName = '') =>
    SENSITIVE_LOG_FIELD_PATTERNS.some((pattern) => pattern.test(fieldName));

const sanitizeLogValue = (value, fieldName = '') => {
    if (value === null || value === undefined) {
        return value;
    }

    if (fieldName && isSensitiveLogField(fieldName)) {
        return '[REDACTED]';
    }

    if (Array.isArray(value)) {
        return value.map((item) => sanitizeLogValue(item, fieldName));
    }

    if (typeof value === 'object') {
        return Object.entries(value).reduce((sanitized, [key, nestedValue]) => {
            sanitized[key] = sanitizeLogValue(nestedValue, key);
            return sanitized;
        }, {});
    }

    return value;
};

const sanitizeValidationErrors = (errors) =>
    errors.map((error) => {
        const fieldName = error.path || error.param || '';

        if (!fieldName || !isSensitiveLogField(fieldName)) {
            return error;
        }

        return {
            ...error,
            value: '[REDACTED]'
        };
    });

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('=== VALIDATION FAILED ===');
        console.log('Request path:', req.originalUrl);
        console.log('Request body:', JSON.stringify(sanitizeLogValue(req.body), null, 2));
        console.log('Validation errors:', JSON.stringify(sanitizeValidationErrors(errors.array()), null, 2));
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// Custom email validation using our centralized function
const customEmailValidation = (fieldName, isRequired = true) => {
    if (isRequired) {
        return [
            body(fieldName)
                .custom((value) => {
                    if (!value) {
                        throw new Error(`${fieldName} is required`);
                    }
                    if (!validateCommonEmail(value)) {
                        throw new Error('Please provide a valid email');
                    }
                    return true;
                })
        ];
    } else {
        return [
            body(fieldName)
                .optional({checkFalsy: true})
                .custom((value) => {
                    if (!validateCommonEmail(value)) {
                        throw new Error('Please provide a valid email');
                    }
                    return true;
                })
        ];
    }
};

// User registration validation
const validateUserRegistration = [
    body('fullName')
        .trim()
        .isLength({min: 2, max: 100})
        .withMessage('Full name must be between 2 and 100 characters'),
    ...customEmailValidation('email', true), // Email is required
    body('password')
        .isLength({min: 6})
        .withMessage('Password must be at least 6 characters long'),
    body('phoneNumber')
        .matches(/^[0-9]{10}$/)
        .withMessage('Phone number must be exactly 10 digits'),
    body('residentType')
        .isIn(['Owner', 'Tenant'])
        .withMessage('Resident type must be either Owner or Tenant'),
    body('wing')
        .optional()
        .trim()
        .matches(/^[A-F]$/)
        .withMessage('Wing must be a single letter from A to F'),
    body('flatNumber')
        .optional()
        .trim()
        .matches(/^([1-9]|1[0-4])(0[1-4])$/)
        .withMessage('Flat number must be in format: 101-104, 201-204, ..., 1401-1404 (floors 1-14, flats 01-04)'),
    body('age')
        .optional({ checkFalsy: true })
        .isInt({min: 18, max: 120})
        .withMessage('Age must be between 18 and 120 years (only adults can register)'),
    body('gender')
        .optional({ checkFalsy: true })
        .isIn(['Male', 'Female', 'Other'])
        .withMessage('Gender must be Male, Female, or Other'),
    handleValidationErrors
];

// User login validation
const validateUserLogin = [
    ...customEmailValidation('email', true), // Email is required
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    handleValidationErrors
];

// Family member validation (all fields optional for partial updates)
const validateFamilyMember = [
    body('fullName')
        .optional()
        .trim()
        .isLength({min: 2, max: 100})
        .withMessage('Full name must be between 2 and 100 characters'),
    body('relation')
        .optional()                           // BUG 3 FIX: optional so PUT can update single fields
        .trim()
        .isLength({min: 2, max: 50})
        .withMessage('Relation must be between 2 and 50 characters'),
    body('phone')
        .optional()
        .matches(/^[0-9]{10}$/)
        .withMessage('Phone number must be exactly 10 digits'),
    ...customEmailValidation('email', false), // Email is optional for family members
    body('age')
        .optional()
        .isInt({min: 0, max: 120})
        .withMessage('Age must be between 0 and 120'),
    body('gender')
        .optional()
        .isIn(['Male', 'Female', 'Other'])
        .withMessage('Gender must be Male, Female, or Other'),
    handleValidationErrors
];

// Vehicle validation
const validateVehicle = [
    body('vehicleType')
        .notEmpty()
        .trim()
        .withMessage('Vehicle type is required')
        .custom((value) => {
            // BUG 1 FIX: accept both frontend formats (four_wheeler, two_wheeler)
            // and the backend enum values (CAR, BIKE, etc.)
            const validTypes = ['CAR', 'BIKE', 'EV', 'TRUCK', 'BUS',
                                'four_wheeler', 'two_wheeler', 'car', 'bike',
                                'Four Wheeler', 'Two Wheeler'];
            if (!validTypes.some(t => t.toLowerCase() === value.toLowerCase())) {
                throw new Error('Vehicle type must be one of: Car, Bike, EV, Truck, Bus');
            }
            return true;
        }),

    body('vehicleName')
        .notEmpty()
        .trim()
        .isLength({min: 2, max: 50})
        .withMessage('Vehicle name must be between 2 and 50 characters'),

    body('vehicleNumber')
        .notEmpty()
        .trim()
        .matches(/^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/i)
        .withMessage('Vehicle number must be a valid Indian registration number (e.g., KA01AB1234)')
        .isLength({max: 20})
        .withMessage('Vehicle number cannot exceed 20 characters'),

    body('vehicleModel')
        .optional()                           // BUG 1 FIX: frontend may call it 'model'
        .trim()
        .isLength({min: 1, max: 50})
        .withMessage('Vehicle model cannot exceed 50 characters'),

    body('vehicleColor')
        .optional()                           // BUG 1 FIX: frontend may call it 'color'
        .trim()
        .isLength({min: 1, max: 30})
        .withMessage('Vehicle color cannot exceed 30 characters'),

    body('parkingSlot')
        .optional()                           // not always required at create time
        .trim()
        .matches(/^[A-F]-([1-9]|1[0-4])(0[1-4])-P[1-9]$/)
        .withMessage('Parking slot must be in format A-102-P1 (wing A-F, flat 101-1404, slot P1-P9)'),

    handleValidationErrors,
];

// Notice validation
const validateNotice = [
    body('title')
        .trim()
        .isLength({min: 3, max: 255})
        .withMessage('Title must be between 3 and 255 characters'),
    body('description')
        .trim()
        .isLength({min: 5})
        .withMessage('Description must be at least 5 characters long'),
    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Priority must be low, medium, or high'),
    body('category')
        .optional()
        .isIn(['general', 'maintenance', 'security', 'event', 'payment', 'other'])
        .withMessage('Invalid category'),
    handleValidationErrors
];

// Complaint validation
const validateComplaint = [
    body('title')
        .trim()
        .isLength({min: 5, max: 255})
        .withMessage('Title must be between 5 and 255 characters'),
    body('description')
        .trim()
        .isLength({min: 10})
        .withMessage('Description must be at least 10 characters long'),
    body('category')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Complaint category is required and must be between 2 and 50 characters'),
    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Priority must be low, medium, high, or urgent'),
    handleValidationErrors
];

// MongoDB ObjectId validation
const validateObjectId = (paramName) => [
    param(paramName)
        .isMongoId()
        .withMessage(`Invalid ${paramName} ID`),
    handleValidationErrors
];

// Query validation for pagination
const validatePagination = [
    query('page')
        .optional()
        .isInt({min: 1})
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({min: 1, max: 100})
        .withMessage('Limit must be between 1 and 100'),
    handleValidationErrors
];

// Profile update validation
const validateProfileUpdate = [
    body('phoneNumber')
        .optional()
        .matches(/^[0-9]{10}$/)
        .withMessage('Phone number must be exactly 10 digits'),
    body('fullName')
        .optional()
        .trim()
        .isLength({min: 2, max: 100})
        .withMessage('Full name must be between 2 and 100 characters'),
    body('age')
        .optional()
        .isInt({min: 18, max: 120})
        .withMessage('Age must be between 18 and 120 years'),
    body('gender')
        .optional()
        .isIn(['Male', 'Female', 'Other'])
        .withMessage('Gender must be Male, Female, or Other'),
    body('wing')
        .optional()
        .trim()
        .matches(/^[A-F]$/)
        .withMessage('Wing must be a single letter from A to F'),
    body('flatNumber')
        .optional()
        .trim()
        .matches(/^([1-9]|1[0-4])(0[1-4])$/)
        .withMessage('Flat number must be in format: 101-104, 201-204, ..., 1401-1404'),
    body('residentType')
        .optional()
        .isIn(['Owner', 'Tenant'])
        .withMessage('Resident type must be either Owner or Tenant'),
    handleValidationErrors
];

module.exports = {
    handleValidationErrors,
    validateUserRegistration,
    validateUserLogin,
    validateFamilyMember,
    validateVehicle,
    validateNotice,
    validateComplaint,
    validateObjectId,
    validatePagination,
    validateProfileUpdate
};
