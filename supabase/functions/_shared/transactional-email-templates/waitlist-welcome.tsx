import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Hummm"

interface WaitlistWelcomeProps {
  name?: string
  interests?: string[]
}

const WaitlistWelcomeEmail = ({ name, interests }: WaitlistWelcomeProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You're on the Humm early access list!</Preview>
    <Body style={main}>
      <Container style={container}>
        <div style={logoBanner}>
          <Heading style={logoText}>Humm</Heading>
        </div>
        <Heading style={h1}>
          {name ? `Welcome, ${name}!` : 'Welcome to the Waitlist!'}
        </Heading>
        <Text style={text}>
          Thank you for joining the {SITE_NAME} early access list. You're among the first to experience AI-powered property services — smarter valuations, seamless sales, and fully compliant lettings.
        </Text>
        {interests && interests.length > 0 && (
          <>
            <Text style={labelText}>You're interested in:</Text>
            {interests.map((interest, i) => (
              <Text key={i} style={interestItem}>• {interest}</Text>
            ))}
          </>
        )}
        <Hr style={hr} />
        <Text style={text}>
          We'll be in touch as soon as {SITE_NAME} is ready for you. In the meantime, if you have any questions, just reply to this email.
        </Text>
        <Text style={footer}>Best regards, The {SITE_NAME} Team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WaitlistWelcomeEmail,
  subject: "You're on the Humm early access list!",
  displayName: 'Waitlist welcome',
  previewData: { name: 'Sarah', interests: ['Selling my property', 'Letting my property'] },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '0 25px 30px' }
const logoBanner = { backgroundColor: '#0A1428', padding: '24px 25px', marginBottom: '30px', borderRadius: '0 0 8px 8px' }
const logoText = { color: '#00E5CC', fontSize: '28px', fontWeight: 'bold' as const, margin: '0', letterSpacing: '-0.5px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#0A1428', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0 0 16px' }
const labelText = { fontSize: '14px', color: '#0A1428', fontWeight: 'bold' as const, margin: '0 0 8px' }
const interestItem = { fontSize: '14px', color: '#00897B', margin: '0 0 4px', paddingLeft: '8px' }
const hr = { borderColor: '#e5e5e5', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
