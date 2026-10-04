/* =========================================================
   ELECTRICAL ENGINEERING CALCULATOR
   Final Calculation Logic
   ========================================================= */


/* =========================================================
   1. GENERAL HELPERS
   ========================================================= */

function getNumber(id) {
    const element = document.getElementById(id);

    if (!element) {
        return null;
    }

    const value = element.value.trim();

    if (value === "") {
        return null;
    }

    const number = Number(value);

    return Number.isFinite(number) ? number : null;
}


function formatNumber(number, decimals = 4) {
    if (!Number.isFinite(number)) {
        return "—";
    }

    return Number(number.toFixed(decimals)).toLocaleString(
        "en-US",
        {
            maximumFractionDigits: decimals
        }
    );
}


function showMessage(id, message, type = "error") {
    const element = document.getElementById(id);

    if (!element) {
        return;
    }

    element.textContent = message;
    element.className = `message ${type}`;
}


function clearMessage(id) {
    const element = document.getElementById(id);

    if (!element) {
        return;
    }

    element.textContent = "";
    element.className = "message";
}


function showResult(id) {
    const element = document.getElementById(id);

    if (element) {
        element.classList.remove("hidden");
    }
}


function hideResult(id) {
    const element = document.getElementById(id);

    if (element) {
        element.classList.add("hidden");
    }
}


function isNonNegative(value) {
    return value !== null && value >= 0;
}


function isPositive(value) {
    return value !== null && value > 0;
}


/* =========================================================
   2. CALCULATION HISTORY
   ========================================================= */

const HISTORY_KEY = "electricalCalculatorHistory";
const MAX_HISTORY = 20;


function getHistory() {
    try {
        const saved = localStorage.getItem(HISTORY_KEY);

        if (!saved) {
            return [];
        }

        const parsed = JSON.parse(saved);

        return Array.isArray(parsed) ? parsed : [];

    } catch (error) {
        console.warn(
            "Unable to read calculation history.",
            error
        );

        return [];
    }
}


function saveHistory(title, calculation, result) {
    const history = getHistory();

    history.unshift({
        title: title,
        calculation: calculation,
        result: result,
        date: new Date().toLocaleString()
    });

    if (history.length > MAX_HISTORY) {
        history.splice(MAX_HISTORY);
    }

    try {
        localStorage.setItem(
            HISTORY_KEY,
            JSON.stringify(history)
        );
    } catch (error) {
        console.warn(
            "Unable to save calculation history.",
            error
        );
    }

    displayHistory();
}


function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function displayHistory() {
    const list = document.getElementById("history-list");

    if (!list) {
        return;
    }

    const history = getHistory();

    if (history.length === 0) {

        list.innerHTML = `
            <div class="history-empty">
                No calculations yet.
            </div>
        `;

        return;
    }

    list.innerHTML = history.map(item => {

        return `
            <div class="history-item">
                <strong>
                    ${escapeHTML(item.title)}
                </strong>

                <span>
                    ${escapeHTML(item.calculation)}
                </span>

                <span>
                    Result: ${escapeHTML(item.result)}
                </span>

                <span>
                    ${escapeHTML(item.date)}
                </span>
            </div>
        `;

    }).join("");
}


const clearHistoryButton =
    document.getElementById("clear-history");


if (clearHistoryButton) {

    clearHistoryButton.addEventListener(
        "click",
        () => {

            localStorage.removeItem(HISTORY_KEY);

            displayHistory();
        }
    );
}


/* =========================================================
   3. OHM'S LAW
   V = I × R
   ========================================================= */

const calculateOhms =
    document.getElementById("calculate-ohms");


