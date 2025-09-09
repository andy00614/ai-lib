/**
 * Format text with proper line breaks and spacing
 */
export function formatText(text: string): string {
  return text
    .trim()
    .replace(/\n\s*\n/g, '\n\n') // Normalize multiple line breaks
    .replace(/\s+/g, ' '); // Normalize spaces
}

/**
 * Validate JSON string
 */
export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safe JSON parse with fallback
 */
export function safeJSONParse<T = unknown>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Delay execution
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}