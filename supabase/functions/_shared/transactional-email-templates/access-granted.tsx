import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr, Button, Section,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Hummm"

interface AccessGrantedProps {
  name?: string
  access_code?: string
  site_url?: string
}

function AccessGranted({ name = 'there', access_code = 'HUMM-XXXX', site_url = '#' }: AccessGrantedProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Hummm access code is ready!</Preview>
      <Body style={{ fontFamily: '-apple-system, system-ui, sans-serif', backgroundColor: '#ffffff', padding: '40px 20px' }}>
        <Container style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' as const }}>
          <Heading style={{ color: '#0a1628', fontSize: '28px', margin: '0 0 16px' }}>
            🎉 Welcome to Hummm!
          </Heading>
          <Text style={{ color: '#334155', fontSize: '16px', lineHeight: '1.6' }}>
            Hi {name}, your early access request has been approved!
          </Text>

          <Section style={{ backgroundColor: '#f0fdf9', border: '2px solid #2dd4a8', borderRadius: '16px', padding: '32px', margin: '24px 0' }}>
            <Text style={{ color: '#64748b', fontSize: '13px', margin: '0 0 8px', textTransform: 'uppercase' as const, letterSpacing: '2px' }}>
              Your Access Code
            </Text>
            <Text style={{ color: '#0a1628', fontSize: '32px', fontWeight: 'bold', letterSpacing: '6px', margin: '0', fontFamily: 'monospace' }}>
              {access_code}
            </Text>
          </Section>

          <Section style={{ margin: '24px 0' }}>
            <Button
              href={site_url}
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
              Enter Your Code →
            </Button>
          </Section>

          <Text style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6' }}>
            Go to Hummm, click "Already have a code?", and enter the code above to unlock full access.
          </Text>

          <Hr style={{ borderColor: '#e2e8f0', margin: '32px 0' }} />
          <Text style={{ color: '#cbd5e1', fontSize: '11px' }}>
            © 2026 {SITE_NAME} AI – All rights reserved
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template: TemplateEntry = {
  component: AccessGranted,
  subject: '🎉 You\'ve been granted access to Hummm!',
  displayName: 'User: Access Granted',
  previewData: {
    name: 'Jane',
    access_code: 'HUMM-AB12',
    site_url: 'https://hummm.pro/access-code',
  },
}

export default AccessGranted
