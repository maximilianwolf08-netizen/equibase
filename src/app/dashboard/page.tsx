'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const STOCKS_DEFAULT = [
  {sym:'NVDA',name:'NVIDIA Corp',sector:'Halbleiter',sig:'buy',bars:[5,6,7,8,7,9,10]},
  {sym:'AAPL',name:'Apple Inc',sector:'Technologie',sig:'hold',bars:[6,6,7,6,7,7,8]},
  {sym:'MSFT',name:'Microsoft Corp',sector:'Technologie',sig:'buy',bars:[6,7,7,8,7,8,9]},
  {sym:'TSLA',name:'Tesla Inc',sector:'E-Auto',sig:'sell',bars:[8,6,5,4,5,3,3]},
  {sym:'META',name:'Meta Platforms',sector:'Social Media',sig:'buy',bars:[6,7,8,8,9,9,10]},
  {sym:'JPM',name:'JPMorgan Chase',sector:'Banken',sig:'buy',bars:[6,6,7,7,8,8,9]},
  {sym:'AMZN',name:'Amazon.com',sector:'E-Commerce',sig:'buy',bars:[5,6,5,7,6,7,7]},
  {sym:'GOOGL',name:'Alphabet Inc',sector:'Technologie',sig:'buy',bars:[5,6,6,7,7,8,8]},
  {sym:'ADBE',name:'Adobe Inc',sector:'Software',sig:'buy',bars:[5,6,7,7,8,8,9]},
  {sym:'NFLX',name:'Netflix Inc',sector:'Streaming',sig:'hold',bars:[5,6,7,6,8,7,8]},
]

const MKTS = [
  {name:'DAX',val:'18.847',chg:'+1.24%',pos:true},
  {name:'S&P 500',val:'5.864',chg:'+0.31%',pos:true},
  {name:'NASDAQ',val:'18.421',chg:'+0.87%',pos:true},
  {name:'EUR/USD',val:'1.0821',chg:'-0.12%',pos:false},
  {name:'Gold',val:'$2.384',chg:'+0.54%',pos:true},
]

const css = `
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#0d0f12;}
  .nb{background:none;border:none;color:#94a3b8;padding:5px 12px;border-radius:6px;font-size:11px;cursor:pointer;transition:all 0.15s;font-family:inherit;}
  .nb:hover{color:#e2e8f0;background:#191d22;}
  .nb.active{color:#6ee7b7;background:rgba(110,231,183,0.08);}
  .wl-item{display:flex;align-items:center;gap:10px;padding:10px 16px;border-bottom:1px solid #1e2530;cursor:pointer;transition:background 0.1s;}
  .wl-item:hover{background:#191d22;}
  .wl-item.sel{background:rgba(110,231,183,0.04);border-left:2px solid rgba(110,231,183,0.4);padding-left:14px;}
  .wl-item:hover .sym{transform:scale(1.08);}
  .sym{background:rgba(110,231,183,0.08);border:1px solid rgba(110,231,183,0.15);color:#6ee7b7;padding:3px 8px;border-radius:6px;font-size:10px;font-weight:700;min-width:44px;text-align:center;transition:transform 0.15s;display:inline-block;}
  .tbl{width:100%;border-collapse:collapse;}
  .tbl th{font-size:9px;color:#475569;letter-spacing:1px;text-transform:uppercase;padding:8px 14px;text-align:left;border-bottom:1px solid #1e2530;}
  .tbl td{padding:9px 14px;border-bottom:1px solid rgba(30,37,48,0.8);font-size:12px;color:#e2e8f0;}
  .tbl tr:last-child td{border-bottom:none;}
  .tbl tr.cl{transition:background 0.1s;cursor:pointer;}
  .tbl tr.cl:hover td{background:#191d22;}
  .pill{display:inline-block;padding:2px 7px;border-radius:10px;font-size:9px;font-weight:600;}
  .ni{padding:8px 0;border-bottom:1px solid #1e2530;cursor:pointer;}
  .ni:last-child{border-bottom:none;}
  .ni:hover .ni-head{color:#6ee7b7;}
  .ni-head{font-size:11px;line-height:1.4;transition:color 0.12s;color:#e2e8f0;}
  .ni-body{font-size:10px;color:#94a3b8;margin-top:2px;line-height:1.4;}
  .ainp{width:100%;background:#1f242a;border:1px solid #242c38;color:#e2e8f0;padding:7px 10px;border-radius:7px;font-size:12px;outline:none;margin-bottom:7px;font-family:inherit;}
  .ainp:focus{border-color:rgba(110,231,183,0.3);}
  .ainp::placeholder{color:#475569;}
  .sg{background:#1f242a;border:1px solid #242c38;color:#94a3b8;padding:4px 10px;border-radius:5px;font-size:11px;cursor:pointer;font-family:inherit;display:flex;flex-direction:column;gap:1px;text-align:left;}
  .sg:hover{border-color:rgba(110,231,183,0.3);color:#6ee7b7;}
  .btn-sm{padding:5px 12px;border-radius:6px;font-size:11px;border:1px solid #2d3748;background:#1f242a;color:#94a3b8;cursor:pointer;font-family:inherit;}
  .btn-sm:hover{border-color:rgba(110,231,183,0.3);color:#6ee7b7;}
  input[type=range]{-webkit-appearance:none;width:100%;height:3px;background:#1f242a;border-radius:2px;outline:none;cursor:pointer;}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;background:#6ee7b7;border-radius:50%;opacity:0.8;}
  @keyframes spin{to{transform:rotate(360deg)}}
  .spinner{width:16px;height:16px;border:2px solid #1e2530;border-top-color:#6ee7b7;border-radius:50%;animation:spin 0.8s linear infinite;display:inline-block;}
`

