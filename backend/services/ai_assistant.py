from pathlib import Path
import os
import traceback
from openai import AsyncOpenAI

from services.rag_service import get_rag_context

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from openai import AsyncOpenAI



# ============================================================
# LOAD ENVIRONMENT
# ============================================================

BACKEND_DIR = Path(__file__).resolve().parents[1]
ENV_FILE = BACKEND_DIR / ".env"

load_dotenv(ENV_FILE)

print("========================================")
print("CAREBRIDGE AI - ENVIRONMENT CHECK")
print("ENV FILE:", ENV_FILE)
print("ENV FILE EXISTS:", ENV_FILE.exists())
print("========================================")


# ============================================================
# GROQ CLIENT
# ============================================================

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    print("WARNING: GROQ_API_KEY was not found in backend/.env")

client = AsyncOpenAI(
    api_key=api_key,
    base_url="https://api.groq.com/openai/v1"
) if api_key else None

print("OPENAI CLIENT EXISTS:", client is not None)
print("========================================")


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/api/assistant",
    tags=["CAREBRIDGE AI Assistant"]
)


# ============================================================
# REQUEST MODEL
# ============================================================

class AssistantRequest(BaseModel):
    message: str = Field(
        ...,
        min_length=1,
        max_length=4000
    )

    language: str = Field(
        default="en",
        max_length=10
    )

    report_context: str | None = Field(
        default=None,
        max_length=20000
    )


# ============================================================
# RESPONSE MODEL
# ============================================================

class AssistantResponse(BaseModel):
    success: bool
    answer: str
    language: str


# ============================================================
# LANGUAGE NAMES
# ============================================================

LANGUAGES = {
    "en": "English",
    "hi": "Hindi",
    "te": "Telugu",
    "kn": "Kannada",
    "ta": "Tamil",
    "ml": "Malayalam",
}


# ============================================================
# CAREBRIDGE AI SYSTEM INSTRUCTIONS
# ============================================================

SYSTEM_INSTRUCTIONS = """
You are CAREBRIDGE AI, a patient-navigation and health-literacy
assistant inside the CAREBRIDGE Clinical Pathway Intelligence platform.

Your purpose is to help patients understand medical information
and navigate the next discussion with an appropriate healthcare
professional.

IMPORTANT SAFETY RULES:

1. You are NOT a doctor.
2. Do not diagnose diseases.
3. Do not prescribe medicines.
4. Do not recommend changing, starting, or stopping medication.
5. Do not give definitive treatment plans.
6. Do not claim certainty when information is incomplete.
7. Do not interpret a laboratory value as a diagnosis by itself.
8. Encourage appropriate professional medical evaluation when needed.
9. If the user describes a potentially life-threatening emergency,
   advise them to seek emergency medical care immediately.
10. Never invent medical information that is not present in the
    patient's provided report context.
11. Clearly distinguish between:
    - what the report says
    - what the result may generally mean
    - what the patient could discuss with a healthcare professional.

PATIENT-CENTRIC COMMUNICATION:

- Use simple language.
- Avoid unnecessary medical jargon.
- If medical terminology is necessary, explain it.
- Be respectful and reassuring without giving false reassurance.
- Keep answers concise but useful.
- Give useful questions the patient can ask their healthcare professional.

CAREBRIDGE'S ROLE:

CAREBRIDGE organizes medical information into:
- understandable findings
- priorities
- visual care pathways
- questions for healthcare professionals
- patient-friendly explanations

It does NOT replace a clinician.

REPORT CONTEXT:

If report context is provided, use it to answer questions about
the patient's uploaded report.

Never assume that the report context represents a complete medical
history.

LANGUAGE:

Respond in the requested language.

If the requested language is Hindi, answer in natural,
easy-to-understand Hindi rather than overly formal Hindi.

If the requested language is Telugu, Kannada, Tamil, or Malayalam,
respond naturally in that language.

If the patient mixes English and an Indian language, you may naturally
use the same mixed style when appropriate.
"""


# ============================================================
# CHAT ENDPOINT
# ============================================================

