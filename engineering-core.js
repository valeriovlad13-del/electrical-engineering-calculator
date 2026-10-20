(function (root) {
    "use strict";

    function finiteNonNegative(value, name) {
        if (!Number.isFinite(value) || value < 0) throw new RangeError(name + " must be a finite, non-negative number.");
    }
    function finitePositive(value, name) {
        if (!Number.isFinite(value) || value <= 0) throw new RangeError(name + " must be a finite number greater than zero.");
    }
    function powerFactor(value) {
        if (!Number.isFinite(value) || value < 0 || value > 1) throw new RangeError("Power factor must be between 0 and 1.");
    }

    function ohmsLaw(values) {
        const known = ["voltage", "current", "resistance"].filter(key => values[key] !== null && values[key] !== undefined);
        if (known.length !== 2) throw new RangeError("Exactly two known values are required.");
        known.forEach(key => finiteNonNegative(values[key], key));
        let voltage = values.voltage, current = values.current, resistance = values.resistance;
        if (voltage == null) voltage = current * resistance;
        else if (current == null) {
            if (resistance === 0) throw new RangeError("Resistance cannot be zero when calculating current.");
            current = voltage / resistance;
        } else {
            if (current === 0) throw new RangeError("Current cannot be zero when calculating resistance.");
            resistance = voltage / current;
        }
        return { voltage, current, resistance };
    }

    function electricalPower(mode, voltage, current, pf) {
        finiteNonNegative(voltage, "Voltage");
        finiteNonNegative(current, "Current");
        if (mode === "dc" || mode === "apparent") return voltage * current;
        if (mode === "single-phase") { powerFactor(pf); return voltage * current * pf; }
        throw new RangeError("Invalid power calculation type.");
    }

    function energyCost(powerKW, timeHours, rate) {
        finiteNonNegative(powerKW, "Power");
        finiteNonNegative(timeHours, "Time");
        finiteNonNegative(rate, "Electricity rate");
        const energyKWh = powerKW * timeHours;
        return { energyKWh, cost: energyKWh * rate };
    }

    function threePhaseRealPower(lineVoltage, lineCurrent, pf) {
        finiteNonNegative(lineVoltage, "Line voltage");
        finiteNonNegative(lineCurrent, "Line current");
        powerFactor(pf);
        const watts = Math.sqrt(3) * lineVoltage * lineCurrent * pf;
        return { watts, kilowatts: watts / 1000 };
    }

    function idealTransformer(primaryVoltage, primaryTurns, secondaryTurns, primaryCurrent = null) {
        finiteNonNegative(primaryVoltage, "Primary voltage");
        finitePositive(primaryTurns, "Primary turns");
        finitePositive(secondaryTurns, "Secondary turns");
        if (primaryCurrent !== null) finiteNonNegative(primaryCurrent, "Primary current");
        return {
            secondaryVoltage: primaryVoltage * secondaryTurns / primaryTurns,
            secondaryCurrent: primaryCurrent === null ? null : primaryCurrent * primaryTurns / secondaryTurns
        };
    }

    function voltageDrop(current, resistance, systemVoltage = null) {
        finiteNonNegative(current, "Current");
        finiteNonNegative(resistance, "Resistance");
        if (systemVoltage !== null) finitePositive(systemVoltage, "System voltage");
        const volts = current * resistance;
        return { volts, percentage: systemVoltage === null ? null : volts / systemVoltage * 100 };
    }

    function acImpedance(resistance, inductanceMilliHenry, capacitanceMicroFarad, frequencyHz) {
        finiteNonNegative(resistance, "Resistance");
        finiteNonNegative(inductanceMilliHenry, "Inductance");
        finiteNonNegative(capacitanceMicroFarad, "Capacitance");
        finitePositive(frequencyHz, "Frequency");
        const omega = 2 * Math.PI * frequencyHz;
        const inductiveReactance = omega * inductanceMilliHenry / 1000;
        const capacitiveReactance = capacitanceMicroFarad === 0 ? 0 : 1 / (omega * capacitanceMicroFarad / 1e6);
        const netReactance = inductiveReactance - capacitiveReactance;
        return {
            inductiveReactance,
            capacitiveReactance,
            netReactance,
            impedanceMagnitude: Math.hypot(resistance, netReactance),
            phaseAngleDegrees: Math.atan2(netReactance, resistance) * 180 / Math.PI
        };
    }

    const api = { ohmsLaw, electricalPower, energyCost, threePhaseRealPower, idealTransformer, voltageDrop, acImpedance };
    if (typeof module !== "undefined" && module.exports) module.exports = api;
    root.EngineeringCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
