interface RequestConfig extends RequestInit {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  authRequired?: boolean;
}

export class ApiError extends Error {
  status: number;
  errorCode?: string;

  constructor(message: string, status: number, errorCode?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errorCode = errorCode;
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = '로그인이 필요합니다.', status: number = 401, errorCode?: string) {
    super(message, status, errorCode);
    this.name = 'AuthenticationError';
  }
}

class FetchClient {
  private baseUrl: string;
  private refreshPromise: Promise<void> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config.headers,
    };

    const isServer = typeof window === 'undefined';

    // [SSR Support] 서버 사이드에서 실행될 때 쿠키를 직접 헤더에 주입합니다.
    // 이렇게 하지 않으면 Server Component에서 fetch를 할 때 쿠키가 전달되지 않습니다.
    if (isServer) {
      const { cookies } = await import('next/headers');
      const cookieStore = cookies();
      const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join('; ');
      if (cookieHeader) {
        headers['Cookie'] = cookieHeader;
      }
    }

    // 무슨 일이 있어도 쿠키 인증 사용으로 설정
    const credentials = config.credentials || 'include';
    const timeout = config.timeout ?? 10000;
    const retries = config.retries ?? 5;
    const authRequired = config.authRequired ?? false;

    const fetchConfig: RequestConfig = {
      ...config,
      headers,
      credentials,
      timeout,
      retries,
      authRequired,
    };

    let response = await this.fetchWithRetry(url, fetchConfig);

    if ((response.status === 401 || response.status === 403) && authRequired) {
      // [SSR Support] 서버 사이드에서는 재발급 로직 대신 바로 리다이렉트 처리
      if (isServer) {
        const { redirect } = await import('next/navigation');
        redirect('/home');
      }

      try {
        // 토큰 갱신 요청이 중복으로 발생하는 것을 방지하기 위한 로직입니다 (Mutex/Lock 패턴).
        // 이미 다른 요청에서 토큰 갱신을 진행 중이라면, 새로운 갱신 요청을 보내지 않습니다.
        if (!this.refreshPromise) {
          this.refreshPromise = this.refresh();
        }

        // 진행 중인 토큰 갱신 작업이 완료될 때까지 기다립니다.
        // 첫 번째 요청뿐만 아니라, 대기 중이던 다른 요청들도 여기서 함께 기다리게 됩니다.
        await this.refreshPromise;

        // 토큰 갱신이 성공적으로 완료되면, 원래 실패했던 요청을 새로운 토큰(쿠키)으로 재시도합니다.
        response = await this.fetchWithRetry(url, fetchConfig);
      } catch (error) {
        // 이 에러는 호출자에게 전달되어, 필요한 경우 로그인 페이지 리다이렉트 등의 처리가 이루어집니다.
        throw error;
      } finally {
        // 성공하든 실패하든, 현재 진행 중인 갱신 작업 표시(Promise)를 제거합니다.
        // 그래야 나중에 다시 401 에러가 발생했을 때 새로운 갱신 요청을 시작할 수 있습니다.

        // 주의: 동시다발적인 요청들이 모두 await this.refreshPromise를 통과한 시점입니다.
        // 마지막 요청이 완료되는 시점까지 기다릴 필요는 없으며,
        // 해당 Promise가 resolve/reject된 직후에 null로 초기화하는 것이 안전합니다.
        this.refreshPromise = null;
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const { message, errorCode } = this.extractErrorMeta(errorData);
      const fallbackMessage = message || `API request failed: ${response.status}`;

      if (response.status === 401 || response.status === 403) {
        throw new AuthenticationError(fallbackMessage, response.status, errorCode);
      }

      throw new ApiError(fallbackMessage, response.status, errorCode);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  private async fetchWithRetry(url: string, config: RequestConfig): Promise<Response> {
    const { timeout = 10000, retries = 5, authRequired: _authRequired, ...fetchOptions } = config;

    let lastError: unknown;

    for (let i = 0; i <= retries; i++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        // 401, 403 에러는 인증 관련이므로 재시도하지 않고 바로 반환하여
        // 상위 로직에서 토큰 갱신(refresh)을 수행하도록 함.
        if (response.status === 401 || response.status === 403) {
          return response;
        }

        // 서버 내부 에러(5xx)인 경우 일시적인 문제일 수 있으므로 재시도
        if (response.status >= 500 && i < retries) {
          continue;
        }

        // 그 외(2xx, 4xx 등)는 바로 반환
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error;
        // 마지막 시도이거나, AbortError(타임아웃)나 네트워크 에러가 아닌 경우에는 중단하고 에러 던짐?
        // 요구사항: "timeout 설정을 해서 실패시 요청을 다시 보내고" -> 타임아웃 시 재시도
        // 일반적으로 fetch는 네트워크 오류 시 reject됨.
        if (i === retries) {
          throw lastError;
        }
        // 재시도 전 잠시 대기할 수도 있음 (Exponential Backoff 등), 현재는 즉시 재시도
      }
    }

    throw lastError;
  }

  private async refresh() {
    const response = await fetch(`${this.baseUrl}/auth/re-issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      if (typeof window !== 'undefined') {
        window.location.href = '/home';
      }
      throw new AuthenticationError('로그인이 필요합니다.', response.status);
    }
  }

  private extractErrorMeta(errorData: unknown): { message?: string; errorCode?: string } {
    if (!errorData || typeof errorData !== 'object') {
      return {};
    }

    const root = errorData as Record<string, unknown>;
    const nested =
      root.data && typeof root.data === 'object' ? (root.data as Record<string, unknown>) : null;

    const messageCandidate = nested?.message ?? root.message;
    const errorCodeCandidate = nested?.errorCode ?? root.errorCode;

    return {
      message: typeof messageCandidate === 'string' ? messageCandidate : undefined,
      errorCode: typeof errorCodeCandidate === 'string' ? errorCodeCandidate : undefined,
    };
  }

  get<T>(endpoint: string, config?: RequestConfig) {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown, config?: RequestConfig) {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put<T>(endpoint: string, body?: unknown, config?: RequestConfig) {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  delete<T>(endpoint: string, config?: RequestConfig) {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  patch<T>(endpoint: string, body?: unknown, config?: RequestConfig) {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }
}

const API_BASE_URL = '/api';
export const apiClient = new FetchClient(API_BASE_URL);
