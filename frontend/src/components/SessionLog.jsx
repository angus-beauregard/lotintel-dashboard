export default function SessionLog({ sessions, selectedSession, onSelect, lang, formatLabel }) {
  const t = {
    en: { title: 'Sessions', vehicles: 'vehicles', plates: 'plates', nodata: 'No sessions found.' },
    fr: { title: 'Sessions', vehicles: 'véhicules', plates: 'plaques', nodata: 'Aucune session trouvée.' },
  }[lang]

  return (
    <div className="card">
      <div className="section-title">{t.title}</div>
      {sessions.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', padding: '8px 0' }}>{t.nodata}</p>
      ) : sessions.map((s, i) => (
        <div key={s.session_id || i}>
          <div
            onClick={() => onSelect(s.session_slug)}
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '8px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
              background: selectedSession === s.session_slug ? 'var(--bg-secondary)' : 'transparent',
              transition: 'background 0.1s',
            }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%', marginTop: 5, flexShrink: 0,
              background: selectedSession === s.session_slug ? 'var(--green)' : 'var(--bg-tertiary)',
              border: `1.5px solid ${selectedSession === s.session_slug ? 'var(--green)' : 'var(--border-strong)'}`,
              transition: 'all 0.15s',
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', fontFamily: 'var(--mono)' }}>
                {formatLabel ? formatLabel(s.session_slug) : s.session_slug}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                {[
                  s.total_vehicles != null && `${s.total_vehicles} ${t.vehicles}`,
                  s.plates_found != null && `${s.plates_found} ${t.plates}`,
                ].filter(Boolean).join(' · ')}
              </div>
            </div>
          </div>
          {i < sessions.length - 1 && <hr className="divider" />}
        </div>
      ))}
    </div>
  )
}
