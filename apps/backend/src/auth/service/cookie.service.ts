import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieOptions } from 'express';

@Injectable()
export class CookieService {
  constructor(private readonly configService: ConfigService) {}

  buildCookie<T>(key: string, data: T, options?: CookieOptions) {
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    const defaultOptions: CookieOptions = {
      // 배포 이후 도메인 설정 바꾸기
      domain: isProduction ? this.configService.get('COOKIE_DOMAIN') : undefined,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
    };

    return {
      name: key,
      value: data,
      options: { ...defaultOptions, ...options },
    };
  }

  createAccessTokenCookie(token: string) {
    return this.buildCookie('accessToken', token, {
      maxAge: parseInt(
        this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION_TIME') as string,
        10,
      ),
    });
  }

  createRefreshTokenCookie(token: string) {
    return this.buildCookie('refreshToken', token, {
      maxAge: parseInt(
        this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION_TIME') as string,
        10,
      ),
    });
  }

  createSignUpTokenCookie(token: string) {
    return this.buildCookie('signUpToken', token, {
      maxAge: parseInt(
        this.configService.get<string>('JWT_SIGNUP_TOKEN_EXPIRATION_TIME') as string,
        10,
      ),
    });
  }
}
