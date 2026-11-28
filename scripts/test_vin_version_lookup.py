"""Regression checks for optional BMW version hints; run with unittest discovery."""

import json
import unittest
from dataclasses import asdict
from unittest.mock import Mock, patch

import vin_version_lookup as lookup
from decode_vin import decode_vin


REAL_TYPE_CODES = lookup.TYPE_CODES
PREFIX = "WBA12341"
HINT = lookup.VersionHint("320i", "F30", "pre_facelift", "N20", "RWD", "2.0", "Бензин")


def vin(prefix=PREFIX):
    return prefix + "0A0123456"


class BmwVersionLookupTests(unittest.TestCase):
    def setUp(self):
        lookup.load_bmw_type_codes.cache_clear()
        self.file = Mock()
        self.file.read_text.return_value = json.dumps({PREFIX: asdict(HINT)})
        self.file_patch = patch.object(lookup, "TYPE_CODES", self.file)
        self.file_patch.start()

    def tearDown(self):
        self.file_patch.stop()
        lookup.load_bmw_type_codes.cache_clear()

    def assert_no_hint(self, provider=None):
        self.assertEqual(decode_vin(vin(), [], provider), {"status": "no_match", "matches": []})

    def test_all_existing_catalogue_prefixes_keep_their_hints(self):
        data = json.loads(REAL_TYPE_CODES.read_text(encoding="utf-8"))
        self.file.read_text.return_value = json.dumps(data)
        for prefix, expected in data.items():
            with self.subTest(prefix=prefix):
                self.assertEqual(lookup.lookup_bmw_version(vin(prefix)), {"typeCode": prefix[3:7], **expected})

    def test_local_hint_preserves_no_match_status(self):
        result = decode_vin(vin(), [])
        self.assertEqual(result["status"], "no_match")
        self.assertEqual(result["matches"], [])
        self.assertEqual(result["hint"], {"typeCode": "1234", **asdict(HINT)})

    def test_local_prefix_does_not_require_a_specific_eighth_character(self):
        provider = Mock(side_effect=AssertionError("Local match must win"))
        self.assertEqual(lookup.lookup_bmw_version(vin(), provider), {"typeCode": "1234", **asdict(HINT)})
        provider.assert_not_called()

    def test_local_table_accepts_confirmed_new_manufacturer_prefixes(self):
        prefix = "5UX12341"
        self.file.read_text.return_value = json.dumps({prefix: asdict(HINT)})
        self.assertEqual(lookup.lookup_bmw_version(vin(prefix))["version"], HINT.version)

    def test_provider_supports_expanded_bmw_wmis_and_receives_only_short_query(self):
        self.file.read_text.return_value = "{}"
        for manufacturer in ("WBA", "WBS", "WBY", "WBX", "5UX", "5YM", "3MW", "X4X"):
            for marker in ("0", "1", "7", "A"):
                with self.subTest(manufacturer=manufacturer, marker=marker):
                    provider = Mock(return_value=HINT)
                    full_vin = vin(manufacturer + "1234" + marker)
                    self.assertEqual(lookup.lookup_bmw_version(full_vin, provider)["version"], HINT.version)
                    query = provider.call_args.args[0]
                    self.assertEqual(asdict(query), {"brand": "BMW", "type_code": "1234", "manufacturer_code": manufacturer, "catalog_market": "RU"})
                    self.assertNotIn(full_vin, asdict(query).values())

    def test_unrelated_manufacturer_does_not_call_bmw_provider(self):
        provider = Mock()
        self.assertIsNone(lookup.lookup_bmw_version(vin("JTD12341"), provider))
        provider.assert_not_called()

    def test_invalid_vin_does_not_read_table_or_call_provider(self):
        provider = Mock()
        for value in ("", "WBA1234", "WBA1234I0A0123456"):
            self.assertIsNone(lookup.lookup_bmw_version(value, provider))
        self.file.read_text.assert_not_called()
        provider.assert_not_called()

    def test_missing_unreadable_or_invalidly_encoded_file_keeps_no_match(self):
        for error in (FileNotFoundError(), PermissionError(), UnicodeDecodeError("utf-8", b"\xff", 0, 1, "invalid")):
            with self.subTest(error=type(error).__name__):
                lookup.load_bmw_type_codes.cache_clear()
                self.file.read_text.side_effect = error
                self.assert_no_hint()

    def test_corrupt_json_and_wrong_root_shapes_keep_no_match(self):
        for text in ("{broken", "[]", "null", '"text"', "42"):
            with self.subTest(text=text):
                lookup.load_bmw_type_codes.cache_clear()
                self.file.read_text.return_value = text
                self.assert_no_hint()

    def test_malformed_records_are_skipped_without_breaking_valid_records(self):
        missing = asdict(HINT)
        missing.pop("fuel")
        invalid = [None, [], "text", {}, missing, {**asdict(HINT), "extra": "unexpected"},
                   {**asdict(HINT), "version": None}, {**asdict(HINT), "fuel": 123},
                   {**asdict(HINT), "facelift": "unknown"}, {**asdict(HINT), "drivetrain": "invalid"},
                   {**asdict(HINT), "displacementL": "not-a-number"}]
        for entry in invalid:
            with self.subTest(entry=entry):
                lookup.load_bmw_type_codes.cache_clear()
                self.file.read_text.return_value = json.dumps({PREFIX: entry, "WBA56780": asdict(HINT)})
                self.assert_no_hint()
                self.assertEqual(lookup.lookup_bmw_version(vin("WBA56780"))["version"], HINT.version)

    def test_file_is_read_once_for_repeated_lookups_in_one_process(self):
        lookup.lookup_bmw_version(vin())
        lookup.lookup_bmw_version(vin("WBA56780"))
        self.assertEqual(self.file.read_text.call_count, 1)

    def test_failed_file_read_is_also_cached(self):
        self.file.read_text.side_effect = FileNotFoundError()
        self.assert_no_hint()
        self.assert_no_hint()
        self.assertEqual(self.file.read_text.call_count, 1)

    def test_provider_can_supply_a_valid_hint_when_table_is_missing(self):
        self.file.read_text.side_effect = FileNotFoundError()
        self.assertEqual(lookup.lookup_bmw_version(vin(), Mock(return_value=HINT))["version"], HINT.version)

    def test_provider_failure_keeps_no_match(self):
        self.file.read_text.return_value = "{}"
        for error in (RuntimeError("offline"), TimeoutError(), TypeError(), ValueError()):
            with self.subTest(error=type(error).__name__):
                self.assert_no_hint(Mock(side_effect=error))

    def test_invalid_provider_response_keeps_no_match(self):
        self.file.read_text.return_value = "{}"
        for response in (None, "invalid", {}, {**asdict(HINT), "fuel": None},
                         lookup.VersionHint("320i", "F30", "invalid", "N20", "RWD", "2.0", "Бензин")):
            with self.subTest(response=response):
                self.assert_no_hint(Mock(return_value=response))

    def test_unexpected_hint_failure_cannot_break_main_decoder(self):
        with patch("decode_vin.lookup_bmw_version", side_effect=RuntimeError("unexpected helper failure")):
            self.assert_no_hint()

    def test_catalogue_match_does_not_depend_on_hint_lookup(self):
        models = [{"brandSlug": "bmw", "brandName": "BMW", "modelSlug": "three", "modelName": "Three", "verified": True,
                   "modifications": [{"id": "known", "name": "Known", "attributes": {}, "vinExceptions": [vin()]}]}]
        with patch("decode_vin.lookup_bmw_version", side_effect=AssertionError("Unexpected hint lookup")):
            result = decode_vin(vin(), models)
        self.assertEqual(result["status"], "matched")
        self.assertEqual(result["matches"][0]["modificationId"], "known")
        self.file.read_text.assert_not_called()


if __name__ == "__main__":
    unittest.main()
