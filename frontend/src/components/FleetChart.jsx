import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = { Sedan: '#378ADD', SUV: '#1D9E75', Van: '#EF9F27', Bus: '#EF9F27', Unknown: '#B4B2A9' }

export default function FleetChart({ stats, lang }) {
  const t = {
    en: { title: 'Fleet composition', sedan: 'Sedan', suv: 'SUV', vanbus: 'Van/Bus', unknown: 'Unknown' },
    fr: { title: 'Composition du parc', sedan: 'Berline', suv: 'VUS', vanbus: 'Fourgon/Bus', unknown: 'Inconnu' },
  }[lang]

  const data = [
    { name: t.sedan,  value: stats.sedan_count || 0, color: '#378ADD' },
    { name: t.suv,    value: stats.suv_count   || 0, color: '#1D9E75' },
    { name: t.vanbus, value: (stats.van_count  || 0) + (stats.bus_count || 0), color: '#EF9F27' },
    { name: t.unknown,value: (stats.total || 0) - (stats.sedan_count || 0) - (stats.suv_count || 0) - (stats.van_count || 0) - (stats.bus_count || 0), color: '#B4B2A9' },
  ].filter(d => d.value > 0)

  return (
    <div className="card">
      <div className="section-title">{t.title}</div>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
            dataKey="value" paddingAngle={2}>
            {data.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
          </Pie>
          <Tooltip formatter={(v, n) => [v, n]} contentStyle={{
            background: 'var(--bg)', border: '0.5px solid var(--border)',
            borderRadius: 8, fontSize: 12,
          }} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
        {data.map((d, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: d.color, display: 'inline-block' }} />
            {d.name} {d.value}
          </span>
        ))}
      </div>
    </div>
  )
}
