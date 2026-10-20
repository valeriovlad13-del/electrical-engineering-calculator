"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const Core = require("../engineering-core.js");
function close(actual, expected, tolerance = 1e-9) {
  assert.ok(Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected)), `expected ${actual} to be close to ${expected}`);
}
test("Ohm's law solves each missing quantity", () => {
  close(Core.ohmsLaw({ voltage: null, current: 2, resistance: 6 }).voltage, 12);
  close(Core.ohmsLaw({ voltage: 12, current: null, resistance: 6 }).current, 2);
  close(Core.ohmsLaw({ voltage: 12, current: 2, resistance: null }).resistance, 6);
});
test("Ohm's law rejects ambiguous and impossible zero-divisor inputs", () => {
  assert.throws(() => Core.ohmsLaw({ voltage: 12, current: 2, resistance: 6 }), /Exactly two/);
  assert.throws(() => Core.ohmsLaw({ voltage: 12, current: null, resistance: 0 }), /zero/);
  assert.throws(() => Core.ohmsLaw({ voltage: 12, current: 0, resistance: null }), /zero/);
});
test("DC, single-phase real, and apparent power use the correct formulas", () => {
  close(Core.electricalPower("dc", 230, 2), 460);
  close(Core.electricalPower("single-phase", 230, 2, 0.8), 368);
  close(Core.electricalPower("apparent", 230, 2), 460);
  assert.throws(() => Core.electricalPower("single-phase", 230, 2, 1.2), /Power factor/);
});
test("energy and cost use kW, hours, and rate per kWh", () => {
  const result = Core.energyCost(2, 5, 10.659);
  close(result.energyKWh, 10);
  close(result.cost, 106.59);
});
test("balanced three-phase real power uses line values", () => {
  const result = Core.threePhaseRealPower(400, 10, 0.8);
  close(result.watts, Math.sqrt(3) * 400 * 10 * 0.8);
  close(result.kilowatts, result.watts / 1000);
});
test("ideal transformer ratios calculate voltage and current", () => {
  const result = Core.idealTransformer(230, 500, 100, 2);
  close(result.secondaryVoltage, 46);
  close(result.secondaryCurrent, 10);
  assert.equal(Core.idealTransformer(230, 500, 100).secondaryCurrent, null);
});
test("voltage drop and percentage use entered resistance", () => {
  const result = Core.voltageDrop(10, 0.5, 230);
  close(result.volts, 5);
  close(result.percentage, 5 / 230 * 100);
  assert.equal(Core.voltageDrop(10, 0.5).percentage, null);
});
test("AC impedance handles a removed capacitor and rejects zero frequency", () => {
  const result = Core.acImpedance(10, 100, 0, 60);
  close(result.inductiveReactance, 2 * Math.PI * 60 * 0.1);
  assert.equal(result.capacitiveReactance, 0);
  close(result.impedanceMagnitude, Math.hypot(10, result.inductiveReactance));
  assert.throws(() => Core.acImpedance(10, 100, 10, 0), /Frequency/);
});
test("series network calculates equivalent resistance and branch values", () => {
  const result = Core.resistorNetwork("series", [10, 20, 30], 12);
  close(result.equivalentResistance, 60);
  close(result.totalCurrent, 0.2);
  assert.deepEqual(result.branches.map(x => x.voltage), [2, 4, 6]);
  assert.deepEqual(result.branches.map(x => x.current), [0.2, 0.2, 0.2]);
});
test("parallel network calculates equivalent resistance and branch values", () => {
  const result = Core.resistorNetwork("parallel", [6, 3], 12);
  close(result.equivalentResistance, 2);
  close(result.totalCurrent, 6);
  assert.deepEqual(result.branches.map(x => x.voltage), [12, 12]);
  assert.deepEqual(result.branches.map(x => x.current), [2, 4]);
});
test("resistor networks reject nonpositive resistances and invalid types", () => {
  assert.throws(() => Core.resistorNetwork("series", [10, 0]), /positive/);
  assert.throws(() => Core.resistorNetwork("mixed", [10, 20]), /Choose series or parallel/);
});
test("representative calculations return finite results", () => {
  const values = [
    Core.ohmsLaw({ voltage: null, current: 2, resistance: 6 }).voltage,
    Core.electricalPower("single-phase", 230, 2, 0.8),
    Core.energyCost(2, 5, 10.659).cost,
    Core.threePhaseRealPower(400, 10, 0.8).watts,
    Core.idealTransformer(230, 500, 100, 2).secondaryVoltage,
    Core.voltageDrop(10, 0.5, 230).volts,
    Core.acImpedance(10, 100, 0, 60).impedanceMagnitude,
    Core.resistorNetwork("parallel", [6, 3], 12).equivalentResistance
  ];
  assert.ok(values.every(Number.isFinite));
});
