from event_log_loader import load_xes
from pathway_discovery import discover_pathways


DATASET = "../datasets/event_logs/Sepsis Cases - Event Log.xes.gz"

# Load event log
df = load_xes(DATASET)

# Discover pathways
pathways = discover_pathways(df)

print("\n========== PATHWAY DISCOVERY ==========\n")

print("Total cases:", df["case_id"].nunique())

print("Distinct pathway variants:", len(pathways))

print("\nTop 10 pathway variants:\n")

for _, row in pathways.head(10).iterrows():
    print(f"{row['pathway_id']}")
    print(f"Frequency: {row['frequency']}")
    print(f"Utilization: {row['utilization_percentage']:.2f}%")
    print("Pathway:")
    print(" → ".join(row["pathway"]))
    print("-" * 80)