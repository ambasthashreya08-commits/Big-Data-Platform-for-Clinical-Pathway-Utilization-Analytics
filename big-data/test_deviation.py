from event_log_loader import load_xes

from deviation_detection import (
    event_deviation,
    sequence_deviation,
    repetition_deviation,
    temporal_deviation
)


DATASET = "../datasets/event_logs/Sepsis Cases - Event Log.xes.gz"

df = load_xes(DATASET)

# Use the most frequent pathway as the reference pathway
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

print("\n========== DEVIATION DETECTION ==========\n")

print("Reference case:", reference_case)

print("\nReference pathway:")
print(" → ".join(reference_sequence))

# Select a few cases for testing
case_ids = df["case_id"].unique()[:10]

print("\n========== E / S / R RESULTS ==========\n")

for case_id in case_ids:

    case_sequence = (
        df[df["case_id"] == case_id]
        .sort_values("timestamp")["activity"]
        .tolist()
    )

    e = event_deviation(
        case_sequence,
        reference_sequence
    )

    s = sequence_deviation(
        case_sequence,
        reference_sequence
    )

    r = repetition_deviation(
        case_sequence
    )

    print(f"Case: {case_id}")
    print(f"Events: {len(case_sequence)}")
    print(f"E - Event deviation: {e:.3f}")
    print(f"S - Sequence deviation: {s:.3f}")
    print(f"R - Repetition deviation: {r:.3f}")
    print("-" * 60)

    print("\n========== TEMPORAL DEVIATION ==========\n")

temporal_results = temporal_deviation(df)

total_cases = len(temporal_results)

outlier_cases = temporal_results[
    temporal_results["temporal_outlier"]
]

print("Total cases:", total_cases)

print("Temporal outliers:", len(outlier_cases))

print(
    "Temporal outlier percentage:",
    f"{len(outlier_cases) / total_cases * 100:.2f}%"
)

print("\nDuration boundaries:")

q1 = temporal_results["duration_hours"].quantile(0.25)
q3 = temporal_results["duration_hours"].quantile(0.75)
iqr = q3 - q1

print("Q1:", q1)
print("Q3:", q3)
print("IQR:", iqr)

print("Lower bound:", q1 - 1.5 * iqr)
print("Upper bound:", q3 + 1.5 * iqr)