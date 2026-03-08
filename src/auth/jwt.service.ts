import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
  uid: string | number;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtService {
  private readonly logger = new Logger(JwtService.name);
  private readonly secret: string;

  constructor(private readonly config: ConfigService) {
    this.secret = this.config.get<string>('jwtSecret')!;
  }

  /**
   * Equivalent of comprobarJWT() from backend-carwash-node/hooks/jwt.js.
   * Verifies signature only — no DB lookup in the socket service.
   * Returns the decoded payload or null on failure.
   */
  verify(token: string): JwtPayload | null {
    try {
      const payload = jwt.verify(token, this.secret) as JwtPayload;
      this.logger.debug(`Token valid, uid=${payload.uid}`);
      return payload;
    } catch (err) {
      this.logger.warn(`Token invalid: ${(err as Error).message}`);
      return null;
    }
  }
}
