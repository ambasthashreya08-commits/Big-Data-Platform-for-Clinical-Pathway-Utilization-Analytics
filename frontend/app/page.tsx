"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

type Parameter = {
  value: number;
  unit?: string;
  reference_low?: number;
  reference_high?: number;
  status: string;
};

type Finding = {
  parameter: string;
  value: number;
  unit?: string;
  status: string;
  priority: string;
  explanation: string;
  recommended_discussion: string;
};

type PathwayStep = {
  stage: string;
  status: string;
  description: string;
};

type AnalysisResponse = {
  success: boolean;
  filename: string;
  pages: number;
  extracted_text?: string;
  medical_data: {
    parameters: Record<string, Parameter>;
    total_parameters: number;
    message: string;
  };
  risk_analysis: {
    overall_status: string;
    overall_message: string;
    summary: {
      total_parameters: number;
      high_priority: number;
      attention: number;
      normal: number;
    };
    findings: Finding[];
    pathway: PathwayStep[];
    safety_note: string;
  };
};

const API_URL = "http://127.0.0.1:8000";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिन्दी" },
  { code: "te", name: "తెలుగు" },
  { code: "kn", name: "ಕನ್ನಡ" },
  { code: "ta", name: "தமிழ்" },
  { code: "ml", name: "മലയാളം" },
];

