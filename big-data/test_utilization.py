from event_log_loader import load_xes
from utilization_analysis import (
    calculate_pathway_duration,
    calculate_transition_frequency
)


DATASET = "../datasets/event_logs/Sepsis Cases - Event Log.xes.gz"

# Load event log
df = load_xes(DATASET)

print("\n========== PATHWAY UTILIZATION ANALYTICS ==========\n")

# --------------------------------------------------
# 1. PATHWAY DURATION
# --------------------------------------------------

durations = calculate_pathway_duration(df)

print("Total cases:", len(durations))

print("\n========== PATHWAY DURATION ==========\n")

print("Median duration (hours):")
print(durations["duration_hours"].median())

print("\nMean duration (hours):")
print(durations["duration_hours"].mean())

print("\nMinimum duration (hours):")
print(durations["duration_hours"].min())

print("\nMaximum duration (hours):")
print(durations["duration_hours"].max())


# --------------------------------------------------
# 2. TRANSITION FREQUENCY
# --------------------------------------------------

transitions = calculate_transition_frequency(df)

print("\n========== TOP 20 TRANSITIONS ==========\n")

print(
    transitions.head(20).to_string(index=False)
)