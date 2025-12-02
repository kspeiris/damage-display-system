import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import User from '../models/User.js'
import Verification from '../models/Verification.js'
import { emailService } from '../utils/emailService.js'
import logger from '../utils/logger.js'

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// @desc    Send OTP
// @route   POST /api/auth/send-otp
export const sendOTP = async (req, res) => {
  try {
    const { email, phone } = req.body

    if (!email && !phone) {
      return res.status(400).json({ error: 'Email or phone number is required' })
    }

    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Save verification record
    const verification = new Verification({
      email,
      phone,
      otp,
      expiresAt,
      attempts: 0
    })

    await verification.save()

    // Send OTP via email if provided
    if (email) {
      const sent = await emailService.sendOTP(email, otp)
      if (!sent) {
        logger.error(`Failed to send OTP email to ${email}`)
      }
    }

    // Send OTP via SMS if phone provided
    if (phone) {
      // SMS sending logic would go here
      logger.info(`OTP ${otp} generated for phone: ${phone}`)
    }

    res.json({ 
      success: true, 
      message: 'OTP sent successfully',
      method: email ? 'email' : 'sms'
    })
  } catch (error) {
    logger.error('Send OTP error:', error)
    res.status(500).json({ error: 'Failed to send OTP' })
  }
}

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
export const verifyOTP = async (req, res) => {
  try {
    const { email, phone, otp } = req.body

    if (!otp) {
      return res.status(400).json({ error: 'OTP is required' })
    }

    const verification = await Verification.findOne({
      $or: [{ email }, { phone }],
      otp,
      expiresAt: { $gt: new Date() },
      verified: false
    })

    if (!verification) {
      return res.status(400).json({ error: 'Invalid or expired OTP' })
    }

    // Check attempts
    if (verification.attempts >= 3) {
      return res.status(400).json({ error: 'Maximum attempts exceeded' })
    }

    verification.attempts += 1

    if (verification.otp !== otp) {
      await verification.save()
      return res.status(400).json({ error: 'Invalid OTP' })
    }

    // OTP is correct
    verification.verified = true
    verification.verifiedAt = new Date()
    await verification.save()

    // Find or create user
    let user = await User.findOne({ $or: [{ email }, { phone }] })

    if (!user) {
      // Create new user
      user = new User({
        email: email || undefined,
        phone: phone || undefined,
        isVerified: true
      })

      await user.save()
    } else {
      // Update existing user
      user.isVerified = true
      await user.save()
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    logger.error('Verify OTP error:', error)
    res.status(500).json({ error: 'Failed to verify OTP' })
  }
}

// @desc    Get current user
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      success: true,
      user
    })
  } catch (error) {
    logger.error('Get user error:', error)
    res.status(500).json({ error: 'Failed to get user' })
  }
}

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, location } = req.body

    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (name) user.name = name
    if (phone) user.phone = phone
    if (location) user.location = location

    await user.save()

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location
      }
    })
  } catch (error) {
    logger.error('Update profile error:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
}