/* =========================================================
   ELECTRICAL ENGINEERING CALCULATOR
   ========================================================= */


/* =========================================================
   GENERAL FUNCTIONS
========================================================= */

function getNumber(id) {
    const value = document.getElementById(id).value.trim();

    if (value === "") {
        return null;
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return null;
    }

    return number;
}


function formatNumber(number, decimals = 4) {

    if (!Number.isFinite(number)) {
        return "Invalid";
    }

    return Number(number.toFixed(decimals)).toLocaleString();
}


function showMessage(id, message, type = "error") {

    const element = document.getElementById(id);

    element.textContent = message;

    element.className = `message ${type}`;
}


function clearMessage(id) {

    const element = document.getElementById(id);

    element.textContent = "";
    element.className = "message";
}


function showResult(id) {

    document.getElementById(id).classList.add("show");
}


function hideResult(id) {

    document.getElementById(id).classList.remove("show");
}


function isNonNegative(value) {

    return value !== null && value >= 0;
}


function isPositive(value) {

    return value !== null && value > 0;
}


/* =========================================================
   CALCULATION HISTORY
========================================================= */

function saveHistory(title, calculation, result) {

    const history =
        JSON.parse(
            localStorage.getItem("electricalCalculatorHistory")
        ) || [];

    history.unshift({
        title,
        calculation,
        result,
        date: new Date().toLocaleString()
    });

    /*
       Keep only the latest 20 calculations.
    */

    if (history.length > 20) {
        history.length = 20;
    }

    localStorage.setItem(
        "electricalCalculatorHistory",
        JSON.stringify(history)
    );

    displayHistory();
}


function displayHistory() {

    const historyList =
        document.getElementById("history-list");

    const history =
        JSON.parse(
            localStorage.getItem("electricalCalculatorHistory")
        ) || [];

    if (history.length === 0) {

        historyList.innerHTML =
            '<p class="empty-history">No calculations yet.</p>';

        return;
    }

    historyList.innerHTML = history
        .map(item => `
            <div class="history-item">
                <strong>${escapeHTML(item.title)}</strong>
                <div>${escapeHTML(item.calculation)}</div>
                <div><strong>Result:</strong> ${escapeHTML(item.result)}</div>
                <small>${escapeHTML(item.date)}</small>
            </div>
        `)
        .join("");
}


function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


document
    .getElementById("clear-history")
    .addEventListener("click", () => {

        localStorage.removeItem(
            "electricalCalculatorHistory"
        );

        displayHistory();
    });


/* =========================================================
   OHM'S LAW
========================================================= */

const voltageInput =
    document.getElementById("voltage");

const currentInput =
    document.getElementById("current");

const resistanceInput =
    document.getElementById("resistance");

document
    .getElementById("calculate-ohms")
    .addEventListener("click", calculateOhmsLaw);


function calculateOhmsLaw() {

    const V = getNumber("voltage");
    const I = getNumber("current");
    const R = getNumber("resistance");

    const values = [V, I, R];

    const enteredValues =
        values.filter(value => value !== null);

    clearMessage("ohms-message");

    if (enteredValues.length !== 2) {

        showMessage(
            "ohms-message",
            "Please enter exactly two values."
        );

        hideResult("ohms-result");

        return;
    }

    if (
        enteredValues.some(
            value => value < 0
        )
    ) {

        showMessage(
            "ohms-message",
            "Values cannot be negative."
        );

        hideResult("ohms-result");

        return;
    }


    let result;
    let formula;
    let resultText;


    /* V = I × R */

    if (V === null) {

        if (R === 0) {

            showMessage(
                "ohms-message",
                "Resistance cannot be zero when calculating current."
            );

            hideResult("ohms-result");

            return;
        }

        result = I * R;

        voltageInput.value = result;

        formula = "V = I × R";

        resultText =
            `Voltage = ${formatNumber(result)} V`;
    }


    /* I = V / R */

    else if (I === null) {

        if (R === 0) {

            showMessage(
                "ohms-message",
                "Resistance cannot be zero."
            );

            hideResult("ohms-result");

            return;
        }

        result = V / R;

        currentInput.value = result;

        formula = "I = V ÷ R";

        resultText =
            `Current = ${formatNumber(result)} A`;
    }


    /* R = V / I */

    else {

        if (I === 0) {

            showMessage(
                "ohms-message",
                "Current cannot be zero when calculating resistance."
            );

            hideResult("ohms-result");

            return;
        }

        result = V / I;

        resistanceInput.value = result;

        formula = "R = V ÷ I";

        resultText =
            `Resistance = ${formatNumber(result)} Ω`;
    }


    document.getElementById("result-value").textContent =
        resultText;

    document.getElementById("result-formula").textContent =
        `Formula: ${formula}`;

    showMessage(
        "ohms-message",
        "Calculation completed successfully.",
        "success"
    );

    showResult("ohms-result");


    saveHistory(
        "Ohm's Law",
        formula,
        resultText
    );
}


