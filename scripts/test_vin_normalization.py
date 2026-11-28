"""VIN separators are formatting, not significant characters."""

import unittest

from decode_vin import decode_vin, normalize_vin, vin_rule_score


VIN = "WBA8A5105GK376359"
FORMATTED = "WBA-8A510-5GK376359"


class VinNormalizationTests(unittest.TestCase):
    def test_common_separators_normalize_to_the_same_vin(self):
        for separator in ("-", "‐", "‑", "–", "—", "−", " ", "\t", "\n", " - "):
            with self.subTest(separator=separator):
                value = separator.join(("wba", "8a510", "5gk376359"))
                self.assertEqual(normalize_vin(value), VIN)

    def test_typo_and_lookalike_corrections_still_apply(self):
        self.assertEqual(normalize_vin("WВА-8А510-5GК376359"), VIN)
        self.assertEqual(normalize_vin("WBA-8A51O-5GK376359"), VIN)

    def test_unknown_cyrillic_and_unsupported_punctuation_are_not_deleted(self):
        for value in ("WBA-8A510-5GK37635Ф", "WBA/8A510/5GK376359"):
            with self.subTest(value=value):
                with self.assertRaises(ValueError):
                    decode_vin(value, [])
        self.assertIn("Ф", normalize_vin("WBA-8A510-5GK37635Ф"))

    def test_overlong_vin_is_rejected_without_truncation(self):
        self.assertEqual(normalize_vin(FORMATTED + "0"), VIN + "0")
        with self.assertRaises(ValueError):
            decode_vin(FORMATTED + "0", [])

    def test_formatted_full_rules_and_prefix_rules_keep_position_semantics(self):
        self.assertEqual(vin_rule_score({"sample": FORMATTED, "positions": list(range(17))}, VIN), 17)
        self.assertEqual(vin_rule_score({"sample": "WBA-8A510-5GK"}, VIN), 10)
        changed_check_digit = VIN[:8] + "9" + VIN[9:]
        self.assertEqual(vin_rule_score({"sample": "WBA-8A510-5GK"}, changed_check_digit), 10)
        self.assertEqual(vin_rule_score({"sample": FORMATTED, "positions": [0, 1, 2, 3, 4, 5, 6, 7, 9, 10]}, changed_check_digit), 10)

    def test_formatted_input_and_exact_exception_match_canonical_vin(self):
        models = [{"brandSlug": "bmw", "brandName": "BMW", "modelSlug": "three", "modelName": "Three", "verified": True,
                   "modifications": [{"id": "exact", "name": "Exact", "attributes": {}, "vinExceptions": [FORMATTED]}]}]
        for value in (VIN, FORMATTED):
            with self.subTest(value=value):
                result = decode_vin(value, models)
                self.assertEqual(result["status"], "matched")
                self.assertEqual(result["matches"][0]["modificationId"], "exact")


if __name__ == "__main__":
    unittest.main()
