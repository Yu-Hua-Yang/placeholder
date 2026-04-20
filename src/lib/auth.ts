import { timingSafeEqual } from "crypto";

export function isAuthorized(
  header: string | null,
  secret: string | undefined,
): boolean {
  if (!header || !secret) return false;
  const expected = `Bearer ${secret}`;
  if (Buffer.byteLength(header) !== Buffer.byteLength(expected)) return false;
  return timingSafeEqual(Buffer.from(header), Buffer.from(expected));
}