document
    .getElementById("reset-ohms")
    .addEventListener("click", () => {

        voltageInput.value = "";
        currentInput.value = "";
        resistanceInput.value = "";

        clearMessage("ohms-message");

        hideResult("ohms-result");
    });


/* =========================================================
   ELECTRICAL POWER
========================================================= */

const powerMode =
    document.getElementById("power-mode");

const powerFactorGroup =
    document.getElementById("power-factor-group");


function updatePowerMode() {

    if (
        powerMode.value === "single-phase"
    ) {

        powerFactorGroup.style.display = "block";

    } else {

        powerFactorGroup.style.display = "none";
    }
}


powerMode.addEventListener(
    "change",
    updatePowerMode
);

updatePowerMode();


document
    .getElementById("calculate-power")
    .addEventListener(
        "click",
        calculatePower
    );


function calculatePower() {

    const V =
        getNumber("power-voltage");

    const I =
        getNumber("power-current");

    const PF =
        getNumber("power-pf");

    const mode =
        powerMode.value;

    clearMessage("power-message");

    if (!isNonNegative(V) || !isNonNegative(I)) {

        showMessage(
            "power-message",
            "Please enter valid non-negative voltage and current values."
        );

        hideResult("power-result");

        return;
    }

    let result;
    let formula;
    let resultText;


    /* DC POWER */

    if (mode === "dc") {

        result = V * I;

        formula = "P = V × I";

        resultText =
            `Real Power = ${formatNumber(result)} W (${formatNumber(result / 1000)} kW)`;
    }


    /* SINGLE-PHASE AC */

    else if (mode === "single-phase") {

        if (
            !isNonNegative(PF) ||
            PF > 1
        ) {

            showMessage(
                "power-message",
                "Power factor must be between 0 and 1."
            );

            hideResult("power-result");

            return;
        }

        result =
            V * I * PF;

        formula =
            "P = V × I × PF";

        resultText =
            `Real Power = ${formatNumber(result)} W (${formatNumber(result / 1000)} kW)`;
    }


    /* APPARENT POWER */

    else {

        result =
            V * I;

        formula =
            "S = V × I";

        resultText =
            `Apparent Power = ${formatNumber(result)} VA (${formatNumber(result / 1000)} kVA)`;
    }


    document.getElementById(
        "power-result-value"
    ).textContent = resultText;

    document.getElementById(
        "power-result-formula"
    ).textContent =
        `Formula: ${formula}`;


    showMessage(
        "power-message",
        "Calculation completed successfully.",
        "success"
    );

    showResult("power-result");


    saveHistory(
        "Electrical Power",
        formula,
        resultText
    );
}


document
    .getElementById("reset-power")
    .addEventListener("click", () => {

        document.getElementById(
            "power-voltage"
        ).value = "";

        document.getElementById(
            "power-current"
        ).value = "";

        document.getElementById(
            "power-pf"
        ).value = "";

        powerMode.value = "dc";

        updatePowerMode();

        clearMessage("power-message");

        hideResult("power-result");
    });


/* =========================================================
   ENERGY & COST
========================================================= */

document
    .getElementById("calculate-energy")
    .addEventListener(
        "click",
        calculateEnergy
    );


