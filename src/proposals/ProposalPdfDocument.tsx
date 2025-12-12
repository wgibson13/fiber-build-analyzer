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
import { fmtCurrency, fmtPct } from '../lib/format';

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #000',
    paddingBottom: 10,
  },
  logo: {
    width: 80,
    height: 'auto',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 3,
  },
  section: {
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottom: '1 solid #ccc',
    paddingBottom: 5,
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #eee',
    paddingVertical: 5,
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
    paddingVertical: 8,
  },
  tableCell: {
    padding: 5,
    fontSize: 9,
  },
  tableCellRight: {
    padding: 5,
    fontSize: 9,
    textAlign: 'right',
  },
  col10: { width: '10%' },
  col15: { width: '15%' },
  col20: { width: '20%' },
  col25: { width: '25%' },
  col30: { width: '30%' },
  col35: { width: '35%' },
  disclaimer: {
    fontSize: 8,
    fontStyle: 'italic',
    color: '#666',
    marginTop: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
    borderTop: '1 solid #eee',
    paddingTop: 10,
  },
  executiveSummary: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginBottom: 20,
    border: '1 solid #ddd',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryLabel: {
    fontWeight: 'bold',
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

  // Calculate break-even months (Owner BEP)
  const calculateOwnerBEP = (monthlyNOI: number, totalCapex: number): number => {
    if (monthlyNOI <= 0) return Infinity;
    return totalCapex / monthlyNOI;
  };

  // Calculate Provider BEP (months)
  const calculateProviderBEP = (paybackYears: number): number => {
    return paybackYears * 12;
  };

  // Speed tier utilization (defaults from Excel)
  const speedTiers = [
    { name: '1G', utilization: 0.92 },
    { name: '2.5G', utilization: 0.08 },
    { name: '8G', utilization: 0.02 },
  ];

  // Calculate revenue share percentages
  const totalRevenue = result.grossRevenuePerMonth;
  const daPayment = result.daPaymentPerMonth;
  const providerRevenueShare = totalRevenue > 0 ? (daPayment / totalRevenue) * 100 : 0;
  const ownerRevenueShare = 100 - providerRevenueShare;

  return (
    <Document>
      {/* Page 1: Cover and Summary */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>
                Bulk Internet Pricing: {input.propertyName} ({input.units} Units)
              </Text>
              <Text style={styles.subtitle}>Generated: {currentDate}</Text>
              <Text style={styles.subtitle}>EllumNet / Sprocket Networks</Text>
            </View>
            <View style={{ width: 80, marginLeft: 20 }}>
              <Image
                src="/ellumnet-logo.png"
                style={{ width: 80, height: 'auto' }}
              />
            </View>
          </View>
        </View>

        <View style={styles.disclaimer}>
          <Text>Estimate only. Subject to site survey and contract.</Text>
        </View>

        {/* Executive Summary */}
        <View style={styles.executiveSummary}>
          <Text style={[styles.sectionTitle, { marginTop: 0 }]}>Executive Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Capital Required:</Text>
            <Text>{fmtCurrency(result.totalCapex)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Term Options:</Text>
            <Text>10 Years, 15 Years</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Annual NOI:</Text>
            <Text>{fmtCurrency(result.netCashFlowPerYear)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payback Period:</Text>
            <Text>{result.paybackYears.toFixed(1)} years</Text>
          </View>
          {result.sprocketIrr !== null && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Provider IRR:</Text>
              <Text>{fmtPct(result.sprocketIrr)}</Text>
            </View>
          )}
        </View>

        {/* Pricing Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing & Results</Text>
          
          {/* 10 Year Term Section */}
          <View style={[styles.table, { marginBottom: 20 }]}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.col15]}>Speed Tier</Text>
              <Text style={[styles.tableCell, styles.col10]}>Util</Text>
              <Text style={[styles.tableCell, styles.col15]}>10Y Provider</Text>
              <Text style={[styles.tableCell, styles.col15]}>10Y Owner</Text>
            </View>

            {speedTiers.map((tier) => {
              const bulkRate10YProvider = result10Y.grossRevenuePerMonth / input.units;
              const bulkRate10YOwner = result10YOwner.grossRevenuePerMonth / input.units;
              const noi10YProvider = result10Y.netCashFlowPerMonth / input.units;
              const noi10YOwner = result10YOwner.netCashFlowPerMonth / input.units;
              
              return (
                <React.Fragment key={tier.name}>
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.col15]}>{tier.name}</Text>
                    <Text style={[styles.tableCell, styles.col10]}>{(tier.utilization * 100).toFixed(0)}%</Text>
                    <Text style={[styles.tableCellRight, styles.col15]}>
                      {fmtCurrency(bulkRate10YProvider)}
                    </Text>
                    <Text style={[styles.tableCellRight, styles.col15]}>
                      {fmtCurrency(bulkRate10YOwner)}
                    </Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.col15]}>NOI/Unit</Text>
                    <Text style={[styles.tableCell, styles.col10]}>-</Text>
                    <Text style={[styles.tableCellRight, styles.col15]}>
                      {fmtCurrency(noi10YProvider)}
                    </Text>
                    <Text style={[styles.tableCellRight, styles.col15]}>
                      {fmtCurrency(noi10YOwner)}
                    </Text>
                  </View>
                </React.Fragment>
              );
            })}

            {/* Totals Row */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.col15]}>Total Monthly</Text>
              <Text style={[styles.tableCell, styles.col10]}>100%</Text>
              <Text style={[styles.tableCellRight, styles.col15]}>
                {fmtCurrency(result10Y.grossRevenuePerMonth)}
              </Text>
              <Text style={[styles.tableCellRight, styles.col15]}>
                {fmtCurrency(result10YOwner.grossRevenuePerMonth)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col15]}>Total Monthly NOI</Text>
              <Text style={[styles.tableCell, styles.col10]}>-</Text>
              <Text style={[styles.tableCellRight, styles.col15]}>
                {fmtCurrency(result10Y.netCashFlowPerMonth)}
              </Text>
              <Text style={[styles.tableCellRight, styles.col15]}>
                {fmtCurrency(result10YOwner.netCashFlowPerMonth)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col15]}>Total Annual NOI</Text>
              <Text style={[styles.tableCell, styles.col10]}>-</Text>
              <Text style={[styles.tableCellRight, styles.col15]}>
                {fmtCurrency(result10Y.netCashFlowPerYear)}
              </Text>
              <Text style={[styles.tableCellRight, styles.col15]}>
                {fmtCurrency(result10YOwner.netCashFlowPerYear)}
              </Text>
            </View>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.col15]}>Total Term NOI</Text>
              <Text style={[styles.tableCell, styles.col10]}>-</Text>
              <Text style={[styles.tableCellRight, styles.col15]}>
                {fmtCurrency(result10Y.netCashFlowPerYear * 10)}
              </Text>
              <Text style={[styles.tableCellRight, styles.col15]}>
                {fmtCurrency(result10YOwner.netCashFlowPerYear * 10)}
              </Text>
            </View>
          </View>

          {/* 15 Year Term Section */}
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.col15]}>Speed Tier</Text>
              <Text style={[styles.tableCell, styles.col10]}>Util</Text>
              <Text style={[styles.tableCell, styles.col15]}>15Y Provider</Text>
              <Text style={[styles.tableCell, styles.col15]}>15Y Owner</Text>
            </View>

            {speedTiers.map((tier) => {
              const bulkRate15YProvider = result15Y.grossRevenuePerMonth / input.units;
              const bulkRate15YOwner = result15YOwner.grossRevenuePerMonth / input.units;
              const noi15YProvider = result15Y.netCashFlowPerMonth / input.units;
              const noi15YOwner = result15YOwner.netCashFlowPerMonth / input.units;
              
              return (
                <React.Fragment key={tier.name}>
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.col15]}>{tier.name}</Text>
                    <Text style={[styles.tableCell, styles.col10]}>{(tier.utilization * 100).toFixed(0)}%</Text>
                    <Text style={[styles.tableCellRight, styles.col15]}>
                      {fmtCurrency(bulkRate15YProvider)}
                    </Text>
                    <Text style={[styles.tableCellRight, styles.col15]}>
                      {fmtCurrency(bulkRate15YOwner)}
                    </Text>
                  </View>
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.col15]}>NOI/Unit</Text>
                    <Text style={[styles.tableCell, styles.col10]}>-</Text>
                    <Text style={[styles.tableCellRight, styles.col15]}>
                      {fmtCurrency(noi15YProvider)}
                    </Text>
                    <Text style={[styles.tableCellRight, styles.col15]}>
                      {fmtCurrency(noi15YOwner)}
                    </Text>
                  </View>
                </React.Fragment>
              );
            })}

            {/* Totals Row */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.col15]}>Total Monthly</Text>
              <Text style={[styles.tableCell, styles.col10]}>100%</Text>
              <Text style={[styles.tableCellRight, styles.col15]}>
                {fmtCurrency(result15Y.grossRevenuePerMonth)}
              </Text>
              <Text style={[styles.tableCellRight, styles.col15]}>
                {fmtCurrency(result15YOwner.grossRevenuePerMonth)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col15]}>Total Monthly NOI</Text>
              <Text style={[styles.tableCell, styles.col10]}>-</Text>
              <Text style={[styles.tableCellRight, styles.col15]}>
                {fmtCurrency(result15Y.netCashFlowPerMonth)}
              </Text>
              <Text style={[styles.tableCellRight, styles.col15]}>
                {fmtCurrency(result15YOwner.netCashFlowPerMonth)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col15]}>Total Annual NOI</Text>
              <Text style={[styles.tableCell, styles.col10]}>-</Text>
              <Text style={[styles.tableCellRight, styles.col15]}>
                {fmtCurrency(result15Y.netCashFlowPerYear)}
              </Text>
              <Text style={[styles.tableCellRight, styles.col15]}>
                {fmtCurrency(result15YOwner.netCashFlowPerYear)}
              </Text>
            </View>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.col15]}>Total Term NOI</Text>
              <Text style={[styles.tableCell, styles.col10]}>-</Text>
              <Text style={[styles.tableCellRight, styles.col15]}>
                {fmtCurrency(result15Y.netCashFlowPerYear * 15)}
              </Text>
              <Text style={[styles.tableCellRight, styles.col15]}>
                {fmtCurrency(result15YOwner.netCashFlowPerYear * 15)}
              </Text>
            </View>
          </View>

          {/* Break-Even Analysis */}
          <View style={[styles.table, { marginTop: 20 }]}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.col25]}>Metric</Text>
              <Text style={[styles.tableCell, styles.col25]}>10Y Provider</Text>
              <Text style={[styles.tableCell, styles.col25]}>10Y Owner</Text>
              <Text style={[styles.tableCell, styles.col25]}>15Y Provider</Text>
              <Text style={[styles.tableCell, styles.col25]}>15Y Owner</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col25]}>Owner BEP (months)</Text>
              <Text style={[styles.tableCellRight, styles.col25]}>
                {calculateOwnerBEP(result10Y.netCashFlowPerMonth, result.totalCapex).toFixed(1)}
              </Text>
              <Text style={[styles.tableCellRight, styles.col25]}>
                {calculateOwnerBEP(result10YOwner.netCashFlowPerMonth, result.totalCapex).toFixed(1)}
              </Text>
              <Text style={[styles.tableCellRight, styles.col25]}>
                {calculateOwnerBEP(result15Y.netCashFlowPerMonth, result.totalCapex).toFixed(1)}
              </Text>
              <Text style={[styles.tableCellRight, styles.col25]}>
                {calculateOwnerBEP(result15YOwner.netCashFlowPerMonth, result.totalCapex).toFixed(1)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col25]}>Provider BEP (months)</Text>
              <Text style={[styles.tableCellRight, styles.col25]}>
                {calculateProviderBEP(result10Y.paybackYears).toFixed(1)}
              </Text>
              <Text style={[styles.tableCellRight, styles.col25]}>
                {calculateProviderBEP(result10YOwner.paybackYears).toFixed(1)}
              </Text>
              <Text style={[styles.tableCellRight, styles.col25]}>
                {calculateProviderBEP(result15Y.paybackYears).toFixed(1)}
              </Text>
              <Text style={[styles.tableCellRight, styles.col25]}>
                {calculateProviderBEP(result15YOwner.paybackYears).toFixed(1)}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col25]}>Provider % of Available Rev</Text>
              <Text style={[styles.tableCellRight, styles.col25]}>{fmtPct(providerRevenueShare / 100)}</Text>
              <Text style={[styles.tableCellRight, styles.col25]}>{fmtPct(providerRevenueShare / 100)}</Text>
              <Text style={[styles.tableCellRight, styles.col25]}>{fmtPct(providerRevenueShare / 100)}</Text>
              <Text style={[styles.tableCellRight, styles.col25]}>{fmtPct(providerRevenueShare / 100)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col25]}>Owner % of Available Rev</Text>
              <Text style={[styles.tableCellRight, styles.col25]}>{fmtPct(ownerRevenueShare / 100)}</Text>
              <Text style={[styles.tableCellRight, styles.col25]}>{fmtPct(ownerRevenueShare / 100)}</Text>
              <Text style={[styles.tableCellRight, styles.col25]}>{fmtPct(ownerRevenueShare / 100)}</Text>
              <Text style={[styles.tableCellRight, styles.col25]}>{fmtPct(ownerRevenueShare / 100)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages} - Estimate only. Subject to site survey and contract.`} />
        </View>
      </Page>

      {/* Page 2: IRR Analysis */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>IRR & Cash Flow Analysis</Text>
          
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.col15]}>Year</Text>
              <Text style={[styles.tableCell, styles.col20]}>10Y Provider</Text>
              <Text style={[styles.tableCell, styles.col20]}>10Y Owner</Text>
              <Text style={[styles.tableCell, styles.col20]}>15Y Provider</Text>
              <Text style={[styles.tableCell, styles.col20]}>15Y Owner</Text>
            </View>
            
            {/* Year 0 - Initial Investment */}
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col15]}>0</Text>
              <Text style={[styles.tableCellRight, styles.col20]}>
                {fmtCurrency(-result.totalCapex)}
              </Text>
              <Text style={[styles.tableCellRight, styles.col20]}>
                {fmtCurrency(-result.totalCapex)}
              </Text>
              <Text style={[styles.tableCellRight, styles.col20]}>
                {fmtCurrency(-result.totalCapex)}
              </Text>
              <Text style={[styles.tableCellRight, styles.col20]}>
                {fmtCurrency(-result.totalCapex)}
              </Text>
            </View>

            {/* Year-by-year cash flows */}
            {result10Y.yearlyCashFlows.map((cf) => (
              <View key={cf.year} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.col15]}>{cf.year}</Text>
                <Text style={[styles.tableCellRight, styles.col20]}>
                  {fmtCurrency(cf.providerCashFlow)}
                </Text>
                <Text style={[styles.tableCellRight, styles.col20]}>
                  {fmtCurrency(cf.ownerCashFlow)}
                </Text>
                <Text style={[styles.tableCellRight, styles.col20]}>
                  {result15Y.yearlyCashFlows[cf.year - 1] ? fmtCurrency(result15Y.yearlyCashFlows[cf.year - 1].providerCashFlow) : '-'}
                </Text>
                <Text style={[styles.tableCellRight, styles.col20]}>
                  {result15YOwner.yearlyCashFlows[cf.year - 1] ? fmtCurrency(result15YOwner.yearlyCashFlows[cf.year - 1].ownerCashFlow) : '-'}
                </Text>
              </View>
            ))}
            {/* Add 15Y-only years if term is 15 years */}
            {result15Y.yearlyCashFlows.length > result10Y.yearlyCashFlows.length &&
              result15Y.yearlyCashFlows.slice(result10Y.yearlyCashFlows.length).map((cf) => (
                <View key={cf.year} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.col15]}>{cf.year}</Text>
                  <Text style={[styles.tableCellRight, styles.col20]}>-</Text>
                  <Text style={[styles.tableCellRight, styles.col20]}>-</Text>
                  <Text style={[styles.tableCellRight, styles.col20]}>
                    {fmtCurrency(cf.providerCashFlow)}
                  </Text>
                  <Text style={[styles.tableCellRight, styles.col20]}>
                    {fmtCurrency(cf.ownerCashFlow)}
                  </Text>
                </View>
              ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages} - Estimate only. Subject to site survey and contract.`} />
        </View>
      </Page>

      {/* Page 3: Assumptions */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assumptions</Text>
          
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col30, styles.summaryLabel]}>Build Cost per Unit:</Text>
              <Text style={[styles.tableCell, styles.col30]}>{fmtCurrency(input.buildCostPerUnit)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col30, styles.summaryLabel]}>CPE Cost per Unit:</Text>
              <Text style={[styles.tableCell, styles.col30]}>{fmtCurrency(input.cpeCostPerUnit)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col30, styles.summaryLabel]}>Install Cost per Unit:</Text>
              <Text style={[styles.tableCell, styles.col30]}>{fmtCurrency(input.installCostPerUnit)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col30, styles.summaryLabel]}>Door Fee per Unit:</Text>
              <Text style={[styles.tableCell, styles.col30]}>{fmtCurrency(input.doorFeePerUnit)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col30, styles.summaryLabel]}>Support Opex per Unit per Month:</Text>
              <Text style={[styles.tableCell, styles.col30]}>{fmtCurrency(input.supportOpexPerUnitPerMonth)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col30, styles.summaryLabel]}>Transport Opex per Month:</Text>
              <Text style={[styles.tableCell, styles.col30]}>{fmtCurrency(input.transportOpexPerMonth)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col30, styles.summaryLabel]}>DA Bulk Fee per Unit per Month:</Text>
              <Text style={[styles.tableCell, styles.col30]}>{fmtCurrency(input.daBulkFeePerUnitPerMonth)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col30, styles.summaryLabel]}>Discount Rate:</Text>
              <Text style={[styles.tableCell, styles.col30]}>{fmtPct(input.discountRate)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col30, styles.summaryLabel]}>Lease Up Period:</Text>
              <Text style={[styles.tableCell, styles.col30]}>
                {input.leaseUpMonths > 0 ? `${input.leaseUpMonths} months` : 'N/A'}
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col30, styles.summaryLabel]}>Term Years:</Text>
              <Text style={[styles.tableCell, styles.col30]}>{input.termYears} years</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col30, styles.summaryLabel]}>Funding Source:</Text>
              <Text style={[styles.tableCell, styles.col30]}>
                {input.fundingSource === 'da' ? 'Digital Alpha' :
                 input.fundingSource === 'owner' ? 'Owner / Developer' : 'Internal'}
              </Text>
            </View>
            {input.fundingSource === 'owner' && (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.col30, styles.summaryLabel]}>Owner Loan Interest Rate:</Text>
                <Text style={[styles.tableCell, styles.col30]}>{fmtPct(input.ownerLoanInterestRate)}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages} - Estimate only. Subject to site survey and contract.`} />
        </View>
      </Page>
    </Document>
  );
};

