import { Test, TestingModule } from '@nestjs/testing';
import { CookieService } from '@/auth/service/cookie.service';
import { ConfigService } from '@nestjs/config';

describe('CookieService', () => {
  let service: CookieService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CookieService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<CookieService>(CookieService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('buildCookie', () => {
    it('개발 환경(development)에서 기본 쿠키 옵션을 올바르게 설정해야 한다', () => {
      // given
      mockConfigService.get.mockReturnValue('development');

      // when
      const result = service.buildCookie('testKey', 'testValue');

      // then
      expect(result).toEqual({
        name: 'testKey',
        value: 'testValue',
        options: {
          domain: undefined,
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
          path: '/',
        },
      });
    });

    it('운영 환경(production)에서 보안이 강화된 쿠키 옵션을 설정해야 한다', () => {
      // given
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'production';
        if (key === 'COOKIE_DOMAIN') return 'example.domain.com';
        return null;
      });

      // when
      const result = service.buildCookie('testKey', 'testValue');

      // then
      expect(result.options).toMatchObject({
        domain: 'example.domain.com',
        secure: true,
        sameSite: 'none',
      });
    });

    it('추가 옵션(options)이 제공되면 기본 옵션을 덮어써야 한다', () => {
      // given
      mockConfigService.get.mockReturnValue('development');

      // when
      const result = service.buildCookie('testKey', 'testValue', { httpOnly: false, maxAge: 1000 });

      // then
      expect(result.options.httpOnly).toBe(false);
      expect(result.options.maxAge).toBe(1000);
    });
  });

  describe('createAccessTokenCookie', () => {
    it('accessToken 쿠키를 설정 값에 맞는 만료 시간과 함께 생성해야 한다', () => {
      // given
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'development';
        if (key === 'JWT_ACCESS_TOKEN_EXPIRATION_TIME') return 3600;
        return null;
      });

      // when
      const result = service.createAccessTokenCookie('access-token-val');

      // then
      expect(result.name).toBe('accessToken');
      expect(result.value).toBe('access-token-val');
      expect(result.options.maxAge).toBe(3600);
    });
  });

  describe('createRefreshTokenCookie', () => {
    it('refreshToken 쿠키를 설정 값에 맞는 만료 시간과 함께 생성해야 한다', () => {
      // given
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'development';
        if (key === 'JWT_REFRESH_TOKEN_EXPIRATION_TIME') return 7200;
        return null;
      });

      // when
      const result = service.createRefreshTokenCookie('refresh-token-val');

      // then
      expect(result.name).toBe('refreshToken');
      expect(result.value).toBe('refresh-token-val');
      expect(result.options.maxAge).toBe(7200);
    });
  });

  describe('createSignUpTokenCookie', () => {
    it('signUpToken 쿠키를 설정 값에 맞는 만료 시간과 함께 생성해야 한다', () => {
      // given
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'development';
        if (key === 'JWT_SIGNUP_TOKEN_EXPIRATION_TIME') return 600;
        return null;
      });

      // when
      const result = service.createSignUpTokenCookie('signup-token-val');

      // then
      expect(result.name).toBe('signUpToken');
      expect(result.value).toBe('signup-token-val');
      expect(result.options.maxAge).toBe(600);
    });
  });
});
