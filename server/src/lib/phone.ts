/** Normalizes a Kazakhstan phone number to digits-only, with the leading "8" trunk
 *  prefix rewritten to the "7" country code — so `87011234567`, `+77011234567`, and
 *  variants typed with spaces/dashes all normalize to the same `77011234567`. Always
 *  use this before storing a phone on Customer or comparing it against Order.phone —
 *  never compare raw strings. */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('8')) return '7' + digits.slice(1);
  return digits;
}
