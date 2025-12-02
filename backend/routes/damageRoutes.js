import express from 'express'
import multer from 'multer'
import {
  getDamages,
  getDamageById,
  createDamage,
  updateDamage,
  deleteDamage,
  verifyDamage
} from '../controllers/damageController.js'

const router = express.Router()

// Configure multer for file uploads
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('Only image files are allowed!'), false)
  }
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5 // max 5 files
  },
  fileFilter: fileFilter
})

// Routes
router.get('/', getDamages)
router.get('/:id', getDamageById)
router.post('/', upload.array('photos', 5), createDamage)
router.put('/:id', updateDamage)
router.delete('/:id', deleteDamage)
router.patch('/:id/verify', verifyDamage)

export default router