if (calculateOhms) {

    calculateOhms.addEventListener(
        "click",
        () => {

            clearMessage("ohms-message");
            hideResult("ohms-result");

            const voltage =
                getNumber("voltage");

            const current =
                getNumber("current");

            const resistance =
                getNumber("resistance");


            const knownValues = [
                voltage,
                current,
                resistance
            ].filter(
                value => value !== null
            ).length;


            if (knownValues !== 2) {

                showMessage(
                    "ohms-message",
                    "Enter exactly two known values.",
                    "error"
                );

                return;
            }


            if (
                voltage !== null &&
                voltage < 0
            ) {

                showMessage(
                    "ohms-message",
                    "Voltage cannot be negative.",
                    "error"
                );

                return;
            }


            if (
                current !== null &&
                current < 0
            ) {

                showMessage(
                    "ohms-message",
                    "Current cannot be negative.",
                    "error"
                );

                return;
            }


            if (
                resistance !== null &&
                resistance < 0
            ) {

                showMessage(
                    "ohms-message",
                    "Resistance cannot be negative.",
                    "error"
                );

                return;
            }


            let result;
            let resultText;
            let formula;


            /* Calculate Voltage */

            if (voltage === null) {

                result =
                    current * resistance;

                resultText =
                    `${formatNumber(result)} V`;

                formula =
                    `V = I × R = ${current} × ${resistance}`;
            }


            /* Calculate Current */

            else if (current === null) {

                if (resistance === 0) {

                    showMessage(
                        "ohms-message",
                        "Resistance cannot be zero when calculating current.",
                        "error"
                    );

                    return;
                }

                result =
                    voltage / resistance;

                resultText =
                    `${formatNumber(result)} A`;

                formula =
                    `I = V / R = ${voltage} / ${resistance}`;
            }


            /* Calculate Resistance */

            else {

                if (current === 0) {

                    showMessage(
                        "ohms-message",
                        "Current cannot be zero when calculating resistance.",
                        "error"
                    );

                    return;
                }

                result =
                    voltage / current;

                resultText =
                    `${formatNumber(result)} Ω`;

                formula =
                    `R = V / I = ${voltage} / ${current}`;
            }


            document.getElementById(
                "result-value"
            ).textContent = resultText;


            document.getElementById(
                "result-formula"
            ).textContent = formula;


            showResult("ohms-result");


            saveHistory(
                "Ohm's Law",
                formula,
                resultText
            );
        }
    );
}


const resetOhms =
    document.getElementById("reset-ohms");


if (resetOhms) {

    resetOhms.addEventListener(
        "click",
        () => {

            document.getElementById(
                "voltage"
            ).value = "";

            document.getElementById(
                "current"
            ).value = "";

            document.getElementById(
                "resistance"
            ).value = "";


            clearMessage("ohms-message");
            hideResult("ohms-result");
        }
    );
}


/* =========================================================
   4. ELECTRICAL POWER
   ========================================================= */

const powerMode =
    document.getElementById("power-mode");

const powerFactorGroup =
    document.getElementById(
        "power-factor-group"
    );


function updatePowerMode() {

    if (
        !powerMode ||
        !powerFactorGroup
    ) {
        return;
    }


    if (
        powerMode.value ===
        "single-phase"
    ) {

        powerFactorGroup.style.display =
            "flex";

    } else {

        powerFactorGroup.style.display =
            "none";
    }
}


if (powerMode) {

    powerMode.addEventListener(
        "change",
        updatePowerMode
    );
}


updatePowerMode();


const calculatePower =
    document.getElementById(
        "calculate-power"
    );


