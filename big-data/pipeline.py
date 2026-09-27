from pathlib import Path

from event_log_loader import load_xes
from pathway_discovery import discover_pathways
from utilization_analysis import (
    calculate_pathway_duration,
    calculate_transition_frequency
)
from deviation_detection import (
    event_deviation,
    sequence_deviation,
    repetition_deviation,
    temporal_deviation
)
from bottleneck_detection import detect_bottlenecks


# --------------------------------------------------
# PATHS
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent

DATASET = (
    BASE_DIR.parent
    / "datasets"
    / "event_logs"
    / "Sepsis Cases - Event Log.xes.gz"
)

RESULTS_DIR = BASE_DIR / "results"

RESULTS_DIR.mkdir(
    exist_ok=True
)


# --------------------------------------------------
# 1. LOAD EVENT LOG
# --------------------------------------------------

print("\n========== 1. LOADING EVENT LOG ==========\n")

df = load_xes(str(DATASET))

print("Total events:", len(df))
print("Unique cases:", df["case_id"].nunique())
print("Unique activities:", df["activity"].nunique())


# --------------------------------------------------
# 2. PATHWAY DISCOVERY
# --------------------------------------------------

print("\n========== 2. PATHWAY DISCOVERY ==========\n")

pathways = discover_pathways(df)

print(
    "Distinct pathway variants:",
    len(pathways)
)

pathways.to_csv(
    RESULTS_DIR / "pathway_variants.csv",
    index=False
)

print("Saved: pathway_variants.csv")


# --------------------------------------------------
# 3. PATHWAY DURATION
# --------------------------------------------------

print("\n========== 3. PATHWAY UTILIZATION ==========\n")

durations = calculate_pathway_duration(df)

print(
    "Median duration:",
    durations["duration_hours"].median(),
    "hours"
)

print(
    "Mean duration:",
    durations["duration_hours"].mean(),
    "hours"
)

durations.to_csv(
    RESULTS_DIR / "pathway_durations.csv",
    index=False
)

print("Saved: pathway_durations.csv")


# --------------------------------------------------
# 4. TRANSITION ANALYSIS
# --------------------------------------------------

transitions = calculate_transition_frequency(df)

transitions.to_csv(
    RESULTS_DIR / "transitions.csv",
    index=False
)

print("Saved: transitions.csv")


# --------------------------------------------------
# 5. DEVIATION ANALYSIS
# --------------------------------------------------

print("\n========== 4. DEVIATION ANALYSIS ==========\n")

# Calculate temporal deviation
temporal_results = temporal_deviation(df)

# Create a case-level deviation table
deviation_results = temporal_results[
    [
        "case_id",
        "duration_hours",
        "temporal_outlier"
    ]
].copy()

# Use the most frequent pathway as the current
# reference sequence for E/S calculations.
reference_case = (
    df.groupby("case_id")
    .size()
    .sort_values(ascending=False)
    .index[0]
)

reference_sequence = (
    df[df["case_id"] == reference_case]
    .sort_values("timestamp")["activity"]
    .tolist()
)

event_scores = []
sequence_scores = []
repetition_scores = []

for case_id in df["case_id"].unique():

    case_sequence = (
        df[df["case_id"] == case_id]
        .sort_values("timestamp")["activity"]
        .tolist()
    )

    event_scores.append(
        event_deviation(
            case_sequence,
            reference_sequence
        )
    )

    sequence_scores.append(
        sequence_deviation(
            case_sequence,
            reference_sequence
        )
    )

    repetition_scores.append(
        repetition_deviation(
            case_sequence
        )
    )


deviation_results["event_deviation"] = event_scores
deviation_results["sequence_deviation"] = sequence_scores
deviation_results["repetition_deviation"] = repetition_scores

deviation_results.to_csv(
    RESULTS_DIR / "deviations.csv",
    index=False
)

print("Saved: deviations.csv")

print(
    "Temporal outlier percentage:",
    deviation_results["temporal_outlier"].mean() * 100,
    "%"
)


# --------------------------------------------------
# 6. BOTTLENECK DETECTION
# --------------------------------------------------

print("\n========== 5. BOTTLENECK DETECTION ==========\n")

bottlenecks = detect_bottlenecks(df)

bottlenecks.to_csv(
    RESULTS_DIR / "bottlenecks.csv",
    index=False
)

print(
    "Candidate transitions:",
    len(bottlenecks)
)

print(
    "Detected bottlenecks:",
    bottlenecks["bottleneck"].sum()
)

print("Saved: bottlenecks.csv")


# --------------------------------------------------
# COMPLETE
# --------------------------------------------------

print("\n==============================================")
print("ANALYTICS PIPELINE COMPLETED")
print("==============================================\n")

print("Results saved in:")

print(RESULTS_DIR)