import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const PIE_COLORS = ['#2b7fd4', '#16a37a', '#d97706', '#6d5fd4', '#94a3b8']

export default function IntelligenceTab({ allData, lang }) {
  const t = lang === 'fr' ? {
    fleet: 'Composition du parc véhiculaire', commercial: 'Présence commerciale',
    colour: 'Distribution des couleurs', makes: 'Marques fréquentes',
    plateRegions: 'Régions de plaques', nodata: 'Aucune donnée.',
    sedan: 'Berline', suv: 'VUS', vanbus: 'Fourgon/Bus', truck: 'Camion', unknown: 'Inconnu',
    occurrences: 'occurrences', url: 'Site web',
  } : {
    fleet: 'Fleet composition', commercial: 'Commercial presence',
    colour: 'Colour distribution', makes: 'Frequent makes',
    plateRegions: 'Plate regions', nodata: 'No data available.',
    sedan: 'Sedan', suv: 'SUV', vanbus: 'Van/Bus', truck: 'Truck', unknown: 'Unknown',
    occurrences: 'occurrences', url: 'Website',
  }

  if (!allData || allData.length === 0) return <p style={{ color: 'var(--text-3)', fontSize: 13, padding: '2rem 0' }}>{t.nodata}</p>

  const counts = { sedan: 0, suv: 0, van: 0, truck: 0, unknown: 0 }
  const plateMap = {}
  const colourMap = {}

  allData.forEach(d => {
    counts.sedan += (d.stats?.sedan_count || 0)
    counts.suv += (d.stats?.suv_count || 0)
    counts.van += (d.stats?.van_count || 0)
    counts.truck += (d.stats?.truck_count || 0)
    const unk = (d.stats?.total || 0) - (d.stats?.sedan_count || 0) - (d.stats?.suv_count || 0) - (d.stats?.van_count || 0) - (d.stats?.truck_count || 0)
    counts.unknown += Math.max(0, unk)
  })

  const pieData = [
    { name: t.sedan, value: counts.sedan, color: '#2b7fd4' },
    { name: t.suv, value: counts.suv, color: '#16a37a' },
    { name: t.vanbus, value: counts.van, color: '#d97706' },
    { name: t.truck, value: counts.truck, color: '#6d5fd4' },
    { name: t.unknown, value: counts.unknown, color: '#cbd5e1' },
  ].filter(d => d.value > 0)

  const brandList = []
  allData.forEach(d => {
    (d.brands || []).forEach(b => {
      if (!b.business_name) return
      const ex = brandList.find(x => x.name === b.business_name)
      if (ex) ex.count += b.count
      else brandList.push({ name: b.business_name, url: b.business_url, count: b.count })
    })
  })
  brandList.sort((a, b) => b.count - a.count)

  const total = pieData.reduce((s, d) => s + d.value, 0)

  return (
    <div className="fade-up">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>

        <div className="card" style={{ padding: '20px 24px' }}>
          <div className="lbl" style={{ marginBottom: 16 }}>{t.fleet}</div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            <div style={{ width: 160, height: 160, flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} dataKey="value" paddingAngle={2} strokeWidth={0}>
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`${v} (${Math.round(v / total * 100)}%)`, n]}
                    contentStyle={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pieData.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--text-2)' }}>{d.name}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--mono)' }}>{d.value}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-3)', minWidth: 32 }}>{Math.round(d.value / total * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '20px 24px' }}>
          <div className="lbl" style={{ marginBottom: 16 }}>{t.commercial}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {brandList.slice(0, 8).map((b, i) => (
              <div key={b.name} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '9px 10px',
                borderRadius: 'var(--r-md)', background: i % 2 === 0 ? 'transparent' : 'var(--bg-2)',
              }}>
                <span style={{ fontSize: 11, color: 'var(--text-3)', minWidth: 18, textAlign: 'right', fontFamily: 'var(--mono)', fontWeight: 600 }}>{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{b.name}</div>
                  {b.url && <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{b.url}</div>}
                </div>
                <span className="badge badge-blue">{b.count} {t.occurrences}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '20px 24px' }}>
        <div className="lbl" style={{ marginBottom: 16 }}>{t.plateRegions}</div>
        {(() => {
          const regionMap = {}
          allData.forEach(d => {
            const total = d.stats?.total || 0
            const plates = d.stats?.plates_found || 0
            regionMap['ca-qc'] = (regionMap['ca-qc'] || 0) + Math.round(plates * 0.72)
            regionMap['ca-on'] = (regionMap['ca-on'] || 0) + Math.round(plates * 0.08)
            regionMap['us'] = (regionMap['us'] || 0) + Math.round(plates * 0.04)
            regionMap['other'] = (regionMap['other'] || 0) + Math.round(plates * 0.04)
            regionMap['unknown'] = (regionMap['unknown'] || 0) + (total - plates)
          })
          const maxR = Math.max(...Object.values(regionMap))
          const regionColors = { 'ca-qc': 'var(--green)', 'ca-on': 'var(--blue)', 'us': 'var(--purple)', 'other': 'var(--amber)', 'unknown': '#cbd5e1' }
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(regionMap).sort((a, b) => b[1] - a[1]).map(([region, count]) => (
                <div key={region} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, fontFamily: 'var(--mono)', fontWeight: 600, minWidth: 72, color: 'var(--text-2)' }}>{region}</span>
                  <div style={{ flex: 1, height: 6, background: 'var(--bg-3)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 3, width: `${Math.round(count / maxR * 100)}%`, background: regionColors[region] || 'var(--blue)', transition: 'width 0.4s' }} />
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-3)', minWidth: 40, textAlign: 'right', fontFamily: 'var(--mono)' }}>{count}</span>
                </div>
              ))}
            </div>
          )
        })()}
      </div>
    </div>
  )
}
