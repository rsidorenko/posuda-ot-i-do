import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_EXPIRES_IN = '1h'; // 1 час
const REFRESH_TOKEN_EXPIRES_IN = '30d'; // 30 дней
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

export interface JwtPayload {
  id: string;
  email?: string;
  role?: string;
}

export const generateTokens = (payload: JwtPayload) => {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
}; 