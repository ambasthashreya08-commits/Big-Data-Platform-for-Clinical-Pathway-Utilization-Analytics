import re
from typing import Dict, Any


# ============================================================
# CAREBRIDGE MEDICAL PARAMETER EXTRACTOR
# ============================================================

PARAMETER_PATTERNS = {
    "Hemoglobin": [
        r"\b(?:hemoglobin|haemoglobin|hb)\b\s*[:\-]?\s*(\d+(?:\.\d+)?)"
    ],
    "HbA1c": [
        r"\b(?:hba1c|hb\s*a1c|glycated\s+hemoglobin)\b\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*%?"
    ],
    "Blood Glucose": [
        r"\b(?:blood\s+glucose|glucose|blood\s+sugar)\b\s*[:\-]?\s*(\d+(?:\.\d+)?)"
    ],
    "Fasting Glucose": [
        r"\b(?:fasting\s+(?:blood\s+)?glucose|fasting\s+(?:blood\s+)?sugar)\b\s*[:\-]?\s*(\d+(?:\.\d+)?)"
    ],
    "Total Cholesterol": [
        r"\b(?:total\s+cholesterol|cholesterol)\b\s*[:\-]?\s*(\d+(?:\.\d+)?)"
    ],
    "LDL Cholesterol": [
        r"\b(?:ldl(?:\s+cholesterol)?)\b\s*[:\-]?\s*(\d+(?:\.\d+)?)"
    ],
    "HDL Cholesterol": [
        r"\b(?:hdl(?:\s+cholesterol)?)\b\s*[:\-]?\s*(\d+(?:\.\d+)?)"
    ],
    "Triglycerides": [
        r"\b(?:triglycerides|triglyceride)\b\s*[:\-]?\s*(\d+(?:\.\d+)?)"
    ],
    "Creatinine": [
        r"\b(?:creatinine)\b\s*[:\-]?\s*(\d+(?:\.\d+)?)"
    ],
    "Urea": [
        r"\b(?:urea|blood\s+urea)\b\s*[:\-]?\s*(\d+(?:\.\d+)?)"
    ],
    "TSH": [
        r"\b(?:tsh|thyroid\s+stimulating\s+hormone)\b\s*[:\-]?\s*(\d+(?:\.\d+)?)"
    ],
    "T3": [
        r"\b(?:t3|triiodothyronine)\b\s*[:\-]?\s*(\d+(?:\.\d+)?)"
    ],
    "T4": [
        r"\b(?:t4|thyroxine)\b\s*[:\-]?\s*(\d+(?:\.\d+)?)"
    ],
    "Platelets": [
        r"\b(?:platelets|platelet\s+count)\b\s*[:\-]?\s*(\d+(?:\.\d+)?)"
    ],
    "WBC": [
        r"\b(?:wbc|white\s+blood\s+cell(?:s)?)\b\s*[:\-]?\s*(\d+(?:\.\d+)?)"
    ],
    "RBC": [
        r"\b(?:rbc|red\s+blood\s+cell(?:s)?)\b\s*[:\-]?\s*(\d+(?:\.\d+)?)"
    ],
    "ALT": [
        r"\b(?:alt|sgpt)\b\s*[:\-]?\s*(\d+(?:\.\d+)?)"
    ],
    "AST": [
        r"\b(?:ast|sgot)\b\s*[:\-]?\s*(\d+(?:\.\d+)?)"
    ],
    "Bilirubin": [
        r"\b(?:total\s+bilirubin|bilirubin)\b\s*[:\-]?\s*(\d+(?:\.\d+)?)"
    ],
    "Systolic BP": [
        r"\b(?:systolic(?:\s+blood\s+pressure)?)\b\s*[:\-]?\s*(\d+(?:\.\d+)?)"
    ],
    "Diastolic BP": [
        r"\b(?:diastolic(?:\s+blood\s+pressure)?)\b\s*[:\-]?\s*(\d+(?:\.\d+)?)"
    ],
}


