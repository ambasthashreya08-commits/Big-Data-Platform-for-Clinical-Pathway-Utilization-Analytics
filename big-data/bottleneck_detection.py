import pandas as pd


def detect_bottlenecks(
    df: pd.DataFrame,
    min_frequency: int = 10
) -> pd.DataFrame:
    """
    Detect bottleneck transitions.

    A transition is considered a candidate when it occurs at least
    `min_frequency` times.

    Among candidate transitions, those whose median delay is
    greater than or equal to the 90th percentile of all candidate
    median delays are flagged as bottlenecks.
    """

    # Ensure chronological ordering
    df = df.sort_values(
        ["case_id", "timestamp"]
    ).copy()

    # Get the next activity and its timestamp
    df["next_activity"] = (
        df.groupby("case_id")["activity"].shift(-1)
    )

    df["next_timestamp"] = (
        df.groupby("case_id")["timestamp"].shift(-1)
    )

    # Calculate delay between consecutive activities
    df["delay_hours"] = (
        df["next_timestamp"] - df["timestamp"]
    ).dt.total_seconds() / 3600

    # Remove rows without a next activity
    transitions = df.dropna(
        subset=[
            "next_activity",
            "next_timestamp",
            "delay_hours"
        ]
    ).copy()

    # Group transitions
    transition_stats = (
        transitions
        .groupby(["activity", "next_activity"])
        .agg(
            frequency=("delay_hours", "size"),
            median_delay_hours=("delay_hours", "median"),
            mean_delay_hours=("delay_hours", "mean")
        )
        .reset_index()
    )

    # Keep only sufficiently frequent transitions
    candidates = transition_stats[
        transition_stats["frequency"] >= min_frequency
    ].copy()

    if candidates.empty:
        candidates["bottleneck"] = False
        return candidates

    # 90th percentile of candidate median delays
    threshold = candidates[
        "median_delay_hours"
    ].quantile(0.90)

    candidates["bottleneck"] = (
        candidates["median_delay_hours"] >= threshold
    )

    # Sort slowest transitions first
    candidates = candidates.sort_values(
        "median_delay_hours",
        ascending=False
    ).reset_index(drop=True)

    return candidates