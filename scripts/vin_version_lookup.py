"""Suggest a BMW version without handing the full VIN to a lookup provider."""

import json
from dataclasses import asdict, dataclass
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


def lookup_bmw_version(vin: str, provider: VersionProvider | None = None) -> dict[str, str] | None:
    manufacturer, type_code, marker = vin[:3], vin[3:7], vin[7:8]
    if (manufacturer, marker) not in {("WBA", "0"), ("X4X", "4")}:
        return None

    data = json.loads(TYPE_CODES.read_text(encoding="utf-8"))
    local = data.get(vin[:8])
    hint = VersionHint(**local) if local else None
    if hint is None and provider is not None:
        hint = provider(VersionQuery("BMW", type_code, manufacturer, "RU"))
    if hint is None:
        return None
    return {"typeCode": type_code, **asdict(hint)}
