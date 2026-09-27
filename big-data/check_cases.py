from event_log_loader import load_xes


DATASET = "../datasets/event_logs/Sepsis Cases - Event Log.xes.gz"

df = load_xes(DATASET)

case_counts = (
    df.groupby("case_id")
    .size()
    .sort_values()
)

print("\n========== CASE CHECK ==========\n")

print("Total cases:", len(case_counts))

print("\nCases with the fewest events:")
print(case_counts.head(20))

print("\nCases with only 1 event:")
print(case_counts[case_counts == 1])

print("\nNumber of single-event cases:")
print((case_counts == 1).sum())