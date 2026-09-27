# ============================================================
# DOCTOR RECOMMENDATION SERVICE
# ============================================================

import json
import os
from typing import Any, Dict, List


# ------------------------------------------------------------
# LOAD DOCTOR DATA
# ------------------------------------------------------------

def load_doctors() -> List[Dict[str, Any]]:
    """
    Load doctor information from the local JSON dataset.
    """

    base_dir = os.path.dirname(os.path.dirname(__file__))
    doctors_file = os.path.join(base_dir, "data", "doctors.json")

    try:
        with open(doctors_file, "r", encoding="utf-8") as file:
            return json.load(file)

    except Exception as error:
        print(f"Could not load doctors.json: {error}")
        return []


# ------------------------------------------------------------
# DETERMINE SPECIALIST
# ------------------------------------------------------------

def determine_specialist(
    medical_data: Dict[str, Any],
    risk_analysis: Dict[str, Any],
) -> Dict[str, Any]:

    """
    Determine the most relevant specialist category
    from the patient's extracted medical findings.

    This function does NOT diagnose the patient.
    It only identifies a potentially relevant specialist
    category for professional consultation.
    """

    findings = risk_analysis.get("findings", [])

    specialist = "General Physician"

    reason = (
        "A general physician can review the overall "
        "medical findings."
    )

    for finding in findings:

        parameter = str(
            finding.get("parameter", "")
        ).lower()

        # ----------------------------------------------------
        # DIABETES / GLUCOSE
        # ----------------------------------------------------

        if any(
            keyword in parameter
            for keyword in [
                "glucose",
                "blood sugar",
                "hba1c",
                "glycemic",
                "diabetes",
            ]
        ):

            specialist = "Endocrinologist / Diabetologist"

            reason = (
                "The report contains glucose-related findings "
                "that may be appropriate to discuss with an "
                "Endocrinologist or Diabetologist."
            )

            break

        # ----------------------------------------------------
        # LIPID / CHOLESTEROL
        # ----------------------------------------------------

        if any(
            keyword in parameter
            for keyword in [
                "cholesterol",
                "lipid",
                "ldl",
                "hdl",
                "triglyceride",
            ]
        ):

            specialist = (
                "Cardiologist / Internal Medicine Specialist"
            )

            reason = (
                "The report contains lipid-related findings "
                "that may be appropriate to discuss with a "
                "qualified medical professional."
            )

            break

        # ----------------------------------------------------
        # BLOOD PRESSURE
        # ----------------------------------------------------

        if any(
            keyword in parameter
            for keyword in [
                "blood pressure",
                "hypertension",
                "systolic",
                "diastolic",
            ]
        ):

            specialist = (
                "Cardiologist / General Physician"
            )

            reason = (
                "The report contains blood-pressure-related "
                "findings that may require professional review."
            )

            break

        # ----------------------------------------------------
        # THYROID
        # ----------------------------------------------------

        if any(
            keyword in parameter
            for keyword in [
                "thyroid",
                "tsh",
                "t3",
                "t4",
            ]
        ):

            specialist = "Endocrinologist"

            reason = (
                "The report contains thyroid-related findings "
                "that may be appropriate to discuss with an "
                "Endocrinologist."
            )

            break

    return {
        "specialist_category": specialist,
        "reason": reason,
    }


# ------------------------------------------------------------
# SPECIALIST MATCHING
# ------------------------------------------------------------

def specialist_matches(
    specialist_category: str,
    doctor_specialization: Any,
) -> bool:

    """
    Check whether a doctor's specialization matches
    the specialist category identified from the report.
    """

    category = specialist_category.lower()

    # Doctor specialization may be a list
    if isinstance(doctor_specialization, list):

        specializations = [
            str(item).lower()
            for item in doctor_specialization
        ]

    # Or it may be a string
    else:

        specializations = [
            str(doctor_specialization).lower()
        ]

    # --------------------------------------------------------
    # ENDocrinology / DIABETOLOGY
    # --------------------------------------------------------

    if "endocrinologist" in category:

        if any(
            "endocrinologist" in specialization
            or "diabetologist" in specialization
            for specialization in specializations
        ):
            return True

    # --------------------------------------------------------
    # DIABETOLOGY
    # --------------------------------------------------------

    if "diabetologist" in category:

        if any(
            "diabetologist" in specialization
            or "endocrinologist" in specialization
            for specialization in specializations
        ):
            return True

    # --------------------------------------------------------
    # CARDIOLOGY
    # --------------------------------------------------------

    if "cardiologist" in category:

        if any(
            "cardiologist" in specialization
            for specialization in specializations
        ):
            return True

    # --------------------------------------------------------
    # GENERAL PHYSICIAN
    # --------------------------------------------------------

    if "general physician" in category:

        if any(
            "general physician" in specialization
            or "internal medicine" in specialization
            for specialization in specializations
        ):
            return True

    return False


# ------------------------------------------------------------
# RECOMMEND DOCTORS
# ------------------------------------------------------------

def recommend_doctors(
    medical_data: Dict[str, Any],
    risk_analysis: Dict[str, Any],
    doctors: List[Dict[str, Any]] | None = None,
) -> Dict[str, Any]:

    """
    Determine the relevant specialist and return
    matching Bangalore doctors.
    """

    # --------------------------------------------------------
    # DETERMINE SPECIALIST
    # --------------------------------------------------------

    specialist_info = determine_specialist(
        medical_data,
        risk_analysis,
    )

    # --------------------------------------------------------
    # LOAD DOCTORS IF NOT PROVIDED
    # --------------------------------------------------------

    if doctors is None:
        doctors = load_doctors()

    # --------------------------------------------------------
    # FILTER MATCHING DOCTORS
    # --------------------------------------------------------

    matching_doctors = []

    for doctor in doctors:

        if specialist_matches(
            specialist_info["specialist_category"],
            doctor.get("specialization", []),
        ):

            matching_doctors.append(doctor)

    # --------------------------------------------------------
    # RESULT
    # --------------------------------------------------------

    return {

        "success": True,

        "location": "Bangalore",

        "specialist": specialist_info,

        "doctor_count": len(matching_doctors),

        "doctors": matching_doctors,

        "note": (
            "Doctor information is provided for consultation "
            "discovery only. Fees, timings, availability and "
            "appointment details may change. Please verify "
            "information with the clinic before visiting."
        ),
    }