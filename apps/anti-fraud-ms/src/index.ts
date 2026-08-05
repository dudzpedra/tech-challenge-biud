export const evaluateTransaction = (value: number) => ({
  approved: value <= 1000,
  reason: value > 1000 ? "value above allowed threshold" : "value accepted",
  value,
});
