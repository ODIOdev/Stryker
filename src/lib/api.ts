import { supabase } from './supabase'

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? ''

async function authHeaders(): Promise<HeadersInit> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (supabase) {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token
    if (token) headers.Authorization = `Bearer ${token}`
  }
  return headers
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...(await authHeaders()), ...init?.headers },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? `API error ${res.status}`)
  }
  return res.json() as Promise<T>
}

export interface MarketBar {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export interface MarketBarsResponse {
  symbol: string
  timeframe: string
  source: 'finnhub' | 'coingecko' | 'yahoo' | 'synthetic'
  bars: MarketBar[]
}

export interface MarketQuoteResponse {
  symbol: string
  timeframe: string
  quote: {
    price: number
    change: number
    changePercent: number
    high: number
    low: number
    source: string
  }
}

export interface UserStats {
  setupsThisMonth: number
  winRate: number
  totalPnl: number
  riskReward: number
  winStreak: number
  lastTradePnl: number | null
  closedTrades: number
}

export function fetchMarketBars(
  symbol: string,
  timeframe: string,
  basePrice?: number,
  assetClass?: string
) {
  const params = new URLSearchParams({ symbol, timeframe })
  if (basePrice) params.set('basePrice', String(basePrice))
  if (assetClass) params.set('assetClass', assetClass)
  return request<MarketBarsResponse>(`/api/market/bars?${params}`)
}

export function fetchMarketQuote(
  symbol: string,
  timeframe: string,
  basePrice?: number,
  assetClass?: string
) {
  const params = new URLSearchParams({ symbol, timeframe })
  if (basePrice) params.set('basePrice', String(basePrice))
  if (assetClass) params.set('assetClass', assetClass)
  return request<MarketQuoteResponse>(`/api/market/quote?${params}`)
}

export function fetchUserStats() {
  return request<UserStats>('/api/stats')
}

export function saveSetup(payload: Record<string, unknown>) {
  return request<{ setup: unknown }>('/api/setups', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchSetups(limit = 50) {
  return request<{ setups: unknown[] }>(`/api/setups?limit=${limit}`)
}

export function saveTrade(payload: Record<string, unknown>) {
  return request<{ trade: unknown }>('/api/trades', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchTrades(limit = 50) {
  return request<{ trades: unknown[] }>(`/api/trades?limit=${limit}`)
}

export interface AdminUser {
  id: string
  email: string | null
  display_name: string | null
  role: string
  created_at: string
}

export interface AdminPlug {
  id: string
  name: string
  status: string
  description: string
}

export interface AdminOverview {
  users: AdminUser[]
  counts: {
    users: number
    setups: number
    trades: number
    marketBars: number
  }
  apiPlugs: AdminPlug[]
  integrations: AdminPlug[]
}

export function fetchAdminOverview() {
  return request<AdminOverview>('/api/admin/overview')
}
