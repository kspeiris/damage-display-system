import express from 'express'
import { getStats, getTimelineStats } from '../controllers/statsController.js'

const router = express.Router()

router.get('/', getStats)
router.get('/timeline', getTimelineStats)

export default router