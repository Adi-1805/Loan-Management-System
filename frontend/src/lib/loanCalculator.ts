export const calculateSimpleInterest = (
  principal: number,
  ratePercent: number,
  tenureDays: number
): number => {
  return (principal * ratePercent * tenureDays) / (365 * 100);
};

export const calculateTotalRepayment = (
  principal: number,
  simpleInterest: number
): number => {
  return principal + simpleInterest;
};

export const roundCurrency = (value: number): number => {
  return Math.round(value * 100) / 100;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};
