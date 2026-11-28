"""Find a vehicle modification using the VIN rules in an Auto-Mate export."""

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

from vin_version_lookup import VersionProvider, lookup_bmw_version
from vin_decoding_policy import vin_rules_require_confirmation

VIN_LENGTH = 17
VIN_PREFIX_LENGTH = 11
VIN_CHARACTERS = re.compile(r"[A-HJ-NPR-Z0-9]+")
CYRILLIC_LOOKALIKES = str.maketrans("АВЕКМНОРСТУХ", "ABEKMHOPCTYX")
VIN_TYPOS = str.maketrans("OIQ", "010")


def normalize_vin(value: str) -> str:
    normalized = re.sub(r"[\s‐‑–—−-]+", "", value.upper().translate(CYRILLIC_LOOKALIKES))
    return normalized.translate(VIN_TYPOS) if re.fullmatch(r"[A-Z0-9]{17}", normalized) else normalized


def read_models(data: Any) -> list[dict[str, Any]]:
    if (
        not isinstance(data, dict)
        or type(data.get("schemaVersion")) is not int
        or data["schemaVersion"] != 1
        or not isinstance(data.get("masterModels"), list)
    ):
        raise ValueError("Нужна JSON-выгрузка каталога Auto-Mate версии 1.")
    return data["masterModels"]


def vin_rule_score(rule: Any, vin: str) -> int:
    if not isinstance(rule, dict):
        return 0
    sample = rule.get("sample")
    positions = rule.get("positions", [])
    if not isinstance(sample, str) or not isinstance(positions, list):
        return 0

    model_year = rule.get("modelYear")
    if model_year is not None and (type(model_year) is not int or not 1886 <= model_year <= 9999):
        return 0

    sample = normalize_vin(sample)
    if len(sample) not in (VIN_PREFIX_LENGTH, VIN_LENGTH) or not VIN_CHARACTERS.fullmatch(sample):
        return 0
    if not all(type(position) is int and 0 <= position < len(sample) for position in positions):
        return 0

    selected = set(positions)
    if len(sample) == VIN_PREFIX_LENGTH and not selected:
        selected = set(range(VIN_PREFIX_LENGTH)) - {8}
    elif not {0, 1, 2}.issubset(selected) or len(selected.intersection(range(3, 8))) < 3:
        return 0
    return len(selected) if all(vin[position] == sample[position] for position in selected) else 0


def catalog_record_error(
    record: Any, text_fields: tuple[str, ...], string_fields: tuple[str, ...] = ()
) -> str | None:
    if not isinstance(record, dict):
        return "ожидается объект"
    invalid = [field for field in text_fields if not isinstance(record.get(field), str) or not record[field].strip()]
    invalid.extend(field for field in string_fields if not isinstance(record.get(field), str))
    return "отсутствуют или некорректны поля: " + ", ".join(invalid) if invalid else None


def report_skipped_record(location: str, reason: str) -> None:
    # Report only catalogue locations and field names, never the VIN or record contents.
    print(f"Пропущена запись {location}: {reason}.", file=sys.stderr)