if (calculatePower) {

    calculatePower.addEventListener(
        "click",
        () => {

            clearMessage("power-message");
            hideResult("power-result");


            const mode =
                document.getElementById(
                    "power-mode"
                ).value;


            const voltage =
                getNumber("power-voltage");


            const current =
                getNumber("power-current");


            const pf =
                getNumber("power-pf");


            if (
                !isNonNegative(voltage) ||
                !isNonNegative(current)
            ) {

                showMessage(
                    "power-message",
                    "Enter valid voltage and current values.",
                    "error"
                );

                return;
            }


            let result;
            let resultText;
            let formula;


            /* DC / Basic Power */

            if (mode === "dc") {

                result =
                    voltage * current;

                resultText =
                    `${formatNumber(result)} W`;

                formula =
                    `P = V × I = ${voltage} × ${current}`;
            }


            /* Single-Phase AC */

            else if (
                mode === "single-phase"
            ) {

                if (
                    pf === null ||
                    pf < 0 ||
                    pf > 1
                ) {

                    showMessage(
                        "power-message",
                        "Power factor must be between 0 and 1.",
                        "error"
                    );

                    return;
                }


                result =
                    voltage *
                    current *
                    pf;


                resultText =
                    `${formatNumber(result)} W`;


                formula =
                    `P = V × I × PF = ${voltage} × ${current} × ${pf}`;
            }


            /* Apparent Power */

            else if (
                mode === "apparent"
            ) {

                result =
                    voltage * current;


                resultText =
                    `${formatNumber(result)} VA`;


                formula =
                    `S = V × I = ${voltage} × ${current}`;
            }


            else {

                showMessage(
                    "power-message",
                    "Invalid calculation type.",
                    "error"
                );

                return;
            }


            document.getElementById(
                "power-result-value"
            ).textContent =
                resultText;


            document.getElementById(
                "power-result-formula"
            ).textContent =
                formula;


            showResult("power-result");


            saveHistory(
                "Electrical Power",
                formula,
                resultText
            );
        }
    );
}


const resetPower =
    document.getElementById(
        "reset-power"
    );


if (resetPower) {

    resetPower.addEventListener(
        "click",
        () => {

            document.getElementById(
                "power-mode"
            ).value = "dc";


            document.getElementById(
                "power-voltage"
            ).value = "";


            document.getElementById(
                "power-current"
            ).value = "";


            document.getElementById(
                "power-pf"
            ).value = "";


            updatePowerMode();


            clearMessage(
                "power-message"
            );

            hideResult(
                "power-result"
            );
        }
    );
}


/* =========================================================
   5. ENERGY
   E = P × t
   ========================================================= */

const calculateEnergy =
    document.getElementById(
        "calculate-energy"
    );


if (calculateEnergy) {

    calculateEnergy.addEventListener(
        "click",
        () => {

            clearMessage(
                "energy-message"
            );

            hideResult(
                "energy-result"
            );


            const power =
                getNumber("energy-power");


            const time =
                getNumber("energy-time");


            const rate =
                getNumber("energy-rate");


            if (
                !isNonNegative(power) ||
                !isNonNegative(time)
            ) {

                showMessage(
                    "energy-message",
                    "Enter valid power and time values.",
                    "error"
                );

                return;
            }


            if (!isNonNegative(rate)) {

                showMessage(
                    "energy-message",
                    "Electricity rate cannot be negative.",
                    "error"
                );

                return;
            }


            const energy =
                power * time;


            const cost =
                energy * rate;


            const energyText =
                `${formatNumber(energy)} kWh`;


            const costText =
                `₱${formatNumber(cost, 2)}`;


            const formula =
                `E = P × t = ${power} × ${time}`;


            document.getElementById(
                "energy-result-value"
            ).textContent =
                energyText;


            document.getElementById(
                "energy-cost"
            ).textContent =
                costText;


            document.getElementById(
                "energy-result-formula"
            ).textContent =
                formula;


            showResult(
                "energy-result"
            );


            saveHistory(
                "Energy",
                formula,
                `${energyText} | Cost: ${costText}`
            );
        }
    );
}


const resetEnergy =
    document.getElementById(
        "reset-energy"
    );


if (resetEnergy) {

    resetEnergy.addEventListener(
        "click",
        () => {

            document.getElementById(
                "energy-power"
            ).value = "";


            document.getElementById(
                "energy-time"
            ).value = "";


            document.getElementById(
                "energy-rate"
            ).value = "10.659";


            clearMessage(
                "energy-message"
            );


            hideResult(
                "energy-result"
            );
        }
    );
}


/* =========================================================
   6. POWER FACTOR
   PF = P / S
   ========================================================= */

const calculatePF =
    document.getElementById(
        "calculate-pf"
    );


