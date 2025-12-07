import { useState } from 'react';
import InputsPanel from './components/InputsPanel';
import GlengarryGrid from './components/GlengarryGrid';
import type { IrrInputs } from './lib/irrModel';

type BaseInputs = Omit<IrrInputs, 'costPerPassing' | 'steadyStatePenetration'>;

export interface UiInputs extends BaseInputs {
  newDropConstruction: number;   // e.g. 200
  newInstallLabor: number;       // e.g. 100
  newCpeCost: number;            // e.g. 200

  churnInstallLabor: number;     // e.g. 100
  churnCpeCost: number;          // e.g. 200
}

const defaultInputs: UiInputs = {
  arpu: 70,
  grossMargin: 0.8,
  dropCostPerSub: 600,  // Will be computed from components (250 + 150 + 200)
  churnRate: 0.02,
  reinstallCostPerChurn: 200,  // Will be computed from components (150 + 50)
  exitMultiple: 12,
  horizonYears: 10,
  rampYear1Factor: 0.4,
  rampYear2Factor: 0.7,
  newDropConstruction: 250,
  newInstallLabor: 150,
  newCpeCost: 200,
  churnInstallLabor: 150,
  churnCpeCost: 50,
};

function App() {
  const [uiInputs, setUiInputs] = useState<UiInputs>(defaultInputs);

  // Compute aggregated values for the IRR model
  const {
    newDropConstruction,
    newInstallLabor,
    newCpeCost,
    churnInstallLabor,
    churnCpeCost,
    ...rest
  } = uiInputs;

  const baseInputs: BaseInputs = {
    ...rest,
    dropCostPerSub: newDropConstruction + newInstallLabor + newCpeCost,
    reinstallCostPerChurn: churnInstallLabor + churnCpeCost,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Fiber Build IRR Analyzer
          </h1>
          <p className="text-gray-600">
            Evaluate fiber build economics by cost and penetration.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <InputsPanel value={uiInputs} onChange={setUiInputs} />
          <div className="lg:col-span-2">
            <GlengarryGrid baseInputs={baseInputs} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
