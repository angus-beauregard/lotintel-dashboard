export default function Nav({ lang, setLang, activeTab, setActiveTab }) {
  const tabs = [
    { id: 'overview', en: 'Overview', fr: 'Aperçu' },
    { id: 'intelligence', en: 'Intelligence', fr: 'Intelligence' },
    { id: 'sessions', en: 'Sessions', fr: 'Sessions' },
  ]
  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', height: 56, background: 'var(--bg)',
      borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect width="20" height="20" rx="5" fill="var(--green)"/>
            <circle cx="10" cy="10" r="3.5" fill="white"/>
            <circle cx="10" cy="10" r="1.5" fill="var(--green)"/>
          </svg>
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.3px', color: 'var(--text)' }}>Lotintel</span>
        </div>
        <div className="tab-bar">
          {tabs.map(t => (
            <button key={t.id} className={`tab${activeTab === t.id ? ' active' : ''}`}
              onClick={() => setActiveTab(t.id)}>
              {lang === 'fr' ? t.fr : t.en}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
          {lang === 'fr' ? 'Intelligence véhicule — Québec' : 'Vehicle intelligence — Québec'}
        </span>
        <div style={{ display: 'flex', gap: 2, padding: '2px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
          {['en', 'fr'].map(l => (
            <button key={l} onClick={() => setLang(l)} style={{
              padding: '3px 9px', fontSize: 11, borderRadius: 'var(--r-sm)',
              background: lang === l ? 'var(--bg)' : 'transparent',
              color: lang === l ? 'var(--text)' : 'var(--text-3)',
              border: lang === l ? '1px solid var(--border)' : '1px solid transparent',
              fontWeight: lang === l ? 500 : 400,
              boxShadow: lang === l ? 'var(--shadow)' : 'none',
            }}>{l.toUpperCase()}</button>
          ))}
        </div>
      </div>
    </nav>
  )
}
