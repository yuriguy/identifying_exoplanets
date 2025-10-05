Exoplanet Explorer — NASA Space Apps 2025
=========================================

Classify candidate exoplanets and explore model performance with a modern web UI.
Frontend in React (Vite + Tailwind + shadcn/ui). Backend in Flask exposing
/predict and /stats. Optional live queries to the NASA Exoplanet Archive (TAP).

---

Table of Contents
-----------------
1) Demo & Features
2) Project Structure
3) Prerequisites
4) Backend (Flask) — Setup & Run
5) Frontend (Vite/React) — Setup & Run
6) API Reference
7) CSV Template
8) Optional: NASA TAP Queries from Frontend
9) Deployment Notes
10) Troubleshooting
11) License & Acknowledgments

---

1) Demo & Features
------------------
Core capabilities:
Upload a CSV with exoplanet candidate features and get predictions from the model.
See a compact results table plus an aggregated summary (counts by class).
“Stats for Nerds”: a dedicated panel that fetches /stats and renders accuracy,
per-class precision/recall/F1, macro/weighted averages, and supports (counts).
One-click download of a valid CSV template.
Clean landing page inspired by NASA’s exoplanets site, linking to the upload page.
(Optional) Query the NASA Exoplanet Archive TAP endpoint for live stats.

Pages/components you’ll find:
LandingPage: hero, high-level stats, quick links to Files/Upload and About.
Arquivos (Files): CSV template download + CSV upload + results table.
NerdStats: reusable card that fetches /stats and renders performance.
Sobre (About): project context, ML approach, team.

---

2) Project Structure
--------------------
Typical layout (frontend + an API server). If your backend lives in another repo,
adapt paths accordingly.
├─ public/
│ ├─ exoplanetas_exemplo.csv # sample template exposed as /exoplanetas_exemplo.csv
│ └─ planets-bg.jpeg / image_bdf04c.jpg # hero/illustrations
├─ src/
│ ├─ assets/ # optional, static imports (if not using /public)
│ ├─ components/
│ │ ├─ ui/ # shadcn/ui components (button, card, table, input, etc.)
│ │ └─ Layout.jsx # shared layout (app shell)
│ ├─ pages/
│ │ ├─ LandingPage.jsx
│ │ ├─ Arquivos.jsx # CSV upload + results
│ │ └─ Sobre.jsx # about
│ ├─ lib/
│ │ └─ api.js # API helpers (predict/stats/TAP)
│ ├─ App.jsx
│ ├─ main.jsx
│ └─ index.css # Tailwind + theme tokens
├─ vite.config.js
├─ package.json
└─ (backend/) # Flask app (if co-located)
├─ app.py
├─ model.pkl / pipeline.pkl (example)
└─ requirements.txt
Important:
Files placed in public/ are served at the site root. A file public/exoplanetas_exemplo.csv
is accessible at /exoplanetas_exemplo.csv. Use this for the “?” download button.

---

3) Prerequisites
----------------
Node.js 18+ and npm
Python 3.10+ and pip
(Recommended) virtualenv for the backend
Modern browser

---

4) Backend (Flask) — Setup & Run
--------------------------------
If the backend folder is inside this repo:cd backend
python -m venv .venv
source .venv/bin/activate # Windows: .venv\Scripts\activate
pip install -r requirements.txt # or: pip install flask flask-cors pandas scikit-learn joblib numpy
A minimal `app.py` (illustrative):

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app)

# Example: in-memory "model" and stats. Replace with your trained pipeline.
STATS = {
    "accuracy": 0.8605378361475923,
    "classification_report": {
        "CANDIDATE": {"precision": 0.7598566308243727, "recall": 0.5905292479108635, "f1-score": 0.664576802507837, "support": 359.0},
        "CONFIRMED": {"precision": 0.7229601518026565, "recall": 0.8355263157894737, "f1-score": 0.775178026449644, "support": 456.0},
        "FALSE POSITIVE": {"precision": 0.987389659520807, "recall": 0.9987244897959183, "f1-score": 0.9930247305009512, "support": 784.0},
        "accuracy": 0.8605378361475923,
        "macro avg": {"precision": 0.8234021473826121, "recall": 0.8082600178320852, "f1-score": 0.8109265198194775, "support": 1599.0},
        "weighted avg": {"precision": 0.8608954676374445, "recall": 0.8605378361475923, "f1-score": 0.8571579992958706, "support": 1599.0}
    }
}

@app.get("/stats")
def stats():
    return jsonify(STATS)

@app.post("/predict")
def predict():
    """
    Expects multipart/form-data with a 'file' (.csv).
    Returns: array of { index, prediction, data }.
    """
    f = request.files.get("file")
    if not f:
        return jsonify({"error": "file is required"}), 400

    df = pd.read_csv(f)
    # TODO: real inference using your trained pipeline
    # Below is a dummy mapping based on a score-like column if present
    out = []
    for i, row in df.iterrows():
        score = float(row.get("Disposition Score", row.get("koi_score", 0)))
        if score >= 0.8:
            label = "CONFIRMED"
        elif score >= 0.5:
            label = "CANDIDATE"
        else:
            label = "FALSE POSITIVE"
        out.append({"index": int(i), "prediction": label, "data": row.to_dict()})
    return jsonify(out)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=Truepython app.py
