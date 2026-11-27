import { getAuthToken, clearAuthSession } from './auth';

export type ServiceTarget = 'core' | 'voice' | 'ai' | 'workflow';

const SERVICE_BASES: Record<ServiceTarget, string> = {
  // core: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  core: process.env.NEXT_PUBLIC_API_URL || 'https://elijahapi.pashupatashastra.in/api/v1',
  // voice: process.env.NEXT_PUBLIC_VOICE_API_URL || 'http://localhost:4002/api/v1',
  voice: process.env.NEXT_PUBLIC_VOICE_API_URL || 'https://elijahapi.pashupatashastra.in/voice/api/v1',
  // ai: process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:4003/api/v1',
  ai: process.env.NEXT_PUBLIC_AI_API_URL || 'https://elijahapi.pashupatashastra.in/ai/api/v1',
  // workflow: process.env.NEXT_PUBLIC_WORKFLOW_API_URL || 'http://localhost:4004/api/v1',
  workflow: process.env.NEXT_PUBLIC_WORKFLOW_API_URL || 'https://elijahapi.pashupatashastra.in/workflow/api/v1',
};

export class ApiError extends Error {
  statusCode: number;
  errors?: any;

  constructor(message: string, statusCode: number, errors?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export interface ApiRequestOptions extends RequestInit {
  service?: ServiceTarget;
  skipAuthRedirect?: boolean;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { service = 'core', skipAuthRedirect = false, ...fetchOptions } = options;
  const baseUrl = SERVICE_BASES[service];
  const token = typeof window !== 'undefined' ? getAuthToken() : null;

  const isRaw = fetchOptions.body instanceof Blob || fetchOptions.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(!isRaw ? { 'Content-Type': 'application/json' } : {}),
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  // Handle Unauthorized / Token Expired - ONLY for CORE backend sessions
  // Auxiliary microservices (voice, ai, workflow) must NEVER log out the user!
  if (response.status === 401 && service === 'core' && !skipAuthRedirect) {
    if (typeof window !== 'undefined') {
      clearAuthSession();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?expired=true';
      }
    }
  }

  if (!response.ok || data.success === false) {
    const errorMsg = data.error?.message || data.message || `Request failed with status ${response.status}`;
    throw new ApiError(
      errorMsg,
      response.status,
      data.error?.details || data.errors
    );
  }

  return (data.data !== undefined ? data.data : data) as T;
}

