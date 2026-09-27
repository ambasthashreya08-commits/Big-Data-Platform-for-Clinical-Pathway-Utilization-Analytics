import gzip
import xml.etree.ElementTree as ET
import pandas as pd


def load_xes(file_path: str) -> pd.DataFrame:
    events = []

    with gzip.open(file_path, "rb") as f:
        tree = ET.parse(f)

    root = tree.getroot()

    for trace in root:
        case_id = None

        # Get case ID from trace attributes
        for attribute in trace:
            if attribute.tag.endswith("string"):
                key = attribute.attrib.get("key")
                value = attribute.attrib.get("value")

                if key in {"concept:name", "case:concept:name"}:
                    case_id = value
                    break

        if case_id is None:
            continue

        # Read events inside the trace
        for event in trace:
            if not event.tag.endswith("event"):
                continue

            activity = None
            timestamp = None

            for attribute in event:
                key = attribute.attrib.get("key")
                value = attribute.attrib.get("value")

                if key == "concept:name":
                    activity = value

                elif key == "time:timestamp":
                    timestamp = value

            if activity is not None and timestamp is not None:
                events.append({
                    "case_id": case_id,
                    "activity": activity,
                    "timestamp": timestamp
                })

    df = pd.DataFrame(events)

    if df.empty:
        raise ValueError("No events were extracted from the XES file.")

    df["timestamp"] = pd.to_datetime(df["timestamp"], utc=True)

    df = df.sort_values(
        ["case_id", "timestamp"]
    ).reset_index(drop=True)

    return df