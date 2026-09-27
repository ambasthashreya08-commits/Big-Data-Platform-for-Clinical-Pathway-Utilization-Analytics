<div align="center">

🩺 CAREBRIDGE

Clinical Pathway Utilization Analytics Platform

From patient reports to clinical pathways.
From event logs to healthcare workflow intelligence.

<p>
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge&logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/AI-RAG-7C3AED?style=for-the-badge" alt="RAG">
  <img src="https://img.shields.io/badge/Big%20Data-Analytics-2563EB?style=for-the-badge" alt="Big Data">
  <img src="https://img.shields.io/badge/OpenStreetMap-Leaflet-7EBC6F?style=for-the-badge&logo=openstreetmap" alt="OpenStreetMap">
</p>

<p>
  <a href="#-features">Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-analytics">Analytics</a> •
  <a href="#-doctor-finder">Doctor Finder</a> •
  <a href="#-setup">Setup</a> •
  <a href="#-future-scope">Future Scope</a>
</p>

</div>

🌟 What is CAREBRIDGE?

CAREBRIDGE is an academic healthcare intelligence platform that combines patient-level medical analysis with population-level clinical pathway analytics.

It transforms:

📄 Medical Reports → 🧠 Clinical Intelligence → 🧭 Patient Pathway → 👨‍⚕️ Doctor Discovery

and also:

📊 Healthcare Event Logs → 🔎 Pathway Discovery → 📈 Utilization → ⚠️ Deviations → 🚧 Bottlenecks

The goal is to provide a unified platform for understanding both individual patient journeys and large-scale healthcare workflows.

✨ Features

<table>
<tr>
<td width="50%">

🩺 Patient Intelligence

📄 PDF medical report upload

🔬 Medical parameter extraction

⚠️ Risk analysis

🧭 Personalized clinical pathway

🤖 AI assistant

📚 RAG-based knowledge retrieval

</td>
<td width="50%">

📊 Clinical Pathway Analytics

🔎 Pathway discovery

📈 Pathway utilization

🔗 Transition analysis

⚠️ Deviation detection

⏱️ Temporal anomaly detection

🚧 Bottleneck detection

</td>
</tr>
<tr>
<td>

👨‍⚕️ Doctor Finder

Specialist recommendation

Doctor directory

Clinic information

Consultation fee

Contact details

Timings

Appointment/booking information

</td>
<td>

🗺️ Interactive Map

OpenStreetMap

Leaflet / React-Leaflet

Clinic locations

Browser geolocation

Route generation

Coordinate fallback handling

</td>
</tr>
</table>

🧠 How CAREBRIDGE Works

flowchart LR

    A[📄 Medical Report] --> B[🔬 Parameter Extraction]
    B --> C[⚠️ Risk Analysis]
    C --> D[🧭 Clinical Pathway]
    D --> E[🤖 AI Assistant]
    D --> F[👨‍⚕️ Doctor Recommendation]
    F --> G[🗺️ Doctor Finder]

    H[📊 Event Log Dataset] --> I[🔎 Pathway Discovery]
    I --> J[📈 Utilization Analytics]
    I --> K[⚠️ Deviation Detection]
    I --> L[🚧 Bottleneck Detection]

    J --> M[📊 Analytics Dashboard]
    K --> M
    L --> M

    E --> N[🚀 CAREBRIDGE]
    G --> N
    M --> N

🏗️ Architecture

                         ┌───────────────────────┐
                         │       CAREBRIDGE      │
                         └───────────┬───────────┘
                                     │
                ┌────────────────────┴────────────────────┐
                │                                         │
       ┌────────▼────────┐                       ┌────────▼────────┐
       │ Patient Layer   │                       │ Analytics Layer │
       └────────┬────────┘                       └────────┬────────┘
                │                                         │
       ┌────────▼────────┐                       ┌────────▼────────┐
       │ Medical PDF     │                       │ Event Log Data  │
       └────────┬────────┘                       └────────┬────────┘
                │                                         │
       ┌────────▼────────┐                       ┌────────▼────────┐
       │ Parameter       │                       │ Pathway         │
       │ Extraction      │                       │ Discovery       │
       └────────┬────────┘                       └────────┬────────┘
                │                                         │
       ┌────────▼────────┐              ┌─────────────────┼─────────────────┐
       │ Risk Analysis   │              │                 │                 │
       └────────┬────────┘        ┌─────▼─────┐     ┌────▼────┐      ┌─────▼─────┐
                │                 │Utilization│     │Deviation │      │ Bottleneck │
       ┌────────▼────────┐        └─────┬─────┘     └────┬─────┘      └─────┬─────┘
       │ Clinical        │              │                 │                  │
       │ Pathway         │              └─────────────────┼──────────────────┘
       └───────┬─────────┘                                │
               │                                  ┌───────▼────────┐
        ┌──────┴───────┐                          │ Analytics      │
        │              │                          │ Dashboard      │
   ┌────▼────┐   ┌─────▼─────┐                    └────────────────┘
   │   RAG   │   │  Doctor   │
   │Assistant│   │  Finder   │
   └─────────┘   └─────┬─────┘
                       │
                 ┌─────▼─────┐
                 │   Leaflet │
                 │   + OSM   │
                 └───────────┘

