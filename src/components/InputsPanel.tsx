import type { UiInputs } from '../App';
import { fmtCurrency, fmtPct } from '../lib/format';

interface InputsPanelProps {
  value: UiInputs;
  onChange: (value: UiInputs) => void;
}

function InputsPanel({ value, onChange }: InputsPanelProps) {
  const handleChange = (field: keyof UiInputs, newValue: number) => {
    onChange({ ...value, [field]: newValue });
  };

  // Generate ARPU options: 10, 15, 20, ... 100
  const arpuOptions = Array.from({ length: 19 }, (_, i) => (i + 2) * 5);

  // Generate Gross Margin options: 0.10, 0.15, ... 1.00
  const grossMarginOptions = Array.from({ length: 19 }, (_, i) => (i + 2) * 0.05);

  // Generate Churn Rate options: 0.005, 0.01, 0.015, ... 0.10
  const churnRateOptions = Array.from({ length: 20 }, (_, i) => (i + 1) * 0.005);

  // Exit Multiple options: 5-20
  const exitMultipleOptions = Array.from({ length: 16 }, (_, i) => i + 5);

  // Horizon Years options: 3-15
  const horizonYearsOptions = Array.from({ length: 13 }, (_, i) => i + 3);

  // Ramp Year 1 Factor options: 0.1, 0.2, ... 0.8
  const rampYear1FactorOptions = Array.from({ length: 8 }, (_, i) => (i + 1) * 0.1);

  // Ramp Year 2 Factor options: 0.2, 0.4, 0.6, 0.7, 0.8, 0.9
  const rampYear2FactorOptions = [0.2, 0.4, 0.6, 0.7, 0.8, 0.9];

  // Minimum IRR options: 0.05, 0.06, ... 0.30 (5% to 30% in 1% increments)
  const minimumIrrOptions = Array.from({ length: 26 }, (_, i) => (i + 5) * 0.01);

  // Drop Construction options: 0, 50, 100, ... 2000 (increments of 50)
  const dropConstructionOptions = Array.from({ length: 41 }, (_, i) => i * 50);

  // Install Labor options: 0, 25, 50, ... 500 (increments of 25)
  const installLaborOptions = Array.from({ length: 21 }, (_, i) => i * 25);

  // CPE Cost options: 0, 25, 50, ... 500 (increments of 25)
  const cpeCostOptions = Array.from({ length: 21 }, (_, i) => i * 25);

  // Reinstall Labor options: 0, 25, 50, ... 500 (increments of 25)
  const reinstallLaborOptions = Array.from({ length: 21 }, (_, i) => i * 25);

  const inputBaseClasses = "w-full sm:w-32 px-3 py-2 text-right font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base";
  const readOnlyClasses = "w-full sm:w-32 px-3 py-2 text-right font-mono bg-gray-50 border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base";

  // Calculate totals
  const totalNewInstallCost = value.newDropConstruction + value.newInstallLabor + value.newCpeCost;
  const totalReinstallCost = value.churnInstallLabor + value.churnCpeCost;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Assumptions: Economics */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Assumptions</h2>
        <div className="space-y-3 sm:space-y-5">
          {/* ARPU */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm sm:text-base font-bold text-gray-700 flex-shrink-0 mr-2 sm:mr-4">
                ARPU ($/month)
              </label>
              <select
                value={value.arpu}
                onChange={(e) => handleChange('arpu', parseFloat(e.target.value))}
                className={inputBaseClasses}
              >
                {arpuOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {fmtCurrency(opt)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Gross Margin */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm sm:text-base font-bold text-gray-700 flex-shrink-0 mr-2 sm:mr-4">
                Gross Margin
              </label>
              <select
                value={value.grossMargin}
                onChange={(e) => handleChange('grossMargin', parseFloat(e.target.value))}
                className={inputBaseClasses}
              >
                {grossMarginOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {fmtPct(opt)}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-500 ml-auto text-right w-full sm:w-32">EBITDA margin</p>
          </div>

          {/* Churn Rate */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm sm:text-base font-bold text-gray-700 flex-shrink-0 mr-2 sm:mr-4">
                Churn Rate
              </label>
              <select
                value={value.churnRate}
                onChange={(e) => handleChange('churnRate', parseFloat(e.target.value))}
                className={inputBaseClasses}
              >
                {churnRateOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {fmtPct(opt)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Exit Multiple */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm sm:text-base font-bold text-gray-700 flex-shrink-0 mr-2 sm:mr-4">
                Exit Multiple
              </label>
              <select
                value={value.exitMultiple}
                onChange={(e) => handleChange('exitMultiple', parseFloat(e.target.value))}
                className={inputBaseClasses}
              >
                {exitMultipleOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Horizon Years */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm sm:text-base font-bold text-gray-700 flex-shrink-0 mr-2 sm:mr-4">
                Horizon Years
              </label>
              <select
                value={value.horizonYears}
                onChange={(e) => handleChange('horizonYears', parseFloat(e.target.value))}
                className={inputBaseClasses}
              >
                {horizonYearsOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Minimum IRR */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm sm:text-base font-bold text-gray-700 flex-shrink-0 mr-2 sm:mr-4">
                Minimum IRR %
              </label>
              <select
                value={value.minimumIrr}
                onChange={(e) => handleChange('minimumIrr', parseFloat(e.target.value))}
                className={inputBaseClasses}
              >
                {minimumIrrOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {fmtPct(opt)}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-500 ml-auto text-right w-full sm:w-32">Minimum approval threshold</p>
          </div>

          {/* Ramp Year 1 Factor */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm sm:text-base font-bold text-gray-700 flex-shrink-0 mr-2 sm:mr-4">
                Ramp Year 1 Factor
              </label>
              <select
                value={value.rampYear1Factor}
                onChange={(e) => handleChange('rampYear1Factor', parseFloat(e.target.value))}
                className={inputBaseClasses}
              >
                {rampYear1FactorOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {fmtPct(opt)}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-500 ml-auto text-right w-full sm:w-32">Used in ramp to stabilization</p>
          </div>

          {/* Ramp Year 2 Factor */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm sm:text-base font-bold text-gray-700 flex-shrink-0 mr-2 sm:mr-4">
                Ramp Year 2 Factor
              </label>
              <select
                value={value.rampYear2Factor}
                onChange={(e) => handleChange('rampYear2Factor', parseFloat(e.target.value))}
                className={inputBaseClasses}
              >
                {rampYear2FactorOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {fmtPct(opt)}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-500 ml-auto text-right w-full sm:w-32">Used in ramp to stabilization</p>
          </div>
        </div>
      </div>

      {/* New Install Cost Breakdown */}
      <div className="pt-3 sm:pt-4 border-t border-gray-200">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">New Install Cost Breakdown</h3>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm sm:text-base font-bold text-gray-700 flex-shrink-0 mr-2 sm:mr-4">
                Drop Construction ($)
              </label>
              <select
                value={value.newDropConstruction}
                onChange={(e) => handleChange('newDropConstruction', parseFloat(e.target.value))}
                className={inputBaseClasses}
              >
                {dropConstructionOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {fmtCurrency(opt)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm sm:text-base font-bold text-gray-700 flex-shrink-0 mr-2 sm:mr-4">
                Install Labor ($)
              </label>
              <select
                value={value.newInstallLabor}
                onChange={(e) => handleChange('newInstallLabor', parseFloat(e.target.value))}
                className={inputBaseClasses}
              >
                {installLaborOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {fmtCurrency(opt)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm sm:text-base font-bold text-gray-700 flex-shrink-0 mr-2 sm:mr-4">
                CPE / Equipment ($)
              </label>
              <select
                value={value.newCpeCost}
                onChange={(e) => handleChange('newCpeCost', parseFloat(e.target.value))}
                className={inputBaseClasses}
              >
                {cpeCostOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {fmtCurrency(opt)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Read-only total */}
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <label className="text-sm sm:text-base font-semibold text-gray-700 flex-shrink-0 mr-2 sm:mr-4">
                Total New Install Cost per Sub ($)
              </label>
              <div className={readOnlyClasses}>
                {fmtCurrency(totalNewInstallCost)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Churn Reinstall Cost Breakdown */}
      <div className="pt-3 sm:pt-4 border-t border-gray-200">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Churn Reinstall Cost Breakdown</h3>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm sm:text-base font-bold text-gray-700 flex-shrink-0 mr-2 sm:mr-4">
                Reinstall Labor ($)
              </label>
              <select
                value={value.churnInstallLabor}
                onChange={(e) => handleChange('churnInstallLabor', parseFloat(e.target.value))}
                className={inputBaseClasses}
              >
                {reinstallLaborOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {fmtCurrency(opt)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm sm:text-base font-bold text-gray-700 flex-shrink-0 mr-2 sm:mr-4">
                Redeploy CPE ($)
              </label>
              <select
                value={value.churnCpeCost}
                onChange={(e) => handleChange('churnCpeCost', parseFloat(e.target.value))}
                className={inputBaseClasses}
              >
                {cpeCostOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {fmtCurrency(opt)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Read-only total */}
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <label className="text-sm sm:text-base font-semibold text-gray-700 flex-shrink-0 mr-2 sm:mr-4">
                Total Reinstall Cost per Churn ($)
              </label>
              <div className={readOnlyClasses}>
                {fmtCurrency(totalReinstallCost)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InputsPanel;
