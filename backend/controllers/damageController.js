import DamageReport from '../models/DamageReport.js'
import { uploadToCloudinary } from '../utils/cloudinary.js'

// Get all damage reports with filtering and pagination
export const getDamages = async (req, res) => {
  try {
    console.log('📥 GET damages request:', req.query)
    
    const {
      severity,
      propertyType,
      dateRange,
      page = 1,
      limit = 50
    } = req.query

    // Build filter object
    const filter = {}
    
    if (severity && severity !== 'all') {
      filter.severity = severity
    }
    
    if (propertyType && propertyType !== 'all') {
      filter.propertyType = propertyType
    }

    // Date range filtering
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
        default:
          startDate = null
      }

      if (startDate) {
        filter.createdAt = { $gte: startDate }
      }
    }

    const skip = (page - 1) * limit

    console.log('🔍 Filtering damages with:', filter)

    const damages = await DamageReport.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean()

    const total = await DamageReport.countDocuments(filter)

    console.log(`✅ Found ${damages.length} damages (total: ${total})`)

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
}

// Get single damage report
export const getDamageById = async (req, res) => {
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
}

// Create new damage report
export const createDamage = async (req, res) => {
  try {
    console.log('📝 Creating new damage report')
    console.log('📦 Body:', req.body)
    console.log('📸 Files:', req.files?.length || 0)

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

    // Upload photos to Cloudinary
    const photoUploads = []
    if (req.files && req.files.length > 0) {
      console.log('⬆️ Uploading photos to Cloudinary...')
      for (const file of req.files) {
        const uploadResult = await uploadToCloudinary(file.buffer)
        photoUploads.push({
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id
        })
      }
      console.log(`✅ Uploaded ${photoUploads.length} photos`)
    }

    const damageReport = new DamageReport({
      description,
      severity,
      propertyType,
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address
      },
      photos: photoUploads
    })

    await damageReport.save()

    console.log(`✅ Damage report created with ID: ${damageReport._id}`)

    res.status(201).json({
      success: true,
      message: 'Damage report created successfully',
      damage: damageReport
    })
  } catch (error) {
    console.error('❌ Create damage error:', error)
    res.status(500).json({ 
      error: 'Failed to create damage report',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

// Update damage report
export const updateDamage = async (req, res) => {
  try {
    const damage = await DamageReport.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

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
}

// Delete damage report
export const deleteDamage = async (req, res) => {
  try {
    const damage = await DamageReport.findById(req.params.id)

    if (!damage) {
      return res.status(404).json({ error: 'Damage report not found' })
    }

    await DamageReport.findByIdAndDelete(req.params.id)

    res.json({ 
      success: true,
      message: 'Damage report deleted successfully' 
    })
  } catch (error) {
    console.error('Delete damage error:', error)
    res.status(500).json({ error: 'Failed to delete damage report' })
  }
}

// Verify damage report
export const verifyDamage = async (req, res) => {
  try {
    const damage = await DamageReport.findById(req.params.id)

    if (!damage) {
      return res.status(404).json({ error: 'Damage report not found' })
    }

    damage.verificationStatus = 'verified'
    damage.verifiedAt = new Date()

    await damage.save()

    res.json({
      success: true,
      message: 'Damage report verified successfully',
      damage
    })
  } catch (error) {
    console.error('Verify damage error:', error)
    res.status(500).json({ error: 'Failed to verify damage report' })
  }
}