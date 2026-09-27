"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

const API_URL = "http://127.0.0.1:8000";

type Row = Record<string, unknown>;

type AnalyticsData = {
  success?: boolean;
  message?: string;
  summary?: Row;
  dataset?: Row;
  pathway_discovery?: {
    total_variants?: number;
    top_pathway?: Row | null;
    pathways?: Row[];
  };
  utilization?: {
    median_duration_hours?: number;
    mean_duration_hours?: number;
    durations?: Row[];
    transitions?: Row[];
    top_transitions?: Row[];
  };
  deviations?: Row[];
  bottlenecks?: {
    total_detected?: number;
    detected?: Row[];
    all?: Row[];
  };
};

type PatientResult = {
  success?: boolean;
  filename?: string;
  pages?: number;
  medical_data?: {
    parameters?: Record<string, {
      value: number;
      unit?: string;
      reference_low?: number;
      reference_high?: number;
      status?: string;
    }>;
    total_parameters?: number;
  };
  risk_analysis?: {
    overall_status?: string;
    overall_message?: string;
    summary?: {
      total_parameters?: number;
      high_priority?: number;
      attention?: number;
      normal?: number;
    };
    findings?: Array<{
      parameter: string;
      value: number;
      unit?: string;
      status?: string;
      priority?: string;
      explanation?: string;
      recommended_discussion?: string;
    }>;
    pathway?: Array<{
      stage: string;
      status: string;
      description: string;
    }>;
    safety_note?: string;
  };
};

function rows(value: unknown): Row[] {
  return Array.isArray(value)
    ? value.filter(v => v && typeof v === "object") as Row[]
    : [];
}

function num(row: Row | undefined, keys: string[], fallback = 0) {
  if (!row) return fallback;
  for (const key of keys) {
    const value = row[key];
    const n = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function text(row: Row | undefined, keys: string[], fallback = "—") {
  if (!row) return fallback;
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value);
    }
  }
  return fallback;
}

function bool(row: Row | undefined, keys: string[]) {
  if (!row) return false;
  return keys.some(key => {
    const value = row[key];
    return value === true || String(value).toLowerCase() === "true" || value === 1;
  });
}

function formatNumber(value: number, digits = 0) {
  return Number.isFinite(value)
    ? value.toLocaleString(undefined, { maximumFractionDigits: digits })
    : "—";
}

function formatHours(value: number) {
  if (!Number.isFinite(value)) return "—";
  if (value >= 24) return `${formatNumber(value / 24, 1)} days`;
  return `${formatNumber(value, 1)} h`;
}

