import * as React from 'react'

import { Text } from '@react-email/components'
import { EmailShell, emailText } from './email-shell'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <EmailShell preview={`Seu link de acesso ao ${siteName}`} title="Link de acesso" actionLabel="Entrar no sistema" actionUrl={confirmationUrl} footer="Se você não solicitou este link, ignore esta mensagem.">
    <Text style={emailText}>Use o botão abaixo para entrar no {siteName}. Este link expira em breve.</Text>
  </EmailShell>
)

export default MagicLinkEmail

