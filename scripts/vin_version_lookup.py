"""Suggest a BMW version without handing the full VIN to a lookup provider."""

import json
import re
from dataclasses import asdict, dataclass
from functools import lru_cache
from pathlib import Path
from typing import Callable


@dataclass(frozen=True)
class VersionQuery:
    brand: str
    type_code: str
    manufacturer_code: str
    catalog_market: str


@dataclass(frozen=True)
class VersionHint:
    version: str
    bodyCode: str
    facelift: str
    engineFamily: str
    drivetrain: str
    displacementL: str
    fuel: str


# Future providers receive the same short query. The full VIN and account data are absent.
VersionProvider = Callable[[VersionQuery], VersionHint | None]
TYPE_CODES = Path(__file__).resolve().parents[1] / "features/garage/add/lib/bmwTypeCodes.json"
# BMW's NHTSA VIN decipherment lists these codes; X4X retains existing catalogue support.
BMW_MANUFACTURER_CODES = frozenset({"WBA", "WBS", "WBY", "WBX", "5UX", "5YM", "3MW", "X4X"})
VIN_CHARACTERS = re.compile(r"[A-HJ-NPR-Z0-9]+")


def validated_hint(value: object) -> VersionHint | None:
    if isinstance(value, dict):
        try:
            value = VersionHint(**value)
        except TypeError:
            return None
    if not isinstance(value, VersionHint):
        return None
    if not all(isinstance(field, str) and field.strip() for field in asdict(value).values()):
        return None
    if (
        value.facelift not in {"pre_facelift", "facelift"}
        or value.drivetrain not in {"RWD", "AWD"}
        or not re.fullmatch(r"\d+\.\d+", value.displacementL)
    ):
        return None
    return value


@lru_cache(maxsize=1)
def load_bmw_type_codes() -> dict[str, VersionHint]:
    try:
        data = json.loads(TYPE_CODES.read_text(encoding="utf-8-sig"))
    except (OSError, ValueError):
        return {}
    if not isinstance(data, dict):
        return {}

    valid = {}
    for prefix, entry in data.items():
        if len(prefix) != 8 or not VIN_CHARACTERS.fullmatch(prefix):
            continue
        hint = validated_hint(entry)
        if hint is not None:
            valid[prefix] = hint
    return valid


def lookup_bmw_version(vin: str, provider: VersionProvider | None = None) -> dict[str, str] | None:
    if len(vin) != 17 or not VIN_CHARACTERS.fullmatch(vin):
        return None
    manufacturer, type_code = vin[:3], vin[3:7]
    # A confirmed catalogue prefix takes precedence, regardless of WMI or position 8.
    hint = load_bmw_type_codes().get(vin[:8])
    if hint is None and provider is not None and manufacturer in BMW_MANUFACTURER_CODES:
        try:
            hint = validated_hint(provider(VersionQuery("BMW", type_code, manufacturer, "RU")))
        except Exception:
            # Provider failures must never turn an ordinary no_match into a decoder error.
            return None
    if hint is None:
        return None
    return {"typeCode": type_code, **asdict(hint)}
