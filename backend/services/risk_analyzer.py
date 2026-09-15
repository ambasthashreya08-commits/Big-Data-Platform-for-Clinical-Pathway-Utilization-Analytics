from typing import Dict, Any, List


# ============================================================
# CAREBRIDGE RISK ANALYZER
# ============================================================

PARAMETER_EXPLANATIONS = {
    "Hemoglobin":
        "Hemoglobin helps carry oxygen through the body.",

    "HbA1c":
        "HbA1c provides an indication of average blood glucose over time.",

    "Blood Glucose":
        "Blood glucose measures the amount of glucose in the blood.",

    "Fasting Glucose":
        "Fasting glucose measures blood glucose after a period without food.",

    "Total Cholesterol":
        "Total cholesterol is one part of cardiovascular risk assessment.",

    "LDL Cholesterol":
        "LDL cholesterol is one of the measurements used when assessing cardiovascular health.",

    "HDL Cholesterol":
        "HDL cholesterol is commonly considered alongside other cholesterol measurements.",

    "Triglycerides":
        "Triglycerides are a type of fat measured in the blood.",

    "Creatinine":
        "Creatinine is commonly used as part of kidney function assessment.",

    "Urea":
        "Urea is commonly considered as part of kidney and metabolic assessment.",

    "TSH":
        "TSH is a measurement used when assessing thyroid function.",

    "Platelets":
        "Platelets play an important role in blood clotting.",

    "WBC":
        "White blood cells are part of the body's immune system.",

    "RBC":
        "Red blood cells carry oxygen through the body.",

    "ALT":
        "ALT is an enzyme commonly considered when assessing liver health.",

    "AST":
        "AST is an enzyme commonly considered when assessing liver and other tissue health.",

    "Bilirubin":
        "Bilirubin is a substance commonly assessed as part of liver and blood investigations.",

    "Systolic BP":
        "Systolic blood pressure is the pressure in the arteries when the heart contracts.",

    "Diastolic BP":
        "Diastolic blood pressure is the pressure in the arteries between heartbeats.",
}


def analyze_risks(
    medical_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Analyze extracted medical parameters using transparent,
    rule-based screening logic.

    This is NOT a diagnosis engine.
    """

    parameters = medical_data.get(
        "parameters",
        {}
    )

    findings: List[Dict[str, Any]] = []

    high_count = 0
    attention_count = 0
    normal_count = 0

    for name, data in parameters.items():

        value = data.get("value")
        unit = data.get("unit")

        status = data.get(
            "status",
            "unknown"
        )

        if status == "high":
            priority = "high"
            high_count += 1

        elif status == "attention":
            priority = "moderate"
            attention_count += 1

        elif status == "normal":
            priority = "low"
            normal_count += 1

        else:
            priority = "unknown"

        findings.append({
            "parameter": name,
            "value": value,
            "unit": unit,
            "status": status,
            "priority": priority,
            "explanation": PARAMETER_EXPLANATIONS.get(
                name,
                "This parameter should be interpreted using the laboratory reference range and individual clinical context."
            ),
            "recommended_discussion": get_discussion_message(
                name,
                status
            ),
        })

    # --------------------------------------------------------
    # Overall pathway
    # --------------------------------------------------------

    if high_count > 0:
        overall_status = "priority_review"

        overall_message = (
            "Some extracted findings have been flagged for "
            "higher-priority professional review."
        )

    elif attention_count > 0:
        overall_status = "discussion"

        overall_message = (
            "Some extracted findings may benefit from discussion "
            "with a healthcare professional."
        )

    elif normal_count > 0:
        overall_status = "routine_review"

        overall_message = (
            "No high-priority flags were identified by the "
            "current rule-based screening layer."
        )

    else:
        overall_status = "insufficient_data"

        overall_message = (
            "There was not enough structured information to "
            "generate a meaningful screening summary."
        )

    return {
        "overall_status": overall_status,

        "overall_message": overall_message,

        "summary": {
            "total_parameters": len(parameters),
            "high_priority": high_count,
            "attention": attention_count,
            "normal": normal_count,
        },

        "findings": findings,

        "pathway": build_pathway(
            overall_status
        ),

        "safety_note": (
            "CAREBRIDGE provides educational and patient-navigation "
            "information. These rules do not diagnose disease and "
            "should not be used to make treatment decisions."
        ),
    }


def get_discussion_message(
    parameter: str,
    status: str
) -> str:

    if status == "high":
        return (
            f"Ask your healthcare professional how the reported "
            f"{parameter} value should be interpreted in your "
            f"individual situation and whether follow-up is needed."
        )

    if status == "attention":
        return (
            f"Ask your healthcare professional whether the "
            f"{parameter} result should be monitored, repeated, "
            f"or interpreted together with other results."
        )

    if status == "normal":
        return (
            f"Ask your healthcare professional whether this "
            f"{parameter} result should be considered alongside "
            f"your symptoms, history, and other results."
        )

    return (
        f"Ask your healthcare professional to interpret the "
        f"{parameter} result using the laboratory's reference range."
    )


def build_pathway(
    overall_status: str
) -> List[Dict[str, str]]:

    if overall_status == "priority_review":

        return [
            {
                "stage": "Report",
                "status": "complete",
                "description": "Report processed",
            },
            {
                "stage": "Findings",
                "status": "complete",
                "description": "Higher-priority findings identified",
            },
            {
                "stage": "Professional Review",
                "status": "current",
                "description": "Discuss flagged information with a healthcare professional",
            },
            {
                "stage": "Care Discussion",
                "status": "next",
                "description": "Understand professional recommendations",
            },
            {
                "stage": "Follow-up",
                "status": "next",
                "description": "Track future results when advised",
            },
        ]

    if overall_status == "discussion":

        return [
            {
                "stage": "Report",
                "status": "complete",
                "description": "Report processed",
            },
            {
                "stage": "Findings",
                "status": "complete",
                "description": "Potential discussion points identified",
            },
            {
                "stage": "Professional Review",
                "status": "current",
                "description": "Put the findings into personal clinical context",
            },
            {
                "stage": "Care Discussion",
                "status": "next",
                "description": "Discuss appropriate next steps",
            },
            {
                "stage": "Follow-up",
                "status": "next",
                "description": "Keep future reports for comparison",
            },
        ]

    return [
        {
            "stage": "Report",
            "status": "complete",
            "description": "Report processed",
        },
        {
            "stage": "Findings",
            "status": "complete",
            "description": "Available parameters organized",
        },
        {
            "stage": "Professional Review",
            "status": "current",
            "description": "Review the report with your healthcare professional",
        },
        {
            "stage": "Care Discussion",
            "status": "next",
            "description": "Understand recommendations",
        },
        {
            "stage": "Follow-up",
            "status": "next",
            "description": "Monitor when advised",
        },
    ]