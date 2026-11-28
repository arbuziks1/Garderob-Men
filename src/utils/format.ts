export function formatPrice(value: number): string {
  return `${Math.round(value).toLocaleString('ru-RU').replace(/,/g, ' ')} ₸`;
}

/** Standard Russian mod-10/mod-100 pluralization: picks forms[0] for one-like counts
 *  (1, 21, 31…), forms[1] for few-like counts (2-4, 22-24…), forms[2] otherwise. */
export function pluralizeRu(count: number, forms: [string, string, string]): string {
  const n = Math.abs(count) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return forms[2];
  if (n1 > 1 && n1 < 5) return forms[1];
  if (n1 === 1) return forms[0];
  return forms[2];
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
