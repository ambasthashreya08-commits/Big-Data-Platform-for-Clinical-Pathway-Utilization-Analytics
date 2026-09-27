import pandas as pd


def discover_pathways(df: pd.DataFrame) -> pd.DataFrame:
    """
    Discover exact pathway variants from an event log.

    Each case is represented by its ordered sequence of activities.
    Cases with the same exact sequence belong to the same pathway variant.
    """

    # Create ordered activity sequence for each case
    case_sequences = (
        df.groupby("case_id")["activity"]
        .apply(tuple)
        .reset_index(name="pathway")
    )

    # Count how many cases follow each exact pathway
    pathway_counts = (
        case_sequences
        .groupby("pathway")
        .size()
        .reset_index(name="frequency")
    )

    # Calculate utilization percentage
    total_cases = len(case_sequences)

    pathway_counts["utilization_percentage"] = (
        pathway_counts["frequency"] / total_cases * 100
    )

    # Sort by most frequently used pathway
    pathway_counts = pathway_counts.sort_values(
        "frequency",
        ascending=False
    ).reset_index(drop=True)

    # Give each pathway a readable ID
    pathway_counts.insert(
        0,
        "pathway_id",
        ["P" + str(i + 1) for i in range(len(pathway_counts))]
    )

    return pathway_counts