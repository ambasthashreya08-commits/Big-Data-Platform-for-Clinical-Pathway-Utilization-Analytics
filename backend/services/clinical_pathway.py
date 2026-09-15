def generate_clinical_pathway(medical_data, risk_analysis):

    pathway = {
        "priority": "ROUTINE",
        "primary_specialist_category": None,
        "clinical_pathway": [],
        "follow_up": [],
        "reasoning": []
    }

    results = risk_analysis.get("results", [])

    high_risk_parameters = [
        item for item in results
        if item.get("risk_level") == "HIGH"
    ]

    moderate_risk_parameters = [
        item for item in results
        if item.get("risk_level") == "MODERATE"
    ]

    # --------------------------------------------------
    # Blood Pressure Pathway
    # --------------------------------------------------

    bp = medical_data.get("blood_pressure")

    if bp:
        systolic = bp["systolic"]
        diastolic = bp["diastolic"]

        if systolic >= 140 or diastolic >= 90:

            pathway["clinical_pathway"].append({
                "area": "Blood Pressure",
                "next_step": "Clinical evaluation of elevated blood pressure",
                "specialist_category": "Primary Care / Internal Medicine"
            })

            pathway["reasoning"].append(
                "Blood pressure is above the prototype threshold "
                "used for pathway routing."
            )

    # --------------------------------------------------
    # Glucose / HbA1c Pathway
    # --------------------------------------------------

    hba1c = medical_data.get("hba1c")

    if hba1c is not None:

        if hba1c >= 6.5:

            pathway["clinical_pathway"].append({
                "area": "Glycemic Control",
                "next_step": "Clinical evaluation of elevated HbA1c",
                "specialist_category": "Primary Care / Internal Medicine"
            })

            pathway["reasoning"].append(
                "HbA1c is in a range requiring clinical evaluation."
            )

        elif hba1c >= 5.7:

            pathway["clinical_pathway"].append({
                "area": "Glycemic Control",
                "next_step": "Follow-up assessment of elevated HbA1c",
                "specialist_category": "Primary Care / Internal Medicine"
            })

            pathway["reasoning"].append(
                "HbA1c is above the normal range used for this prototype."
            )

    # --------------------------------------------------
    # Lipid Pathway
    # --------------------------------------------------

    ldl = medical_data.get("ldl")
    triglycerides = medical_data.get("triglycerides")
    hdl = medical_data.get("hdl")

    lipid_issue = False

    if ldl is not None and ldl >= 160:
        lipid_issue = True

    if triglycerides is not None and triglycerides >= 200:
        lipid_issue = True

    if hdl is not None and hdl < 40:
        lipid_issue = True

    if lipid_issue:

        pathway["clinical_pathway"].append({
            "area": "Lipid Profile",
            "next_step": "Clinical evaluation of abnormal lipid parameters",
            "specialist_category": "Primary Care / Internal Medicine"
        })

        pathway["reasoning"].append(
            "One or more lipid parameters require clinical review."
        )

    # --------------------------------------------------
    # Determine Priority
    # --------------------------------------------------

    if len(high_risk_parameters) >= 2:

        pathway["priority"] = "HIGH"

    elif len(high_risk_parameters) == 1:

        pathway["priority"] = "MODERATE-HIGH"

    elif len(moderate_risk_parameters) >= 2:

        pathway["priority"] = "MODERATE"

    else:

        pathway["priority"] = "ROUTINE"

    # --------------------------------------------------
    # Determine Primary Specialist Category
    # --------------------------------------------------

    areas = [
        item["area"]
        for item in pathway["clinical_pathway"]
    ]

    if "Blood Pressure" in areas:
        pathway["primary_specialist_category"] = (
            "Primary Care / Internal Medicine"
        )

    elif "Glycemic Control" in areas:
        pathway["primary_specialist_category"] = (
            "Primary Care / Internal Medicine"
        )

    elif "Lipid Profile" in areas:
        pathway["primary_specialist_category"] = (
            "Primary Care / Internal Medicine"
        )

    else:

        pathway["primary_specialist_category"] = (
            "Primary Care / General Clinical Evaluation"
        )

    # --------------------------------------------------
    # Follow-up
    # --------------------------------------------------

    if pathway["priority"] in ["HIGH", "MODERATE-HIGH"]:

        pathway["follow_up"].append(
            "Clinical review should be prioritized based on the "
            "identified abnormal parameters."
        )

    elif pathway["priority"] == "MODERATE":

        pathway["follow_up"].append(
            "Clinical follow-up should be considered based on "
            "the identified parameters."
        )

    else:

        pathway["follow_up"].append(
            "Continue routine monitoring according to clinical guidance."
        )

    return pathway