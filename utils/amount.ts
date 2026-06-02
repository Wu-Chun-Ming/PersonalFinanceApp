export const formatAmount = (amount: number) => {
  const abs = Math.abs(amount);

  if (abs >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`;
  }

  if (abs >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}k`;
  }

  return `${amount.toFixed(1)}`;
};
