import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr, Button, Section,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Hummm"

interface NotifyAccessRequestProps {
  name?: string
  email?: string
  reason?: string
  grant_url?: string
}

function NotifyAccessRequest({ name = 'Not provided', email = '', reason = 'Not provided', grant_url = '#' }: NotifyAccessRequestProps) {
  return (
    <Html>
      <Head />
      <Preview>New early access request from {name}</Preview>
      <Body style={{ fontFamily: '-apple-system, system-ui, sans-serif', backgroundColor: '#ffffff', padding: '40px 20px' }}>
        <Container style={{ maxWidth: '560px', margin: '0 auto' }}>
          <Heading style={{ color: '#0a1628', fontSize: '24px', textAlign: 'center' as const }}>
            🔔 New Early Access Request
          </Heading>

          <Section style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
            <Text style={{ margin: '0 0 8px', color: '#334155', fontSize: '15px' }}>
              <strong>Name:</strong> {name}
            </Text>
            <Text style={{ margin: '0 0 8px', color: '#334155', fontSize: '15px' }}>
              <strong>Email:</strong> {email}
            </Text>
            <Text style={{ margin: '0', color: '#334155', fontSize: '15px' }}>
              <strong>Reason:</strong> {reason}
            </Text>
          </Section>

          <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
            <Button
              href={grant_url}
              style={{
                backgroundColor: '#2dd4a8',
                color: '#0a1628',
                padding: '16px 40px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '16px',
              }}
            >
              ✅ Grant Access
            </Button>
          </Section>

          <Text style={{ textAlign: 'center' as const, color: '#94a3b8', fontSize: '12px' }}>
            Clicking this button will approve {email} and send them an access code automatically.
          </Text>

          <Hr style={{ borderColor: '#e2e8f0', margin: '32px 0' }} />
          <Text style={{ textAlign: 'center' as const, color: '#cbd5e1', fontSize: '11px' }}>
            © 2026 {SITE_NAME} AI
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template: TemplateEntry = {
  component: NotifyAccessRequest,
  subject: (data) => `🔔 New Early Access Request from ${data.name || data.email || 'Someone'}`,
  to: 'hello@hummm.pro',
  displayName: 'Admin: Access Request Notification',
  previewData: {
    name: 'Jane Doe',
    email: 'jane@example.com',
    reason: 'Investor interested in property tools',
    grant_url: 'https://example.com/grant',
  },
}

export default NotifyAccessRequest
