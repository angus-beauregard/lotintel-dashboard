import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

function formatSlug(slug) {
  const parts = slug.split('_')
  const d = parts.find(p => /^\d{8}$/.test(p))
  const t = parts.find(p => /^\d{6}$/.test(p))
  if (d && t) return `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}  ${t.slice(0,2)}:${t.slice(2,4)}`
  return slug
}

function StatCard({ label, value, sub }) {
  return (
    <div className="card" style={{ padding: '16px 20px' }}>
      <div className="lbl" style={{ marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.5px' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

export default function SessionDetail({ summary, detections, locationSlug, onBack, lang }) {
  const t = lang === 'fr' ? {
    back: '← Retour', commercial: 'Véhicules commerciaux',
    all: 'Toutes les détections', id: 'ID', type: 'Type', plate: 'Plaque',
    make: 'Marque/modèle', colour: 'Couleur', score: 'Score',
    export: 'Exporter CSV', nocomm: 'Aucun véhicule commercial.', nodet: 'Aucune détection.',
    vehicles: 'Véhicules', plates: 'Plaques', comm: 'Commerciaux', quality: 'Qualité moy.',
  } : {
    back: '← Back', commercial: 'Commercial vehicles',
    all: 'All detections', id: 'ID', type: 'Type', plate: 'Plate',
    make: 'Make/model', colour: 'Colour', score: 'Score',
    export: 'Export CSV', nocomm: 'No commercial vehicles detected.', nodet: 'No detections.',
    vehicles: 'Vehicles', plates: 'Plates', comm: 'Commercial', quality: 'Avg quality',
  }

  const s = summary?.session || {}
  const stats = summary?.stats || {}
  const commercial = detections.filter(d => d.is_commercial)
  const plateRate = stats.total > 0 ? Math.round((stats.plates_found || 0) / stats.total * 100) : 0
  const commRate = stats.total > 0 ? Math.round((stats.commercial_count || 0) / stats.total * 100) : 0

  const pieData = [
    { name: 'Sedan', value: stats.sedan_count || 0, color: '#2b7fd4' },
    { name: 'SUV', value: stats.suv_count || 0, color: '#16a37a' },
    { name: 'Van/Bus', value: stats.van_count || 0, color: '#d97706' },
    { name: 'Unknown', value: Math.max(0, (stats.total || 0) - (stats.sedan_count || 0) - (stats.suv_count || 0) - (stats.van_count || 0)), color: '#cbd5e1' },
  ].filter(d => d.value > 0)

  function exportCSV() {
    const headers = ['id', 'crop', 'type', 'plate_region', 'make', 'model', 'colour', 'is_commercial', 'business_name', 'business_url', 'quality_score']
    const rows = detections.map(d => [
      d.detection_id, d.crop_filename, d.vehicle_type || '', d.plate_region || '',
      d.make || '', d.model || '', d.colour || '', d.is_commercial,
      d.business_name || '', d.business_url || '', d.quality_score?.toFixed(3) || ''
    ].join(','))
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n')
    const a = document.createElement('a')
    a.href = encodeURI(csv)
    a.download = `lotintel_${s.session_slug || 'session'}.csv`
    a.click()
  }

  const COLOUR_DOTS = { White: '#f1f0ee', Black: '#2a2928', Silver: '#b0b0b0', Grey: '#888', Blue: '#2b7fd4', Red: '#dc2626', Green: '#16a37a', Brown: '#8B6347' }

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <button onClick={onBack} style={{ marginBottom: 10, fontSize: 12 }}>{t.back}</button>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--mono)', letterSpacing: '-0.5px' }}>{formatSlug(s.session_slug || '')}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>{locationSlug?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</div>
        </div>
        <button className="primary" onClick={exportCSV} style={{ fontSize: 13 }}>↓ {t.export}</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
        <StatCard label={t.vehicles} value={stats.total || 0} />
        <StatCard label={t.plates} value={`${stats.plates_found || 0}`} sub={`${plateRate}% detection rate`} />
        <StatCard label={t.comm} value={`${stats.commercial_count || 0}`} sub={`${commRate}% of fleet`} />
        <StatCard label={t.quality} value={(stats.avg_quality || 0).toFixed(2)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ padding: '20px 20px' }}>
          <div className="lbl" style={{ marginBottom: 12 }}>Fleet</div>
          <div style={{ height: 120, marginBottom: 12 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={52} dataKey="value" paddingAngle={2} strokeWidth={0}>
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          {pieData.map(d => (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginBottom: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
              <span style={{ flex: 1, color: 'var(--text-2)' }}>{d.name}</span>
              <span style={{ fontWeight: 600, color: 'var(--text)' }}>{d.value}</span>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: '20px 24px' }}>
          <div className="lbl" style={{ marginBottom: 14 }}>{t.commercial}</div>
          {commercial.length === 0
            ? <p style={{ fontSize: 13, color: 'var(--text-3)' }}>{t.nocomm}</p>
            : commercial.map((d, i) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: i < commercial.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-3)', minWidth: 72 }}>{d.crop_filename?.replace('.jpg', '')}</span>
                  <span style={{ fontWeight: 600, fontSize: 13, flex: 1 }}>{d.business_name || 'Unidentified'}</span>
                  <span className="badge badge-green">commercial</span>
                  {d.business_url && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{d.business_url}</span>}
                  <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>{d.quality_score?.toFixed(2)}</span>
                </div>
                {d.ocr_raw && (
                  <div style={{ paddingLeft: 80, fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text-3)', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {d.ocr_raw.split(' | ').slice(0, 6).join(' · ')}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div className="lbl">{t.all} ({detections.length})</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {[t.id, t.type, t.plate, t.make, t.colour, t.score].map(h => (
                  <th key={h} style={{ padding: '0 10px 10px', textAlign: 'left', color: 'var(--text-3)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.04em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {detections.map((d, i) => (
                <tr key={i} style={{ borderBottom: i < detections.length - 1 ? '1px solid var(--border)' : 'none', background: i % 2 === 1 ? 'var(--bg-2)' : 'transparent' }}>
                  <td style={{ padding: '8px 10px', fontFamily: 'var(--mono)', color: 'var(--text-3)', fontSize: 11 }}>{d.crop_filename?.replace('.jpg', '')}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--text-2)' }}>{d.vehicle_type || '—'}</td>
                  <td style={{ padding: '8px 10px' }}>{d.plate_region ? <span className="badge badge-green">{d.plate_region}</span> : <span style={{ color: 'var(--text-3)' }}>—</span>}</td>
                  <td style={{ padding: '8px 10px', color: 'var(--text-2)', maxWidth: 150, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{[d.make, d.model].filter(Boolean).join(' ') || '—'}</td>
                  <td style={{ padding: '8px 10px' }}>
                    {d.colour ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 9, height: 9, borderRadius: '50%', background: COLOUR_DOTS?.[d.colour] || '#ccc', border: '1px solid var(--border-2)', display: 'inline-block', flexShrink: 0 }} />
                        <span style={{ color: 'var(--text-2)' }}>{d.colour}</span>
                      </span>
                    ) : <span style={{ color: 'var(--text-3)' }}>—</span>}
                  </td>
                  <td style={{ padding: '8px 10px', color: 'var(--text-3)', fontFamily: 'var(--mono)', fontSize: 11 }}>{d.quality_score?.toFixed(2) || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
