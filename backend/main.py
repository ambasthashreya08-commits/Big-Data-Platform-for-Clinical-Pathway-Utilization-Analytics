# ============================================================
# CLINICAL PATHWAY ANALYTICS API
# ============================================================

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from services.ai_assistant import router as ai_assistant_router

from pypdf import PdfReader

import io


# ============================================================
# PROJECT SERVICES
# ============================================================

from services.medical_extractor import (
    extract_medical_parameters
)

from services.risk_analyzer import (
    analyze_risks
)

from services.clinical_pathway import (
    generate_clinical_pathway
)

from services.pathway_intelligence import (
    analyze_pathway_intelligence
)


# ============================================================
# CREATE FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="Clinical Pathway Analytics API",
    description=(
        "AI-powered clinical pathway analytics "
        "and patient-friendly medical report platform"
    ),
    version="2.0.0"
    
)
app.include_router(ai_assistant_router)


# ============================================================
# CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():

    return {
        "success": True,

        "message": (
            "Clinical Pathway Analytics API "
            "is running"
        ),

        "version": "2.0.0",

        "features": [
            "PDF medical report extraction",
            "Medical parameter extraction",
            "Risk analysis",
            "Clinical pathway generation",
            "Pathway intelligence analytics",
            "Pathway utilization analysis",
            "Deviation detection",
            "Bottleneck detection",
            "Explainable analytics"
        ]
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():

    return {
        "status": "healthy",

        "service": "Clinical Pathway Analytics API",

        "version": "2.0.0"
    }


# ============================================================
# UPLOAD AND ANALYZE MEDICAL REPORT
# ============================================================

@app.post("/upload-report")
async def upload_report(
    file: UploadFile = File(...)
):

    # --------------------------------------------------------
    # CHECK FILE TYPE
    # --------------------------------------------------------

    if file.content_type != "application/pdf":

        return {
            "success": False,

            "message": (
                "Please upload a PDF medical report."
            )
        }

    try:

        # ====================================================
        # 1. READ UPLOADED FILE
        # ====================================================

        file_bytes = await file.read()

        if not file_bytes:

            return {
                "success": False,

                "message": (
                    "The uploaded PDF is empty."
                )
            }


        # ====================================================
        # 2. CREATE PDF READER
        # ====================================================

        pdf = PdfReader(
            io.BytesIO(file_bytes)
        )


        # ====================================================
        # 3. EXTRACT TEXT FROM ALL PAGES
        # ====================================================

        extracted_text = ""

        for page in pdf.pages:

            try:

                text = page.extract_text()

                if text:

                    extracted_text += (
                        text + "\n"
                    )

            except Exception:

                # Ignore an individual page if
                # text extraction fails.

                continue


        # ====================================================
        # 4. CHECK WHETHER TEXT WAS EXTRACTED
        # ====================================================

        if not extracted_text.strip():

            return {
                "success": False,

                "message": (
                    "The PDF could not be read as "
                    "text. It may be a scanned image "
                    "PDF and may require OCR."
                ),

                "filename": file.filename,

                "pages": len(pdf.pages)
            }


        # ====================================================
        # 5. EXTRACT MEDICAL PARAMETERS
        # ====================================================

        medical_data = extract_medical_parameters(
            extracted_text
        )


        # ====================================================
        # 6. ANALYZE HEALTH RISKS
        # ====================================================

        risk_analysis = analyze_risks(
            medical_data
        )


        # ====================================================
        # 7. GENERATE CLINICAL PATHWAY
        # ====================================================

        clinical_pathway = generate_clinical_pathway(
            medical_data,
            risk_analysis
        )


        # ====================================================
        # 8. PATHWAY INTELLIGENCE
        # ====================================================

        pathway_intelligence = (
            analyze_pathway_intelligence(
                medical_data,
                risk_analysis,
                clinical_pathway
            )
        )


        # ====================================================
        # 9. RETURN COMPLETE ANALYSIS
        # ====================================================

        return {

            "success": True,

            "filename": file.filename,

            "pages": len(pdf.pages),

            # ----------------------------------------------
            # Extracted medical values
            # ----------------------------------------------

            "medical_data": medical_data,

            # ----------------------------------------------
            # Risk analysis
            # ----------------------------------------------

            "risk_analysis": risk_analysis,

            # ----------------------------------------------
            # Clinical pathway
            # ----------------------------------------------

            "clinical_pathway": clinical_pathway,

            # ----------------------------------------------
            # Advanced pathway analytics
            # ----------------------------------------------

            "pathway_intelligence": pathway_intelligence,

            # ----------------------------------------------
            # Raw extracted text
            # ----------------------------------------------

            "extracted_text": extracted_text
        }


    # ========================================================
    # ERROR HANDLING
    # ========================================================

    except Exception as error:

        return {

            "success": False,

            "message": (
                "Could not process PDF: "
                f"{str(error)}"
            )
        }


# ============================================================
# API INFORMATION
# ============================================================

@app.get("/api-info")
def api_info():

    return {

        "application": (
            "Clinical Pathway Analytics"
        ),

        "version": "2.0.0",

        "description": (
            "A clinical report analytics platform "
            "designed to transform complex medical "
            "reports into understandable insights."
        ),

        "endpoints": {

            "root": "/",

            "health": "/health",

            "upload_report": "/upload-report",

            "documentation": "/docs"
        },

        "analysis_pipeline": [

            "PDF Upload",

            "PDF Text Extraction",

            "Medical Parameter Extraction",

            "Risk Analysis",

            "Clinical Pathway Generation",

            "Pathway Intelligence",

            "Patient-Friendly Interpretation"
        ]
    }