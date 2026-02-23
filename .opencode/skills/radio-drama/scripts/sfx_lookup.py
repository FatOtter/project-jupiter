#!/usr/bin/env python3
"""
SFX Lookup Tool — 从 sfx_library/catalog.md 按标签检索音效文件

用法:
    python3 sfx_lookup.py --tags "door metal heavy"
    python3 sfx_lookup.py --tags "scanner beep" --sfx-lib /path/to/sfx_library
    python3 sfx_lookup.py --list-tags
"""

import argparse
import os
import re
import sys

DEFAULT_SFX_LIB = os.path.join(
    os.path.dirname(__file__), "..", "..", "..", "..", "sfx_library"
)


def load_catalog(sfx_lib: str) -> list[dict]:
    """Parse catalog.md into a list of entries."""
    catalog_path = os.path.join(sfx_lib, "catalog.md")
    if not os.path.exists(catalog_path):
        print(f"Error: catalog.md not found at {catalog_path}", file=sys.stderr)
        sys.exit(1)

    entries = []
    with open(catalog_path) as f:
        for line in f:
            line = line.strip()
            # Table row: | filename | duration | #tags... | source | license |
            if (
                not line.startswith("|")
                or line.startswith("| 文件名")
                or line.startswith("|---")
            ):
                continue
            parts = [p.strip() for p in line.split("|") if p.strip()]
            if len(parts) < 3:
                continue
            filename = parts[0].strip("`")
            duration = parts[1]
            raw_tags = parts[2]
            source = parts[3] if len(parts) > 3 else ""
            license_ = parts[4] if len(parts) > 4 else ""
            tags = re.findall(r"#(\w+)", raw_tags)
            entries.append(
                {
                    "filename": filename,
                    "duration": duration,
                    "tags": tags,
                    "source": source,
                    "license": license_,
                }
            )
    return entries


def find_file(sfx_lib: str, filename: str) -> str | None:
    """Search for a file in the sfx_library assets directory."""
    for root, _, files in os.walk(os.path.join(sfx_lib, "assets")):
        if filename in files:
            return os.path.join(root, filename)
    return None


def lookup(tags: list[str], sfx_lib: str) -> list[dict]:
    """Return entries that match ALL given tags."""
    entries = load_catalog(sfx_lib)
    tags_lower = [t.lower() for t in tags]
    matches = []
    for e in entries:
        e_tags = [t.lower() for t in e["tags"]]
        if all(t in e_tags for t in tags_lower):
            path = find_file(sfx_lib, e["filename"])
            e["path"] = path or f"[NOT FOUND: {e['filename']}]"
            matches.append(e)
    return matches


def list_tags(sfx_lib: str):
    """Print all unique tags in the catalog."""
    entries = load_catalog(sfx_lib)
    all_tags: set[str] = set()
    for e in entries:
        all_tags.update(e["tags"])
    for tag in sorted(all_tags):
        print(f"#{tag}")


def main():
    parser = argparse.ArgumentParser(description="SFX Library Lookup Tool")
    parser.add_argument(
        "--tags", help="Space-separated tags to search for (e.g. 'door metal heavy')"
    )
    parser.add_argument(
        "--sfx-lib", default=DEFAULT_SFX_LIB, help="Path to sfx_library directory"
    )
    parser.add_argument(
        "--list-tags", action="store_true", help="List all available tags"
    )
    parser.add_argument(
        "--first",
        action="store_true",
        help="Return only the first match path (for scripting)",
    )
    args = parser.parse_args()

    sfx_lib = os.path.abspath(args.sfx_lib)

    if args.list_tags:
        list_tags(sfx_lib)
        return

    if not args.tags:
        parser.print_help()
        sys.exit(1)

    tags = args.tags.split()
    matches = lookup(tags, sfx_lib)

    if not matches:
        print(f"No matches for tags: {tags}", file=sys.stderr)
        sys.exit(1)

    if args.first:
        print(matches[0]["path"])
        return

    for m in matches:
        status = "✓" if os.path.exists(m["path"]) else "✗"
        print(f"{status} {m['filename']}")
        print(f"   path: {m['path']}")
        print(f"   tags: {' '.join('#' + t for t in m['tags'])}")
        print(f"   dur:  {m['duration']}")
        print()


if __name__ == "__main__":
    main()
