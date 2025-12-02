import rateLimit from 'express-rate-limit'

// General rate limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

// Strict rate limiter for sensitive endpoints
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour
  message: 'Too many attempts, please try again after an hour.',
  skipSuccessfulRequests: true,
})

// Report submission limiter
export const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 reports per hour per IP
  message: 'Too many damage reports submitted. Please try again later.',
})

// Auth limiter
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 auth attempts
  message: 'Too many authentication attempts. Please try again later.',
  skipSuccessfulRequests: true,
})