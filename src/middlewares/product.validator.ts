import { Request, Response, NextFunction } from 'express'
import { productSchema } from '../schemas/product.schema'

export const validateProduct = (req: Request, res: Response, next: NextFunction):void =>  {
  const { error } = productSchema.validate(req.body)
  
  if (error) {
    res.status(400).json({ error: error.details[0].message })
    return;
  }
  
  next()
}

