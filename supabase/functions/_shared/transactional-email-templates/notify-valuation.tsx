import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Hummm"

interface NotifyValuationProps {
  address?: string
  name?: string
  email?: string
  phone?: string
  valuationLow?: string
  valuationHigh?: string
  confidence?: number
  propertyType?: string
  bedrooms?: string
  bathrooms?: string
}

const NotifyValuationEmail = (props: NotifyValuationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New Valuation Request – {props.address || 'Unknown address'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brand}>✦ {SITE_NAME} · Admin Notification</Text>
        </Section>
        <Heading style={h1}>New Valuation Request</Heading>
        <Section style={detailsBox}>
          <Text style={detailRow}><span style={label}>Address:</span> {props.address || '—'}</Text>
          <Text style={detailRow}><span style={label}>Name:</span> {props.name || '—'}</Text>
          <Text style={detailRow}><span style={label}>Email:</span> {props.email || '—'}</Text>
          <Text style={detailRow}><span style={label}>Phone:</span> {props.phone || '—'}</Text>
          <Text style={detailRow}><span style={label}>Type:</span> {props.propertyType || '—'}</Text>
          <Text style={detailRow}><span style={label}>Beds / Baths:</span> {props.bedrooms || '?'} / {props.bathrooms || '?'}</Text>
        </Section>
        <Section style={valuationSection}>
          <Text style={valuationLabel}>AI Valuation Result</Text>
          <Text style={valuationValue}>£{props.valuationLow || '—'} – £{props.valuationHigh || '—'}</Text>
          {props.confidence && <Text style={confidenceText}>{props.confidence}% confidence</Text>}
        </Section>
        <Hr style={hr} />
        <Text style={footer}>{SITE_NAME} · Internal Notification</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: NotifyValuationEmail,
  subject: (data: Record<string, any>) => `New Valuation Request – ${data.address || 'Unknown'}`,
  displayName: 'Admin: New Valuation',
  to: 'hello@hummm.pro',
  previewData: { address: '42 Kensington Gardens, W8', name: 'Jane Smith', email: 'jane@test.com', phone: '07700 900000', valuationLow: '450,000', valuationHigh: '495,000', confidence: 87, propertyType: 'Detached', bedrooms: '3', bathrooms: '2' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '40px 25px', maxWidth: '560px', margin: '0 auto' }
const header = { marginBottom: '16px' }
const brand = { fontSize: '12px', fontWeight: '700' as const, color: '#00b8a9', letterSpacing: '-0.2px', margin: '0' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#0a1428', margin: '0 0 20px' }
const detailsBox = { backgroundColor: '#f8f9fa', borderRadius: '10px', padding: '20px', margin: '0 0 20px' }
const detailRow = { fontSize: '13px', color: '#333', margin: '0 0 6px', lineHeight: '1.5' }
const label = { fontWeight: '600' as const, color: '#0a1428' }
const valuationSection = { backgroundColor: '#0a1428', borderRadius: '10px', padding: '24px', textAlign: 'center' as const, margin: '0 0 20px' }
const valuationLabel = { fontSize: '10px', color: '#8b9ab5', textTransform: 'uppercase' as const, letterSpacing: '1.5px', margin: '0 0 6px', fontWeight: '600' as const }
const valuationValue = { fontSize: '28px', fontWeight: '900' as const, color: '#00b8a9', margin: '0 0 4px' }
const confidenceText = { fontSize: '12px', color: '#8b9ab5', margin: '0' }
const hr = { borderColor: '#e9ecef', margin: '20px 0' }
const footer = { fontSize: '11px', color: '#999', margin: '0', textAlign: 'center' as const }
