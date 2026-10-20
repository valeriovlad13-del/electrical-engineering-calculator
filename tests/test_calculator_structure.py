from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "index.html").read_text(encoding="utf-8")
JS = (ROOT / "script.js").read_text(encoding="utf-8")
CSS = (ROOT / "style.css").read_text(encoding="utf-8")

CALCULATORS = {
    "ohms-result": "calculate-ohms",
    "power-result": "calculate-power",
    "energy-result": "calculate-energy",
    "triangle-result": "calculate-triangle",
    "three-phase-result": "calculate-three-phase",
    "transformer-result": "calculate-transformer",
    "voltage-drop-result": "calculate-voltage-drop",
    "converter-result": "calculate-conversion",
}

class CalculatorStructureTests(unittest.TestCase):
    def test_each_calculator_has_a_worked_solution_panel(self):
        self.assertEqual(HTML.count('class="worked-solution"'), 8)
        for result_id in CALCULATORS:
            self.assertIn(f'id="{result_id}"', HTML)
            start = HTML.index(f'id="{result_id}"')
            self.assertIn('class="worked-solution"', HTML[start:start + 1800])

    def test_each_solution_builder_is_connected_to_its_calculate_button(self):
        for result_id, button_id in CALCULATORS.items():
            self.assertIn(f'"{result_id}":()=>', JS)
            self.assertIn(f'"{result_id}":"{button_id}"', JS)
            self.assertIn(f'id="{button_id}"', HTML)

    def test_display_formatters_cap_precision_at_three_decimals(self):
        self.assertIn("Math.min(3", JS)
        self.assertIn("number.toFixed(decimals)", JS)
        self.assertIn("n.toFixed(3)", JS)
        self.assertNotIn("n.toFixed(6)", JS)

    def test_history_restore_and_export_are_present(self):
        for feature in ("data-history-restore", "data-history-delete", "export-history", "captureInputs"):
            self.assertIn(feature, HTML + JS)
        self.assertIn("electrical-calculation-history.csv", JS)

    def test_formula_reference_covers_core_topics(self):
        self.assertEqual(HTML.count('class="formula-reference-card"'), 8)
        for topic in ("Ohm's Law", "Power triangle", "Balanced three-phase power", "Ideal transformer ratio", "Basic voltage drop"):
            self.assertIn(topic, HTML)
        self.assertIn('id="formula-reference"', HTML)

    def test_responsive_reference_and_history_layouts_exist(self):
        self.assertIn(".formula-reference-grid", CSS)
        self.assertIn("@media(max-width:560px)", CSS)
        self.assertIn(".history-item-actions", CSS)

if __name__ == "__main__":
    unittest.main(verbosity=2)
