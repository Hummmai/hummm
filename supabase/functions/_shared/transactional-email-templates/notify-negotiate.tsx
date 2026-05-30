import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Hummm"

interface NotifyNegotiateProps {
  name?: string
  email?: string
  tier?: string
  propertyLink?: string
}

const NotifyNegotiateEmail = (props: NotifyNegotiateProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New Negotiate Request – {props.tier || 'Standard'} tier</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brand}>✦ {SITE_NAME} · Admin Notification</Text>
        </Section>
        <Heading style={h1}>New AI Negotiation Activation</Heading>
        <Section style={detailsBox}>
          <Text style={detailRow}><span style={label}>Name:</span> {props.name || '—'}</Text>
          <Text style={detailRow}><span style={label}>Email:</span> {props.email || '—'}</Text>
          <Text style={detailRow}><span style={label}>Package:</span> {props.tier || '—'}</Text>
          {props.propertyLink && (
            <Text style={detailRow}>
              <span style={label}>Property:</span>{' '}
              <Link href={props.propertyLink} style={{ color: '#00b8a9' }}>{props.propertyLink}</Link>
            </Text>
          )}
        </Section>
        <Hr style={hr} />
        <Text style={footer}>{SITE_NAME} · Internal Notification</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: NotifyNegotiateEmail,
  subject: (data: Record<string, any>) => `New Negotiate Request – ${data.tier || 'Standard'} tier`,
  displayName: 'Admin: New Negotiate Request',
  to: 'hello@hummm.pro',
  previewData: { name: 'Jane Smith', email: 'jane@test.com', tier: 'Pro', propertyLink: 'https://rightmove.co.uk/property/123' },
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