REFERENCE_RANGES = {
    "Hemoglobin": {
        "unit": "g/dL",
        "low": 12,
        "high": 17.5,
    },
    "HbA1c": {
        "unit": "%",
        "low": 4,
        "high": 5.6,
    },
    "Blood Glucose": {
        "unit": "mg/dL",
        "low": 70,
        "high": 140,
    },
    "Fasting Glucose": {
        "unit": "mg/dL",
        "low": 70,
        "high": 99,
    },
    "Total Cholesterol": {
        "unit": "mg/dL",
        "low": 0,
        "high": 200,
    },
    "LDL Cholesterol": {
        "unit": "mg/dL",
        "low": 0,
        "high": 100,
    },
    "HDL Cholesterol": {
        "unit": "mg/dL",
        "low": 40,
        "high": 1000,
    },
    "Triglycerides": {
        "unit": "mg/dL",
        "low": 0,
        "high": 150,
    },
    "Creatinine": {
        "unit": "mg/dL",
        "low": 0.6,
        "high": 1.3,
    },
    "Urea": {
        "unit": "mg/dL",
        "low": 15,
        "high": 45,
    },
    "TSH": {
        "unit": "mIU/L",
        "low": 0.4,
        "high": 4.0,
    },
    "Platelets": {
        "unit": "10^3/µL",
        "low": 150,
        "high": 450,
    },
    "WBC": {
        "unit": "10^3/µL",
        "low": 4,
        "high": 11,
    },
    "RBC": {
        "unit": "10^6/µL",
        "low": 4,
        "high": 6,
    },
    "ALT": {
        "unit": "U/L",
        "low": 7,
        "high": 56,
    },
    "AST": {
        "unit": "U/L",
        "low": 10,
        "high": 40,
    },
    "Bilirubin": {
        "unit": "mg/dL",
        "low": 0.1,
        "high": 1.2,
    },
    "Systolic BP": {
        "unit": "mmHg",
        "low": 90,
        "high": 120,
    },
    "Diastolic BP": {
        "unit": "mmHg",
        "low": 60,
        "high": 80,
    },
}


def clean_text(text: str) -> str:
    """
    Normalize PDF-extracted text.
    """

    if not text:
        return ""

    text = text.replace("\xa0", " ")
    text = text.replace("\r", "\n")

    # Normalize repeated whitespace while preserving line structure.
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


def find_parameter(text: str, patterns):
    """
    Try multiple regex patterns for a parameter.
    """

    for pattern in patterns:
        match = re.search(
            pattern,
            text,
            flags=re.IGNORECASE
        )

        if match:
            try:
                return float(match.group(1))
            except (ValueError, IndexError):
                return None

    return None


def determine_status(parameter: str, value: float) -> str:
    """
    Basic rule-based classification.

    IMPORTANT:
    This is a screening/organization layer.
    It is not a medical diagnosis.
    """

    if parameter == "HbA1c":
        if value >= 9:
            return "high"
        if value >= 6.5:
            return "attention"
        return "normal"

    if parameter == "Fasting Glucose":
        if value >= 126:
            return "high"
        if value >= 100:
            return "attention"
        return "normal"

    if parameter == "LDL Cholesterol":
        if value >= 190:
            return "high"
        if value >= 130:
            return "attention"
        return "normal"

    if parameter == "Triglycerides":
        if value >= 500:
            return "high"
        if value >= 150:
            return "attention"
        return "normal"

    if parameter == "Systolic BP":
        if value >= 180:
            return "high"
        if value >= 140:
            return "attention"
        return "normal"

    if parameter == "Diastolic BP":
        if value >= 120:
            return "high"
        if value >= 90:
            return "attention"
        return "normal"

    if parameter == "Hemoglobin":
        if value < 8:
            return "high"
        if value < 12:
            return "attention"
        return "normal"

    if parameter == "Platelets":
        if value < 50 or value > 1000:
            return "high"
        if value < 150 or value > 450:
            return "attention"
        return "normal"

    if parameter == "WBC":
        if value < 2 or value > 20:
            return "high"
        if value < 4 or value > 11:
            return "attention"
        return "normal"

    if parameter == "Creatinine":
        if value > 3:
            return "high"
        if value > 1.3:
            return "attention"
        return "normal"

    if parameter == "TSH":
        if value < 0.1 or value > 10:
            return "high"
        if value < 0.4 or value > 4:
            return "attention"
        return "normal"

    if parameter == "ALT":
        if value > 200:
            return "high"
        if value > 56:
            return "attention"
        return "normal"

    if parameter == "AST":
        if value > 200:
            return "high"
        if value > 40:
            return "attention"
        return "normal"

    return "unknown"


def extract_medical_parameters(text: str) -> Dict[str, Any]:
    """
    Extract structured medical parameters from PDF text.

    Returns a consistent structure that can be consumed by:
        - risk_analyzer.py
        - FastAPI
        - Next.js dashboard
    """

    text = clean_text(text)

    results = {}

    if not text:
        return {
            "parameters": {},
            "total_parameters": 0,
            "message": "No readable text was extracted from the PDF."
        }

    for parameter, patterns in PARAMETER_PATTERNS.items():

        value = find_parameter(
            text,
            patterns
        )

        if value is None:
            continue

        reference = REFERENCE_RANGES.get(
            parameter,
            {}
        )

        status = determine_status(
            parameter,
            value
        )

        results[parameter] = {
            "value": value,
            "unit": reference.get("unit"),
            "reference_low": reference.get("low"),
            "reference_high": reference.get("high"),
            "status": status,
        }

    return {
        "parameters": results,
        "total_parameters": len(results),
        "message": (
            "Medical parameters extracted successfully."
            if results
            else "No supported medical parameters were detected."
        )
    }