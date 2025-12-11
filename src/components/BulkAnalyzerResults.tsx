import type { BulkDealResult } from '../engine/bulkAnalyzer';
import { fmtCurrency, fmtPct } from '../lib/format';

interface BulkAnalyzerResultsProps {
  result: BulkDealResult | null;
  propertyName: string;
}

export function BulkAnalyzerResults({
  result,
  propertyName,
}: BulkAnalyzerResultsProps) {
  if (!result) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Results
        </h2>
        <p className="text-gray-500">Click "Run Analysis" to see results.</p>
      </div>
    );
  }

  const rowClasses = 'border-b border-gray-200 py-2';
  const labelClasses = 'font-semibold text-gray-700';
  const valueClasses = 'text-right font-mono text-gray-900';

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
        Results: {propertyName || 'Untitled Property'}
      </h2>

      <div className="space-y-6">
        {/* CapEx Section */}
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-3">CapEx</h3>
          <table className="w-full">
            <tbody>
              <tr className={rowClasses}>
                <td className={labelClasses}>CapEx per Unit</td>
                <td className={valueClasses}>{fmtCurrency(result.capexPerUnit)}</td>
              </tr>
              <tr className={rowClasses}>
                <td className={labelClasses}>Total CapEx</td>
                <td className={valueClasses}>{fmtCurrency(result.totalCapex)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Monthly Economics */}
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            Monthly Economics
          </h3>
          <table className="w-full">
            <tbody>
              <tr className={rowClasses}>
                <td className={labelClasses}>Gross Revenue</td>
                <td className={valueClasses}>
                  {fmtCurrency(result.grossRevenuePerMonth)}
                </td>
              </tr>
              <tr className={rowClasses}>
                <td className={labelClasses}>DA Payment</td>
                <td className={valueClasses}>
                  {fmtCurrency(result.daPaymentPerMonth)}
                </td>
              </tr>
              <tr className={rowClasses}>
                <td className={labelClasses}>Support Opex</td>
                <td className={valueClasses}>
                  {fmtCurrency(result.supportOpexPerMonth)}
                </td>
              </tr>
              <tr className={rowClasses}>
                <td className={labelClasses}>Transport Opex</td>
                <td className={valueClasses}>
                  {fmtCurrency(result.transportOpexPerMonth)}
                </td>
              </tr>
              <tr className={rowClasses}>
                <td className={labelClasses}>Total Opex</td>
                <td className={valueClasses}>
                  {fmtCurrency(result.totalOpexPerMonth)}
                </td>
              </tr>
              <tr className={`${rowClasses} border-t-2 border-gray-400`}>
                <td className={`${labelClasses} font-bold`}>Net Cash Flow</td>
                <td className={`${valueClasses} font-bold`}>
                  {fmtCurrency(result.netCashFlowPerMonth)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Annual Economics */}
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            Annual Economics
          </h3>
          <table className="w-full">
            <tbody>
              <tr className={rowClasses}>
                <td className={labelClasses}>Annual Net Cash Flow</td>
                <td className={valueClasses}>
                  {fmtCurrency(result.netCashFlowPerYear)}
                </td>
              </tr>
              <tr className={rowClasses}>
                <td className={labelClasses}>Payback (years)</td>
                <td className={valueClasses}>
                  {result.paybackYears.toFixed(2)}
                </td>
              </tr>
              <tr className={rowClasses}>
                <td className={labelClasses}>OCF Yield</td>
                <td className={valueClasses}>{fmtPct(result.ocfYield)}</td>
              </tr>
              <tr className={`${rowClasses} border-t-2 border-gray-400`}>
                <td className={`${labelClasses} font-bold`}>IRR</td>
                <td className={`${valueClasses} font-bold`}>
                  {result.irr !== null ? fmtPct(result.irr) : 'N/A'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


