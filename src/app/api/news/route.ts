import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const sym = request.nextUrl.searchParams.get('symbol') || 'AAPL'
  const key = process.env.FINNHUB_API_KEY
  
  const today = new Date().toISOString().split('T')[0]
  const monthAgo = new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0]

  const res = await fetch(
    `https://finnhub.io/api/v1/company-news?symbol=${sym}&from=${monthAgo}&to=${today}&token=${key}`
  )
  const news = await res.json()

  return NextResponse.json(
    Array.isArray(news) ? news.slice(0, 8).map((n: any) => ({
      headline: n.headline,
      summary: n.summary,
      source: n.source,
      url: n.url,
      datetime: new Date(n.datetime * 1000).toLocaleDateString('de-DE')
    })) : []
  )
}