function calculateEnergy() {

    const power =
        getNumber("energy-power");

    const time =
        getNumber("energy-time");

    const rate =
        getNumber("energy-rate");

    clearMessage("energy-message");

    if (
        !isNonNegative(power) ||
        !isNonNegative(time)
    ) {

        showMessage(
            "energy-message",
            "Please enter valid non-negative power and time values."
        );

        hideResult("energy-result");

        return;
    }

    if (!isNonNegative(rate)) {

        showMessage(
            "energy-message",
            "Please enter a valid electricity rate."
        );

        hideResult("energy-result");

        return;
    }


    const energy =
        power * time;

    const cost =
        energy * rate;


    document.getElementById(
        "energy-result-value"
    ).textContent =
        `Energy = ${formatNumber(energy)} kWh`;

    document.getElementById(
        "energy-cost"
    ).textContent =
        `Estimated Cost = ₱${formatNumber(cost, 2)}`;

    document.getElementById(
        "energy-result-formula"
    ).textContent =
        "Formula: E = P × t";


    showMessage(
        "energy-message",
        "Calculation completed successfully.",
        "success"
    );

    showResult("energy-result");


    saveHistory(
        "Energy & Cost",
        "E = P × t",
        `Energy = ${formatNumber(energy)} kWh | Cost = ₱${formatNumber(cost, 2)}`
    );
}


document
    .getElementById("reset-energy")
    .addEventListener("click", () => {

        document.getElementById(
            "energy-power"
        ).value = "";

        document.getElementById(
            "energy-time"
        ).value = "";

        document.getElementById(
            "energy-rate"
        ).value = "10.659";

        clearMessage("energy-message");

        hideResult("energy-result");
    });


/* =========================================================
   POWER FACTOR
========================================================= */

document
    .getElementById("calculate-pf")
    .addEventListener(
        "click",
        calculatePowerFactor
    );


function calculatePowerFactor() {

    const P =
        getNumber("pf-real-power");

    const S =
        getNumber("pf-apparent-power");

    clearMessage("pf-message");

    if (
        !isNonNegative(P) ||
        !isPositive(S)
    ) {

        showMessage(
            "pf-message",
            "Enter valid values. Apparent power must be greater than zero."
        );

        hideResult("pf-result");

        return;
    }

    if (P > S) {

        showMessage(
            "pf-message",
            "Real power cannot be greater than apparent power."
        );

        hideResult("pf-result");

        return;
    }


    const PF =
        P / S;


    document.getElementById(
        "pf-result-value"
    ).textContent =
        `Power Factor = ${formatNumber(PF, 4)}`;


    document.getElementById(
        "pf-result-formula"
    ).textContent =
        "Formula: PF = P ÷ S";


    showMessage(
        "pf-message",
        "Calculation completed successfully.",
        "success"
    );

    showResult("pf-result");


    saveHistory(
        "Power Factor",
        "PF = P ÷ S",
        `Power Factor = ${formatNumber(PF, 4)}`
    );
}


document
    .getElementById("reset-pf")
    .addEventListener("click", () => {

        document.getElementById(
            "pf-real-power"
        ).value = "";

        document.getElementById(
            "pf-apparent-power"
        ).value = "";

        clearMessage("pf-message");

        hideResult("pf-result");
    });


/* =========================================================
   THREE-PHASE POWER
========================================================= */

document
    .getElementById("calculate-three-phase")
    .addEventListener(
        "click",
        calculateThreePhase
    );


function calculateThreePhase() {

    const VL =
        getNumber("three-phase-voltage");

    const IL =
        getNumber("three-phase-current");

    const PF =
        getNumber("three-phase-pf");

    clearMessage(
        "three-phase-message"
    );


    if (
        !isNonNegative(VL) ||
        !isNonNegative(IL)
    ) {

        showMessage(
            "three-phase-message",
            "Please enter valid non-negative voltage and current values."
        );

        hideResult("three-phase-result");

        return;
    }


    if (
        !isNonNegative(PF) ||
        PF > 1
    ) {

        showMessage(
            "three-phase-message",
            "Power factor must be between 0 and 1."
        );

        hideResult("three-phase-result");

        return;
    }


    const power =
        Math.sqrt(3) *
        VL *
        IL *
        PF;


    document.getElementById(
        "three-phase-result-value"
    ).textContent =
        `Real Power = ${formatNumber(power)} W (${formatNumber(power / 1000)} kW)`;


    document.getElementById(
        "three-phase-result-formula"
    ).textContent =
        "Formula: P = √3 × VL × IL × PF";


    showMessage(
        "three-phase-message",
        "Calculation completed successfully.",
        "success"
    );

    showResult(
        "three-phase-result"
    );


    saveHistory(
        "Three-Phase Power",
        "P = √3 × VL × IL × PF",
        `Real Power = ${formatNumber(power)} W`
    );
}


