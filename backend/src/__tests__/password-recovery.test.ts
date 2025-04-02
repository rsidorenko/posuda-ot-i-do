import { describe, expect, it, jest, beforeEach } from '@jest/globals';

// Types
interface User {
  id: string;
  email: string;
  password?: string;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: number | null;
}

interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  update(id: string, data: Partial<User>): Promise<boolean>;
}

interface EmailService {
  sendPasswordResetEmail(email: string, token: string): Promise<boolean>;
}

interface TokenService {
  generateResetToken(userId: string): Promise<string>;
  verifyToken(token: string): Promise<string>;
}

interface HashService {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}

// Mock implementations
const mockUserRepository: jest.Mocked<UserRepository> = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  update: jest.fn()
};

const mockEmailService: jest.Mocked<EmailService> = {
  sendPasswordResetEmail: jest.fn()
};

const mockTokenService: jest.Mocked<TokenService> = {
  generateResetToken: jest.fn(),
  verifyToken: jest.fn()
};

const mockHashService: jest.Mocked<HashService> = {
  hash: jest.fn(),
  compare: jest.fn()
};

// Password recovery service (unit under test)
class PasswordRecoveryService {
  constructor(
    private userRepository: UserRepository = mockUserRepository,
    private emailService: EmailService = mockEmailService,
    private tokenService: TokenService = mockTokenService,
    private hashService: HashService = mockHashService
  ) {}

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return;

    const resetToken = await this.tokenService.generateResetToken(user.id);
    await this.userRepository.update(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: Date.now() + 3600000 // 1 hour
    });
    await this.emailService.sendPasswordResetEmail(email, resetToken);
  }

  async verifyResetToken(token: string): Promise<string> {
    const userId = await this.tokenService.verifyToken(token);
    const user = await this.userRepository.findById(userId);
    if (!user || !user.resetPasswordToken || !user.resetPasswordExpires || user.resetPasswordExpires < Date.now()) {
      throw new Error('Invalid or expired token');
    }
    return userId;
  }

  async resetPassword(userId: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    const hashedPassword = await this.hashService.hash(newPassword);
    await this.userRepository.update(userId, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });
  }
}

describe('Password Recovery Service Unit Tests', () => {
  let service: PasswordRecoveryService;
  const testUser: User = {
    id: 'user123',
    email: 'test@example.com',
    password: 'hashed-password'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PasswordRecoveryService();
  });

  describe('requestPasswordReset', () => {
    it('should handle password reset request', async () => {
      // Arrange
      const email = 'test@example.com';
      const resetToken = 'reset-token-123';
      
      mockUserRepository.findByEmail.mockResolvedValue(testUser);
      mockTokenService.generateResetToken.mockResolvedValue(resetToken);
      mockUserRepository.update.mockResolvedValue(true);
      mockEmailService.sendPasswordResetEmail.mockResolvedValue(true);

      // Act
      await service.requestPasswordReset(email);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockTokenService.generateResetToken).toHaveBeenCalledWith(testUser.id);
      expect(mockUserRepository.update).toHaveBeenCalledWith(testUser.id, {
        resetPasswordToken: resetToken,
        resetPasswordExpires: expect.any(Number)
      });
      expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(email, resetToken);
    });

    it('should do nothing if user not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act
      await service.requestPasswordReset(email);

      // Assert
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockTokenService.generateResetToken).not.toHaveBeenCalled();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
      expect(mockEmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  describe('verifyResetToken', () => {
    it('should verify valid reset token', async () => {
      // Arrange
      const token = 'valid-token';
      const currentTime = Date.now();
      const userWithToken: User = {
        ...testUser,
        resetPasswordToken: token,
        resetPasswordExpires: currentTime + 3600000
      };
      
      mockTokenService.verifyToken.mockResolvedValue(testUser.id);
      mockUserRepository.findById.mockResolvedValue(userWithToken);

      // Act
      const result = await service.verifyResetToken(token);

      // Assert
      expect(result).toBe(testUser.id);
      expect(mockTokenService.verifyToken).toHaveBeenCalledWith(token);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(testUser.id);
    });

    it('should reject expired reset token', async () => {
      // Arrange
      const token = 'expired-token';
      const userWithExpiredToken: User = {
        ...testUser,
        resetPasswordToken: token,
        resetPasswordExpires: Date.now() - 3600000 // expired
      };
      
      mockTokenService.verifyToken.mockResolvedValue(testUser.id);
      mockUserRepository.findById.mockResolvedValue(userWithExpiredToken);

      // Act & Assert
      await expect(service.verifyResetToken(token))
        .rejects
        .toThrow('Invalid or expired token');
    });

    it('should reject invalid token', async () => {
      // Arrange
      const token = 'invalid-token';
      mockTokenService.verifyToken.mockRejectedValue(new Error('Invalid token'));

      // Act & Assert
      await expect(service.verifyResetToken(token))
        .rejects
        .toThrow('Invalid token');
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid user', async () => {
      // Arrange
      const newPassword = 'newPassword123';
      const hashedPassword = 'hashed-password-123';
      
      mockUserRepository.findById.mockResolvedValue(testUser);
      mockHashService.hash.mockResolvedValue(hashedPassword);
      mockUserRepository.update.mockResolvedValue(true);

      // Act
      await service.resetPassword(testUser.id, newPassword);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(testUser.id);
      expect(mockHashService.hash).toHaveBeenCalledWith(newPassword);
      expect(mockUserRepository.update).toHaveBeenCalledWith(testUser.id, {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      });
    });

    it('should throw error when resetting password for non-existent user', async () => {
      // Arrange
      const userId = 'non-existent-user';
      const newPassword = 'newPassword123';
      
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.resetPassword(userId, newPassword))
        .rejects
        .toThrow('User not found');
    });
  });
}); 