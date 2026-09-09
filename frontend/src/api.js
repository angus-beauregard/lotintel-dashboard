const BASE = import.meta.env.VITE_API_URL || '/api'
async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json()
}
export const api = {
  locations: () => get('/locations'),
  sessions: (slug) => get(`/locations/${slug}/sessions`),
  summary: (loc, session) => get(`/locations/${loc}/sessions/${session}/summary`),
  detections: (loc, session) => get(`/locations/${loc}/sessions/${session}/detections`),
}
