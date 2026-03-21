import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') || ''
  const key = process.env.FINNHUB_API_KEY
  const res = await fetch(`https://finnhub.io/api/v1/search?q=${q}&token=${key}`)
  const data = await res.json()

  return NextResponse.json(
    (data.result || [])
      .filter((r: any) => 
        r.type === 'Common Stock' &&
        !r.symbol.includes('.') || 
        r.symbol.endsWith('.DE') || 
        r.symbol.endsWith('.PA') ||
        r.symbol.endsWith('.L') ||
        r.symbol.endsWith('.MI') ||
        r.symbol.endsWith('.AS')
      )
      .slice(0, 8)
      .map((r: any) => ({
        sym: r.symbol,
        name: r.description,
      }))
  )
}