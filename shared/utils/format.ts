/** 1540 → «15,40» */
export function formatPrice(kop: number) {
  return (kop / 100).toFixed(2).replace('.', ',')
}

/** 450 → «0,45» (килограммы) */
export function formatWeightKg(grams: number) {
  return (grams / 1000).toFixed(2).replace('.', ',')
}

/** «15,40» или «15.4» → 1540. Пустая строка или мусор → null */
export function parsePriceToKop(value: string) {
  const normalized = value.trim().replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null
  return Math.round(Number(normalized) * 100)
}

/** «0,45» → 450 (граммы). Пустая строка → 0, мусор → null */
export function parseWeightToGrams(value: string) {
  const normalized = value.trim().replace(',', '.')
  if (normalized === '') return 0
  if (!/^\d+(\.\d{1,3})?$/.test(normalized)) return null
  return Math.round(Number(normalized) * 1000)
}
