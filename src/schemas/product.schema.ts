import Joi from 'joi'

export const productSchema = Joi.object({
  name: Joi.string().required().min(3).max(255),
  description: Joi.string().optional(),
  price: Joi.number().required().min(0),
  stock: Joi.number().required().min(0),
  categories: Joi.array().items(Joi.number()).optional()
})

