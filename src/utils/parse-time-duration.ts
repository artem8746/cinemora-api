/**
 * Parses a time duration string to milliseconds
 * @param duration - Time duration string (e.g., "15m", "1h", "7d")
 * @returns Duration in milliseconds
 * @throws Error if the format is invalid
 * @example
 * ```ts
 * parseTimeDurationToMs("15m") // 900000
 * parseTimeDurationToMs("1h")  // 3600000
 * parseTimeDurationToMs("7d")  // 604800000
 * ```
 */
export function parseTimeDurationToMs(duration: string): number {
  const timeDurationPattern = /^(\d+)([smhd])$/i;
  const match = duration.match(timeDurationPattern);

  if (!match) {
    throw new Error(
      `Invalid time duration format: "${duration}". Expected format: number followed by s (seconds), m (minutes), h (hours), or d (days). Example: "15m", "1h", "7d"`,
    );
  }

  const value = Number.parseInt(match[1] ?? '0', 10);
  const unit = (match[2] ?? '').toLowerCase();

  const multipliers: Record<string, number> = {
    s: 1000, // seconds to milliseconds
    m: 60 * 1000, // minutes to milliseconds
    h: 60 * 60 * 1000, // hours to milliseconds
    d: 24 * 60 * 60 * 1000, // days to milliseconds
  };

  const multiplier = multipliers[unit];

  if (!multiplier) {
    throw new Error(
      `Invalid time unit: "${unit}". Supported units: s (seconds), m (minutes), h (hours), d (days)`,
    );
  }

  return value * multiplier;
}

/**
 * Parses a time duration string to seconds
 * @param duration - Time duration string (e.g., "15m", "1h", "7d")
 * @returns Duration in seconds
 * @throws Error if the format is invalid
 * @example
 * ```ts
 * parseTimeDurationToSeconds("15m") // 900
 * parseTimeDurationToSeconds("1h")  // 3600
 * parseTimeDurationToSeconds("7d")  // 604800
 * ```
 */
export function parseTimeDurationToSeconds(duration: string): number {
  return Math.floor(parseTimeDurationToMs(duration) / 1000);
}
