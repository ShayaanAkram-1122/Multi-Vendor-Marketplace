const nodemailer = require('nodemailer')

let transporter = null

function getTransporter() {
  if (transporter) return transporter

  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = String(process.env.SMTP_PASS || '').replace(/\s+/g, '')

  if (!host || !user || !pass) {
    return null
  }

  transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user, pass },
  })

  return transporter
}

function fromAddress() {
  return process.env.SMTP_FROM || process.env.SMTP_USER
}

async function sendMail({ to, subject, text, html }) {
  const mailer = getTransporter()
  if (!mailer) {
    console.warn('[mail] SMTP is not configured — skipping email to', to)
    return { skipped: true }
  }

  const info = await mailer.sendMail({
    from: `"Vendora" <${fromAddress()}>`,
    to,
    subject,
    text,
    html,
  })

  return info
}

async function sendLoginSuccessEmail(user, meta = {}) {
  const name = user.name || 'there'
  const when = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  const ip = meta.ipAddress ? String(meta.ipAddress) : 'unknown'
  const device = meta.userAgent ? String(meta.userAgent).slice(0, 120) : 'unknown'

  const subject = 'Successful login to Vendora'
  const text = [
    `Hi ${name},`,
    '',
    'You successfully signed in to your Vendora account.',
    '',
    `Time: ${when}`,
    `IP: ${ip}`,
    `Device: ${device}`,
    '',
    'If this was not you, reset your password immediately and contact support.',
    '',
    '— Vendora',
  ].join('\n')

  const html = `
    <div style="font-family: Georgia, serif; color: #2B2620; max-width: 520px; margin: 0 auto;">
      <p style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #5C3A4B;">Vendora</p>
      <h1 style="font-size: 22px; font-weight: normal; margin: 8px 0 16px;">Successful login</h1>
      <p>Hi ${escapeHtml(name)},</p>
      <p>You successfully signed in to your Vendora account.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
        <tr>
          <td style="padding: 8px 0; color: #6E6455;">Time</td>
          <td style="padding: 8px 0; text-align: right;">${escapeHtml(when)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6E6455;">IP</td>
          <td style="padding: 8px 0; text-align: right;">${escapeHtml(ip)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6E6455; vertical-align: top;">Device</td>
          <td style="padding: 8px 0; text-align: right; max-width: 280px;">${escapeHtml(device)}</td>
        </tr>
      </table>
      <p style="font-size: 13px; color: #6E6455;">
        If this was not you, reset your password immediately and contact support.
      </p>
      <p style="margin-top: 28px; font-size: 13px; color: #9A9284;">— Vendora</p>
    </div>
  `

  return sendMail({ to: user.email, subject, text, html })
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

module.exports = {
  sendMail,
  sendLoginSuccessEmail,
}
