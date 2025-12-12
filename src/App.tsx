import { useState } from 'react';
import { BulkAnalyzerForm } from './components/BulkAnalyzerForm';
import { BulkAnalyzerResults } from './components/BulkAnalyzerResults';
import {
  analyzeBulkDeal,
  type BulkDealInput,
  type BulkDealResult,
} from './engine/bulkAnalyzer';

const defaultInput: BulkDealInput = {
  propertyName: 'Foxfern I-30',
  units: 301,
  constructionType: 'greenfield',
  termYears: 10,
  bulkRatePerUnit: 0,
  buildCostPerUnit: 350,
  cpeCostPerUnit: 230,
  installCostPerUnit: 50,
  doorFeePerUnit: 0,
  supportOpexPerUnitPerMonth: 2.5,
  transportOpexPerMonth: 1500,
  daBulkFeePerUnitPerMonth: 15,
  discountRate: 0.1,
  leaseUpMonths: 0,
  ownerCapexPercentage: 0,
  ownerLoanInterestRate: 0.05,
};

function App() {
  const [input, setInput] = useState<BulkDealInput>(defaultInput);
  const [result, setResult] = useState<BulkDealResult | null>(null);

  const handleRunAnalysis = () => {
    if (input.units <= 0) {
      alert('Please enter a valid number of units');
      return;
    }
    const analysisResult = analyzeBulkDeal(input);
    setResult(analysisResult);
  };

  // Update build cost default when construction type changes
  const handleInputChange = (newInput: BulkDealInput) => {
    // If construction type changed, update build cost default
    if (newInput.constructionType !== input.constructionType) {
      if (newInput.constructionType === 'greenfield') {
        newInput.buildCostPerUnit = 350;
      } else {
        newInput.buildCostPerUnit = 750;
      }
    }
    setInput(newInput);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full mx-auto px-4 py-4 sm:px-6 sm:py-6 space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            EllumNet Bulk MDU Analyzer
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Internal underwriting tool for bulk MDU internet deals backed by Digital Alpha revenue share.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <BulkAnalyzerForm
            input={input}
            onChange={handleInputChange}
            onRunAnalysis={handleRunAnalysis}
          />
          <BulkAnalyzerResults result={result} propertyName={input.propertyName} />
        </div>
      </div>
    </div>
  );
}

export default App;
