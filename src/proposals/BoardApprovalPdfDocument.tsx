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

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: '3 solid #1e40af',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 5,
  },
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
  col20: { width: '20%' },
  col25: { width: '25%' },
  col30: { width: '30%' },
  col35: { width: '35%' },
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
  },
  twoColumn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  column: {
    width: '48%',
  },
});

interface BoardApprovalPdfDocumentProps {
  input: BulkDealInput;
  result: BulkDealResult;
}

export const BoardApprovalPdfDocument: React.FC<BoardApprovalPdfDocumentProps> = ({
  input,
  result,
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate revenue turn-up timing (starts after build timeline completes)
  // Revenue starts in the month AFTER build completes, then lease up period applies
  const revenueStartMonth = result.buildTimelineMonths;
  
  // Calculate DA cash flows by month (starting from month 0)
  const monthlyDaCashFlows: { month: number; amount: number; cumulative: number }[] = [];
  let cumulativeDaReceived = 0;
  
  // Month 0: DA invests (if DA funded)
  if (input.fundingSource === 'da') {
    monthlyDaCashFlows.push({
      month: 0,
      amount: -result.totalCapex,
      cumulative: -result.totalCapex,
    });
    cumulativeDaReceived = -result.totalCapex;
  }
  
  // Build phase: capital outflow (no revenue, no DA payments)
  for (let month = 1; month <= result.buildTimelineMonths; month++) {
    monthlyDaCashFlows.push({
      month,
      amount: 0,
      cumulative: cumulativeDaReceived,
    });
  }
  
  // Revenue phase: calculate monthly DA payments with waterfall
  // Use yearly cash flows and interpolate to monthly
  const baseDaPaymentPerMonth = input.daBulkFeePerUnitPerMonth * input.units;
  const daInvestment = result.totalCapex;
  const moic2x = daInvestment * 2.0;
  const moic2_5x = daInvestment * 2.5;
  const moic3x = daInvestment * 3.0;
  
  let cumulativeDaPayments = 0;
  let revenueMonth = 0; // Track months since revenue started
  
  // Generate monthly cash flows from revenue start through term end
  for (let month = revenueStartMonth + 1; month <= revenueStartMonth + (input.termYears * 12); month++) {
    revenueMonth++;
    
    // Lease up multiplier (only applies to greenfield)
    const leaseUpMultiplier = input.constructionType === 'greenfield' && input.leaseUpMonths > 0 && revenueMonth <= input.leaseUpMonths
      ? revenueMonth / input.leaseUpMonths
      : 1.0;
    
    // Determine DA payment rate based on cumulative MOIC
    let daPaymentRate = input.fundingSource === 'da' ? 1.0 : 0.0;
    if (input.fundingSource === 'da') {
      if (cumulativeDaPayments >= moic3x) {
        daPaymentRate = 0.0;
      } else if (cumulativeDaPayments >= moic2_5x) {
        daPaymentRate = 0.25;
      } else if (cumulativeDaPayments >= moic2x) {
        daPaymentRate = 0.5;
      }
    }
    
    const daPaymentThisMonth = baseDaPaymentPerMonth * daPaymentRate * leaseUpMultiplier;
    cumulativeDaPayments += daPaymentThisMonth;
    cumulativeDaReceived += daPaymentThisMonth;
    
    monthlyDaCashFlows.push({
      month,
      amount: daPaymentThisMonth,
      cumulative: cumulativeDaReceived,
    });
  }

  return (
    <Document>
      {/* Page 1: Executive Summary */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Deal Approval Document</Text>
              <Text style={styles.subtitle}>EllumNet, LLC</Text>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827', marginTop: 10 }}>
                {input.propertyName}
              </Text>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          
          <View style={styles.twoColumn}>
            <View style={styles.column}>
              <View style={styles.highlightBox}>
                <Text style={styles.highlightLabel}>Total Capital Required</Text>
                <Text style={styles.highlightValue}>{fmtCurrency(result.totalCapex)}</Text>
              </View>
            </View>
            <View style={styles.column}>
              <View style={styles.highlightBox}>
                <Text style={styles.highlightLabel}>Term</Text>
                <Text style={styles.highlightValue}>{input.termYears} Years</Text>
              </View>
            </View>
          </View>

          <View style={styles.twoColumn}>
            <View style={styles.column}>
              <View style={styles.highlightBox}>
                <Text style={styles.highlightLabel}>Build Timeline</Text>
                <Text style={styles.highlightValue}>{result.buildTimelineMonths} Months</Text>
              </View>
            </View>
            <View style={styles.column}>
              <View style={styles.highlightBox}>
                <Text style={styles.highlightLabel}>Revenue Start</Text>
                <Text style={styles.highlightValue}>Month {revenueStartMonth + 1}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Capital Usage Breakdown</Text>
          
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.col35, styles.tableHeaderText]}>CapEx Item</Text>
              <Text style={[styles.tableCell, styles.col25, styles.tableHeaderText]}>Cost per Unit</Text>
              <Text style={[styles.tableCell, styles.col25, styles.tableHeaderText]}>Total Cost</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col35]}>Fiber Installation</Text>
              <Text style={[styles.tableCellRight, styles.col25]}>{fmtCurrency(input.buildCostPerUnit)}</Text>
              <Text style={[styles.tableCellRight, styles.col25]}>{fmtCurrency(input.buildCostPerUnit * input.units)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col35]}>CPE (Customer Equipment)</Text>
              <Text style={[styles.tableCellRight, styles.col25]}>{fmtCurrency(input.cpeCostPerUnit)}</Text>
              <Text style={[styles.tableCellRight, styles.col25]}>{fmtCurrency(input.cpeCostPerUnit * input.units)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col35]}>Installation Labor</Text>
              <Text style={[styles.tableCellRight, styles.col25]}>{fmtCurrency(input.installCostPerUnit)}</Text>
              <Text style={[styles.tableCellRight, styles.col25]}>{fmtCurrency(input.installCostPerUnit * input.units)}</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col35]}>OLT / OLT Ports</Text>
              <Text style={[styles.tableCellRight, styles.col25]}>{fmtCurrency(input.oltCostPerUnit)}</Text>
              <Text style={[styles.tableCellRight, styles.col25]}>{fmtCurrency(input.oltCostPerUnit * input.units)}</Text>
            </View>
            
            {input.doorFeePerUnit > 0 && (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.col35]}>Door Fee</Text>
                <Text style={[styles.tableCellRight, styles.col25]}>{fmtCurrency(input.doorFeePerUnit)}</Text>
                <Text style={[styles.tableCellRight, styles.col25]}>{fmtCurrency(input.doorFeePerUnit * input.units)}</Text>
              </View>
            )}
            
            <View style={[styles.tableRow, { backgroundColor: '#f0fdf4', fontWeight: 'bold' }]}>
              <Text style={[styles.tableCell, styles.col35, { fontWeight: 'bold' }]}>Total CapEx</Text>
              <Text style={[styles.tableCellRight, styles.col25, { fontWeight: 'bold' }]}>{fmtCurrency(result.capexPerUnit)}</Text>
              <Text style={[styles.tableCellRight, styles.col25, { fontWeight: 'bold', color: '#059669' }]}>{fmtCurrency(result.totalCapex)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>

      {/* Page 2: Capital Outflow Timing */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Capital Outflow Schedule</Text>
          <Text style={{ fontSize: 9, color: '#6b7280', marginBottom: 15 }}>
            Capital is spent over the build timeline: 50% for fiber installation (first half), equipment costs in final month
          </Text>
          
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.col20, styles.tableHeaderText]}>Month</Text>
              <Text style={[styles.tableCell, styles.col30, styles.tableHeaderText]}>Description</Text>
              <Text style={[styles.tableCell, styles.col25, styles.tableHeaderText]}>Monthly Outflow</Text>
              <Text style={[styles.tableCell, styles.col25, styles.tableHeaderText]}>Cumulative</Text>
            </View>
            
            {result.capitalOutflowSchedule.map((item) => (
              <View key={item.month} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.col20]}>{item.month}</Text>
                <Text style={[styles.tableCell, styles.col30]}>{item.description}</Text>
                <Text style={[styles.tableCellRight, styles.col25, { color: item.amount > 0 ? '#dc2626' : '#1f2937' }]}>
                  {item.amount > 0 ? fmtCurrency(item.amount) : '-'}
                </Text>
                <Text style={[styles.tableCellRight, styles.col25]}>
                  {fmtCurrency(result.capitalOutflowSchedule.slice(0, item.month).reduce((sum, i) => sum + i.amount, 0))}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue Turn-Up Timeline</Text>
          
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.col30, styles.tableHeaderText]}>Phase</Text>
              <Text style={[styles.tableCell, styles.col20, styles.tableHeaderText]}>Start Month</Text>
              <Text style={[styles.tableCell, styles.col25, styles.tableHeaderText]}>Duration</Text>
              <Text style={[styles.tableCell, styles.col25, styles.tableHeaderText]}>Notes</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col30]}>Build Phase</Text>
              <Text style={[styles.tableCell, styles.col20]}>Month 1</Text>
              <Text style={[styles.tableCell, styles.col25]}>{result.buildTimelineMonths} months</Text>
              <Text style={[styles.tableCell, styles.col25]}>Fiber installation & equipment</Text>
            </View>
            
            {input.leaseUpMonths > 0 && (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.col30]}>Lease Up Phase</Text>
                <Text style={[styles.tableCell, styles.col20]}>Month {result.buildTimelineMonths + 1}</Text>
                <Text style={[styles.tableCell, styles.col25]}>{input.leaseUpMonths} months</Text>
                <Text style={[styles.tableCell, styles.col25]}>Revenue ramp-up</Text>
              </View>
            )}
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col30]}>Full Revenue Phase</Text>
              <Text style={[styles.tableCell, styles.col20]}>Month {revenueStartMonth + (input.leaseUpMonths > 0 ? input.leaseUpMonths + 1 : 1)}</Text>
              <Text style={[styles.tableCell, styles.col25]}>{input.termYears * 12 - (input.leaseUpMonths || 0)} months</Text>
              <Text style={[styles.tableCell, styles.col25]}>100% revenue generation</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>

      {/* Page 3: DA Cash Flow Analysis */}
      <Page size="LETTER" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DA Cash Flow Analysis</Text>
          <Text style={{ fontSize: 9, color: '#6b7280', marginBottom: 15 }}>
            Monthly cash flows to Digital Alpha over the {input.termYears}-year term, including waterfall reductions
          </Text>
          
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.col20, styles.tableHeaderText]}>Month</Text>
              <Text style={[styles.tableCell, styles.col30, styles.tableHeaderText]}>DA Payment</Text>
              <Text style={[styles.tableCell, styles.col25, styles.tableHeaderText]}>Cumulative</Text>
              <Text style={[styles.tableCell, styles.col25, styles.tableHeaderText]}>MOIC</Text>
            </View>
            
            {/* Show first 24 months in detail, then quarterly */}
            {monthlyDaCashFlows.slice(0, 24).map((cf) => {
              const moic = input.fundingSource === 'da' && cf.cumulative > 0 
                ? (cf.cumulative + result.totalCapex) / result.totalCapex 
                : 0;
              
              return (
                <View key={cf.month} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.col20]}>{cf.month}</Text>
                  <Text style={[styles.tableCellRight, styles.col30, { color: cf.amount > 0 ? '#059669' : cf.amount < 0 ? '#dc2626' : '#1f2937' }]}>
                    {cf.amount !== 0 ? fmtCurrency(cf.amount) : '-'}
                  </Text>
                  <Text style={[styles.tableCellRight, styles.col25]}>{fmtCurrency(cf.cumulative)}</Text>
                  <Text style={[styles.tableCellRight, styles.col25]}>
                    {moic > 0 ? moic.toFixed(2) + 'x' : '-'}
                  </Text>
                </View>
              );
            })}
            
            {/* Quarterly summary for remaining months */}
            {monthlyDaCashFlows.length > 24 && (
              <>
                <View style={[styles.tableRow, { backgroundColor: '#f9fafb' }]}>
                  <Text style={[styles.tableCell, styles.col20, { fontStyle: 'italic' }]}>...</Text>
                  <Text style={[styles.tableCell, styles.col30, { fontStyle: 'italic' }]}>Quarterly averages</Text>
                  <Text style={[styles.tableCell, styles.col25]}></Text>
                  <Text style={[styles.tableCell, styles.col25]}></Text>
                </View>
                
                {Array.from({ length: Math.ceil((monthlyDaCashFlows.length - 24) / 3) }, (_, i) => {
                  const quarterStart = 24 + i * 3;
                  const quarterEnd = Math.min(quarterStart + 3, monthlyDaCashFlows.length);
                  const quarterFlows = monthlyDaCashFlows.slice(quarterStart, quarterEnd);
                  const avgPayment = quarterFlows.reduce((sum, cf) => sum + cf.amount, 0) / quarterFlows.length;
                  const endCumulative = quarterFlows[quarterFlows.length - 1]?.cumulative || 0;
                  const moic = input.fundingSource === 'da' && endCumulative > 0 
                    ? (endCumulative + result.totalCapex) / result.totalCapex 
                    : 0;
                  
                  return (
                    <View key={`q-${i}`} style={styles.tableRow}>
                      <Text style={[styles.tableCell, styles.col20]}>Q{Math.floor(quarterStart / 3) + 1}</Text>
                      <Text style={[styles.tableCellRight, styles.col30]}>{fmtCurrency(avgPayment)}</Text>
                      <Text style={[styles.tableCellRight, styles.col25]}>{fmtCurrency(endCumulative)}</Text>
                      <Text style={[styles.tableCellRight, styles.col25]}>{moic > 0 ? moic.toFixed(2) + 'x' : '-'}</Text>
                    </View>
                  );
                })}
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DA Waterfall Milestones</Text>
          
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.col35, styles.tableHeaderText]}>Milestone</Text>
              <Text style={[styles.tableCell, styles.col25, styles.tableHeaderText]}>Target Amount</Text>
              <Text style={[styles.tableCell, styles.col25, styles.tableHeaderText]}>Reached At</Text>
              <Text style={[styles.tableCell, styles.col25, styles.tableHeaderText]}>Payment Rate</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col35]}>2.0x MOIC</Text>
              <Text style={[styles.tableCellRight, styles.col25]}>{fmtCurrency(result.daWaterfall.moic2xAmount)}</Text>
              <Text style={[styles.tableCellRight, styles.col25]}>
                {result.daWaterfall.moic2xMonth ? `Month ${result.daWaterfall.moic2xMonth}` : 'Not reached'}
              </Text>
              <Text style={[styles.tableCellRight, styles.col25]}>50%</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col35]}>2.5x MOIC</Text>
              <Text style={[styles.tableCellRight, styles.col25]}>{fmtCurrency(result.daWaterfall.moic2_5xAmount)}</Text>
              <Text style={[styles.tableCellRight, styles.col25]}>
                {result.daWaterfall.moic2_5xMonth ? `Month ${result.daWaterfall.moic2_5xMonth}` : 'Not reached'}
              </Text>
              <Text style={[styles.tableCellRight, styles.col25]}>25%</Text>
            </View>
            
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.col35]}>3.0x MOIC</Text>
              <Text style={[styles.tableCellRight, styles.col25]}>{fmtCurrency(result.daWaterfall.moic3xAmount)}</Text>
              <Text style={[styles.tableCellRight, styles.col25]}>
                {result.daWaterfall.moic3xMonth ? `Month ${result.daWaterfall.moic3xMonth}` : 'Not reached'}
              </Text>
              <Text style={[styles.tableCellRight, styles.col25]}>0%</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
};

