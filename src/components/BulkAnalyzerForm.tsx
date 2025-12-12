import type { BulkDealInput } from '../engine/bulkAnalyzer';

interface BulkAnalyzerFormProps {
  input: BulkDealInput;
  onChange: (input: BulkDealInput) => void;
  onRunAnalysis: () => void;
}

export function BulkAnalyzerForm({
  input,
  onChange,
  onRunAnalysis,
}: BulkAnalyzerFormProps) {
  const handleChange = <K extends keyof BulkDealInput>(
    field: K,
    value: BulkDealInput[K]
  ) => {
    onChange({ ...input, [field]: value });
  };

  const inputClasses =
    'w-full px-3 py-2 text-right font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm';

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          Deal Inputs
        </h2>
      </div>

      <div className="space-y-4">
        {/* Property Name */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Property Name
          </label>
          <input
            type="text"
            value={input.propertyName}
            onChange={(e) => handleChange('propertyName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="e.g., Larkspur – Juniper"
          />
        </div>

        {/* Units */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Units <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={input.units}
            onChange={(e) => handleChange('units', parseInt(e.target.value) || 0)}
            className={inputClasses}
            required
          />
        </div>

        {/* Construction Type */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Construction Type
          </label>
          <select
            value={input.constructionType}
            onChange={(e) =>
              handleChange('constructionType', e.target.value as 'greenfield' | 'brownfield')
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="greenfield">Greenfield</option>
            <option value="brownfield">Brownfield</option>
          </select>
          {input.constructionType === 'greenfield' && (
            <p className="text-xs text-gray-500 mt-1">Default build cost: $350/unit</p>
          )}
          {input.constructionType === 'brownfield' && (
            <p className="text-xs text-gray-500 mt-1">Default build cost: $750/unit</p>
          )}
        </div>

        {/* Term Years */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Term (Years)
          </label>
          <input
            type="number"
            value={input.termYears}
            onChange={(e) => handleChange('termYears', parseInt(e.target.value) || 10)}
            className={inputClasses}
            min="1"
          />
        </div>

        <div className="pt-2 border-t border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Pricing</h3>

          {/* Bulk Rate */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Bulk Rate per Unit ($/month)
            </label>
            <input
              type="number"
              step="0.01"
              value={input.bulkRatePerUnit}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || val === '-') {
                  handleChange('bulkRatePerUnit', 0);
                } else {
                  const num = parseFloat(val);
                  handleChange('bulkRatePerUnit', isNaN(num) ? 0 : num);
                }
              }}
              className={inputClasses}
            />
          </div>
        </div>

        <div className="pt-2 border-t border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-3">CapEx (per unit)</h3>

          {/* Build Cost */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Build Cost per Unit ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={input.buildCostPerUnit}
              onChange={(e) =>
                handleChange('buildCostPerUnit', parseFloat(e.target.value) || 0)
              }
              className={inputClasses}
            />
          </div>

          {/* CPE Cost */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              CPE Cost per Unit ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={input.cpeCostPerUnit}
              onChange={(e) =>
                handleChange('cpeCostPerUnit', parseFloat(e.target.value) || 0)
              }
              className={inputClasses}
            />
          </div>

          {/* Install Cost */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Install Cost per Unit ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={input.installCostPerUnit}
              onChange={(e) =>
                handleChange('installCostPerUnit', parseFloat(e.target.value) || 0)
              }
              className={inputClasses}
            />
          </div>

          {/* Door Fee */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Door Fee per Unit ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={input.doorFeePerUnit}
              onChange={(e) =>
                handleChange('doorFeePerUnit', parseFloat(e.target.value) || 0)
              }
              className={inputClasses}
            />
          </div>
        </div>

        <div className="pt-2 border-t border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Opex</h3>

          {/* Support Opex */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Support Opex per Unit per Month ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={input.supportOpexPerUnitPerMonth}
              onChange={(e) =>
                handleChange(
                  'supportOpexPerUnitPerMonth',
                  parseFloat(e.target.value) || 0
                )
              }
              className={inputClasses}
            />
          </div>

          {/* Transport Opex */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Transport Opex per Month ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={input.transportOpexPerMonth}
              onChange={(e) =>
                handleChange('transportOpexPerMonth', parseFloat(e.target.value) || 0)
              }
              className={inputClasses}
            />
          </div>
        </div>

        <div className="pt-2 border-t border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-3">DA Economics</h3>

          {/* DA Bulk Fee */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              DA Bulk Fee per Unit per Month ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={input.daBulkFeePerUnitPerMonth}
              onChange={(e) =>
                handleChange(
                  'daBulkFeePerUnitPerMonth',
                  parseFloat(e.target.value) || 0
                )
              }
              className={inputClasses}
            />
          </div>
        </div>

        <div className="pt-2 border-t border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            Financial Parameters
          </h3>

          {/* Discount Rate */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Discount Rate (reference only, v1)
            </label>
            <input
              type="number"
              step="0.01"
              value={input.discountRate}
              onChange={(e) =>
                handleChange('discountRate', parseFloat(e.target.value) || 0.1)
              }
              className={inputClasses}
            />
          </div>
        </div>

        <button
          onClick={onRunAnalysis}
          className="w-full mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Run Analysis
        </button>
      </div>
    </div>
  );
}



