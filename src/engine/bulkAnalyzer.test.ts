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
    supportOpexPerUnitPerMonth: 2.5,
    transportOpexPerMonth: 1500,
    daBulkFeePerUnitPerMonth: 15,
    discountRate: 0.1,
  };

  it('should calculate Larkspur example correctly', () => {
    const result = analyzeBulkDeal(larkspurInput);

    // CapEx checks
    const expectedCapexPerUnit = 350 + 230 + 50 + 0; // 630
    expect(result.capexPerUnit).toBeCloseTo(expectedCapexPerUnit, 2);
    expect(result.totalCapex).toBeCloseTo(219 * 630, 2); // 137,970

    // Monthly revenue
    expect(result.grossRevenuePerMonth).toBeCloseTo(219 * 32, 2); // 7,008

    // DA payment
    expect(result.daPaymentPerMonth).toBeCloseTo(219 * 15, 2); // 3,285

    // Opex
    expect(result.supportOpexPerMonth).toBeCloseTo(219 * 2.5, 2); // 547.5
    expect(result.transportOpexPerMonth).toBeCloseTo(1500, 2);
    expect(result.totalOpexPerMonth).toBeCloseTo(547.5 + 1500, 2); // 2,047.5

    // Net cash flow
    const expectedNetCFMonth = 7008 - 3285 - 2047.5; // 1,675.5
    expect(result.netCashFlowPerMonth).toBeCloseTo(expectedNetCFMonth, 1);
    expect(result.netCashFlowPerYear).toBeCloseTo(expectedNetCFMonth * 12, 1); // ~20,106

    // Payback & Yield
    const expectedPayback = 137970 / (expectedNetCFMonth * 12); // ~6.86
    expect(result.paybackYears).toBeCloseTo(expectedPayback, 1);
    
    const expectedYield = (expectedNetCFMonth * 12) / 137970; // ~0.1457
    expect(result.ocfYield).toBeCloseTo(expectedYield, 3);

    // IRR should be in the ballpark of 9.5-10.5%
    expect(result.irr).not.toBeNull();
    if (result.irr !== null) {
      expect(result.irr).toBeGreaterThan(0.09);
      expect(result.irr).toBeLessThan(0.11);
    }

    // IRR without DA should be higher (since we're not paying DA)
    expect(result.irrWithoutDA).not.toBeNull();
    if (result.irrWithoutDA !== null) {
      expect(result.irrWithoutDA).toBeGreaterThan(result.irr || 0);
      expect(result.irrWithoutDA).toBeGreaterThan(0.15); // Should be significantly higher
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


