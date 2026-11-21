export function formatPrice(value: number): string {
  return `${Math.round(value).toLocaleString('ru-RU').replace(/,/g, ' ')} ₸`;
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
