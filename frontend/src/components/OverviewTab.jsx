import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12, boxShadow: 'var(--shadow)' }}>
      <div style={{ color: 'var(--text-2)', marginBottom: 4, fontWeight: 500 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, display: 'inline-block' }} />
          {p.name}: <strong>{typeof p.value === 'number' ? Math.round(p.value) : p.value}{p.name === 'Commercial %' ? '%' : ''}</strong>
        </div>
      ))}
    </div>
  )
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <div className="lbl" style={{ marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-1px', color: accent || 'var(--text)', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>{sub}</div>}
    </div>
  )
}

export default function OverviewTab({ allData, lang }) {
  const t = lang === 'fr' ? {
    vehicles: 'Véhicules recensés', vehiclesSub: 'toutes sessions confondues',
    plateRate: 'Taux de détection plaque', commercial: 'Véhicules commerciaux',
    locations: 'Emplacements actifs', trend: 'Véhicules par session',
    commTrend: '% commercial par session', topBrands: 'Marques les plus fréquentes',
    occurrences: 'occurrences', nodata: 'Aucune donnée disponible.',
  } : {
    vehicles: 'Total vehicles surveyed', vehiclesSub: 'all sessions combined',
    plateRate: 'Plate detection rate', commercial: 'Commercial vehicles',
    locations: 'Active locations', trend: 'Vehicles per session',
    commTrend: 'Commercial % per session', topBrands: 'Most frequent brands',
    occurrences: 'occurrences', nodata: 'No data available.',
  }

  if (!allData || allData.length === 0) return <p style={{ color: 'var(--text-3)', fontSize: 13, padding: '2rem 0' }}>{t.nodata}</p>

  const totalVehicles = allData.reduce((s, d) => s + (d.stats?.total || 0), 0)
  const totalPlates = allData.reduce((s, d) => s + (d.stats?.plates_found || 0), 0)
  const totalComm = allData.reduce((s, d) => s + (d.stats?.commercial_count || 0), 0)
  const plateRate = totalVehicles > 0 ? Math.round(totalPlates / totalVehicles * 100) : 0
  const commRate = totalVehicles > 0 ? Math.round(totalComm / totalVehicles * 100) : 0
  const locationCount = new Set(allData.map(d => d.locationSlug)).size

  const brandMap = {}
  allData.forEach(d => {
    (d.brands || []).forEach(b => {
      if (!b.business_name) return
      brandMap[b.business_name] = (brandMap[b.business_name] || 0) + b.count
    })
  })
  const topBrands = Object.entries(brandMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }))
  const maxBrand = topBrands[0]?.count || 1

  const sessionTrend = [...allData]
    .sort((a, b) => new Date(a.session?.started_at) - new Date(b.session?.started_at))
    .slice(-14)
    .map(d => ({
      date: d.session?.started_at?.slice(5, 10) || '',
      vehicles: d.stats?.total || 0,
      commercial: d.stats?.total > 0 ? Math.round((d.stats?.commercial_count || 0) / d.stats.total * 100) : 0,
    }))

  const axisStyle = { fontSize: 11, fill: 'var(--text-3)' }

  return (
    <div className="fade-up">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label={t.vehicles} value={totalVehicles.toLocaleString()} sub={t.vehiclesSub} />
        <StatCard label={t.plateRate} value={`${plateRate}%`} sub={`${totalPlates.toLocaleString()} plates read`} accent="var(--green)" />
        <StatCard label={t.commercial} value={`${commRate}%`} sub={`${totalComm} business fleet vehicles`} accent="var(--blue)" />
        <StatCard label={t.locations} value={locationCount} sub={`${allData.length} sessions total`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 20 }}>
        <div className="card" style={{ padding: '20px 24px' }}>
          <div className="lbl" style={{ marginBottom: 16 }}>{t.trend}</div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sessionTrend} margin={{ top: 4, right: 8, bottom: 0, left: -24 }} barSize={18}>
                <CartesianGrid strokeDasharray="2 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tick={axisStyle} tickLine={false} axisLine={false} />
                <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTip />} cursor={{ fill: 'var(--bg-2)' }} />
                <Bar dataKey="vehicles" fill="var(--green)" radius={[3, 3, 0, 0]} name={lang === 'fr' ? 'Véhicules' : 'Vehicles'} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card" style={{ padding: '20px 24px' }}>
          <div className="lbl" style={{ marginBottom: 16 }}>{t.commTrend}</div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sessionTrend} margin={{ top: 4, right: 8, bottom: 0, left: -24 }}>
                <CartesianGrid strokeDasharray="2 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tick={axisStyle} tickLine={false} axisLine={false} />
                <YAxis tick={axisStyle} tickLine={false} axisLine={false} unit="%" />
                <Tooltip content={<ChartTip />} />
                <Line type="monotone" dataKey="commercial" stroke="var(--blue)" strokeWidth={2} dot={{ fill: 'var(--blue)', r: 3, strokeWidth: 0 }} name="Commercial %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '20px 24px' }}>
        <div className="lbl" style={{ marginBottom: 16 }}>{t.topBrands}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {topBrands.length === 0
            ? <p style={{ fontSize: 13, color: 'var(--text-3)' }}>{t.nodata}</p>
            : topBrands.map((b, i) => (
              <div key={b.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 11, color: 'var(--text-3)', minWidth: 18, textAlign: 'right', fontFamily: 'var(--mono)', fontWeight: 600 }}>{i + 1}</span>
                <span style={{ fontSize: 13, fontWeight: 500, minWidth: 140, color: 'var(--text)' }}>{b.name}</span>
                <div style={{ flex: 1, height: 5, background: 'var(--bg-3)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 3, width: `${Math.round(b.count / maxBrand * 100)}%`, background: 'var(--blue)', transition: 'width 0.5s ease' }} />
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-3)', minWidth: 80, textAlign: 'right', fontFamily: 'var(--mono)' }}>{b.count} {t.occurrences}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
