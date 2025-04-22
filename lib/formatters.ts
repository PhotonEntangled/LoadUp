/**
 * Formats a date string into a locale-specific date.
 * Returns 'N/A' if the date string is null or undefined.
 * @param dateString The date string to format.
 * @returns The formatted date string or 'N/A'.
 */
export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return 'N/A';
  try {
    // Handle potential invalid date strings gracefully
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleDateString();
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return 'Error';
  }
};

// Add other formatting functions here as needed (e.g., formatCurrency, formatTime) 