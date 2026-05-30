import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Link, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  propertyAddress?: string
  triggerEvent?: string
}

const Nurture72h = (props: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>The market doesn't wait — here's what we'd do on {props.propertyAddress || 'your property'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brand}>✦ Hummm AI · Final nudge</Text>
        </Section>
        <Heading style={h1}>The market doesn't wait.</Heading>
        <Text style={p}>
          Three days ago you ran a report on {props.propertyAddress || 'a property'}. We've seen what comparable buyers do at this point — and it's almost always the same: they hesitate, the listing moves on, and the saving evaporates.
        </Text>
        <Text style={p}>
          Here's what the average Hummm user achieves with <strong>Negotiate For Me</strong>:
        </Text>
        <Section style={statsBox}>
          <Text style={stat}><strong style={statBig}>£7,400</strong> &nbsp;avg. saving on a £450k property</Text>
          <Text style={stat}><strong style={statBig}>6.2%</strong> &nbsp;avg. discount achieved</Text>
          <Text style={stat}><strong style={statBig}>72 hrs</strong> &nbsp;median time to first agent reply</Text>
        </Section>
        <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
          <Button href="https://hummm.pro/negotiate-for-me?utm_source=nurture&utm_campaign=72h" style={btn}>
            Start Negotiation — £49
          </Button>
        </Section>
        <Text style={pSmall}>
          Or go unlimited: <Link href="https://hummm.pro/negotiate-for-me-ai" style={link}>Hummm Negotiator Pro — £39/month</Link>
        </Text>
        <Hr style={hr} />
        <Text style={footer}>
          Hummm AI · <Link href="https://hummm.pro/unsubscribe" style={link}>Unsubscribe</Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Nurture72h,
  subject: () => `The market doesn't wait — here's what we'd do next`,
  displayName: 'Nurture: 72h Negotiate Follow-up',
  previewData: { propertyAddress: '12 Elm Street, NW6 1PB' },
} satisfies TemplateEntry

const main = { backgroundColor: '#0f172a', fontFamily: "'Inter', Arial, sans-serif" }
const container = { padding: '40px 25px', maxWidth: '560px', margin: '0 auto', backgroundColor: '#0f172a' }
const header = { marginBottom: '20px' }
const brand = { fontSize: '13px', fontWeight: '700' as const, color: '#14b8a6', margin: '0', letterSpacing: '0.1em' }
const h1 = { fontSize: '26px', fontWeight: '800' as const, color: '#f8fafc', margin: '0 0 20px', lineHeight: '1.2' }
const p = { fontSize: '15px', color: '#cbd5e1', margin: '0 0 14px', lineHeight: '1.6' }
const pSmall = { fontSize: '13px', color: '#94a3b8', margin: '12px 0 0', textAlign: 'center' as const }
const statsBox = { backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', margin: '16px 0' }
const stat = { fontSize: '14px', color: '#e2e8f0', margin: '0 0 8px', lineHeight: '1.5' }
const statBig = { color: '#14b8a6', fontSize: '17px' }
const btn = {
  backgroundColor: '#14b8a6', color: '#0f172a', padding: '14px 32px', borderRadius: '12px',
  fontWeight: '800' as const, fontSize: '15px', textDecoration: 'none', display: 'inline-block',
}
const link = { color: '#14b8a6', textDecoration: 'underline' }
const hr = { borderColor: '#1e293b', margin: '28px 0 16px' }
const footer = { fontSize: '11px', color: '#64748b', margin: '0', textAlign: 'center' as const }