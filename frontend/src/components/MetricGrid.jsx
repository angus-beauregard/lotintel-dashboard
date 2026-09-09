export default function MetricGrid({ stats, brands, lang }) {
  const t = {
    en: { vehicles: 'Total vehicles', plates: 'Plates read', commercial: 'Commercial', brands: 'Brands matched', sessions: 'session', rate: 'read rate', detected: 'of detected' },
    fr: { vehicles: 'Véhicules total', plates: 'Plaques lues', commercial: 'Commerciaux', brands: 'Marques identifiées', sessions: 'session', rate: 'taux de lecture', detected: 'des détectés' },
  }[lang]

  const total = stats.total || 0
  const plates = stats.plates_found || 0
  const comm = stats.commercial_count || 0
  const brandCount = brands?.length || 0
  const plateRate = total > 0 ? Math.round((plates / total) * 100) : 0
  const commRate = total > 0 ? Math.round((comm / total) * 100) : 0

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: '1.5rem' }}>
      <div className="metric">
        <div className="metric-label">{t.vehicles}</div>
        <div className="metric-value">{total}</div>
        <div className="metric-sub">1 {t.sessions}</div>
      </div>
      <div className="metric">
        <div className="metric-label">{t.plates}</div>
        <div className="metric-value">{plates}</div>
        <div className="metric-sub">{plateRate}% {t.rate}</div>
      </div>
      <div className="metric">
        <div className="metric-label">{t.commercial}</div>
        <div className="metric-value">{comm}</div>
        <div className="metric-sub">{commRate}% {t.detected}</div>
      </div>
      <div className="metric">
        <div className="metric-label">{t.brands}</div>
        <div className="metric-value">{brandCount}</div>
        <div className="metric-sub">{brands?.map(b => b.business_name).join(' · ') || '—'}</div>
      </div>
    </div>
  )
}
