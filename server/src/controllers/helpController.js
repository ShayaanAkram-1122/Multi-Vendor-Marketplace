const { sendHelpRequestEmail } = require('../utils/helpMail')

async function submitHelp(req, res, next) {
  try {
    const name = String(req.body.name || '').trim()
    const email = String(req.body.email || '').trim().toLowerCase()
    const subject = String(req.body.subject || '').trim()
    const message = String(req.body.message || '').trim()

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Name, email, subject, and message are required' })
    }

    if (!email.includes('@')) {
      return res.status(400).json({ message: 'A valid email is required' })
    }

    if (message.length < 10) {
      return res.status(400).json({ message: 'Please provide a bit more detail in your message' })
    }

    await sendHelpRequestEmail({ name, email, subject, message })

    return res.status(201).json({
      message: 'Your help request was sent. We will reply to your email soon.',
    })
  } catch (err) {
    console.error('[help] submit failed:', err.message)
    return next(err)
  }
}

module.exports = { submitHelp }