if (calculatePF) {

    calculatePF.addEventListener(
        "click",
        () => {

            clearMessage(
                "pf-message"
            );

            hideResult(
                "pf-result"
            );


            const realPower =
                getNumber(
                    "pf-real-power"
                );


            const apparentPower =
                getNumber(
                    "pf-apparent-power"
                );


            if (
                !isNonNegative(realPower) ||
                !isPositive(apparentPower)
            ) {

                showMessage(
                    "pf-message",
                    "Enter valid real and apparent power values. Apparent power must be greater than zero.",
                    "error"
                );

                return;
            }


            if (
                realPower >
                apparentPower
            ) {

                showMessage(
                    "pf-message",
                    "Real power cannot be greater than apparent power.",
                    "error"
                );

                return;
            }


            const pf =
                realPower /
                apparentPower;


            const resultText =
                formatNumber(pf, 4);


            const formula =
                `PF = P / S = ${realPower} / ${apparentPower}`;


            document.getElementById(
                "pf-result-value"
            ).textContent =
                resultText;


            document.getElementById(
                "pf-result-formula"
            ).textContent =
                formula;


            showResult(
                "pf-result"
            );


            saveHistory(
                "Power Factor",
                formula,
                resultText
            );
        }
    );
}


const resetPF =
    document.getElementById(
        "reset-pf"
    );


if (resetPF) {

    resetPF.addEventListener(
        "click",
        () => {

            document.getElementById(
                "pf-real-power"
            ).value = "";


            document.getElementById(
                "pf-apparent-power"
            ).value = "";


            clearMessage(
                "pf-message"
            );


            hideResult(
                "pf-result"
            );
        }
    );
}


/* =========================================================
   7. THREE-PHASE POWER
   P = √3 × VL × IL × PF
   ========================================================= */

const calculateThreePhase =
    document.getElementById(
        "calculate-three-phase"
    );


if (calculateThreePhase) {

    calculateThreePhase.addEventListener(
        "click",
        () => {

            clearMessage(
                "three-phase-message"
            );

            hideResult(
                "three-phase-result"
            );


            const voltage =
                getNumber(
                    "three-phase-voltage"
                );


            const current =
                getNumber(
                    "three-phase-current"
                );


            const pf =
                getNumber(
                    "three-phase-pf"
                );


            if (
                !isNonNegative(voltage) ||
                !isNonNegative(current)
            ) {

                showMessage(
                    "three-phase-message",
                    "Enter valid voltage and current values.",
                    "error"
                );

                return;
            }


            if (
                pf === null ||
                pf < 0 ||
                pf > 1
            ) {

                showMessage(
                    "three-phase-message",
                    "Power factor must be between 0 and 1.",
                    "error"
                );

                return;
            }


            const power =
                Math.sqrt(3) *
                voltage *
                current *
                pf;


            const powerKW =
                power / 1000;


            const resultText =
                `${formatNumber(powerKW)} kW`;


            const formula =
                "P = √3 × VL × IL × PF";


            document.getElementById(
                "three-phase-result-value"
            ).textContent =
                resultText;


            document.getElementById(
                "three-phase-result-formula"
            ).textContent =
                `${formula} = ${formatNumber(power)} W`;


            showResult(
                "three-phase-result"
            );


            saveHistory(
                "Three-Phase Power",
                formula,
                resultText
            );
        }
    );
}


const resetThreePhase =
    document.getElementById(
        "reset-three-phase"
    );


if (resetThreePhase) {

    resetThreePhase.addEventListener(
        "click",
        () => {

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
        }
    );
}


/* =========================================================
   8. TRANSFORMER
   V1 / V2 = N1 / N2
   I1 / I2 = N2 / N1
   ========================================================= */

const calculateTransformer =
    document.getElementById(
        "calculate-transformer"
    );


