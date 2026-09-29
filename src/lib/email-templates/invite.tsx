import * as React from 'react'

import { Link, Text } from '@react-email/components'
import { EmailShell, emailText } from './email-shell'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <EmailShell preview={`Você foi convidado para acessar ${siteName}`} title="Convite de acesso" actionLabel="Aceitar convite" actionUrl={confirmationUrl} footer="Se você não esperava este convite, ignore esta mensagem.">
    <Text style={emailText}>Você foi convidado para acessar o <Link href={siteUrl} style={link}><strong>{siteName}</strong></Link>.</Text>
    <Text style={emailText}>Use o botão abaixo para aceitar o convite e definir sua senha.</Text>
  </EmailShell>
)

export default InviteEmail

const link = { color: '#527a16', textDecoration: 'underline' }
