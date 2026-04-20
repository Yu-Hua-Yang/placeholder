/** Strip XML/HTML tags and truncate to maxLength */
export function sanitizeUserInput(input: string, maxLength: number): string {
  return input
    .slice(0, maxLength)
    .replace(/<[^>]*>/g, "")
    .trim();
}

const VALID_GENDERS = new Set(["men", "women", "unisex", "male", "female", ""]);

/** Validate gender against allow-list, returns empty string if invalid */
export function sanitizeGender(gender: unknown): string {
  if (typeof gender !== "string") return "";
  const normalized = gender.toLowerCase().trim();
  return VALID_GENDERS.has(normalized) ? normalized : "";
}
