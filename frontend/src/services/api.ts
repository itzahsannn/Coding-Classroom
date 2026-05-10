import { API_BASE_URL } from '@/utils/constants'
import { supabase } from '@/lib/supabaseClient'

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, ...init } = options

  // Safely combine API_BASE_URL and endpoint to avoid double slashes
  let base = API_BASE_URL.replace(/\/$/, '')
  // If the user forgot to add /api in Vercel, add it automatically
  if (!base.endsWith('/api')) {
    base += '/api'
  }
  const path = endpoint.replace(/^\//, '')
  let url = `${base}/${path}`
  if (params) {
    const searchParams = new URLSearchParams(
      Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
    )
    url += `?${searchParams.toString()}`
  }

  // Inject Supabase JWT token for Express auth
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
    ...init,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `HTTP error: ${response.status}`)
  }

  return response.json() as Promise<T>
}

export const expressApi = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      ...(body ? { body: JSON.stringify(body) } : {}),
    }),
}
