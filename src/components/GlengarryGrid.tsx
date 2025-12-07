import { computeIrr, type IrrInputs } from '../lib/irrModel';
import { fmtCurrency, fmtPct } from '../lib/format';

type BaseInputs = Omit<IrrInputs, 'costPerPassing' | 'steadyStatePenetration'>;

interface GlengarryGridProps {
  baseInputs: BaseInputs;
  minimumIrr: number;
}

function GlengarryGrid({ baseInputs, minimumIrr }: GlengarryGridProps) {
  const costs = [
    300, 400, 500, 600, 700, 800, 900, 1000,
    1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800,
    1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600,
    2700, 2800, 2900, 3000,
  ];
  const penetrations = [
    0.15, 0.20, 0.25, 0.30, 0.35, 0.40,
    0.45, 0.50, 0.55, 0.60, 0.65, 0.70,
    0.75, 0.80, 0.85, 0.90, 0.95, 1.0,
  ];

  const getCellStyle = (irr: number | null): string => {
    if (irr === null) {
      return 'bg-gray-300 text-gray-600';
    }
    // Calculate borderline threshold (5% above minimum for blue zone)
    const borderlineThreshold = minimumIrr + 0.05;
    
    if (irr < minimumIrr) {
      // Below minimum - do not approve
      return 'bg-red-500 text-white';
    }
    if (irr < borderlineThreshold) {
      // At or just above minimum - borderline
      return 'bg-blue-500 text-white';
    }
    // Well above minimum - approve
    return 'bg-green-500 text-white font-semibold';
  };

  const formatIrr = (irr: number | null): string => {
    if (irr === null) {
      return '—';
    }
    return fmtPct(irr);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">IRR Analysis Grid</h2>
      
      <div className="max-h-[70vh] overflow-y-auto">
        <table className="border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 bg-gray-50 px-4 py-2"></th>
              <th
                colSpan={penetrations.length}
                className="border border-gray-300 bg-gray-50 px-4 py-2 text-center font-bold text-gray-700"
              >
                Stabilized Penetration Rate
              </th>
            </tr>
            <tr>
              <th className="border border-gray-300 bg-gray-50 px-4 py-2 text-left font-semibold text-gray-700">
                Cost per Passing
              </th>
              {penetrations.map((pen) => (
                <th
                  key={pen}
                  className="border border-gray-300 bg-gray-50 px-4 py-2 text-center font-semibold text-gray-700"
                >
                  {fmtPct(pen)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {costs.map((cost) => {
              return (
                <tr key={cost}>
                  <td className="border border-gray-300 bg-gray-50 px-3 py-2 font-semibold text-gray-700 font-mono text-right">
                    {fmtCurrency(cost)}
                  </td>
                  {penetrations.map((pen) => {
                    const inputs: IrrInputs = {
                      ...baseInputs,
                      costPerPassing: cost,
                      steadyStatePenetration: pen,
                    };
                    const result = computeIrr(inputs);
                    const cellStyle = getCellStyle(result.irr);
                    
                    return (
                      <td
                        key={`${cost}-${pen}`}
                        className={`border border-gray-300 px-3 py-2 text-right font-mono ${cellStyle}`}
                      >
                        {formatIrr(result.irr)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-wrap gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-500 rounded"></div>
          <span className="text-gray-700">
            <span className="font-semibold">Green:</span> ≥ {fmtPct(minimumIrr + 0.05)} IRR (A / Glengarry)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500 rounded"></div>
          <span className="text-gray-700">
            <span className="font-semibold">Blue:</span> {fmtPct(minimumIrr)}–{fmtPct(minimumIrr + 0.05)} IRR (Borderline)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-500 rounded"></div>
          <span className="text-gray-700">
            <span className="font-semibold">Red:</span> &lt; {fmtPct(minimumIrr)} IRR (Do Not Approve)
          </span>
        </div>
      </div>
    </div>
  );
}

export default GlengarryGrid;