if (calculateTransformer) {

    calculateTransformer.addEventListener(
        "click",
        () => {

            clearMessage(
                "transformer-message"
            );

            hideResult(
                "transformer-result"
            );


            const v1 =
                getNumber(
                    "transformer-v1"
                );


            const n1 =
                getNumber(
                    "transformer-n1"
                );


            const n2 =
                getNumber(
                    "transformer-n2"
                );


            const i1 =
                getNumber(
                    "transformer-primary-current"
                );


            if (
                !isNonNegative(v1) ||
                !isPositive(n1) ||
                !isPositive(n2)
            ) {

                showMessage(
                    "transformer-message",
                    "Enter valid voltage and turns values. Number of turns must be greater than zero.",
                    "error"
                );

                return;
            }


            if (
                i1 !== null &&
                !isNonNegative(i1)
            ) {

                showMessage(
                    "transformer-message",
                    "Primary current cannot be negative.",
                    "error"
                );

                return;
            }


            const v2 =
                v1 *
                (n2 / n1);


            document.getElementById(
                "transformer-voltage-result"
            ).textContent =
                `${formatNumber(v2)} V`;


            let currentText =
                "Not calculated";


            if (i1 !== null) {

                const i2 =
                    i1 *
                    (n1 / n2);


                currentText =
                    `${formatNumber(i2)} A`;
            }


            document.getElementById(
                "transformer-current-result"
            ).textContent =
                currentText;


            const formula =
                `V2 = V1 × (N2 / N1) = ${v1} × (${n2} / ${n1})`;


            document.getElementById(
                "transformer-result-formula"
            ).textContent =
                formula;


            showResult(
                "transformer-result"
            );


            saveHistory(
                "Transformer",
                formula,
                `Secondary Voltage: ${formatNumber(v2)} V`
            );
        }
    );
}


const resetTransformer =
    document.getElementById(
        "reset-transformer"
    );


if (resetTransformer) {

    resetTransformer.addEventListener(
        "click",
        () => {

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
        }
    );
}


/* =========================================================
   9. VOLTAGE DROP
   VD = I × R
   ========================================================= */

const calculateVoltageDrop =
    document.getElementById(
        "calculate-voltage-drop"
    );


if (calculateVoltageDrop) {

    calculateVoltageDrop.addEventListener(
        "click",
        () => {

            clearMessage(
                "voltage-drop-message"
            );

            hideResult(
                "voltage-drop-result"
            );


            const current =
                getNumber(
                    "voltage-drop-current"
                );


            const resistance =
                getNumber(
                    "voltage-drop-resistance"
                );


            const systemVoltage =
                getNumber(
                    "voltage-drop-system-voltage"
                );


            if (
                !isNonNegative(current) ||
                !isNonNegative(resistance)
            ) {

                showMessage(
                    "voltage-drop-message",
                    "Enter valid current and resistance values.",
                    "error"
                );

                return;
            }


            if (
                systemVoltage !== null &&
                !isPositive(systemVoltage)
            ) {

                showMessage(
                    "voltage-drop-message",
                    "System voltage must be greater than zero.",
                    "error"
                );

                return;
            }


            const voltageDrop =
                current *
                resistance;


            const resultText =
                `${formatNumber(voltageDrop)} V`;


            let percentageText =
                "Not calculated";


            if (
                systemVoltage !== null
            ) {

                const percentage =
                    (
                        voltageDrop /
                        systemVoltage
                    ) * 100;


                percentageText =
                    `${formatNumber(percentage, 2)} %`;
            }


            const formula =
                `VD = I × R = ${current} × ${resistance}`;


            document.getElementById(
                "voltage-drop-result-value"
            ).textContent =
                resultText;


            document.getElementById(
                "voltage-drop-percentage"
            ).textContent =
                percentageText;


            document.getElementById(
                "voltage-drop-result-formula"
            ).textContent =
                formula;


            showResult(
                "voltage-drop-result"
            );


            saveHistory(
                "Voltage Drop",
                formula,
                resultText
            );
        }
    );
}


const resetVoltageDrop =
    document.getElementById(
        "reset-voltage-drop"
    );


if (resetVoltageDrop) {

    resetVoltageDrop.addEventListener(
        "click",
        () => {

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
        }
    );
}


/* =========================================================
   10. UNIT CONVERTER
   ========================================================= */

const calculateConversion =
    document.getElementById(
        "calculate-conversion"
    );


