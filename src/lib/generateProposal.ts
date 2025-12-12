import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { BulkDealInput, BulkDealResult } from '../engine/bulkAnalyzer';
import { fmtCurrency, fmtPct } from './format';

/**
 * Generate a PDF proposal for the owner/developer
 */
export async function generateProposalPDF(
  input: BulkDealInput,
  result: BulkDealResult
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Add logo
  try {
    const logoPath = '/ellumnet-logo.png';
    const response = await fetch(logoPath);
    if (response.ok) {
      const blob = await response.blob();
      const reader = new FileReader();
      const logoDataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      
      // Get image dimensions
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = () => {
          const logoWidth = 60;
          const logoHeight = (img.height / img.width) * logoWidth;
          doc.addImage(logoDataUrl, 'PNG', pageWidth - 70, 15, logoWidth, logoHeight);
          resolve(null);
        };
        img.onerror = reject;
        img.src = logoDataUrl;
      });
    }
  } catch (error) {
    console.warn('Could not load logo:', error);
  }

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Bulk MDU Internet Service Proposal', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Property Name
  doc.setFontSize(16);
  doc.setFont('helvetica', 'normal');
  doc.text(`Property: ${input.propertyName || 'Untitled Property'}`, 20, yPos);
  yPos += 15;

  // Deal Overview Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Deal Overview', 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const overviewData = [
    ['Units', input.units.toString()],
    ['Construction Type', input.constructionType === 'greenfield' ? 'Greenfield' : 'Brownfield'],
    ['Term', `${input.termYears} years`],
    ['Bulk Rate per Unit', fmtCurrency(input.bulkRatePerUnit) + '/month'],
    ['Funding Source', 
      input.fundingSource === 'da' ? 'Digital Alpha' :
      input.fundingSource === 'owner' ? 'Owner / Developer' : 'Internal'
    ],
  ];

  if (input.fundingSource === 'owner') {
    overviewData.push(['Owner Loan Interest Rate', fmtPct(input.ownerLoanInterestRate)]);
  }

  if (input.constructionType === 'greenfield' && input.leaseUpMonths > 0) {
    overviewData.push(['Lease Up Period', `${input.leaseUpMonths} months`]);
  }

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: overviewData,
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 80 },
      1: { cellWidth: 'auto' },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // CapEx Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Capital Expenditure', 20, yPos);
  yPos += 8;

  const capexData = [
    ['Build Cost per Unit', fmtCurrency(input.buildCostPerUnit)],
    ['CPE Cost per Unit', fmtCurrency(input.cpeCostPerUnit)],
    ['Install Cost per Unit', fmtCurrency(input.installCostPerUnit)],
    ['Door Fee per Unit', fmtCurrency(input.doorFeePerUnit)],
    ['CapEx per Unit', fmtCurrency(result.capexPerUnit)],
    ['Total CapEx', fmtCurrency(result.totalCapex)],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: capexData,
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 100 },
      1: { cellWidth: 'auto' },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Monthly Economics
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Monthly Economics', 20, yPos);
  yPos += 8;

  const monthlyData = [
    ['Gross Revenue', fmtCurrency(result.grossRevenuePerMonth)],
    ['DA Payment', fmtCurrency(result.daPaymentPerMonth)],
    ['Support Opex', fmtCurrency(result.supportOpexPerMonth)],
    ['Transport Opex', fmtCurrency(result.transportOpexPerMonth)],
    ['Total Opex', fmtCurrency(result.totalOpexPerMonth)],
    ['Net Cash Flow', fmtCurrency(result.netCashFlowPerMonth)],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: monthlyData,
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 100 },
      1: { cellWidth: 'auto' },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Annual Economics
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Annual Economics', 20, yPos);
  yPos += 8;

  const annualData = [
    ['Annual Net Cash Flow', fmtCurrency(result.netCashFlowPerYear)],
    ['Payback Period', `${result.paybackYears.toFixed(2)} years`],
    ['OCF Yield', fmtPct(result.ocfYield)],
    ['IRR (Overall Project)', result.irr !== null ? fmtPct(result.irr) : 'N/A'],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: annualData,
    theme: 'plain',
    styles: { fontSize: 10 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 100 },
      1: { cellWidth: 'auto' },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Sprocket Internal Economics (if applicable)
  if (result.sprocketIrr !== null) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Sprocket Internal Economics', 20, yPos);
    yPos += 8;

    const sprocketData = [
      ['Sprocket IRR', fmtPct(result.sprocketIrr)],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [],
      body: sprocketData,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 100 },
        1: { cellWidth: 'auto' },
      },
    });
  }

  // Footer
  const footerY = pageHeight - 20;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(
    `Generated on ${new Date().toLocaleDateString()} | EllumNet Bulk MDU Analyzer`,
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );

  // Save PDF
  const filename = `${input.propertyName || 'Proposal'}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

