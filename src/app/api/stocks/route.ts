import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const sym = request.nextUrl.searchParams.get('symbol') || 'AAPL'
  const key = process.env.FINNHUB_API_KEY

  const [quoteRes, newsRes] = await Promise.all([
    fetch(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${key}`),
    fetch(`https://finnhub.io/api/v1/company-news?symbol=${sym}&from=2025-01-01&to=2025-12-31&token=${key}`)
  ])

  const quote = await quoteRes.json()
  const news = await newsRes.json()

  return NextResponse.json({
    symbol: sym,
    price: quote.c,
    change: quote.d,
    changePercent: quote.dp,
    high: quote.h,
    low: quote.l,
    news: Array.isArray(news) ? news.slice(0, 5).map((n: any) => ({
      headline: n.headline,
      summary: n.summary,
      source: n.source,
      url: n.url,
    })) : []
  })
}