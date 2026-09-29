import * as React from 'react'

import { Text } from '@react-email/components'
import { EmailShell, emailCode, emailText } from './email-shell'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <EmailShell preview="Seu código de verificação" title="Confirme sua identidade" footer="Este código expira em breve. Se você não fez esta solicitação, ignore a mensagem.">
    <Text style={emailText}>Use o código abaixo para confirmar sua identidade:</Text>
    <Text style={emailCode}>{token}</Text>
  </EmailShell>
)

export default ReauthenticationEmail

