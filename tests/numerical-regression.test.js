const assert = require("node:assert/strict");
const core = require("../engineering-core.js");

const near = (actual, expected, tolerance = 1e-9) => {
    assert.ok(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)), `expected ${actual} ≈ ${expected}`);
};

function throws(fn, message) {
    assert.throws(fn, error => error instanceof RangeError && (!message || error.message.includes(message)));
}

// Ohm's Law: all three unknown-value paths and invalid denominators.
near(core.ohmsLaw({ voltage: 12, current: 2, resistance: null }).resistance, 6);
near(core.ohmsLaw({ voltage: 12, current: null, resistance: 6 }).current, 2);
near(core.ohmsLaw({ voltage: null, current: 2, resistance: 6 }).voltage, 12);
throws(() => core.ohmsLaw({ voltage: 12, current: 0, resistance: null }), "Current cannot be zero");
throws(() => core.ohmsLaw({ voltage: 12, current: null, resistance: 0 }), "Resistance cannot be zero");
throws(() => core.ohmsLaw({ voltage: 12, current: 2, resistance: 6 }), "Exactly two");

// Power and power factor limits.
near(core.electricalPower("dc", 230, 10), 2300);
near(core.electricalPower("single-phase", 230, 10, 0.8), 1840);
near(core.electricalPower("apparent", 230, 10), 2300);
throws(() => core.electricalPower("single-phase", 230, 10, 1.1), "Power factor");

// Energy and cost.
const energy = core.energyCost(2, 5, 10.659);
near(energy.energyKWh, 10);
near(energy.cost, 106.59);
throws(() => core.energyCost(2, -1, 10), "Time");

// Three-phase power: expected approx. 5,542.562584 W at 400 V, 10 A, PF 0.8.
const three = core.threePhaseRealPower(400, 10, 0.8);
near(three.watts, Math.sqrt(3) * 400 * 10 * 0.8);
near(three.kilowatts, three.watts / 1000);
throws(() => core.threePhaseRealPower(400, 10, 1.2), "Power factor");

// Ideal transformer ratio and optional current.
const transformer = core.idealTransformer(230, 1000, 100, 2);
near(transformer.secondaryVoltage, 23);
near(transformer.secondaryCurrent, 20);
throws(() => core.idealTransformer(230, 0, 100), "Primary turns");

// Voltage drop and percentage.
const drop = core.voltageDrop(10, 0.5, 230);
near(drop.volts, 5);
near(drop.percentage, 5 / 230 * 100);
assert.equal(core.voltageDrop(10, 0.5).percentage, null);
throws(() => core.voltageDrop(10, 0.5, 0), "System voltage");

// AC impedance, with independent R/L/C and combined impedance checks.
const inductive = core.acImpedance(0, 100, 0, 50);
near(inductive.inductiveReactance, 2 * Math.PI * 50 * 0.1);
near(inductive.netReactance, inductive.inductiveReactance);
const capacitive = core.acImpedance(0, 0, 100, 50);
near(capacitive.capacitiveReactance, 1 / (2 * Math.PI * 50 * 100e-6));
assert.ok(capacitive.netReactance < 0);
const combined = core.acImpedance(3, 100, 0, 50);
near(combined.impedanceMagnitude, Math.hypot(3, 2 * Math.PI * 50 * 0.1));
throws(() => core.acImpedance(3, 0, 0, 0), "Frequency");


/* Series and parallel resistor networks. */
const series = core.resistorNetwork("series", [10, 20, 30], 12);
near(series.equivalentResistance, 60);
near(series.totalCurrent, 0.2);
near(series.branches[0].voltage, 2);
near(series.branches[1].voltage, 4);
near(series.branches[2].voltage, 6);
near(series.branches[0].current, 0.2);
const parallel = core.resistorNetwork("parallel", [10, 20, 30], 12);
near(parallel.equivalentResistance, 60 / 11);
near(parallel.totalCurrent, 2.2);
near(parallel.branches[0].voltage, 12);
near(parallel.branches[0].current, 1.2);
near(parallel.branches[1].current, 0.6);
near(parallel.branches[2].current, 0.4);
near(core.resistorNetwork("series", [10, 20, 30]).equivalentResistance, 60);
throws(() => core.resistorNetwork("series", [10, 0, 30]), "positive");
throws(() => core.resistorNetwork("parallel", [10, 20, 30], -1), "non-negative");
throws(() => core.resistorNetwork("unknown", [10, 20, 30]), "Choose series or parallel");

console.log("All numerical regression tests passed.");
