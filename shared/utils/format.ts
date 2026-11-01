/** 1540 → «15,40» */
export function formatPrice(kop: number) {
  return (kop / 100).toFixed(2).replace('.', ',')
}

/** 1200 → «1 200» (граммы) */
export function formatWeightG(grams: number) {
  return String(grams).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

/** «15,40» или «15.4» → 1540. Пустая строка или мусор → null */
export function parsePriceToKop(value: string) {
  const normalized = value.trim().replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null
  return Math.round(Number(normalized) * 100)
}

/** «800» → 800 (граммы). Пустая строка → 0, мусор → null */
export function parseWeightToGrams(value: string) {
  const normalized = value.trim()
  if (normalized === '') return 0
  if (!/^\d+$/.test(normalized)) return null
  return Number(normalized)
}
