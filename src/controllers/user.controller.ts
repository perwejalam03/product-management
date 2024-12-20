import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/user.model';
import { CreateUserDTO, LoginUserDTO, VerifyEmailDTO } from '../types/user';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';
import { sendVerificationEmail } from '../utils/email';
import { messages } from '../config/messages';

const C = "UserController";
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export class UserController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    const F = "register";
    try {
      const userData: CreateUserDTO = req.body;
      logger.info(`[${C}], [${F}], Registering new user with email [${userData.email}]`);
      
      const existingUser = await UserModel.findByEmail(userData.email);
      if (existingUser) {
        if (existingUser.is_verified) {
          logger.warn(`[${C}], [${F}], Email already verified and registered [${userData.email}]`);
          res.status(400).json({ error: messages.EMAIL_ALREADY_EXISTS });
          return;
        } else {
          // User exists but not verified, update the verification code and expiry
          const updatedUser = await UserModel.updateUnverifiedUser(userData.email, userData.password, userData.username);
          if (!updatedUser) {
            logger.error(`[${C}], [${F}], Failed to update unverified user [${userData.email}]`);
            res.status(500).json({ error: 'Failed to update user' });
            return;
          }
          
          // Send new verification email
          const emailSent = await sendVerificationEmail(updatedUser.email, updatedUser.verification_code!);
          if (!emailSent) {
            logger.error(`[${C}], [${F}], Failed to send verification email to [${updatedUser.email}]`);
            res.status(500).json({ error: 'Failed to send verification email' });
            return;
          }

          res.status(200).json({ 
            message: messages.REGISTER_SUCCESS,
            user: { 
              id: updatedUser.id, 
              username: updatedUser.username, 
              email: updatedUser.email,
              is_verified: updatedUser.is_verified
            }
          });
          return;
        }
      }

      const user = await UserModel.create(userData);
      
      // Send verification email
      const emailSent = await sendVerificationEmail(user.email, user.verification_code!);
      if (!emailSent) {
        logger.error(`[${C}], [${F}], Failed to send verification email to [${user.email}]`);
        res.status(500).json({ error: 'Failed to send verification email' });
        return;
      }

      res.status(201).json({ 
        message: messages.REGISTER_SUCCESS,
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          is_verified: user.is_verified
        }
      });
    } catch (error) {
      logger.error(`[${C}], [${F}], Error [${(error as Error).message}]`);
      next(error);
    }
  }

  static async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    const F = "verifyEmail";
    try {
      const { email, code }: VerifyEmailDTO = req.body;
      logger.info(`[${C}], [${F}], Verifying email [${email}]`);

      const verified = await UserModel.verifyEmail(email, code);
      
      if (!verified) {
        logger.warn(`[${C}], [${F}], Invalid or expired verification code for email [${email}]`);
        res.status(400).json({ error: messages.VERIFY_EMAIL_FAILED });
        return;
      }

      res.json({ message: messages.VERIFY_EMAIL_SUCCESS });
    } catch (error) {
      logger.error(`[${C}], [${F}], Error [${(error as Error).message}]`);
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    const F = "login";
    try {
      const { email, password }: LoginUserDTO = req.body;
      logger.info(`[${C}], [${F}], Login attempt for email [${email}]`);

      const user = await UserModel.findByEmail(email);

      if (!user || !(await UserModel.verifyPassword(user, password))) {
        logger.warn(`[${C}], [${F}], Invalid credentials for email [${email}]`);
        res.status(401).json({ error: messages.INVALID_CREDENTIALS });
        return;
      }

      if (!user.is_verified) {
        logger.warn(`[${C}], [${F}], Unverified email attempt to login [${email}]`);
        res.status(403).json({ error: messages.EMAIL_UNVERIFIED });
        return;
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
      logger.info(`[${C}], [${F}], Successful login for email [${email}]`);
      
      res.json({ 
        token, 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          is_verified: user.is_verified
        } 
      });
    } catch (error) {
      logger.error(`[${C}], [${F}], Error [${(error as Error).message}]`);
      next(error);
    }
  }

  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    const F = "getProfile";
    try {
      const userId = (req as any).userId;
      logger.info(`[${C}], [${F}], UserId [${userId}]`);

      const user = await UserModel.findById(userId);

      if (!user) {
        logger.warn(`[${C}], [${F}], User not found for UserId [${userId}]`);
        res.status(404).json({ error: messages.USER_NOT_FOUND });
        return;
      }

      res.json({ id: user.id, username: user.username, email: user.email, is_verified: user.is_verified });
    } catch (error) {
      logger.error(`[${C}], [${F}], Error [${(error as Error).message}]`);
      next(error);
    }
  }
}

