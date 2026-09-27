# ============================================================
# CLINICAL PATHWAY ANALYTICS API
# ============================================================

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from services.ai_assistant import router as ai_assistant_router
from services.medical_extractor import extract_medical_parameters
from services.risk_analyzer import analyze_risks
from services.clinical_pathway import generate_clinical_pathway
from services.pathway_intelligence import analyze_pathway_intelligence
from services.doctor_recommendation import recommend_doctors

from pypdf import PdfReader

import gzip
import io
import math
import xml.etree.ElementTree as ET
from pathlib import Path

import numpy as np
import pandas as pd


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

ANALYTICS_RESULTS_DIR = BASE_DIR / "big-data" / "results"

EVENT_LOG_PATH = (
    BASE_DIR
    / "datasets"
    / "event_logs"
    / "Sepsis Cases - Event Log.xes.gz"
)


# ============================================================
# JSON SANITIZATION
# ============================================================

def sanitize_for_json(value):

    if isinstance(value, dict):
        return {
            str(key): sanitize_for_json(val)
            for key, val in value.items()
        }

    if isinstance(value, (list, tuple)):
        return [
            sanitize_for_json(item)
            for item in value
        ]

    if isinstance(value, np.generic):
        value = value.item()

    if isinstance(value, float) and not math.isfinite(value):
        return None

    return value


# ============================================================
# EVENT-LOG METADATA
# ============================================================

def get_event_log_metadata():
    """
    Reads lightweight metadata from the existing XES event log.

    This does NOT replace the Big Data pipeline.
    The pipeline still generates pathway, utilization,
    deviation and bottleneck results.

    This function only exposes dataset size information
    to the API and UI.
    """

    if not EVENT_LOG_PATH.exists():
        return {
            "name": EVENT_LOG_PATH.name,
            "total_events": 0,
            "unique_cases": 0,
            "unique_activities": 0,
            "available": False,
        }

    total_events = 0
    case_ids = set()
    activities = set()

    try:

        with gzip.open(EVENT_LOG_PATH, "rb") as stream:

            for event, elem in ET.iterparse(
                stream,
                events=("end",)
            ):

                tag = elem.tag.split("}")[-1]

                if tag != "event":
                    continue

                total_events += 1

                case_id = None
                activity = None

                for child in elem:

                    child_tag = child.tag.split("}")[-1]

                    if child_tag != "string":
                        continue

                    key = child.attrib.get("key")
                    value = child.attrib.get("value")

                    if key in (
                        "case:concept:name",
                        "case_id"
                    ):
                        case_id = value

                    elif key in (
                        "concept:name",
                        "activity"
                    ):
                        activity = value

                if case_id:
                    case_ids.add(case_id)

                if activity:
                    activities.add(activity)

                elem.clear()

        return {
            "name": EVENT_LOG_PATH.name,
            "total_events": total_events,
            "unique_cases": len(case_ids),
            "unique_activities": len(activities),
            "available": True,
        }

    except Exception as error:

        return {
            "name": EVENT_LOG_PATH.name,
            "total_events": 0,
            "unique_cases": 0,
            "unique_activities": 0,
            "available": False,
            "error": str(error),
        }


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="Clinical Pathway Analytics API",
    description=(
        "AI-powered clinical pathway analytics "
        "and patient-friendly medical report platform"
    ),
    version="2.0.0",
)


app.include_router(ai_assistant_router)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "success": True,
        "message": "Clinical Pathway Analytics API is running",
        "version": "2.0.0",

        "features": [
            "PDF medical report extraction",
            "Medical parameter extraction",
            "Risk analysis",
            "Clinical pathway generation",
            "Pathway intelligence analytics",
            "Population-level pathway discovery",
            "Pathway utilization analysis",
            "Deviation detection",
            "Bottleneck detection",
            "Explainable analytics",
        ],
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():

    return {
        "status": "healthy",
        "service": "Clinical Pathway Analytics API",
        "version": "2.0.0",
    }


# ============================================================
# UPLOAD AND ANALYZE MEDICAL REPORT
# ============================================================

