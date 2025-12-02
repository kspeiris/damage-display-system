import DamageReport from '../models/DamageReport.js'

export class DamageService {
  static async createDamageReport(damageData) {
    const report = new DamageReport(damageData)
    return await report.save()
  }

  static async getDamagesWithFilters(filters = {}) {
    const {
      severity,
      propertyType,
      dateRange,
      page = 1,
      limit = 50
    } = filters

    const query = {}

    if (severity && severity !== 'all') {
      query.severity = severity
    }

    if (propertyType && propertyType !== 'all') {
      query.propertyType = propertyType
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
        query.createdAt = { $gte: startDate }
      }
    }

    const skip = (page - 1) * limit

    const damages = await DamageReport.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('reporter', 'name email')

    const total = await DamageReport.countDocuments(query)

    return {
      damages,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    }
  }

  static async getDamageById(id) {
    return await DamageReport.findById(id)
      .populate('reporter', 'name email')
      .populate('verifiedBy', 'name')
  }

  static async updateDamageReport(id, updateData) {
    return await DamageReport.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate('reporter', 'name email')
  }

  static async deleteDamageReport(id) {
    return await DamageReport.findByIdAndDelete(id)
  }
}