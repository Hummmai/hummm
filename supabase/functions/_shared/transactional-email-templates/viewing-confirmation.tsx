import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Hummm"

interface ViewingConfirmationProps {
  propertyAddress?: string
}

const ViewingConfirmationEmail = ({ propertyAddress }: ViewingConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your viewing has been confirmed — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Text style={logo}>Humm</Text>
        </Section>
        <Heading style={h1}>Viewing Confirmed! 🎉</Heading>
        <Text style={text}>
          Great news — the seller has approved your viewing request
          {propertyAddress ? ` for ${propertyAddress}` : ''}.
        </Text>
        <Text style={text}>
          The seller will be in touch with the exact date and time. Keep an eye on your Humm dashboard for updates.
        </Text>
        <Hr style={hr} />
        <Text style={footer}>
          {SITE_NAME} — The smarter way to move · hummm.pro
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ViewingConfirmationEmail,
  subject: 'Your viewing has been confirmed!',
  displayName: 'Viewing confirmation',
  previewData: { propertyAddress: '42 Maple Drive, London SW1A 1AA' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Arial', 'Helvetica', sans-serif" }
const container = { padding: '32px 28px', maxWidth: '520px', margin: '0 auto' }
const logoSection = { marginBottom: '24px' }
const logo = { fontSize: '28px', fontWeight: '800' as const, color: '#0D9488', margin: '0' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#111827', margin: '0 0 16px' }
const text = { fontSize: '14px', color: '#4B5563', lineHeight: '1.6', margin: '0 0 16px' }
const hr = { borderColor: '#E5E7EB', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#9CA3AF', margin: '0' }
