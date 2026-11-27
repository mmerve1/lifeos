import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const ACCESS_TOKEN_KEY = '@lifeos_access_token';
const REFRESH_TOKEN_KEY = '@lifeos_refresh_token';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android'
    ? 'http://10.0.2.2:5012/api'
    : 'http://localhost:5012/api');

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string | null;
  errors?: string[] | null;
}

export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  },
  async getRefreshToken(): Promise<string | null> {
    return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  },
  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken),
      AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken),
    ]);
  },
  async clearTokens(): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem(ACCESS_TOKEN_KEY),
      AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
    ]);
  },
};

async function tryRefreshTokens(): Promise<string | null> {
  const [accessToken, refreshToken] = await Promise.all([
    tokenStorage.getAccessToken(),
    tokenStorage.getRefreshToken(),
  ]);
  if (!accessToken || !refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, refreshToken }),
    });
    if (!res.ok) {
      await tokenStorage.clearTokens();
      return null;
    }
    const json = (await res.json()) as ApiResponse<{
      accessToken: string;
      refreshToken: string;
    }>;
    if (json.success && json.data?.accessToken) {
      await tokenStorage.setTokens(json.data.accessToken, json.data.refreshToken);
      return json.data.accessToken;
    }
  } catch {
    // ignore refresh failure
  }
  await tokenStorage.clearTokens();
  return null;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const { auth = true, headers, ...rest } = options;

  const makeHeaders = async (overrideToken?: string): Promise<Record<string, string>> => {
    const h: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(headers as Record<string, string> | undefined),
    };
    if (auth) {
      const token = overrideToken ?? (await tokenStorage.getAccessToken());
      if (token) {
        h.Authorization = `Bearer ${token}`;
      }
    }
    return h;
  };

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: await makeHeaders(),
    });
  } catch {
    throw new Error('Sunucuya bağlanılamadı. Backend API çalışıyor mu? (http://localhost:5012)');
  }

  // Automatic single retry after refresh on 401
  if (response.status === 401 && auth) {
    const newToken = await tryRefreshTokens();
    if (newToken) {
      response = await fetch(`${API_BASE_URL}${path}`, {
        ...rest,
        headers: await makeHeaders(newToken),
      });
    }
  }

  const text = await response.text();
  let parsed: ApiResponse<T> | null = null;
  if (text) {
    try {
      parsed = JSON.parse(text) as ApiResponse<T>;
    } catch {
      parsed = null;
    }
  }

  if (!response.ok || (parsed && !parsed.success)) {
    const errorMessage =
      parsed?.message ||
      (parsed?.errors && parsed.errors.join(', ')) ||
      `İstek başarısız oldu (${response.status})`;
    throw new Error(errorMessage);
  }

  return (parsed ? parsed.data : undefined) as T;
}
