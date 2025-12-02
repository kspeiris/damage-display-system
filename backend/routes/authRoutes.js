import express from 'express'
import {
  sendOTP,
  verifyOTP,
  getMe,
  updateProfile
} from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'
import { authLimiter } from '../middleware/rateLimit.js'

const router = express.Router()

// Public routes
router.post('/send-otp', authLimiter, sendOTP)
router.post('/verify-otp', authLimiter, verifyOTP)

// Protected routes
router.get('/me', authenticate, getMe)
router.put('/update-profile', authenticate, updateProfile)

export default router