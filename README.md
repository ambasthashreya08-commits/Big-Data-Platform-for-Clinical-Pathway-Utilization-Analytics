CAREBRIDGE --- Clinical Pathway Intelligence Platform

CAREBRIDGE is a clinical pathway intelligence platform combining
patient-level medical report analysis with population-level
clinical event-log analytics.

Features

Patient-Level Workflow

Upload a medical PDF report

Extract relevant medical parameters

Identify rule-based risk indicators

Generate a patient-specific clinical pathway

Provide health insights

AI assistant with a project knowledge base

Population-Level Analytics

XES event-log preprocessing

Case-level pathway construction

Exact pathway variant discovery

Pathway utilization and duration analysis

Activity transition analysis

Deviation analysis:

E --- Event: Jaccard distance

S --- Sequence: LCS-based order difference

T --- Temporal: Tukey IQR outlier detection

R --- Repetition: extra repeated occurrences

Bottleneck detection using transition frequency and median delay

FastAPI /analytics endpoint

Next.js Clinical Analytics dashboard

Current Implementation Results

Metric                                                       Result

Clinical events                                          15,214
Unique cases                                              1,050
Unique activity types                                        16
Distinct pathway variants                                   846
Most frequent pathway utilization                         3.33%
Median pathway duration                            128.24 hours
Mean pathway duration                              683.26 hours
Candidate transitions                                        79
Detected bottlenecks                                          8
Largest bottleneck                        Release A → Return ER
Median delay                          1,134.4 hours (~47 days)

These are implementation results from the current event-log pipeline.
They are not presented as clinical validation or outcome prediction.

Technology Stack

Frontend: Next.js, React, TypeScript, CSS

Backend: Python, FastAPI, Uvicorn

Analytics: pandas, NumPy, SciPy, NetworkX

AI / Report Processing: PDF processing, Sentence Transformers,
project knowledge base, AI assistant

Data: XES clinical event log and generated CSV analytical results

Project Structure

clinical-pathway-platform/
├── backend/
│   ├── main.py
│   ├── .env
│   ├── knowledge_base/
│   └── services/
├── frontend/
│   └── app/
│       ├── analytics/
│       ├── dashboard/
│       ├── globals.css
│       ├── layout.tsx
│       └── page.tsx
├── big-data/
│   ├── event_log_loader.py
│   ├── pathway_discovery.py
│   ├── utilization_analysis.py
│   ├── deviation_detection.py
│   ├── bottleneck_detection.py
│   ├── pipeline.py
│   └── results/
│       ├── pathway_variants.csv
│       ├── pathway_durations.csv
│       ├── transitions.csv
│       ├── deviations.csv
│       └── bottlenecks.csv
└── datasets/
    └── event_logs/
        └── Sepsis Cases - Event Log.xes.gz

Setup and Running the Project

CAREBRIDGE requires two terminals: one for the FastAPI backend and one for the Next.js frontend.

Terminal 1 — Start FastAPI Backend

From the project root:

cd C:\Users\HP\clinical-pathway-platform\backend

Create the virtual environment if it does not already exist:

python -m venv venv

Activate it:

.\venv\Scripts\Activate.ps1

If PowerShell blocks activation:

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

Then activate again:

.\venv\Scripts\Activate.ps1

Install dependencies:

pip install -r requirements.txt

Start the FastAPI server:

python -m uvicorn main:app --reload --port 8000

Backend:

http://127.0.0.1:8000

FastAPI Swagger documentation:

http://127.0.0.1:8000/docs

Health check:

http://127.0.0.1:8000/health

Keep Terminal 1 running.

Terminal 2 — Start Next.js Frontend

Open a new terminal:

cd C:\Users\HP\clinical-pathway-platform\frontend

Install dependencies:

npm install

Start the Next.js development server:

npm run dev

Frontend:

http://localhost:3000

Keep Terminal 2 running.

Running Both Together

After starting both servers:

Terminal 1
└── FastAPI Backend
    └── http://127.0.0.1:8000

Terminal 2
└── Next.js Frontend
    └── http://localhost:3000

Open the application:

http://localhost:3000

The frontend communicates with the FastAPI backend for report analysis and population-level analytics.

Quick Start — If Everything Is Already Installed

Terminal 1 — Backend:

cd C:\Users\HP\clinical-pathway-platform\backend
.\venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload --port 8000

Terminal 2 — Frontend:

cd C:\Users\HP\clinical-pathway-platform\frontend
npm run dev

Verify FastAPI Before Using the Frontend

Open:

http://127.0.0.1:8000/health

The endpoint should return a successful response.

If the frontend shows “Failed to fetch” while uploading a report, make sure the FastAPI server is running in Terminal 1 and verify that the health endpoint is accessible.

Analytics Pipeline

XES Event Log
      ↓
Event Log Loading
      ↓
Case Grouping + Timestamp Ordering
      ↓
Pathway Discovery
      ↓
Utilization Analysis
      ↓
Deviation Detection
      ├── Event (E)
      ├── Sequence (S)
      ├── Temporal (T)
      └── Repetition (R)
      ↓
Bottleneck Detection
      ↓
CSV Results
      ↓
FastAPI /analytics
      ↓
Next.js Clinical Analytics Dashboard

Bottleneck Detection

The current implementation: 1. Builds consecutive activity transitions.
2. Considers transitions with frequency ≥ 10. 3. Calculates median
transition delay. 4. Calculates the 90th percentile of candidate median
delays. 5. Flags transitions whose median delay is at or above that
threshold.

Bottlenecks are operational analytics signals, not clinical
diagnoses or patient outcome predictions.

API Endpoints

Endpoint                Purpose

GET /health           Backend health check
POST /upload-report   Upload and analyse a medical PDF
GET /analytics        Return population-level analytics
GET /api-info         API information

Data Flow

Individual Patient

Medical Report
     ↓
Parameter Extraction
     ↓
Risk Analysis
     ↓
Patient-Specific Clinical Pathway

Population Analytics

Clinical Event Log
     ↓
Pathway Discovery
     ↓
Utilization
     ↓
Deviation
     ↓
Bottleneck Analysis

Uploading one medical report does not generate the 1,050-case
population statistics. Those statistics are calculated from the
event-log dataset.

Dataset

The current analytics pipeline uses the anonymized Sepsis Cases Event
Log in XES format:

datasets/event_logs/Sepsis Cases - Event Log.xes.gz

Validation and Limitations

Completed implementation-level checks include: - Case-level pathway
construction - Pathway variant counting - Duration statistics -
Transition analysis - Deviation calculations - Bottleneck calculations -
Cross-checking generated analytical outputs

Still planned: - Validation on additional clinical datasets - MIMIC-IV
validation after access/credentialing - Formal RAG retrieval
evaluation - Validated combined deviation scoring - Deeper
patient-report ↔ population analytics integration - Apache Spark-based
large-scale processing

Future Work

Additional clinical dataset validation

MIMIC-IV validation

Apache Spark scalability

Deeper patient-report and population analytics integration

Formal RAG evaluation

Further Clinical Analytics dashboard refinement

Disclaimer

CAREBRIDGE is an academic and research project. Its risk indicators,
pathways, deviation results, and bottleneck results are for analytical
and educational purposes and should not be treated as medical diagnosis,
treatment recommendations, or clinical outcome predictions.

Author

Shreya Ambastha
B.Tech --- Computer Science & Engineering
Specialization: Big Data

License

This project is intended for academic and research purposes. Add an
appropriate open-source license if the repository is released publicly.
