import DamageReport from '../models/DamageReport.js'

// ✅ ADD 'export' to functions
export const getStats = async (req, res) => {
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

    const byDistrict = await DamageReport.aggregate([
      {
        $match: {
          'location.address': { $exists: true, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$location.address',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ])

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
      last24h,
      byDistrict: byDistrict.reduce((acc, item) => {
        acc[item._id] = item.count
        return acc
      }, {})
    })
  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({ error: 'Failed to fetch statistics' })
  }
}

export const getTimelineStats = async (req, res) => {
  try {
    const { days = 30 } = req.query

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(days))

    const timelineData = await DamageReport.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            severity: '$severity'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ])

    res.json(timelineData)
  } catch (error) {
    console.error('Get timeline stats error:', error)
    res.status(500).json({ error: 'Failed to fetch timeline statistics' })
  }
}