import type { FinanceSnapshot, Market, Money } from "@luxury/db";

function money(amount: number, currency: Money["currency"]): Money {
  return { amount: Math.round(amount * 100) / 100, currency };
}

export function calculateProfit(input: {
  sku: string;
  market: Market;
  revenue: Money;
  cost: Money;
  platformFeePercent: number;
  shippingCost: Money;
  refundReservePercent?: number;
  fxRateToGbp?: number;
}): FinanceSnapshot {
  const platformFee = money(input.revenue.amount * input.platformFeePercent, input.revenue.currency);
  const refundReserve = money(input.revenue.amount * (input.refundReservePercent ?? 0.03), input.revenue.currency);
  const estimatedProfit = money(
    input.revenue.amount - input.cost.amount - platformFee.amount - input.shippingCost.amount - refundReserve.amount,
    input.revenue.currency
  );
  const roiPercent = input.cost.amount === 0 ? 0 : Math.round((estimatedProfit.amount / input.cost.amount) * 10000) / 100;

  return {
    sku: input.sku,
    market: input.market,
    revenue: input.revenue,
    cost: input.cost,
    platformFee,
    shippingCost: input.shippingCost,
    refundReserve,
    fxRateToGbp: input.fxRateToGbp,
    estimatedProfit,
    roiPercent
  };
}
