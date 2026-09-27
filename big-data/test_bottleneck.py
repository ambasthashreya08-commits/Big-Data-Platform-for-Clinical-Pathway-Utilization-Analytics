from event_log_loader import load_xes
from bottleneck_detection import detect_bottlenecks


DATASET = "../datasets/event_logs/Sepsis Cases - Event Log.xes.gz"

df = load_xes(DATASET)

bottlenecks = detect_bottlenecks(df)

print("\n========== BOTTLENECK DETECTION ==========\n")

print("Candidate transitions:", len(bottlenecks))

print(
    "Detected bottlenecks:",
    bottlenecks["bottleneck"].sum()
)

print("\n========== BOTTLENECKS ==========\n")

print(
    bottlenecks[
        bottlenecks["bottleneck"]
    ].to_string(index=False)
)

print("\n========== TOP CANDIDATE TRANSITIONS ==========\n")

print(
    bottlenecks.head(20).to_string(index=False)
)