@router.post(
    "/chat",
    response_model=AssistantResponse
)
async def chat_with_carebridge(request: AssistantRequest):

    print("")
    print("========================================")
    print("CAREBRIDGE REQUEST RECEIVED")
    print("========================================")

    print("Message:", request.message)
    print("Language:", request.language)
    print(
        "Report context provided:",
        bool(request.report_context)
    )

    print("API KEY EXISTS:", bool(api_key))
    print("CLIENT EXISTS:", client is not None)

    print("========================================")

    # --------------------------------------------------------
    # CHECK OPENAI CLIENT
    # --------------------------------------------------------

    if client is None:

        print("ERROR: OpenAI client is not configured.")

        raise HTTPException(
            status_code=500,
            detail="OpenAI API key is not configured."
        )

    # --------------------------------------------------------
    # LANGUAGE
    # --------------------------------------------------------

    language_name = LANGUAGES.get(
        request.language,
        "English"
    )

    # --------------------------------------------------------
    # REPORT CONTEXT
    # --------------------------------------------------------

    report_context = request.report_context or (
        "No medical report context has been provided yet."
    )



    rag_context = get_rag_context(
    request.message,
    top_k=3
)
    print("\n========== RAG CONTEXT ==========")
    print(rag_context)
    print("=================================\n")

    # --------------------------------------------------------
    # USER PROMPT
    # --------------------------------------------------------
    

    rag_context = get_rag_context(request.message)


    user_prompt = f"""
Requested response language:
{language_name}

PATIENT'S QUESTION:
{request.message}

MEDICAL REPORT CONTEXT:
{report_context}

RETRIEVED CAREBRIDGE MEDICAL KNOWLEDGE:
{rag_context}

INSTRUCTIONS:

Use the retrieved CAREBRIDGE medical knowledge to help answer
the patient's question.

Use the patient's report context when it is relevant.

Do not invent medical information that is not supported by the
retrieved knowledge or report context.

If the retrieved knowledge does not provide enough information,
say that the available information is insufficient and recommend
speaking with a qualified healthcare professional.

If discussing a medical report:

- Explain the report information simply.
- Distinguish the patient's actual report findings from general
  medical information.
- Suggest useful questions the patient can ask their healthcare
  professional.

Do not diagnose.
Do not prescribe.
Do not recommend starting, stopping, or changing medication.

Answer as CAREBRIDGE AI in the requested language.
"""

    # --------------------------------------------------------
    # CALL OPENAI
    # --------------------------------------------------------

    try:

        print("")
        print("========================================")
        print("CALLING OPENAI...")
        print("========================================")

        response = await client.responses.create(
            model="openai/gpt-oss-20b",
            instructions=SYSTEM_INSTRUCTIONS,
            input=user_prompt,
        )

        print("")
        print("========================================")
        print("OPENAI RESPONSE RECEIVED")
        print("========================================")

        # ----------------------------------------------------
        # EXTRACT ANSWER
        # ----------------------------------------------------

        answer = response.output_text.strip()

        print("ANSWER RECEIVED:", bool(answer))
        print("ANSWER LENGTH:", len(answer))

        if not answer:

            print("WARNING: OPENAI RETURNED EMPTY ANSWER")

            answer = (
                "I couldn't generate an explanation right now. "
                "Please try again."
            )

        # ----------------------------------------------------
        # RETURN RESPONSE
        # ----------------------------------------------------

        print("RETURNING SUCCESS RESPONSE")
        print("========================================")

        return AssistantResponse(
            success=True,
            answer=answer,
            language=request.language,
        )

    # --------------------------------------------------------
    # ERROR HANDLING
    # --------------------------------------------------------

    except Exception as e:

        print("")
        print("========================================")
        print("CAREBRIDGE AI ERROR")
        print("========================================")

        print("ERROR TYPE:", type(e).__name__)
        print("ERROR:", repr(e))

        print("")
        print("FULL TRACEBACK:")
        traceback.print_exc()

        print("========================================")

        raise HTTPException(
            status_code=500,
            detail=f"OpenAI error: {str(e)}"
        )