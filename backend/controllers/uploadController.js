import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js'
import logger from '../utils/logger.js'

// @desc    Upload single image
// @route   POST /api/upload/image
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' })
    }

    const result = await uploadToCloudinary(req.file.buffer)

    res.json({
      success: true,
      image: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        bytes: result.bytes,
        width: result.width,
        height: result.height
      }
    })
  } catch (error) {
    logger.error('Upload image error:', error)
    res.status(500).json({ error: 'Failed to upload image' })
  }
}

// @desc    Upload multiple images
// @route   POST /api/upload/images
export const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files provided' })
    }

    if (req.files.length > 5) {
      return res.status(400).json({ error: 'Maximum 5 images allowed' })
    }

    const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer))
    const results = await Promise.all(uploadPromises)

    const images = results.map(result => ({
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height
    }))

    res.json({
      success: true,
      images,
      count: images.length
    })
  } catch (error) {
    logger.error('Upload images error:', error)
    res.status(500).json({ error: 'Failed to upload images' })
  }
}

// @desc    Delete image
// @route   DELETE /api/upload/image/:publicId
export const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params

    await deleteFromCloudinary(publicId)

    res.json({
      success: true,
      message: 'Image deleted successfully'
    })
  } catch (error) {
    logger.error('Delete image error:', error)
    res.status(500).json({ error: 'Failed to delete image' })
  }
}

// @desc    Upload damage report with images
// @route   POST /api/upload/damage-report
export const uploadDamageReport = async (req, res) => {
  try {
    const { title, description, severity, location } = req.body

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'At least one image is required' })
    }

    // Upload images
    const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer))
    const results = await Promise.all(uploadPromises)

    const images = results.map(result => ({
      url: result.secure_url,
      publicId: result.public_id
    }))

    // Here you would save the damage report to database
    // const damageReport = new DamageReport({ ... })
    // await damageReport.save()

    res.json({
      success: true,
      message: 'Damage report submitted successfully',
      images,
      report: {
        title,
        description,
        severity,
        location: JSON.parse(location),
        images
      }
    })
  } catch (error) {
    logger.error('Upload damage report error:', error)
    res.status(500).json({ error: 'Failed to submit damage report' })
  }
}