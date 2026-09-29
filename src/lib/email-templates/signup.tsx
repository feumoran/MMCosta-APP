import * as React from 'react'

import { Link, Text } from '@react-email/components'
import { EmailShell, emailText } from './email-shell'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <EmailShell preview={`Confirme seu e-mail para acessar ${siteName}`} title="Confirme seu e-mail" actionLabel="Confirmar e-mail" actionUrl={confirmationUrl} footer="Se você não criou esta conta, ignore esta mensagem.">
    <Text style={emailText}>Obrigado por criar seu acesso ao <Link href={siteUrl} style={link}><strong>{siteName}</strong></Link>.</Text>
    <Text style={emailText}>Confirme o endereço <Link href={`mailto:${recipient}`} style={link}>{recipient}</Link> para concluir o cadastro.</Text>
  </EmailShell>
)

export default SignupEmail

const link = { color: '#527a16', textDecoration: 'underline' }
