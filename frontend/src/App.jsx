import { useState, useEffect } from 'react'
import Nav from './components/Nav'
import OverviewTab from './components/OverviewTab'
import IntelligenceTab from './components/IntelligenceTab'
import SessionsTab from './components/SessionsTab'
import SessionDetail from './components/SessionDetail'
import { api } from './api'
import './index.css'

function Spinner({ msg }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0', gap: 14 }}>
      <div style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid var(--border)', borderTopColor: 'var(--green)', animation: 'spin 0.7s linear infinite' }} />
      {msg && <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{msg}</span>}
    </div>
  )
}

export default function App() {
  const [lang, setLang] = useState('en')
  const [activeTab, setActiveTab] = useState('overview')
  const [locations, setLocations] = useState([])
  const [allSessionData, setAllSessionData] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadMsg, setLoadMsg] = useState('Loading locations...')
  const [error, setError] = useState(null)
  const [detailView, setDetailView] = useState(null)
  const [detailData, setDetailData] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.locations()
      .then(async d => {
        const locs = d.locations || []
        setLocations(locs)
        const allData = []
        for (const loc of locs) {
          try {
            setLoadMsg(`Loading ${loc.slug.replace(/_/g,' ')}...`)
            const sessResp = await api.sessions(loc.slug)
            const sessions = sessResp.sessions || []
            for (const sess of sessions) {
              try {
                const summ = await api.summary(loc.slug, sess.session_slug)
                allData.push({ ...summ, locationSlug: loc.slug, sessionSlug: sess.session_slug })
              } catch (e) {}
            }
          } catch (e) {}
        }
        setAllSessionData(allData)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleSelectSession(locSlug, sessSlug) {
    setDetailLoading(true)
    setActiveTab('sessions')
    setDetailView(null)
    try {
      const [summ, dets] = await Promise.all([
        api.summary(locSlug, sessSlug),
        api.detections(locSlug, sessSlug),
      ])
      setDetailView({ locSlug, sessSlug })
      setDetailData({ summary: summ, detections: dets.detections || [] })
    } catch (e) {
      setError(e.message)
    } finally {
      setDetailLoading(false)
    }
  }

  const COLOUR_DOTS = { White: '#f1f0ee', Black: '#2a2928', Silver: '#b0b0b0', Grey: '#888', Blue: '#2b7fd4', Red: '#dc2626', Green: '#16a37a', Brown: '#8B6347' }

  return (
    <>
      <Nav lang={lang} setLang={setLang} activeTab={activeTab}
        setActiveTab={t => { setActiveTab(t); setDetailView(null) }} />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 32px 5rem' }}>

        {error && (
          <div style={{ background: 'var(--red-bg)', color: 'var(--red-text)', borderRadius: 'var(--r-lg)', padding: '10px 16px', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #fecaca' }}>
            <span>{error}</span>
            <button onClick={() => setError(null)} style={{ border: 'none', background: 'transparent', color: 'var(--red-text)', fontSize: 18, padding: '0 4px', lineHeight: 1 }}>×</button>
          </div>
        )}

        {loading && <Spinner msg={loadMsg} />}

        {!loading && (
          <>
            {activeTab === 'overview' && <OverviewTab allData={allSessionData} lang={lang} />}
            {activeTab === 'intelligence' && <IntelligenceTab allData={allSessionData} lang={lang} />}
            {activeTab === 'sessions' && !detailView && !detailLoading && (
              <SessionsTab locations={locations} allSessionData={allSessionData}
                onSelectSession={handleSelectSession} lang={lang} />
            )}
            {activeTab === 'sessions' && detailLoading && <Spinner msg="Loading session..." />}
            {activeTab === 'sessions' && detailView && detailData && !detailLoading && (
              <SessionDetail summary={detailData.summary} detections={detailData.detections}
                locationSlug={detailView.locSlug} onBack={() => setDetailView(null)} lang={lang} />
            )}
          </>
        )}
      </div>
    </>
  )
}
