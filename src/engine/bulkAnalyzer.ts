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
  leaseUpMonths: number; // Lease up period (only applies to greenfield)
  fundingSource: 'da' | 'owner' | 'internal'; // Who provides the CapEx
  ownerLoanInterestRate: number; // Interest rate for owner loan calculation (only used if fundingSource is 'owner')
};

/**
 * Bulk MDU Deal Result
 */
export type BulkDealResult = {
  capexPerUnit: number;
  totalCapex: number;
  grossRevenuePerMonth: number;
  daPaymentPerMonth: number; // Average DA payment per month (with waterfall)
  daPaymentInitial: number; // Initial DA payment per month (before waterfall, $15/unit)
  supportOpexPerMonth: number;
  transportOpexPerMonth: number;
  totalOpexPerMonth: number;
  netCashFlowPerMonth: number;
  netCashFlowPerYear: number;
  paybackYears: number;
  ocfYield: number;
  irr: number | null; // IRR from DA perspective (revenue - opex, excluding DA payment)
  sprocketIrr: number | null; // Sprocket's internal IRR (revenue - DA payment - opex)
  // Year-by-year cash flows for PDF/analysis
  yearlyCashFlows: {
    year: number;
    providerCashFlow: number; // Provider perspective (revenue - DA payment - opex)
    ownerCashFlow: number; // Owner perspective (revenue - opex, no DA payment)
    daPayment: number;
  }[];
  // DA waterfall milestones
  daWaterfall: {
    moic2xMonth: number | null; // Month when 2x MOIC is reached (payment reduces to 50%)
    moic2_5xMonth: number | null; // Month when 2.5x MOIC is reached (payment reduces to 25%)
    moic3xMonth: number | null; // Month when 3.0x MOIC is reached (payment reduces to 0%)
    moic2xAmount: number; // Total amount at 2x MOIC threshold
    moic2_5xAmount: number; // Total amount at 2.5x MOIC threshold
    moic3xAmount: number; // Total amount at 3.0x MOIC threshold
  };
};

/**
 * Calculate monthly loan payment (PMT function)
 * @param principal Loan amount
 * @param annualRate Annual interest rate (as decimal, e.g., 0.05 for 5%)
 * @param termYears Loan term in years
 * @returns Monthly payment amount
 */
