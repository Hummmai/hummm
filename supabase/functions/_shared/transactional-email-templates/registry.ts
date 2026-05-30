/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as valuationReport } from './valuation-report.tsx'
import { template as sellConfirmation } from './sell-confirmation.tsx'
import { template as negotiateActivation } from './negotiate-activation.tsx'
import { template as photographyBooking } from './photography-booking.tsx'
import { template as notifyValuation } from './notify-valuation.tsx'
import { template as notifySell } from './notify-sell.tsx'
import { template as notifyNegotiate } from './notify-negotiate.tsx'
import { template as notifyContact } from './notify-contact.tsx'
import { template as waitlistWelcome } from './waitlist-welcome.tsx'
import { template as notifyWaitlist } from './notify-waitlist.tsx'
import { template as viewingConfirmation } from './viewing-confirmation.tsx'
import { template as notifyAccessRequest } from './notify-access-request.tsx'
import { template as accessGranted } from './access-granted.tsx'
import { template as notifySignup } from './notify-signup.tsx'
import { template as nurtureNegotiate24h } from './nurture-negotiate-24h.tsx'
import { template as nurtureNegotiate72h } from './nurture-negotiate-72h.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'valuation-report': valuationReport,
  'sell-confirmation': sellConfirmation,
  'negotiate-activation': negotiateActivation,
  'photography-booking': photographyBooking,
  'notify-valuation': notifyValuation,
  'notify-sell': notifySell,
  'notify-negotiate': notifyNegotiate,
  'notify-contact': notifyContact,
  'waitlist-welcome': waitlistWelcome,
  'notify-waitlist': notifyWaitlist,
  'viewing-confirmation': viewingConfirmation,
  'notify-access-request': notifyAccessRequest,
  'access-granted': accessGranted,
  'notify-signup': notifySignup,
  'nurture-negotiate-24h': nurtureNegotiate24h,
  'nurture-negotiate-72h': nurtureNegotiate72h,
}
