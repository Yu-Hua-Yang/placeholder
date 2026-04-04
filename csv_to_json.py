#!/usr/bin/env python3
"""
Convert a CSV file to JSON — every row becomes a JSON object, no deduplication.

Usage:
    python csv_to_json.py                              # default input/output
    python csv_to_json.py input.csv                    # custom input
    python csv_to_json.py input.csv output.json        # custom input + output
"""

import csv
import json
import sys


def csv_to_json(input_path: str, output_path: str) -> int:
    rows = []
    with open(input_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(dict(row))

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(rows, f, indent=2, ensure_ascii=False)

    return len(rows)


if __name__ == "__main__":
    input_file = sys.argv[1] if len(sys.argv) > 1 else "Sports_H_and_M.csv"
    output_file = sys.argv[2] if len(sys.argv) > 2 else "Sports_H_and_M.json"

    count = csv_to_json(input_file, output_file)
    print(f"Done — {count} rows written to {output_file}")
