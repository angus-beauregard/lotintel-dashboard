export default function CommercialList({ detections, lang }) {
  const t = {
    en: { title: 'Commercial vehicle detections', commercial: 'commercial', flagged: 'flagged', unknown: 'Unidentified — signage detected', nodata: 'No commercial vehicles detected in this session.' },
    fr: { title: 'Véhicules commerciaux détectés', commercial: 'commercial', flagged: 'signalé', unknown: 'Non identifié — signalétique détectée', nodata: 'Aucun véhicule commercial détecté dans cette session.' },
  }[lang]

  const commercial = detections.filter(d => d.is_commercial)

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <div className="section-title">{t.title}</div>
      {commercial.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', padding: '8px 0' }}>{t.nodata}</p>
      ) : commercial.map((d, i) => (
        <div key={d.detection_id || i}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', fontSize: 13 }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-tertiary)', minWidth: 68 }}>
              {d.crop_filename?.replace('.jpg', '')}
            </span>
            <span style={{ fontWeight: 500, flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {d.business_name || t.unknown}
            </span>
            <span className={`badge ${d.business_name ? 'badge-green' : 'badge-amber'}`}>
              {d.business_name ? t.commercial : t.flagged}
            </span>
            {d.business_url && (
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)', minWidth: 80, textAlign: 'right' }}>
                {d.business_url}
              </span>
            )}
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', minWidth: 32, textAlign: 'right' }}>
              {d.quality_score?.toFixed(2)}
            </span>
          </div>
          {d.ocr_raw && (
            <div style={{ paddingLeft: 76, paddingBottom: 6, fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {d.ocr_raw.split(' | ').slice(0, 8).join(' · ')}
            </div>
          )}
          {i < commercial.length - 1 && <hr className="divider" />}
        </div>
      ))}
    </div>
  )
}
