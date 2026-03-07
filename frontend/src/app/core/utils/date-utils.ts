/**
 * Calculate the current age in years from a date of birth.
 * @param dob - Date of birth as a string (ISO format) or Date object
 * @returns Calculated age in years, or null if input is invalid
 */
export function calculateAge(
  dob: string | Date | null | undefined,
): number | null {
  if (!dob) return null;
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

/**
 * Format a date string or Date object to YYYY-MM-DD for HTML date inputs.
 */
export function formatDateForInput(
  date: string | Date | null | undefined,
): string {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}
