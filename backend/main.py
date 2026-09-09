import os
import sqlite3
import tempfile
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google.cloud import storage
from google.oauth2 import service_account
import json

app = FastAPI(title="Lotintel API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

BUCKET_NAME = "lotintel-backups"
PROJECT_ID  = "lotintel-498815"

def get_gcs_client():
    key_json = os.environ.get("GCS_KEY_JSON")
    if key_json:
        info = json.loads(key_json)
        creds = service_account.Credentials.from_service_account_info(info)
        return storage.Client(credentials=creds, project=PROJECT_ID)
    return storage.Client(project=PROJECT_ID)

def download_db(location_slug: str) -> str:
    client = get_gcs_client()
    bucket = client.bucket(BUCKET_NAME)
    blob = bucket.blob(f"{location_slug}/{location_slug}.db")
    if not blob.exists():
        raise HTTPException(status_code=404, detail=f"No DB found for location: {location_slug}")
    tmp = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
    blob.download_to_filename(tmp.name)
    return tmp.name

def query_db(db_path: str, sql: str, params=()):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    rows = conn.execute(sql, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.get("/")
def root():
    return {"status": "ok", "service": "lotintel-api"}

@app.get("/locations")
def list_locations():
    client = get_gcs_client()
    bucket = client.bucket(BUCKET_NAME)
    blobs = client.list_blobs(BUCKET_NAME)
    seen = set()
    locations = []
    for blob in blobs:
        parts = blob.name.split("/")
        if len(parts) >= 1:
            slug = parts[0]
            if slug not in seen and not slug.startswith("."):
                seen.add(slug)
                locations.append({"slug": slug})
    return {"locations": locations}

@app.get("/locations/{location_slug}/sessions")
def list_sessions(location_slug: str):
    db_path = download_db(location_slug)
    rows = query_db(db_path, """
        SELECT session_id, session_slug, started_at, completed_at,
               total_vehicles, plates_found, carnet_ran
        FROM sessions
        ORDER BY started_at DESC
    """)
    os.unlink(db_path)
    return {"sessions": rows}

@app.get("/locations/{location_slug}/sessions/{session_slug}/detections")
def get_detections(location_slug: str, session_slug: str):
    db_path = download_db(location_slug)
    rows = query_db(db_path, """
        SELECT d.detection_id, d.track_id, d.crop_filename,
               d.plate_region, d.plate_confidence, d.vehicle_type,
               d.make, d.model, d.colour,
               d.is_commercial, d.business_name, d.business_url,
               d.ocr_raw, d.ocr_confidence, d.quality_score,
               d.first_seen_frame, d.last_seen_frame, d.is_duplicate
        FROM detections d
        JOIN sessions s ON d.session_id = s.session_id
        WHERE s.session_slug = ? AND d.is_duplicate = 0
        ORDER BY d.track_id
    """, (session_slug,))
    os.unlink(db_path)
    return {"detections": rows}

@app.get("/locations/{location_slug}/sessions/{session_slug}/summary")
def get_summary(location_slug: str, session_slug: str):
    db_path = download_db(location_slug)
    session = query_db(db_path, """
        SELECT * FROM sessions WHERE session_slug = ?
    """, (session_slug,))
    if not session:
        os.unlink(db_path)
        raise HTTPException(status_code=404, detail="Session not found")
    s = session[0]
    stats = query_db(db_path, """
        SELECT
            COUNT(*) as total,
            SUM(CASE WHEN plate_region IS NOT NULL THEN 1 ELSE 0 END) as plates_found,
            SUM(CASE WHEN is_commercial = 1 THEN 1 ELSE 0 END) as commercial_count,
            SUM(CASE WHEN vehicle_type = 'SUV' THEN 1 ELSE 0 END) as suv_count,
            SUM(CASE WHEN vehicle_type = 'Sedan' THEN 1 ELSE 0 END) as sedan_count,
            SUM(CASE WHEN vehicle_type = 'Van' THEN 1 ELSE 0 END) as van_count,
            AVG(quality_score) as avg_quality
        FROM detections d
        JOIN sessions sess ON d.session_id = sess.session_id
        WHERE sess.session_slug = ? AND d.is_duplicate = 0
    """, (session_slug,))
    brands = query_db(db_path, """
        SELECT business_name, business_url, COUNT(*) as count
        FROM detections d
        JOIN sessions sess ON d.session_id = sess.session_id
        WHERE sess.session_slug = ? AND d.is_duplicate = 0
          AND d.business_name IS NOT NULL
        GROUP BY business_name
        ORDER BY count DESC
    """, (session_slug,))
    os.unlink(db_path)
    return {
        "session": s,
        "stats": stats[0] if stats else {},
        "brands": brands,
    }
