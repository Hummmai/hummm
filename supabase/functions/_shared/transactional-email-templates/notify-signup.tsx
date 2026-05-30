import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Hummmingbird AI"

interface NotifySignupProps {
  name?: string
  email?: string
  provider?: string
  role?: string
}

const NotifySignupEmail = ({ name, email, provider, role }: NotifySignupProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New sign-up: {email || 'Unknown'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <div style={logoBanner}>
          <Heading style={logoText}>Hummmingbird AI</Heading>
          <Text style={tagline}>Admin Notification</Text>
        </div>
        <Heading style={h1}>New User Sign-Up</Heading>
        <Text style={text}>A new user has just created an account on {SITE_NAME}:</Text>
        <div style={detailsBox}>
          <Text style={detailRow}><strong>Name:</strong> {name || '—'}</Text>
          <Text style={detailRow}><strong>Email:</strong> {email || '—'}</Text>
          <Text style={detailRow}><strong>Provider:</strong> {provider || 'email'}</Text>
          {role && <Text style={detailRow}><strong>Role:</strong> {role}</Text>}
        </div>
        <Hr style={hr} />
        <Text style={footer}>This is an automated notification from {SITE_NAME}.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: NotifySignupEmail,
  subject: (data: Record<string, any>) => `New sign-up: ${data.email || 'Unknown'}`,
  to: 'hello@hummm.pro',
  displayName: 'Admin: signup notification',
  previewData: { name: 'Jane Doe', email: 'jane@example.com', provider: 'email', role: 'buyer' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '0 25px 30px' }
const logoBanner = { backgroundColor: '#0A1428', padding: '24px 25px', marginBottom: '30px', borderRadius: '0 0 8px 8px' }
const logoText = { color: '#00E5CC', fontSize: '24px', fontWeight: 'bold' as const, margin: '0', letterSpacing: '-0.5px' }
const tagline = { color: 'rgba(255,255,255,0.5)', fontSize: '11px', margin: '4px 0 0', textTransform: 'uppercase' as const, letterSpacing: '1px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#0A1428', margin: '0 0 16px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 16px' }
const detailsBox = { backgroundColor: '#f8f9fa', borderRadius: '8px', padding: '16px 20px', margin: '0 0 16px', border: '1px solid #e9ecef' }
const detailRow = { fontSize: '14px', color: '#333', margin: '0 0 8px', lineHeight: '1.5' }
const hr = { borderColor: '#e5e5e5', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '0' }
