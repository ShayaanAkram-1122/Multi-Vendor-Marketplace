const STORAGE_KEY = 'vendora_newsletter_status'

export function readNewsletterStatus() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function writeNewsletterStatus(status) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    email: status.email || '',
    // pending | yes | no
    preference: status.preference,
    updatedAt: new Date().toISOString(),
  }))
}

export function clearNewsletterStatus() {
  localStorage.removeItem(STORAGE_KEY)
}
