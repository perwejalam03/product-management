import Joi from 'joi';

export const userSchema = Joi.object({
  username: Joi.string().required().min(3).max(255),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(6)
});

export const loginSchema = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required()
});

export const verificationSchema = Joi.object({
  email: Joi.string().required().email(),
  code: Joi.string().required().length(6)
});

