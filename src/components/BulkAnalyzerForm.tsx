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
  const selectClasses =
    'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm';

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

        {/* Lease Up (only for greenfield) */}
        {input.constructionType === 'greenfield' && (
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Lease Up Period (months)
            </label>
            <select
              value={input.leaseUpMonths}
              onChange={(e) =>
                handleChange('leaseUpMonths', parseInt(e.target.value) || 0)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value={0}>No lease up discount</option>
              <option value={3}>3 months</option>
              <option value={6}>6 months</option>
              <option value={9}>9 months</option>
              <option value={12}>12 months</option>
              <option value={15}>15 months</option>
              <option value={18}>18 months</option>
              <option value={21}>21 months</option>
              <option value={24}>24 months</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Revenue ramps up linearly from 0% to 100% over the lease up period
            </p>
          </div>
        )}

        {/* Term Years */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Term (Years)
          </label>
          <select
            value={input.termYears}
            onChange={(e) => handleChange('termYears', parseInt(e.target.value) || 10)}
            className={selectClasses}
          >
            <option value={5}>5 years</option>
            <option value={7}>7 years</option>
            <option value={10}>10 years</option>
            <option value={15}>15 years</option>
            <option value={20}>20 years</option>
          </select>
        </div>

        <div className="pt-2 border-t border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Pricing</h3>

          {/* Bulk Rate */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Bulk Rate per Unit ($/month)
            </label>
            <select
              value={input.bulkRatePerUnit}
              onChange={(e) => handleChange('bulkRatePerUnit', parseFloat(e.target.value) || 0)}
              className={selectClasses}
            >
              <option value={0}>Select rate...</option>
              {Array.from({ length: 51 }, (_, i) => i + 10).map((rate) => (
                <option key={rate} value={rate}>
                  ${rate}/month
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-3">CapEx (per unit)</h3>

          {/* Build Cost */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Build Cost per Unit ($)
            </label>
            <select
              value={input.buildCostPerUnit}
              onChange={(e) => handleChange('buildCostPerUnit', parseFloat(e.target.value) || 0)}
              className={selectClasses}
            >
              {input.constructionType === 'greenfield' ? (
                <>
                  <option value={300}>$300</option>
                  <option value={325}>$325</option>
                  <option value={350}>$350</option>
                  <option value={375}>$375</option>
                  <option value={400}>$400</option>
                  <option value={450}>$450</option>
                  <option value={500}>$500</option>
                </>
              ) : (
                <>
                  <option value={600}>$600</option>
                  <option value={650}>$650</option>
                  <option value={700}>$700</option>
                  <option value={750}>$750</option>
                  <option value={800}>$800</option>
                  <option value={850}>$850</option>
                  <option value={900}>$900</option>
                </>
              )}
            </select>
          </div>

          {/* CPE Cost */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              CPE Cost per Unit ($)
            </label>
            <select
              value={input.cpeCostPerUnit}
              onChange={(e) => handleChange('cpeCostPerUnit', parseFloat(e.target.value) || 0)}
              className={selectClasses}
            >
              <option value={200}>$200</option>
              <option value={220}>$220</option>
              <option value={230}>$230</option>
              <option value={240}>$240</option>
              <option value={250}>$250</option>
              <option value={275}>$275</option>
              <option value={300}>$300</option>
            </select>
          </div>

          {/* Install Cost */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Install Cost per Unit ($)
            </label>
            <select
              value={input.installCostPerUnit}
              onChange={(e) => handleChange('installCostPerUnit', parseFloat(e.target.value) || 0)}
              className={selectClasses}
            >
              <option value={40}>$40</option>
              <option value={45}>$45</option>
              <option value={50}>$50</option>
              <option value={55}>$55</option>
              <option value={60}>$60</option>
              <option value={75}>$75</option>
              <option value={100}>$100</option>
            </select>
          </div>

          {/* Door Fee */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Door Fee per Unit ($)
            </label>
            <select
              value={input.doorFeePerUnit}
              onChange={(e) => handleChange('doorFeePerUnit', parseFloat(e.target.value) || 0)}
              className={selectClasses}
            >
              <option value={0}>$0</option>
              <option value={25}>$25</option>
              <option value={50}>$50</option>
              <option value={75}>$75</option>
              <option value={100}>$100</option>
              <option value={150}>$150</option>
              <option value={200}>$200</option>
            </select>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Opex</h3>

          {/* Support Opex */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Support Opex per Unit per Month ($)
            </label>
            <select
              value={input.supportOpexPerUnitPerMonth}
              onChange={(e) => handleChange('supportOpexPerUnitPerMonth', parseFloat(e.target.value) || 0)}
              className={selectClasses}
            >
              <option value={2.0}>$2.00</option>
              <option value={2.25}>$2.25</option>
              <option value={2.5}>$2.50</option>
              <option value={2.75}>$2.75</option>
              <option value={3.0}>$3.00</option>
              <option value={3.5}>$3.50</option>
              <option value={4.0}>$4.00</option>
            </select>
          </div>

          {/* Transport Opex */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Transport Opex per Month ($)
            </label>
            <select
              value={input.transportOpexPerMonth}
              onChange={(e) => handleChange('transportOpexPerMonth', parseFloat(e.target.value) || 0)}
              className={selectClasses}
            >
              {Array.from({ length: 16 }, (_, i) => (i + 5) * 100).map((amount) => (
                <option key={amount} value={amount}>
                  ${amount.toLocaleString()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-200">
          <h3 className="text-base font-semibold text-gray-900 mb-3">DA Economics</h3>

          {/* DA Bulk Fee */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-1">
              DA Bulk Fee per Unit per Month ($)
            </label>
            <select
              value={input.daBulkFeePerUnitPerMonth}
              onChange={(e) => handleChange('daBulkFeePerUnitPerMonth', parseFloat(e.target.value) || 0)}
              className={selectClasses}
            >
              <option value={12}>$12</option>
              <option value={13}>$13</option>
              <option value={15}>$15</option>
              <option value={17}>$17</option>
              <option value={18}>$18</option>
              <option value={20}>$20</option>
              <option value={22}>$22</option>
              <option value={25}>$25</option>
            </select>
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
            <select
              value={input.discountRate}
              onChange={(e) => handleChange('discountRate', parseFloat(e.target.value) || 0.1)}
              className={selectClasses}
            >
              <option value={0.08}>8%</option>
              <option value={0.09}>9%</option>
              <option value={0.10}>10%</option>
              <option value={0.11}>11%</option>
              <option value={0.12}>12%</option>
            </select>
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