📊 Clinical Pathway Analytics

CAREBRIDGE processes a sepsis event-log dataset and reconstructs patient journeys from event sequences.

Current processing results

Metric

Result

📌 Total events

15,214

👥 Total cases

1,050

🧩 Unique activities

16

🔀 Exact pathway variants

846

⏱️ Temporal outliers

175

🔎 Candidate bottlenecks

79

🚧 Detected bottlenecks

8

🔎 Pathway Discovery

The system reconstructs the sequence of activities performed for each case.

Example:

ER Registration
       ↓
ER Triage
       ↓
ER Sepsis Triage
       ↓
Laboratory Testing
       ↓
Treatment
       ↓
Release

Current result: 846 distinct exact pathway variants.

The most frequent pathway in the current analysis is:

ER Registration
        ↓
ER Triage
        ↓
ER Sepsis Triage

Frequency: 35 cases

📈 Pathway Utilization

CAREBRIDGE calculates:

Pathway frequency

Utilization percentage

Transition frequency

Pathway duration

Common workflow transitions

Example high-frequency transition:

Leucocytes → CRP

⏱️ Pathway Duration

Statistic

Value

Median

128.24 hours

Mean

683.26 hours

Minimum

0.0339 hours

Maximum

10,135.77 hours

These values are used to investigate variation in patient workflow duration.

⚠️ Deviation Detection

The deviation module analyzes workflow behavior across multiple dimensions:

Dimension

Meaning

E

Event deviation

S

Sequence deviation

T

Temporal deviation

R

Repetition deviation

The system identifies cases whose observed workflow differs from commonly observed pathway behavior.

Temporal Analysis

Current analysis identified:

175 / 1,050 cases — approximately 16.67%

as temporal outliers.

🚧 Bottleneck Detection

The bottleneck module analyzes workflow transitions using frequency and timing patterns.

Current analysis:

79 candidate bottlenecks
          ↓
8 detected bottlenecks

One notable transition is:

Release A
    ↓
Return ER

Current observed statistics:

Metric

Value

Frequency

276 cases

Median delay

1,134.4 hours

Mean delay

1,976.1 hours

These patterns are intended for further clinical and operational investigation.

🤖 AI + RAG

CAREBRIDGE includes an AI assistant supported by a Retrieval-Augmented Generation pipeline.

flowchart LR
    A[Knowledge Base] --> B[Text Chunking]
    B --> C[Sentence Transformer]
    C --> D[Vector Embeddings]
    D --> E[FAISS]
    E --> F[Relevant Context]
    F --> G[AI Assistant]

Technologies

Sentence Transformers

FAISS

Knowledge Base

Vector embeddings

Retrieval-Augmented Generation

The RAG layer is designed to provide context-grounded responses using retrieved knowledge.

👨‍⚕️ Doctor Recommendation

CAREBRIDGE maps detected medical findings to relevant specialist categories.

Finding

Specialist Category

Glucose / HbA1c

Endocrinologist / Diabetologist

Cholesterol / LDL / HDL

Cardiologist / Internal Medicine

Blood Pressure

Cardiologist / General Physician

Thyroid / TSH / T3 / T4

Endocrinologist

The doctor directory contains information such as:

Doctor
├── Name
├── Specialization
├── Clinic / Hospital
├── Address
├── Consultation Fee
├── Timings
├── Contact
├── Booking Information
└── Location

ℹ️ Doctor information, fees, timings and availability should be verified with the healthcare provider before visiting.

🗺️ Interactive Doctor Map

The Doctor Finder uses an open mapping stack:

<div align="center">

OpenStreetMap + Leaflet + React-Leaflet

</div>

Map capabilities

📍 Clinic locations

🧭 Browser-based user location

🗺️ Interactive map

🚗 Route/directions

🏥 Clinic information popup

🔄 Location fallback when coordinates are unavailable

No Google Maps API key or Google Cloud billing is required for the embedded map.

🖥️ Frontend

Built with:

Next.js

React

TypeScript

Tailwind CSS

Leaflet

React-Leaflet

Framer Motion

The frontend includes:

/
├── Main Patient Interface
├── Analytics Dashboard
├── Doctor Finder
└── Map Test Interface

⚙️ Backend

Built with:

Python

FastAPI

Uvicorn

Pandas

NumPy

Scikit-learn

PyPDF

Sentence Transformers

FAISS

SQLite

API

Endpoint

Purpose

GET /

API information

GET /health

Health check

POST /upload-report

Medical report processing

GET /analytics

Clinical pathway analytics

POST /patient-context

