import { pdf } from '@react-pdf/renderer';
import { ProposalPdfDocument } from './ProposalPdfDocument';
import { BoardApprovalPdfDocument } from './BoardApprovalPdfDocument';
import type { BulkDealInput, BulkDealResult } from '../engine/bulkAnalyzer';
import { analyzeBulkDeal } from '../engine/bulkAnalyzer';

/**
 * Generate and download a PDF proposal
 * @param input - Deal input parameters
 * @param result - Analysis result
 * @param includeFeatures - Whether to include features/benefits section (default: true)
 */
export async function generateProposalPDF(
  input: BulkDealInput,
  result: BulkDealResult,
  includeFeatures: boolean = true
): Promise<void> {
  // Calculate scenarios for 10Y and 15Y terms
  const input10Y = { ...input, termYears: 10 };
  const input15Y = { ...input, termYears: 15 };
  
  const result10Y = analyzeBulkDeal(input10Y);
  const result15Y = analyzeBulkDeal(input15Y);
  
  // Calculate Owner scenarios (if funding source is owner, use that; otherwise simulate)
  let result10YOwner: BulkDealResult;
  let result15YOwner: BulkDealResult;
  
  if (input.fundingSource === 'owner') {
    // Already owner-funded, use same results
    result10YOwner = result10Y;
    result15YOwner = result15Y;
  } else {
    // Simulate owner funding scenario
    const input10YOwner = { ...input10Y, fundingSource: 'owner' as const };
    const input15YOwner = { ...input15Y, fundingSource: 'owner' as const };
    result10YOwner = analyzeBulkDeal(input10YOwner);
    result15YOwner = analyzeBulkDeal(input15YOwner);
  }
  
  // Generate PDF
  const doc = (
    <ProposalPdfDocument
      input={input}
      result={result}
      result10Y={result10Y}
      result15Y={result15Y}
      result10YOwner={result10YOwner}
      result15YOwner={result15YOwner}
      includeFeatures={includeFeatures}
    />
  );
  
  const blob = await pdf(doc).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const versionSuffix = includeFeatures ? '' : '_Financial_Only';
  link.download = `${input.propertyName || 'Proposal'}_Bulk_Proposal${versionSuffix}_${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate and download a board approval PDF document
 */
export async function generateBoardApprovalPDF(
  input: BulkDealInput,
  result: BulkDealResult
): Promise<void> {
  // Generate PDF
  const doc = (
    <BoardApprovalPdfDocument
      input={input}
      result={result}
    />
  );
  
  const blob = await pdf(doc).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${input.propertyName || 'Proposal'}_Board_Approval_${new Date().toISOString().split('T')[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

