import { Request, Response, NextFunction } from 'express';
import { purchaseSchema } from '../schemas/purchase.schema';

export const validatePurchase = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = purchaseSchema.validate(req.body);
  
  if (error) {
    res.status(400).json({ error: error.details[0].message });
    return;
  }
  
  next();
};

