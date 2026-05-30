import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Hummm"

interface NegotiateActivationProps {
  name?: string
  tier?: string
  propertyLink?: string
}

const NegotiateActivationEmail = ({ name, tier, propertyLink }: NegotiateActivationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your AI Negotiator is now active — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brand}>✦ {SITE_NAME}</Text>
        </Section>
        <Heading style={h1}>
          {name ? `${name}, your AI Negotiator is live!` : 'Your AI Negotiator is live!'}
        </Heading>
        <Text style={text}>
          Your {tier || 'Pro'} AI Negotiation package has been activated. Our AI is already analysing the property and preparing your personalised strategy.
        </Text>
        {propertyLink && (
          <Section style={infoBox}>
            <Text style={infoTitle}>Property</Text>
            <Text style={infoText}>{propertyLink}</Text>
          </Section>
        )}
        <Section style={infoBox}>
          <Text style={infoTitle}>What's happening now</Text>
          <Text style={infoText}>✓ AI is analysing market data and comparable sales</Text>
          <Text style={infoText}>✓ Building a personalised negotiation strategy</Text>
          <Text style={infoText}>✓ Preparing outreach via email, SMS, and voice</Text>
          <Text style={infoText}>✓ You'll receive live updates at every step</Text>
        </Section>
        <Section style={ctaSection}>
          <Button style={ctaButton} href="https://hummm.pro/negotiate">
            Track Your Negotiation
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>{SITE_NAME} · Property Powered by AI.</Text>
        <Text style={footer}>Questions? Contact hello@hummm.pro</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: NegotiateActivationEmail,
  subject: 'Your AI Negotiator is now active — Humm',
  displayName: 'Negotiate activation',
  previewData: { name: 'Sarah Williams', tier: 'Pro', propertyLink: 'https://www.rightmove.co.uk/properties/12345' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '40px 25px', maxWidth: '560px', margin: '0 auto' }
const header = { marginBottom: '24px' }
const brand = { fontSize: '14px', fontWeight: '800' as const, color: '#00b8a9', letterSpacing: '-0.3px', margin: '0' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#0a1428', margin: '0 0 16px', lineHeight: '1.3' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 20px' }
const infoBox = { backgroundColor: '#f0faf9', borderRadius: '12px', padding: '24px', margin: '0 0 16px', borderLeft: '4px solid #00b8a9' }
const infoTitle = { fontSize: '14px', fontWeight: '700' as const, color: '#0a1428', margin: '0 0 12px' }
const infoText = { fontSize: '13px', color: '#55575d', lineHeight: '1.5', margin: '0 0 6px' }
const ctaSection = { textAlign: 'center' as const, margin: '8px 0 24px' }
const ctaButton = { backgroundColor: '#00b8a9', color: '#0a1428', fontSize: '14px', fontWeight: '700' as const, padding: '14px 32px', borderRadius: '8px', textDecoration: 'none' }
const hr = { borderColor: '#e9ecef', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '0 0 4px', textAlign: 'center' as const }
