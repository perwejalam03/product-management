import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

const C = "Auth Middleware";
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const F = "authenticateToken";
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logger.warn(`[${C}], [${F}], No token provided`);
    res.status(401).json({ error: 'Authentication token required' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      logger.warn(`[${C}], [${F}], Invalid token`);
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }

    logger.info(`[${C}], [${F}], Valid token for UserId [${decoded.userId}]`);
    (req as any).userId = decoded.userId;
    next();
  });
};

