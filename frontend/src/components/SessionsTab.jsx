import { useState } from 'react'

function formatSlug(slug) {
  const parts = slug.split('_')
  const d = parts.find(p => /^\d{8}$/.test(p))
  const t = parts.find(p => /^\d{6}$/.test(p))
  if (d && t) return `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}  ${t.slice(0,2)}:${t.slice(2,4)}`
  return slug
}

function QualityBar({ value }) {
  const pct = Math.min(100, Math.round((value || 0) * 100))
  const color = pct >= 80 ? 'var(--green)' : pct >= 60 ? 'var(--amber)' : 'var(--red)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: 'var(--bg-3)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--mono)', minWidth: 28 }}>{pct}%</span>
    </div>
  )
}

export default function SessionsTab({ locations, allSessionData, onSelectSession, lang }) {
  const [selectedLoc, setSelectedLoc] = useState(locations[0]?.slug || null)
  const [compareMode, setCompareMode] = useState(false)
  const [compareA, setCompareA] = useState(null)
  const [compareB, setCompareB] = useState(null)

  const t = lang === 'fr' ? {
    vehicles: 'véhicules', plates: 'plaques', commercial: 'commerciaux',
    nodata: 'Aucune session.', view: 'Détails', compare: 'Comparer',
    comparing: 'Mode comparaison', cancelCompare: 'Annuler',
    selectTwo: 'Sélectionnez 2 sessions à comparer', quality: 'Qualité',
    plateRate: 'Taux plaque', commRate: '% comm.',
  } : {
    vehicles: 'vehicles', plates: 'plates', commercial: 'commercial',
    nodata: 'No sessions found.', view: 'View session', compare: 'Compare sessions',
    comparing: 'Compare mode', cancelCompare: 'Cancel',
    selectTwo: 'Select 2 sessions to compare', quality: 'Quality',
    plateRate: 'Plate rate', commRate: 'Comm. %',
  }

  const locSessions = allSessionData
    .filter(d => d.locationSlug === selectedLoc)
    .sort((a, b) => new Date(b.session?.started_at) - new Date(a.session?.started_at))

  function toggleCompare(slug) {
    if (compareA === slug) { setCompareA(compareB); setCompareB(null); return }
    if (compareB === slug) { setCompareB(null); return }
    if (!compareA) { setCompareA(slug); return }
    if (!compareB) { setCompareB(slug); return }
  }

  const sessA = locSessions.find(d => d.sessionSlug === compareA)
  const sessB = locSessions.find(d => d.sessionSlug === compareB)

  function Diff({ a, b, suffix }) {
    if (a == null || b == null) return <span style={{ color: 'var(--text-3)' }}>—</span>
    const diff = b - a
    const color = diff > 0 ? 'var(--green)' : diff < 0 ? 'var(--red)' : 'var(--text-3)'
    return <span style={{ color, fontWeight: 600 }}>{diff > 0 ? '+' : ''}{diff}{suffix || ''}</span>
  }

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {locations.map(l => (
            <button key={l.slug}
              style={{
                padding: '6px 14px', fontSize: 13,
                background: selectedLoc === l.slug ? 'var(--text)' : 'var(--bg)',
                color: selectedLoc === l.slug ? 'var(--bg)' : 'var(--text-2)',
                border: `1px solid ${selectedLoc === l.slug ? 'var(--text)' : 'var(--border-2)'}`,
                fontWeight: selectedLoc === l.slug ? 600 : 400,
              }}
              onClick={() => { setSelectedLoc(l.slug); setCompareMode(false); setCompareA(null); setCompareB(null) }}>
              {l.slug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>
        <button onClick={() => { setCompareMode(!compareMode); setCompareA(null); setCompareB(null) }}
          style={{ fontSize: 12, color: compareMode ? 'var(--red)' : 'var(--text-2)' }}>
          {compareMode ? t.cancelCompare : t.compare}
        </button>
      </div>

      {compareMode && compareA && compareB && sessA && sessB && (
        <div className="card" style={{ padding: '20px 24px', marginBottom: 16, borderLeft: '3px solid var(--blue)' }}>
          <div className="lbl" style={{ marginBottom: 16 }}>Session comparison</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {[
              { label: lang === 'fr' ? 'Véhicules' : 'Vehicles', a: sessA.stats?.total, b: sessB.stats?.total },
              { label: lang === 'fr' ? 'Plaques' : 'Plates', a: sessA.stats?.plates_found, b: sessB.stats?.plates_found },
              { label: lang === 'fr' ? 'Commerciaux' : 'Commercial', a: sessA.stats?.commercial_count, b: sessB.stats?.commercial_count },
            ].map(row => (
              <div key={row.label} style={{ textAlign: 'center' }}>
                <div className="lbl" style={{ marginBottom: 8 }}>{row.label}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontSize: 20, fontWeight: 600 }}>
                  <span style={{ color: 'var(--text-3)' }}>{row.a}</span>
                  <span style={{ fontSize: 14, color: 'var(--text-3)' }}>→</span>
                  <span>{row.b}</span>
                  <span style={{ fontSize: 13 }}><Diff a={row.a} b={row.b} /></span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <div className="lbl" style={{ marginBottom: 8 }}>Brand changes</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(() => {
                const brandsA = new Set((sessA.brands || []).map(b => b.business_name))
                const brandsB = new Set((sessB.brands || []).map(b => b.business_name))
                const gained = [...brandsB].filter(b => !brandsA.has(b))
                const lost = [...brandsA].filter(b => !brandsB.has(b))
                const kept = [...brandsA].filter(b => brandsB.has(b))
                return [
                  ...gained.map(b => <span key={b} className="badge badge-green">+ {b}</span>),
                  ...lost.map(b => <span key={b} style={{ background: 'var(--red-bg)', color: 'var(--red-text)', fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: '100px' }}>− {b}</span>),
                  ...kept.map(b => <span key={b} className="badge" style={{ background: 'var(--bg-2)', color: 'var(--text-3)' }}>{b}</span>),
                ]
              })()}
            </div>
          </div>
        </div>
      )}

      {compareMode && !(compareA && compareB) && (
        <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 12, padding: '8px 12px', background: 'var(--amber-bg)', borderRadius: 'var(--r-md)', border: '1px solid var(--amber-bg)' }}>
          {t.selectTwo} ({[compareA, compareB].filter(Boolean).length}/2 selected)
        </div>
      )}

      {locSessions.length === 0
        ? <p style={{ color: 'var(--text-3)', fontSize: 13 }}>{t.nodata}</p>
        : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {locSessions.map((d, i) => {
              const s = d.session || {}
              const stats = d.stats || {}
              const plateRate = stats.total > 0 ? Math.round((stats.plates_found || 0) / stats.total * 100) : 0
              const commRate = stats.total > 0 ? Math.round((stats.commercial_count || 0) / stats.total * 100) : 0
              const isSelected = compareA === d.sessionSlug || compareB === d.sessionSlug
              return (
                <div key={i} className="card" style={{
                  padding: '16px 20px',
                  border: isSelected ? '2px solid var(--blue)' : '1px solid var(--border)',
                  cursor: compareMode ? 'pointer' : 'default',
                  transition: 'border-color 0.1s',
                }}
                  onClick={() => compareMode && toggleCompare(d.sessionSlug)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {compareMode && (
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%', border: `2px solid ${isSelected ? 'var(--blue)' : 'var(--border-2)'}`,
                        background: isSelected ? 'var(--blue)' : 'transparent', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {isSelected && <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>✓</span>}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--mono)', color: 'var(--text)' }}>{formatSlug(s.session_slug || '')}</span>
                        {(d.brands || []).slice(0, 4).map(b => <span key={b.business_name} className="badge badge-blue">{b.business_name}</span>)}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 3 }}>{lang === 'fr' ? 'Véhicules' : 'Vehicles'}</div>
                          <div style={{ fontSize: 18, fontWeight: 600 }}>{stats.total || 0}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 3 }}>{t.plateRate}</div>
                          <div style={{ fontSize: 18, fontWeight: 600 }}>{plateRate}%</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 3 }}>{t.commRate}</div>
                          <div style={{ fontSize: 18, fontWeight: 600, color: commRate > 10 ? 'var(--blue)' : 'var(--text)' }}>{commRate}%</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 3 }}>{t.quality}</div>
                          <QualityBar value={stats.avg_quality} />
                        </div>
                      </div>
                    </div>
                    {!compareMode && (
                      <button onClick={() => onSelectSession(d.locationSlug, s.session_slug)}
                        style={{ flexShrink: 0, fontSize: 12, whiteSpace: 'nowrap' }}>
                        {t.view} →
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
    </div>
  )
}
