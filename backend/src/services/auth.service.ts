import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import db from '../config/database';
import { generateId, getTimestamp } from '../utils/helpers';
import { User, UserRole } from '../types/user';

const JWT_SECRET = process.env.JWT_SECRET || 'spatial-tours-secret-key-2026';
const JWT_EXPIRES_IN = '7d';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: UserRole;
  };
}

export class AuthService {
  /**
   * Register a new user
   */
  register(data: RegisterData): AuthResponse {
    // Check if username already exists
    const existingUser = this.getUserByUsername(data.username);
    if (existingUser) {
      throw new Error('Username already taken');
    }

    // Check if email already exists
    const existingEmail = this.getUserByEmail(data.email);
    if (existingEmail) {
      throw new Error('Email already registered');
    }

    const id = generateId();
    const passwordHash = bcryptjs.hashSync(data.password, 10);
    const role = data.role || 'viewer';

    const stmt = db.prepare(`
      INSERT INTO users (id, username, email, password_hash, role)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, data.username, data.email, passwordHash, role);

    const user = this.getUserById(id)!;
    const token = this.generateToken(user);

    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Login user
   */
  login(data: LoginData): AuthResponse {
    const user = this.getUserByUsername(data.username);
    if (!user) {
      throw new Error('Invalid username or password');
    }

    const isValid = bcryptjs.compareSync(data.password, user.password_hash);
    if (!isValid) {
      throw new Error('Invalid username or password');
    }

    const token = this.generateToken(user);

    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): { userId: string; role: UserRole } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: UserRole };
      return decoded;
    } catch {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): User | undefined {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as User | undefined;
  }

  /**
   * Get user by username
   */
  getUserByUsername(username: string): User | undefined {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username) as User | undefined;
  }

  /**
   * Get user by email
   */
  getUserByEmail(email: string): User | undefined {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email) as User | undefined;
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: User): string {
    return jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  /**
   * Remove sensitive fields from user object
   */
  private sanitizeUser(user: User): AuthResponse['user'] {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }
}

export const authService = new AuthService();