if (calculateConversion) {

    calculateConversion.addEventListener(
        "click",
        () => {

            clearMessage(
                "converter-message"
            );

            hideResult(
                "converter-result"
            );


            const type =
                document.getElementById(
                    "converter-type"
                ).value;


            const value =
                getNumber(
                    "converter-value"
                );


            if (value === null) {

                showMessage(
                    "converter-message",
                    "Enter a valid value.",
                    "error"
                );

                return;
            }


            let result;
            let unit;


            switch (type) {

                case "w-kw":

                    result =
                        value / 1000;

                    unit =
                        "kW";

                    break;


                case "kw-w":

                    result =
                        value * 1000;

                    unit =
                        "W";

                    break;


                case "wh-kwh":

                    result =
                        value / 1000;

                    unit =
                        "kWh";

                    break;


                case "kwh-wh":

                    result =
                        value * 1000;

                    unit =
                        "Wh";

                    break;


                case "va-kva":

                    result =
                        value / 1000;

                    unit =
                        "kVA";

                    break;


                case "kva-va":

                    result =
                        value * 1000;

                    unit =
                        "VA";

                    break;


                case "v-kv":

                    result =
                        value / 1000;

                    unit =
                        "kV";

                    break;


                case "kv-v":

                    result =
                        value * 1000;

                    unit =
                        "V";

                    break;


                case "a-ma":

                    result =
                        value * 1000;

                    unit =
                        "mA";

                    break;


                case "ma-a":

                    result =
                        value / 1000;

                    unit =
                        "A";

                    break;


                case "ohm-kohm":

                    result =
                        value / 1000;

                    unit =
                        "kΩ";

                    break;


                case "kohm-ohm":

                    result =
                        value * 1000;

                    unit =
                        "Ω";

                    break;


                default:

                    showMessage(
                        "converter-message",
                        "Invalid conversion type.",
                        "error"
                    );

                    return;
            }


            if (!Number.isFinite(result)) {

                showMessage(
                    "converter-message",
                    "The calculation produced an invalid result.",
                    "error"
                );

                return;
            }


            const resultText =
                `${formatNumber(result)} ${unit}`;


            document.getElementById(
                "converter-result-value"
            ).textContent =
                resultText;


            showResult(
                "converter-result"
            );


            saveHistory(
                "Unit Conversion",
                `${value} → ${unit}`,
                resultText
            );
        }
    );
}


const resetConverter =
    document.getElementById(
        "reset-converter"
    );


if (resetConverter) {

    resetConverter.addEventListener(
        "click",
        () => {

            document.getElementById(
                "converter-type"
            ).value =
                "w-kw";


            document.getElementById(
                "converter-value"
            ).value = "";


            clearMessage(
                "converter-message"
            );


            hideResult(
                "converter-result"
            );
        }
    );
}


/* =========================================================
   11. DARK MODE
   ========================================================= */

const themeToggle =
    document.getElementById(
        "theme-toggle"
    );


const DARK_MODE_KEY =
    "calculatorDarkMode";


function updateThemeIcon() {

    if (!themeToggle) {
        return;
    }


    const darkMode =
        document.body.classList.contains(
            "dark-mode"
        );


    themeToggle.setAttribute(
        "aria-label",
        darkMode
            ? "Switch to light mode"
            : "Switch to dark mode"
    );


    themeToggle.setAttribute(
        "title",
        darkMode
            ? "Switch to light mode"
            : "Switch to dark mode"
    );
}


function setDarkMode(enabled) {

    document.body.classList.toggle(
        "dark-mode",
        enabled
    );


    try {

        localStorage.setItem(
            DARK_MODE_KEY,
            enabled
                ? "true"
                : "false"
        );

    } catch (error) {

        console.warn(
            "Unable to save theme preference.",
            error
        );
    }


    updateThemeIcon();
}


if (themeToggle) {

    themeToggle.addEventListener(
        "click",
        () => {

            const enabled =
                !document.body.classList.contains(
                    "dark-mode"
                );


            setDarkMode(enabled);
        }
    );
}


try {

    const savedTheme =
        localStorage.getItem(
            DARK_MODE_KEY
        );


    if (
        savedTheme === "true"
    ) {

        setDarkMode(true);

    } else {

        updateThemeIcon();
    }

} catch (error) {

    updateThemeIcon();
}


/* =========================================================
   12. STARTUP
   ========================================================= */

displayHistory();
updatePowerMode();
updateThemeIcon();