const ui: Record<string, Record<string, string>> = {
  en: {
    title: "Your health report, made clear.",
    subtitle: "CAREBRIDGE turns complex medical reports into understandable findings, priorities and next steps.",
    upload: "Upload medical report", choose: "Choose PDF report",
    browse: "Click to browse or drag and drop", analyze: "Analyze my report",
    analyzing: "Analyzing report...", overview: "Health at a glance",
    findings: "Important findings", pathway: "Your care pathway",
    next: "What should I do next?", briefing: "Patient briefing",
    explain: "Explain my report", language: "Language",
    normal: "Within expected range", attention: "Needs attention", high: "Priority review",
    parameters: "Parameters", priority: "Priority", followup: "Attention", safe: "Normal",
    reference: "Reference range", discuss: "What to discuss", step: "STEP",
    completed: "Completed", current: "Current", upcoming: "Upcoming",
    noReport: "Upload a report to start your patient journey.",
    noReportSub: "Your report will be organized into plain-language findings and a visual care pathway.",
    questions: "Questions to ask your healthcare professional",
    q1: "What do these results mean in my individual situation?",
    q2: "Does anything here need follow-up or another test?",
    q3: "When should I review these results again?",
    q4: "Are there symptoms or warning signs I should watch for?",
    safety: "This tool is for education and discussion. It does not diagnose conditions, replace a clinician, or provide emergency medical advice.",
    uploadError: "Please choose a PDF medical report first.",
    invalid: "Please upload a PDF file.",
    backend: "The report could not be analyzed. Make sure the FastAPI backend is running on port 8000.",
    reset: "Analyze another report", report: "Report", pages: "pages", values: "values detected",
  },
  hi: {
    title: "आपकी स्वास्थ्य रिपोर्ट, आसान भाषा में।",
    subtitle: "CAREBRIDGE जटिल मेडिकल रिपोर्ट को आसान जानकारी, प्राथमिकताओं और अगले कदमों में बदलता है।",
    upload: "मेडिकल रिपोर्ट अपलोड करें", choose: "PDF रिपोर्ट चुनें",
    browse: "क्लिक करें या PDF यहां ड्रैग और ड्रॉप करें", analyze: "मेरी रिपोर्ट समझाएं",
    analyzing: "रिपोर्ट का विश्लेषण हो रहा है...", overview: "स्वास्थ्य एक नज़र में",
    findings: "महत्वपूर्ण परिणाम", pathway: "आपकी देखभाल की प्रक्रिया",
    next: "अब मुझे क्या करना चाहिए?", briefing: "मरीज के लिए सरल सारांश",
    explain: "मेरी रिपोर्ट समझाएं", language: "भाषा",
    normal: "सामान्य सीमा में", attention: "ध्यान देने की जरूरत", high: "प्राथमिकता से समीक्षा",
    parameters: "परिणाम", priority: "प्राथमिकता", followup: "ध्यान", safe: "सामान्य",
    reference: "सामान्य संदर्भ सीमा", discuss: "डॉक्टर से चर्चा करें", step: "चरण",
    completed: "पूरा", current: "वर्तमान", upcoming: "आगे",
    noReport: "अपनी मरीज यात्रा शुरू करने के लिए रिपोर्ट अपलोड करें।",
    noReportSub: "रिपोर्ट को आसान भाषा में परिणामों और देखभाल की दृश्य प्रक्रिया में व्यवस्थित किया जाएगा।",
    questions: "डॉक्टर से पूछने योग्य प्रश्न",
    q1: "इन परिणामों का मेरी स्थिति में क्या मतलब है?",
    q2: "क्या किसी परिणाम के लिए दोबारा जांच या फॉलो-अप चाहिए?",
    q3: "मुझे ये परिणाम फिर कब दिखाने चाहिए?",
    q4: "मुझे किन लक्षणों या चेतावनी संकेतों पर ध्यान देना चाहिए?",
    safety: "यह टूल केवल जानकारी और डॉक्टर से चर्चा के लिए है। यह बीमारी का निदान नहीं करता और डॉक्टर की सलाह या आपातकालीन चिकित्सा का विकल्प नहीं है।",
    uploadError: "कृपया पहले PDF मेडिकल रिपोर्ट चुनें।", invalid: "कृपया PDF फाइल अपलोड करें।",
    backend: "रिपोर्ट का विश्लेषण नहीं हो सका। जांचें कि FastAPI backend port 8000 पर चल रहा है।",
    reset: "दूसरी रिपोर्ट का विश्लेषण करें", report: "रिपोर्ट", pages: "पेज", values: "परिणाम मिले",
  },
  te: {
    title: "మీ ఆరోగ్య నివేదికను సులభంగా అర్థం చేసుకోండి.",
    subtitle: "CAREBRIDGE క్లిష్టమైన వైద్య నివేదికను సులభమైన వివరాలు, ప్రాధాన్యతలు మరియు తదుపరి దశలుగా చూపిస్తుంది.",
    upload: "వైద్య నివేదికను అప్లోడ్ చేయండి", choose: "PDF నివేదికను ఎంచుకోండి",
    browse: "క్లిక్ చేయండి లేదా PDF ను ఇక్కడ డ్రాగ్ చేయండి", analyze: "నా నివేదికను విశ్లేషించండి",
    analyzing: "నివేదికను విశ్లేషిస్తున్నాము...", overview: "ఆరోగ్యం ఒక చూపులో",
    findings: "ముఖ్యమైన ఫలితాలు", pathway: "మీ సంరక్షణ మార్గం",
    next: "తర్వాత ఏమి చేయాలి?", briefing: "రోగి కోసం సులభమైన సారాంశం",
    explain: "నా నివేదికను వివరించండి", language: "భాష",
    normal: "అంచనా పరిధిలో", attention: "శ్రద్ధ అవసరం", high: "ప్రాధాన్యత సమీక్ష",
    parameters: "ఫలితాలు", priority: "ప్రాధాన్యత", followup: "శ్రద్ధ", safe: "సాధారణం",
    reference: "సూచన పరిధి", discuss: "వైద్యుడితో చర్చించండి", step: "దశ",
    completed: "పూర్తైంది", current: "ప్రస్తుత", upcoming: "తదుపరి",
    noReport: "మీ రోగి ప్రయాణాన్ని ప్రారంభించడానికి నివేదికను అప్లోడ్ చేయండి.",
    noReportSub: "మీ నివేదికను సులభమైన వివరాలు మరియు దృశ్య సంరక్షణ మార్గంగా చూపిస్తాము.",
    questions: "వైద్యుడిని అడగవలసిన ప్రశ్నలు",
    q1: "ఈ ఫలితాలు నా పరిస్థితిలో ఏమి సూచిస్తున్నాయి?", q2: "ఏదైనా ఫాలో-అప్ లేదా మరొక పరీక్ష అవసరమా?",
    q3: "ఈ ఫలితాలను మళ్లీ ఎప్పుడు సమీక్షించాలి?", q4: "నేను ఏ లక్షణాలు లేదా హెచ్చరిక సంకేతాలను గమనించాలి?",
    safety: "ఈ సాధనం విద్యా మరియు చర్చ కోసం మాత్రమే. ఇది నిర్ధారణ చేయదు లేదా వైద్యుని సలహాకు ప్రత్యామ్నాయం కాదు.",
    uploadError: "దయచేసి ముందుగా PDF వైద్య నివేదికను ఎంచుకోండి.", invalid: "దయచేసి PDF ఫైల్‌ను అప్లోడ్ చేయండి.",
    backend: "నివేదికను విశ్లేషించలేకపోయాము. FastAPI backend port 8000లో నడుస్తోందో చూడండి.",
    reset: "మరో నివేదికను విశ్లేషించండి", report: "నివేదిక", pages: "పేజీలు", values: "ఫలితాలు",
  },
  kn: {
    title: "ನಿಮ್ಮ ಆರೋಗ್ಯ ವರದಿಯನ್ನು ಸುಲಭವಾಗಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ.",
    subtitle: "CAREBRIDGE ಸಂಕೀರ್ಣ ವೈದ್ಯಕೀಯ ವರದಿಯನ್ನು ಸರಳ ಮಾಹಿತಿ, ಆದ್ಯತೆಗಳು ಮತ್ತು ಮುಂದಿನ ಹಂತಗಳಾಗಿ ತೋರಿಸುತ್ತದೆ.",
    upload: "ವೈದ್ಯಕೀಯ ವರದಿ ಅಪ್ಲೋಡ್ ಮಾಡಿ", choose: "PDF ವರದಿ ಆಯ್ಕೆಮಾಡಿ",
    browse: "ಕ್ಲಿಕ್ ಮಾಡಿ ಅಥವಾ PDF ಅನ್ನು ಇಲ್ಲಿ ಡ್ರ್ಯಾಗ್ ಮಾಡಿ", analyze: "ನನ್ನ ವರದಿಯನ್ನು ವಿಶ್ಲೇಷಿಸಿ",
    analyzing: "ವರದಿಯನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...", overview: "ಆರೋಗ್ಯ ಒಂದು ನೋಟದಲ್ಲಿ",
    findings: "ಪ್ರಮುಖ ಫಲಿತಾಂಶಗಳು", pathway: "ನಿಮ್ಮ ಆರೈಕೆ ಮಾರ್ಗ",
    next: "ಮುಂದೆ ಏನು ಮಾಡಬೇಕು?", briefing: "ರೋಗಿಗಾಗಿ ಸರಳ ಸಾರಾಂಶ",
    explain: "ನನ್ನ ವರದಿಯನ್ನು ವಿವರಿಸಿ", language: "ಭಾಷೆ",
    normal: "ನಿರೀಕ್ಷಿತ ಮಿತಿಯಲ್ಲಿ", attention: "ಗಮನ ಅಗತ್ಯ", high: "ಆದ್ಯತೆಯ ಪರಿಶೀಲನೆ",
    parameters: "ಫಲಿತಾಂಶಗಳು", priority: "ಆದ್ಯತೆ", followup: "ಗಮನ", safe: "ಸಾಮಾನ್ಯ",
    reference: "ಉಲ್ಲೇಖ ಮಿತಿ", discuss: "ವೈದ್ಯರೊಂದಿಗೆ ಚರ್ಚಿಸಿ", step: "ಹಂತ",
    completed: "ಪೂರ್ಣಗೊಂಡಿದೆ", current: "ಪ್ರಸ್ತುತ", upcoming: "ಮುಂದಿನದು",
    noReport: "ನಿಮ್ಮ ರೋಗಿಯ ಪ್ರಯಾಣವನ್ನು ಆರಂಭಿಸಲು ವರದಿ ಅಪ್ಲೋಡ್ ಮಾಡಿ.",
    noReportSub: "ನಿಮ್ಮ ವರದಿಯನ್ನು ಸರಳ ಫಲಿತಾಂಶಗಳು ಮತ್ತು ದೃಶ್ಯ ಆರೈಕೆ ಮಾರ್ಗವಾಗಿ ತೋರಿಸಲಾಗುತ್ತದೆ.",
    questions: "ವೈದ್ಯರನ್ನು ಕೇಳಬೇಕಾದ ಪ್ರಶ್ನೆಗಳು",
    q1: "ಈ ಫಲಿತಾಂಶಗಳ ಅರ್ಥ ನನ್ನ ಪರಿಸ್ಥಿತಿಯಲ್ಲಿ ಏನು?", q2: "ಯಾವುದಾದರೂ ಫಾಲೋ-ಅಪ್ ಅಥವಾ ಮರುಪರೀಕ್ಷೆ ಬೇಕೇ?",
    q3: "ಈ ಫಲಿತಾಂಶಗಳನ್ನು ಮತ್ತೆ ಯಾವಾಗ ಪರಿಶೀಲಿಸಬೇಕು?", q4: "ನಾನು ಯಾವ ಲಕ್ಷಣಗಳು ಅಥವಾ ಎಚ್ಚರಿಕೆ ಸೂಚನೆಗಳನ್ನು ಗಮನಿಸಬೇಕು?",
    safety: "ಈ ಸಾಧನ ಮಾಹಿತಿ ಮತ್ತು ಚರ್ಚೆಗಾಗಿ ಮಾತ್ರ. ಇದು ರೋಗನಿರ್ಣಯ ಅಥವಾ ವೈದ್ಯಕೀಯ ಸಲಹೆಗೆ ಪರ್ಯಾಯವಲ್ಲ.",
    uploadError: "ದಯವಿಟ್ಟು ಮೊದಲು PDF ವೈದ್ಯಕೀಯ ವರದಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.", invalid: "ದಯವಿಟ್ಟು PDF ಫೈಲ್ ಅಪ್ಲೋಡ್ ಮಾಡಿ.",
    backend: "ವರದಿಯನ್ನು ವಿಶ್ಲೇಷಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. FastAPI backend port 8000ರಲ್ಲಿ ಚಾಲನೆಯಲ್ಲಿದೆಯೇ ನೋಡಿ.",
    reset: "ಮತ್ತೊಂದು ವರದಿಯನ್ನು ವಿಶ್ಲೇಷಿಸಿ", report: "ವರದಿ", pages: "ಪುಟಗಳು", values: "ಫಲಿತಾಂಶಗಳು",
  },
  ta: {
    title: "உங்கள் மருத்துவ அறிக்கையை எளிதாக புரிந்துகொள்ளுங்கள்.",
    subtitle: "CAREBRIDGE சிக்கலான மருத்துவ அறிக்கையை எளிய தகவல், முன்னுரிமைகள் மற்றும் அடுத்த படிகளாக காட்டுகிறது.",
    upload: "மருத்துவ அறிக்கையை பதிவேற்றவும்", choose: "PDF அறிக்கையை தேர்ந்தெடுக்கவும்",
    browse: "கிளிக் செய்யவும் அல்லது PDF-ஐ இங்கே இழுக்கவும்", analyze: "என் அறிக்கையை பகுப்பாய்வு செய்",
    analyzing: "அறிக்கை பகுப்பாய்வு செய்யப்படுகிறது...", overview: "ஆரோக்கியம் ஒரு பார்வையில்",
    findings: "முக்கிய முடிவுகள்", pathway: "உங்கள் பராமரிப்பு பாதை",
    next: "அடுத்து என்ன செய்ய வேண்டும்?", briefing: "நோயாளிக்கான எளிய சுருக்கம்",
    explain: "என் அறிக்கையை விளக்கவும்", language: "மொழி",
    normal: "எதிர்பார்க்கப்படும் வரம்பில்", attention: "கவனம் தேவை", high: "முன்னுரிமை மதிப்பாய்வு",
    parameters: "முடிவுகள்", priority: "முன்னுரிமை", followup: "கவனம்", safe: "சாதாரணம்",
    reference: "குறிப்பு வரம்பு", discuss: "மருத்துவருடன் பேசுங்கள்", step: "படி",
    completed: "முடிந்தது", current: "தற்போது", upcoming: "அடுத்து",
    noReport: "உங்கள் நோயாளர் பயணத்தைத் தொடங்க அறிக்கையை பதிவேற்றவும்.",
    noReportSub: "உங்கள் அறிக்கை எளிய முடிவுகள் மற்றும் காட்சி பராமரிப்பு பாதையாக காட்டப்படும்.",
    questions: "மருத்துவரிடம் கேட்க வேண்டிய கேள்விகள்",
    q1: "இந்த முடிவுகள் என் நிலைக்கு என்ன அர்த்தம்?", q2: "பின்தொடர்பு அல்லது மீண்டும் பரிசோதனை தேவையா?",
    q3: "இந்த முடிவுகளை மீண்டும் எப்போது மதிப்பாய்வு செய்ய வேண்டும்?", q4: "எந்த அறிகுறிகள் அல்லது எச்சரிக்கை அறிகுறிகளை கவனிக்க வேண்டும்?",
    safety: "இந்த கருவி கல்வி மற்றும் கலந்துரையாடலுக்காக மட்டுமே. இது நோயறிதல் அல்லது மருத்துவ ஆலோசனைக்கு மாற்றாகாது.",
    uploadError: "முதலில் PDF மருத்துவ அறிக்கையைத் தேர்ந்தெடுக்கவும்.", invalid: "PDF கோப்பை மட்டும் பதிவேற்றவும்.",
    backend: "அறிக்கையை பகுப்பாய்வு செய்ய முடியவில்லை. FastAPI backend port 8000ல் இயங்குகிறதா என்பதைச் சரிபார்க்கவும்.",
    reset: "மற்றொரு அறிக்கையை பகுப்பாய்வு செய்யவும்", report: "அறிக்கை", pages: "பக்கங்கள்", values: "முடிவுகள்",
  },
  ml: {
    title: "നിങ്ങളുടെ മെഡിക്കൽ റിപ്പോർട്ട് എളുപ്പത്തിൽ മനസ്സിലാക്കാം.",
    subtitle: "CAREBRIDGE സങ്കീർണ്ണമായ മെഡിക്കൽ റിപ്പോർട്ടിനെ ലളിതമായ വിവരങ്ങൾ, മുൻഗണനകൾ, അടുത്ത ഘട്ടങ്ങൾ എന്നിവയായി കാണിക്കുന്നു.",
    upload: "മെഡിക്കൽ റിപ്പോർട്ട് അപ്ലോഡ് ചെയ്യുക", choose: "PDF റിപ്പോർട്ട് തിരഞ്ഞെടുക്കുക",
    browse: "ക്ലിക്ക് ചെയ്യുക അല്ലെങ്കിൽ PDF ഇവിടെ ഡ്രാഗ് ചെയ്യുക", analyze: "എന്റെ റിപ്പോർട്ട് പരിശോധിക്കുക",
    analyzing: "റിപ്പോർട്ട് പരിശോധിക്കുന്നു...", overview: "ആരോഗ്യം ഒരു നോട്ടത്തിൽ",
    findings: "പ്രധാന കണ്ടെത്തലുകൾ", pathway: "നിങ്ങളുടെ പരിചരണ പാത",
    next: "ഇനി എന്ത് ചെയ്യണം?", briefing: "രോഗിക്കുള്ള ലളിതമായ സംഗ്രഹം",
    explain: "എന്റെ റിപ്പോർട്ട് വിശദീകരിക്കുക", language: "ഭാഷ",
    normal: "പ്രതീക്ഷിക്കുന്ന പരിധിയിൽ", attention: "ശ്രദ്ധ ആവശ്യമാണ്", high: "മുൻഗണനാ പരിശോധന",
    parameters: "ഫലങ്ങൾ", priority: "മുൻഗണന", followup: "ശ്രദ്ധ", safe: "സാധാരണ",
    reference: "റഫറൻസ് പരിധി", discuss: "ഡോക്ടറുമായി ചർച്ച ചെയ്യുക", step: "ഘട്ടം",
    completed: "പൂർത്തിയായി", current: "നിലവിൽ", upcoming: "അടുത്തത്",
    noReport: "നിങ്ങളുടെ രോഗി യാത്ര ആരംഭിക്കാൻ റിപ്പോർട്ട് അപ്ലോഡ് ചെയ്യുക.",
    noReportSub: "റിപ്പോർട്ട് ലളിതമായ കണ്ടെത്തലുകളും ദൃശ്യ പരിചരണ പാതയും ആയി ക്രമീകരിക്കും.",
    questions: "ഡോക്ടറോട് ചോദിക്കാവുന്ന ചോദ്യങ്ങൾ",
    q1: "ഈ ഫലങ്ങൾ എന്റെ സാഹചര്യത്തിൽ എന്താണ് അർത്ഥമാക്കുന്നത്?", q2: "ഫോളോ-അപ്പോ വീണ്ടും പരിശോധനയോ ആവശ്യമുണ്ടോ?",
    q3: "ഈ ഫലങ്ങൾ വീണ്ടും എപ്പോൾ പരിശോധിക്കണം?", q4: "ഏത് ലക്ഷണങ്ങളോ മുന്നറിയിപ്പ് അടയാളങ്ങളോ ശ്രദ്ധിക്കണം?",
    safety: "ഈ ഉപകരണം വിദ്യാഭ്യാസത്തിനും ചർച്ചയ്ക്കും മാത്രമാണ്. ഇത് രോഗനിർണയം നടത്തുകയോ ഡോക്ടറുടെ ഉപദേശം മാറ്റിസ്ഥാപിക്കുകയോ ചെയ്യുന്നില്ല.",
    uploadError: "ആദ്യം PDF മെഡിക്കൽ റിപ്പോർട്ട് തിരഞ്ഞെടുക്കുക.", invalid: "PDF ഫയൽ മാത്രം അപ്ലോഡ് ചെയ്യുക.",
    backend: "റിപ്പോർട്ട് പരിശോധിക്കാൻ കഴിഞ്ഞില്ല. FastAPI backend port 8000ൽ പ്രവർത്തിക്കുന്നുണ്ടെന്ന് ഉറപ്പാക്കുക.",
    reset: "മറ്റൊരു റിപ്പോർട്ട് പരിശോധിക്കുക", report: "റിപ്പോർട്ട്", pages: "പേജുകൾ", values: "ഫലങ്ങൾ",
  },
};

