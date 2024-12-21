import { NextFunction, Request, Response } from 'express';
import { loginSchema, userSchema, verificationSchema } from '../schemas/user.schema';
import logger from '../utils/logger';

const C = "User Validator";

export const validateUser = (req: Request, res: Response, next: NextFunction): void => {
  const F = "validateUser";
  const { error } = userSchema.validate(req.body);
  
  if (error) {
    logger.warn(`[${C}], [${F}], Validation error [${error.details[0].message}]`);
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  
  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction): void => {
  const F = "validateLogin";
  const { error } = loginSchema.validate(req.body);
  
  if (error) {
    logger.warn(`[${C}], [${F}], Validation error [${error.details[0].message}]`);
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  
  next();
};

export const validateVerification = (req: Request, res: Response, next: NextFunction): void => {
  const F = "validateVerification";
  const { error } = verificationSchema.validate(req.body);
  
  if (error) {
    logger.warn(`[${C}], [${F}], Validation error [${error.details[0].message}]`);
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  
  next();
};

