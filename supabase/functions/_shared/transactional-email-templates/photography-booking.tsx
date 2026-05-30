import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Hummm"

interface PhotographyBookingProps {
  name?: string
  address?: string
  date?: string
}

const PhotographyBookingEmail = ({ name, address, date }: PhotographyBookingProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Photography session confirmed — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brand}>✦ {SITE_NAME}</Text>
        </Section>
        <Heading style={h1}>
          {name ? `${name}, your photography session is booked!` : 'Photography session confirmed!'}
        </Heading>
        <Text style={text}>
          Your professional property photography session{address ? ` for ${address}` : ''} has been confirmed.
        </Text>
        {date && (
          <Section style={dateBox}>
            <Text style={dateLabel}>Scheduled Date</Text>
            <Text style={dateValue}>{date}</Text>
          </Section>
        )}
        <Section style={infoBox}>
          <Text style={infoTitle}>Preparation checklist</Text>
          <Text style={infoText}>✓ Declutter rooms and clear surfaces</Text>
          <Text style={infoText}>✓ Open curtains for natural light</Text>
          <Text style={infoText}>✓ Turn on all interior lights</Text>
          <Text style={infoText}>✓ Ensure kerb appeal — tidy front garden</Text>
        </Section>
        <Section style={ctaSection}>
          <Button style={ctaButton} href="https://hummm.pro/sell">
            View Your Listing Progress
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>{SITE_NAME} · Property Powered by AI.</Text>
        <Text style={footer}>Need to reschedule? Contact hello@hummm.pro</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: PhotographyBookingEmail,
  subject: 'Photography session confirmed — Humm',
  displayName: 'Photography booking',
  previewData: { name: 'Tom Gallagher', address: '8 Park Lane, Leeds LS1', date: 'Thursday 3rd April, 10:00 AM' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '40px 25px', maxWidth: '560px', margin: '0 auto' }
const header = { marginBottom: '24px' }
const brand = { fontSize: '14px', fontWeight: '800' as const, color: '#00b8a9', letterSpacing: '-0.3px', margin: '0' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#0a1428', margin: '0 0 16px', lineHeight: '1.3' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 20px' }
const dateBox = { backgroundColor: '#0a1428', borderRadius: '12px', padding: '20px 24px', textAlign: 'center' as const, margin: '0 0 20px' }
const dateLabel = { fontSize: '11px', color: '#8b9ab5', textTransform: 'uppercase' as const, letterSpacing: '1.5px', margin: '0 0 6px', fontWeight: '600' as const }
const dateValue = { fontSize: '20px', fontWeight: '700' as const, color: '#00b8a9', margin: '0' }
const infoBox = { backgroundColor: '#f0faf9', borderRadius: '12px', padding: '24px', margin: '0 0 24px', borderLeft: '4px solid #00b8a9' }
const infoTitle = { fontSize: '14px', fontWeight: '700' as const, color: '#0a1428', margin: '0 0 12px' }
const infoText = { fontSize: '13px', color: '#55575d', lineHeight: '1.5', margin: '0 0 6px' }
const ctaSection = { textAlign: 'center' as const, margin: '0 0 24px' }
const ctaButton = { backgroundColor: '#00b8a9', color: '#0a1428', fontSize: '14px', fontWeight: '700' as const, padding: '14px 32px', borderRadius: '8px', textDecoration: 'none' }
const hr = { borderColor: '#e9ecef', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '0 0 4px', textAlign: 'center' as const }
