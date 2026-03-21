import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const sym = request.nextUrl.searchParams.get('symbol') || 'AAPL'
  const key = process.env.FINNHUB_API_KEY

  const [profileRes, metricsRes] = await Promise.all([
    fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${sym}&token=${key}`),
    fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${sym}&metric=all&token=${key}`)
  ])

  const profile = await profileRes.json()
  const metrics = await metricsRes.json()
  const m = metrics.metric || {}

  return NextResponse.json({
    name: profile.name,
    sector: profile.finnhubIndustry,
    mktCap: profile.marketCapitalization,
    pe: m['peBasicExclExtraTTM'] || m['peTTM'] || null,
    eps: m['epsTTM'] || null,
    high52: m['52WeekHigh'] || null,
    low52: m['52WeekLow'] || null,
    beta: m['beta'] || null,
    roe: m['roeTTM'] || null,
    revenue: m['revenueTTM'] || null,
  })
}

