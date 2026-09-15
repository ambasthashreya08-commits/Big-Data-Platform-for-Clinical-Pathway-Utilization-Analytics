# ============================================================
# PATIENT-FRIENDLY MULTILINGUAL BRIEFING GENERATOR
# ============================================================


def generate_patient_briefing(
    medical_data,
    risk_analysis,
    clinical_pathway,
    language="English"
):

    language = language.lower().strip()

    # --------------------------------------------------------
    # Basic information
    # --------------------------------------------------------

    overall_risk = risk_analysis.get(
        "overall_risk",
        "UNKNOWN"
    )

    priority = clinical_pathway.get(
        "priority",
        "ROUTINE"
    )

    specialist = clinical_pathway.get(
        "primary_specialist_category",
        "General Clinical Evaluation"
    )

    # --------------------------------------------------------
    # Extract important medical values
    # --------------------------------------------------------

    findings = []

    blood_pressure = medical_data.get(
        "blood_pressure"
    )

    if blood_pressure:

        systolic = blood_pressure.get(
            "systolic"
        )

        diastolic = blood_pressure.get(
            "diastolic"
        )

        if systolic is not None and diastolic is not None:

            findings.append(
                f"Blood pressure: {systolic}/{diastolic} mmHg"
            )

    ldl = medical_data.get("ldl")

    if ldl is not None:

        findings.append(
            f"LDL cholesterol: {ldl} mg/dL"
        )

    hdl = medical_data.get("hdl")

    if hdl is not None:

        findings.append(
            f"HDL cholesterol: {hdl} mg/dL"
        )

    total_cholesterol = medical_data.get(
        "total_cholesterol"
    )

    if total_cholesterol is not None:

        findings.append(
            f"Total cholesterol: {total_cholesterol} mg/dL"
        )

    triglycerides = medical_data.get(
        "triglycerides"
    )

    if triglycerides is not None:

        findings.append(
            f"Triglycerides: {triglycerides} mg/dL"
        )

    hba1c = medical_data.get("hba1c")

    if hba1c is not None:

        findings.append(
            f"HbA1c: {hba1c}%"
        )

    fasting_glucose = medical_data.get(
        "fasting_glucose"
    )

    if fasting_glucose is not None:

        findings.append(
            f"Fasting glucose: {fasting_glucose} mg/dL"
        )

    creatinine = medical_data.get(
        "creatinine"
    )

    if creatinine is not None:

        findings.append(
            f"Creatinine: {creatinine} mg/dL"
        )

    # --------------------------------------------------------
    # Risk results
    # --------------------------------------------------------

    risk_results = risk_analysis.get(
        "results",
        []
    )

    attention_items = []

    for result in risk_results:

        risk_level = str(
            result.get(
                "risk_level",
                ""
            )
        ).upper()

        if risk_level in (
            "HIGH",
            "MODERATE",
            "MODERATE-HIGH"
        ):

            parameter = result.get(
                "parameter",
                "Medical parameter"
            )

            attention_items.append(
                str(parameter)
            )

    # ========================================================
    # ENGLISH
    # ========================================================

    if language == "english":

        parts = []

        parts.append(
            "Your medical report has been analyzed."
        )

        if findings:

            parts.append(
                "The key measurements identified in "
                "your report are: "
                + ", ".join(findings)
                + "."
            )

        if attention_items:

            parts.append(
                "Some findings may need additional "
                "clinical review, particularly: "
                + ", ".join(attention_items)
                + "."
            )

        else:

            parts.append(
                "No major attention areas were identified "
                "by the current prototype analysis."
            )

        parts.append(
            f"The current pathway priority is {priority}."
        )

        parts.append(
            f"The suggested clinical category is "
            f"{specialist}."
        )

        parts.append(
            "Please discuss these findings with a "
            "qualified healthcare professional."
        )

        parts.append(
            "This briefing is provided to make the "
            "report easier to understand. It is not "
            "a diagnosis or treatment recommendation."
        )

        return " ".join(parts)

    # ========================================================
    # HINDI
    # ========================================================

    if language == "hindi":

        parts = []

        parts.append(
            "आपकी मेडिकल रिपोर्ट का विश्लेषण किया गया है।"
        )

        if findings:

            parts.append(
                "रिपोर्ट में पाए गए मुख्य माप हैं: "
                + ", ".join(findings)
                + "।"
            )

        if attention_items:

            parts.append(
                "कुछ परिणामों की चिकित्सकीय समीक्षा "
                "आवश्यक हो सकती है, विशेष रूप से: "
                + ", ".join(attention_items)
                + "।"
            )

        else:

            parts.append(
                "इस प्रारंभिक विश्लेषण में किसी प्रमुख "
                "ध्यान देने वाले क्षेत्र की पहचान नहीं हुई।"
            )

        parts.append(
            f"वर्तमान क्लिनिकल पाथवे प्राथमिकता "
            f"{priority} है।"
        )

        parts.append(
            "कृपया इन परिणामों पर योग्य स्वास्थ्य "
            "विशेषज्ञ से चर्चा करें।"
        )

        parts.append(
            "यह विवरण रिपोर्ट को समझने में सहायता "
            "के लिए है। यह किसी बीमारी का निदान "
            "या उपचार की सलाह नहीं है।"
        )

        return " ".join(parts)

    # ========================================================
    # TELUGU
    # ========================================================

    if language == "telugu":

        parts = []

        parts.append(
            "మీ మెడికల్ రిపోర్ట్ విశ్లేషించబడింది."
        )

        if findings:

            parts.append(
                "రిపోర్ట్‌లో గుర్తించిన ముఖ్యమైన "
                "పారామీటర్లు: "
                + ", ".join(findings)
                + "."
            )

        if attention_items:

            parts.append(
                "కొన్ని ఫలితాలకు వైద్యపరమైన సమీక్ష "
                "అవసరం కావచ్చు. ముఖ్యంగా: "
                + ", ".join(attention_items)
                + "."
            )

        else:

            parts.append(
                "ఈ ప్రాథమిక విశ్లేషణలో ప్రత్యేకమైన "
                "శ్రద్ధ అవసరమైన అంశాలు గుర్తించబడలేదు."
            )

        parts.append(
            f"ప్రస్తుత క్లినికల్ పాత్‌వే ప్రాధాన్యత "
            f"{priority}."
        )

        parts.append(
            "ఈ ఫలితాల గురించి అర్హత కలిగిన "
            "ఆరోగ్య నిపుణుడితో చర్చించండి."
        )

        parts.append(
            "ఈ వివరణ రిపోర్ట్‌ను అర్థం చేసుకోవడానికి "
            "మాత్రమే. ఇది వైద్య నిర్ధారణ లేదా "
            "చికిత్స సూచన కాదు."
        )

        return " ".join(parts)

    # ========================================================
    # KANNADA
    # ========================================================

    if language == "kannada":

        parts = []

        parts.append(
            "ನಿಮ್ಮ ವೈದ್ಯಕೀಯ ವರದಿಯನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗಿದೆ."
        )

        if findings:

            parts.append(
                "ವರದಿಯಲ್ಲಿ ಕಂಡುಬಂದ ಪ್ರಮುಖ ಅಂಶಗಳು: "
                + ", ".join(findings)
                + "."
            )

        if attention_items:

            parts.append(
                "ಕೆಲವು ಫಲಿತಾಂಶಗಳಿಗೆ ವೈದ್ಯಕೀಯ ಪರಿಶೀಲನೆ "
                "ಅಗತ್ಯವಾಗಬಹುದು. ವಿಶೇಷವಾಗಿ: "
                + ", ".join(attention_items)
                + "."
            )

        else:

            parts.append(
                "ಈ ಪ್ರಾಥಮಿಕ ವಿಶ್ಲೇಷಣೆಯಲ್ಲಿ ಪ್ರಮುಖ "
                "ಗಮನ ಅಗತ್ಯವಿರುವ ಅಂಶಗಳು ಕಂಡುಬಂದಿಲ್ಲ."
            )

        parts.append(
            f"ಪ್ರಸ್ತುತ ಕ್ಲಿನಿಕಲ್ ಪಾಥ್‌ವೇ ಆದ್ಯತೆ "
            f"{priority} ಆಗಿದೆ."
        )

        parts.append(
            "ಈ ಫಲಿತಾಂಶಗಳ ಕುರಿತು ಅರ್ಹ ವೈದ್ಯಕೀಯ "
            "ತಜ್ಞರೊಂದಿಗೆ ಚರ್ಚಿಸಿ."
        )

        parts.append(
            "ಈ ವಿವರಣೆ ವರದಿಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು "
            "ಮಾತ್ರ ಸಹಾಯ ಮಾಡುತ್ತದೆ. ಇದು ವೈದ್ಯಕೀಯ "
            "ರೋಗನಿರ್ಣಯ ಅಥವಾ ಚಿಕಿತ್ಸೆಯ ಸಲಹೆಯಲ್ಲ."
        )

        return " ".join(parts)

    # ========================================================
    # TAMIL
    # ========================================================

    if language == "tamil":

        parts = []

        parts.append(
            "உங்கள் மருத்துவ அறிக்கை "
            "பகுப்பாய்வு செய்யப்பட்டுள்ளது."
        )

        if findings:

            parts.append(
                "அறிக்கையில் காணப்பட்ட முக்கிய "
                "அளவீடுகள்: "
                + ", ".join(findings)
                + "."
            )

        if attention_items:

            parts.append(
                "சில முடிவுகளுக்கு மருத்துவ பரிசீலனை "
                "தேவைப்படலாம். குறிப்பாக: "
                + ", ".join(attention_items)
                + "."
            )

        else:

            parts.append(
                "இந்த ஆரம்பகட்ட பகுப்பாய்வில் முக்கிய "
                "கவனம் தேவைப்படும் பகுதிகள் "
                "கண்டறியப்படவில்லை."
            )

        parts.append(
            f"தற்போதைய மருத்துவ பாதை முன்னுரிமை "
            f"{priority} ஆகும்."
        )

        parts.append(
            "இந்த முடிவுகளை தகுதியான மருத்துவ "
            "நிபுணருடன் கலந்துரையாடவும்."
        )

        parts.append(
            "இந்த விளக்கம் அறிக்கையைப் புரிந்துகொள்ள "
            "உதவுவதற்காக மட்டுமே. இது மருத்துவ "
            "நோயறிதல் அல்லது சிகிச்சை பரிந்துரை அல்ல."
        )

        return " ".join(parts)

    # ========================================================
    # MALAYALAM
    # ========================================================

    if language == "malayalam":

        parts = []

        parts.append(
            "നിങ്ങളുടെ മെഡിക്കൽ റിപ്പോർട്ട് "
            "വിശകലനം ചെയ്തു."
        )

        if findings:

            parts.append(
                "റിപ്പോർട്ടിൽ കണ്ടെത്തിയ പ്രധാന "
                "അളവുകൾ: "
                + ", ".join(findings)
                + "."
            )

        if attention_items:

            parts.append(
                "ചില ഫലങ്ങൾക്ക് മെഡിക്കൽ പരിശോധന "
                "ആവശ്യമായി വരാം. പ്രത്യേകിച്ച്: "
                + ", ".join(attention_items)
                + "."
            )

        else:

            parts.append(
                "ഈ പ്രാഥമിക വിശകലനത്തിൽ പ്രധാന "
                "ശ്രദ്ധ ആവശ്യമായ മേഖലകൾ കണ്ടെത്തിയിട്ടില്ല."
            )

        parts.append(
            f"നിലവിലെ ക്ലിനിക്കൽ പാത്ത്‌വേ "
            f"മുൻഗണന {priority} ആണ്."
        )

        parts.append(
            "ഈ ഫലങ്ങളെക്കുറിച്ച് യോഗ്യനായ ആരോഗ്യ "
            "വിദഗ്ധനുമായി ചർച്ച ചെയ്യുക."
        )

        parts.append(
            "ഈ വിശദീകരണം റിപ്പോർട്ട് മനസ്സിലാക്കാൻ "
            "സഹായിക്കുന്നതിനായി മാത്രമാണ്. ഇത് ഒരു "
            "വൈദ്യ നിർണയമോ ചികിത്സാ നിർദ്ദേശമോ അല്ല."
        )

        return " ".join(parts)

    # ========================================================
    # DEFAULT
    # ========================================================

    return generate_patient_briefing(
        medical_data,
        risk_analysis,
        clinical_pathway,
        "English"
    )