"use client";

import { useEffect, useMemo, useState } from "react";

type FindingStatus = "normal" | "attention" | "high";

type Finding = {
  name: string;
  value: string;
  status: FindingStatus;
  explanation: string;
};

type ReportData = {
  success?: boolean;
  filename?: string;
  pages?: number;
  medical_data?: Record<string, any>;
  risk_analysis?: any;
  extracted_text?: string;
};

type PathwayStep = {
  number: string;
  icon: string;
  title: string;
  description: string;
  action: string;
  active?: boolean;
};

const languages = [
  "English",
  "हिंदी",
  "తెలుగు",
  "ಕನ್ನಡ",
  "தமிழ்",
  "മലയാളം",
];

export default function Dashboard() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [language, setLanguage] = useState("English");
  const [briefing, setBriefing] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [showRawText, setShowRawText] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("carebridge_result");

    if (!saved) return;

    try {
      setReport(JSON.parse(saved));
    } catch (error) {
      console.error("Unable to load CAREBRIDGE report:", error);
    }
  }, []);

  const findings = useMemo(
    () => buildFindings(report?.medical_data),
    [report]
  );

  const pathway = useMemo(
    () => buildPathway(findings, report?.risk_analysis),
    [findings, report]
  );

  const questions = useMemo(
    () => buildDoctorQuestions(findings),
    [findings]
  );

  useEffect(() => {
    setBriefing(createBriefing(language, findings, report));
  }, [language, findings, report]);

  if (!report) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f8fb] px-6">
        <div className="max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50 text-3xl">
            📄
          </div>

          <h1 className="mt-5 text-2xl font-extrabold">
            No report found
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Upload a medical report from the CAREBRIDGE home page to begin.
          </p>

          <a
            href="/"
            className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"
          >
            Upload report
          </a>
        </div>
      </main>
    );
  }

  const attentionCount = findings.filter(
    (item) => item.status !== "normal"
  ).length;

  const highCount = findings.filter(
    (item) => item.status === "high"
  ).length;

  return (
    <main className="min-h-screen bg-[#f4f8fb] text-slate-900">
      {/* HEADER */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 font-bold text-white shadow-lg">
              C
            </div>

            <div>
              <div className="font-extrabold">
                CARE<span className="text-cyan-600">BRIDGE</span>
              </div>

              <div className="hidden text-xs text-slate-500 sm:block">
                Patient Navigation Platform
              </div>
            </div>
          </a>

          <div className="flex items-center gap-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-cyan-500"
            >
              {languages.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <a
              href="/"
              className="hidden rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white sm:block"
            >
              + New report
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        {/* HERO */}

        <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-7 text-white shadow-2xl lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-bold text-cyan-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                REPORT PROCESSED
              </div>

              <h1 className="max-w-3xl text-3xl font-extrabold leading-tight sm:text-4xl">
                Understand your report.
                <span className="block text-cyan-300">
                  Know what to discuss next.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                CAREBRIDGE organizes medical information into a patient-friendly
                pathway. It does not diagnose or prescribe treatment.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-xs uppercase tracking-wider text-slate-400">
                Report
              </p>

              <p className="mt-1 max-w-xs truncate font-bold">
                {report.filename || "Medical report"}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                {report.pages || 0} page(s)
              </p>
            </div>
          </div>
        </section>

        {/* OVERVIEW */}

        <section className="mt-8">
          <SectionHeading
            eyebrow="01 · Health at a glance"
            title="Start with the important information"
            description="A simple overview of what CAREBRIDGE found in the uploaded report."
          />

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon="📄"
              title="Report"
              value={`${report.pages || 0} pages`}
              text="Processed successfully"
            />

            <StatCard
              icon="🔬"
              title="Findings"
              value={`${findings.length}`}
              text="Structured parameters"
            />

            <StatCard
              icon="⚠️"
              title="Attention"
              value={`${attentionCount}`}
              text="Worth discussing"
            />

            <StatCard
              icon="🔴"
              title="Priority"
              value={`${highCount}`}
              text="Higher-priority findings"
            />
          </div>
        </section>

        {/* PRIORITY */}

        <section className="mt-8">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
            <SectionHeading
              eyebrow="02 · Priority"
              title="What deserves your attention?"
              description="This is an information-organizing layer, not a medical diagnosis."
            />

            <div className="mt-7">
              {findings.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="space-y-4">
                  {findings.map((finding, index) => (
                    <PriorityRow
                      key={`${finding.name}-${index}`}
                      finding={finding}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* INTELLIGENT PATHWAY */}

        <section className="mt-8">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
            <SectionHeading
              eyebrow="03 · Patient pathway"
              title="From report → understanding → care discussion"
              description="The pathway adapts to the information extracted from your report."
            />

            <div className="mt-8 overflow-x-auto pb-5">
              <div className="flex min-w-[1050px] items-stretch gap-3">
                {pathway.map((step, index) => (
                  <div key={step.number} className="flex items-center gap-3">
                    <PathwayNode step={step} />

                    {index < pathway.length - 1 && (
                      <div className="flex items-center">
                        <div className="h-px w-12 bg-slate-300" />
                        <span className="text-xl text-cyan-500">→</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-cyan-100 bg-cyan-50 p-5">
              <div className="flex gap-3">
                <span className="text-xl">💡</span>

                <div>
                  <p className="font-bold text-cyan-900">
                    Why this pathway matters
                  </p>

                  <p className="mt-1 text-sm leading-6 text-cyan-800">
                    A report is only one part of healthcare. The important
                    transition is from receiving information to understanding
                    it and discussing the appropriate next step with a
                    qualified professional.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FINDINGS */}

        <section className="mt-8">
          <SectionHeading
            eyebrow="04 · Findings explained"
            title="What do these numbers mean?"
            description="CAREBRIDGE translates extracted parameters into simpler language."
          />

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {findings.length > 0 ? (
              findings.map((finding, index) => (
                <FindingCard
                  key={`${finding.name}-${index}`}
                  finding={finding}
                />
              ))
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-8">
                <EmptyState />
              </div>
            )}
          </div>
        </section>

        {/* DOCTOR QUESTIONS */}

        <section className="mt-8">
          <div className="rounded-[2rem] bg-gradient-to-br from-cyan-600 to-blue-700 p-6 text-white shadow-xl lg:p-8">
            <SectionHeading
              light
              eyebrow="05 · Doctor visit"
              title="Questions you can take to your doctor"
              description="Instead of leaving the clinic wondering what you forgot to ask."
            />

            <div className="mt-7 grid gap-3 md:grid-cols-2">
              {questions.map((question, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur"
                >
                  <div className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-bold">
                      {index + 1}
                    </span>

                    <p className="text-sm leading-6 text-blue-50">
                      {question}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MULTILINGUAL */}

        <section className="mt-8">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
            <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr]">
              <div>
                <SectionHeading
                  eyebrow="06 · Understand in your language"
                  title="Your report, in language you are comfortable with"
                  description="Useful for patients and families who prefer regional languages."
                />

                <div className="mt-6">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold outline-none"
                  >
                    {languages.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => speakText(briefing, setSpeaking)}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-slate-800"
                >
                  {speaking ? "🔊 Speaking..." : "🔊 Listen to briefing"}
                </button>
              </div>

              <div className="rounded-3xl bg-gradient-to-br from-slate-50 to-cyan-50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-cyan-600">
                      Patient briefing
                    </p>

                    <h3 className="mt-2 text-xl font-extrabold">
                      {language}
                    </h3>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
                    🌐
                  </div>
                </div>

                <p className="mt-6 text-sm leading-7 text-slate-700">
                  {briefing}
                </p>

                <div className="mt-6 rounded-2xl border border-cyan-100 bg-white/70 p-4 text-xs leading-5 text-slate-500">
                  This briefing is designed to improve understanding. It is
                  not a diagnosis or a substitute for professional medical
                  advice.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAMILY MODE */}

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
            <p className="text-sm font-bold uppercase tracking-widest text-cyan-600">
              07 · Family mode
            </p>

            <h2 className="mt-2 text-2xl font-extrabold">
              Help your family understand
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Medical terminology can make communication difficult. This
              simplified briefing focuses on what the family should know and
              what should be discussed with the doctor.
            </p>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <p className="text-sm leading-7 text-slate-700">
                The uploaded report contains medical information that should
                be reviewed with a healthcare professional. Some findings have
                been highlighted by CAREBRIDGE for discussion. Previous reports,
                medicines and relevant symptoms should be shared during the
                consultation.
              </p>
            </div>

            <button
              onClick={() =>
                navigator.clipboard?.writeText(
                  briefing
                )
              }
              className="mt-5 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold transition hover:bg-slate-50"
            >
              Copy briefing
            </button>
          </div>

          <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl lg:p-8">
            <p className="text-sm font-bold uppercase tracking-widest text-cyan-400">
              08 · Follow-up
            </p>

            <h2 className="mt-2 text-2xl font-extrabold">
              Don't lose the story over time
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-300">
              One report is only a snapshot. CAREBRIDGE is designed to
              eventually compare future reports and show meaningful changes
              across time.
            </p>

            <div className="mt-7 space-y-3">
              <TimelineItem
                icon="📄"
                title="Current report"
                text="Information extracted today"
              />

              <TimelineItem
                icon="↔️"
                title="Compare future reports"
                text="Understand what changed"
              />

              <TimelineItem
                icon="📈"
                title="Track trends"
                text="View measurements over time"
              />
            </div>
          </div>
        </section>

        {/* RAW TEXT */}

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <button
            onClick={() => setShowRawText(!showRawText)}
            className="flex w-full items-center justify-between text-left"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Advanced
              </p>

              <h2 className="mt-1 text-xl font-extrabold">
                View original extracted text
              </h2>
            </div>

            <span className="text-xl">
              {showRawText ? "⌃" : "⌄"}
            </span>
          </button>

          {showRawText && (
            <pre className="mt-5 max-h-96 overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-5 text-xs leading-6 text-slate-300">
              {report.extracted_text || "No extracted text available."}
            </pre>
          )}
        </section>

        {/* SAFETY */}

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
          <strong>Important:</strong> CAREBRIDGE is an educational and
          patient-navigation platform. It does not diagnose conditions,
          prescribe medicines, or replace qualified medical care. Any result
          that concerns you should be discussed with an appropriate healthcare
          professional.
        </div>
      </div>
    </main>
  );
}

/* ================================================= */
/* PATHWAY ENGINE                                    */
/* ================================================= */

function buildPathway(
  findings: Finding[],
  riskAnalysis: any
): PathwayStep[] {
  const hasHigh = findings.some((item) => item.status === "high");
  const hasAttention = findings.some(
    (item) => item.status === "attention"
  );

  const pathway: PathwayStep[] = [
    {
      number: "01",
      icon: "📄",
      title: "Report received",
      description: "Medical report uploaded",
      action: "Information extracted from the document.",
    },
    {
      number: "02",
      icon: "🔎",
      title: "Findings identified",
      description:
        findings.length > 0
          ? `${findings.length} parameter(s) identified`
          : "No structured values detected",
      action: "Review the highlighted information.",
      active: findings.length > 0,
    },
  ];

  if (hasHigh) {
    pathway.push({
      number: "03",
      icon: "⚠️",
      title: "Priority review",
      description: "Higher-priority information found",
      action: "Discuss the relevant findings promptly with a healthcare professional.",
      active: true,
    });
  } else if (hasAttention) {
    pathway.push({
      number: "03",
      icon: "💬",
      title: "Discussion",
      description: "Some information needs context",
      action: "Ask your healthcare professional how the findings relate to you.",
      active: true,
    });
  } else {
    pathway.push({
      number: "03",
      icon: "🩺",
      title: "Professional review",
      description: "Put the report into context",
      action: "Discuss the report with your healthcare professional.",
      active: true,
    });
  }

  pathway.push(
    {
      number: "04",
      icon: "📋",
      title: "Care discussion",
      description: "Understand professional recommendations",
      action: "Follow the care plan provided by your healthcare team.",
    },
    {
      number: "05",
      icon: "📈",
      title: "Follow-up",
      description: "Track when advised",
      action: "Keep future reports so changes can be compared.",
    }
  );

  return pathway;
}

/* ================================================= */
/* BRIEFING ENGINE                                   */
/* ================================================= */

function createBriefing(
  language: string,
  findings: Finding[],
  report: ReportData | null
) {
  const count = findings.length;
  const attention = findings.filter(
    (item) => item.status !== "normal"
  ).length;

  if (language === "हिंदी") {
    return `आपकी रिपोर्ट CAREBRIDGE द्वारा व्यवस्थित की गई है। रिपोर्ट में ${count} महत्वपूर्ण पैरामीटर पहचाने गए हैं और ${attention} जानकारी ऐसी है जिस पर डॉक्टर से चर्चा करना उपयोगी हो सकता है। यह रिपोर्ट किसी बीमारी का निदान नहीं करती। कृपया अपनी रिपोर्ट, पिछली रिपोर्ट और दवाओं की जानकारी अपने स्वास्थ्य विशेषज्ञ के साथ साझा करें।`;
  }

  if (language === "తెలుగు") {
    return `మీ వైద్య నివేదికను CAREBRIDGE సులభంగా అర్థం చేసుకునే విధంగా ఏర్పాటు చేసింది. నివేదికలో ${count} ముఖ్యమైన పరామితులు గుర్తించబడ్డాయి. వాటిలో ${attention} అంశాలను వైద్య నిపుణుడితో చర్చించడం ఉపయోగకరంగా ఉండవచ్చు. ఇది వైద్య నిర్ధారణ కాదు. మీ నివేదికను మరియు ఇతర వైద్య సమాచారాన్ని మీ ఆరోగ్య నిపుణుడితో పంచుకోండి.`;
  }

  if (language === "ಕನ್ನಡ") {
    return `ನಿಮ್ಮ ವೈದ್ಯಕೀಯ ವರದಿಯನ್ನು CAREBRIDGE ಸುಲಭವಾಗಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವ ರೀತಿಯಲ್ಲಿ ವ್ಯವಸ್ಥೆ ಮಾಡಿದೆ. ವರದಿಯಲ್ಲಿ ${count} ಪ್ರಮುಖ ಅಂಶಗಳನ್ನು ಗುರುತಿಸಲಾಗಿದೆ. ಅವುಗಳಲ್ಲಿ ${attention} ಅಂಶಗಳನ್ನು ವೈದ್ಯಕೀಯ ತಜ್ಞರೊಂದಿಗೆ ಚರ್ಚಿಸುವುದು ಉಪಯುಕ್ತವಾಗಬಹುದು. ಇದು ವೈದ್ಯಕೀಯ ನಿರ್ಣಯವಲ್ಲ. ನಿಮ್ಮ ವರದಿಯನ್ನು ಆರೋಗ್ಯ ತಜ್ಞರೊಂದಿಗೆ ಹಂಚಿಕೊಳ್ಳಿ.`;
  }

  if (language === "தமிழ்") {
    return `உங்கள் மருத்துவ அறிக்கையை CAREBRIDGE எளிதாக புரிந்துகொள்ளும் வகையில் ஒழுங்குபடுத்தியுள்ளது. அறிக்கையில் ${count} முக்கியமான அளவீடுகள் கண்டறியப்பட்டுள்ளன. அவற்றில் ${attention} அம்சங்களை மருத்துவருடன் விவாதிப்பது பயனுள்ளதாக இருக்கலாம். இது மருத்துவ நோயறிதல் அல்ல. உங்கள் அறிக்கையை சுகாதார நிபுணருடன் பகிர்ந்து கொள்ளுங்கள்.`;
  }

  if (language === "മലയാളം") {
    return `നിങ്ങളുടെ മെഡിക്കൽ റിപ്പോർട്ട് CAREBRIDGE എളുപ്പത്തിൽ മനസ്സിലാക്കാവുന്ന രീതിയിൽ ക്രമീകരിച്ചിട്ടുണ്ട്. റിപ്പോർട്ടിൽ ${count} പ്രധാന ഘടകങ്ങൾ കണ്ടെത്തിയിട്ടുണ്ട്. അതിൽ ${attention} കാര്യങ്ങൾ ആരോഗ്യ വിദഗ്ധനുമായി ചർച്ച ചെയ്യുന്നത് സഹായകരമായേക്കാം. ഇത് ഒരു മെഡിക്കൽ രോഗനിർണയം അല്ല. നിങ്ങളുടെ റിപ്പോർട്ട് ആരോഗ്യ വിദഗ്ധനുമായി പങ്കിടുക.`;
  }

  return `Your medical report has been organized by CAREBRIDGE. We identified ${count} structured parameter(s), with ${attention} item(s) that may be useful to discuss with a healthcare professional. This is not a diagnosis. Take your report, previous reports when available, and medication information to your healthcare consultation.`;
}

/* ================================================= */
/* DOCTOR QUESTIONS                                  */
/* ================================================= */

function buildDoctorQuestions(findings: Finding[]) {
  const questions = [
    "Can you explain the important findings in my report in simple language?",
    "Which findings are most relevant to my current health situation?",
    "Do these results need to be compared with any previous reports?",
    "Do I need any follow-up testing or monitoring?",
    "What symptoms or changes should I tell you about?",
  ];

  if (findings.some((f) => f.status !== "normal")) {
    questions.unshift(
      "Which of the highlighted findings should I be most concerned about?"
    );
  }

  return questions.slice(0, 6);
}

/* ================================================= */
/* FINDINGS                                          */
/* ================================================= */

function buildFindings(
  medicalData?: Record<string, any>
): Finding[] {
  if (!medicalData || typeof medicalData !== "object") {
    return [];
  }

  const findings: Finding[] = [];

  Object.entries(medicalData).forEach(([key, rawValue]) => {
    if (
      rawValue === null ||
      rawValue === undefined ||
      rawValue === ""
    ) {
      return;
    }

    const name = formatName(key);
    const value = String(rawValue);

    findings.push({
      name,
      value,
      status: inferStatus(name, value),
      explanation: explainParameter(name, value),
    });
  });

  return findings.slice(0, 16);
}

function inferStatus(
  name: string,
  value: string
): FindingStatus {
  const match = value.match(/[-+]?\d*\.?\d+/);

  if (!match) {
    return "attention";
  }

  const number = Number(match[0]);
  const lower = name.toLowerCase();

  if (lower.includes("hba1c")) {
    if (number >= 9) return "high";
    if (number >= 6.5) return "attention";
    return "normal";
  }

  if (
    lower.includes("systolic") ||
    lower.includes("blood pressure")
  ) {
    if (number >= 160) return "high";
    if (number >= 140) return "attention";
    return "normal";
  }

  if (lower.includes("ldl")) {
    if (number >= 190) return "high";
    if (number >= 130) return "attention";
    return "normal";
  }

  if (lower.includes("hemoglobin")) {
    if (number < 8) return "high";
    if (number < 11) return "attention";
    return "normal";
  }

  return "attention";
}

function explainParameter(name: string, value: string) {
  const lower = name.toLowerCase();

  if (lower.includes("hba1c")) {
    return `HbA1c reflects average blood glucose over a period of time. The report value is ${value}. Your healthcare professional should interpret this together with your history and other results.`;
  }

  if (lower.includes("ldl")) {
    return `LDL cholesterol is one measurement used when assessing cardiovascular health. The report value is ${value}. Your clinician can interpret it alongside your other risk factors.`;
  }

  if (
    lower.includes("blood pressure") ||
    lower.includes("systolic")
  ) {
    return `Blood pressure measures pressure within the arteries. The report shows ${value}. Interpretation should consider repeated measurements and your overall health.`;
  }

  if (lower.includes("hemoglobin")) {
    return `Hemoglobin is a protein in red blood cells that carries oxygen. The reported value is ${value}. Your healthcare professional can interpret this with the rest of your blood count and symptoms.`;
  }

  return `The report contains ${name} with a value of ${value}. The meaning depends on the laboratory reference range and your individual medical context.`;
}

/* ================================================= */
/* SPEECH                                            */
/* ================================================= */

function speakText(
  text: string,
  setSpeaking: (value: boolean) => void
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    alert("Speech playback is not supported by this browser.");
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.onstart = () => setSpeaking(true);
  utterance.onend = () => setSpeaking(false);
  utterance.onerror = () => setSpeaking(false);

  window.speechSynthesis.speak(utterance);
}

/* ================================================= */
/* UI COMPONENTS                                     */
/* ================================================= */

function SectionHeading({
  eyebrow,
  title,
  description,
  light = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  light?: boolean;
}) {
  return (
    <div>
      <p
        className={`text-sm font-bold uppercase tracking-widest ${
          light ? "text-cyan-200" : "text-cyan-600"
        }`}
      >
        {eyebrow}
      </p>

      <h2
        className={`mt-2 text-2xl font-extrabold ${
          light ? "text-white" : "text-slate-900"
        }`}
      >
        {title}
      </h2>

      <p
        className={`mt-2 max-w-2xl text-sm leading-6 ${
          light ? "text-blue-100" : "text-slate-500"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

function StatCard({
  icon,
  title,
  value,
  text,
}: {
  icon: string;
  title: string;
  value: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-xl">
        {icon}
      </div>

      <p className="mt-5 text-sm font-semibold text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-2xl font-extrabold">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {text}
      </p>
    </div>
  );
}

function PriorityRow({
  finding,
}: {
  finding: Finding;
}) {
  const isHigh = finding.status === "high";
  const isAttention = finding.status === "attention";

  return (
    <div
      className={`rounded-2xl border p-5 ${
        isHigh
          ? "border-red-200 bg-red-50"
          : isAttention
            ? "border-amber-200 bg-amber-50"
            : "border-emerald-200 bg-emerald-50"
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-bold ${
              isHigh
                ? "bg-red-100 text-red-700"
                : isAttention
                  ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {isHigh ? "!" : isAttention ? "!" : "✓"}
          </div>

          <div>
            <h3 className="font-bold">{finding.name}</h3>

            <p className="mt-1 text-sm text-slate-600">
              Reported value:{" "}
              <strong>{finding.value}</strong>
            </p>
          </div>
        </div>

        <div className="text-sm font-bold">
          {isHigh
            ? "Higher-priority discussion"
            : isAttention
              ? "Discuss with clinician"
              : "No flag detected"}
        </div>
      </div>
    </div>
  );
}

function FindingCard({
  finding,
}: {
  finding: Finding;
}) {
  const style =
    finding.status === "high"
      ? "border-red-200 bg-red-50"
      : finding.status === "attention"
        ? "border-amber-200 bg-amber-50"
        : "border-emerald-200 bg-emerald-50";

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-bold">{finding.name}</p>

          <p className="mt-2 text-3xl font-extrabold">
            {finding.value}
          </p>
        </div>

        <div
          className={`rounded-full border px-3 py-1 text-xs font-bold ${style}`}
        >
          {finding.status === "high"
            ? "Review"
            : finding.status === "attention"
              ? "Attention"
              : "Within range"}
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          In simple words
        </p>

        <p className="mt-2 text-sm leading-7 text-slate-600">
          {finding.explanation}
        </p>
      </div>
    </article>
  );
}

function PathwayNode({
  step,
}: {
  step: PathwayStep;
}) {
  return (
    <div
      className={`w-48 rounded-3xl border p-5 ${
        step.active
          ? "border-cyan-300 bg-cyan-50 shadow-lg shadow-cyan-100"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold text-slate-400">
          {step.number}
        </span>

        <span className="text-2xl">{step.icon}</span>
      </div>

      <h3 className="mt-5 text-sm font-extrabold">
        {step.title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {step.description}
      </p>

      <div className="mt-4 border-t border-slate-200 pt-3">
        <p className="text-xs font-semibold leading-5 text-slate-600">
          {step.action}
        </p>
      </div>
    </div>
  );
}

function TimelineItem({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
        {icon}
      </div>

      <div>
        <p className="font-bold">{title}</p>
        <p className="mt-1 text-xs text-slate-400">{text}</p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-7 text-center">
      <div className="text-3xl">🔬</div>

      <p className="mt-3 font-bold">
        No structured medical parameters detected
      </p>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
        The PDF text was extracted, but the current extraction engine did
        not identify standard parameters. The next backend improvement will
        make this extraction more robust.
      </p>
    </div>
  );
}

function formatName(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}