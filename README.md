# CAREBRIDGE – Clinical Pathway Utilization Analytics Platform

> An intelligent clinical pathway platform that combines patient-level medical analysis with population-level clinical pathway analytics to understand treatment workflows, pathway utilization, deviations, bottlenecks, and healthcare resource requirements.

---

## 📌 Overview

**CAREBRIDGE** is a clinical pathway intelligence platform designed to analyze healthcare workflows from two perspectives:

1. **Patient-Level Intelligence** – Analyze an uploaded medical report, extract relevant medical parameters, perform risk analysis, generate a clinical pathway, and assist the patient in finding relevant doctors.

2. **Population-Level Clinical Pathway Analytics** – Analyze healthcare event logs to discover common clinical pathways, measure pathway utilization, detect deviations, identify temporal anomalies, and detect potential bottlenecks in healthcare workflows.

The platform combines **Artificial Intelligence, Retrieval-Augmented Generation (RAG), FastAPI, Next.js, Python, Pandas, FAISS, Sentence Transformers, and process-oriented healthcare analytics**.

---

# 🚀 Key Features

## 1. Medical Report Upload

Patients can upload their medical reports in PDF format.

The platform:

- Extracts text from medical reports
- Identifies relevant medical parameters
- Structures the extracted information
- Uses the extracted information for downstream clinical analysis

### Supported input

- PDF medical reports

---

## 2. Medical Parameter Extraction

CAREBRIDGE extracts clinically relevant parameters from uploaded reports.

Examples include:

- Blood glucose
- HbA1c
- Cholesterol
- LDL
- HDL
- Triglycerides
- Blood pressure
- Thyroid-related parameters
- Other relevant laboratory values

The extracted information is converted into structured data for further analysis.

---

# 🩺 3. Risk Analysis

The platform analyzes extracted medical parameters and identifies potential risk-related findings.

The risk analysis layer can identify conditions or risk indicators related to:

- Diabetes / elevated glucose
- Cardiovascular risk
- Blood pressure / hypertension
- Lipid abnormalities
- Thyroid-related abnormalities

The result is passed to the clinical pathway generation module.

> CAREBRIDGE is an analytics and decision-support prototype and does not replace professional medical diagnosis.

---

# 🧭 4. Personalized Clinical Pathway

Based on the extracted medical information and risk findings, CAREBRIDGE generates a patient-specific pathway describing possible next steps.

The pathway can include:

```text
Medical Report
      ↓
Parameter Extraction
      ↓
Risk Analysis
      ↓
Clinical Findings
      ↓
Suggested Next Steps
      ↓
Relevant Specialist
      ↓
Doctor Discovery
