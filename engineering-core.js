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


    function resistorNetwork(type, resistances, supplyVoltage = null) {
        if (type !== "series" && type !== "parallel") throw new RangeError("Choose series or parallel.");
        if (!Array.isArray(resistances) || resistances.length < 2 || resistances.some(value => !Number.isFinite(value) || value <= 0)) {
            throw new RangeError("Enter at least two positive, finite resistor values.");
        }
        if (supplyVoltage !== null) finiteNonNegative(supplyVoltage, "Supply voltage");
        const equivalentResistance = type === "series"
            ? resistances.reduce((sum, value) => sum + value, 0)
            : 1 / resistances.reduce((sum, value) => sum + 1 / value, 0);
        const totalCurrent = supplyVoltage === null ? null : supplyVoltage / equivalentResistance;
        const branches = resistances.map(resistance => ({
            resistance,
            voltage: supplyVoltage === null ? null : (type === "series" ? totalCurrent * resistance : supplyVoltage),
            current: supplyVoltage === null ? null : (type === "series" ? totalCurrent : supplyVoltage / resistance)
        }));
        return { type, equivalentResistance, totalCurrent, branches };
    }

    function mixedResistorNetwork(resistors, supplyVoltage) {
        if (!Array.isArray(resistors) || resistors.length < 2 || resistors.length > 30) {
            throw new RangeError("Enter between 2 and 30 resistors.");
        }
        finiteNonNegative(supplyVoltage, "Supply voltage");
        if (supplyVoltage <= 0) throw new RangeError("Supply voltage must be greater than zero.");
        const branches = resistors.map((item, index) => {
            const a = Number(item.a), b = Number(item.b), resistance = Number(item.resistance);
            if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0 || a > 10 || b > 10 || a === b) {
                throw new RangeError("Each resistor must connect two different node numbers from 0 to 10.");
            }
            if (!Number.isFinite(resistance) || resistance <= 0) {
                throw new RangeError("Every resistor resistance must be greater than zero.");
            }
            return { id: index + 1, a, b, resistance };
        });
        const nodes = [...new Set(branches.flatMap(branch => [branch.a, branch.b]).concat([0, 1]))].sort((a, b) => a - b);
        const connected = new Set([0]);
        let changed = true;
        while (changed) {
            changed = false;
            branches.forEach(branch => {
                if (connected.has(branch.a) && !connected.has(branch.b)) { connected.add(branch.b); changed = true; }
                if (connected.has(branch.b) && !connected.has(branch.a)) { connected.add(branch.a); changed = true; }
            });
        }
        if (nodes.some(node => !connected.has(node))) throw new RangeError("All resistor nodes must belong to one connected network.");
        if (!connected.has(1)) throw new RangeError("The network must connect source node 1 to ground node 0.");
        const unknownNodes = nodes.filter(node => node !== 0 && node !== 1);
        const indexOf = new Map(unknownNodes.map((node, index) => [node, index]));
        const matrix = unknownNodes.map(() => unknownNodes.map(() => 0));
        const rhs = unknownNodes.map(() => 0);
        branches.forEach(({a, b, resistance}) => {
            const g = 1 / resistance;
            if (indexOf.has(a)) {
                const i = indexOf.get(a);
                matrix[i][i] += g;
                if (indexOf.has(b)) matrix[i][indexOf.get(b)] -= g;
                else if (b === 1) rhs[i] += g * supplyVoltage;
            }
            if (indexOf.has(b)) {
                const i = indexOf.get(b);
                matrix[i][i] += g;
                if (indexOf.has(a)) matrix[i][indexOf.get(a)] -= g;
                else if (a === 1) rhs[i] += g * supplyVoltage;
            }
        });
        for (let i = 0; i < matrix.length; i++) {
            let pivot = i;
            for (let row = i + 1; row < matrix.length; row++) {
                if (Math.abs(matrix[row][i]) > Math.abs(matrix[pivot][i])) pivot = row;
            }
            if (Math.abs(matrix[pivot][i]) < 1e-12) throw new RangeError("This network is disconnected or has no unique solution.");
            [matrix[i], matrix[pivot]] = [matrix[pivot], matrix[i]];
            [rhs[i], rhs[pivot]] = [rhs[pivot], rhs[i]];
            const divisor = matrix[i][i];
            for (let col = i; col < matrix.length; col++) matrix[i][col] /= divisor;
            rhs[i] /= divisor;
            for (let row = 0; row < matrix.length; row++) {
                if (row === i) continue;
                const factor = matrix[row][i];
                for (let col = i; col < matrix.length; col++) matrix[row][col] -= factor * matrix[i][col];
                rhs[row] -= factor * rhs[i];
            }
        }
        const nodeVoltages = {0: 0, 1: supplyVoltage};
        unknownNodes.forEach((node, index) => { nodeVoltages[node] = rhs[index]; });
        const results = branches.map(branch => {
            const voltage = nodeVoltages[branch.a] - nodeVoltages[branch.b];
            return {...branch, voltage, current: voltage / branch.resistance, power: voltage * voltage / branch.resistance};
        });
        const sourceCurrent = results.reduce((sum, branch) => sum + (branch.a === 1 ? branch.current : branch.b === 1 ? -branch.current : 0), 0);
        if (!(sourceCurrent > 0) || !Number.isFinite(sourceCurrent)) throw new RangeError("Could not calculate a valid source current; check the network connections.");
        return {supplyVoltage, sourceCurrent, equivalentResistance: supplyVoltage / sourceCurrent, nodeVoltages, branches: results};
    }

    const api = { ohmsLaw, electricalPower, energyCost, threePhaseRealPower, idealTransformer, voltageDrop, acImpedance, resistorNetwork, mixedResistorNetwork };
    if (typeof module !== "undefined" && module.exports) module.exports = api;
    root.EngineeringCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
