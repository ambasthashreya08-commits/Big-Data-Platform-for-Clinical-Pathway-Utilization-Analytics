# ============================================================
# CLINICAL PATHWAY INTELLIGENCE
# ============================================================

def analyze_pathway_intelligence(
    medical_data,
    risk_analysis,
    clinical_pathway
):

    risk_results = risk_analysis.get(
        "results",
        []
    )

    pathway_steps = clinical_pathway.get(
        "clinical_pathway",
        []
    )

    # --------------------------------------------------------
    # Determine identified clinical areas
    # --------------------------------------------------------

    identified_areas = []

    for step in pathway_steps:

        area = step.get(
            "area",
            "Clinical Evaluation"
        )

        identified_areas.append(area)

    # --------------------------------------------------------
    # Expected pathway stages
    # --------------------------------------------------------

    expected_stages = [
        "Report Assessment",
        "Risk Identification",
        "Clinical Evaluation",
        "Follow-up",
        "Monitoring"
    ]

    # --------------------------------------------------------
    # Determine completed stages
    # --------------------------------------------------------

    completed_stages = []

    if medical_data:

        completed_stages.append(
            "Report Assessment"
        )

    if risk_results:

        completed_stages.append(
            "Risk Identification"
        )

    if pathway_steps:

        completed_stages.append(
            "Clinical Evaluation"
        )

    # Follow-up and monitoring are not automatically
    # considered completed because the uploaded report
    # may not contain this information.

    # --------------------------------------------------------
    # Calculate utilization score
    # --------------------------------------------------------

    utilization_score = round(
        (
            len(completed_stages)
            / len(expected_stages)
        ) * 100
    )

    # --------------------------------------------------------
    # Detect pathway deviations
    # --------------------------------------------------------

    deviations = []

    if "Clinical Evaluation" not in completed_stages:

        deviations.append({
            "stage": "Clinical Evaluation",
            "status": "Missing",
            "reason": (
                "The available report data does not "
                "contain sufficient evidence of a "
                "clinical evaluation step."
            )
        })

    if "Follow-up" not in completed_stages:

        deviations.append({
            "stage": "Follow-up",
            "status": "Not Available",
            "reason": (
                "Follow-up information was not available "
                "in the analyzed report."
            )
        })

    if "Monitoring" not in completed_stages:

        deviations.append({
            "stage": "Monitoring",
            "status": "Not Available",
            "reason": (
                "Longitudinal monitoring information "
                "was not available."
            )
        })

    # --------------------------------------------------------
    # Bottleneck detection
    # --------------------------------------------------------

    bottlenecks = []

    if "Follow-up" not in completed_stages:

        bottlenecks.append({
            "stage": "Follow-up",
            "severity": "Medium",
            "message": (
                "Follow-up information is unavailable "
                "for the current record."
            )
        })

    if "Monitoring" not in completed_stages:

        bottlenecks.append({
            "stage": "Monitoring",
            "severity": "Low",
            "message": (
                "Longitudinal monitoring data is "
                "not available in the current record."
            )
        })

    # --------------------------------------------------------
    # Explainability
    # --------------------------------------------------------

    explanation = []

    if risk_results:

        explanation.append(
            "Risk identification was triggered because "
            "medical parameters were successfully "
            "extracted and analyzed."
        )

    if identified_areas:

        explanation.append(
            "Clinical pathway areas were generated "
            "from the parameters and risk findings "
            "identified in the report."
        )

    if not explanation:

        explanation.append(
            "Insufficient information was available "
            "to generate detailed pathway reasoning."
        )

    # --------------------------------------------------------
    # Overall pathway status
    # --------------------------------------------------------

    if utilization_score >= 80:

        pathway_status = "High pathway completeness"

    elif utilization_score >= 60:

        pathway_status = "Moderate pathway completeness"

    else:

        pathway_status = "Limited pathway completeness"

    # --------------------------------------------------------
    # Return analytics
    # --------------------------------------------------------

    return {

        "expected_stages": expected_stages,

        "completed_stages": completed_stages,

        "utilization_score": utilization_score,

        "pathway_status": pathway_status,

        "identified_areas": identified_areas,

        "deviations": deviations,

        "bottlenecks": bottlenecks,

        "explainability": explanation

    }