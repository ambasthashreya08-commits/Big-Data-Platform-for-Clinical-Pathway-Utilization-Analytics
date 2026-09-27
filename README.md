<div align="center">

🏥 CAREBRIDGE

Clinical Pathway Intelligence Platform

From individual medical reports to population-level clinical pathway intelligence.

<p>
  <img src="https://img.shields.io/badge/Next.js-16.3.0-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/React-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="React TypeScript">
  <img src="https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/pandas-Analytics-150458?style=for-the-badge&logo=pandas&logoColor=white" alt="pandas">
  <img src="https://img.shields.io/badge/Status-Academic%20Project-F5A623?style=for-the-badge" alt="Status">
</p>

</div>

📌 Overview

CAREBRIDGE is a clinical pathway intelligence platform that combines two complementary workflows:

👤 Patient-Level Analysis

🏥 Population-Level Analytics

Upload a medical PDF report

Process a clinical event log

Extract medical parameters

Discover pathway variants

Identify rule-based risk indicators

Measure pathway utilization

Generate a patient-specific pathway

Analyse duration and transitions

Provide AI-assisted information

Detect E/S/T/R deviations



Identify high-delay bottlenecks

The current implementation uses Python/FastAPI for the backend, Next.js/React/TypeScript for the frontend, and a Python-based analytics pipeline for the clinical event log.

Important: CAREBRIDGE is an academic/research project. Its outputs are analytical and educational and are not intended to replace clinical diagnosis, treatment decisions, or professional medical advice.

✨ Key Features

📄 Medical Report Processing

PDF medical report upload

Medical parameter extraction

Rule-based risk analysis

Patient-specific clinical pathway generation

Health insights

AI assistant supported by a project knowledge base

📊 Clinical Pathway Intelligence

XES event-log preprocessing

Case-level pathway construction

Exact pathway variant discovery

Pathway utilization analysis

Case duration analysis

Activity transition analysis

Event, Sequence, Temporal and Repetition deviation analysis

Bottleneck detection based on transition delay

CSV-based analytical results

FastAPI /analytics integration

Next.js Clinical Analytics dashboard

🧠 System Architecture

flowchart TB

    U[👤 User]

    U --> PDF[📄 Upload Medical Report]
    U --> DASH[🖥️ Clinical Analytics Dashboard]

    subgraph PATIENT["Patient-Level Workflow"]
        PDF --> EXTRACT[🔍 Medical Parameter Extraction]
        EXTRACT --> RISK[⚠️ Rule-Based Risk Analysis]
        RISK --> PATH[🩺 Patient-Specific Clinical Pathway]
        PATH --> AI[🤖 AI Assistant / Knowledge Base]
    end

    subgraph POPULATION["Population-Level Analytics"]
        DATA[🏥 XES Clinical Event Log]
        DATA --> LOAD[🧹 Event Log Preprocessing]
        LOAD --> DISC[🧭 Pathway Discovery]
        DISC --> UTIL[📊 Utilization Analysis]
        DISC --> DEV[🔎 Deviation Detection]
        DISC --> BOTT[🚦 Bottleneck Detection]

        DEV --> E[Event E]
        DEV --> S[Sequence S]
        DEV --> T[Temporal T]
        DEV --> R[Repetition R]

        UTIL --> CSV[📦 CSV Analytical Results]
        E --> CSV
        S --> CSV
        T --> CSV
        R --> CSV
        BOTT --> CSV
    end

    CSV --> API[⚡ FastAPI /analytics]
    API --> DASH
    PATH --> DASH

🔬 Analytics Pipeline

flowchart LR

    A["XES Event Log"]
    B["Case Grouping"]
    C["Timestamp Ordering"]
    D["Ordered Case Sequences"]

    E["Pathway Discovery"]
    F["Utilization"]
    G["Deviation E/S/T/R"]
    H["Bottleneck Detection"]

    I["CSV Results"]
    J["FastAPI /analytics"]
    K["Next.js Dashboard"]

    A --> B --> C --> D
    D --> E
    D --> F
    D --> G
    D --> H

    E --> I
    F --> I
    G --> I
    H --> I

    I --> J --> K

📈 Current Implementation Results

The current implementation has analysed the supplied clinical event log and produced:

Metric

Current Result

🧪 Clinical events

15,214

👥 Unique cases

1,050

🧬 Activity types

16

🛣️ Distinct pathway variants

846

📊 Most frequent pathway utilization

3.33%

⏱️ Median pathway duration

128.24 hours

⏱️ Mean pathway duration

