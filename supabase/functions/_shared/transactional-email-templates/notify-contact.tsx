import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Hummm"

interface NotifyContactProps {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  formType?: string
  interest?: string
  message?: string
}

const NotifyContactEmail = (props: NotifyContactProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New Contact Enquiry – {props.formType || 'General'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brand}>✦ {SITE_NAME} · Admin Notification</Text>
        </Section>
        <Heading style={h1}>New Contact Form Submission</Heading>
        <Section style={typeTag}>
          <Text style={tagText}>{props.formType === 'consultation' ? '📞 Strategy Call Request' : '🏠 Property Listing Enquiry'}</Text>
        </Section>
        <Section style={detailsBox}>
          <Text style={detailRow}><span style={label}>Name:</span> {props.firstName || ''} {props.lastName || ''}</Text>
          <Text style={detailRow}><span style={label}>Email:</span> {props.email || '—'}</Text>
          <Text style={detailRow}><span style={label}>Phone:</span> {props.phone || '—'}</Text>
          {props.interest && <Text style={detailRow}><span style={label}>Interest:</span> {props.interest}</Text>}
          {props.message && <Text style={detailRow}><span style={label}>Message:</span> {props.message}</Text>}
        </Section>
        <Hr style={hr} />
        <Text style={footer}>{SITE_NAME} · Internal Notification</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: NotifyContactEmail,
  subject: (data: Record<string, any>) => `New Contact Enquiry – ${data.formType === 'consultation' ? 'Strategy Call' : 'Listing'}`,
  displayName: 'Admin: Contact Enquiry',
  to: 'hello@hummm.pro',
  previewData: { firstName: 'Jane', lastName: 'Smith', email: 'jane@test.com', phone: '07700 900000', formType: 'consultation', interest: 'Sell my property', message: 'I want to sell my 3-bed house in Kensington.' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '40px 25px', maxWidth: '560px', margin: '0 auto' }
const header = { marginBottom: '16px' }
const brand = { fontSize: '12px', fontWeight: '700' as const, color: '#00b8a9', margin: '0' }
const h1 = { fontSize: '22px', fontWeight: '700' as const, color: '#0a1428', margin: '0 0 20px' }
const typeTag = { backgroundColor: '#0a1428', borderRadius: '8px', padding: '12px 16px', margin: '0 0 16px' }
const tagText = { fontSize: '13px', fontWeight: '600' as const, color: '#00b8a9', margin: '0' }
const detailsBox = { backgroundColor: '#f8f9fa', borderRadius: '10px', padding: '20px', margin: '0 0 20px' }
const detailRow = { fontSize: '13px', color: '#333', margin: '0 0 6px', lineHeight: '1.5' }
const label = { fontWeight: '600' as const, color: '#0a1428' }
const hr = { borderColor: '#e9ecef', margin: '20px 0' }
const footer = { fontSize: '11px', color: '#999', margin: '0', textAlign: 'center' as const }
