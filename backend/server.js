import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import multer from 'multer'
import { uploadToCloudinary, deleteFromCloudinary } from './utils/cloudinary.js'
import path from 'path'
import { fileURLToPath } from 'url'

// ES module fix for __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Configure multer for memory storage (to get buffer for Cloudinary)
const storage = multer.memoryStorage()

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // max 5 files
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed!'), false)
    }
  }
})

// Security Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}))

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
})
app.use('/api/', limiter)

// Body Parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
})

// Updated Damage Report Model with Cloudinary support
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
  photos: [
    {
      url: String,
      publicId: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const DamageReport = mongoose.model('DamageReport', damageReportSchema)

// Routes
// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  })
})

// Get all damage reports
app.get('/api/damages', async (req, res) => {
  try {
    console.log('📥 GET damages request:', req.query)
    
    const {
      severity,
      propertyType,
      dateRange,
      page = 1,
      limit = 50
    } = req.query

    const filter = {}
    
    if (severity && severity !== 'all') {
      filter.severity = severity
    }
    
    if (propertyType && propertyType !== 'all') {
      filter.propertyType = propertyType
    }

    if (dateRange && dateRange !== 'all') {
      const now = new Date()
      let startDate

      switch (dateRange) {
        case '24h':
          startDate = new Date(now.setDate(now.getDate() - 1))
          break
        case '7d':
          startDate = new Date(now.setDate(now.getDate() - 7))
          break
        case '30d':
          startDate = new Date(now.setDate(now.getDate() - 30))
          break
      }

      if (startDate) {
        filter.createdAt = { $gte: startDate }
      }
    }

    const skip = (page - 1) * limit

    const damages = await DamageReport.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean()

    const total = await DamageReport.countDocuments(filter)

    res.json({
      damages,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    })
  } catch (error) {
    console.error('❌ Get damages error:', error)
    res.status(500).json({ error: 'Failed to fetch damage reports' })
  }
})

// Get damage by ID
app.get('/api/damages/:id', async (req, res) => {
  try {
    const damage = await DamageReport.findById(req.params.id).lean()

    if (!damage) {
      return res.status(404).json({ error: 'Damage report not found' })
    }

    res.json(damage)
  } catch (error) {
    console.error('Get damage error:', error)
    res.status(500).json({ error: 'Failed to fetch damage report' })
  }
})

