import { RowDataPacket, ResultSetHeader } from 'mysql2';
import bcrypt from 'bcrypt';
import pool from '../config/database';
import { User, CreateUserDTO } from '../types/user';
import  logger  from '../utils/logger';

const C = 'UserModel';

export class UserModel {
  static async findAll(): Promise<User[]> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id, username, email, created_at FROM users');
    return rows as User[];
  }

  static async findById(id: number): Promise<User | null> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id, username, email, created_at FROM users WHERE id = ?', [id]);
    return rows[0] as User || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] as User || null;
  }

  static async findByUsername(username:string): Promise<User | null> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0] as User || null;
  }

  static async create(user: CreateUserDTO): Promise<User> {
    const F = "create";
    const { username, email, password } = user;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpiry = new Date(Date.now() + 15 * 60000); // 15 minutes

    logger.info(`[${C}], [${F}], Creating user with email [${email}]`);

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (username, email, password, verification_code, verification_expiry) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, verificationCode, verificationExpiry]
    );

    const userId = result.insertId;
    return { 
      id: userId, 
      username, 
      email, 
      verification_code: verificationCode,
      is_verified: false,
      verification_expiry: verificationExpiry,
      created_at: new Date()
    } as User;
  }

  static async updateUnverifiedUser(email: string, password:string, username:string): Promise<User | null> {
    const F = "updateUnverifiedUser";
    logger.info(`[${C}], [${F}], Updating unverified user with email [${email}]`);

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpiry = new Date(Date.now() + 15 * 60000); // 15 minutes

    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE users SET verification_code = ?, verification_expiry = ?, password = ?, username = ? WHERE email = ? AND is_verified = FALSE',
      [verificationCode, verificationExpiry, hashedPassword, username, email]
    );

    if (result.affectedRows === 0) {
      logger.warn(`[${C}], [${F}], No unverified user found with email [${email}]`);
      return null;
    }

    const [updatedUser] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    return updatedUser[0] as User;
  }
  
  static async verifyEmail(email: string, code: string): Promise<boolean> {
    const F = "verifyEmail";
    logger.info(`[${C}], [${F}], Verifying email [${email}] with code [${code}]`);

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ? AND verification_code = ? AND verification_expiry > NOW() AND is_verified = FALSE',
      [email, code]
    );

    if (rows.length === 0) {
      logger.warn(`[${C}], [${F}], Invalid or expired verification code for email [${email}]`);
      return false;
    }

    await pool.query(
      'UPDATE users SET is_verified = TRUE, verification_code = NULL, verification_expiry = NULL WHERE email = ?',
      [email]
    );

    logger.info(`[${C}], [${F}], Successfully verified email [${email}]`);
    return true;
  }

  static async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }
}