function statusClass(status = "") {
  const s = status.toLowerCase();
  if (["high", "priority_review", "critical", "danger"].includes(s)) return "danger";
  if (["attention", "discussion", "warning", "abnormal"].includes(s)) return "warning";
  return "safe";
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [patient, setPatient] = useState<PatientResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/analytics`, {
        cache: "no-store",
      });

      const json = await response.json();

      if (!response.ok || json?.success === false) {
        throw new Error(json?.message || "Analytics could not be loaded.");
      }

      setData(json);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not connect to the FastAPI analytics endpoint."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("carebridge-theme");
    if (saved === "light") setDarkMode(false);
    if (saved === "dark") setDarkMode(true);

    const savedPatient = sessionStorage.getItem("carebridge-latest-report");

    if (savedPatient) {
      try {
        setPatient(JSON.parse(savedPatient));
      } catch {
        sessionStorage.removeItem("carebridge-latest-report");
      }
    }

    void loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    localStorage.setItem("carebridge-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const summary = data?.summary || {};
  const dataset = data?.dataset || {};

  const variants = data?.pathway_discovery?.pathways || [];
  const durations = data?.utilization?.durations || [];
  const transitions = data?.utilization?.transitions || [];
  const deviations = data?.deviations || [];
  const bottlenecks = data?.bottlenecks?.all || [];

  const totalCases = num(summary, ["total_cases"], Number(dataset.unique_cases) || 0);
  const totalEvents = num(summary, ["total_events"], Number(dataset.total_events) || 0);
  const activityTypes = num(summary, ["unique_activities"], Number(dataset.unique_activities) || 0);
  const distinctVariants = num(
    summary,
    ["total_pathway_variants"],
    data?.pathway_discovery?.total_variants || variants.length
  );

  const medianDuration = num(
    summary,
    ["median_duration_hours"],
    data?.utilization?.median_duration_hours || 0
  );

  const meanDuration = num(
    summary,
    ["mean_duration_hours"],
    data?.utilization?.mean_duration_hours || 0
  );

  const temporalOutlierPercentage = num(
    summary,
    ["temporal_outlier_percentage"],
    deviations.length
      ? deviations.filter(r => bool(r, ["temporal_outlier"])).length / deviations.length * 100
      : 0
  );

  const detectedBottlenecks = num(
    summary,
    ["bottlenecks_detected"],
    data?.bottlenecks?.total_detected || 0
  );

  const candidateTransitions = transitions.filter(
    r => num(r, ["frequency"]) >= 10
  ).length;

  const topPathway = data?.pathway_discovery?.top_pathway || variants[0];

  const deviationStats = useMemo(() => {
    const average = (keys: string[]) => {
      const values = deviations
        .map(r => num(r, keys, NaN))
        .filter(Number.isFinite);

      return values.length
        ? values.reduce((a, b) => a + b, 0) / values.length
        : 0;
    };

    return {
      event: average(["event_deviation", "E"]),
      sequence: average(["sequence_deviation", "S"]),
      repetition: average(["repetition_deviation", "R"]),
    };
  }, [deviations]);

  const patientSummary = patient?.risk_analysis?.summary || {};
  const patientPathway = patient?.risk_analysis?.pathway || [];
  const patientFindings = patient?.risk_analysis?.findings || [];

  return (
    <div className={`carebridge analyticsPage ${darkMode ? "dark" : "light"}`}>
      <header className="cb-top">
        <nav className="cb-nav">
          <Link href="/" className="brand analyticsBrandLink">
            <div className="logo">✚</div>
            <div>
              <h1>CAREBRIDGE</h1>
              <p>Clinical Pathway Intelligence</p>
            </div>
          </Link>

          <div className="actions">
            <Link href="/" className="analyticsBackButton">
              ← Patient Analysis
            </Link>

            <button
              className="theme"
              type="button"
              onClick={() => setDarkMode(v => !v)}
              aria-label="Toggle theme"
            >
              <span className="track">
                <span>☀</span>
                <span>☾</span>
              </span>
              <span className={`knob ${darkMode ? "on" : ""}`}>
                {darkMode ? "☾" : "☀"}
              </span>
            </button>
          </div>
        </nav>
      </header>

      <main className="cb-main">
        <section className="analyticsHero">
          <div>
            <span className="eyebrow">
              BIG DATA · CLINICAL PATHWAY INTELLIGENCE
            </span>

            <h2>
              From one patient report to{" "}
              <span className="gradient">
                population-level pathway intelligence.
              </span>
            </h2>

            <p>
              CareBridge has two connected views. The uploaded report powers
              the patient-specific pathway below. The event-log analytics
              then examines many clinical cases to discover pathways,
              measure utilization, detect deviations and identify bottlenecks.
            </p>

            <div className="analyticsPills">
              <span>Patient report</span>
              <span>Event-log population</span>
              <span>Pathway discovery</span>
              <span>Deviation + bottleneck analysis</span>
            </div>
          </div>

          <div className="analyticsHeroCard">
            <div className="analyticsFlow">
              <span>REPORT</span>
              <b>→</b>
              <span>PATIENT PATHWAY</span>
              <b>→</b>
              <span>POPULATION INTELLIGENCE</span>
            </div>
          </div>
        </section>

        {error && (
          <section className="analyticsError">
            <strong>Analytics endpoint error</strong>
            <p>{error}</p>
            <button className="reset" onClick={() => void loadAnalytics()}>
              ↻ Retry
            </button>
          </section>
        )}

        {patient && (
          <section className="analyticsSection patientConnection">
            <div className="dashHead">
              <div>
                <span className="kicker">01 / YOUR UPLOADED REPORT</span>
                <h3>This dashboard is connected to your real report</h3>
                <p>
                  {patient.filename || "Uploaded medical report"} ·{" "}
                  {patient.pages || "—"} pages
                </p>
              </div>

              <Link href="/" className="reset">
                ← View report
              </Link>
            </div>

            <div className="patientConnectionGrid">
              <div className="patientSummaryCard">
                <span className="patientIcon">✓</span>
                <div>
                  <small>Screening status</small>
                  <strong>
                    {patient.risk_analysis?.overall_status
                      ? patient.risk_analysis.overall_status.replaceAll("_", " ")
                      : "Available"}
                  </strong>
                </div>
              </div>

              <div className="patientMetric">
                <strong>{patientSummary.total_parameters || patient.medical_data?.total_parameters || 0}</strong>
                <span>Parameters extracted</span>
              </div>

              <div className="patientMetric">
                <strong>{patientSummary.high_priority || 0}</strong>
                <span>Priority findings</span>
              </div>

              <div className="patientMetric">
                <strong>{patientSummary.attention || 0}</strong>
                <span>Findings needing attention</span>
              </div>
            </div>

            <div className="patientPathwayCard">
              <div>
                <span className="kicker">PATIENT-SPECIFIC PATHWAY</span>
                <h4>What CareBridge generated from this report</h4>
              </div>

              <div className="patientPathway">
                {patientPathway.map((step, index) => (
                  <div className="patientPathStep" key={`${step.stage}-${index}`}>
                    <div className={`patientNode ${statusClass(step.status)}`}>
                      {index + 1}
                    </div>

                    <div>
                      <strong>{step.stage}</strong>
                      <span>{step.description}</span>
                    </div>
                  </div>
                ))}
              </div>

              {patientFindings.length > 0 && (
                <div className="patientFindingList">
                  <h4>Findings from the uploaded report</h4>

                  {patientFindings.slice(0, 4).map((finding, index) => (
                    <div className="patientFinding" key={`${finding.parameter}-${index}`}>
                      <div>
                        <strong>{finding.parameter}</strong>
                        <span>
                          {finding.value} {finding.unit || ""}
                        </span>
                      </div>

                      <span className={`flag ${statusClass(finding.status)}`}>
                        {(finding.status || "normal").replaceAll("_", " ")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {!patient && (
          <section className="analyticsCallout">
            <strong>No uploaded report is attached to this analytics view yet.</strong>
            <p>
              Go to Patient Analysis, upload a PDF and click “Analyze my
              report”. Then return here. The patient-specific pathway will
              appear above the population analytics.
            </p>
            <Link href="/" className="primary analyticsPrimary">
              Upload a report →
            </Link>
          </section>
        )}

        {loading && (
          <section className="analyticsLoading">
            <div className="spinner analyticsSpinner" />
            Loading population-level pathway analytics...
          </section>
        )}

        {!loading && data && (
          <>
            <section className="analyticsSection">
              <div className="dashHead">
                <div>
                  <span className="kicker">02 / EVENT-LOG OVERVIEW</span>
                  <h3>Population-level clinical process data</h3>
                  <p>
                    These values come from the event-log dataset used by the
                    Big Data analytics pipeline.
                  </p>
                </div>

                <button className="reset" onClick={() => void loadAnalytics()}>
                  ↻ Refresh
                </button>
              </div>

              <div className="analyticsStats">
                <div className="analyticsStat">
                  <strong>{formatNumber(totalCases)}</strong>
                  <span>Cases</span>
                </div>

                <div className="analyticsStat">
                  <strong>{formatNumber(totalEvents)}</strong>
                  <span>Events</span>
                </div>

                <div className="analyticsStat">
                  <strong>{formatNumber(activityTypes)}</strong>
                  <span>Activity types</span>
                </div>

                <div className="analyticsStat">
                  <strong>{formatNumber(distinctVariants)}</strong>
                  <span>Pathway variants</span>
                </div>
              </div>

              <div className="datasetNote">
                <strong>{text(dataset, ["name", "event_log"], "Sepsis Cases Event Log")}</strong>
                <span>
                  The population analytics are calculated from clinical
                  event histories, not from the contents of a single PDF.
                </span>
              </div>
            </section>

            <section className="analyticsSection">
              <div className="section-head">
                <div>
                  <span className="kicker">03 / PATHWAY DISCOVERY</span>
                  <h3>What pathways actually occur?</h3>
                  <p>
                    Each case is converted into an ordered activity sequence.
                    Identical sequences are grouped into pathway variants.
                  </p>
                </div>
              </div>

              <div className="analyticsPanel">
                <div className="metricStrip">
                  <div>
                    <small>Most frequent pathway</small>
                    <strong>
                      {text(topPathway, ["pathway", "sequence"], "No pathway data")}
                    </strong>
                  </div>

                  <div>
                    <small>Frequency</small>
                    <strong>
                      {formatNumber(num(topPathway, ["frequency"]))}
                    </strong>
                  </div>

                  <div>
                    <small>Utilization</small>
                    <strong>
                      {formatNumber(
                        num(topPathway, ["utilization_percentage", "utilization"]),
                        2
                      )}
                      %
                    </strong>
                  </div>
                </div>

                <div className="tableWrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Pathway</th>
                        <th>Frequency</th>
                        <th>Utilization</th>
                      </tr>
                    </thead>

                    <tbody>
                      {variants.slice(0, 10).map((row, index) => (
                        <tr key={index}>
                          <td className="pathwayCell">
                            P{index + 1} · {text(row, ["pathway", "sequence"])}
                          </td>
                          <td>{formatNumber(num(row, ["frequency"]))}</td>
                          <td>
                            {formatNumber(
                              num(row, ["utilization_percentage", "utilization"]),
                              2
                            )}
                            %
                          </td>
                        </tr>
                      ))}

                      {!variants.length && (
                        <tr>
                          <td colSpan={3}>No pathway data returned.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className="analyticsSection">
              <div className="section-head">
                <div>
                  <span className="kicker">04 / PATHWAY UTILIZATION</span>
                  <h3>How are pathways being used?</h3>
                  <p>
                    Duration and transition frequency show how the clinical
                    process behaves across cases.
                  </p>
                </div>
              </div>

              <div className="analyticsStats three">
                <div className="analyticsStat">
                  <strong>{formatHours(medianDuration)}</strong>
                  <span>Median case duration</span>
                </div>

                <div className="analyticsStat">
                  <strong>{formatHours(meanDuration)}</strong>
                  <span>Mean case duration</span>
                </div>

                <div className="analyticsStat">
                  <strong>
                    {transitions.length
                      ? formatNumber(num(transitions[0], ["frequency"]))
                      : "—"}
                  </strong>
                  <span>Most frequent transition</span>
                </div>
              </div>

              <div className="twoColumnAnalytics">
                <div className="analyticsPanel">
                  <h4>Top transitions</h4>

                  <div className="tableWrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Transition</th>
                          <th>Frequency</th>
                        </tr>
                      </thead>

                      <tbody>
                        {transitions.slice(0, 10).map((row, index) => (
                          <tr key={index}>
                            <td>
                              {text(row, ["activity"])} →{" "}
                              {text(row, ["next_activity"])}
                            </td>
                            <td>{formatNumber(num(row, ["frequency"]))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="analyticsPanel explanationPanel">
                  <h4>Why this matters</h4>

                  <p>
                    A single report can tell us about one patient. Event-log
                    utilization analysis tells us how care is actually being
                    delivered across many patient cases.
                  </p>

                  <div className="miniFlow">
                    <span>Cases</span>
                    <b>→</b>
                    <span>Sequences</span>
                    <b>→</b>
                    <span>Utilization</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="analyticsSection">
              <div className="section-head">
                <div>
                  <span className="kicker">05 / DEVIATION DETECTION</span>
                  <h3>Where does actual care differ?</h3>
                  <p>
                    The implementation keeps Event, Sequence, Temporal and
                    Repetition deviation separate.
                  </p>
                </div>
              </div>

              <div className="deviationGrid">
                <div className="deviationCard">
                  <span>E</span>
                  <strong>{formatNumber(deviationStats.event, 3)}</strong>
                  <small>Event deviation · Jaccard distance</small>
                </div>

                <div className="deviationCard">
                  <span>S</span>
                  <strong>{formatNumber(deviationStats.sequence, 3)}</strong>
                  <small>Sequence deviation · LCS-based order difference</small>
                </div>

                <div className="deviationCard">
                  <span>T</span>
                  <strong>{formatNumber(temporalOutlierPercentage, 2)}%</strong>
                  <small>Temporal outliers · Tukey IQR rule</small>
                </div>

                <div className="deviationCard">
                  <span>R</span>
                  <strong>{formatNumber(deviationStats.repetition, 3)}</strong>
                  <small>Repetition deviation · extra occurrences</small>
                </div>
              </div>

              <div className="analyticsPanel">
                <h4>Deviation records</h4>

                <div className="tableWrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Case</th>
                        <th>E</th>
                        <th>S</th>
                        <th>Temporal</th>
                        <th>R</th>
                      </tr>
                    </thead>

                    <tbody>
                      {deviations.slice(0, 12).map((row, index) => (
                        <tr key={index}>
                          <td>{text(row, ["case_id", "case"])}</td>
                          <td>{formatNumber(num(row, ["event_deviation", "E"]), 3)}</td>
                          <td>{formatNumber(num(row, ["sequence_deviation", "S"]), 3)}</td>
                          <td>
                            {bool(row, ["temporal_outlier"]) ? (
                              <span className="flag danger">OUTLIER</span>
                            ) : (
                              <span className="flag safe">Normal</span>
                            )}
                          </td>
                          <td>{formatNumber(num(row, ["repetition_deviation", "R"]), 3)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className="analyticsSection">
              <div className="section-head">
                <div>
                  <span className="kicker">06 / BOTTLENECK DETECTION</span>
                  <h3>Where are delays concentrated?</h3>
                  <p>
                    Transitions occurring at least 10 times are candidates;
                    the 90th percentile of candidate median delays identifies
                    the bottlenecks.
                  </p>
                </div>
              </div>

              <div className="analyticsStats three">
                <div className="analyticsStat">
                  <strong>{formatNumber(candidateTransitions)}</strong>
                  <span>Candidate transitions</span>
                </div>

                <div className="analyticsStat">
                  <strong>{formatNumber(detectedBottlenecks)}</strong>
                  <span>Detected bottlenecks</span>
                </div>

                <div className="analyticsStat">
                  <strong>
                    {bottlenecks.length
                      ? formatHours(num(bottlenecks[0], ["median_delay_hours"]))
                      : "—"}
                  </strong>
                  <span>Highest median delay</span>
                </div>
              </div>

              <div className="analyticsPanel">
                <div className="bottleneckTitle">
                  <h4>Detected bottlenecks</h4>
                  <span className="flag danger">DATA-DRIVEN</span>
                </div>

                <div className="tableWrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Transition</th>
                        <th>Frequency</th>
                        <th>Median delay</th>
                        <th>Mean delay</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {bottlenecks.slice(0, 10).map((row, index) => (
                        <tr key={index}>
                          <td>
                            {text(row, ["activity"])} →{" "}
                            {text(row, ["next_activity"])}
                          </td>
                          <td>{formatNumber(num(row, ["frequency"]))}</td>
                          <td>{formatHours(num(row, ["median_delay_hours"]))}</td>
                          <td>{formatHours(num(row, ["mean_delay_hours"]))}</td>
                          <td>
                            <span className="flag danger">BOTTLENECK</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className="analyticsConclusion">
              <div className="nextIcon">✓</div>

              <div>
                <span className="kicker">07 / PROJECT CONTRIBUTION</span>

                <h3>
                  The research pipeline is now visible inside CareBridge.
                </h3>

                <p>
                  The patient module answers an individual-report question.
                  The population analytics module answers the research
                  question: <strong>what pathways actually occur across many
                  cases, how are they used, where do they deviate, and where
                  are delays concentrated?</strong>
                </p>

                <p className="smallNote">
                  Important: E/S/T/R and bottleneck results are population-level
                  event-log analytics. They are not calculated from a single
                  blood-test PDF because a single report does not contain the
                  longitudinal event history required for those calculations.
                </p>
              </div>
            </section>
          </>
        )}

        <footer className="footer">
          <div>
            <strong>CAREBRIDGE</strong> Patient-first clinical pathway intelligence
          </div>
          <div>
            <Link href="/">← Back to patient analysis</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
