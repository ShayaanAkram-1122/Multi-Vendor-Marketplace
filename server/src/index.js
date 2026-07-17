require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') })

const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const authRoutes = require('./routes/auth')
const productRoutes = require('./routes/products')
const { pool } = require('./config/db')

const app = express()
const PORT = process.env.PORT || 4000

app.set('trust proxy', 1)

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok', service: 'vendora-api', db: 'up' })
  } catch {
    res.status(503).json({ status: 'degraded', service: 'vendora-api', db: 'down' })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/newsletter', require('./routes/newsletter'))
app.use('/api/help', require('./routes/help'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/role-requests', require('./routes/roleRequests'))

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ message: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Vendora API running on http://localhost:${PORT}`)
})
