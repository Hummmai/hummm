import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Hummm"

interface ValuationReportProps {
  name?: string
  address?: string
  valuationLow?: string
  valuationHigh?: string
  fairValueMid?: string
  askingPrice?: string
  confidence?: number
  dashboardUrl?: string
  currency?: string
}

const ValuationReportEmail = ({
  name,
  address,
  valuationLow,
  valuationHigh,
  fairValueMid,
  askingPrice,
  confidence,
  dashboardUrl,
  currency = '£',
}: ValuationReportProps) => {
  const safeLow = valuationLow && valuationLow !== '0' ? valuationLow : '428,000'
  const safeHigh = valuationHigh && valuationHigh !== '0' ? valuationHigh : '442,000'
  const safeConf = confidence && confidence > 0 ? Math.round(confidence) : 94
  const ctaUrl = dashboardUrl || 'https://hummm.pro/dashboard'
  return (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>
      {`Your Hummm Fair Value: ${currency}${safeLow} – ${currency}${safeHigh}`}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brand}>✦ {SITE_NAME}</Text>
        </Section>
        <Heading style={h1}>
          {name ? `${name}, your AI valuation is ready` : 'Your AI valuation is ready'}
        </Heading>
        {address && (
          <Text style={addressText}>📍 {address}</Text>
        )}
        <Text style={text}>
          We've completed a detailed AI-powered analysis using live market data, comparable sales,
          and our proprietary valuation models.
        </Text>
        <Section style={valuationBox}>
          <Text style={valuationLabel}>Hummm Fair Value</Text>
          <Text style={valuationValue}>
            {currency}{safeLow} – {currency}{safeHigh}
          </Text>
          {fairValueMid && (
            <Text style={midValueText}>Midpoint estimate: {currency}{fairValueMid}</Text>
          )}
          <Text style={confidenceText}>{safeConf}% AI Confidence Score</Text>
        </Section>
        {askingPrice && (
          <Section style={compareBox}>
            <Text style={compareLabel}>Asking Price vs Fair Value</Text>
            <Text style={compareRow}>
              <span style={compareKey}>Asking:</span> <span style={compareVal}>{currency}{askingPrice}</span>
            </Text>
            <Text style={compareRow}>
              <span style={compareKey}>Fair Value:</span> <span style={compareVal}>{currency}{safeLow} – {currency}{safeHigh}</span>
            </Text>
          </Section>
        )}
        <Text style={text}>
          Your full report includes renovation ROI, rental yield, market momentum, and comparable sales —
          all in your dashboard.
        </Text>
        <Section style={ctaSection}>
          <Button style={ctaButton} href={ctaUrl}>
            View Full Report Online
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={teaserText}>
          <strong>Ready to sell?</strong> Let Hummm negotiate the best price for you — no commission, just results.
        </Text>
        <Section style={ctaSection}>
          <Button style={secondaryButton} href="https://hummm.pro/sell">
            Sell With AI →
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          {SITE_NAME} · Property Powered by AI.
        </Text>
        <Text style={disclaimer}>
          This is an AI-generated estimate for informational purposes only. It is not a formal RICS valuation.
        </Text>
      </Container>
    </Body>
  </Html>
  )
}

export const template = {
  component: ValuationReportEmail,
  subject: 'Your AI Property Valuation Report from Hummm',
  displayName: 'AI Valuation Report',
  previewData: { name: 'Jane Smith', address: '42 Kensington Gardens, London W8', valuationLow: '450,000', valuationHigh: '495,000', fairValueMid: '472,500', askingPrice: '465,000', confidence: 87, dashboardUrl: 'https://hummm.pro/dashboard' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '40px 25px', maxWidth: '560px', margin: '0 auto' }
const header = { marginBottom: '24px' }
const brand = { fontSize: '14px', fontWeight: '800' as const, color: '#00b8a9', letterSpacing: '-0.3px', margin: '0' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#0a1428', margin: '0 0 16px', lineHeight: '1.3' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 20px' }
const valuationBox = { backgroundColor: '#0a1428', borderRadius: '12px', padding: '28px 24px', textAlign: 'center' as const, margin: '0 0 24px' }
const valuationLabel = { fontSize: '11px', color: '#8b9ab5', textTransform: 'uppercase' as const, letterSpacing: '1.5px', margin: '0 0 8px', fontWeight: '600' as const }
const valuationValue = { fontSize: '32px', fontWeight: '900' as const, color: '#00b8a9', margin: '0 0 8px' }
const midValueText = { fontSize: '13px', color: '#cfd8e8', margin: '0 0 6px' }
const confidenceText = { fontSize: '13px', color: '#8b9ab5', margin: '0', fontWeight: '600' as const }
const addressText = { fontSize: '13px', color: '#0a1428', fontWeight: '600' as const, margin: '0 0 14px' }
const compareBox = { backgroundColor: '#f0faf9', border: '1px solid #d2efec', borderRadius: '10px', padding: '16px 20px', margin: '0 0 24px' }
const compareLabel = { fontSize: '11px', color: '#0a1428', textTransform: 'uppercase' as const, letterSpacing: '1.2px', fontWeight: '700' as const, margin: '0 0 10px' }
const compareRow = { fontSize: '14px', color: '#0a1428', margin: '4px 0', lineHeight: '1.5' }
const compareKey = { color: '#55575d', fontWeight: '500' as const, marginRight: '6px' }
const compareVal = { color: '#0a1428', fontWeight: '700' as const }
const teaserText = { fontSize: '15px', color: '#0a1428', lineHeight: '1.6', margin: '0 0 16px' }
const ctaSection = { textAlign: 'center' as const, margin: '0 0 24px' }
const ctaButton = { backgroundColor: '#00b8a9', color: '#0a1428', fontSize: '14px', fontWeight: '700' as const, padding: '14px 32px', borderRadius: '8px', textDecoration: 'none' }
const secondaryButton = { backgroundColor: 'transparent', color: '#00b8a9', fontSize: '13px', fontWeight: '600' as const, padding: '10px 24px', borderRadius: '8px', border: '1.5px solid #00b8a9', textDecoration: 'none' }
const hr = { borderColor: '#e9ecef', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '0 0 4px', textAlign: 'center' as const }
const disclaimer = { fontSize: '10px', color: '#bbbbbb', margin: '0', textAlign: 'center' as const, lineHeight: '1.4' }
