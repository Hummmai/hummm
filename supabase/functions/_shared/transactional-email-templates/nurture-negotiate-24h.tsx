import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Link, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  propertyAddress?: string
  triggerEvent?: string
}

const Nurture24h = (props: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>One quick thing about {props.propertyAddress || 'your property'}…</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brand}>✦ Hummm AI</Text>
        </Section>
        <Heading style={h1}>One quick thing about {props.propertyAddress || 'your property'}…</Heading>
        <Text style={p}>
          You ran your report yesterday — nice work. Here's the part most people don't realise:
          the listing price is almost never the final price. There's usually 3–8% on the table if you push back the right way.
        </Text>
        <Text style={p}>
          <strong>Negotiate For Me</strong> takes it from here. Our AI drafts the opening offer,
          handles the back-and-forth, and gives you a script for every agent reply — for a flat <strong>£49</strong>.
        </Text>
        <Section style={{ textAlign: 'center' as const, margin: '28px 0' }}>
          <Button href="https://hummm.pro/negotiate-for-me?utm_source=nurture&utm_campaign=24h" style={btn}>
            Start Negotiation — £49
          </Button>
        </Section>
        <Text style={pSmall}>
          Prefer unlimited? <Link href="https://hummm.pro/negotiate-for-me-ai" style={link}>Hummm Negotiator Pro — £39/month</Link>, cancel anytime.
        </Text>
        <Hr style={hr} />
        <Text style={footer}>
          Hummm AI · You're receiving this because you ran a free property report. <Link href="https://hummm.pro/unsubscribe" style={link}>Unsubscribe</Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Nurture24h,
  subject: (data: Record<string, any>) =>
    `One quick thing about ${data.propertyAddress || 'your property'}…`,
  displayName: 'Nurture: 24h Negotiate Follow-up',
  previewData: { propertyAddress: '12 Elm Street, NW6 1PB' },
} satisfies TemplateEntry

const main = { backgroundColor: '#0f172a', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '40px 25px', maxWidth: '560px', margin: '0 auto', backgroundColor: '#0f172a' }
const header = { marginBottom: '20px' }
const brand = { fontSize: '13px', fontWeight: '700' as const, color: '#14b8a6', margin: '0', letterSpacing: '0.1em' }
const h1 = { fontSize: '24px', fontWeight: '800' as const, color: '#f8fafc', margin: '0 0 20px', lineHeight: '1.25' }
const p = { fontSize: '15px', color: '#cbd5e1', margin: '0 0 16px', lineHeight: '1.6' }
const pSmall = { fontSize: '13px', color: '#94a3b8', margin: '12px 0 0', textAlign: 'center' as const }
const btn = {
  backgroundColor: '#14b8a6', color: '#0f172a', padding: '14px 32px', borderRadius: '12px',
  fontWeight: '800' as const, fontSize: '15px', textDecoration: 'none', display: 'inline-block',
}
const link = { color: '#14b8a6', textDecoration: 'underline' }
const hr = { borderColor: '#1e293b', margin: '28px 0 16px' }
const footer = { fontSize: '11px', color: '#64748b', margin: '0', textAlign: 'center' as const }