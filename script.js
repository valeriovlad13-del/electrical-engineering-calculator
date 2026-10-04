// ========================================
// Ohm's Law Calculator
// ========================================


// Get HTML elements
const voltageInput = document.getElementById("voltage");
const currentInput = document.getElementById("current");
const resistanceInput = document.getElementById("resistance");

const calculateButton = document.getElementById("calculate-ohms");
const resetButton = document.getElementById("reset-ohms");

const message = document.getElementById("ohms-message");
const resultValue = document.getElementById("result-value");
const resultFormula = document.getElementById("result-formula");


// ========================================
// Calculate Ohm's Law
// ========================================

calculateButton.addEventListener("click", function () {

    // Convert input values from text to numbers
    const voltage = parseFloat(voltageInput.value);
    const current = parseFloat(currentInput.value);
    const resistance = parseFloat(resistanceInput.value);


    // Clear previous message
    message.textContent = "";


    // Count how many values were entered
    const valuesEntered = [
        voltage,
        current,
        resistance
    ].filter(value => !isNaN(value)).length;


    // We need exactly two values
    if (valuesEntered !== 2) {

        message.textContent =
            "Please enter exactly two values.";

        resultValue.textContent =
            "Unable to calculate.";

        resultFormula.textContent = "";

        return;
    }


    // Check for negative values
    if (
        (!isNaN(voltage) && voltage < 0) ||
        (!isNaN(current) && current < 0) ||
        (!isNaN(resistance) && resistance < 0)
    ) {

        message.textContent =
            "Please enter positive values.";

        resultValue.textContent =
            "Unable to calculate.";

        resultFormula.textContent = "";

        return;
    }


    // ====================================
    // Calculate Voltage
    // V = I × R
    // ====================================

    if (
        isNaN(voltage) &&
        !isNaN(current) &&
        !isNaN(resistance)
    ) {

        const calculatedVoltage =
            current * resistance;

        voltageInput.value =
            calculatedVoltage.toFixed(3);

        resultValue.textContent =
            `Voltage = ${calculatedVoltage.toFixed(3)} V`;

        resultFormula.textContent =
            `V = I × R = ${current} × ${resistance}`;
    }


    // ====================================
    // Calculate Current
    // I = V / R
    // ====================================

    else if (
        !isNaN(voltage) &&
        isNaN(current) &&
        !isNaN(resistance)
    ) {

        if (resistance === 0) {

            message.textContent =
                "Resistance cannot be zero.";

            resultValue.textContent =
                "Unable to calculate.";

            resultFormula.textContent = "";

            return;
        }


        const calculatedCurrent =
            voltage / resistance;

        currentInput.value =
            calculatedCurrent.toFixed(3);

        resultValue.textContent =
            `Current = ${calculatedCurrent.toFixed(3)} A`;

        resultFormula.textContent =
            `I = V / R = ${voltage} / ${resistance}`;
    }


    // ====================================
    // Calculate Resistance
    // R = V / I
    // ====================================

    else if (
        !isNaN(voltage) &&
        !isNaN(current) &&
        isNaN(resistance)
    ) {

        if (current === 0) {

            message.textContent =
                "Current cannot be zero.";

            resultValue.textContent =
                "Unable to calculate.";

            resultFormula.textContent = "";

            return;
        }


        const calculatedResistance =
            voltage / current;

        resistanceInput.value =
            calculatedResistance.toFixed(3);

        resultValue.textContent =
            `Resistance = ${calculatedResistance.toFixed(3)} Ω`;

        resultFormula.textContent =
            `R = V / I = ${voltage} / ${current}`;
    }

});


// ========================================
// Reset Calculator
// ========================================

resetButton.addEventListener("click", function () {

    voltageInput.value = "";
    currentInput.value = "";
    resistanceInput.value = "";

    message.textContent = "";

    resultValue.textContent =
        "Enter two values to calculate the third.";

    resultFormula.textContent = "";

});
