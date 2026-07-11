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

function formatIp(ip) {
  if (!ip || ip === 'unknown') return 'Unknown'
  if (ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1') return 'Localhost'
  return ip
}

function formatDevice(userAgent) {
  if (!userAgent) return 'Unknown device'
  const ua = String(userAgent)

  let browser = 'Browser'
  if (ua.includes('Edg/')) browser = 'Edge'
  else if (ua.includes('Chrome/')) browser = 'Chrome'
  else if (ua.includes('Firefox/')) browser = 'Firefox'
  else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari'

  let os = 'device'
  if (ua.includes('Mac OS X')) os = 'Mac'
  else if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'
  else if (ua.includes('Linux')) os = 'Linux'

  return `${browser} on ${os}`
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function detailRow(label, value, last = false) {
  const border = last ? '' : 'border-bottom:1px solid #E7DFD0;'
  return `
    <tr>
      <td style="padding:14px 0; ${border} font-family:Arial,Helvetica,sans-serif; font-size:12px; letter-spacing:0.08em; text-transform:uppercase; color:#9A9284; width:34%;">
        ${escapeHtml(label)}
      </td>
      <td style="padding:14px 0; ${border} font-family:Georgia,'Times New Roman',serif; font-size:15px; color:#2B2620; text-align:right;">
        ${escapeHtml(value)}
      </td>
    </tr>
  `
}

async function sendLoginSuccessEmail(user, meta = {}) {
  const name = user.name || 'there'
  const when = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  const ip = formatIp(meta.ipAddress)
  const device = formatDevice(meta.userAgent)
  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '')
  const resetUrl = `${clientUrl}/forgot-password`
  const shopUrl = `${clientUrl}/shop`

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
    'If this was not you, reset your password immediately:',
    resetUrl,
    '',
    '— Vendora',
  ].join('\n')

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0; padding:0; background-color:#F3EEE1;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F3EEE1; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px; background-color:#FBF8F2; border:1px solid #D9CFBB;">
          <!-- Header -->
          <tr>
            <td style="background-color:#2B2620; padding:28px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-family:Georgia,'Times New Roman',serif; font-size:26px; font-style:italic; color:#EEE7D8;">
                    Vendora
                  </td>
                  <td align="right" style="font-family:Arial,Helvetica,sans-serif; font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:#D6A24A;">
                    Security notice
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Accent bar -->
          <tr>
            <td style="height:4px; background-color:#5C3A4B; font-size:0; line-height:0;">&nbsp;</td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px 28px;">
              <p style="margin:0 0 8px; font-family:Arial,Helvetica,sans-serif; font-size:11px; letter-spacing:0.16em; text-transform:uppercase; color:#5C3A4B;">
                Account activity
              </p>
              <h1 style="margin:0 0 20px; font-family:Georgia,'Times New Roman',serif; font-size:28px; font-weight:normal; color:#2B2620; line-height:1.25;">
                Successful login
              </h1>
              <p style="margin:0 0 12px; font-family:Arial,Helvetica,sans-serif; font-size:15px; line-height:1.6; color:#4A443A;">
                Hi ${escapeHtml(name)},
              </p>
              <p style="margin:0 0 28px; font-family:Arial,Helvetica,sans-serif; font-size:15px; line-height:1.6; color:#4A443A;">
                You successfully signed in to your Vendora account. Here are the details for this session:
              </p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FFFDF9; border:1px solid #E7DFD0; padding:4px 20px;">
                ${detailRow('When', when)}
                ${detailRow('IP address', ip)}
                ${detailRow('Device', device, true)}
              </table>

              <p style="margin:28px 0 20px; font-family:Arial,Helvetica,sans-serif; font-size:14px; line-height:1.6; color:#6E6455;">
                If this wasn’t you, reset your password right away and secure your account.
              </p>

              <!-- CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#5C3A4B; border-radius:2px;">
                    <a href="${escapeHtml(resetUrl)}" style="display:inline-block; padding:12px 22px; font-family:Arial,Helvetica,sans-serif; font-size:12px; letter-spacing:0.1em; text-transform:uppercase; text-decoration:none; color:#EEE7D8;">
                      Reset password
                    </a>
                  </td>
                  <td width="12"></td>
                  <td>
                    <a href="${escapeHtml(shopUrl)}" style="display:inline-block; padding:12px 18px; font-family:Arial,Helvetica,sans-serif; font-size:12px; letter-spacing:0.1em; text-transform:uppercase; text-decoration:none; color:#5C3A4B; border:1px solid #D9CFBB;">
                      Go to shop
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px 28px; border-top:1px solid #E7DFD0; background-color:#F3EEE1;">
              <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:12px; line-height:1.5; color:#9A9284;">
                This message was sent by Vendora because someone signed in to your account.
                You’re receiving this at ${escapeHtml(user.email)}.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  return sendMail({ to: user.email, subject, text, html })
}

module.exports = {
  sendMail,
  sendLoginSuccessEmail,
}
