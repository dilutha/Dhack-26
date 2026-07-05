import { AuthService } from '@/lib/auth';

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only';

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate tokens for a user', () => {
    const userId = 'user123';
    const email = 'test@example.com';
    const role = 'admin';

    const { accessToken, refreshToken } = AuthService.generateTokens(
      userId,
      email,
      role
    );

    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
    expect(typeof accessToken).toBe('string');
    expect(typeof refreshToken).toBe('string');
  });

  it('should verify valid access token', () => {
    const userId = 'user123';
    const email = 'test@example.com';
    const role = 'admin';

    const { accessToken } = AuthService.generateTokens(userId, email, role);
    const payload = AuthService.verifyAccessToken(accessToken);

    expect(payload).toBeDefined();
    expect(payload?.userId).toBe(userId);
    expect(payload?.email).toBe(email);
    expect(payload?.role).toBe(role);
  });

  it('should return null for invalid token', () => {
    const invalidToken = 'invalid.token.here';
    const payload = AuthService.verifyAccessToken(invalidToken);

    expect(payload).toBeNull();
  });

  it('should extract token from request headers', () => {
    const mockRequest = {
      headers: {
        get: jest.fn(header => {
          if (header === 'authorization') {
            return 'Bearer valid.token.here';
          }
          return null;
        }),
      },
    } as any;

    const token = AuthService.extractTokenFromRequest(mockRequest);

    expect(token).toBe('valid.token.here');
  });

  it('should return null when no authorization header', () => {
    const mockRequest = {
      headers: {
        get: jest.fn(() => null),
      },
    } as any;

    const token = AuthService.extractTokenFromRequest(mockRequest);

    expect(token).toBeNull();
  });
});
