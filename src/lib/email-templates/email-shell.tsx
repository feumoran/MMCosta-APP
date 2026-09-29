import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from '@react-email/components'

interface EmailShellProps {
  preview: string
  title: string
  children: React.ReactNode
  actionLabel?: string
  actionUrl?: string
  footer: string
}

export function EmailShell({ preview, title, children, actionLabel, actionUrl, footer }: EmailShellProps) {
  return (
    <Html lang="pt-BR" dir="ltr">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={brandBar} />
          <Text style={brand}>MMCOSTA</Text>
          <Text style={tagline}>FUNDAÇÕES &amp; GEOTECNIA</Text>
          <Heading style={heading}>{title}</Heading>
          <Section style={content}>{children}</Section>
          {actionLabel && actionUrl ? <Button style={button} href={actionUrl}>{actionLabel}</Button> : null}
          <Text style={footerStyle}>{footer}</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const emailText = { fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: '0 0 18px' }
export const emailCode = { fontFamily: 'Courier, monospace', fontSize: '26px', fontWeight: 'bold' as const, letterSpacing: '4px', color: '#0f172a', margin: '12px 0 24px' }

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif', padding: '24px 12px' }
const container = { width: '100%', maxWidth: '560px', margin: '0 auto', padding: '32px', border: '1px solid #e2e8f0', borderRadius: '8px' }
const brandBar = { height: '6px', backgroundColor: '#76a52c', borderRadius: '4px', margin: '0 0 24px' }
const brand = { color: '#0f172a', fontSize: '24px', fontWeight: 'bold' as const, margin: '0' }
const tagline = { color: '#76a52c', fontSize: '11px', fontWeight: 'bold' as const, margin: '3px 0 32px' }
const heading = { color: '#0f172a', fontSize: '24px', lineHeight: '1.25', margin: '0 0 20px' }
const content = { margin: '0' }
const button = { backgroundColor: '#76a52c', color: '#0f172a', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '6px', padding: '13px 22px', textDecoration: 'none' }
const footerStyle = { fontSize: '12px', color: '#94a3b8', lineHeight: '1.5', margin: '32px 0 0' }