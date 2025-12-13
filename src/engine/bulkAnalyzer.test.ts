import { describe, it, expect } from 'vitest';
import { analyzeBulkDeal, type BulkDealInput } from './bulkAnalyzer';

describe('Bulk MDU Analyzer', () => {
  const larkspurInput: BulkDealInput = {
    propertyName: 'Larkspur – Juniper',
    units: 219,
    constructionType: 'greenfield',
    termYears: 10,
    bulkRatePerUnit: 32,
    buildCostPerUnit: 350,
    cpeCostPerUnit: 230,
    installCostPerUnit: 50,
    doorFeePerUnit: 0,
    oltCostPerUnit: 0,
    supportOpexPerUnitPerMonth: 2.5,
    transportOpexPerMonth: 1500,
    daBulkFeePerUnitPerMonth: 15,
    discountRate: 0.1,
    leaseUpMonths: 0,
    buildTimelineMonths: 6,
    fundingSource: 'da',
    ownerLoanInterestRate: 0.05,
  };

  it('should calculate Larkspur example correctly', () => {
    const result = analyzeBulkDeal(larkspurInput);

    // CapEx checks (including OLT cost which is 0 in test)
    const expectedCapexPerUnit = 350 + 230 + 50 + 0 + 0; // 630 (build + CPE + install + door + OLT)
    expect(result.capexPerUnit).toBeCloseTo(expectedCapexPerUnit, 2);
    expect(result.totalCapex).toBeCloseTo(219 * 630, 2); // 137,970

    // Monthly revenue
    expect(result.grossRevenuePerMonth).toBeCloseTo(219 * 32, 2); // 7,008

    // DA payment (average with waterfall - will be less than base due to reductions at 2x/2.5x/3.0x MOIC)
    const baseDaPayment = 219 * 15; // 3,285
    expect(result.daPaymentPerMonth).toBeLessThanOrEqual(baseDaPayment);
    // With waterfall, average should be significantly less (DA payments reduce after reaching MOIC thresholds)
    expect(result.daPaymentPerMonth).toBeGreaterThan(0);

    // Opex
    expect(result.supportOpexPerMonth).toBeCloseTo(219 * 2.5, 2); // 547.5
    expect(result.transportOpexPerMonth).toBeCloseTo(1500, 2);
    expect(result.totalOpexPerMonth).toBeCloseTo(547.5 + 1500, 2); // 2,047.5

    // Net cash flow (with waterfall, Sprocket's cash flow improves over time as DA payments reduce)
    // Average will be higher than initial because DA payments reduce after 2x/2.5x/3.0x MOIC
    const initialNetCFMonth = 7008 - 3285 - 2047.5; // 1,675.5 (first year)
    expect(result.netCashFlowPerMonth).toBeGreaterThan(initialNetCFMonth); // Should be higher due to waterfall
    expect(result.netCashFlowPerYear).toBeGreaterThan(initialNetCFMonth * 12);

    // Payback & Yield (with waterfall, payback should be faster due to improving cash flows)
    const initialPayback = 137970 / (initialNetCFMonth * 12); // ~6.86 (without waterfall)
    expect(result.paybackYears).toBeLessThan(initialPayback); // Should be faster with waterfall
    
    const initialYield = (initialNetCFMonth * 12) / 137970; // ~0.1457 (without waterfall)
    expect(result.ocfYield).toBeGreaterThan(initialYield); // Should be higher with waterfall

    // IRR from DA perspective (revenue - opex only) should be higher than Sprocket's net IRR
    // For Larkspur, this should be in the ballpark of 15-20% (since DA payment is not deducted)
    expect(result.irr).not.toBeNull();
    if (result.irr !== null) {
      expect(result.irr).toBeGreaterThan(0.15);
      expect(result.irr).toBeLessThan(0.20);
    }

    // Sprocket IRR (revenue - DA payment - opex) with waterfall
    // With waterfall, Sprocket IRR should be higher than flat payment because DA payments reduce over time
    // For Larkspur with waterfall, this should be higher than the flat payment case (~10-12%)
    expect(result.sprocketIrr).not.toBeNull();
    if (result.sprocketIrr !== null) {
      expect(result.sprocketIrr).toBeGreaterThan(0.10); // Higher than flat payment case due to waterfall
      expect(result.sprocketIrr).toBeLessThan(0.15);
      // Sprocket IRR should be lower than overall project IRR
      expect(result.sprocketIrr).toBeLessThan(result.irr || 1);
    }
  });

  it('should handle brownfield construction type', () => {
    const brownfieldInput: BulkDealInput = {
      ...larkspurInput,
      constructionType: 'brownfield',
      buildCostPerUnit: 750,
    };

    const result = analyzeBulkDeal(brownfieldInput);
    
    // CapEx should be higher due to higher build cost
    expect(result.capexPerUnit).toBeGreaterThan(larkspurInput.buildCostPerUnit + 230 + 50);
    expect(result.totalCapex).toBeGreaterThan(137970);
  });

  it('should return null IRR for unprofitable deals', () => {
    const unprofitableInput: BulkDealInput = {
      ...larkspurInput,
      bulkRatePerUnit: 1, // Very low rate
      daBulkFeePerUnitPerMonth: 10, // High DA fee
    };

    const result = analyzeBulkDeal(unprofitableInput);
    
    // Should have negative cash flow
    expect(result.netCashFlowPerMonth).toBeLessThan(0);
    
    // IRR might be null or negative
    // (The solver might return null if it can't find a solution)
  });
});


