import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import type { BulkDealInput, BulkDealResult } from '../engine/bulkAnalyzer';
import { fmtCurrency } from '../lib/format';

// Enhanced styles with better visual appeal
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  // Cover page styles
  coverHeader: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: '3 solid #1e40af',
  },
  coverTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
    lineHeight: 1.2,
  },
  coverSubtitle: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 5,
  },
  coverPropertyName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 10,
  },
  // Value proposition box
  valuePropBox: {
    backgroundColor: '#eff6ff',
    border: '2 solid #3b82f6',
    borderRadius: 8,
    padding: 20,
    marginBottom: 25,
  },
  valuePropTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 15,
  },
  valuePropItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  valuePropIcon: {
    fontSize: 16,
    marginRight: 10,
    color: '#3b82f6',
  },
  valuePropText: {
    fontSize: 11,
    color: '#1f2937',
    flex: 1,
    lineHeight: 1.5,
  },
  // Financial highlights
  financialHighlights: {
    marginTop: 20,
    marginBottom: 20,
  },
  highlightBox: {
    backgroundColor: '#f9fafb',
    border: '1 solid #e5e7eb',
    borderRadius: 6,
    padding: 15,
    marginBottom: 15,
  },
  highlightLabel: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  highlightValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669',
  },
  highlightSubtext: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 3,
  },
  // Two-column layout
  twoColumn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  column: {
    width: '48%',
  },
  // Section styles
  section: {
    marginTop: 25,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: '2 solid #3b82f6',
  },
  // Table styles
  table: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 10,
    border: '1 solid #e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e5e7eb',
    paddingVertical: 8,
  },
  tableHeader: {
    backgroundColor: '#1e40af',
    fontWeight: 'bold',
    paddingVertical: 10,
  },
  tableHeaderText: {
    color: '#ffffff',
    fontSize: 10,
  },
  tableCell: {
    padding: 8,
    fontSize: 9,
    color: '#1f2937',
  },
  tableCellRight: {
    padding: 8,
    fontSize: 9,
    textAlign: 'right',
    color: '#1f2937',
  },
  tableCellBold: {
    fontWeight: 'bold',
    color: '#059669',
  },
  col10: { width: '10%' },
  col15: { width: '15%' },
  col20: { width: '20%' },
  col25: { width: '25%' },
  col30: { width: '30%' },
  col35: { width: '35%' },
  // Benefits section
  benefitsList: {
    marginTop: 15,
  },
  benefitItem: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  benefitBullet: {
    fontSize: 12,
    color: '#3b82f6',
    marginRight: 8,
    marginTop: 2,
  },
  benefitText: {
    fontSize: 10,
    color: '#374151',
    flex: 1,
    lineHeight: 1.4,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#6b7280',
    borderTop: '1 solid #e5e7eb',
    paddingTop: 10,
  },
  disclaimer: {
    fontSize: 8,
    fontStyle: 'italic',
    color: '#6b7280',
    marginTop: 15,
    textAlign: 'center',
  },
  // Comparison box
  comparisonBox: {
    backgroundColor: '#f0fdf4',
    border: '1 solid #86efac',
    borderRadius: 6,
    padding: 15,
    marginTop: 15,
  },
  comparisonTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 10,
  },
});

interface ProposalPdfDocumentProps {
  input: BulkDealInput;
  result: BulkDealResult;
  result10Y: BulkDealResult;
  result15Y: BulkDealResult;
  result10YOwner: BulkDealResult;
  result15YOwner: BulkDealResult;
}