// ✅ ENDPOINT 1: CREATE DAMAGE REPORT WITH FILE UPLOADS (CLOUDINARY)
app.post('/api/damages', upload.array('photos', 5), async (req, res) => {
  try {
    console.log('📝 POST /api/damages (with Cloudinary upload)')
    console.log('📦 Body:', req.body)
    console.log('📸 Files:', req.files?.length || 0, 'files')
    
    const {
      description,
      severity,
      propertyType,
      latitude,
      longitude,
      address
    } = req.body

    // Validate required fields
    if (!description || !severity || !propertyType || !latitude || !longitude) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields',
        missing: {
          description: !description,
          severity: !severity,
          propertyType: !propertyType,
          latitude: !latitude,
          longitude: !longitude
        }
      })
    }

    // Process uploaded files - upload to Cloudinary
    const photos = []
    if (req.files && req.files.length > 0) {
      console.log('⬆️ Uploading to Cloudinary...')
      
      for (const file of req.files) {
        try {
          const result = await uploadToCloudinary(file.buffer)
          photos.push({
            url: result.secure_url,
            publicId: result.public_id
          })
          console.log(`✅ Uploaded to Cloudinary: ${result.public_id}`)
        } catch (uploadError) {
          console.error('❌ Cloudinary upload failed:', uploadError)
          throw new Error(`Failed to upload image: ${uploadError.message}`)
        }
      }
    }

    const damageReport = new DamageReport({
      description: description.trim(),
      severity,
      propertyType,
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address: address?.trim() || ''
      },
      photos: photos
    })

    await damageReport.save()

    console.log(`✅ Damage report created with Cloudinary: ${damageReport._id}`)

    res.status(201).json({
      success: true,
      message: 'Damage report created successfully',
      damage: damageReport
    })
  } catch (error) {
    console.error('❌ Create damage error:', error)
    
    res.status(500).json({ 
      success: false,
      error: 'Failed to create damage report',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// ✅ ENDPOINT 2: CREATE DAMAGE REPORT (JSON ONLY - NO FILE UPLOAD)
app.post('/api/damages/json', async (req, res) => {
  try {
    console.log('📝 POST /api/damages/json (JSON only)')
    console.log('📦 Body:', req.body)
    
    const {
      description,
      severity,
      propertyType,
      latitude,
      longitude,
      address,
      photos = []
    } = req.body

    // Validate required fields
    if (!description || !severity || !propertyType || !latitude || !longitude) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields',
        missing: {
          description: !description,
          severity: !severity,
          propertyType: !propertyType,
          latitude: !latitude,
          longitude: !longitude
        }
      })
    }

    // Format photos array if needed
    const formattedPhotos = Array.isArray(photos) 
      ? photos.map(photo => {
          if (typeof photo === 'string') {
            return {
              url: photo,
              publicId: `manual-upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              uploadedAt: new Date()
            }
          }
          return photo
        }).filter(photo => photo && photo.url)
      : []

    const damageReport = new DamageReport({
      description: description.trim(),
      severity,
      propertyType,
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address: address?.trim() || ''
      },
      photos: formattedPhotos
    })

    await damageReport.save()

    console.log(`✅ Damage report created (JSON): ${damageReport._id}`)

    res.status(201).json({
      success: true,
      message: 'Damage report created successfully',
      damage: damageReport
    })
  } catch (error) {
    console.error('❌ Create damage (JSON) error:', error)
    res.status(500).json({ 
      success: false,
      error: 'Failed to create damage report',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Get statistics
app.get('/api/stats', async (req, res) => {
  try {
    const total = await DamageReport.countDocuments()
    
    const bySeverity = await DamageReport.aggregate([
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      }
    ])

    const byType = await DamageReport.aggregate([
      {
        $group: {
          _id: '$propertyType',
          count: { $sum: 1 }
        }
      }
    ])

    const last24h = await DamageReport.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    })

    // Convert arrays to objects
    const severityObj = bySeverity.reduce((acc, item) => {
      acc[item._id] = item.count
      return acc
    }, {})

    const typeObj = byType.reduce((acc, item) => {
      acc[item._id] = item.count
      return acc
    }, {})

    res.json({
      total,
      bySeverity: severityObj,
      byType: typeObj,
      last24h
    })
  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({ error: 'Failed to fetch statistics' })
  }
})

// ✅ SEED TEST DATA (UPDATED FOR CLOUDINARY)
app.post('/api/seed', async (req, res) => {
  try {
    // Clear existing data
    await DamageReport.deleteMany({})
    
    const now = new Date()
    const testDamages = [
      {
        description: "Roof partially damaged due to strong winds",
        severity: "moderate",
        propertyType: "residential",
        location: {
          latitude: 6.9271,
          longitude: 79.8612,
          address: "Colombo 05, Colombo District"
        },
        photos: [
          {
            url: "https://images.unsplash.com/photo-1595877256737-f0e0d0440e6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            publicId: "demo-roof-damage",
            uploadedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000)
          }
        ],
        verificationStatus: "verified",
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000)
      },
      {
        description: "Tree fallen on road, blocking traffic",
        severity: "severe",
        propertyType: "infrastructure",
        location: {
          latitude: 7.2906,
          longitude: 80.6337,
          address: "Kandy City, Kandy District"
        },
        photos: [
          {
            url: "https://images.unsplash.com/photo-1540322356050-fb4e5ad60cec?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            publicId: "demo-fallen-tree",
            uploadedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000)
          }
        ],
        verificationStatus: "pending",
        createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000)
      },
      {
        description: "Shop flooded during heavy rain",
        severity: "destroyed",
        propertyType: "commercial",
        location: {
          latitude: 6.0535,
          longitude: 80.2210,
          address: "Galle Fort, Galle District"
        },
        photos: [
          {
            url: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            publicId: "demo-flood-damage",
            uploadedAt: new Date(now.getTime() - 48 * 60 * 60 * 1000)
          }
        ],
        verificationStatus: "verified",
        createdAt: new Date(now.getTime() - 48 * 60 * 60 * 1000)
      }
    ]

    await DamageReport.insertMany(testDamages)

    res.json({
      success: true,
      message: 'Test data seeded successfully',
      count: testDamages.length
    })
  } catch (error) {
    console.error('Seed error:', error)
    res.status(500).json({ 
      success: false,
      error: 'Failed to seed data' 
    })
  }
})

// Update damage report
app.put('/api/damages/:id', async (req, res) => {
  try {
    const damage = await DamageReport.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).lean()

    if (!damage) {
      return res.status(404).json({ error: 'Damage report not found' })
    }

    res.json({
      success: true,
      message: 'Damage report updated successfully',
      damage
    })
  } catch (error) {
    console.error('Update damage error:', error)
    res.status(500).json({ error: 'Failed to update damage report' })
  }
})

// Delete damage report (with Cloudinary cleanup)
app.delete('/api/damages/:id', async (req, res) => {
  try {
    const damage = await DamageReport.findById(req.params.id)

    if (!damage) {
      return res.status(404).json({ error: 'Damage report not found' })
    }

    // Delete images from Cloudinary if they exist
    if (damage.photos && damage.photos.length > 0) {
      for (const photo of damage.photos) {
        if (photo.publicId && !photo.publicId.startsWith('manual-upload-')) {
          try {
            await deleteFromCloudinary(photo.publicId)
            console.log(`✅ Deleted Cloudinary image: ${photo.publicId}`)
          } catch (cloudinaryError) {
            console.warn(`⚠️ Could not delete Cloudinary image ${photo.publicId}:`, cloudinaryError.message)
          }
        }
      }
    }

    // Delete from database
    await DamageReport.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: 'Damage report deleted successfully'
    })
  } catch (error) {
    console.error('Delete damage error:', error)
    res.status(500).json({ error: 'Failed to delete damage report' })
  }
})

// ✅ CLEANUP ENDPOINT (updated for Cloudinary)
app.delete('/api/cleanup', async (req, res) => {
  try {
    // Get all damage reports first
    const damages = await DamageReport.find({})
    
    // Delete images from Cloudinary (excluding manual uploads)
    for (const damage of damages) {
      if (damage.photos && damage.photos.length > 0) {
        for (const photo of damage.photos) {
          if (photo.publicId && !photo.publicId.startsWith('manual-upload-')) {
            try {
              await deleteFromCloudinary(photo.publicId)
            } catch (error) {
              console.log(`⚠️ Could not delete Cloudinary image: ${photo.publicId}`)
            }
          }
        }
      }
    }
    
    // Clear database
    await DamageReport.deleteMany({})
    
    res.json({
      success: true,
      message: 'Database and Cloudinary images cleaned up',
      deleted: damages.length
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    res.status(500).json({ 
      success: false,
      error: 'Cleanup failed' 
    })
  }
})

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')))
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'))
  })
}

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.stack)
  
  // Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' })
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files. Maximum 5 files allowed.' })
    }
  }
  
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// Database Connection
async function startServer() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/damage-display-system'
    
    console.log(`🔗 Connecting to MongoDB: ${mongoURI}`)
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    
    console.log('✅ Connected to MongoDB')
    
    app.listen(PORT, () => {
      console.log(`
🚀 Damage Display System Backend
📡 Server running on port ${PORT}
🔗 API available at http://localhost:${PORT}/api
🏥 Health check: http://localhost:${PORT}/api/health
📊 Stats: http://localhost:${PORT}/api/stats
🌱 Seed test data: POST http://localhost:${PORT}/api/seed
🧹 Cleanup: DELETE http://localhost:${PORT}/api/cleanup

☁️  CLOUDINARY FILE UPLOAD:
POST http://localhost:${PORT}/api/damages
Content-Type: multipart/form-data

📝 JSON-ONLY ENDPOINT:
POST http://localhost:${PORT}/api/damages/json  
Content-Type: application/json
      `)
    })
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    process.exit(1)
  }
}

startServer()

export default app