import * as React from 'react'

import { Link, Text } from '@react-email/components'
import { EmailShell, emailText } from './email-shell'

interface EmailChangeEmailProps {
  siteName: string
  // oldEmail is the user's current address (HookData.OldEmail). For the
  // NEW-recipient half of a secure email_change fanout, `email` equals the
  // recipient (NEW), so the "from" line must render oldEmail to read
  // "from OLD to NEW" instead of "from NEW to NEW".
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  oldEmail,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <EmailShell preview={`Confirme a alteração de e-mail no ${siteName}`} title="Confirme o novo e-mail" actionLabel="Confirmar alteração" actionUrl={confirmationUrl} footer="Se você não solicitou esta alteração, proteja sua conta imediatamente.">
    <Text style={emailText}>Você solicitou a alteração do e-mail de <Link href={`mailto:${oldEmail}`} style={link}>{oldEmail}</Link> para <Link href={`mailto:${newEmail}`} style={link}>{newEmail}</Link>.</Text>
  </EmailShell>
)

export default EmailChangeEmail

const link = { color: '#527a16', textDecoration: 'underline' }
