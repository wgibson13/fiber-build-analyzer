/**
 * IRR solver functions (reused from irrModel.ts)
 */
function npv(cashFlows: number[], rate: number): number {
  let sum = 0;
  for (let i = 0; i < cashFlows.length; i++) {
    sum += cashFlows[i] / Math.pow(1 + rate, i);
  }
  return sum;
}

function npvDerivative(cashFlows: number[], rate: number): number {
  let sum = 0;
  for (let i = 0; i < cashFlows.length; i++) {
    sum -= (i * cashFlows[i]) / Math.pow(1 + rate, i + 1);
  }
  return sum;
}

function solveIrrBisection(cashFlows: number[]): number | null {
  const maxIterations = 100;
  const tolerance = 1e-6;
  
  let low = -0.99;
  let high = 10;
  
  const npvLow = npv(cashFlows, low);
  const npvHigh = npv(cashFlows, high);
  
  if ((npvLow > 0 && npvHigh > 0) || (npvLow < 0 && npvHigh < 0)) {
    return null;
  }
  
  if (npvLow > 0) {
    return null;
  }
  
  for (let i = 0; i < maxIterations; i++) {
    const mid = (low + high) / 2;
    const npvMid = npv(cashFlows, mid);
    
    if (Math.abs(npvMid) < tolerance) {
      return mid;
    }
    
    if (npvMid > 0) {
      high = mid;
    } else {
      low = mid;
    }
    
    if (Math.abs(high - low) < tolerance) {
      return (low + high) / 2;
    }
  }
  
  return null;
}

function solveIrr(cashFlows: number[]): number | null {
  const maxIterations = 100;
  const tolerance = 1e-6;
  
  let rate = 0.1;
  
  const npvAtZero = npv(cashFlows, 0);
  const npvAtHigh = npv(cashFlows, 10);
  
  if ((npvAtZero > 0 && npvAtHigh > 0) || (npvAtZero < 0 && npvAtHigh < 0)) {
    return null;
  }
  
  if (npvAtZero < 0) {
    rate = -0.5;
  }
  
  for (let i = 0; i < maxIterations; i++) {
    const npvValue = npv(cashFlows, rate);
    const derivative = npvDerivative(cashFlows, rate);
    
    if (Math.abs(derivative) < 1e-10) {
      return solveIrrBisection(cashFlows);
    }
    
    const newRate = rate - npvValue / derivative;
    
    if (Math.abs(newRate - rate) < tolerance) {
      return newRate;
    }
    
    if (Math.abs(newRate) > 10 || isNaN(newRate) || !isFinite(newRate)) {
      return solveIrrBisection(cashFlows);
    }
    
    rate = newRate;
  }
  
  return solveIrrBisection(cashFlows);
}

/**
 * Bulk MDU Deal Input
 */
export type BulkDealInput = {
  propertyName: string;
  units: number;
  constructionType: 'greenfield' | 'brownfield';
  termYears: number;
  bulkRatePerUnit: number;
  buildCostPerUnit: number;
  cpeCostPerUnit: number;
  installCostPerUnit: number;
  doorFeePerUnit: number;
  supportOpexPerUnitPerMonth: number;
  transportOpexPerMonth: number;
  daBulkFeePerUnitPerMonth: number;
  discountRate: number;
};

/**
 * Bulk MDU Deal Result
 */
export type BulkDealResult = {
  capexPerUnit: number;
  totalCapex: number;
  grossRevenuePerMonth: number;
  daPaymentPerMonth: number;
  supportOpexPerMonth: number;
  transportOpexPerMonth: number;
  totalOpexPerMonth: number;
  netCashFlowPerMonth: number;
  netCashFlowPerYear: number;
  paybackYears: number;
  ocfYield: number;
  irr: number | null;
  irrWithoutDA: number | null; // IRR excluding DA payment (treating DA as loan payment)
};

/**
 * Calculate bulk MDU deal economics
 */
export function analyzeBulkDeal(input: BulkDealInput): BulkDealResult {
  // CapEx calculations
  const capexPerUnit =
    input.buildCostPerUnit +
    input.cpeCostPerUnit +
    input.installCostPerUnit +
    input.doorFeePerUnit;
  
  const totalCapex = input.units * capexPerUnit;
  
  // Monthly revenue
  const grossRevenuePerMonth = input.units * input.bulkRatePerUnit;
  
  // DA payment (flat, v1)
  const daPaymentPerMonth = input.units * input.daBulkFeePerUnitPerMonth;
  
  // Opex
  const supportOpexPerMonth = input.units * input.supportOpexPerUnitPerMonth;
  const transportOpexPerMonth = input.transportOpexPerMonth;
  const totalOpexPerMonth = supportOpexPerMonth + transportOpexPerMonth;
  
  // Net cash flow
  const netCashFlowPerMonth =
    grossRevenuePerMonth - daPaymentPerMonth - totalOpexPerMonth;
  const netCashFlowPerYear = netCashFlowPerMonth * 12;
  
  // Payback & Yield
  const paybackYears = totalCapex / netCashFlowPerYear;
  const ocfYield = netCashFlowPerYear / totalCapex;
  
  // IRR with DA payment: Year 0 = -totalCapex, Years 1..termYears = +netCashFlowPerYear
  const cashFlows: number[] = [-totalCapex];
  for (let year = 1; year <= input.termYears; year++) {
    cashFlows.push(netCashFlowPerYear);
  }
  const irr = solveIrr(cashFlows);
  
  // IRR without DA payment: treat DA payment as loan payment, exclude from cash flow
  const netCashFlowPerMonthWithoutDA = grossRevenuePerMonth - totalOpexPerMonth;
  const netCashFlowPerYearWithoutDA = netCashFlowPerMonthWithoutDA * 12;
  const cashFlowsWithoutDA: number[] = [-totalCapex];
  for (let year = 1; year <= input.termYears; year++) {
    cashFlowsWithoutDA.push(netCashFlowPerYearWithoutDA);
  }
  const irrWithoutDA = solveIrr(cashFlowsWithoutDA);
  
  return {
    capexPerUnit,
    totalCapex,
    grossRevenuePerMonth,
    daPaymentPerMonth,
    supportOpexPerMonth,
    transportOpexPerMonth,
    totalOpexPerMonth,
    netCashFlowPerMonth,
    netCashFlowPerYear,
    paybackYears,
    ocfYield,
    irr,
    irrWithoutDA,
  };
}


