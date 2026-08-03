import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import connectDB from './configs/db.js'
import { clerkMiddleware } from '@clerk/express'
import { functions, inngest } from './inngest/index.js'
import { serve } from "inngest/express"
import showRouter from './routes/showRoutes.js'
import bookingRouter from './routes/bookingRoutes.js'
import adminRouter from './routes/adminRoutes.js'
import userRouter from './routes/userRoutes.js'
import { stripeWebhook } from './controllers/bookingController.js'
import logger from './utils/logger.js'
import errorHandler from './middleware/errorHandler.js'

const app = express()
const port = process.env.PORT || 3000

await connectDB()

// 1. Helmet Security Headers (Content-Security-Policy disabled for Clerk/Stripe iframe compatibility)
app.use(helmet({
  contentSecurityPolicy: false,
}))

// 2. Express Rate Limiter for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
})

// 3. Stripe Webhook (Raw body parser before express.json())
app.post('/api/booking/webhook', express.raw({ type: 'application/json' }), stripeWebhook)

// 4. Global Middlewares
app.use(express.json())
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"],
  credentials: true
}))
app.use(clerkMiddleware())
app.use('/api', apiLimiter)

// 5. API Routes
app.get('/', (req, res) => res.send("QuickShow Production Backend is running 🚀"))
app.use('/api/inngest', serve({ client: inngest, functions }))
app.use('/api/show', showRouter)
app.use('/api/booking', bookingRouter)
app.use('/api/admin', adminRouter)
app.use('/api/user', userRouter)

// 6. Centralized Error Handler Middleware
app.use(errorHandler)

app.listen(port, () => logger.info('SERVER_START', `Server listening at http://localhost:${port}`))
