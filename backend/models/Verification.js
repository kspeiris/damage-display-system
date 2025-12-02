import mongoose from 'mongoose'

const verificationSchema = new mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    sparse: true
  },
  phone: {
    type: String,
    sparse: true
  },
  otp: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: '10m' } // Auto delete after 10 minutes
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedAt: Date,
  purpose: {
    type: String,
    enum: ['signup', 'login', 'reset_password', 'verify_damage'],
    default: 'login'
  }
}, {
  timestamps: true
})

// Compound index for finding unexpired, unverified OTPs
verificationSchema.index({ 
  email: 1, 
  phone: 1, 
  verified: 1, 
  expiresAt: 1 
})

// Prevent duplicate active OTPs
verificationSchema.index({ 
  email: 1, 
  phone: 1, 
  verified: false 
}, { 
  unique: true,
  partialFilterExpression: {
    $or: [
      { email: { $exists: true } },
      { phone: { $exists: true } }
    ]
  }
})

const Verification = mongoose.model('Verification', verificationSchema)

export default Verification