@app.post("/upload-report")
async def upload_report(
    file: UploadFile = File(...)
):

    if file.content_type != "application/pdf":

        return {
            "success": False,
            "message": "Please upload a PDF medical report.",
        }

    try:

        file_bytes = await file.read()

        if not file_bytes:

            return {
                "success": False,
                "message": "The uploaded PDF is empty.",
            }

        pdf = PdfReader(
            io.BytesIO(file_bytes)
        )

        extracted_text = ""

        for page in pdf.pages:

            try:

                text = page.extract_text()

                if text:
                    extracted_text += text + "\n"

            except Exception:
                continue

        if not extracted_text.strip():

            return {
                "success": False,
                "message": (
                    "The PDF could not be read as text. "
                    "It may be a scanned image PDF and "
                    "may require OCR."
                ),
                "filename": file.filename,
                "pages": len(pdf.pages),
            }

        # ----------------------------------------------------
        # Medical Parameter Extraction
        # ----------------------------------------------------

        medical_data = extract_medical_parameters(
            extracted_text
        )

        # ----------------------------------------------------
        # Risk Analysis
        # ----------------------------------------------------

        risk_analysis = analyze_risks(
            medical_data
        )

        # ----------------------------------------------------
        # Clinical Pathway Generation
        # ----------------------------------------------------

        clinical_pathway = generate_clinical_pathway(
            medical_data,
            risk_analysis
        )

        # ----------------------------------------------------
        # Pathway Intelligence
        # ----------------------------------------------------

        pathway_intelligence = analyze_pathway_intelligence(
            medical_data,
            risk_analysis,
            clinical_pathway
        )

        return {
            "success": True,
            "filename": file.filename,
            "pages": len(pdf.pages),

            "medical_data": medical_data,

            "risk_analysis": risk_analysis,

            "clinical_pathway": clinical_pathway,

            "pathway_intelligence": pathway_intelligence,

            "extracted_text": extracted_text,
        }

    except Exception as error:

        return {
            "success": False,
            "message": (
                f"Could not process PDF: {str(error)}"
            ),
        }


# ============================================================
# POPULATION-LEVEL BIG DATA ANALYTICS
# ============================================================

@app.get("/analytics")
def get_analytics():

    try:

        if not ANALYTICS_RESULTS_DIR.exists():

            return {
                "success": False,
                "message": (
                    "Analytics results directory not found."
                ),
                "path": str(
                    ANALYTICS_RESULTS_DIR
                ),
            }

        # ----------------------------------------------------
        # Result Files
        # ----------------------------------------------------

        pathway_file = (
            ANALYTICS_RESULTS_DIR
            / "pathway_variants.csv"
        )

        duration_file = (
            ANALYTICS_RESULTS_DIR
            / "pathway_durations.csv"
        )

        transition_file = (
            ANALYTICS_RESULTS_DIR
            / "transitions.csv"
        )

        deviation_file = (
            ANALYTICS_RESULTS_DIR
            / "deviations.csv"
        )

        bottleneck_file = (
            ANALYTICS_RESULTS_DIR
            / "bottlenecks.csv"
        )

        required_files = {
            "pathway_variants": pathway_file,
            "pathway_durations": duration_file,
            "transitions": transition_file,
            "deviations": deviation_file,
            "bottlenecks": bottleneck_file,
        }

        missing_files = [
            name
            for name, path in required_files.items()
            if not path.exists()
        ]

        if missing_files:

            return {
                "success": False,
                "message": (
                    "Some analytics result files "
                    "are missing."
                ),
                "missing_files": missing_files,
            }

        # ----------------------------------------------------
        # Load CSV Files
        # ----------------------------------------------------

        pathway_df = pd.read_csv(
            pathway_file
        )

        duration_df = pd.read_csv(
            duration_file
        )

        transition_df = pd.read_csv(
            transition_file
        )

        deviation_df = pd.read_csv(
            deviation_file
        )

        bottleneck_df = pd.read_csv(
            bottleneck_file
        )

        # ----------------------------------------------------
        # Dataset Metadata
        # ----------------------------------------------------

        dataset = get_event_log_metadata()

        total_cases = len(duration_df)

        total_pathway_variants = len(
            pathway_df
        )

        total_transitions = len(
            transition_df
        )

        # ----------------------------------------------------
        # Bottlenecks
        # ----------------------------------------------------

        bottlenecks_detected = 0

        if "bottleneck" in bottleneck_df.columns:

            bottleneck_values = (
                bottleneck_df["bottleneck"]
                .astype(str)
                .str.lower()
                .str.strip()
            )

            bottlenecks_detected = int(
                (
                    bottleneck_values == "true"
                ).sum()
            )

        # ----------------------------------------------------
        # Temporal Outliers
        # ----------------------------------------------------

        temporal_outlier_percentage = 0.0

        if "temporal_outlier" in deviation_df.columns:

            temporal_values = (
                deviation_df["temporal_outlier"]
                .astype(str)
                .str.lower()
                .str.strip()
            )

            temporal_outliers = (
                temporal_values == "true"
            )

            if len(deviation_df) > 0:

                temporal_outlier_percentage = (
                    temporal_outliers.sum()
                    / len(deviation_df)
                    * 100
                )

        # ----------------------------------------------------
        # Duration
        # ----------------------------------------------------

        median_duration = 0.0
        mean_duration = 0.0

        if "duration_hours" in duration_df.columns:

            median_duration = float(
                duration_df[
                    "duration_hours"
                ].median()
            )

            mean_duration = float(
                duration_df[
                    "duration_hours"
                ].mean()
            )

        # ----------------------------------------------------
        # Top Pathway
        # ----------------------------------------------------

        top_pathway = None

        if len(pathway_df) > 0:

            row = pathway_df.iloc[0]

            top_pathway = {
                "pathway_id": str(
                    row.get(
                        "pathway_id",
                        ""
                    )
                ),

                "frequency": int(
                    row.get(
                        "frequency",
                        0
                    )
                ),

                "utilization_percentage": float(
                    row.get(
                        "utilization_percentage",
                        0
                    )
                ),

                "pathway": str(
                    row.get(
                        "pathway",
                        ""
                    )
                ),
            }

        # ----------------------------------------------------
        # Detected Bottlenecks
        # ----------------------------------------------------

        detected_bottlenecks = []

        if "bottleneck" in bottleneck_df.columns:

            values = (
                bottleneck_df["bottleneck"]
                .astype(str)
                .str.lower()
                .str.strip()
            )

            detected_bottlenecks = (
                bottleneck_df[
                    values == "true"
                ]
                .to_dict(
                    orient="records"
                )
            )

        # ----------------------------------------------------
        # Complete Response
        # ----------------------------------------------------

        response = {

            "success": True,

            "dataset": dataset,

            "summary": {

                "total_cases": total_cases,

                "total_events": dataset[
                    "total_events"
                ],

                "unique_activities": dataset[
                    "unique_activities"
                ],

                "total_pathway_variants":
                    total_pathway_variants,

                "total_transitions":
                    total_transitions,

                "temporal_outlier_percentage":
                    round(
                        temporal_outlier_percentage,
                        2,
                    ),

                "median_duration_hours":
                    round(
                        median_duration,
                        2,
                    ),

                "mean_duration_hours":
                    round(
                        mean_duration,
                        2,
                    ),

                "bottlenecks_detected":
                    bottlenecks_detected,
            },

            "pathway_discovery": {

                "total_variants":
                    total_pathway_variants,

                "top_pathway":
                    top_pathway,

                "pathways":
                    pathway_df.to_dict(
                        orient="records"
                    ),
            },

            "utilization": {

                "median_duration_hours":
                    round(
                        median_duration,
                        2,
                    ),

                "mean_duration_hours":
                    round(
                        mean_duration,
                        2,
                    ),

                "durations":
                    duration_df.to_dict(
                        orient="records"
                    ),

                "transitions":
                    transition_df.to_dict(
                        orient="records"
                    ),

                "top_transitions":
                    transition_df.head(20).to_dict(
                        orient="records"
                    ),
            },

            "deviations":
                deviation_df.to_dict(
                    orient="records"
                ),

            "bottlenecks": {

                "total_detected":
                    bottlenecks_detected,

                "detected":
                    detected_bottlenecks,

                "all":
                    bottleneck_df.to_dict(
                        orient="records"
                    ),
            },
        }

        return sanitize_for_json(
            response
        )

    except Exception as error:

        return {
            "success": False,
            "message": (
                f"Could not load analytics: "
                f"{str(error)}"
            ),
        }


