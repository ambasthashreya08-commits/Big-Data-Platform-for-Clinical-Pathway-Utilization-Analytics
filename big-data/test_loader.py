from event_log_loader import load_xes


DATASET = "../datasets/event_logs/Sepsis Cases - Event Log.xes.gz"

df = load_xes(DATASET)

print("\n========== DATASET LOADED ==========\n")

print("Total events:", len(df))
print("Unique cases:", df["case_id"].nunique())
print("Unique activities:", df["activity"].nunique())

print("\nColumns:")
print(df.columns.tolist())

print("\nFirst 10 events:")
print(df.head(10).to_string(index=False))

print("\nActivity types:")
print(df["activity"].unique())