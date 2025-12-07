export function fmtCurrency(num: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

export function fmtPct(num: number): string {
  // Round to 1 decimal place and format as percentage
  const rounded = Math.round(num * 1000) / 10;
  // Remove trailing zeros and decimal point if not needed
  return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded}%`;
}