Patient context

POST /doctor-recommendations

Doctor recommendations

GET /api-info

API information

🧰 Tech Stack

<div align="center">

Layer

Technologies

🎨 Frontend

Next.js · React · TypeScript · Tailwind CSS

⚡ Backend

FastAPI · Python · Uvicorn

🧠 AI

RAG · Sentence Transformers · FAISS

📊 Analytics

Pandas · NumPy · Scikit-learn

📄 Documents

PyPDF

🗺️ Maps

OpenStreetMap · Leaflet · React-Leaflet

💾 Storage

SQLite · CSV

🔧 Development

Git · GitHub · VS Code

</div>

📁 Project Structure

clinical-pathway-platform/
│
├── backend/
│   ├── data/
│   │   └── doctors.json
│   ├── knowledge_base/
│   ├── services/
│   │   ├── ai_assistant.py
│   │   ├── briefing_generator.py
│   │   ├── clinical_pathway.py
│   │   ├── doctor_recommendation.py
│   │   ├── medical_extractor.py
│   │   ├── pathway_intelligence.py
│   │   ├── rag_service.py
│   │   └── risk_analyzer.py
│   └── main.py
│
├── big-data/
│   ├── event_log_loader.py
│   ├── pathway_discovery.py
│   ├── utilization_analysis.py
│   ├── deviation_detection.py
│   ├── bottleneck_detection.py
│   ├── pipeline.py
│   └── results/
│
├── datasets/
│   └── event_logs/
│
├── frontend/
│   └── app/
│       ├── analytics/
│       ├── components/
│       │   └── DoctorMap.tsx
│       ├── dashboard/
│       ├── map-test/
│       ├── page.tsx
│       └── globals.css
│
└── README.md

🚀 Getting Started

1️⃣ Clone

git clone https://github.com/ambasthashreya08-commits/Big-Data-Platform-for-Clinical-Pathway-Utilization-Analytics.git

cd Big-Data-Platform-for-Clinical-Pathway-Utilization-Analytics

2️⃣ Backend

cd backend

python -m venv venv

venv\Scripts\Activate.ps1

pip install -r requirements.txt

uvicorn main:app --reload --port 8000

Backend:

http://localhost:8000

Swagger:

http://localhost:8000/docs

3️⃣ Frontend

Open another terminal:

cd frontend

npm install

npm run dev

Frontend:

http://localhost:3000

4️⃣ Big Data Pipeline

From the project root:

cd big-data

python pipeline.py

Generated results are stored in:

big-data/results/

🔄 End-to-End Workflow

                    👤 PATIENT
                        │
                        ▼
                 📄 Medical PDF
                        │
                        ▼
              🔬 Parameter Extraction
                        │
                        ▼
                 ⚠️ Risk Analysis
                        │
                        ▼
                🧭 Clinical Pathway
                   │         │
                   │         └──────────────┐
                   ▼                        ▼
              🤖 AI Assistant       👨‍⚕️ Doctor Finder
                                             │
                                             ▼
                                      🗺️ Clinic Map


                 ─────────────────────────────


                 📊 EVENT LOG DATA
                        │
                        ▼
                 🔎 Pathway Discovery
                        │
             ┌──────────┼───────────┐
             ▼          ▼           ▼
          📈 Usage   ⚠️ Deviations  🚧 Bottlenecks
             │          │           │
             └──────────┼───────────┘
                        ▼
                 📊 Analytics Dashboard

🔮 Future Scope

The platform can be extended with:

⚡ Apache Spark distributed processing

📨 Apache Kafka real-time event ingestion

🗄️ Hadoop / HDFS storage

🐝 Hive analytical querying

🔬 Advanced process-mining algorithms

🔗 Automated pathway conformance analysis

🧠 Improved clinical knowledge retrieval

🌐 Multilingual healthcare assistance

🏥 Verified healthcare-provider APIs

📅 Real-time appointment availability

📍 Larger healthcare datasets

📊 Advanced resource utilization analytics

⚠️ Disclaimer

CAREBRIDGE is an academic/research prototype for healthcare analytics and decision-support experimentation.

It does not provide medical diagnosis, emergency medical advice, or guaranteed treatment recommendations.

Medical findings and healthcare-provider information should be verified with qualified healthcare professionals and the respective healthcare provider before making healthcare decisions.

🎓 Project Highlights

<div align="center">

📄 Unstructured Data

↓

🧠 AI + RAG

↓

🩺 Patient Intelligence

↓

🧭 Clinical Pathways

↓

📊 Big Data Analytics

↓

⚠️ Deviation & Bottleneck Detection

↓

👨‍⚕️ Doctor Discovery

↓

🗺️ Interactive Healthcare Map

</div>

<div align="center">

🩺 CAREBRIDGE

Bridging Patient Intelligence with Clinical Pathway Analytics

⭐ If you find this project interesting, consider giving the repository a star.

</div>
