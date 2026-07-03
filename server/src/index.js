require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })

const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'vendora-api' })
})

app.listen(PORT, () => {
  console.log(`Vendora API running on http://localhost:${PORT}`)
})
