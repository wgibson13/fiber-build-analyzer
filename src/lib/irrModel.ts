export interface IrrInputs {
  costPerPassing: number;        // network capex per passing, excluding drop
  steadyStatePenetration: number; // decimal, e.g. 0.35
  arpu: number;                  // monthly ARPU in $
  grossMargin: number;           // decimal, e.g. 0.8
  dropCostPerSub: number;        // full drop capex per new connected home
  churnRate: number;             // annual churn (decimal), e.g. 0.03
  reinstallCostPerChurn: number; // cost per churned/returned sub
  exitMultiple: number;          // EBITDA multiple at exit
  horizonYears: number;          // e.g. 7
  rampYear1Factor: number;       // fraction of steady-state penetration in year 1, e.g. 0.4
  rampYear2Factor: number;       // fraction of steady-state penetration in year 2, e.g. 0.7
}

export interface IrrResult {
  irr: number | null;    // decimal, e.g. 0.23 for 23%
  cashFlows: number[];   // year 0..N
}

/**
 * Calculate Net Present Value for a given discount rate
 */
function npv(cashFlows: number[], rate: number): number {
  let sum = 0;
  for (let i = 0; i < cashFlows.length; i++) {
    sum += cashFlows[i] / Math.pow(1 + rate, i);
  }
  return sum;
}

/**
 * Calculate the derivative of NPV with respect to the discount rate
 */
function npvDerivative(cashFlows: number[], rate: number): number {
  let sum = 0;
  for (let i = 0; i < cashFlows.length; i++) {
    sum -= (i * cashFlows[i]) / Math.pow(1 + rate, i + 1);
  }
  return sum;
}

/**
 * Solve for IRR using Newton-Raphson method
 */
function solveIrr(cashFlows: number[]): number | null {
  const maxIterations = 100;
  const tolerance = 1e-6;
  
  // Initial guess: try a few starting points
  let rate = 0.1; // Start with 10%
  
  // Check if NPV ever crosses zero
  const npvAtZero = npv(cashFlows, 0);
  const npvAtHigh = npv(cashFlows, 10); // Check at 1000%
  
  // If both are positive or both are negative, no solution
  if ((npvAtZero > 0 && npvAtHigh > 0) || (npvAtZero < 0 && npvAtHigh < 0)) {
    return null;
  }
  
  // If NPV at zero is negative, try negative rates (though rare)
  if (npvAtZero < 0) {
    rate = -0.5;
  }
  
  for (let i = 0; i < maxIterations; i++) {
    const npvValue = npv(cashFlows, rate);
    const derivative = npvDerivative(cashFlows, rate);
    
    // If derivative is zero or very small, we can't continue
    if (Math.abs(derivative) < 1e-10) {
      // Try bisection as fallback
      return solveIrrBisection(cashFlows);
    }
    
    // Newton-Raphson: x_new = x_old - f(x) / f'(x)
    const newRate = rate - npvValue / derivative;
    
    // Check convergence
    if (Math.abs(newRate - rate) < tolerance) {
      return newRate;
    }
    
    // Prevent divergence: if rate goes too extreme, try bisection
    if (Math.abs(newRate) > 10 || isNaN(newRate) || !isFinite(newRate)) {
      return solveIrrBisection(cashFlows);
    }
    
    rate = newRate;
  }
  
  // If we didn't converge, try bisection
  return solveIrrBisection(cashFlows);
}

/**
 * Solve for IRR using bisection method (fallback)
 */
function solveIrrBisection(cashFlows: number[]): number | null {
  const maxIterations = 100;
  const tolerance = 1e-6;
  
  let low = -0.99; // Can't go below -100% (would cause division issues)
  let high = 10;   // Try up to 1000%
  
  // Check bounds
  const npvLow = npv(cashFlows, low);
  const npvHigh = npv(cashFlows, high);
  
  // If both are same sign, no solution
  if ((npvLow > 0 && npvHigh > 0) || (npvLow < 0 && npvHigh < 0)) {
    return null;
  }
  
  // If low bound is positive, we need to go lower (but can't)
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

export function computeIrr(inputs: IrrInputs): IrrResult {
  // Up-front capex (Year 0) per passing
  const initialCapex = inputs.costPerPassing + inputs.dropCostPerSub * inputs.steadyStatePenetration;
  
  // Annual revenue per subscriber
  const revPerSubYear = inputs.arpu * 12;
  
  // Annual EBITDA per subscriber
  const ebitdaPerSubYear = revPerSubYear * inputs.grossMargin;
  
  // Build cash flows array
  const cashFlows: number[] = [];
  
  // Year 0: negative initial capex
  cashFlows[0] = -initialCapex;
  
  // Years 1 through horizonYears
  for (let year = 1; year <= inputs.horizonYears; year++) {
    // Determine penetration for this year
    let penetration: number;
    if (year === 1) {
      penetration = inputs.steadyStatePenetration * inputs.rampYear1Factor;
    } else if (year === 2) {
      penetration = inputs.steadyStatePenetration * inputs.rampYear2Factor;
    } else {
      penetration = inputs.steadyStatePenetration;
    }
    
    // Annual EBITDA per passing (before churn reinstall cost)
    const ebitdaYear = ebitdaPerSubYear * penetration;
    
    // Churn reinstall cost per passing per year
    const churnCostYear = inputs.churnRate * inputs.reinstallCostPerChurn * penetration;
    
    // Net cash flow per year
    let cfYear = ebitdaYear - churnCostYear;
    
    // Add exit value to the final year
    if (year === inputs.horizonYears) {
      // Use steady-state penetration for exit calculation
      const ebitdaExit = ebitdaPerSubYear * inputs.steadyStatePenetration 
        - inputs.churnRate * inputs.reinstallCostPerChurn * inputs.steadyStatePenetration;
      const exitValue = ebitdaExit * inputs.exitMultiple;
      cfYear += exitValue;
    }
    
    cashFlows[year] = cfYear;
  }
  
  // Solve for IRR
  const irr = solveIrr(cashFlows);
  
  return {
    irr,
    cashFlows,
  };
}