document
    .getElementById("reset-three-phase")
    .addEventListener("click", () => {

        document.getElementById(
            "three-phase-voltage"
        ).value = "";

        document.getElementById(
            "three-phase-current"
        ).value = "";

        document.getElementById(
            "three-phase-pf"
        ).value = "";

        clearMessage(
            "three-phase-message"
        );

        hideResult(
            "three-phase-result"
        );
    });


/* =========================================================
   TRANSFORMER
========================================================= */

document
    .getElementById("calculate-transformer")
    .addEventListener(
        "click",
        calculateTransformer
    );


function calculateTransformer() {

    const V1 =
        getNumber("transformer-v1");

    const N1 =
        getNumber("transformer-n1");

    const N2 =
        getNumber("transformer-n2");

    const I1 =
        getNumber("transformer-primary-current");

    clearMessage(
        "transformer-message"
    );


    if (
        !isPositive(V1) ||
        !isPositive(N1) ||
        !isPositive(N2)
    ) {

        showMessage(
            "transformer-message",
            "Primary voltage and transformer turns must be greater than zero."
        );

        hideResult(
            "transformer-result"
        );

        return;
    }


    const V2 =
        V1 * (N2 / N1);


    document.getElementById(
        "transformer-voltage-result"
    ).textContent =
        `Secondary Voltage = ${formatNumber(V2)} V`;


    let currentText =
        "Secondary current not calculated because primary current was not provided.";

    if (I1 !== null) {

        if (!isNonNegative(I1)) {

            showMessage(
                "transformer-message",
                "Primary current cannot be negative."
            );

            hideResult(
                "transformer-result"
            );

            return;
        }


        const I2 =
            I1 * (N1 / N2);


        currentText =
            `Ideal Secondary Current = ${formatNumber(I2)} A`;
    }


    document.getElementById(
        "transformer-current-result"
    ).textContent =
        currentText;


    document.getElementById(
        "transformer-result-formula"
    ).textContent =
        "Voltage: V₁/V₂ = N₁/N₂ | Current: I₂ = I₁ × N₁/N₂";


    showMessage(
        "transformer-message",
        "Calculation completed successfully.",
        "success"
    );

    showResult(
        "transformer-result"
    );


    saveHistory(
        "Transformer",
        "V₁/V₂ = N₁/N₂",
        `Secondary Voltage = ${formatNumber(V2)} V`
    );
}


document
    .getElementById("reset-transformer")
    .addEventListener("click", () => {

        document.getElementById(
            "transformer-v1"
        ).value = "";

        document.getElementById(
            "transformer-n1"
        ).value = "";

        document.getElementById(
            "transformer-n2"
        ).value = "";

        document.getElementById(
            "transformer-primary-current"
        ).value = "";

        clearMessage(
            "transformer-message"
        );

        hideResult(
            "transformer-result"
        );
    });


/* =========================================================
   VOLTAGE DROP
========================================================= */

document
    .getElementById("calculate-voltage-drop")
    .addEventListener(
        "click",
        calculateVoltageDrop
    );


function calculateVoltageDrop() {

    const I =
        getNumber("voltage-drop-current");

    const R =
        getNumber("voltage-drop-resistance");

    const systemVoltage =
        getNumber(
            "voltage-drop-system-voltage"
        );


    clearMessage(
        "voltage-drop-message"
    );


    if (
        !isNonNegative(I) ||
        !isNonNegative(R)
    ) {

        showMessage(
            "voltage-drop-message",
            "Please enter valid non-negative current and resistance values."
        );

        hideResult(
            "voltage-drop-result"
        );

        return;
    }


    const voltageDrop =
        I * R;


    document.getElementById(
        "voltage-drop-result-value"
    ).textContent =
        `Voltage Drop = ${formatNumber(voltageDrop)} V`;


    let percentageText =
        "Percentage voltage drop was not calculated.";

    if (systemVoltage !== null) {

        if (systemVoltage <= 0) {

            showMessage(
                "voltage-drop-message",
                "System voltage must be greater than zero."
            );

            hideResult(
                "voltage-drop-result"
            );

            return;
        }


        const percentage =
            (voltageDrop / systemVoltage) * 100;


        percentageText =
            `Voltage Drop = ${formatNumber(percentage, 2)}%`;
    }


    document.getElementById(
        "voltage-drop-percentage"
    ).textContent =
        percentageText;


    document.getElementById(
        "voltage-drop-result-formula"
    ).textContent =
        "Formula: VD = I × R";


    showMessage(
        "voltage-drop-message",
        "Calculation completed successfully.",
        "success"
    );

    showResult(
        "voltage-drop-result"
    );


    saveHistory(
        "Voltage Drop",
        "VD = I × R",
        `Voltage Drop = ${formatNumber(voltageDrop)} V`
    );
}


