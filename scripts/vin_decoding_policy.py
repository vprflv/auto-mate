"""Shared catalogue policy for VIN prefixes that cannot identify a modification."""

import json
import re
from functools import lru_cache
from pathlib import Path

POLICY_FILE = Path(__file__).resolve().parents[1] / "features/catalog/lib/vinDecodingPolicy.json"


@lru_cache(maxsize=1)
def rule_exclusion_prefixes() -> tuple[str, ...]:
    data = json.loads(POLICY_FILE.read_text(encoding="utf-8"))
    exclusions = data.get("ruleExclusions") if isinstance(data, dict) else None
    if not isinstance(exclusions, dict):
        raise ValueError("Некорректная политика VIN: нужен объект ruleExclusions.")

    prefixes = []
    for entry in exclusions.values():
        prefix = entry.get("prefix") if isinstance(entry, dict) else None
        reason = entry.get("reason") if isinstance(entry, dict) else None
        if (
            not isinstance(prefix, str)
            or not re.fullmatch(r"[A-HJ-NPR-Z0-9]{1,17}", prefix)
            or not isinstance(reason, str)
            or not reason.strip()
        ):
            raise ValueError("Некорректная политика VIN: укажите префикс и причину ограничения.")
        prefixes.append(prefix)
    return tuple(prefixes)


def vin_rules_require_confirmation(vin: str) -> bool:
    return vin.startswith(rule_exclusion_prefixes())