683.26 hours

🔀 Candidate transitions

79

🚦 Detected bottlenecks

8

🔴 Largest identified bottleneck

Release A → Return ER

⏳ Median delay

1,134.4 hours (~47 days)

Result Flow

15,214 Events
      │
      ▼
1,050 Cases
      │
      ▼
846 Exact Pathway Variants
      │
      ├──────────────► Utilization
      │
      ├──────────────► Duration
      │
      ├──────────────► E / S / T / R Deviations
      │
      └──────────────► 79 Candidate Transitions
                              │
                              ▼
                       8 Bottlenecks

🔎 Deviation Analysis

CAREBRIDGE analyses deviation through four separate dimensions.

Dimension

Method

Purpose

E — Event

Jaccard distance

Measures differences in activities present

S — Sequence

LCS-based order similarity

Measures differences in activity ordering

T — Temporal

Tukey IQR outlier rule

Identifies unusual case durations

R — Repetition

Extra occurrences / total events

Measures repeated activities

The current implementation intentionally reports these dimensions separately rather than claiming a validated combined deviation score.

🚦 Bottleneck Detection

The current bottleneck algorithm:

Consecutive activity transitions
            │
            ▼
Keep transitions with frequency ≥ 10
            │
            ▼
Calculate median transition delay
            │
            ▼
Calculate 90th percentile
of candidate median delays
            │
            ▼
Flag transitions where
median delay ≥ threshold

A detected bottleneck represents an operational analytics signal. It is not a clinical diagnosis or a prediction of patient outcomes.

🖥️ Application Screens

Add your screenshots to:

docs/
└── screenshots/
    ├── home.png
    ├── report-analysis.png
    └── clinical-analytics.png

Then this section will display them on GitHub:

<table>
<tr>
<td align="center"><b>🏠 Patient Upload</b></td>
<td align="center"><b>📄 Report Analysis</b></td>
<td align="center"><b>📊 Clinical Analytics</b></td>
</tr>
<tr>
<td><img src="docs/screenshots/home.png" width="300" alt="CAREBRIDGE patient upload"></td>
<td><img src="docs/screenshots/report-analysis.png" width="300" alt="CAREBRIDGE report analysis"></td>
<td><img src="docs/screenshots/clinical-analytics.png" width="300" alt="CAREBRIDGE clinical analytics"></td>
</tr>
</table>

🛠️ Technology Stack

Layer

Technologies

Frontend

Next.js, React, TypeScript, CSS

Backend

Python, FastAPI, Uvicorn

Analytics

pandas, NumPy, SciPy, NetworkX

Report Processing

PDF processing, medical parameter extraction

AI / Retrieval

Sentence Transformers, project knowledge base, AI assistant

Data Format

XES event log, CSV analytical outputs

📁 Project Structure

clinical-pathway-platform/
│
├── 📂 backend/
│   ├── main.py
│   ├── .env
│   ├── requirements.txt
│   │
│   ├── 📂 knowledge_base/
│   │
│   └── 📂 services/
│       ├── ai_assistant.py
│       ├── briefing_generator.py
│       ├── clinical_pathway.py
│       ├── medical_extractor.py
│       ├── pathway_intelligence.py
│       ├── rag_service.py
│       └── risk_analyzer.py
│
├── 📂 frontend/
│   └── 📂 app/
│       ├── 📂 analytics/
│       ├── 📂 dashboard/
│       ├── globals.css
│       ├── layout.tsx
│       └── page.tsx
│
├── 📂 big-data/
│   ├── event_log_loader.py
│   ├── pathway_discovery.py
│   ├── utilization_analysis.py
│   ├── deviation_detection.py
│   ├── bottleneck_detection.py
│   ├── pipeline.py
│   │
│   ├── test_loader.py
│   ├── test_pathway_discovery.py
│   ├── test_utilization.py
│   ├── test_deviation.py
│   ├── test_bottleneck.py
│   │
│   └── 📂 results/
│       ├── pathway_variants.csv
│       ├── pathway_durations.csv
│       ├── transitions.csv
│       ├── deviations.csv
│       └── bottlenecks.csv
│
├── 📂 datasets/
│   └── 📂 event_logs/
│       └── Sepsis Cases - Event Log.xes.gz
│
└── README.md

⚡ Quick Start

CAREBRIDGE requires two terminals.

1️⃣ Terminal 1 — FastAPI Backend

cd C:\Users\HP\clinical-pathway-platform\backend

.\venv\Scripts\Activate.ps1

python -m uvicorn main:app --reload --port 8000

