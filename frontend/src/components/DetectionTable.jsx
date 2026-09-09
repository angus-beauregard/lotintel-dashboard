export default function DetectionTable({ detections, lang }) {
  const t = {
    en: { title: 'All detections', id: 'ID', type: 'Type', plate: 'Plate region', make: 'Make / model', colour: 'Colour', score: 'Score', nodata: 'No detections found.' },
    fr: { title: 'Toutes les détections', id: 'ID', type: 'Type', plate: 'Région plaque', make: 'Marque / modèle', colour: 'Couleur', score: 'Score', nodata: 'Aucune détection trouvée.' },
  }[lang]

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <div className="section-title">{t.title} ({detections.length})</div>
      {detections.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', padding: '8px 0' }}>{t.nodata}</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {[t.id, t.type, t.plate, t.make, t.colour, t.score].map(h => (
                  <th key={h} style={{
                    padding: '0 8px 10px', textAlign: 'left',
                    color: 'var(--text-tertiary)', fontWeight: 500,
                    fontSize: 11, whiteSpace: 'nowrap',
                    borderBottom: '0.5px solid var(--border)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {detections.map((d, i) => (
                <tr key={d.detection_id || i} style={{
                  borderBottom: i < detections.length - 1 ? '0.5px solid var(--border)' : 'none',
                }}>
                  <td style={{ padding: '8px', fontFamily: 'var(--mono)', color: 'var(--text-tertiary)', fontSize: 11, whiteSpace: 'nowrap' }}>
                    {d.crop_filename?.replace('.jpg', '')}
                  </td>
                  <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>
                    {d.vehicle_type || <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                  </td>
                  <td style={{ padding: '8px' }}>
                    {d.plate_region
                      ? <span className="badge badge-green">{d.plate_region}</span>
                      : <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                  </td>
                  <td style={{ padding: '8px', color: 'var(--text-secondary)', maxWidth: 160, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {[d.make, d.model].filter(Boolean).join(' ') || <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                  </td>
                  <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>
                    {d.colour
                      ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <span style={{
                            width: 8, height: 8, borderRadius: '50%', display: 'inline-block', flexShrink: 0,
                            background: {
                              White:'#f0f0f0', Black:'#2a2a2a', Silver:'#c0c0c0', Grey:'#888',
                              Blue:'#378ADD', Red:'#E24B4A', Green:'#639922', Brown:'#8B6347',
                            }[d.colour] || 'var(--border-strong)',
                            border: '0.5px solid var(--border-strong)',
                          }} />
                          {d.colour}
                        </span>
                      : <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                  </td>
                  <td style={{ padding: '8px', color: 'var(--text-tertiary)', fontFamily: 'var(--mono)', fontSize: 11 }}>
                    {d.quality_score?.toFixed(2) || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