function normalizeStatus(status: string) {
  const v = (status || "").toLowerCase();
  if (["high", "priority_review", "critical", "danger"].includes(v)) return "high";
  if (["attention", "discussion", "warning", "abnormal"].includes(v)) return "attention";
  return "normal";
}

function statusText(status: string, t: Record<string, string>) {
  const s = normalizeStatus(status);
  return s === "high" ? t.high : s === "attention" ? t.attention : t.normal;
}

function patientBrief(result: AnalysisResponse, language: string) {
  const s = result.risk_analysis.summary;
  const high = result.risk_analysis.findings.filter(f => normalizeStatus(f.status) === "high").length;
  const attention = result.risk_analysis.findings.filter(f => normalizeStatus(f.status) === "attention").length;

  if (language === "hi") return high
    ? `आपकी रिपोर्ट में ${high} प्राथमिकता वाले परिणाम और ${attention} ध्यान देने योग्य परिणाम मिले हैं। यह अपने आप बीमारी का निदान नहीं है। प्राथमिकता वाले परिणामों को डॉक्टर के साथ जल्द चर्चा करना उचित है।`
    : attention
    ? `आपकी रिपोर्ट में ${attention} परिणामों पर ध्यान देने की आवश्यकता है। कोई भी असामान्य परिणाम अपने आप बीमारी का निदान नहीं करता। डॉक्टर से अपनी रिपोर्ट, लक्षण और मेडिकल इतिहास के साथ चर्चा करें।`
    : `आपकी रिपोर्ट में ${s.total_parameters} परिणाम मिले और कोई प्राथमिकता वाला परिणाम चिन्हित नहीं हुआ। फिर भी रिपोर्ट को डॉक्टर के साथ आपके लक्षणों और इतिहास के संदर्भ में समझना उचित है।`;

  if (language === "te") return high
    ? `మీ నివేదికలో ${high} ప్రాధాన్యత ఫలితాలు మరియు ${attention} శ్రద్ధ అవసరమైన ఫలితాలు ఉన్నాయి. ఇవి స్వయంగా వ్యాధి నిర్ధారణ కాదు. ప్రాధాన్యత ఫలితాలను వైద్యుడితో చర్చించండి.`
    : attention
    ? `మీ నివేదికలో ${attention} ఫలితాలకు శ్రద్ధ అవసరం. అసాధారణ ఫలితం ఒక్కటే వ్యాధి నిర్ధారణ కాదు. మీ లక్షణాలు మరియు వైద్య చరిత్రతో వైద్యుడితో చర్చించండి.`
    : `మీ నివేదికలో ${s.total_parameters} ఫలితాలు గుర్తించబడ్డాయి. ప్రాధాన్యత ఫలితం గుర్తించబడలేదు. అయినప్పటికీ వైద్యుడితో నివేదికను సమీక్షించడం మంచిది.`;

  if (language === "kn") return high
    ? `ನಿಮ್ಮ ವರದಿಯಲ್ಲಿ ${high} ಆದ್ಯತೆಯ ಫಲಿತಾಂಶಗಳು ಮತ್ತು ${attention} ಗಮನ ಅಗತ್ಯವಿರುವ ಫಲಿತಾಂಶಗಳಿವೆ. ಇವು ಸ್ವತಃ ರೋಗನಿರ್ಣಯವಲ್ಲ. ವೈದ್ಯರೊಂದಿಗೆ ಚರ್ಚಿಸಿ.`
    : attention
    ? `ನಿಮ್ಮ ವರದಿಯಲ್ಲಿ ${attention} ಫಲಿತಾಂಶಗಳಿಗೆ ಗಮನ ಅಗತ್ಯವಿದೆ. ಅಸಾಮಾನ್ಯ ಫಲಿತಾಂಶ ಮಾತ್ರದಿಂದ ರೋಗನಿರ್ಣಯ ಸಾಧ್ಯವಿಲ್ಲ. ವೈದ್ಯರೊಂದಿಗೆ ಚರ್ಚಿಸಿ.`
    : `ನಿಮ್ಮ ವರದಿಯಲ್ಲಿ ${s.total_parameters} ಫಲಿತಾಂಶಗಳು ಕಂಡುಬಂದಿವೆ ಮತ್ತು ಆದ್ಯತೆಯ ಫಲಿತಾಂಶ ಕಂಡುಬಂದಿಲ್ಲ. ವೈದ್ಯರೊಂದಿಗೆ ಪರಿಶೀಲಿಸುವುದು ಉತ್ತಮ.`;

  if (language === "ta") return high
    ? `உங்கள் அறிக்கையில் ${high} முன்னுரிமை முடிவுகளும் ${attention} கவனம் தேவைப்படும் முடிவுகளும் உள்ளன. இவை மட்டும் நோயறிதல் அல்ல. மருத்துவருடன் விவாதிக்கவும்.`
    : attention
    ? `உங்கள் அறிக்கையில் ${attention} முடிவுகளுக்கு கவனம் தேவை. அசாதாரண முடிவு மட்டும் நோயறிதல் அல்ல. உங்கள் மருத்துவரிடம் பேசுங்கள்.`
    : `உங்கள் அறிக்கையில் ${s.total_parameters} முடிவுகள் கண்டறியப்பட்டுள்ளன. முன்னுரிமை முடிவு இல்லை. மருத்துவருடன் அறிக்கையை மதிப்பாய்வு செய்வது நல்லது.`;

  if (language === "ml") return high
    ? `നിങ്ങളുടെ റിപ്പോർട്ടിൽ ${high} മുൻഗണനാ ഫലങ്ങളും ${attention} ശ്രദ്ധ ആവശ്യമായ ഫലങ്ങളും കണ്ടെത്തി. ഇവ മാത്രം രോഗനിർണയം അല്ല. ഡോക്ടറുമായി ചർച്ച ചെയ്യുക.`
    : attention
    ? `നിങ്ങളുടെ റിപ്പോർട്ടിൽ ${attention} ഫലങ്ങൾക്ക് ശ്രദ്ധ ആവശ്യമാണ്. അസാധാരണ ഫലം മാത്രം രോഗനിർണയം അല്ല. ഡോക്ടറുമായി ചർച്ച ചെയ്യുക.`
    : `നിങ്ങളുടെ റിപ്പോർട്ടിൽ ${s.total_parameters} ഫലങ്ങൾ കണ്ടെത്തി. മുൻഗണനാ ഫലം കണ്ടെത്തിയിട്ടില്ല. എന്നിരുന്നാലും ഡോക്ടറുമായി റിപ്പോർട്ട് പരിശോധിക്കുക.`;

  return high
    ? `Your report contains ${high} priority finding${high === 1 ? "" : "s"} and ${attention} finding${attention === 1 ? "" : "s"} needing attention. These results are not, by themselves, a diagnosis. Discuss priority findings with a qualified healthcare professional.`
    : attention
    ? `Your report contains ${attention} finding${attention === 1 ? "" : "s"} that may need attention. A result outside a reference range does not automatically mean disease. Review it with a healthcare professional.`
    : `The report contains ${s.total_parameters} detected parameters and no priority findings were flagged by the current screening rules. This does not prove that everything is normal; review it with a clinician.`;
}