type Stock = {sym:string;name:string;sector:string;sig:string;bars:number[]}

export default function Dashboard() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('home')
  const [stocks, setStocks] = useState<Stock[]>(STOCKS_DEFAULT)
  const [watchlist, setWatchlist] = useState(['NVDA','AAPL','MSFT','TSLA','META','JPM'])
  const [selSym, setSelSym] = useState('NVDA')
  const [addOpen, setAddOpen] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [liveData, setLiveData] = useState<Record<string,any>>({})
  const [liveNews, setLiveNews] = useState<any[]>([])
  const [fundamentals, setFundamentals] = useState<Record<string,any>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/')
      else setUser(data.user)
    })
  }, [])

  useEffect(() => {
    if (user) selectStock('AAPL')
  }, [user])

  const getS = (sym: string) => stocks.find(s => s.sym === sym)

  const selectStock = async (sym: string) => {
    setSelSym(sym)
    setLoading(true)
    setLiveNews([])
    try {
      const [stockRes, fundRes] = await Promise.all([
        fetch(`/api/stocks?symbol=${sym}`),
        fetch(`/api/fundamentals?symbol=${sym}`)
      ])
      const data = await stockRes.json()
      const fund = await fundRes.json()
      setLiveData(prev => ({...prev, [sym]: data}))
      setFundamentals(prev => ({...prev, [sym]: fund}))
      setLiveNews(data.news || [])
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  const handleSearch = async (q: string) => {
    setSearchQ(q)
    if (q.length < 2) { setSearchResults([]); return }
    setSearching(true)
    const res = await fetch(`/api/search?q=${q}`)
    const data = await res.json()
    setSearchResults(data)
    setSearching(false)
  }

  const addToWatchlist = (r: any) => {
    if (!watchlist.includes(r.sym)) {
      setWatchlist(prev => [...prev, r.sym])
      if (!stocks.find(s => s.sym === r.sym)) {
        setStocks(prev => [...prev, {sym:r.sym, name:r.name, sector:'', sig:'hold', bars:[5,5,5,5,5,5,5]}])
      }
    }
    setSearchQ('')
    setSearchResults([])
    setAddOpen(false)
    selectStock(r.sym)
  }

  const spark = (bars: number[], neg: boolean) => {
    const mx = Math.max(...bars)
    return bars.map((v, i) => {
      const h = Math.round(v / mx * 13)
      const dn = neg && i >= bars.length - 2
      return `<div style="width:3px;height:${h}px;background:${dn?'#f87171':'#6ee7b7'};opacity:0.6;border-radius:1px 1px 0 0;"></div>`
    }).join('')
  }

  const fmtMkt = (cap: number) => {
    if (!cap) return '—'
    if (cap >= 1000000) return '$'+(cap/1000000).toFixed(1)+'T'
    if (cap >= 1000) return '$'+(cap/1000).toFixed(1)+'B'
    return '$'+cap.toFixed(0)+'M'
  }

  if (!user) return null

  const selStock = getS(selSym)
  const selLive = liveData[selSym]
  const selFund = fundamentals[selSym]
  const price = selLive?.price ?? 0
  const chgPct = selLive?.changePercent ?? 0
  const neg = chgPct < 0
  const s = (x: any) => x

  const kpis = [
    {l:'P/E', v: selFund?.pe ? selFund.pe.toFixed(1)+'x' : '—'},
    {l:'Mkt Cap', v: selFund?.mktCap ? fmtMkt(selFund.mktCap) : '—'},
    {l:'52W High', v: selFund?.high52 ? '$'+selFund.high52.toFixed(0) : '—'},
    {l:'52W Low', v: selFund?.low52 ? '$'+selFund.low52.toFixed(0) : '—'},
    {l:'Beta', v: selFund?.beta ? selFund.beta.toFixed(2) : '—'},
    {l:'Signal', v: selStock?.sig==='buy'?'Kaufen':selStock?.sig==='sell'?'Verkaufen':'Halten'},
  ]

  return (
    <div style={s({background:'#0d0f12',minHeight:'100vh',color:'#e2e8f0',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',fontSize:'13px'})}>
      <style>{css}</style>

      <div style={s({background:'#0d0f12',borderBottom:'1px solid #1e2530',padding:'0 20px',display:'flex',alignItems:'center',height:'52px'})}>
        <div style={s({fontSize:'15px',fontWeight:700,color:'#6ee7b7',marginRight:'24px'})}>Equibase</div>
        <nav style={s({display:'flex',gap:'1px'})}>
          {[{id:'home',label:'Watchlist'},{id:'screener',label:'Screener'},{id:'hedgefund',label:'Hedge Funds'},{id:'insider',label:'Insider'},{id:'dcf',label:'DCF'}].map(tab => (
            <button key={tab.id} className={`nb ${activeTab===tab.id?'active':''}`} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
          ))}
        </nav>
        <div style={s({marginLeft:'auto',display:'flex',alignItems:'center',gap:'10px'})}>
          <div style={s({width:5,height:5,borderRadius:'50%',background:'#6ee7b7',opacity:0.7})}></div>
          <span style={s({fontSize:'11px',color:'#475569'})}>{user.email}</span>
          <button className="btn-sm" onClick={async()=>{await supabase.auth.signOut();router.push('/')}}>Abmelden</button>
        </div>
      </div>

      <div style={s({padding:'20px',maxWidth:'1400px',margin:'0 auto'})}>

        <div style={s({display:'flex',border:'1px solid #1e2530',borderRadius:'10px',overflow:'hidden',marginBottom:'18px'})}>
          {MKTS.map(m => (
            <div key={m.name} style={s({flex:1,padding:'10px 14px',background:'#13161a',borderRight:'1px solid #1e2530'})}>
              <div style={s({fontSize:'9px',color:'#475569',letterSpacing:'0.8px',textTransform:'uppercase' as const,marginBottom:'3px'})}>{m.name}</div>
              <div style={s({fontSize:'13px',fontWeight:600,color:m.pos?'#6ee7b7':'#f87171'})}>{m.val}</div>
              <div style={s({fontSize:'9px',marginTop:'2px',color:m.pos?'#6ee7b7':'#f87171'})}>{m.chg}</div>
            </div>
          ))}
        </div>

        {activeTab==='home' && (
          <div style={s({display:'grid',gridTemplateColumns:'1fr 400px',gap:'16px'})}>
            <div style={s({background:'#13161a',border:'1px solid #1e2530',borderRadius:'12px',overflow:'hidden'})}>
              <div style={s({padding:'13px 16px',borderBottom:'1px solid #1e2530',display:'flex',alignItems:'center',justifyContent:'space-between'})}>
                <div>
                  <div style={s({fontSize:'12px',fontWeight:600})}>Meine Watchlist</div>
                  <div style={s({fontSize:'10px',color:'#475569',marginTop:'1px'})}>Echtzeit-Kurse · Jede Aktie weltweit suchbar</div>
                </div>
                <button className="btn-sm" style={s({background:'rgba(110,231,183,0.08)',borderColor:'rgba(110,231,183,0.15)',color:'#6ee7b7'})} onClick={() => setAddOpen(!addOpen)}>+ Hinzufügen</button>
              </div>

              {addOpen && (
                <div style={s({background:'#191d22',borderBottom:'1px solid #1e2530',padding:'12px 14px'})}>
                  <input
                    className="ainp"
                    placeholder="Aktie suchen — z.B. Apple, Siemens, LVMH, Toyota..."
                    value={searchQ}
                    onChange={e => handleSearch(e.target.value)}
                    autoFocus
                  />
                  {searching && <div style={s({fontSize:'11px',color:'#475569',marginBottom:'6px'})}>Suche läuft...</div>}
                  {searchResults.length > 0 && (
                    <div style={s({display:'flex',flexDirection:'column' as const,gap:'4px',maxHeight:'200px',overflowY:'auto' as const})}>
                      {searchResults.filter((r:any) => !watchlist.includes(r.sym)).map((r: any) => (
                        <button key={r.sym} className="sg" onClick={() => addToWatchlist(r)}>
                          <span style={s({color:'#6ee7b7',fontWeight:700,fontSize:'11px'})}>{r.sym}</span>
                          <span style={s({color:'#475569',fontSize:'10px'})}>{r.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchQ.length >= 2 && !searching && searchResults.length === 0 && (
                    <div style={s({fontSize:'11px',color:'#475569'})}>Keine Ergebnisse gefunden.</div>
                  )}
                </div>
              )}

              {watchlist.map(sym => {
                const st = getS(sym)
                if (!st) return null
                const live = liveData[sym]
                const lp = live?.price
                const lc = live?.changePercent ?? 0
                const isNeg = lc < 0
                return (
                  <div key={sym} className={`wl-item ${sym===selSym?'sel':''}`} onClick={() => selectStock(sym)}>
                    <span className="sym">{st.sym.replace('.DE','').replace('.F','')}</span>
                    <div style={s({minWidth:0})}>
                      <div style={s({fontSize:'11px'})}>{st.name}</div>
                      <div style={s({fontSize:'9px',color:'#475569'})}>{st.sector || sym}</div>
                    </div>
                    <div style={s({marginLeft:'auto',textAlign:'right' as const})}>
                      {lp ? (
                        <>
                          <div style={s({fontSize:'12px',fontWeight:600})}>{lp.toFixed(2)}</div>
                          <div style={s({fontSize:'10px',color:isNeg?'#f87171':'#6ee7b7'})}>{isNeg?'▼':'▲'} {Math.abs(lc).toFixed(2)}%</div>
                        </>
                      ) : (
                        <div style={s({fontSize:'10px',color:'#475569'})}>laden...</div>
                      )}
                      <div style={s({display:'flex',alignItems:'flex-end',gap:'1.5px',height:'14px',marginTop:'3px',justifyContent:'flex-end'})} dangerouslySetInnerHTML={{__html:spark(st.bars,isNeg)}} />
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={s({background:'#13161a',border:'1px solid #1e2530',borderRadius:'12px',overflow:'hidden'})}>
              {selStock && (
                <>
                  <div style={s({position:'relative',padding:'20px 18px 16px',borderBottom:'1px solid #1e2530',overflow:'hidden'})}>
                    <div style={s({position:'absolute',right:'-10px',top:'50%',transform:'translateY(-50%)',fontSize:'80px',fontWeight:900,opacity:0.04,color:'#e2e8f0',pointerEvents:'none',userSelect:'none' as const})}>
                      {selStock.sym.replace('.DE','').replace('.F','')}
                    </div>
                    <div style={s({position:'relative',zIndex:1})}>
                      <div style={s({fontSize:'20px',fontWeight:700,color:'#6ee7b7'})}>{selStock.sym.replace('.DE','').replace('.F','')}</div>
                      <div style={s({fontSize:'11px',color:'#94a3b8',marginBottom:'8px'})}>{selFund?.name || selStock.name} · {selFund?.sector || selStock.sector}</div>
                      {loading ? (
                        <div style={s({display:'flex',alignItems:'center',gap:'8px',color:'#475569',fontSize:'12px',padding:'8px 0'})}>
                          <div className="spinner"></div> Lade Echtzeit-Daten...
                        </div>
                      ) : (
                        <>
                          <div style={s({fontSize:'28px',fontWeight:700,color:neg?'#f87171':'#6ee7b7'})}>{price > 0 ? price.toFixed(2) : '—'}</div>
                          <div style={s({fontSize:'12px',color:neg?'#f87171':'#6ee7b7',marginTop:'4px'})}>{neg?'▼':'▲'} {Math.abs(chgPct).toFixed(2)}% heute</div>
                          {selLive && <div style={s({fontSize:'10px',color:'#475569',marginTop:'4px'})}>H: {selLive.high?.toFixed(2)} · L: {selLive.low?.toFixed(2)}</div>}
                        </>
                      )}
                      <div style={s({display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'5px',marginTop:'12px'})}>
                        {kpis.map(k => (
                          <div key={k.l} style={s({background:'rgba(13,15,18,0.6)',border:'1px solid #1e2530',borderRadius:'6px',padding:'6px 8px'})}>
                            <div style={s({fontSize:'8px',color:'#475569',letterSpacing:'0.8px',textTransform:'uppercase' as const,marginBottom:'2px'})}>{k.l}</div>
                            <div style={s({fontSize:'11px',fontWeight:600})}>{k.v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={s({padding:'12px 14px'})}>
                    <div style={s({fontSize:'9px',color:'#475569',letterSpacing:'1px',textTransform:'uppercase' as const,marginBottom:'8px'})}>
                      Aktuelle News · {selStock.sym.replace('.DE','').replace('.F','')}
                    </div>
                    {loading ? (
                      <div style={s({color:'#475569',fontSize:'11px'})}>News werden geladen...</div>
                    ) : liveNews.length > 0 ? liveNews.map((n, i) => (
                      <div key={i} className="ni" onClick={() => n.url && window.open(n.url,'_blank')}>
                        <div style={s({display:'flex',alignItems:'center',gap:'5px',marginBottom:'3px'})}>
                          <span style={s({fontSize:'9px',color:'#475569',background:'#191d22',padding:'1px 5px',borderRadius:'3px'})}>{n.source}</span>
                          {n.datetime && <span style={s({fontSize:'9px',color:'#475569'})}>{n.datetime}</span>}
                        </div>
                        <div className="ni-head">{n.headline}</div>
                        {n.summary && <div className="ni-body">{n.summary.slice(0,120)}...</div>}
                      </div>
                    )) : (
                      <div style={s({color:'#475569',fontSize:'11px'})}>Keine News gefunden.</div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab==='screener' && (
          <div style={s({background:'#13161a',border:'1px solid #1e2530',borderRadius:'12px',overflow:'hidden'})}>
            <div style={s({padding:'13px 16px',borderBottom:'1px solid #1e2530',display:'flex',justifyContent:'space-between',alignItems:'center'})}>
              <span style={s({fontSize:'12px',fontWeight:600})}>Aktien Screener</span>
              <span style={s({fontSize:'10px',color:'#475569'})}>Klicken um zur Watchlist hinzuzufügen</span>
            </div>
            <table className="tbl">
              <thead><tr><th>Symbol</th><th>Name</th><th>Sektor</th><th>Signal</th></tr></thead>
              <tbody>
                {stocks.map(st => {
                  const pc = st.sig==='buy'?'rgba(110,231,183,0.08)':st.sig==='sell'?'rgba(248,113,113,0.07)':'rgba(251,191,36,0.07)'
                  const tc = st.sig==='buy'?'#6ee7b7':st.sig==='sell'?'#f87171':'#fbbf24'
                  return (
                    <tr key={st.sym} className="cl" onClick={() => {
                      if (!watchlist.includes(st.sym)) setWatchlist(prev => [...prev, st.sym])
                      setActiveTab('home')
                      selectStock(st.sym)
                    }}>
                      <td><span style={s({color:'#6ee7b7',fontWeight:700})}>{st.sym}</span></td>
                      <td style={s({color:'#94a3b8'})}>{st.name}</td>
                      <td><span style={s({fontSize:'9px',color:'#475569',background:'#191d22',border:'1px solid #242c38',padding:'1px 5px',borderRadius:'3px'})}>{st.sector||'—'}</span></td>
                      <td><span className="pill" style={s({background:pc,color:tc,border:`1px solid ${tc}33`})}>{st.sig==='buy'?'Kaufen':st.sig==='sell'?'Verkaufen':'Halten'}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab==='insider' && (
          <div style={s({background:'#13161a',border:'1px solid #1e2530',borderRadius:'12px',overflow:'hidden'})}>
            <div style={s({padding:'13px 16px',borderBottom:'1px solid #1e2530'})}><span style={s({fontSize:'12px',fontWeight:600})}>Insider Tracker</span></div>
            <table className="tbl">
              <thead><tr><th>Datum</th><th>Unternehmen</th><th>Insider</th><th>Rolle</th><th>Typ</th><th>Wert</th></tr></thead>
              <tbody>
                {[
                  {date:'2025-01-14',co:'Apple',sym:'AAPL',who:'Tim Cook',role:'CEO',type:'buy',val:'$12.4M'},
                  {date:'2025-01-12',co:'NVIDIA',sym:'NVDA',who:'Jensen Huang',role:'CEO',type:'buy',val:'$8.7M'},
                  {date:'2025-01-11',co:'SAP SE',sym:'SAP',who:'C. Klein',role:'CEO',type:'buy',val:'€2.1M'},
                  {date:'2025-01-10',co:'Tesla',sym:'TSLA',who:'Elon Musk',role:'CEO',type:'sell',val:'$250M'},
                  {date:'2025-01-09',co:'Microsoft',sym:'MSFT',who:'S. Nadella',role:'CEO',type:'sell',val:'$36.2M'},
                ].map((r,i) => (
                  <tr key={i} className="cl">
                    <td style={s({color:'#475569',fontSize:'11px'})}>{r.date}</td>
                    <td><span style={s({color:'#6ee7b7',fontWeight:700})}>{r.sym}</span> <span style={s({color:'#94a3b8'})}>{r.co}</span></td>
                    <td>{r.who}</td>
                    <td><span style={s({fontSize:'9px',color:'#475569',background:'#191d22',border:'1px solid #242c38',padding:'1px 5px',borderRadius:'3px'})}>{r.role}</span></td>
                    <td><span className="pill" style={s({background:r.type==='buy'?'rgba(110,231,183,0.08)':'rgba(248,113,113,0.07)',color:r.type==='buy'?'#6ee7b7':'#f87171',border:r.type==='buy'?'1px solid rgba(110,231,183,0.15)':'1px solid rgba(248,113,113,0.12)'})}>{r.type==='buy'?'KAUF':'VERKAUF'}</span></td>
                    <td style={s({color:r.type==='buy'?'#6ee7b7':'#f87171',fontWeight:600})}>{r.val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab==='hedgefund' && (
          <div style={s({background:'#13161a',border:'1px solid #1e2530',borderRadius:'12px',overflow:'hidden'})}>
            <div style={s({padding:'13px 16px',borderBottom:'1px solid #1e2530'})}><span style={s({fontSize:'12px',fontWeight:600})}>Hedge Fund Tracker · 13F Meldungen</span></div>
            <table className="tbl">
              <thead><tr><th>Fonds</th><th>Aktie</th><th>Wert</th><th>Veränd.</th><th>Quartal</th></tr></thead>
              <tbody>
                {[
                  {fund:'Bridgewater',sym:'NVDA',val:'$2.4B',chg:'+340%',q:'Q4 2024'},
                  {fund:'AQR Capital',sym:'MSFT',val:'$1.8B',chg:'+120%',q:'Q4 2024'},
                  {fund:'Citadel',sym:'AAPL',val:'$3.1B',chg:'+85%',q:'Q4 2024'},
                  {fund:'Two Sigma',sym:'SAP',val:'€940M',chg:'Neu',q:'Q4 2024'},
                  {fund:'Renaissance',sym:'AMZN',val:'$2.2B',chg:'+210%',q:'Q4 2024'},
                  {fund:'D.E. Shaw',sym:'GOOGL',val:'$1.4B',chg:'+67%',q:'Q4 2024'},
                  {fund:'Tiger Global',sym:'META',val:'$2.8B',chg:'+180%',q:'Q4 2024'},
                ].map((r,i) => (
                  <tr key={i} className="cl">
                    <td style={s({color:'#6ee7b7',fontWeight:600})}>{r.fund}</td>
                    <td><span style={s({color:'#6ee7b7',fontWeight:700})}>{r.sym}</span></td>
                    <td>{r.val}</td>
                    <td style={s({color:r.chg.startsWith('-')?'#f87171':'#6ee7b7'})}>{r.chg}</td>
                    <td style={s({color:'#475569'})}>{r.q}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab==='dcf' && <DCFCalculator />}

      </div>
    </div>
  )
}

function DCFCalculator() {
  const [vals, setVals] = useState({rev:50000,g1:12,g2:7,fcf:22,wacc:9,tgr:2.5,debt:5000,shr:15400,cp:213})
  const set = (k: string, v: number) => setVals(prev => ({...prev,[k]:v}))
  const s = (x: any) => x
  const calc = () => {
    let pv = 0, rev = vals.rev * 1e6
    for (let y = 1; y <= 10; y++) {
      rev *= (1+(y<=5?vals.g1:vals.g2)/100)
      pv += rev*(vals.fcf/100)/Math.pow(1+vals.wacc/100,y)
    }
    const tv=(rev*(vals.fcf/100)*(1+vals.tgr/100))/(vals.wacc/100-vals.tgr/100)
    const pvTv=tv/Math.pow(1+vals.wacc/100,10)
    const ev=pv+pvTv-vals.debt*1e6
    const fv=ev/(vals.shr*1e6)
    const up=(fv-vals.cp)/vals.cp*100
    const fmt=(v:number)=>v>=1e9?'$'+(v/1e9).toFixed(1)+'B':'$'+(v/1e6).toFixed(1)+'M'
    return {fv,up,pv,pvTv,ev,fmt}
  }
  const {fv,up,pv,pvTv,ev,fmt}=calc()
  const params=[
    {id:'rev',label:'Umsatz Y1 (M$)',min:100,max:500000,step:100},
    {id:'g1',label:'Wachstum Y1-5 (%)',min:0,max:50,step:0.5},
    {id:'g2',label:'Wachstum Y6-10 (%)',min:0,max:30,step:0.5},
    {id:'fcf',label:'FCF Marge (%)',min:0,max:50,step:0.5},
    {id:'wacc',label:'WACC (%)',min:4,max:20,step:0.1},
    {id:'tgr',label:'Terminal Growth (%)',min:0,max:5,step:0.1},
    {id:'debt',label:'Nettoverschuldung (M$)',min:-50000,max:200000,step:500},
    {id:'shr',label:'Aktien (M)',min:10,max:50000,step:10},
    {id:'cp',label:'Aktueller Kurs ($)',min:1,max:2000,step:1},
  ]
  return (
    <div style={s({display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'})}>
      <div style={s({background:'#13161a',border:'1px solid #1e2530',borderRadius:'12px',padding:'18px'})}>
        <div style={s({fontSize:'12px',fontWeight:600,marginBottom:'14px'})}>Eingabewerte</div>
        {params.map(p=>(
          <div key={p.id} style={s({marginBottom:'13px'})}>
            <div style={s({display:'flex',justifyContent:'space-between',marginBottom:'5px'})}>
              <span style={s({fontSize:'11px',color:'#94a3b8'})}>{p.label}</span>
              <span style={s({fontSize:'11px',fontWeight:600,color:'#6ee7b7'})}>{(vals as any)[p.id]}</span>
            </div>
            <input type="range" min={p.min} max={p.max} step={p.step} value={(vals as any)[p.id]} onChange={e=>set(p.id,+e.target.value)} />
          </div>
        ))}
      </div>
      <div style={s({background:'#13161a',border:'1px solid #1e2530',borderRadius:'12px',padding:'18px'})}>
        <div style={s({fontSize:'12px',fontWeight:600,marginBottom:'4px'})}>Ergebnis</div>
        <div style={s({textAlign:'center' as const,padding:'16px 0'})}>
          <div style={s({fontSize:'9px',color:'#475569',letterSpacing:'1px',textTransform:'uppercase' as const,marginBottom:'5px'})}>Fairer Wert</div>
          <div style={s({fontSize:'38px',fontWeight:700,color:fv>vals.cp?'#6ee7b7':'#f87171'})}>${fv.toFixed(2)}</div>
          <div style={s({fontSize:'11px',color:up>=0?'#6ee7b7':'#f87171',marginTop:'5px',marginBottom:'14px'})}>{up>=0?'▲':'▼'} {Math.abs(up).toFixed(1)}% {up>=0?'unterbewertet':'überbewertet'}</div>
        </div>
        <div style={s({background:'#191d22',borderRadius:'8px',padding:'12px 13px'})}>
          {[['Aktueller Kurs','$'+vals.cp],['Upside/Downside',(up>=0?'+':'')+up.toFixed(1)+'%'],['FCF PV (10J)',fmt(pv)],['Terminal Value PV',fmt(pvTv)],['Enterprise Value',fmt(ev)]].map(([l,v])=>(
            <div key={l} style={s({display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom:'1px solid #1e2530',fontSize:'11px',color:'#94a3b8'})}>
              <span>{l}</span><span style={s({color:'#e2e8f0'})}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}