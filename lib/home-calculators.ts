/** Planning calculations only; inputs are assumptions rather than lender quotes. */
export function monthlyPayment(price: number, down: number, annualRate: number, years: number) {
  if (![price, down, annualRate, years].every(Number.isFinite) || price < 0 || down < 0 || down > price || annualRate < 0 || years <= 0) return null;
  const principal = price - down, months = years * 12, rate = annualRate / 1200;
  // This form avoids overflow for long terms and handles a zero-rate loan.
  const monthly = rate === 0 ? principal / months : principal * rate / (1 - (1 + rate) ** -months);
  return {principal, monthly, interest: Math.max(0, monthly * months - principal)};
}

export function netRentalYield(price: number, extras: number, rent: number | null, expenses: number) {
  if (rent === null || ![price, extras, rent, expenses].every(Number.isFinite) || price + extras <= 0 || price < 0 || extras < 0 || rent < 0 || expenses < 0) return null;
  return (rent * 12 - expenses) / (price + extras) * 100;
}