export default function Home() {
  const [darkMode, setDarkMode] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("en");
  const [error, setError] = useState("");
  const [briefingOpen, setBriefingOpen] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Floating AI assistant state. This does not modify the report UI.
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi! I’m CAREBRIDGE AI. Ask me about your report, medical terms, or what you may want to discuss with a healthcare professional.",
    },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = ui[language] || ui.en;

  useEffect(() => {
    const saved = localStorage.getItem("carebridge-theme");
    if (saved === "light") setDarkMode(false);
    if (saved === "dark") setDarkMode(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("carebridge-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const briefing = useMemo(() => result ? patientBrief(result, language) : "", [result, language]);

  const chooseFile = (f: File | null) => {
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      setError(t.invalid);
      return;
    }
    setFile(f);
    setError("");
    setResult(null);
    setBriefingOpen(false);
  };

  async function analyze() {
    if (!file) {
      setError(t.uploadError);
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const response = await fetch(`${API_URL}/upload-report`, { method: "POST", body: fd });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || t.backend);
      setResult(data);
      setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : t.backend);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setFile(null);
    setResult(null);
    setError("");
    setBriefingOpen(false);
    if (inputRef.current) inputRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function sendAssistantMessage(message?: string) {
    const question = (message ?? assistantInput).trim();
    if (!question || assistantLoading) return;

    setAssistantInput("");
    setAssistantMessages(prev => [...prev, { role: "user", content: question }]);
    setAssistantLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/assistant/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: question,
          language,
          report_context: result?.extracted_text || "",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.detail || data.message || "CAREBRIDGE AI could not process your question.");
      }

      setAssistantMessages(prev => [
        ...prev,
        { role: "assistant", content: data.answer || "I could not generate an answer right now." },
      ]);
    } catch (e) {
      setAssistantMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: e instanceof Error ? e.message : "CAREBRIDGE AI could not process your question.",
        },
      ]);
    } finally {
      setAssistantLoading(false);
    }
  }

  function handleAssistantKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      void sendAssistantMessage();
    }
  }

  const overall = result ? normalizeStatus(result.risk_analysis.overall_status) : "normal";

  return (
    <div className={`carebridge ${darkMode ? "dark" : "light"}`}>
      <style jsx global>{`
        *{box-sizing:border-box} body{margin:0}
        .carebridge{--bg:#f4f8fc;--surface:#fff;--surface2:#f8fbff;--text:#10233f;--muted:#64748b;--border:#dce6f0;--primary:#1769ff;--cyan:#00a8d6;--soft:#edf5ff;--shadow:0 18px 45px rgba(15,35,65,.09);min-height:100vh;background:radial-gradient(circle at 5% 0%,rgba(23,105,255,.09),transparent 28%),radial-gradient(circle at 95% 0%,rgba(0,168,214,.08),transparent 26%),var(--bg);color:var(--text);transition:.3s}
        .carebridge.dark{--bg:#07111f;--surface:#0d192b;--surface2:#111f33;--text:#edf6ff;--muted:#9fb0c5;--border:#21344c;--soft:#10233d;--shadow:0 20px 55px rgba(0,0,0,.3)}
        .cb-nav,.cb-main{width:min(1400px,calc(100% - 36px));margin:auto}
        .cb-top{position:sticky;top:0;z-index:40;border-bottom:1px solid var(--border);background:color-mix(in srgb,var(--surface) 88%,transparent);backdrop-filter:blur(18px)}
        .cb-nav{min-height:74px;display:flex;align-items:center;justify-content:space-between;gap:20px}
        .brand{display:flex;align-items:center;gap:12px}.logo{width:43px;height:43px;border-radius:14px;display:grid;place-items:center;color:white;font-weight:900;background:linear-gradient(135deg,#1769ff,#00a8d6);box-shadow:0 9px 24px rgba(23,105,255,.25)}
        .brand h1{font-size:17px;letter-spacing:.13em;margin:0}.brand p{font-size:11px;color:var(--muted);margin:2px 0 0}
        .actions{display:flex;align-items:center;gap:10px}.lang{height:42px;border:1px solid var(--border);border-radius:12px;background:var(--surface);color:var(--text);padding:0 12px}
        .theme{width:78px;height:42px;border:1px solid var(--border);border-radius:999px;background:var(--surface);position:relative;cursor:pointer}.track{height:100%;display:flex;justify-content:space-between;align-items:center;padding:0 9px;color:var(--muted)}.knob{position:absolute;top:4px;left:4px;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:var(--primary);color:white;transition:.25s}.knob.on{transform:translateX(36px)}
        .hero{min-height:450px;display:grid;grid-template-columns:1.2fr .8fr;align-items:center;gap:35px;padding:65px 0 45px}.eyebrow{display:inline-block;padding:7px 11px;border-radius:999px;background:var(--soft);color:var(--primary);font-size:10px;font-weight:900;letter-spacing:.13em}.hero h2{font-size:clamp(42px,6vw,76px);line-height:1;letter-spacing:-.055em;margin:18px 0}.gradient{background:linear-gradient(90deg,var(--primary),var(--cyan));background-clip:text;-webkit-background-clip:text;color:transparent}.hero>div>p{max-width:680px;color:var(--muted);font-size:18px;line-height:1.7}.features{display:flex;flex-wrap:wrap;gap:9px;margin-top:22px}.feature{border:1px solid var(--border);background:var(--surface);padding:8px 11px;border-radius:999px;color:var(--muted);font-size:12px}
        .visual{height:340px;border:1px solid var(--border);border-radius:32px;background:linear-gradient(145deg,var(--surface),var(--soft));display:grid;place-items:center;position:relative;overflow:hidden;box-shadow:var(--shadow)}.visual:before,.visual:after{content:"";position:absolute;border:1px solid rgba(91,150,255,.25);border-radius:50%}.visual:before{width:270px;height:270px}.visual:after{width:190px;height:190px}.heart{width:110px;height:110px;border-radius:30px;background:linear-gradient(135deg,#1769ff,#00a8d6);display:grid;place-items:center;color:#fff;font-size:48px;z-index:2;box-shadow:0 20px 45px rgba(23,105,255,.28)}.float{position:absolute;z-index:3;padding:11px 14px;border:1px solid var(--border);border-radius:14px;background:var(--surface);box-shadow:var(--shadow);font-size:12px}.float strong{display:block;color:var(--primary);font-size:15px}.f1{top:28px;left:25px}.f2{bottom:30px;right:22px}
        .section{margin:20px 0 28px;scroll-margin-top:100px}.section-head{display:flex;justify-content:space-between;align-items:end;gap:15px;margin-bottom:16px}.kicker{color:var(--primary);font-size:10px;font-weight:900;letter-spacing:.14em}.section h3{font-size:28px;letter-spacing:-.03em;margin:3px 0}.section-head p{margin:0;color:var(--muted)}
        .upload{padding:22px;border:1px solid var(--border);border-radius:25px;background:var(--surface);box-shadow:var(--shadow)}.drop{min-height:250px;border:2px dashed #7696bd;border-radius:21px;display:grid;place-items:center;text-align:center;padding:25px;cursor:pointer;transition:.2s}.drop:hover,.drop.drag{border-color:var(--primary);background:var(--soft);transform:translateY(-2px)}.drop input{display:none}.uploadIcon{width:68px;height:68px;border-radius:21px;background:var(--soft);display:grid;place-items:center;color:var(--primary);font-size:30px;margin:auto}.drop h4{font-size:18px;margin:14px 0 5px}.drop p{color:var(--muted);font-size:13px}.file{display:inline-block;padding:8px 12px;background:var(--soft);color:var(--primary);border-radius:10px;font-size:12px;max-width:100%;overflow:hidden;text-overflow:ellipsis}
        .primary{width:100%;min-height:52px;border:0;border-radius:14px;margin-top:15px;color:white;font-weight:800;background:linear-gradient(90deg,#1769ff,#00a8d6);cursor:pointer;box-shadow:0 10px 25px rgba(23,105,255,.2)}.primary:disabled{opacity:.6;cursor:not-allowed}.spinner{display:inline-block;width:17px;height:17px;border:3px solid rgba(255,255,255,.4);border-top-color:white;border-radius:50%;animation:spin .7s linear infinite;vertical-align:-4px;margin-right:8px}@keyframes spin{to{transform:rotate(360deg)}}
        .error{margin-top:14px;padding:13px;border-radius:12px;color:#b42318;background:#fff0ee;border:1px solid #ffc8c2;font-size:13px}.dark .error{color:#ffb7af;background:#351817;border-color:#61302b}
        .empty{text-align:center;padding:60px 20px;border:1px solid var(--border);border-radius:23px;background:var(--surface)}.emptyIcon{width:70px;height:70px;border-radius:50%;display:grid;place-items:center;margin:auto auto 15px;background:var(--soft);color:var(--primary);font-size:28px}.empty h3{margin:0 0 6px}.empty p{color:var(--muted);margin:0}
        .dashHead{display:flex;justify-content:space-between;align-items:end;gap:15px;margin-bottom:16px}.reset{border:1px solid var(--border);border-radius:11px;background:var(--surface);color:var(--text);padding:10px 13px;cursor:pointer}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:13px}.status,.stat{border:1px solid var(--border);border-radius:18px;background:var(--surface);box-shadow:var(--shadow);padding:19px}.status{grid-column:span 2;display:flex;align-items:center;gap:14px}.statusIcon{width:54px;height:54px;border-radius:16px;display:grid;place-items:center;font-weight:900;font-size:23px}.status.normal .statusIcon{background:#e9f8ef;color:#16803c}.status.attention .statusIcon{background:#fff4d5;color:#a46300}.status.high .statusIcon{background:#ffe8e6;color:#c62828}.dark .status.normal .statusIcon{background:#123424;color:#8ee5aa}.dark .status.attention .statusIcon{background:#382d13;color:#ffd889}.dark .status.high .statusIcon{background:#3c1b1a;color:#ffaaa3}.status small{color:var(--muted)}.status h4{margin:3px 0;font-size:18px}.stat strong{display:block;font-size:30px}.stat span{font-size:12px;color:var(--muted)}
        .callout{margin-top:14px;border:1px solid var(--border);border-radius:17px;padding:17px;background:linear-gradient(90deg,var(--soft),transparent);display:flex;gap:12px}.callout p{margin:5px 0 0;color:var(--muted);font-size:12px}.brief{margin-top:14px;border:1px solid rgba(23,105,255,.3);border-radius:20px;overflow:hidden;background:var(--surface);box-shadow:var(--shadow)}.briefHead{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:16px 18px;background:linear-gradient(90deg,rgba(23,105,255,.12),rgba(0,168,214,.08))}.briefTitle{display:flex;align-items:center;gap:10px}.briefIcon{width:40px;height:40px;border-radius:12px;background:var(--primary);color:white;display:grid;place-items:center}.briefBody{padding:20px;line-height:1.8}.briefBody p{color:var(--muted);font-size:12px}
        .findings{display:grid;grid-template-columns:repeat(2,1fr);gap:15px}.finding{border:1px solid var(--border);border-top:4px solid #16803c;border-radius:19px;padding:18px;background:var(--surface);box-shadow:var(--shadow)}.finding.attention{border-top-color:#d08a00}.finding.high{border-top-color:#d13a32}.findingTop{display:flex;justify-content:space-between;gap:12px}.label{font-size:11px;font-weight:800;color:var(--muted);text-transform:uppercase}.value{font-size:30px;font-weight:900;margin-top:4px}.value small{font-size:12px;color:var(--muted);margin-left:5px}.pill{padding:7px 9px;border-radius:999px;font-size:10px;font-weight:800;white-space:nowrap;height:max-content}.pill.normal{background:#e9f8ef;color:#166534}.pill.attention{background:#fff4d5;color:#925d00}.pill.high{background:#ffe8e6;color:#a12620}.dark .pill.normal{background:#123424;color:#8ee5aa}.dark .pill.attention{background:#382d13;color:#ffd889}.dark .pill.high{background:#3c1b1a;color:#ffaaa3}.range{display:flex;justify-content:space-between;padding:10px 12px;border-radius:10px;background:var(--soft);margin:16px 0;font-size:12px}.range span{color:var(--muted)}.explanation{color:var(--muted);line-height:1.65}.discussion{padding:12px;border-radius:12px;background:var(--soft)}.discussion strong{font-size:12px;color:var(--primary)}.discussion p{font-size:12px;color:var(--muted);margin:5px 0 0;line-height:1.55}
        .pathway{border:1px solid var(--border);border-radius:21px;padding:22px;background:var(--surface);box-shadow:var(--shadow)}.pathStep{display:grid;grid-template-columns:58px 1fr;gap:15px;position:relative;min-height:120px}.pathStep:last-child{min-height:70px}.node{width:52px;height:52px;border-radius:50%;border:3px solid var(--border);background:var(--surface2);display:grid;place-items:center;color:var(--muted);font-weight:900;z-index:2}.node.complete{border-color:#16803c;color:#16803c}.node.current{border-color:var(--primary);color:var(--primary);box-shadow:0 0 0 7px rgba(23,105,255,.08)}.line{position:absolute;left:25px;top:52px;bottom:0;width:2px;background:linear-gradient(#5b96ff,#dce7f5)}.pathContent{padding:3px 0 22px}.pathContent small{color:var(--primary);font-weight:900;letter-spacing:.1em}.pathContent h4{margin:4px 0 5px;font-size:18px}.pathContent p{margin:0;color:var(--muted);line-height:1.6}
        .next{margin-top:15px;padding:22px;border-radius:21px;background:linear-gradient(135deg,#0b1f3a,#1455b8);color:#fff;display:grid;grid-template-columns:65px 1fr;gap:15px;box-shadow:var(--shadow)}.nextIcon{width:55px;height:55px;border-radius:15px;background:rgba(255,255,255,.13);display:grid;place-items:center;font-size:25px}.next h3{margin:0 0 5px}.next p{margin:0;color:#d8e8ff}.questions{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:12px}.question{padding:14px;border:1px solid var(--border);border-radius:13px;background:var(--surface);font-size:13px}.question b{color:var(--primary);margin-right:7px}.safety{margin-top:15px;padding:14px;border:1px solid var(--border);border-radius:14px;color:var(--muted);font-size:12px;line-height:1.6;display:flex;gap:9px}.footer{border-top:1px solid var(--border);margin-top:55px;padding:28px 0 38px;display:flex;justify-content:space-between;color:var(--muted);font-size:12px}.footer strong{color:var(--text);letter-spacing:.1em;margin-right:9px}
        /* ================= AI ASSISTANT ================= */
        .aiLauncher{position:fixed;right:28px;bottom:28px;width:64px;height:64px;border:0;border-radius:50%;background:linear-gradient(135deg,#1769ff,#00a8d6);color:#fff;font-size:29px;display:grid;place-items:center;cursor:pointer;z-index:100;box-shadow:0 16px 40px rgba(23,105,255,.35);transition:transform .2s,box-shadow .2s}.aiLauncher:hover{transform:translateY(-3px) scale(1.03);box-shadow:0 20px 48px rgba(23,105,255,.45)}
        .aiPanel{position:fixed;right:28px;bottom:104px;width:min(390px,calc(100vw - 32px));height:min(590px,calc(100vh - 135px));display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--border);border-radius:24px;background:var(--surface);box-shadow:0 24px 70px rgba(0,0,0,.28);z-index:99}
        .aiHeader{padding:16px 17px;background:linear-gradient(135deg,#0b1f3a,#1455b8);color:#fff;display:flex;align-items:center;justify-content:space-between;gap:12px}.aiHeaderLeft{display:flex;align-items:center;gap:11px}.aiAvatar{width:40px;height:40px;border-radius:13px;background:rgba(255,255,255,.15);display:grid;place-items:center;font-size:20px}.aiHeader strong{display:block;font-size:14px}.aiHeader small{display:block;margin-top:2px;color:#cfe2ff;font-size:10px}.aiClose{width:32px;height:32px;border:1px solid rgba(255,255,255,.25);border-radius:10px;background:rgba(255,255,255,.08);color:#fff;cursor:pointer;font-size:18px}
        .aiMessages{flex:1;overflow-y:auto;padding:15px;background:var(--surface2);display:flex;flex-direction:column;gap:10px}.aiMessage{max-width:88%;padding:11px 13px;border-radius:15px;font-size:12px;line-height:1.55;white-space:pre-wrap;word-break:break-word}.aiMessage.user{align-self:flex-end;background:linear-gradient(135deg,#1769ff,#147fdd);color:#fff;border-bottom-right-radius:5px}.aiMessage.assistant{align-self:flex-start;background:var(--surface);color:var(--text);border:1px solid var(--border);border-bottom-left-radius:5px}.aiTyping{display:flex;align-items:center;gap:5px;padding:10px 13px;width:max-content;border:1px solid var(--border);border-radius:15px;background:var(--surface)}.aiTyping span{width:6px;height:6px;border-radius:50%;background:var(--primary);animation:aiBounce 1s infinite ease-in-out}.aiTyping span:nth-child(2){animation-delay:.15s}.aiTyping span:nth-child(3){animation-delay:.3s}@keyframes aiBounce{0%,80%,100%{transform:translateY(0);opacity:.45}40%{transform:translateY(-4px);opacity:1}}
        .aiSuggestions{padding:10px 12px 0;background:var(--surface);display:flex;gap:7px;overflow-x:auto}.aiSuggestion{flex:0 0 auto;border:1px solid var(--border);border-radius:999px;background:var(--surface2);color:var(--text);padding:7px 10px;font-size:10px;cursor:pointer}.aiSuggestion:hover{border-color:var(--primary);color:var(--primary)}
        .aiComposer{padding:12px;background:var(--surface);border-top:1px solid var(--border);display:flex;gap:8px}.aiInput{flex:1;min-width:0;height:42px;border:1px solid var(--border);border-radius:12px;background:var(--surface2);color:var(--text);padding:0 12px;outline:none;font-size:12px}.aiInput:focus{border-color:var(--primary);box-shadow:0 0 0 3px rgba(23,105,255,.1)}.aiSend{width:44px;height:42px;border:0;border-radius:12px;background:linear-gradient(135deg,#1769ff,#00a8d6);color:#fff;cursor:pointer;font-size:17px}.aiSend:disabled{opacity:.5;cursor:not-allowed}.aiDisclaimer{padding:7px 12px 11px;background:var(--surface);color:var(--muted);font-size:9px;line-height:1.4}
        @media(max-width:900px){.hero{grid-template-columns:1fr}.visual{height:280px}.stats{grid-template-columns:1fr 1fr}.status{grid-column:span 2}.findings{grid-template-columns:1fr}}
        @media(max-width:620px){.aiLauncher{right:18px;bottom:18px}.aiPanel{right:16px;bottom:94px;width:calc(100vw - 32px);height:min(600px,calc(100vh - 115px))}.cb-nav,.cb-main{width:calc(100% - 22px)}.brand p{display:none}.lang{max-width:105px}.hero{padding:40px 0}.hero h2{font-size:43px}.hero>div>p{font-size:15px}.footer{flex-direction:column;gap:10px}.questions{grid-template-columns:1fr}}
      `}</style>

      <header className="cb-top">
        <nav className="cb-nav">
          <div className="brand">
            <div className="logo">✚</div>
            <div><h1>CAREBRIDGE</h1><p>Clinical Pathway Intelligence</p></div>
          </div>
          <div className="actions">
            <select className="lang" aria-label={t.language} value={language} onChange={e => setLanguage(e.target.value)}>
              {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
            <button className="theme" type="button" onClick={() => setDarkMode(v => !v)} aria-label="Toggle dark light mode" title={darkMode ? "Light mode" : "Dark mode"}>
              <span className="track"><span>☀</span><span>☾</span></span>
              <span className={`knob ${darkMode ? "on" : ""}`}>{darkMode ? "☾" : "☀"}</span>
            </button>
          </div>
        </nav>
      </header>

      <main className="cb-main">
        <section className="hero">
          <div>
            <span className="eyebrow">PATIENT-CENTRIC HEALTH INTELLIGENCE</span>
            <h2>{t.title.split(",")[0]}<br/><span className="gradient">{t.title.includes(",") ? t.title.split(",").slice(1).join(",") : ""}</span></h2>
            <p>{t.subtitle}</p>
            <div className="features">
              <span className="feature">✓ Plain-language insights</span>
              <span className="feature">✓ Visual care pathway</span>
              <span className="feature">✓ 6 languages</span>
              <span className="feature">✓ Patient-first design</span>
            </div>
          </div>
          <div className="visual">
            <div className="heart">♥</div>
            <div className="float f1"><strong>AI</strong>Report analysis</div>
            <div className="float f2"><strong>→</strong>Next-step guidance</div>
          </div>
        </section>

        <section className="section">
          <div className="section-head"><div><span className="kicker">01 / START HERE</span><h3>{t.upload}</h3><p>PDF laboratory, diagnostic or medical report.</p></div></div>
          <div className="upload">
            <label className={`drop ${dragging ? "drag" : ""}`}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); chooseFile(e.dataTransfer.files?.[0] || null); }}>
              <input ref={inputRef} type="file" accept="application/pdf,.pdf" onChange={e => chooseFile(e.target.files?.[0] || null)} />
              <div>
                <div className="uploadIcon">↑</div>
                <h4>{file ? file.name : t.choose}</h4>
                <p>{t.browse}</p>
                {file && <span className="file">PDF · {(file.size / 1024 / 1024).toFixed(2)} MB</span>}
              </div>
            </label>
            <button className="primary" disabled={loading} onClick={analyze}>
              {loading ? <><span className="spinner"/> {t.analyzing}</> : <>{t.analyze} →</>}
            </button>
            {error && <div className="error">⚠ {error}</div>}
          </div>
        </section>

        {!result && !loading && <section className="empty"><div className="emptyIcon">♡</div><h3>{t.noReport}</h3><p>{t.noReportSub}</p></section>}
        {loading && <section className="empty"><div className="emptyIcon">◌</div><h3>{t.analyzing}</h3><p>Reading the uploaded PDF and organizing detected medical parameters.</p></section>}

        {result && (
          <div id="results">
            <section className="section">
              <div className="dashHead">
                <div><span className="kicker">02 / ANALYSIS</span><h3>{t.overview}</h3><p>{t.report}: {result.filename} · {result.pages} {t.pages}</p></div>
                <button className="reset" onClick={reset}>↻ {t.reset}</button>
              </div>
              <div className="stats">
                <div className={`status ${overall}`}><div className="statusIcon">{overall === "normal" ? "✓" : "!"}</div><div><small>Overall screening status</small><h4>{statusText(result.risk_analysis.overall_status,t)}</h4></div></div>
                <div className="stat"><strong>{result.risk_analysis.summary.total_parameters}</strong><span>{t.parameters}</span></div>
                <div className="stat"><strong>{result.risk_analysis.summary.high_priority}</strong><span>{t.priority}</span></div>
                <div className="stat"><strong>{result.risk_analysis.summary.attention}</strong><span>{t.followup}</span></div>
                <div className="stat"><strong>{result.risk_analysis.summary.normal}</strong><span>{t.safe}</span></div>
              </div>
              <div className="callout"><span>💡</span><div><strong>{result.risk_analysis.overall_message}</strong><p>{t.report} analysis is based on the information extracted from your uploaded document.</p></div></div>
              <div className="brief">
                <div className="briefHead"><div className="briefTitle"><div className="briefIcon">✦</div><div><strong>{t.briefing}</strong><br/><small>{languages.find(x => x.code === language)?.name}</small></div></div><button className="reset" onClick={() => setBriefingOpen(v => !v)}>{briefingOpen ? "− Hide" : "✦ " + t.explain}</button></div>
                {briefingOpen && <div className="briefBody"><strong>{briefing}</strong><p>{result.risk_analysis.safety_note}</p></div>}
              </div>
            </section>

            <section className="section">
              <div className="section-head"><div><span className="kicker">03 / UNDERSTAND</span><h3>{t.findings}</h3><p>Values, reference ranges and patient-facing explanations.</p></div></div>
              <div className="findings">
                {result.risk_analysis.findings.map((f,i) => {
                  const state = normalizeStatus(f.status);
                  const p = result.medical_data.parameters[f.parameter];
                  return <article className={`finding ${state}`} key={`${f.parameter}-${i}`}>
                    <div className="findingTop"><div><div className="label">{f.parameter}</div><div className="value">{f.value}<small>{f.unit || p?.unit || ""}</small></div></div><span className={`pill ${state}`}>{statusText(f.status,t)}</span></div>
                    <div className="range"><span>{t.reference}</span><strong>{p?.reference_low ?? "—"} – {p?.reference_high ?? "—"}</strong></div>
                    <p className="explanation">{f.explanation}</p>
                    <div className="discussion"><strong>💬 {t.discuss}</strong><p>{f.recommended_discussion}</p></div>
                  </article>;
                })}
                {result.risk_analysis.findings.length === 0 && <div className="empty" style={{gridColumn:"1/-1"}}><h3>No flagged findings</h3><p>{result.medical_data.message}</p></div>}
              </div>
            </section>

            <section className="section">
              <div className="section-head"><div><span className="kicker">04 / NAVIGATE</span><h3>{t.pathway}</h3><p>A visual sequence of the pathway returned by your clinical pathway engine.</p></div></div>
              <div className="pathway">
                {result.risk_analysis.pathway.map((s,i) => {
                  const st=(s.status||"").toLowerCase(); const complete=["complete","completed"].includes(st); const current=["current","active","in_progress"].includes(st);
                  return <div className="pathStep" key={`${s.stage}-${i}`}>
                    <div className={`node ${complete ? "complete" : current ? "current" : ""}`}>{complete ? "✓" : i+1}</div>
                    {i < result.risk_analysis.pathway.length-1 && <div className="line"/>}
                    <div className="pathContent"><small>{t.step} {String(i+1).padStart(2,"0")} · {complete ? t.completed : current ? t.current : t.upcoming}</small><h4>{s.stage}</h4><p>{s.description}</p></div>
                  </div>;
                })}
              </div>
            </section>

            <section className="section">
              <div className="next"><div className="nextIcon">→</div><div><h3>{t.next}</h3><p>Use these questions to make your next healthcare conversation more useful.</p></div></div>
              <div className="questions">{[t.q1,t.q2,t.q3,t.q4].map((q,i)=><div className="question" key={q}><b>0{i+1}</b>{q}</div>)}</div>
              <div className="safety"><span>ⓘ</span><div><strong>{t.safety}</strong><br/>{result.risk_analysis.safety_note}</div></div>
            </section>
          </div>
        )}

        {/* ================= FLOATING AI ASSISTANT ================= */}
        {assistantOpen && (
          <section className="aiPanel" aria-label="CAREBRIDGE AI Assistant">
            <div className="aiHeader">
              <div className="aiHeaderLeft">
                <div className="aiAvatar">✦</div>
                <div>
                  <strong>CAREBRIDGE AI</strong>
                  <small>RAG-powered health literacy assistant</small>
                </div>
              </div>
              <button className="aiClose" type="button" onClick={() => setAssistantOpen(false)} aria-label="Close AI assistant">×</button>
            </div>

            <div className="aiMessages">
              {assistantMessages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`aiMessage ${message.role}`}>
                  {message.content}
                </div>
              ))}
              {assistantLoading && (
                <div className="aiTyping" aria-label="CAREBRIDGE AI is typing">
                  <span></span><span></span><span></span>
                </div>
              )}
            </div>

            <div className="aiSuggestions">
              <button className="aiSuggestion" type="button" onClick={() => void sendAssistantMessage("Explain my report simply")}>Explain my report</button>
              <button className="aiSuggestion" type="button" onClick={() => void sendAssistantMessage("What is the most important finding?")}>Most important finding</button>
              <button className="aiSuggestion" type="button" onClick={() => void sendAssistantMessage("What should I discuss with my healthcare professional?")}>What should I discuss?</button>
            </div>

            <div className="aiComposer">
              <input className="aiInput" value={assistantInput} onChange={e => setAssistantInput(e.target.value)} onKeyDown={handleAssistantKeyDown} placeholder="Ask CAREBRIDGE AI..." aria-label="Ask CAREBRIDGE AI" disabled={assistantLoading} />
              <button className="aiSend" type="button" onClick={() => void sendAssistantMessage()} disabled={!assistantInput.trim() || assistantLoading} aria-label="Send message">➤</button>
            </div>
            <div className="aiDisclaimer">CAREBRIDGE AI provides educational and patient-navigation information. It does not diagnose conditions or replace a healthcare professional.</div>
          </section>
        )}

        <button className="aiLauncher" type="button" onClick={() => setAssistantOpen(v => !v)} aria-label={assistantOpen ? "Close CAREBRIDGE AI Assistant" : "Open CAREBRIDGE AI Assistant"} title="CAREBRIDGE AI Assistant">
          {assistantOpen ? "×" : "✦"}
        </button>

        <footer className="footer"><div><strong>CAREBRIDGE</strong> Patient-first clinical pathway intelligence</div><div>Accessible · Understandable · Transparent</div></footer>
      </main>
    </div>
  );
}