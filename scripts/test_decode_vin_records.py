"""A damaged catalogue record must not stop the remaining VIN search."""

import copy
import io
import json
import subprocess
import sys
import tempfile
import unittest
from contextlib import redirect_stderr
from pathlib import Path

from decode_vin import decode_vin, read_models


VIN = "JTDBR32E302123456"
MODIFICATION = {"id": "healthy", "name": "Healthy", "attributes": {"engine": "1NZ"}, "vinExceptions": [VIN]}
MODEL = {"brandSlug": "toyota", "brandName": "Toyota", "modelSlug": "corolla", "modelName": "Corolla",
         "verified": True, "modifications": [MODIFICATION]}
SCRIPT = Path(__file__).with_name("decode_vin.py")


class DamagedCatalogueRecordTests(unittest.TestCase):
    def decode(self, models):
        stderr = io.StringIO()
        with redirect_stderr(stderr):
            result = decode_vin(VIN, models)
        return result, stderr.getvalue()

    def assert_healthy_match(self, models):
        result, warning = self.decode(models)
        self.assertEqual(result["status"], "matched")
        self.assertEqual([match["modificationId"] for match in result["matches"]], ["healthy"])
        self.assertNotIn(VIN, warning)
        return warning

    def test_missing_required_model_fields_skip_only_that_model(self):
        for field in ("brandSlug", "brandName", "modelSlug", "modelName", "verified", "modifications"):
            with self.subTest(field=field):
                broken = copy.deepcopy(MODEL)
                del broken[field]
                warning = self.assert_healthy_match([broken, MODEL])
                self.assertIn("masterModels[0]", warning)
                self.assertIn(field, warning)

    def test_invalid_model_fields_and_non_objects_do_not_stop_search(self):
        for broken in (None, [], "bad", 123,
                       {**MODEL, "brandSlug": None}, {**MODEL, "modelName": 12},
                       {**MODEL, "brandName": " "}, {**MODEL, "verified": "true"},
                       {**MODEL, "modifications": {}}):
            with self.subTest(broken=broken):
                self.assertIn("masterModels[0]", self.assert_healthy_match([broken, MODEL]))

    def test_missing_modification_fields_preserve_siblings(self):
        for field in ("id", "name", "attributes"):
            with self.subTest(field=field):
                broken = copy.deepcopy(MODIFICATION)
                del broken[field]
                warning = self.assert_healthy_match([{**MODEL, "modifications": [broken, MODIFICATION]}])
                self.assertIn("masterModels[0].modifications[0]", warning)
                self.assertIn(field, warning)

    def test_bad_modification_types_and_attributes_are_skipped(self):
        records = [None, [], "bad", 123, {**MODIFICATION, "id": " "}, {**MODIFICATION, "name": None}]
        records.extend({**MODIFICATION, "attributes": value} for value in (None, [], "text", 123, {"engine": 123}, {"engine": None}, {1: "value"}))
        for broken in records:
            with self.subTest(broken=broken):
                self.assertIn("modifications[0]", self.assert_healthy_match([{**MODEL, "modifications": [broken, MODIFICATION]}]))

    def test_bad_record_does_not_hide_later_models_or_prior_matches(self):
        broken = {**MODEL, "modifications": [{"id": "broken", "vinExceptions": [VIN]}]}
        for models in ([broken, MODEL], [MODEL, broken]):
            self.assert_healthy_match(models)

    def test_invalid_exact_exception_does_not_suppress_a_valid_rule(self):
        rule = {"id": "healthy", "name": "Healthy", "attributes": {}, "vinRules": [{"sample": VIN[:11]}]}
        broken = {"id": "broken", "name": "Broken", "vinExceptions": [VIN]}
        warning = self.assert_healthy_match([{**MODEL, "modifications": [broken, rule]}])
        self.assertIn("attributes", warning)

    def test_corrupt_optional_rules_do_not_break_another_record(self):
        malformed = {"id": "no-match", "name": "No match", "attributes": {},
                     "vinRules": [None, "bad", {}, {"sample": VIN, "positions": [True]}]}
        self.assert_healthy_match([{**MODEL, "modifications": [malformed, MODIFICATION]}])

    def test_all_bad_records_return_no_match_with_diagnostics(self):
        result, warning = self.decode([None, {**MODEL, "modifications": [{"id": "broken"}]}])
        self.assertEqual(result, {"status": "no_match", "matches": []})
        self.assertIn("masterModels[0]", warning)
        self.assertIn("masterModels[1].modifications[0]", warning)

    def test_unverified_models_are_ignored_without_warnings(self):
        result, warning = self.decode([{**MODEL, "verified": False}])
        self.assertEqual(result, {"status": "no_match", "matches": []})
        self.assertEqual(warning, "")

    def test_empty_attributes_and_empty_modification_name_are_valid(self):
        result, warning = self.decode([{**MODEL, "modifications": [{**MODIFICATION, "name": "", "attributes": {}}]}])
        self.assertEqual(result["status"], "matched")
        self.assertEqual(warning, "")

    def test_invalid_export_structure_still_raises(self):
        for data in (None, [], {}, {"schemaVersion": 1, "masterModels": {}}, {"schemaVersion": 2, "masterModels": []}):
            with self.subTest(data=data), self.assertRaises(ValueError):
                read_models(data)

    def test_cli_stdin_keeps_json_stdout_and_reports_bad_record_on_stderr(self):
        request = {"schemaVersion": 1, "vin": VIN, "masterModels": [{**MODEL, "modifications": [{"id": "broken"}, MODIFICATION]}]}
        process = subprocess.run([sys.executable, "-B", str(SCRIPT), "--stdin"], input=json.dumps(request), capture_output=True, text=True, encoding="utf-8", check=False)
        self.assertEqual(process.returncode, 0, process.stderr)
        self.assertEqual(json.loads(process.stdout)["status"], "matched")
        self.assertIn("masterModels[0].modifications[0]", process.stderr)
        self.assertNotIn("Traceback", process.stderr)
        self.assertNotIn(VIN, process.stderr)

    def test_cli_file_mode_survives_bad_record(self):
        with tempfile.TemporaryDirectory() as directory:
            file = Path(directory) / "catalog.json"
            file.write_text(json.dumps({"schemaVersion": 1, "masterModels": [None, MODEL]}), encoding="utf-8-sig")
            process = subprocess.run([sys.executable, "-B", str(SCRIPT), str(file), VIN], capture_output=True, text=True, encoding="utf-8", check=False)
        self.assertEqual(process.returncode, 0, process.stderr)
        self.assertEqual(json.loads(process.stdout)["matches"][0]["modificationId"], "healthy")
        self.assertIn("masterModels[0]", process.stderr)

    def test_cli_invalid_export_still_exits_with_error(self):
        process = subprocess.run([sys.executable, "-B", str(SCRIPT), "--stdin"], input='{"schemaVersion":1,"masterModels":{}}', capture_output=True, text=True, encoding="utf-8", check=False)
        self.assertNotEqual(process.returncode, 0)
        self.assertEqual(process.stdout, "")


if __name__ == "__main__":
    unittest.main()
