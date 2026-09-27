import pandas as pd


def calculate_pathway_duration(df: pd.DataFrame) -> pd.DataFrame:
    """
    Calculate duration of each patient pathway.

    Duration = last event timestamp - first event timestamp.
    """

    durations = (
        df.groupby("case_id")["timestamp"]
        .agg(
            start_time="min",
            end_time="max"
        )
        .reset_index()
    )

    durations["duration_hours"] = (
        durations["end_time"] - durations["start_time"]
    ).dt.total_seconds() / 3600

    return durations


def calculate_transition_frequency(df: pd.DataFrame) -> pd.DataFrame:
    """
    Calculate how frequently one activity transitions to another.
    """

    df = df.sort_values(
        ["case_id", "timestamp"]
    ).copy()

    df["next_activity"] = (
        df.groupby("case_id")["activity"]
        .shift(-1)
    )

    transitions = (
        df.dropna(subset=["next_activity"])
        .groupby(["activity", "next_activity"])
        .size()
        .reset_index(name="frequency")
    )

    transitions = transitions.sort_values(
        "frequency",
        ascending=False
    ).reset_index(drop=True)

    return transitions