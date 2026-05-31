/** Simple interest: SI = (P × R × T) / (365 × 100) */
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