document
    .getElementById("reset-voltage-drop")
    .addEventListener("click", () => {

        document.getElementById(
            "voltage-drop-current"
        ).value = "";

        document.getElementById(
            "voltage-drop-resistance"
        ).value = "";

        document.getElementById(
            "voltage-drop-system-voltage"
        ).value = "";

        clearMessage(
            "voltage-drop-message"
        );

        hideResult(
            "voltage-drop-result"
        );
    });


/* =========================================================
   UNIT CONVERTER
========================================================= */

document
    .getElementById("calculate-conversion")
    .addEventListener(
        "click",
        calculateConversion
    );


function calculateConversion() {

    const value =
        getNumber("converter-value");

    const type =
        document.getElementById(
            "converter-type"
        ).value;


    clearMessage(
        "converter-message"
    );


    if (value === null || !Number.isFinite(value)) {

        showMessage(
            "converter-message",
            "Please enter a valid number."
        );

        hideResult(
            "converter-result"
        );

        return;
    }


    let result;
    let unit;


    switch (type) {

        case "w-kw":
            result = value / 1000;
            unit = "kW";
            break;

        case "kw-w":
            result = value * 1000;
            unit = "W";
            break;

        case "wh-kwh":
            result = value / 1000;
            unit = "kWh";
            break;

        case "kwh-wh":
            result = value * 1000;
            unit = "Wh";
            break;

        case "va-kva":
            result = value / 1000;
            unit = "kVA";
            break;

        case "kva-va":
            result = value * 1000;
            unit = "VA";
            break;

        case "v-kv":
            result = value / 1000;
            unit = "kV";
            break;

        case "kv-v":
            result = value * 1000;
            unit = "V";
            break;

        case "a-ma":
            result = value * 1000;
            unit = "mA";
            break;

        case "ma-a":
            result = value / 1000;
            unit = "A";
            break;

        case "ohm-kohm":
            result = value / 1000;
            unit = "kΩ";
            break;

        case "kohm-ohm":
            result = value * 1000;
            unit = "Ω";
            break;

        default:

            showMessage(
                "converter-message",
                "Invalid conversion type."
            );

            hideResult(
                "converter-result"
            );

            return;
    }


    const resultText =
        `${formatNumber(result)} ${unit}`;


    document.getElementById(
        "converter-result-value"
    ).textContent =
        resultText;


    showMessage(
        "converter-message",
        "Conversion completed successfully.",
        "success"
    );

    showResult(
        "converter-result"
    );


    saveHistory(
        "Unit Conversion",
        document.getElementById(
            "converter-type"
        ).selectedOptions[0].text,
        resultText
    );
}


document
    .getElementById("reset-converter")
    .addEventListener("click", () => {

        document.getElementById(
            "converter-value"
        ).value = "";

        clearMessage(
            "converter-message"
        );

        hideResult(
            "converter-result"
        );
    });


/* =========================================================
   DARK MODE
========================================================= */

const themeToggle =
    document.getElementById(
        "theme-toggle"
    );


function updateThemeButton() {

    if (
        document.body.classList.contains(
            "dark-mode"
        )
    ) {

        themeToggle.textContent =
            "☀️ Light Mode";

    } else {

        themeToggle.textContent =
            "🌙 Dark Mode";
    }
}


themeToggle.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark-mode"
        );


        const darkMode =
            document.body.classList.contains(
                "dark-mode"
            );


        localStorage.setItem(
            "calculatorDarkMode",
            darkMode
        );


        updateThemeButton();
    }
);


/* =========================================================
   LOAD SAVED SETTINGS
========================================================= */

const savedDarkMode =
    localStorage.getItem(
        "calculatorDarkMode"
    );


if (savedDarkMode === "true") {

    document.body.classList.add(
        "dark-mode"
    );
}


updateThemeButton();


/* =========================================================
   LOAD HISTORY
========================================================= */

displayHistory();