# ============================================================
# PATIENT + POPULATION CONTEXT
# ============================================================

@app.post("/patient-context")
def patient_context(
    patient_pathway: dict
):

    try:

        # ----------------------------------------------------
        # Load Existing Population Analytics
        # ----------------------------------------------------

        pathway_file = (
            ANALYTICS_RESULTS_DIR
            / "pathway_variants.csv"
        )

        duration_file = (
            ANALYTICS_RESULTS_DIR
            / "pathway_durations.csv"
        )

        transition_file = (
            ANALYTICS_RESULTS_DIR
            / "transitions.csv"
        )

        deviation_file = (
            ANALYTICS_RESULTS_DIR
            / "deviations.csv"
        )

        bottleneck_file = (
            ANALYTICS_RESULTS_DIR
            / "bottlenecks.csv"
        )

        required_files = [
            pathway_file,
            duration_file,
            transition_file,
            deviation_file,
            bottleneck_file,
        ]

        missing_files = [
            str(path)
            for path in required_files
            if not path.exists()
        ]

        if missing_files:

            return {
                "success": False,
                "message": (
                    "Some population analytics "
                    "files are missing."
                ),
                "missing_files": missing_files,
            }

        pathway_df = pd.read_csv(
            pathway_file
        )

        duration_df = pd.read_csv(
            duration_file
        )

        transition_df = pd.read_csv(
            transition_file
        )

        deviation_df = pd.read_csv(
            deviation_file
        )

        bottleneck_df = pd.read_csv(
            bottleneck_file
        )

        dataset = get_event_log_metadata()

        # ----------------------------------------------------
        # Patient-Level Information
        # ----------------------------------------------------

        priority = patient_pathway.get(
            "priority",
            "ROUTINE"
        )

        specialist = patient_pathway.get(
            "primary_specialist_category"
        )

        clinical_steps = patient_pathway.get(
            "clinical_pathway",
            []
        )

        follow_up = patient_pathway.get(
            "follow_up",
            []
        )

        # Extract patient pathway areas

        patient_areas = [
            step.get("area")
            for step in clinical_steps
            if isinstance(step, dict)
            and step.get("area")
        ]

        # ----------------------------------------------------
        # Population Summary
        # ----------------------------------------------------

        bottlenecks_detected = 0

        if "bottleneck" in bottleneck_df.columns:

            bottleneck_values = (
                bottleneck_df["bottleneck"]
                .astype(str)
                .str.lower()
                .str.strip()
            )

            bottlenecks_detected = int(
                (
                    bottleneck_values == "true"
                ).sum()
            )

        population_summary = {

            "total_cases":
                len(duration_df),

            "total_events":
                dataset.get(
                    "total_events",
                    0
                ),

            "unique_activities":
                dataset.get(
                    "unique_activities",
                    0
                ),

            "pathway_variants":
                len(pathway_df),

            "candidate_transitions":
                len(transition_df),

            "bottlenecks_detected":
                bottlenecks_detected,
        }

        # ----------------------------------------------------
        # Top Population Pathways
        # ----------------------------------------------------

        top_pathways = (
            pathway_df
            .head(5)
            .to_dict(
                orient="records"
            )
        )

        # ----------------------------------------------------
        # Top Population Transitions
        # ----------------------------------------------------

        top_transitions = (
            transition_df
            .head(10)
            .to_dict(
                orient="records"
            )
        )

        # ----------------------------------------------------
        # Detected Bottlenecks
        # ----------------------------------------------------

        bottlenecks = []

        if "bottleneck" in bottleneck_df.columns:

            mask = (
                bottleneck_df["bottleneck"]
                .astype(str)
                .str.lower()
                .str.strip()
                == "true"
            )

            bottlenecks = (
                bottleneck_df[mask]
                .head(10)
                .to_dict(
                    orient="records"
                )
            )

        # ----------------------------------------------------
        # Patient + Population Response
        # ----------------------------------------------------

        response = {

            "success": True,

            "patient": {

                "priority":
                    priority,

                "specialist_category":
                    specialist,

                "pathway_areas":
                    patient_areas,

                "follow_up":
                    follow_up,
            },

            "population":
                population_summary,

            "top_pathways":
                top_pathways,

            "top_transitions":
                top_transitions,

            "bottlenecks":
                bottlenecks,

            "note": (
                "Population-level analytics are "
                "calculated from the clinical "
                "event-log dataset. They are not "
                "generated from the uploaded medical "
                "report."
            ),
        }

        return sanitize_for_json(
            response
        )

    except Exception as error:

        return {
            "success": False,
            "message": (
                f"Could not generate patient "
                f"context: {str(error)}"
            ),
        }


