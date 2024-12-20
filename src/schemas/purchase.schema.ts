import Joi from 'joi';

export const purchaseSchema = Joi.object({
  product_id: Joi.number().required().positive(),
  quantity: Joi.number().required().positive()
});

