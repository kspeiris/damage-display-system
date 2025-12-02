import express from 'express'
import upload from '../middleware/upload.js'
import { handleUploadErrors } from '../middleware/upload.js'
import {
  uploadImage,
  uploadImages,
  deleteImage,
  uploadDamageReport
} from '../controllers/uploadController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Single image upload
router.post('/image', 
  authenticate,
  upload.single('image'),
  handleUploadErrors,
  uploadImage
)

// Multiple images upload
router.post('/images',
  authenticate,
  upload.array('images', 5),
  handleUploadErrors,
  uploadImages
)

// Delete image
router.delete('/image/:publicId',
  authenticate,
  deleteImage
)

// Damage report upload
router.post('/damage-report',
  authenticate,
  upload.array('photos', 5),
  handleUploadErrors,
  uploadDamageReport
)

export default router