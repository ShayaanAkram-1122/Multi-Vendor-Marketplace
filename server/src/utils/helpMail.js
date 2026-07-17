const { sendMail } = require('../utils/mail')

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function sendHelpRequestEmail({ name, email, subject, message }) {
  const supportTo = process.env.SMTP_USER || process.env.SMTP_FROM
  const mailSubject = `[Vendora Help] ${subject} — ${name}`

  const text = [
    'New help request from Vendora',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Topic: ${subject}`,
    '',
    'Message:',
    message,
  ].join('\n')

  const html = `
    <div style="font-family:Arial,sans-serif;color:#2B2620;max-width:520px;">
      <h2 style="font-weight:normal;font-family:Georgia,serif;">New help request</h2>
      <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
      <p><strong>Topic:</strong> ${escapeHtml(subject)}</p>
      <div style="margin-top:16px;padding:12px;background:#FBF8F2;border:1px solid #D9CFBB;">
        <p style="margin:0;white-space:pre-wrap;">${escapeHtml(message)}</p>
      </div>
    </div>
  `

  await sendMail({
    to: supportTo,
    subject: mailSubject,
    text,
    html,
    replyTo: email,
  })

  return sendMail({
    to: email,
    subject: 'We received your message — Vendora',
    text: [
      `Hi ${name},`,
      '',
      'Thanks for reaching out. We received your help request and will reply soon.',
      '',
      `Topic: ${subject}`,
      '',
      '— Vendora Support',
    ].join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;color:#2B2620;">
        <p>Hi ${escapeHtml(name)},</p>
        <p>Thanks for reaching out. We received your help request and will reply soon.</p>
        <p><strong>Topic:</strong> ${escapeHtml(subject)}</p>
        <p style="color:#9A9284;font-size:13px;">— Vendora Support</p>
      </div>
    `,
  })
}

module.exports = { sendHelpRequestEmail }
