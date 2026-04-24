import { User, UserRole } from '../types/user';
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
export declare class AuthService {
    /**
     * Register a new user
     */
    register(data: RegisterData): AuthResponse;
    /**
     * Login user
     */
    login(data: LoginData): AuthResponse;
    /**
     * Verify JWT token
     */
    verifyToken(token: string): {
        userId: string;
        role: UserRole;
    };
    /**
     * Get user by ID
     */
    getUserById(id: string): User | undefined;
    /**
     * Get user by username
     */
    getUserByUsername(username: string): User | undefined;
    /**
     * Get user by email
     */
    getUserByEmail(email: string): User | undefined;
    /**
     * Generate JWT token
     */
    private generateToken;
    /**
     * Remove sensitive fields from user object
     */
    private sanitizeUser;
}
export declare const authService: AuthService;
//# sourceMappingURL=auth.service.d.ts.map