import mongoose from 'mongoose'

const damageReportSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  severity: {
    type: String,
    enum: ['minor', 'moderate', 'severe', 'destroyed'],
    required: true
  },
  propertyType: {
    type: String,
    enum: ['residential', 'commercial', 'infrastructure', 'agricultural'],
    required: true
  },
  location: {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    },
    address: String
  },
  photos: [{
    url: String,
    publicId: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verifiedAt: Date
}, {
  timestamps: true
})

// Geospatial index for location-based queries
damageReportSchema.index({ 'location.latitude': 1, 'location.longitude': 1 })

// Compound indexes for common queries
damageReportSchema.index({ severity: 1, createdAt: -1 })
damageReportSchema.index({ propertyType: 1, createdAt: -1 })
damageReportSchema.index({ verificationStatus: 1 })

// Virtual for formatted address
damageReportSchema.virtual('formattedAddress').get(function() {
  return this.location.address || `Lat: ${this.location.latitude?.toFixed(4)}, Lng: ${this.location.longitude?.toFixed(4)}`
})

const DamageReport = mongoose.model('DamageReport', damageReportSchema)

export default DamageReport