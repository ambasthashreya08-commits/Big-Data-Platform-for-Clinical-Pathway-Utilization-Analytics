import pandas as pd


def event_deviation(
    case_activities: list,
    reference_activities: list
) -> float:
    """
    Event deviation using Jaccard distance.

    Jaccard distance =
    1 - |intersection| / |union|
    """

    case_set = set(case_activities)
    reference_set = set(reference_activities)

    if not case_set and not reference_set:
        return 0.0

    union = case_set | reference_set

    if not union:
        return 0.0

    intersection = case_set & reference_set

    return 1 - (len(intersection) / len(union))


def sequence_deviation(
    case_activities: list,
    reference_activities: list
) -> float:
    """
    Sequence deviation using Longest Common Subsequence (LCS).

    Sequence similarity = LCS / max(sequence lengths)

    Sequence deviation = 1 - sequence similarity
    """

    m = len(case_activities)
    n = len(reference_activities)

    if m == 0 and n == 0:
        return 0.0

    # LCS dynamic programming table
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(1, m + 1):
        for j in range(1, n + 1):

            if case_activities[i - 1] == reference_activities[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1

            else:
                dp[i][j] = max(
                    dp[i - 1][j],
                    dp[i][j - 1]
                )

    lcs_length = dp[m][n]

    similarity = lcs_length / max(m, n)

    return 1 - similarity


def repetition_deviation(
    case_activities: list
) -> float:
    """
    Repetition deviation.

    Extra occurrences / total events.
    """

    if not case_activities:
        return 0.0

    total_events = len(case_activities)

    unique_events = len(set(case_activities))

    extra_occurrences = total_events - unique_events

    return extra_occurrences / total_events
def temporal_deviation(df: pd.DataFrame) -> pd.DataFrame:
    """
    Detect temporal outliers using the Tukey IQR rule.

    A case is considered a temporal outlier if its pathway
    duration falls outside:

        Q1 - 1.5 * IQR
        Q3 + 1.5 * IQR
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

    # Calculate quartiles
    q1 = durations["duration_hours"].quantile(0.25)
    q3 = durations["duration_hours"].quantile(0.75)

    iqr = q3 - q1

    lower_bound = q1 - 1.5 * iqr
    upper_bound = q3 + 1.5 * iqr

    # Detect temporal outliers
    durations["temporal_outlier"] = (
        (durations["duration_hours"] < lower_bound)
        |
        (durations["duration_hours"] > upper_bound)
    )

    return durations