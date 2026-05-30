import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Hummm"

interface NotifySellProps {
  address?: string
  name?: string
  email?: string
  phone?: string
  propertyType?: string
  bedrooms?: string
  bathrooms?: string
  askingPrice?: string
  photoCount?: number
}

const NotifySellEmail = (props: NotifySellProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New Sell Instruction – {props.address || 'Unknown'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brand}>✦ {SITE_NAME} · Admin Notification</Text>
        </Section>
        <Heading style={h1}>New Sell Instruction Received</Heading>
        <Section style={detailsBox}>
          <Text style={detailRow}><span style={label}>Address:</span> {props.address || '—'}</Text>
          <Text style={detailRow}><span style={label}>Name:</span> {props.name || '—'}</Text>
          <Text style={detailRow}><span style={label}>Email:</span> {props.email || '—'}</Text>
          <Text style={detailRow}><span style={label}>Phone:</span> {props.phone || '—'}</Text>
          <Text style={detailRow}><span style={label}>Type:</span> {props.propertyType || '—'}</Text>
          <Text style={detailRow}><span style={label}>Beds / Baths:</span> {props.bedrooms || '?'} / {props.bathrooms || '?'}</Text>
          <Text style={detailRow}><span style={label}>Asking Price:</span> {props.askingPrice || 'Not set'}</Text>
          <Text style={detailRow}><span style={label}>Photos Uploaded:</span> {props.photoCount ?? 0}</Text>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>{SITE_NAME} · Internal Notification</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: NotifySellEmail,
  subject: (data: Record<string, any>) => `New Sell Instruction – ${data.address || 'Unknown'}`,
  displayName: 'Admin: New Sell Instruction',
  to: 'hello@hummm.pro',
  previewData: { address: '10 Elm Road, SW1', name: 'John Doe', email: 'john@test.com', phone: '07700 900001', propertyType: 'Flat', bedrooms: '2', bathrooms: '1', askingPrice: '£350,000', photoCount: 5 },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '40px 25px', maxWidth: '560px', margin: '0 auto' }
const header = { marginBottom: '16px' }
const brand = { fontSize: '12px', fontWeight: '700' as const, color: '#00b8a9', margin: '0' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#0a1428', margin: '0 0 20px' }
const detailsBox = { backgroundColor: '#f8f9fa', borderRadius: '10px', padding: '20px', margin: '0 0 20px' }
const detailRow = { fontSize: '13px', color: '#333', margin: '0 0 6px', lineHeight: '1.5' }
const label = { fontWeight: '600' as const, color: '#0a1428' }
const hr = { borderColor: '#e9ecef', margin: '20px 0' }
const footer = { fontSize: '11px', color: '#999', margin: '0', textAlign: 'center' as const }