# ============================================================
# API INFORMATION
# ============================================================

@app.get("/api-info")
def api_info():

    return {

        "application":
            "Clinical Pathway Analytics",

        "version":
            "2.0.0",

        "description": (
            "A clinical report analytics platform "
            "designed to transform complex medical "
            "reports into understandable insights "
            "and expose population-level clinical "
            "pathway intelligence."
        ),

        "endpoints": {

            "root":
                "/",

            "health":
                "/health",

            "upload_report":
                "/upload-report",

            "analytics":
                "/analytics",

            "patient_context":
                "/patient-context",

            "documentation":
                "/docs",
        },

        "analysis_pipeline": [

            "PDF Upload",

            "PDF Text Extraction",

            "Medical Parameter Extraction",

            "Risk Analysis",

            "Clinical Pathway Generation",

            "Pathway Intelligence",

            "Patient + Population Context",

            "Population-Level Pathway Discovery",

            "Pathway Utilization Analysis",

            "Deviation Detection",

            "Bottleneck Detection",

            "Patient-Friendly Interpretation",
        ],
    }
# ============================================================
# DOCTOR RECOMMENDATIONS
# ============================================================

@app.post("/doctor-recommendations")
def doctor_recommendations(patient_data: dict):

    try:
        medical_data = patient_data.get("medical_data", {})
        risk_analysis = patient_data.get("risk_analysis", {})

        result = recommend_doctors(
    medical_data=medical_data,
    risk_analysis=risk_analysis
)

        return sanitize_for_json(result)

    except Exception as error:
        return {
            "success": False,
            "message": f"Could not generate doctor recommendations: {str(error)}"
        }