import type { BulkDealInput, BulkDealResult } from '../engine/bulkAnalyzer';
import { fmtCurrency, fmtPct } from '../lib/format';
import { generateProposalPDF, generateBoardApprovalPDF } from '../proposals/generateProposal';

interface BulkAnalyzerResultsProps {
  result: BulkDealResult | null;
  input: BulkDealInput;
  propertyName: string;
}

export function BulkAnalyzerResults({
  result,
  input,
  propertyName,
}: BulkAnalyzerResultsProps) {
  const handleGeneratePDF = async (includeFeatures: boolean = true) => {
    if (!result) return;
    try {
      await generateProposalPDF(input, result, includeFeatures);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const handleGenerateBoardApproval = async () => {
    if (!result) return;
    try {
      await generateBoardApprovalPDF(input, result);
    } catch (error) {
      console.error('Error generating board approval PDF:', error);
      alert('Error generating board approval PDF. Please try again.');
    }
  };

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          Results: {propertyName || 'Untitled Property'}
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleGeneratePDF(true)}
            disabled={!result}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
            title="Includes features and benefits section"
          >
            Full PDF
          </button>
          <button
            onClick={() => handleGeneratePDF(false)}
            disabled={!result}
            className="px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-xs sm:text-sm"
            title="Financial analysis only, no features section"
          >
            Financial Only
          </button>
          <button
            onClick={handleGenerateBoardApproval}
            disabled={!result}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-xs sm:text-sm"
            title="Board approval document with capital usage and DA cash flows"
          >
            Board Approval
          </button>
        </div>
      </div>

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
                <td className={labelClasses}>
                  <div className="flex items-center gap-1">
                    <span>DA Payment (Avg)</span>
                    <span
                      className="text-gray-400 cursor-help"
                      title="Average DA payment per month over the full term. Payments start at full rate and reduce at 2x, 2.5x, and 3.0x MOIC thresholds."
                    >
                      ℹ️
                    </span>
                  </div>
                </td>
                <td className={valueClasses}>
                  {fmtCurrency(result.daPaymentPerMonth)}
                </td>
              </tr>
              {input.fundingSource === 'da' && result.daPaymentInitial > 0 && (
                <tr className={rowClasses}>
                  <td className={labelClasses}>DA Payment (Initial)</td>
                  <td className={valueClasses}>
                    {fmtCurrency(result.daPaymentInitial)}
                    <span className="text-xs text-gray-500 ml-2">
                      (until 2x MOIC)
                    </span>
                  </td>
                </tr>
              )}
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
                <td className={labelClasses}>
                  <div className="flex items-center gap-1">
                    <span>OCF Yield</span>
                    <span
                      className="text-gray-400 cursor-help"
                      title="Operating Cash Flow Yield: Annual net cash flow divided by total CapEx. Shows the percentage of initial investment returned each year in cash flow. Does not account for time value of money (unlike IRR)."
                    >
                      ℹ️
                    </span>
                  </div>
                </td>
                <td className={valueClasses}>{fmtPct(result.ocfYield)}</td>
              </tr>
              <tr className={`${rowClasses} border-t-2 border-gray-400`}>
                <td className={`${labelClasses} font-bold`}>IRR (Overall Project)</td>
                <td className={`${valueClasses} font-bold`}>
                  {result.irr !== null ? fmtPct(result.irr) : 'N/A'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sprocket Internal Economics */}
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-3">
            Sprocket Internal Economics
          </h3>
          <table className="w-full">
            <tbody>
              <tr className={rowClasses}>
                <td className={labelClasses}>Net Cash Flow (after DA payment)</td>
                <td className={valueClasses}>
                  {fmtCurrency(result.netCashFlowPerMonth)}
                </td>
              </tr>
              <tr className={rowClasses}>
                <td className={labelClasses}>Annual Net Cash Flow</td>
                <td className={valueClasses}>
                  {fmtCurrency(result.netCashFlowPerYear)}
                </td>
              </tr>
              <tr className={`${rowClasses} border-t-2 border-gray-400`}>
                <td className={`${labelClasses} font-bold`}>Sprocket IRR</td>
                <td className={`${valueClasses} font-bold`}>
                  {result.sprocketIrr !== null ? fmtPct(result.sprocketIrr) : 'N/A'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* DA Payment Schedule (Waterfall) */}
        {input.fundingSource === 'da' && result.daWaterfall && (
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              DA Payment Schedule (Waterfall)
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Initial Payment:</strong> {fmtCurrency(result.daPaymentInitial)}/month per unit
              </p>
              <p className="text-xs text-gray-600">
                DA payments start at the full rate and reduce as cumulative payments reach MOIC (Multiple of Invested Capital) thresholds.
              </p>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left py-2 px-2 text-sm font-semibold text-gray-700">Phase</th>
                  <th className="text-right py-2 px-2 text-sm font-semibold text-gray-700">Payment Rate</th>
                  <th className="text-right py-2 px-2 text-sm font-semibold text-gray-700">Monthly Payment</th>
                  <th className="text-right py-2 px-2 text-sm font-semibold text-gray-700">Starts At</th>
                </tr>
              </thead>
              <tbody>
                <tr className={rowClasses}>
                  <td className="px-2 py-2 text-sm text-gray-700">Phase 1: Initial</td>
                  <td className="px-2 py-2 text-sm text-right font-mono text-gray-900">100%</td>
                  <td className="px-2 py-2 text-sm text-right font-mono text-gray-900">
                    {fmtCurrency(result.daPaymentInitial)}
                  </td>
                  <td className="px-2 py-2 text-sm text-right text-gray-600">Month 1</td>
                </tr>
                {result.daWaterfall.moic2xMonth && (
                  <tr className={rowClasses}>
                    <td className="px-2 py-2 text-sm text-gray-700">Phase 2: After 2.0x MOIC</td>
                    <td className="px-2 py-2 text-sm text-right font-mono text-gray-900">50%</td>
                    <td className="px-2 py-2 text-sm text-right font-mono text-gray-900">
                      {fmtCurrency(result.daPaymentInitial * 0.5)}
                    </td>
                    <td className="px-2 py-2 text-sm text-right text-gray-600">
                      Month {result.daWaterfall.moic2xMonth}
                      <span className="text-xs text-gray-500 ml-1">
                        ({Math.floor(result.daWaterfall.moic2xMonth / 12)}Y {result.daWaterfall.moic2xMonth % 12}M)
                      </span>
                    </td>
                  </tr>
                )}
                {result.daWaterfall.moic2_5xMonth && (
                  <tr className={rowClasses}>
                    <td className="px-2 py-2 text-sm text-gray-700">Phase 3: After 2.5x MOIC</td>
                    <td className="px-2 py-2 text-sm text-right font-mono text-gray-900">25%</td>
                    <td className="px-2 py-2 text-sm text-right font-mono text-gray-900">
                      {fmtCurrency(result.daPaymentInitial * 0.25)}
                    </td>
                    <td className="px-2 py-2 text-sm text-right text-gray-600">
                      Month {result.daWaterfall.moic2_5xMonth}
                      <span className="text-xs text-gray-500 ml-1">
                        ({Math.floor(result.daWaterfall.moic2_5xMonth / 12)}Y {result.daWaterfall.moic2_5xMonth % 12}M)
                      </span>
                    </td>
                  </tr>
                )}
                {result.daWaterfall.moic3xMonth && (
                  <tr className={rowClasses}>
                    <td className="px-2 py-2 text-sm text-gray-700">Phase 4: After 3.0x MOIC</td>
                    <td className="px-2 py-2 text-sm text-right font-mono text-gray-900">0%</td>
                    <td className="px-2 py-2 text-sm text-right font-mono text-gray-900">$0</td>
                    <td className="px-2 py-2 text-sm text-right text-gray-600">
                      Month {result.daWaterfall.moic3xMonth}
                      <span className="text-xs text-gray-500 ml-1">
                        ({Math.floor(result.daWaterfall.moic3xMonth / 12)}Y {result.daWaterfall.moic3xMonth % 12}M)
                      </span>
                    </td>
                  </tr>
                )}
                {!result.daWaterfall.moic2xMonth && (
                  <tr className={rowClasses}>
                    <td colSpan={4} className="px-2 py-2 text-sm text-center text-gray-500 italic">
                      Note: 2.0x MOIC threshold ({fmtCurrency(result.daWaterfall.moic2xAmount)}) not reached within {input.termYears}-year term
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


