import * as React from 'react'

import { Text } from '@react-email/components'
import { EmailShell, emailText } from './email-shell'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <EmailShell preview={`Redefina sua senha do ${siteName}`} title="Redefinição de senha" actionLabel="Criar nova senha" actionUrl={confirmationUrl} footer="Se você não solicitou a redefinição, ignore esta mensagem. Sua senha não será alterada.">
    <Text style={emailText}>Recebemos uma solicitação para redefinir sua senha no {siteName}.</Text>
  </EmailShell>
)

export default RecoveryEmail