export const ProposalPdfDocument: React.FC<ProposalPdfDocumentProps> = ({
  input,
  result,
  result10Y,
  result15Y,
  result10YOwner,
  result15YOwner,
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate key owner metrics
  const owner10YAnnualNOI = result10YOwner.netCashFlowPerYear;
  const owner15YAnnualNOI = result15YOwner.netCashFlowPerYear;
  const owner10YTotalNOI = owner10YAnnualNOI * 10;
  const owner15YTotalNOI = owner15YAnnualNOI * 15;
  const owner10YBEP = result.totalCapex / result10YOwner.netCashFlowPerMonth;
  const owner15YBEP = result.totalCapex / result15YOwner.netCashFlowPerMonth;
  
  // Determine if zero capital investment
  const zeroCapitalInvestment = input.fundingSource === 'da';

  return (
    <Document>
      {/* Page 1: Cover & Value Proposition */}
      <Page size="LETTER" style={styles.page}>
        {/* Header with Logo */}
        <View style={styles.coverHeader}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.coverTitle}>Bulk Internet Proposal</Text>
              <Text style={styles.coverSubtitle}>EllumNet / Sprocket Networks</Text>
              <Text style={styles.coverPropertyName}>{input.propertyName}</Text>
              <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 5 }}>
                {input.units} Units • Generated {currentDate}
              </Text>
            </View>
            <View style={{ width: 100, marginLeft: 20 }}>
              <Image
                src="/ellumnet-logo.png"
                style={{ width: 100, height: 'auto' }}
              />
            </View>
          </View>
        </View>

        {/* Value Proposition Box */}
        <View style={styles.valuePropBox}>
          <Text style={styles.valuePropTitle}>Why Partner with EllumNet?</Text>
          
          <View style={styles.valuePropItem}>
            <Text style={styles.valuePropIcon}>💰</Text>
            <Text style={styles.valuePropText}>
              <Text style={{ fontWeight: 'bold' }}>Passive Revenue Stream:</Text> Generate recurring monthly income with zero operational burden. We handle all installation, maintenance, and customer support.
            </Text>
          </View>

          <View style={styles.valuePropItem}>
            <Text style={styles.valuePropIcon}>🏆</Text>
            <Text style={styles.valuePropText}>
              <Text style={{ fontWeight: 'bold' }}>Competitive Advantage:</Text> Offer high-speed fiber internet as a premium amenity that attracts and retains quality tenants, setting your property apart from competitors.
            </Text>
          </View>

          {zeroCapitalInvestment && (
            <View style={styles.valuePropItem}>
              <Text style={styles.valuePropIcon}>✅</Text>
              <Text style={styles.valuePropText}>
                <Text style={{ fontWeight: 'bold' }}>Zero Capital Investment:</Text> We provide 100% of the capital required. You receive revenue share with no upfront costs or financial risk.
              </Text>
            </View>
          )}

          <View style={styles.valuePropItem}>
            <Text style={styles.valuePropIcon}>📈</Text>
            <Text style={styles.valuePropText}>
              <Text style={{ fontWeight: 'bold' }}>Long-Term Stability:</Text> 10-15 year agreements provide predictable, stable income that enhances your property's value and NOI.
            </Text>
          </View>

          <View style={styles.valuePropItem}>
            <Text style={styles.valuePropIcon}>😊</Text>
            <Text style={styles.valuePropText}>
              <Text style={{ fontWeight: 'bold' }}>Tenant Satisfaction:</Text> Fast, reliable internet is the #1 amenity tenants look for. Happy tenants mean lower turnover and higher retention rates.
            </Text>
          </View>
        </View>

        {/* Financial Highlights */}
        <View style={styles.financialHighlights}>
          <Text style={styles.sectionTitle}>Your Financial Benefits</Text>
          
          <View style={styles.twoColumn}>
            <View style={[styles.column]}>
              <View style={styles.highlightBox}>
                <Text style={styles.highlightLabel}>10-Year Term</Text>
                <Text style={styles.highlightValue}>{fmtCurrency(owner10YAnnualNOI)}</Text>
                <Text style={styles.highlightSubtext}>Annual NOI to Property</Text>
                <Text style={[styles.highlightSubtext, { marginTop: 8, fontWeight: 'bold', color: '#059669' }]}>
                  Total 10-Year Value: {fmtCurrency(owner10YTotalNOI)}
                </Text>
              </View>
            </View>
            
            <View style={[styles.column]}>
              <View style={styles.highlightBox}>
                <Text style={styles.highlightLabel}>15-Year Term</Text>
                <Text style={styles.highlightValue}>{fmtCurrency(owner15YAnnualNOI)}</Text>
                <Text style={styles.highlightSubtext}>Annual NOI to Property</Text>
                <Text style={[styles.highlightSubtext, { marginTop: 8, fontWeight: 'bold', color: '#059669' }]}>
                  Total 15-Year Value: {fmtCurrency(owner15YTotalNOI)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.twoColumn}>
            <View style={[styles.column]}>
              <View style={styles.highlightBox}>
                <Text style={styles.highlightLabel}>Break-Even Timeline</Text>
                <Text style={[styles.highlightValue, { fontSize: 20 }]}>
                  {owner10YBEP < 12 ? `${owner10YBEP.toFixed(1)} months` : `${(owner10YBEP / 12).toFixed(1)} years`}
                </Text>
                <Text style={styles.highlightSubtext}>10-Year Term</Text>
              </View>
            </View>
            
            <View style={[styles.column]}>
              <View style={styles.highlightBox}>
                <Text style={styles.highlightLabel}>Break-Even Timeline</Text>
                <Text style={[styles.highlightValue, { fontSize: 20 }]}>
                  {owner15YBEP < 12 ? `${owner15YBEP.toFixed(1)} months` : `${(owner15YBEP / 12).toFixed(1)} years`}
                </Text>
                <Text style={styles.highlightSubtext}>15-Year Term</Text>
              </View>
            </View>
          </View>

          {zeroCapitalInvestment && (
            <View style={styles.comparisonBox}>
              <Text style={styles.comparisonTitle}>Investment Summary</Text>
              <Text style={{ fontSize: 10, color: '#166534', lineHeight: 1.5 }}>
                Total capital required: <Text style={{ fontWeight: 'bold' }}>{fmtCurrency(result.totalCapex)}</Text>
                {'\n'}Your investment: <Text style={{ fontWeight: 'bold', color: '#059669' }}>$0</Text>
                {'\n'}All infrastructure costs are covered by EllumNet and our capital partners.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.disclaimer}>
          <Text>Estimate only. Subject to site survey and contract.</Text>
        </View>

        <View style={styles.footer}>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>

      {/* Page 2: Detailed Financial Analysis */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detailed Financial Analysis</Text>
          
          {/* 10 Year Term */}
          <View style={{ marginBottom: 25 }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1e40af', marginBottom: 10 }}>
              10-Year Term Options
            </Text>
            
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, styles.col25, styles.tableHeaderText]}>Metric</Text>
                <Text style={[styles.tableCell, styles.col25, styles.tableHeaderText]}>Provider Funded</Text>
                <Text style={[styles.tableCell, styles.col25, styles.tableHeaderText]}>Owner Funded</Text>
              </View>
              
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.col25]}>Monthly Revenue Share</Text>
                <Text style={[styles.tableCellRight, styles.col25]}>
                  {fmtCurrency(result10Y.grossRevenuePerMonth - result10Y.daPaymentPerMonth)}
                </Text>
                <Text style={[styles.tableCellRight, styles.col25, styles.tableCellBold]}>
                  {fmtCurrency(result10YOwner.grossRevenuePerMonth)}
                </Text>
              </View>
              
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.col25]}>Annual NOI</Text>
                <Text style={[styles.tableCellRight, styles.col25]}>
                  {fmtCurrency(result10Y.netCashFlowPerYear)}
                </Text>
                <Text style={[styles.tableCellRight, styles.col25, styles.tableCellBold]}>
                  {fmtCurrency(result10YOwner.netCashFlowPerYear)}
                </Text>
              </View>
              
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.col25]}>Total 10-Year NOI</Text>
                <Text style={[styles.tableCellRight, styles.col25]}>
                  {fmtCurrency(result10Y.netCashFlowPerYear * 10)}
                </Text>
                <Text style={[styles.tableCellRight, styles.col25, styles.tableCellBold]}>
                  {fmtCurrency(owner10YTotalNOI)}
                </Text>
              </View>
              
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.col25]}>Break-Even (months)</Text>
                <Text style={[styles.tableCellRight, styles.col25]}>
                  {(result10Y.paybackYears * 12).toFixed(1)}
                </Text>
                <Text style={[styles.tableCellRight, styles.col25, styles.tableCellBold]}>
                  {owner10YBEP.toFixed(1)}
                </Text>
              </View>
            </View>
          </View>

          {/* 15 Year Term */}
          <View>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1e40af', marginBottom: 10 }}>
              15-Year Term Options
            </Text>
            
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, styles.col25, styles.tableHeaderText]}>Metric</Text>
                <Text style={[styles.tableCell, styles.col25, styles.tableHeaderText]}>Provider Funded</Text>
                <Text style={[styles.tableCell, styles.col25, styles.tableHeaderText]}>Owner Funded</Text>
              </View>
              
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.col25]}>Monthly Revenue Share</Text>
                <Text style={[styles.tableCellRight, styles.col25]}>
                  {fmtCurrency(result15Y.grossRevenuePerMonth - result15Y.daPaymentPerMonth)}
                </Text>
                <Text style={[styles.tableCellRight, styles.col25, styles.tableCellBold]}>
                  {fmtCurrency(result15YOwner.grossRevenuePerMonth)}
                </Text>
              </View>
              
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.col25]}>Annual NOI</Text>
                <Text style={[styles.tableCellRight, styles.col25]}>
                  {fmtCurrency(result15Y.netCashFlowPerYear)}
                </Text>
                <Text style={[styles.tableCellRight, styles.col25, styles.tableCellBold]}>
                  {fmtCurrency(owner15YAnnualNOI)}
                </Text>
              </View>
              
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.col25]}>Total 15-Year NOI</Text>
                <Text style={[styles.tableCellRight, styles.col25]}>
                  {fmtCurrency(result15Y.netCashFlowPerYear * 15)}
                </Text>
                <Text style={[styles.tableCellRight, styles.col25, styles.tableCellBold]}>
                  {fmtCurrency(owner15YTotalNOI)}
                </Text>
              </View>
              
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.col25]}>Break-Even (months)</Text>
                <Text style={[styles.tableCellRight, styles.col25]}>
                  {(result15Y.paybackYears * 12).toFixed(1)}
                </Text>
                <Text style={[styles.tableCellRight, styles.col25, styles.tableCellBold]}>
                  {owner15YBEP.toFixed(1)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Benefits Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Benefits</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitBullet}>•</Text>
              <Text style={styles.benefitText}>
                <Text style={{ fontWeight: 'bold' }}>No Operational Burden:</Text> EllumNet handles all installation, maintenance, customer support, and billing. You simply receive monthly revenue.
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitBullet}>•</Text>
              <Text style={styles.benefitText}>
                <Text style={{ fontWeight: 'bold' }}>Property Value Enhancement:</Text> High-speed fiber infrastructure increases your property's market value and appeal to future buyers or investors.
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitBullet}>•</Text>
              <Text style={styles.benefitText}>
                <Text style={{ fontWeight: 'bold' }}>Future-Proof Technology:</Text> Fiber infrastructure supports current and future bandwidth needs, ensuring your property remains competitive for years to come.
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitBullet}>•</Text>
              <Text style={styles.benefitText}>
                <Text style={{ fontWeight: 'bold' }}>Professional Partnership:</Text> Work with an experienced team that has successfully deployed fiber to hundreds of properties, ensuring a smooth implementation.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages} - Estimate only. Subject to site survey and contract.`} />
        </View>
      </Page>

      {/* Page 3: Year-by-Year Cash Flow */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Year-by-Year Cash Flow Projection</Text>
          <Text style={{ fontSize: 9, color: '#6b7280', marginBottom: 15 }}>
            Projected annual cash flows for Owner-funded scenario
          </Text>
          
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.col20, styles.tableHeaderText]}>Year</Text>
              <Text style={[styles.tableCell, styles.col20, styles.tableHeaderText]}>10Y Annual NOI</Text>
              <Text style={[styles.tableCell, styles.col20, styles.tableHeaderText]}>10Y Cumulative</Text>
              <Text style={[styles.tableCell, styles.col20, styles.tableHeaderText]}>15Y Annual NOI</Text>
              <Text style={[styles.tableCell, styles.col20, styles.tableHeaderText]}>15Y Cumulative</Text>
            </View>
            
            {/* Year 0 - Initial Investment */}
            <View style={[styles.tableRow, { backgroundColor: '#fef2f2' }]}>
              <Text style={[styles.tableCell, styles.col20]}>0 (Initial)</Text>
              <Text style={[styles.tableCellRight, styles.col20, { color: '#dc2626' }]}>
                {zeroCapitalInvestment ? '$0' : fmtCurrency(-result.totalCapex)}
              </Text>
              <Text style={[styles.tableCellRight, styles.col20, { color: '#dc2626' }]}>
                {zeroCapitalInvestment ? '$0' : fmtCurrency(-result.totalCapex)}
              </Text>
              <Text style={[styles.tableCellRight, styles.col20, { color: '#dc2626' }]}>
                {zeroCapitalInvestment ? '$0' : fmtCurrency(-result.totalCapex)}
              </Text>
              <Text style={[styles.tableCellRight, styles.col20, { color: '#dc2626' }]}>
                {zeroCapitalInvestment ? '$0' : fmtCurrency(-result.totalCapex)}
              </Text>
            </View>

            {/* Year-by-year cash flows */}
            {result10YOwner.yearlyCashFlows.map((cf, idx) => {
              const cumulative10Y = result10YOwner.yearlyCashFlows.slice(0, idx + 1).reduce((sum, c) => sum + c.ownerCashFlow, 0) - (zeroCapitalInvestment ? 0 : result.totalCapex);
              const cf15Y = result15YOwner.yearlyCashFlows[idx];
              const cumulative15Y = result15YOwner.yearlyCashFlows.slice(0, idx + 1).reduce((sum, c) => sum + c.ownerCashFlow, 0) - (zeroCapitalInvestment ? 0 : result.totalCapex);
              
              return (
                <View key={cf.year} style={[styles.tableRow, cumulative10Y > 0 ? { backgroundColor: '#f0fdf4' } : {}]}>
                  <Text style={[styles.tableCell, styles.col20]}>{cf.year}</Text>
                  <Text style={[styles.tableCellRight, styles.col20, { color: cumulative10Y > 0 ? '#059669' : '#1f2937' }]}>
                    {fmtCurrency(cf.ownerCashFlow)}
                  </Text>
                  <Text style={[styles.tableCellRight, styles.col20, { fontWeight: 'bold', color: cumulative10Y > 0 ? '#059669' : '#1f2937' }]}>
                    {fmtCurrency(cumulative10Y)}
                  </Text>
                  <Text style={[styles.tableCellRight, styles.col20, { color: cumulative15Y > 0 ? '#059669' : '#1f2937' }]}>
                    {cf15Y ? fmtCurrency(cf15Y.ownerCashFlow) : '-'}
                  </Text>
                  <Text style={[styles.tableCellRight, styles.col20, { fontWeight: 'bold', color: cumulative15Y > 0 ? '#059669' : '#1f2937' }]}>
                    {cf15Y ? fmtCurrency(cumulative15Y) : '-'}
                  </Text>
                </View>
              );
            })}
            
            {/* Add 15Y-only years if term is 15 years */}
            {result15YOwner.yearlyCashFlows.length > result10YOwner.yearlyCashFlows.length &&
              result15YOwner.yearlyCashFlows.slice(result10YOwner.yearlyCashFlows.length).map((cf) => {
                const idx = cf.year - 1;
                const cumulative15Y = result15YOwner.yearlyCashFlows.slice(0, idx + 1).reduce((sum, c) => sum + c.ownerCashFlow, 0) - (zeroCapitalInvestment ? 0 : result.totalCapex);
                
                return (
                  <View key={cf.year} style={[styles.tableRow, cumulative15Y > 0 ? { backgroundColor: '#f0fdf4' } : {}]}>
                    <Text style={[styles.tableCell, styles.col20]}>{cf.year}</Text>
                    <Text style={[styles.tableCellRight, styles.col20]}>-</Text>
                    <Text style={[styles.tableCellRight, styles.col20]}>-</Text>
                    <Text style={[styles.tableCellRight, styles.col20, { color: cumulative15Y > 0 ? '#059669' : '#1f2937' }]}>
                      {fmtCurrency(cf.ownerCashFlow)}
                    </Text>
                    <Text style={[styles.tableCellRight, styles.col20, { fontWeight: 'bold', color: cumulative15Y > 0 ? '#059669' : '#1f2937' }]}>
                      {fmtCurrency(cumulative15Y)}
                    </Text>
                  </View>
                );
              })}
          </View>
        </View>

        <View style={styles.footer}>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages} - Estimate only. Subject to site survey and contract.`} />
        </View>
      </Page>

      {/* Page 4: Assumptions & Next Steps */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Model Assumptions</Text>
          
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col30, { fontWeight: 'bold' }]}>Build Cost per Unit:</Text>
              <Text style={[styles.tableCell, styles.col30]}>{fmtCurrency(input.buildCostPerUnit)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col30, { fontWeight: 'bold' }]}>CPE Cost per Unit:</Text>
              <Text style={[styles.tableCell, styles.col30]}>{fmtCurrency(input.cpeCostPerUnit)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col30, { fontWeight: 'bold' }]}>Install Cost per Unit:</Text>
              <Text style={[styles.tableCell, styles.col30]}>{fmtCurrency(input.installCostPerUnit)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col30, { fontWeight: 'bold' }]}>Support Opex per Unit/Month:</Text>
              <Text style={[styles.tableCell, styles.col30]}>{fmtCurrency(input.supportOpexPerUnitPerMonth)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col30, { fontWeight: 'bold' }]}>Transport Opex per Month:</Text>
              <Text style={[styles.tableCell, styles.col30]}>{fmtCurrency(input.transportOpexPerMonth)}</Text>
            </View>
            {input.leaseUpMonths > 0 && (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.col30, { fontWeight: 'bold' }]}>Lease Up Period:</Text>
                <Text style={[styles.tableCell, styles.col30]}>{input.leaseUpMonths} months</Text>
              </View>
            )}
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col30, { fontWeight: 'bold' }]}>Funding Source:</Text>
              <Text style={[styles.tableCell, styles.col30]}>
                {input.fundingSource === 'da' ? 'Digital Alpha (Provider Funded)' :
                 input.fundingSource === 'owner' ? 'Owner / Developer' : 'Internal'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Next Steps</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitBullet}>1</Text>
              <Text style={styles.benefitText}>
                <Text style={{ fontWeight: 'bold' }}>Site Survey:</Text> Our team will conduct a comprehensive site survey to finalize installation requirements and timeline.
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitBullet}>2</Text>
              <Text style={styles.benefitText}>
                <Text style={{ fontWeight: 'bold' }}>Contract Review:</Text> We'll prepare a detailed service agreement outlining terms, revenue share structure, and responsibilities.
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitBullet}>3</Text>
              <Text style={styles.benefitText}>
                <Text style={{ fontWeight: 'bold' }}>Installation Planning:</Text> Once approved, we'll coordinate installation scheduling to minimize disruption to your tenants.
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitBullet}>4</Text>
              <Text style={styles.benefitText}>
                <Text style={{ fontWeight: 'bold' }}>Launch & Revenue:</Text> After installation, monthly revenue share payments begin automatically.
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.valuePropBox, { marginTop: 20, backgroundColor: '#fef3c7', borderColor: '#f59e0b' }]}>
          <Text style={[styles.valuePropTitle, { color: '#92400e' }]}>Questions?</Text>
          <Text style={[styles.valuePropText, { color: '#78350f' }]}>
            Contact our team to discuss this proposal, answer any questions, or schedule a site survey. We're here to make this partnership work for your property.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages} - Estimate only. Subject to site survey and contract.`} />
        </View>
      </Page>
    </Document>
  );
};