function calculateMonthlyPayment(principal: number, annualRate: number, termYears: number): number {
  if (principal === 0 || termYears === 0) return 0;
  
  const monthlyRate = annualRate / 12;
  const numPayments = termYears * 12;
  
  if (monthlyRate === 0) {
    // No interest, just divide principal by number of payments
    return principal / numPayments;
  }
  
  const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  return monthlyPayment;
}

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
  
  // Funding source determines CapEx provider and DA revenue share
  let rateDiscountPerUnit = 0;
  let adjustedBulkRatePerUnit = input.bulkRatePerUnit;
  let daRevenueShareEnabled = true;
  
  if (input.fundingSource === 'owner') {
    // Owner provides all CapEx - calculate rate discount based on loan payment
    const ownerCapexContribution = totalCapex; // Owner provides 100% of CapEx
    
    // Calculate monthly payment on a loan of owner's contribution at selected rate
    const monthlyLoanPayment = calculateMonthlyPayment(
      ownerCapexContribution,
      input.ownerLoanInterestRate,
      input.termYears
    );
    
    // Discount per unit per month = monthly loan payment / units
    rateDiscountPerUnit = input.units > 0 ? monthlyLoanPayment / input.units : 0;
    
    // Adjusted bulk rate = original rate - discount
    adjustedBulkRatePerUnit = Math.max(0, input.bulkRatePerUnit - rateDiscountPerUnit);
    
    // No DA revenue share since DA isn't providing capital
    daRevenueShareEnabled = false;
  } else if (input.fundingSource === 'internal') {
    // Internal funding - no rate discount, no DA revenue share
    daRevenueShareEnabled = false;
  }
  // If fundingSource is 'da', keep defaults (DA provides capital, revenue share enabled)
  
  // Monthly revenue (using adjusted rate if owner provides funding)
  const grossRevenuePerMonth = (input.units || 0) * adjustedBulkRatePerUnit;
  
  // Base DA payment per month (before waterfall) - only if DA is providing capital
  const baseDaPaymentPerMonth = daRevenueShareEnabled 
    ? input.units * input.daBulkFeePerUnitPerMonth 
    : 0;
  
  // Opex
  const supportOpexPerMonth = input.units * input.supportOpexPerUnitPerMonth;
  const transportOpexPerMonth = input.transportOpexPerMonth;
  const totalOpexPerMonth = supportOpexPerMonth + transportOpexPerMonth;
  
  // DA Waterfall: Calculate year-by-year cash flows to track MOIC thresholds
  // DA invests totalCapex (only if DA is funding source), receives payments until reaching MOIC thresholds
  // 2.0x MOIC: payment reduces to 50%
  // 2.5x MOIC: payment reduces to 25%
  // 3.0x MOIC: payment reduces to 0% (DA fully paid back)
  const daInvestment = daRevenueShareEnabled ? totalCapex : 0;
  const moic2x = daInvestment * 2.0;
  const moic2_5x = daInvestment * 2.5;
  const moic3x = daInvestment * 3.0;
  
  let cumulativeDaReceived = 0;
  const cashFlowsDA: number[] = [-daInvestment]; // Year 0: DA invests (or 0 if not DA funding)
  const cashFlowsSprocket: number[] = [-totalCapex]; // Year 0: Sprocket invests (or receives from DA/Owner/Balance Sheet)
  
  // Lease up: only applies to greenfield, linear ramp-up from 0% to 100% over lease up period
  const leaseUpMonths = input.constructionType === 'greenfield' ? (input.leaseUpMonths || 0) : 0;
  
  // Calculate year-by-year with waterfall and lease up
  let globalMonth = 0; // Track month from project start
  for (let year = 1; year <= input.termYears; year++) {
    let daPaymentThisYear = 0;
    let revenueThisYear = 0;
    const monthsInYear = 12;
    
    for (let month = 1; month <= monthsInYear; month++) {
      globalMonth++;
      
      // Lease up multiplier: linear ramp from 0% to 100% over lease up period
      let leaseUpMultiplier = 1.0;
      if (leaseUpMonths > 0 && globalMonth <= leaseUpMonths) {
        // Linear ramp: month 1 = 0%, month leaseUpMonths = 100%
        leaseUpMultiplier = globalMonth / leaseUpMonths;
      }
      
      // Revenue with lease up discount (using adjusted bulk rate if owner contributes)
      const revenueThisMonth = (input.units * adjustedBulkRatePerUnit) * leaseUpMultiplier;
      revenueThisYear += revenueThisMonth;
      
      // Determine DA payment rate based on cumulative MOIC (only if DA is providing capital)
      let daPaymentRate = daRevenueShareEnabled ? 1.0 : 0.0; // 100% of base payment if DA funding, else 0
      
      if (daRevenueShareEnabled) {
        if (cumulativeDaReceived >= moic3x) {
          daPaymentRate = 0.0; // 0% after 3.0x MOIC
        } else if (cumulativeDaReceived >= moic2_5x) {
          daPaymentRate = 0.25; // 25% after 2.5x MOIC
        } else if (cumulativeDaReceived >= moic2x) {
          daPaymentRate = 0.5; // 50% after 2.0x MOIC
        }
      }
      
      const daPaymentThisMonth = baseDaPaymentPerMonth * daPaymentRate;
      daPaymentThisYear += daPaymentThisMonth;
      cumulativeDaReceived += daPaymentThisMonth;
    }
    
    // DA cash flow: receives payment (positive)
    cashFlowsDA.push(daPaymentThisYear);
    
    // Sprocket cash flow: revenue (with lease up) - DA payment - opex
    const sprocketNetCashFlowThisYear = revenueThisYear - daPaymentThisYear - (totalOpexPerMonth * 12);
    cashFlowsSprocket.push(sprocketNetCashFlowThisYear);
  }
  
  // Calculate average DA payment per month (for display)
  const totalDaPayments = cashFlowsDA.slice(1).reduce((sum, cf) => sum + cf, 0);
  const averageDaPaymentPerMonth = totalDaPayments / (input.termYears * 12);
  
  // Track DA waterfall milestones (when MOIC thresholds are reached)
  // This needs to account for payment reductions as thresholds are reached
  let moic2xMonth: number | null = null;
  let moic2_5xMonth: number | null = null;
  let moic3xMonth: number | null = null;
  
  // Recalculate to find milestone months, accounting for payment reductions
  if (daRevenueShareEnabled) {
    let cumulativeDaReceived2 = 0;
    let globalMonth2 = 0;
    
    for (let year = 1; year <= input.termYears; year++) {
      for (let month = 1; month <= 12; month++) {
        globalMonth2++;
        
        // Determine current payment rate based on cumulative received
        let currentPaymentRate = 1.0; // 100% initially
        if (cumulativeDaReceived2 >= moic3x) {
          currentPaymentRate = 0.0; // 0% after 3.0x MOIC
        } else if (cumulativeDaReceived2 >= moic2_5x) {
          currentPaymentRate = 0.25; // 25% after 2.5x MOIC
        } else if (cumulativeDaReceived2 >= moic2x) {
          currentPaymentRate = 0.5; // 50% after 2.0x MOIC
        }
        
        const daPaymentThisMonth = baseDaPaymentPerMonth * currentPaymentRate;
        cumulativeDaReceived2 += daPaymentThisMonth;
        
        // Check milestones (only set once, when threshold is first crossed)
        if (!moic2xMonth && cumulativeDaReceived2 >= moic2x) {
          moic2xMonth = globalMonth2;
        }
        if (!moic2_5xMonth && cumulativeDaReceived2 >= moic2_5x) {
          moic2_5xMonth = globalMonth2;
        }
        if (!moic3xMonth && cumulativeDaReceived2 >= moic3x) {
          moic3xMonth = globalMonth2;
          break; // No need to continue after 3x
        }
      }
      if (moic3xMonth) break;
    }
  }
  
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
  
  // Build year-by-year cash flows for PDF/analysis using actual calculated values
  const yearlyCashFlows: {
    year: number;
    providerCashFlow: number;
    ownerCashFlow: number;
    daPayment: number;
  }[] = [];
  
  // Use the actual cash flows we calculated
  for (let year = 1; year <= input.termYears; year++) {
    const providerCF = cashFlowsSprocket[year] || 0;
    const daPayment = cashFlowsDA[year] || 0;
    // Owner cash flow = revenue - opex (no DA payment)
    // Approximate from provider CF + DA payment
    const ownerCF = providerCF + daPayment;
    
    yearlyCashFlows.push({
      year,
      providerCashFlow: providerCF,
      ownerCashFlow: ownerCF,
      daPayment,
    });
  }
  
  return {
    capexPerUnit,
    totalCapex,
    grossRevenuePerMonth,
    daPaymentPerMonth: averageDaPaymentPerMonth, // Average DA payment per month (with waterfall)
    daPaymentInitial: baseDaPaymentPerMonth, // Initial DA payment per month (before waterfall)
    supportOpexPerMonth,
    transportOpexPerMonth,
    totalOpexPerMonth,
    netCashFlowPerMonth: averageNetCashFlowPerMonth, // Average net cash flow per month (with waterfall)
    netCashFlowPerYear: averageNetCashFlowPerYear, // Average net cash flow per year (with waterfall)
    paybackYears,
    ocfYield,
    irr,
    sprocketIrr,
    yearlyCashFlows,
    daWaterfall: {
      moic2xMonth,
      moic2_5xMonth,
      moic3xMonth,
      moic2xAmount: moic2x,
      moic2_5xAmount: moic2_5x,
      moic3xAmount: moic3x,
    },
  };
}


