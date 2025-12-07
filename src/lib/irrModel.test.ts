import { describe, it, expect } from 'vitest';
import { computeIrr, type IrrInputs } from './irrModel';

describe('IRR Model', () => {
  const baselineInputs: IrrInputs = {
    costPerPassing: 1000,
    steadyStatePenetration: 0.35,
    arpu: 60,
    grossMargin: 0.8,
    dropCostPerSub: 500,
    churnRate: 0.03,
    reinstallCostPerChurn: 300,
    exitMultiple: 12,
    horizonYears: 7,
    rampYear1Factor: 0.4,
    rampYear2Factor: 0.7,
  };

  it('should compute IRR for baseline scenario', () => {
    const result = computeIrr(baselineInputs);
    
    // Should have valid IRR
    expect(result.irr).not.toBeNull();
    expect(result.irr).toBeGreaterThan(0);
    expect(result.irr).toBeLessThan(1); // Should be reasonable (< 100%)
    
    // Should have correct number of cash flows (year 0 + 7 years)
    expect(result.cashFlows.length).toBe(8);
    
    // Year 0 should be negative (initial investment)
    expect(result.cashFlows[0]).toBeLessThan(0);
    
    // Years 1-7 should be positive (operating cash flows)
    for (let i = 1; i <= 7; i++) {
      expect(result.cashFlows[i]).toBeGreaterThan(0);
    }
    
    // Final year should be largest (includes exit value)
    expect(result.cashFlows[7]).toBeGreaterThan(result.cashFlows[6]);
    
    // Verify initial capex calculation
    const expectedInitialCapex = 1000 + 500 * 0.35; // 1175
    expect(result.cashFlows[0]).toBeCloseTo(-expectedInitialCapex, 2);
  });

  it('should have higher IRR for cheaper build with higher penetration', () => {
    const cheapInputs: IrrInputs = {
      ...baselineInputs,
      costPerPassing: 600,        // Lower cost
      steadyStatePenetration: 0.45, // Higher penetration
      dropCostPerSub: 400,        // Lower drop cost
    };
    
    const baselineResult = computeIrr(baselineInputs);
    const cheapResult = computeIrr(cheapInputs);
    
    // Both should have valid IRRs
    expect(baselineResult.irr).not.toBeNull();
    expect(cheapResult.irr).not.toBeNull();
    
    // Cheaper build should have higher IRR
    expect(cheapResult.irr!).toBeGreaterThan(baselineResult.irr!);
    
    // Cheaper build should have lower initial investment
    expect(Math.abs(cheapResult.cashFlows[0])).toBeLessThan(Math.abs(baselineResult.cashFlows[0]));
  });

  it('should have lower or null IRR for expensive build with low penetration', () => {
    const expensiveInputs: IrrInputs = {
      ...baselineInputs,
      costPerPassing: 2000,        // Higher cost
      steadyStatePenetration: 0.15, // Lower penetration
      dropCostPerSub: 800,         // Higher drop cost
      arpu: 50,                    // Lower ARPU
      grossMargin: 0.7,            // Lower margin
    };
    
    const baselineResult = computeIrr(baselineInputs);
    const expensiveResult = computeIrr(expensiveInputs);
    
    // Baseline should have valid IRR
    expect(baselineResult.irr).not.toBeNull();
    
    // Expensive build should have lower IRR (or null if unprofitable)
    if (expensiveResult.irr !== null) {
      expect(expensiveResult.irr).toBeLessThan(baselineResult.irr!);
    }
    
    // Expensive build should have higher initial investment
    expect(Math.abs(expensiveResult.cashFlows[0])).toBeGreaterThan(Math.abs(baselineResult.cashFlows[0]));
    
    // Operating cash flows should be lower
    expect(expensiveResult.cashFlows[7]).toBeLessThan(baselineResult.cashFlows[7]);
  });

  it('should correctly calculate penetration ramp', () => {
    const result = computeIrr(baselineInputs);
    
    // Calculate expected cash flows manually to verify ramp
    const revPerSubYear = 60 * 12; // 720
    const ebitdaPerSubYear = revPerSubYear * 0.8; // 576
    
    // Year 1: 0.35 * 0.4 = 0.14 penetration
    const penetrationYear1 = 0.35 * 0.4;
    const ebitdaYear1 = ebitdaPerSubYear * penetrationYear1;
    const churnCostYear1 = 0.03 * 300 * penetrationYear1;
    const expectedCFYear1 = ebitdaYear1 - churnCostYear1;
    expect(result.cashFlows[1]).toBeCloseTo(expectedCFYear1, 2);
    
    // Year 2: 0.35 * 0.7 = 0.245 penetration
    const penetrationYear2 = 0.35 * 0.7;
    const ebitdaYear2 = ebitdaPerSubYear * penetrationYear2;
    const churnCostYear2 = 0.03 * 300 * penetrationYear2;
    const expectedCFYear2 = ebitdaYear2 - churnCostYear2;
    expect(result.cashFlows[2]).toBeCloseTo(expectedCFYear2, 2);
    
    // Year 3: 0.35 penetration (steady state)
    const penetrationYear3 = 0.35;
    const ebitdaYear3 = ebitdaPerSubYear * penetrationYear3;
    const churnCostYear3 = 0.03 * 300 * penetrationYear3;
    const expectedCFYear3 = ebitdaYear3 - churnCostYear3;
    expect(result.cashFlows[3]).toBeCloseTo(expectedCFYear3, 2);
  });

  it('should include exit value in final year', () => {
    const result = computeIrr(baselineInputs);
    
    // Calculate expected exit value
    const revPerSubYear = 60 * 12; // 720
    const ebitdaPerSubYear = revPerSubYear * 0.8; // 576
    const penetration = 0.35; // steady state
    
    const ebitdaExit = ebitdaPerSubYear * penetration - 0.03 * 300 * penetration;
    const exitValue = ebitdaExit * 12; // exitMultiple
    
    // Final year should include operating cash flow + exit value
    const operatingCF = ebitdaPerSubYear * penetration - 0.03 * 300 * penetration;
    const expectedFinalCF = operatingCF + exitValue;
    
    expect(result.cashFlows[7]).toBeCloseTo(expectedFinalCF, 2);
  });
});

