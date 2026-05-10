import express from 'express'
import cors from 'cors'
import { verifyToken } from './middleware/auth.js'
import { errorHandler } from './middleware/errorHandler.js'
import executionRoutes from './routes/execution.js'

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Protected routes
app.use('/api', verifyToken, executionRoutes)

// Error handler
app.use(errorHandler)

export default app
