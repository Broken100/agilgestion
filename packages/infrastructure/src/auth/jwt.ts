// packages/infrastructure/src/auth/jwt.ts
import { SignJWT, jwtVerify } from 'jose';
import type { User } from '../db/schema';

const jwt_secret = process.env.JWT_SECRET;
if (!jwt_secret) throw new Error('JWT_SECRET environment variable is required');
const secret = new TextEncoder().encode(jwt_secret);

export interface JWTPayload {
  sub: string;
  email: string;
  businessId: string;
  rol: string;
  iat: number;
  exp: number;
}

export class JWTAuthService {
  async sign(user: User): Promise<string> {
    return new SignJWT({
      sub: user.id,
      email: user.email,
      businessId: user.businessId,
      rol: user.rol,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);
  }

  async verify(token: string): Promise<JWTPayload> {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  }

  extractToken(authHeader: string | null): string | null {
    if (!authHeader) return null;
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
    return parts[1] ?? null;
  }

  async verifyFromHeader(authHeader: string | null): Promise<JWTPayload | null> {
    const token = this.extractToken(authHeader);
    if (!token) return null;
    try {
      return await this.verify(token);
    } catch {
      return null;
    }
  }
}

export const jwtAuthService = new JWTAuthService();