Backend:

http://127.0.0.1:8000

FastAPI Swagger:

http://127.0.0.1:8000/docs

Health check:

http://127.0.0.1:8000/health

Keep this terminal running.

2️⃣ Terminal 2 — Next.js Frontend

Open a new terminal:

cd C:\Users\HP\clinical-pathway-platform\frontend

npm run dev

Frontend:

http://localhost:3000

Keep this terminal running.

🆕 First-Time Setup

Backend

cd C:\Users\HP\clinical-pathway-platform\backend

python -m venv venv

.\venv\Scripts\Activate.ps1

pip install -r requirements.txt

If PowerShell blocks activation:

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

Then:

.\venv\Scripts\Activate.ps1

Frontend

cd C:\Users\HP\clinical-pathway-platform\frontend

npm install

🔌 API Endpoints

Method

Endpoint

Purpose

GET

/health

Backend health check

POST

/upload-report

Upload and analyse medical PDF

GET

/analytics

Return population-level analytics

GET

/api-info

API information

Interactive API documentation:

http://127.0.0.1:8000/docs

🔄 Data Flow

Patient-Level Flow

Medical PDF
    ↓
Parameter Extraction
    ↓
Rule-Based Risk Analysis
    ↓
Patient-Specific Clinical Pathway
    ↓
AI-Assisted Information

Population-Level Flow

XES Event Log
    ↓
Event Preprocessing
    ↓
Pathway Discovery
    ↓
Utilization Analysis
    ↓
Deviation Analysis
    ↓
Bottleneck Detection
    ↓
CSV Results
    ↓
FastAPI /analytics
    ↓
Clinical Analytics Dashboard

Uploading one medical report does not generate the 1,050-case population statistics. Population-level results come from the supplied clinical event-log dataset.

🧪 Dataset

The current population analytics pipeline uses the anonymized:

Sepsis Cases Event Log

Expected location:

datasets/event_logs/Sepsis Cases - Event Log.xes.gz

The event log is used for pathway discovery, utilization analysis, deviation analysis and bottleneck detection.

✅ Validation Status

Implemented and checked

Case-level pathway construction

Pathway variant counting

Duration statistics

Transition frequency analysis

E/S/T/R deviation calculations

Bottleneck calculations

Generated CSV analytical outputs

FastAPI /analytics integration

Next.js Clinical Analytics integration

Planned / Pending

Validation on additional clinical datasets

MIMIC-IV validation after access/credentialing

Formal RAG retrieval evaluation

Validated combined deviation scoring

Deeper patient-report ↔ population analytics integration

Apache Spark-based large-scale processing

🚀 Future Work

Current Implementation
        │
        ▼
Additional Dataset Validation
        │
        ▼
MIMIC-IV Validation
        │
        ▼
Apache Spark Scalability
        │
        ▼
Deeper Patient ↔ Population Integration
        │
        ▼
Formal RAG Evaluation
        │
        ▼
Final Clinical Analytics Refinement

🔐 Environment Variables

Create:

backend/.env

Store required API configuration there.

Never commit API keys, tokens, passwords, or other secrets to GitHub.

Recommended .gitignore entries:

# Python
__pycache__/
*.py[cod]
venv/
.env

# Next.js
node_modules/
.next/
out/

# Local files
*.log

# OS
.DS_Store
Thumbs.db

⚠️ Limitations

The current implementation should be understood within these limits:

The analytics pipeline currently uses Python/pandas processing rather than Apache Spark.

Population-level analytics are based on the supplied event-log dataset.

Formal clinical validation on additional datasets is future work.

MIMIC-IV validation is pending access/credentialing.

No validated combined deviation score is currently claimed.

Formal RAG retrieval evaluation is pending.

Bottleneck detection is an operational analytics method, not a clinical diagnosis or outcome prediction system.

🎓 Academic Context

CAREBRIDGE was developed as a B.Tech Computer Science & Engineering — Big Data project.

The project extends a patient-focused clinical pathway workflow with population-level pathway intelligence for:

pathway discovery

pathway utilization

deviation analysis

bottleneck identification

👩‍💻 Author

<div align="center">

Shreya Ambastha

B.Tech — Computer Science & Engineering
Specialization: Big Data

</div>

📜 License

This project is intended for academic and research purposes.

If this repository is distributed publicly, add the appropriate open-source license here.

<div align="center">

🏥 CAREBRIDGE

Clinical Pathway Intelligence Platform

Patient Analysis • Pathway Discovery • Utilization • Deviation • Bottlenecks

</div>
