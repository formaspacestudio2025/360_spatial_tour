"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("../config/database"));
const helpers_1 = require("../utils/helpers");
const JWT_SECRET = process.env.JWT_SECRET || 'spatial-tours-secret-key-2026';
const JWT_EXPIRES_IN = '7d';
class AuthService {
    /**
     * Register a new user
     */
    register(data) {
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
        const id = (0, helpers_1.generateId)();
        const passwordHash = bcryptjs_1.default.hashSync(data.password, 10);
        const role = data.role || 'viewer';
        const stmt = database_1.default.prepare(`
      INSERT INTO users (id, username, email, password_hash, role)
      VALUES (?, ?, ?, ?, ?)
    `);
        stmt.run(id, data.username, data.email, passwordHash, role);
        const user = this.getUserById(id);
        const token = this.generateToken(user);
        return {
            token,
            user: this.sanitizeUser(user),
        };
    }
    /**
     * Login user
     */
    login(data) {
        const user = this.getUserByUsername(data.username);
        if (!user) {
            throw new Error('Invalid username or password');
        }
        const isValid = bcryptjs_1.default.compareSync(data.password, user.password_hash);
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
    verifyToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            return decoded;
        }
        catch {
            throw new Error('Invalid or expired token');
        }
    }
    /**
     * Get user by ID
     */
    getUserById(id) {
        const stmt = database_1.default.prepare('SELECT * FROM users WHERE id = ?');
        return stmt.get(id);
    }
    /**
     * Get user by username
     */
    getUserByUsername(username) {
        const stmt = database_1.default.prepare('SELECT * FROM users WHERE username = ?');
        return stmt.get(username);
    }
    /**
     * Get user by email
     */
    getUserByEmail(email) {
        const stmt = database_1.default.prepare('SELECT * FROM users WHERE email = ?');
        return stmt.get(email);
    }
    /**
     * Generate JWT token
     */
    generateToken(user) {
        return jsonwebtoken_1.default.sign({ userId: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    }
    /**
     * Remove sensitive fields from user object
     */
    sanitizeUser(user) {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        };
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map