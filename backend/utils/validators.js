const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Validates an email address according to standard email format
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validateEmail = (email) => {
    return emailRegex.test(email);
};

/**
 * Validates a common email format like abc@gmail.com or admin@nivasa.com
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validateCommonEmail = (email) => {
    return emailRegex.test(email);
};

module.exports = {
    validateEmail,
    validateCommonEmail
};