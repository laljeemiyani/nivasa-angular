/**
 * Validates an email address according to standard email format
 * @param email - The email address to validate
 * @returns - True if valid, false otherwise
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Validates a common email format like abc@gmail.com or admin@nivasa.com
 * @param email - The email address to validate
 * @returns - True if valid, false otherwise
 */
export const validateCommonEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};
