import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Hummm"

interface SellConfirmationProps {
  name?: string
  address?: string
}

const SellConfirmationEmail = ({ name, address }: SellConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>We've received your listing request — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brand}>✦ {SITE_NAME}</Text>
        </Section>
        <Heading style={h1}>
          {name ? `Thank you, ${name}!` : 'Thank you!'}
        </Heading>
        <Text style={text}>
          We've received your listing request{address ? ` for ${address}` : ''} and our team is reviewing it now.
        </Text>
        <Section style={infoBox}>
          <Text style={infoTitle}>What happens next?</Text>
          <Text style={infoText}>1. Our AI analyses your property and generates marketing materials</Text>
          <Text style={infoText}>2. A dedicated property expert reviews everything</Text>
          <Text style={infoText}>3. We contact you within 2 hours to finalise your listing</Text>
        </Section>
        <Section style={ctaSection}>
          <Button style={ctaButton} href="https://hummm.pro/valuation">
            Get a Free AI Valuation While You Wait
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>{SITE_NAME} · Property Powered by AI.</Text>
        <Text style={footer}>Questions? Reply to this email or contact hello@hummm.pro</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: SellConfirmationEmail,
  subject: 'Your listing request has been received — Humm',
  displayName: 'Sell listing confirmation',
  previewData: { name: 'James Taylor', address: '15 Maple Drive, Manchester M20' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '40px 25px', maxWidth: '560px', margin: '0 auto' }
const header = { marginBottom: '24px' }
const brand = { fontSize: '14px', fontWeight: '800' as const, color: '#00b8a9', letterSpacing: '-0.3px', margin: '0' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#0a1428', margin: '0 0 16px', lineHeight: '1.3' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 20px' }
const infoBox = { backgroundColor: '#f0faf9', borderRadius: '12px', padding: '24px', margin: '0 0 24px', borderLeft: '4px solid #00b8a9' }
const infoTitle = { fontSize: '14px', fontWeight: '700' as const, color: '#0a1428', margin: '0 0 12px' }
const infoText = { fontSize: '13px', color: '#55575d', lineHeight: '1.5', margin: '0 0 6px' }
const ctaSection = { textAlign: 'center' as const, margin: '0 0 24px' }
const ctaButton = { backgroundColor: '#00b8a9', color: '#0a1428', fontSize: '14px', fontWeight: '700' as const, padding: '14px 32px', borderRadius: '8px', textDecoration: 'none' }
const hr = { borderColor: '#e9ecef', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '0 0 4px', textAlign: 'center' as const }
