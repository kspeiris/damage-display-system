import Joi from 'joi'

export const createDamageValidation = Joi.object({
  description: Joi.string().min(10).max(500).required().messages({
    'string.empty': 'Description is required',
    'string.min': 'Description must be at least 10 characters long',
    'string.max': 'Description cannot be longer than 500 characters'
  }),
  severity: Joi.string().valid('minor', 'moderate', 'severe', 'destroyed').required().messages({
    'any.only': 'Severity must be one of: minor, moderate, severe, destroyed'
  }),
  propertyType: Joi.string().valid('residential', 'commercial', 'infrastructure', 'agricultural').required().messages({
    'any.only': 'Property type must be one of: residential, commercial, infrastructure, agricultural'
  }),
  location: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    address: Joi.string().max(200).optional()
  }).required(),
  photos: Joi.array().items(Joi.string().uri()).max(5).optional()
})

export const updateDamageValidation = Joi.object({
  description: Joi.string().min(10).max(500).optional(),
  severity: Joi.string().valid('minor', 'moderate', 'severe', 'destroyed').optional(),
  propertyType: Joi.string().valid('residential', 'commercial', 'infrastructure', 'agricultural').optional(),
  location: Joi.object({
    latitude: Joi.number().min(-90).max(90),
    longitude: Joi.number().min(-180).max(180),
    address: Joi.string().max(200).optional()
  }).optional(),
  verificationStatus: Joi.string().valid('pending', 'verified', 'rejected').optional()
})

export const queryParamsValidation = Joi.object({
  severity: Joi.string().valid('minor', 'moderate', 'severe', 'destroyed', 'all').default('all'),
  propertyType: Joi.string().valid('residential', 'commercial', 'infrastructure', 'agricultural', 'all').default('all'),
  dateRange: Joi.string().valid('24h', '7d', '30d', 'all').default('all'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50),
  sort: Joi.string().valid('createdAt', 'severity', 'propertyType').default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc')
})