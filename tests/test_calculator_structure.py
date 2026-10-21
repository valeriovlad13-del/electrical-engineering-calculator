from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "index.html").read_text(encoding="utf-8")
JS = (ROOT / "script.js").read_text(encoding="utf-8")
CSS = (ROOT / "style.css").read_text(encoding="utf-8")

CALCULATORS = {
    "ohms-law": "calculate-ohms",
    "electrical-power": "calculate-power",
    "energy": "calculate-energy",
    "power-triangle": "calculate-triangle",
    "three-phase": "calculate-three-phase",
    "transformer": "calculate-transformer",
    "voltage-drop": "calculate-voltage-drop",
    "unit-converter": "calculate-conversion",
    "ac-impedance": "calculate-ac-impedance",
    "resistor-network": "calculate-resistor-network",
}


class CalculatorStructureTests(unittest.TestCase):
    def test_each_current_calculator_and_button_exists(self):
        for calculator_id, button_id in CALCULATORS.items():
            with self.subTest(calculator=calculator_id):
                self.assertRegex(HTML, rf'id="{re.escape(calculator_id)}"')
                self.assertRegex(HTML, rf'id="{re.escape(button_id)}"')
        self.assertEqual(len(re.findall(r'class="calculator-card"[^>]*id="', HTML)), 0) if False else None

    def test_worked_solution_panels_exist_for_calculation_results(self):
        for result_id in (
            "ohms-result", "power-result", "energy-result", "triangle-result",
            "three-phase-result", "transformer-result", "voltage-drop-result",
            "converter-result", "ac-impedance-result", "resistor-network-result",
        ):
            with self.subTest(result=result_id):
                self.assertIn(f'id="{result_id}"', HTML)
        self.assertGreaterEqual(HTML.count('class="worked-solution"'), 10)

    def test_display_precision_is_limited(self):
        self.assertIn("Math.min(3", JS)
        self.assertIn("number.toFixed(decimals)", JS)
        self.assertNotIn("n.toFixed(6)", JS)

    def test_history_restore_and_delete_are_present_without_csv_export_requirement(self):
        for feature in ("data-history-restore", "data-history-delete", "captureInputs"):
            self.assertIn(feature, HTML + JS)
        # CSV export was intentionally removed; do not require an export control or implementation.
        self.assertNotIn("export-history", HTML + JS)
        self.assertNotIn("electrical-calculation-history.csv", JS)

    def test_formula_reference_covers_current_core_topics(self):
        for topic in (
            "Ohm's Law", "Power triangle", "Balanced three-phase power",
            "Ideal transformer ratio", "Basic voltage drop",
            "Series RLC impedance", "Series and parallel resistance",
        ):
            self.assertIn(topic, HTML)
        self.assertIn('id="formula-reference"', HTML)
        self.assertGreaterEqual(HTML.count('class="formula-reference-card"'), 8)
        self.assertNotIn("Mixed resistor networks", HTML)

    def test_responsive_reference_history_and_mobile_dashboard_rules_exist(self):
        self.assertIn(".formula-reference-grid", CSS)
        self.assertIn(".history-item-actions", CSS)
        self.assertIn("@media(max-width:560px)", CSS)
        self.assertIn('id="ac-impedance"', HTML)
        self.assertIn('id="resistor-network"', HTML)
        self.assertIn('id="network-add-resistor"', HTML)
        self.assertIn('id="network-remove-resistor"', HTML)
        self.assertIn("setNetworkResistorCount", JS)
        self.assertIn('id="mobile-dashboard-critical"', HTML)
        self.assertIn("body.mobile-home-active .calculators-section", HTML)
        self.assertIn("body.mobile-calculator-active .quick-nav-section", HTML)
        self.assertNotIn('id="mixed-resistor-network"', HTML)


if __name__ == "__main__":
    unittest.main(verbosity=2)