API listening on http://127.0.0.1:5000/
npm install
npm run dev
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: {
    proxy: {
      "/predict": { target: "http://127.0.0.1:5000/", changeOrigin: true, secure: false },
      "/stats":   { target: "http://127.0.0.1:5000/", changeOrigin: true, secure: false },
      "/TAP":     { target: "https://exoplanetarchive.ipac.caltech.edu/", changeOrigin: true, secure: true },
    },
  },
})
shadcn/ui + Tailwind + Typescript

If the project wasn’t bootstrapped with shadcn, run: npx shadcn@latest init

Ensure components live under src/components/ui/*.

Tailwind is already wired via index.css and the Vite plugin.

API Reference

GET /stats

Returns model performance metrics, e.g.:
{
  "accuracy": 0.8605378361475923,
  "classification_report": {
    "CANDIDATE": {
      "precision": 0.7598566308243727,
      "recall": 0.5905292479108635,
      "f1-score": 0.664576802507837,
      "support": 359.0
    },
    "CONFIRMED": {
      "precision": 0.7229601518026565,
      "recall": 0.8355263157894737,
      "f1-score": 0.775178026449644,
      "support": 456.0
    },
    "FALSE POSITIVE": {
      "precision": 0.987389659520807,
      "recall": 0.9987244897959183,
      "f1-score": 0.9930247305009512,
      "support": 784.0
    },
    "accuracy": 0.8605378361475923,
    "macro avg": {
      "precision": 0.8234021473826121,
      "recall": 0.8082600178320852,
      "f1-score": 0.8109265198194775,
      "support": 1599.0
    },
    "weighted avg": {
      "precision": 0.8608954676374445,
      "recall": 0.8605378361475923,
      "f1-score": 0.8571579992958706,
      "support": 1599.0
    }
  }
}
POST /predict

Content-Type: multipart/form-data

Field: file (CSV)

Response: Array of objects like:
[
  {
    "index": 0,
    "prediction": "CANDIDATE",
    "data": {
      "Orbital Period (days)": 12.345,
      "Disposition Score": 0.73,
      "...": "..."
    }
  }
]CSV Template

The UI provides a Download CSV button and also a static template at /exoplanetas_exemplo.csv.
Place your sample in public/exoplanetas_exemplo.csv.

Header-only (comma-separated) example:Header-only (comma-separated) example:
Not Transit-Like Flag,Stellar Eclipse Flag,Centroid Offset Flag,Ephemeris Match Indicates Contamination Flag,Orbital Period (days),Transit Duration (hours),Transit Depth (parts per million),Planetary Radius (Earth radii),Equilibrium Temperature (Kelvin),Insolation Flux [Earth flux],Transit Signal-to-Noise,Disposition Score
Semicolon variant (Excel-friendly in some locales):f your model expects Kepler KOI columns, keep the KOI names; otherwise, the project UI shows human-readable names to be more approachable to non-experts.

Optional: NASA TAP Queries from Frontend

You can call the Exoplanet Archive TAP directly from the frontend (proxied in dev):
/ src/lib/api.js
const TAP = import.meta.env.DEV ? "/TAP/sync" : "https://exoplanetarchive.ipac.caltech.edu/TAP/sync"

export async function tap(query) {
  const url = ${TAP}?query=${encodeURIComponent(query)}&format=json
  const res = await fetch(url)
  if (!res.ok) throw new Error(TAP error: ${res.status})
  return res.json()
}
SELECT TOP 5 pl_name, pl_rade, pl_orbper
FROM ps
WHERE pl_rade IS NOT NULL
ORDER BY pl_orbper DESC
Deployment Notes

Frontend:

Static hosting (Netlify, Vercel, GitHub Pages). Build with npm run build.

If the backend is hosted separately, point API URLs accordingly and remove the dev proxy.

Backend:

Any Python-friendly host (Render, Railway, Fly.io, EC2).

Add flask-cors if serving the API cross-origin.

Expose GET /stats and POST /predict over HTTPS for production.
Troubleshooting

vite: not found
Run npm install (this installs Vite). Then npm run dev.

CSV download returns HTML
Put the file in public/ and link it as href="/exoplanetas_exemplo.csv" (leading /).

Proxy 502/ECONNREFUSED on /predict or /stats
Start Flask on 127.0.0.1:5000. Check the Vite server.proxy config.

CORS errors in production
Enable CORS in Flask (flask-cors) or host the frontend behind the same domain.

Nothing appears in “Stats for Nerds”
Confirm GET /stats returns the JSON above and that the frontend points to /stats.

Git push rejected (non-fast-forward)
git pull --rebase origin main → resolve conflicts → git push origin main.
License & Acknowledgments

License: MIT (adjust as needed).

Data & inspiration: NASA Exoplanet Archive and NASA Space Apps Challenge.
