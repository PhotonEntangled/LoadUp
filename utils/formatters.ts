/**
 * Formats a Unix millisecond timestamp into a locale-specific time string.
 * Handles null or undefined inputs gracefully.
 * 
 * @param ms - The timestamp in milliseconds UTC.
 * @returns Formatted time string (e.g., "10:35:12 AM") or "N/A".
 */
export const formatTimestamp = (ms: number | null | undefined): string => {
  if (ms === null || ms === undefined) {
    return 'N/A';
  }
  try {
    // Basic locale time string. Consider adding date part if needed.
    return new Date(ms).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  } catch (error) {
    console.error("Error formatting timestamp:", ms, error);
    return 'Invalid Date';
  }
};

/**
 * Formats speed from meters per second to kilometers per hour.
 * Handles null or undefined inputs gracefully.
 * 
 * @param metersPerSecond - The speed in m/s.
 * @returns Formatted speed string (e.g., "54.3 km/h") or "N/A".
 */
export const formatSpeed = (metersPerSecond: number | null | undefined): string => {
  if (metersPerSecond === null || metersPerSecond === undefined) {
    return 'N/A';
  }
  if (typeof metersPerSecond !== 'number' || !isFinite(metersPerSecond)) {
    console.warn("Invalid input for formatSpeed:", metersPerSecond);
    return 'N/A';
  }
  try {
    const kmPerHour = metersPerSecond * 3.6;
    // Adjust precision or unit (e.g., mph) as needed
    return `${kmPerHour.toFixed(1)} km/h`;
  } catch (error) {
    console.error("Error formatting speed:", metersPerSecond, error);
    return 'Invalid Speed';
  }
}; 