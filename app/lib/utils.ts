import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateUUID() {
  return crypto.randomUUID();
}

export function formatSize(bytes: number) {
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function parseAIResponse<T>(response: string): T {
  try {
    // 1. Check for standard markdown code blocks
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1]) as T;
    }
    
    // 2. Fallback to extracting anything between the first and last brace/bracket
    const firstBrace = response.indexOf('{');
    const firstBracket = response.indexOf('[');
    const lastBrace = response.lastIndexOf('}');
    const lastBracket = response.lastIndexOf(']');

    const first = (firstBrace !== -1 && firstBracket !== -1) ? Math.min(firstBrace, firstBracket) : Math.max(firstBrace, firstBracket);
    const last = (lastBrace !== -1 && lastBracket !== -1) ? Math.max(lastBrace, lastBracket) : Math.max(lastBrace, lastBracket);

    if (first !== -1 && last !== -1 && last > first) {
      const extracted = response.substring(first, last + 1);
      return JSON.parse(extracted) as T;
    }

    // 3. Final fallback, try to parse raw string
    return JSON.parse(response) as T;
  } catch (error) {
    console.error("Failed to parse AI response. Raw string:", response);
    throw new Error("Failed to parse AI response. The model did not return valid JSON.");
  }
}

/**
 * Executes a promise-returning function with exponential backoff retry logic.
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 500
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (error) {
      attempt++;
      if (attempt > maxRetries) {
        throw error;
      }
      
      const delayMs = baseDelayMs * Math.pow(2, attempt - 1);
      console.warn(`Operation failed, retrying in ${delayMs}ms (Attempt ${attempt}/${maxRetries})...`, error);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

/**
 * Returns a human-readable display name for the user, falling back safely without exposing internal IDs.
 */
export function getUserDisplayName(user: PuterUser | null | undefined): string {
  if (!user) return "Account";
  
  if (user.email) {
    const emailName = user.email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').trim();
    if (emailName) return emailName;
  }
  
  return "Account";
}

/**
 * Returns a safe initial for the user's avatar.
 */
export function getUserInitial(user: PuterUser | null | undefined): string {
  const name = getUserDisplayName(user);
  if (name === "Account") return "U";
  return name.charAt(0).toUpperCase();
}