def decode_vin(
    vin: str, models: list[dict[str, Any]], version_provider: VersionProvider | None = None
) -> dict[str, Any]:
    vin = normalize_vin(vin)
    if len(vin) != VIN_LENGTH or not VIN_CHARACTERS.fullmatch(vin):
        raise ValueError("Введите полный VIN из 17 символов без букв I, O и Q.")

    rules_require_confirmation = vin_rules_require_confirmation(vin)
    matches = []
    for model_index, model in enumerate(models):
        model_location = f"masterModels[{model_index}]"
        if isinstance(model, dict) and model.get("verified") is False:
            continue
        error = catalog_record_error(model, ("brandSlug", "brandName", "modelSlug", "modelName"))
        if error:
            report_skipped_record(model_location, error)
            continue
        if model.get("verified") is not True:
            report_skipped_record(model_location, "поле verified должно быть логическим значением")
            continue

        modifications = model.get("modifications")
        if not isinstance(modifications, list):
            report_skipped_record(model_location, "поле modifications должно быть массивом")
            continue
        for modification_index, modification in enumerate(modifications):
            location = f"{model_location}.modifications[{modification_index}]"
            error = catalog_record_error(modification, ("id",), ("name",))
            if error:
                report_skipped_record(location, error)
                continue
            attributes = modification.get("attributes")
            if not isinstance(attributes, dict) or any(
                not isinstance(key, str) or not isinstance(value, str) for key, value in attributes.items()
            ):
                report_skipped_record(location, "поле attributes должно быть объектом со строковыми значениями")
                continue

            exact_vins = modification.get("vinExceptions")
            is_exception = isinstance(exact_vins, list) and any(
                isinstance(sample, str) and normalize_vin(sample) == vin for sample in exact_vins
            )
            rules = modification.get("vinRules")
            scored_rules = (
                [(vin_rule_score(rule, vin), rule) for rule in rules]
                if isinstance(rules, list) and not is_exception and not rules_require_confirmation else []
            )
            specificity = VIN_LENGTH + 1 if is_exception else max((score for score, _ in scored_rules), default=0)
            model_years = {
                year for score, rule in scored_rules
                if score and score == specificity and type(year := rule.get("modelYear")) is int
            }
            if specificity:
                matches.append(
                    {
                        "brandSlug": model["brandSlug"],
                        "brandName": model["brandName"],
                        "modelSlug": model["modelSlug"],
                        "modelName": model["modelName"],
                        "modificationId": modification["id"],
                        "specificity": specificity,
                        "modificationName": modification["name"],
                        "attributes": modification["attributes"],
                        **({"modelYear": next(iter(model_years))} if len(model_years) == 1 else {}),
                    }
                )

    exceptions = [match for match in matches if match["specificity"] == VIN_LENGTH + 1]
    if exceptions:
        matches = exceptions
    matches.sort(key=lambda match: match["specificity"], reverse=True)
    if not matches:
        try:
            hint = lookup_bmw_version(vin, version_provider)
        except Exception:
            # Optional version hints must not interrupt the primary catalogue search.
            hint = None
        return {"status": "no_match", "matches": [], **({"hint": hint} if hint else {})}
    elif len(matches) == 1:
        status = "matched"
    else:
        status = "ambiguous"
    return {"status": status, "matches": matches}


def main() -> None:
    sys.stdin.reconfigure(encoding="utf-8")
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description="Поиск модификации Auto-Mate по VIN.")
    parser.add_argument("catalog", type=Path, nargs="?", help="Путь к JSON-выгрузке каталога")
    parser.add_argument("vin", nargs="?", help="Полный VIN автомобиля")
    parser.add_argument("--stdin", action="store_true", help="Прочитать запрос приложения из stdin")
    args = parser.parse_args()

    if args.stdin and (args.catalog is not None or args.vin is not None):
        parser.error("В режиме --stdin передайте VIN и каталог в JSON.")
    if not args.stdin and (args.catalog is None or args.vin is None):
        parser.error("Укажите путь к выгрузке и VIN.")

    try:
        if args.stdin:
            data = json.load(sys.stdin)
            models = read_models(data)
            vin = data.get("vin")
            if not isinstance(vin, str):
                raise ValueError("В запросе отсутствует VIN.")
        else:
            data = json.loads(args.catalog.read_text(encoding="utf-8-sig"))
            models = read_models(data)
            vin = args.vin
        result = decode_vin(vin, models)
    except UnicodeDecodeError:
        parser.error("Выгрузка каталога должна быть в UTF-8.")
    except json.JSONDecodeError as error:
        parser.error(f"Некорректный JSON, строка {error.lineno}, столбец {error.colno}.")
    except KeyError as error:
        parser.error(f"В записи каталога отсутствует поле {error}.")
    except (OSError, ValueError) as error:
        parser.error(str(error))

    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
