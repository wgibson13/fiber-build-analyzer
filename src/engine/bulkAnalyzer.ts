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
  irr: number | null; // IRR from DA perspective (revenue - opex, excluding DA payment)
  sprocketIrr: number | null; // Sprocket's internal IRR (revenue - DA payment - opex)
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
  
  // Base DA payment per month (before waterfall)
  const baseDaPaymentPerMonth = input.units * input.daBulkFeePerUnitPerMonth;
  
  // Opex
  const supportOpexPerMonth = input.units * input.supportOpexPerUnitPerMonth;
  const transportOpexPerMonth = input.transportOpexPerMonth;
  const totalOpexPerMonth = supportOpexPerMonth + transportOpexPerMonth;
  
  // DA Waterfall: Calculate year-by-year cash flows to track MOIC thresholds
  // DA invests totalCapex, receives payments until reaching MOIC thresholds
  // 2.0x MOIC: payment reduces to 50%
  // 2.5x MOIC: payment reduces to 25%
  // 3.0x MOIC: payment reduces to 0% (DA fully paid back)
  const daInvestment = totalCapex;
  const moic2x = daInvestment * 2.0;
  const moic2_5x = daInvestment * 2.5;
  const moic3x = daInvestment * 3.0;
  
  let cumulativeDaReceived = 0;
  const cashFlowsDA: number[] = [-daInvestment]; // Year 0: DA invests
  const cashFlowsSprocket: number[] = [-totalCapex]; // Year 0: Sprocket invests (or receives from DA)
  
  // Calculate year-by-year with waterfall
  for (let year = 1; year <= input.termYears; year++) {
    let daPaymentThisYear = 0;
    const monthsInYear = 12;
    
    for (let month = 1; month <= monthsInYear; month++) {
      // Determine DA payment rate based on cumulative MOIC
      let daPaymentRate = 1.0; // 100% of base payment
      
      if (cumulativeDaReceived >= moic3x) {
        daPaymentRate = 0.0; // 0% after 3.0x MOIC
      } else if (cumulativeDaReceived >= moic2_5x) {
        daPaymentRate = 0.25; // 25% after 2.5x MOIC
      } else if (cumulativeDaReceived >= moic2x) {
        daPaymentRate = 0.5; // 50% after 2.0x MOIC
      }
      
      const daPaymentThisMonth = baseDaPaymentPerMonth * daPaymentRate;
      daPaymentThisYear += daPaymentThisMonth;
      cumulativeDaReceived += daPaymentThisMonth;
    }
    
    // DA cash flow: receives payment (positive)
    cashFlowsDA.push(daPaymentThisYear);
    
    // Sprocket cash flow: revenue - DA payment - opex
    const sprocketNetCashFlowThisYear = (grossRevenuePerMonth - totalOpexPerMonth) * 12 - daPaymentThisYear;
    cashFlowsSprocket.push(sprocketNetCashFlowThisYear);
  }
  
  // Calculate average DA payment per month (for display)
  const totalDaPayments = cashFlowsDA.slice(1).reduce((sum, cf) => sum + cf, 0);
  const averageDaPaymentPerMonth = totalDaPayments / (input.termYears * 12);
  
  // Average net cash flow for Sprocket (for display)
  const totalSprocketCashFlow = cashFlowsSprocket.slice(1).reduce((sum, cf) => sum + cf, 0);
  const averageNetCashFlowPerYear = totalSprocketCashFlow / input.termYears;
  const averageNetCashFlowPerMonth = averageNetCashFlowPerYear / 12;
  
  // Payback & Yield (using average cash flows)
  const paybackYears = averageNetCashFlowPerYear > 0 ? totalCapex / averageNetCashFlowPerYear : Infinity;
  const ocfYield = totalCapex > 0 ? averageNetCashFlowPerYear / totalCapex : 0;
  
  // IRR from DA perspective: Year 0 = -totalCapex, Years 1..termYears = DA payments received
  const irr = solveIrr(cashFlowsDA);
  
  // Sprocket's internal IRR: Year 0 = -totalCapex, Years 1..termYears = revenue - DA payment - opex
  const sprocketIrr = solveIrr(cashFlowsSprocket);
  
  return {
    capexPerUnit,
    totalCapex,
    grossRevenuePerMonth,
    daPaymentPerMonth: averageDaPaymentPerMonth, // Average DA payment per month (with waterfall)
    supportOpexPerMonth,
    transportOpexPerMonth,
    totalOpexPerMonth,
    netCashFlowPerMonth: averageNetCashFlowPerMonth, // Average net cash flow per month (with waterfall)
    netCashFlowPerYear: averageNetCashFlowPerYear, // Average net cash flow per year (with waterfall)
    paybackYears,
    ocfYield,
    irr,
    sprocketIrr,
  };
}


