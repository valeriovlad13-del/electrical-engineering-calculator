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


function formatNumber(number, decimals = 3) {
    if (!Number.isFinite(number)) {
        return "—";
    }

    // Keep every displayed numeric result to at most three decimal places.
    decimals = Math.min(3, Math.max(0, Number.isFinite(decimals) ? Math.floor(decimals) : 3));

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


const HISTORY_KEY = "electricalCalculatorHistory";
const MAX_HISTORY = 20;
function getHistory() {
    try { const saved = localStorage.getItem(HISTORY_KEY); if (!saved) return []; const parsed = JSON.parse(saved); return Array.isArray(parsed) ? parsed : []; }
    catch (error) { console.warn("Unable to read calculation history.", error); return []; }
}
function captureInputs(ids) {
    return Object.fromEntries(ids.map(id => { const element = document.getElementById(id); return [id, element ? element.value : ""]; }));
}
function saveHistory(title, calculation, result, inputs = {}) {
    const history = getHistory();
    history.unshift({ id: (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + "-" + Math.random().toString(36).slice(2), title, calculation, result, inputs, date: new Date().toLocaleString() });
    if (history.length > MAX_HISTORY) history.splice(MAX_HISTORY);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); }
    catch (error) { console.warn("Unable to save calculation history.", error); }
    displayHistory();
}
function escapeHTML(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function displayHistory() {
    const list = document.getElementById("history-list");
    if (!list) return;
    const history = getHistory();
    if (!history.length) { list.innerHTML = '<div class="history-empty">No calculations yet.</div>'; return; }
    list.innerHTML = history.map((item, index) => {
        const canRestore = item.inputs && Object.keys(item.inputs).length > 0;
        return `<article class="history-item">
            <strong>${escapeHTML(item.title)}</strong>
            <span>${escapeHTML(item.calculation)}</span>
            <span>Result: ${escapeHTML(item.result)}</span>
            <span class="history-date">${escapeHTML(item.date || "")}</span>
            <div class="history-item-actions">${canRestore ? `<button type="button" class="btn btn-secondary btn-small" data-history-restore="${index}">Restore</button>` : ""}
            <button type="button" class="btn btn-secondary btn-small" data-history-delete="${index}" aria-label="Delete ${escapeHTML(item.title)} history item">Delete</button></div>
        </article>`;
    }).join("");
}
const historyList = document.getElementById("history-list");
if (historyList) historyList.addEventListener("click", event => {
    const restoreButton = event.target.closest("[data-history-restore]");
    const deleteButton = event.target.closest("[data-history-delete]");
    if (!restoreButton && !deleteButton) return;
    const index = Number((restoreButton || deleteButton).dataset[restoreButton ? "historyRestore" : "historyDelete"]);
    const history = getHistory(), item = history[index];
    if (!item) return;
    if (deleteButton) {
        history.splice(index, 1);
        try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch (error) { console.warn("Unable to update calculation history.", error); }
        displayHistory(); return;
    }
    if (restoreButton && item.inputs) {
        if (item.title === "Series & Parallel Circuits") {
            const resistorCount = Object.keys(item.inputs).filter(id => /^network-r\d+$/.test(id)).length;
            if (typeof window.setNetworkResistorCount === "function" && resistorCount >= 2) window.setNetworkResistorCount(resistorCount);
        }
        Object.entries(item.inputs).forEach(([id, value]) => { const input = document.getElementById(id); if (input) input.value = value; });
        const destinations = {
            "Ohm's Law": ["ohms-law", "calculate-ohms"], "Electrical Power": ["electrical-power", "calculate-power"],
            "Energy": ["energy", "calculate-energy"], "Power Triangle": ["power-triangle", "calculate-triangle"],
            "Three-Phase Power": ["three-phase", "calculate-three-phase"], "Transformer": ["transformer", "calculate-transformer"],
            "Voltage Drop": ["voltage-drop", "calculate-voltage-drop"], "Unit Conversion": ["unit-converter", "calculate-conversion"],
            "AC Impedance": ["ac-impedance", "calculate-ac-impedance"],
            "Series & Parallel Circuits": ["resistor-network", "calculate-resistor-network"],
        };
        const destination = destinations[item.title];
        if (!destination) return;
        document.getElementById(destination[0])?.scrollIntoView({ behavior: "smooth", block: "start" });
        document.getElementById(destination[1])?.focus();
    }
});
const clearHistoryButton = document.getElementById("clear-history");
if (clearHistoryButton) clearHistoryButton.addEventListener("click", () => {
    if (!getHistory().length) return;
    if (!confirm("Clear all saved calculation history? This cannot be undone.")) return;
    localStorage.removeItem(HISTORY_KEY); displayHistory();
});

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

                result = EngineeringCore.ohmsLaw({ voltage: null, current, resistance }).voltage;

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

                result = EngineeringCore.ohmsLaw({ voltage, current: null, resistance }).current;

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

                result = EngineeringCore.ohmsLaw({ voltage, current, resistance: null }).resistance;

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


            saveHistory("Ohm's Law", formula, resultText, captureInputs(["voltage", "current", "resistance"]));
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
                    EngineeringCore.electricalPower("dc", voltage, current);

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
                    EngineeringCore.electricalPower("single-phase", voltage, current, pf);


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
                    EngineeringCore.electricalPower("apparent", voltage, current);


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


            saveHistory("Electrical Power", formula, resultText, captureInputs(["power-mode", "power-voltage", "power-current", "power-pf"]));
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


            const energyCalculation = EngineeringCore.energyCost(power, time, rate);
            const energy = energyCalculation.energyKWh;
            const cost = energyCalculation.cost;


            const energyText =
                `${formatNumber(energy)} kWh`;


            const costText =
                `₱${formatNumber(cost, 3)}`;


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


            saveHistory("Energy", formula, `${energyText} | Cost: ${costText}`, captureInputs(["energy-power", "energy-time", "energy-rate"]));
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
   POWER TRIANGLE
   ========================================================= */
const triangleInput1=document.getElementById("triangle-input-1");
const triangleInput2=document.getElementById("triangle-input-2");
const triangleValue1=document.getElementById("triangle-value-1");
const triangleValue2=document.getElementById("triangle-value-2");
const triangleUnit1=document.getElementById("triangle-unit-1");
const triangleUnit2=document.getElementById("triangle-unit-2");

const triangleMeta={
 P:{unit:"W",placeholder:"e.g. 1840",min:"0"},
 Q:{unit:"VAR",placeholder:"e.g. 1380",min:"0"},
 S:{unit:"VA",placeholder:"e.g. 2300",min:"0"},
 PF:{unit:"0–1",placeholder:"e.g. 0.8",min:"0",max:"1"},
 Theta:{unit:"°",placeholder:"e.g. 36.87",min:"0",max:"90"}
};

function updateTriangleInput(select,input,unit){
 if(!select||!input||!unit)return;
 const meta=triangleMeta[select.value];
 unit.textContent="("+meta.unit+")";
 input.placeholder=meta.placeholder;
 input.min=meta.min;
 if(meta.max===undefined) input.removeAttribute("max"); else input.max=meta.max;
}
function updateTriangleInputs(){
 updateTriangleInput(triangleInput1,triangleValue1,triangleUnit1);
 updateTriangleInput(triangleInput2,triangleValue2,triangleUnit2);
}
function setTriangle(id,attrs){
 const el=document.getElementById(id); if(!el)return;
 Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,String(v)));
}
function renderPowerTriangle(P,Q,theta){
 const bx=25,by=325,maxW=470,maxH=295,m=Math.max(P,Q,1),scale=Math.min(maxW/m,maxH/m);
 const w=P*scale,h=Q*scale,tx=bx+w,ty=by-h,mx=bx+w/2;
 setTriangle("triangle-p-line",{x1:bx,y1:by,x2:tx,y2:by});
 setTriangle("triangle-q-line",{x1:tx,y1:by,x2:tx,y2:ty});
 setTriangle("triangle-s-line",{x1:bx,y1:by,x2:tx,y2:ty});
 const r=Math.max(16,Math.min(34,Math.min(Math.max(w,16),Math.max(h,16))*.3)),rad=theta*Math.PI/180;
 setTriangle("triangle-angle-arc",{d:`M ${bx+r} ${by} A ${r} ${r} 0 0 0 ${bx+r*Math.cos(rad)} ${by-r*Math.sin(rad)}`});
 setTriangle("triangle-right-angle",{d:`M ${tx-12} ${by} L ${tx-12} ${by-12} L ${tx} ${by-12}`});
 setTriangle("triangle-p-label",{x:mx,y:by+30});
 setTriangle("triangle-q-label",{x:tx+50,y:Math.max(ty+h/2,85)});
 const sx=bx+w*.55,sy=by-h*.55-10;
 setTriangle("triangle-s-label",{x:sx,y:sy,transform:"rotate("+(-theta)+" "+sx+" "+sy+")"});
 setTriangle("triangle-angle-label",{x:bx+r*1.65,y:by-r*.28});
 setTriangle("triangle-p-value",{x:mx,y:by+30});
 setTriangle("triangle-q-value",{x:tx+50,y:Math.max(ty+h/2,85)});
 setTriangle("triangle-s-value",{x:sx,y:sy,transform:"rotate("+(-theta)+" "+sx+" "+sy+")"});
 setTriangle("triangle-theta-value",{x:bx+r*1.65,y:by-r*.28});
 const d=document.getElementById("power-triangle-svg-desc");
 if(d)d.textContent=`Power triangle showing ${formatNumber(P,3)} W real power, ${formatNumber(Q,3)} VAR reactive power, and a phase angle of ${formatNumber(theta,3)} degrees.`;
}
function calculatePowerTriangleValues(t1,v1,t2,v2){
 if(t1===t2)throw new Error("Select two different quantities.");
 const v={P:null,Q:null,S:null,PF:null,Theta:null};v[t1]=v1;v[t2]=v2;
 if(v.P!==null&&v.P<0)throw new Error("Real power cannot be negative.");
 if(v.Q!==null&&v.Q<0)throw new Error("Reactive power cannot be negative.");
 if(v.S!==null&&v.S<=0)throw new Error("Apparent power must be greater than zero.");
 if(v.PF!==null&&(v.PF<=0||v.PF>1))throw new Error("Power factor must be greater than 0 and no greater than 1.");
 if(v.Theta!==null&&(v.Theta<0||v.Theta>=90))throw new Error("Phase angle must be at least 0° and less than 90°.");
 const hasP=v.P!==null,hasQ=v.Q!==null,hasS=v.S!==null,hasPF=v.PF!==null,hasTheta=v.Theta!==null,radTheta=hasTheta?v.Theta*Math.PI/180:null;
 if(hasP&&hasQ){v.S=Math.hypot(v.P,v.Q);v.PF=v.S===0?1:v.P/v.S}
 else if(hasP&&hasS){if(v.P>v.S)throw new Error("Real power cannot be greater than apparent power.");v.Q=Math.sqrt(Math.max(0,v.S*v.S-v.P*v.P));v.PF=v.P/v.S}
 else if(hasQ&&hasS){if(v.Q>v.S)throw new Error("Reactive power cannot be greater than apparent power.");v.P=Math.sqrt(Math.max(0,v.S*v.S-v.Q*v.Q));v.PF=v.P/v.S}
 else if(hasP&&hasPF){if(v.P<=0)throw new Error("Real power must be greater than zero when power factor is provided.");v.S=v.P/v.PF;v.Q=Math.sqrt(Math.max(0,v.S*v.S-v.P*v.P))}
 else if(hasS&&hasPF){v.P=v.S*v.PF;v.Q=v.S*Math.sqrt(Math.max(0,1-v.PF*v.PF))}
 else if(hasQ&&hasPF){if(v.Q<=0)throw new Error("Reactive power must be greater than zero when power factor is provided.");if(v.PF>=1)throw new Error("A power factor of 1 requires reactive power to be zero.");v.S=v.Q/Math.sqrt(1-v.PF*v.PF);v.P=v.S*v.PF}
 else if(hasP&&hasTheta){if(v.P<=0)throw new Error("Real power must be greater than zero when phase angle is provided.");v.S=v.P/Math.cos(radTheta);v.Q=v.P*Math.tan(radTheta);v.PF=Math.cos(radTheta)}
 else if(hasQ&&hasTheta){if(v.Q<=0)throw new Error("Reactive power must be greater than zero when phase angle is provided.");if(v.Theta<=0)throw new Error("A zero phase angle requires reactive power to be zero.");v.P=v.Q/Math.tan(radTheta);v.S=v.Q/Math.sin(radTheta);v.PF=Math.cos(radTheta)}
 else if(hasS&&hasTheta){v.P=v.S*Math.cos(radTheta);v.Q=v.S*Math.sin(radTheta);v.PF=Math.cos(radTheta)}
 else throw new Error("Select a valid pair. Phase angle can be used with real, reactive, or apparent power.");
 if(![v.P,v.Q,v.S,v.PF].every(Number.isFinite))throw new Error("The selected values produced an invalid result.");
 v.PF=Math.min(1,Math.max(0,v.PF));v.theta=hasTheta?v.Theta:Math.acos(v.PF)*180/Math.PI;return v;
}
const calculateTriangle=document.getElementById("calculate-triangle");
if(triangleInput1)triangleInput1.addEventListener("change",updateTriangleInputs);
if(triangleInput2)triangleInput2.addEventListener("change",updateTriangleInputs);
updateTriangleInputs();
if(calculateTriangle)calculateTriangle.addEventListener("click",()=>{
 clearMessage("triangle-message");hideResult("triangle-result");
 const t1=triangleInput1.value,t2=triangleInput2.value,v1=getNumber("triangle-value-1"),v2=getNumber("triangle-value-2");
 if(v1===null||v2===null){showMessage("triangle-message","Enter values for both selected quantities.","error");return}
 try{
  const v=calculatePowerTriangleValues(t1,v1,t2,v2);
  document.getElementById("triangle-result-p").textContent=`${formatNumber(v.P)} W`;
  document.getElementById("triangle-result-q").textContent=`${formatNumber(v.Q)} VAR`;
  document.getElementById("triangle-result-s").textContent=`${formatNumber(v.S)} VA`;
  document.getElementById("triangle-result-pf").textContent=formatNumber(v.PF,3);
  document.getElementById("triangle-result-theta").textContent=`${formatNumber(v.theta, 3)}°`;
  // Keep the top diagram as a labeled reference only; numerical results stay in the results section.
  document.getElementById("triangle-p-label").textContent="P";
  document.getElementById("triangle-q-label").textContent="Q";
  document.getElementById("triangle-s-label").textContent="S";
  document.getElementById("triangle-angle-label").textContent="θ";
  document.getElementById("triangle-result-formula").textContent="S² = P² + Q² | PF = P / S | θ = cos⁻¹(PF)";
  showResult("triangle-result");
  saveHistory("Power Triangle",`${t1} = ${v1} | ${t2} = ${v2}`,`P = ${formatNumber(v.P)} W | Q = ${formatNumber(v.Q)} VAR | S = ${formatNumber(v.S)} VA | PF = ${formatNumber(v.PF, 3)} | θ = ${formatNumber(v.theta, 3)}°`,captureInputs(["triangle-input-1","triangle-value-1","triangle-input-2","triangle-value-2"]));
 }catch(error){showMessage("triangle-message",error.message,"error")}
});
const resetTriangle=document.getElementById("reset-triangle");
if(resetTriangle)resetTriangle.addEventListener("click",()=>{
 triangleInput1.value="PF";triangleInput2.value="P";triangleValue1.value="";triangleValue2.value="";
 updateTriangleInputs();clearMessage("triangle-message");hideResult("triangle-result");
});
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


            const powerCalculation = EngineeringCore.threePhaseRealPower(voltage, current, pf);
            const power = powerCalculation.watts;
            const powerKW = powerCalculation.kilowatts;


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


            saveHistory("Three-Phase Power", formula, resultText, captureInputs(["three-phase-voltage", "three-phase-current", "three-phase-pf"]));
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


            const transformerCalculation = EngineeringCore.idealTransformer(v1, n1, n2, i1);
            const v2 = transformerCalculation.secondaryVoltage;


            document.getElementById(
                "transformer-voltage-result"
            ).textContent =
                `${formatNumber(v2)} V`;


            let currentText =
                "Not calculated";


            if (i1 !== null) {

                const i2 = transformerCalculation.secondaryCurrent;


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


            saveHistory("Transformer", formula, `Secondary Voltage: ${formatNumber(v2)} V`, captureInputs(["transformer-v1", "transformer-n1", "transformer-n2", "transformer-primary-current"]));
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


            const dropCalculation = EngineeringCore.voltageDrop(current, resistance, systemVoltage !== null ? systemVoltage : null);
            const voltageDrop = dropCalculation.volts;


            const resultText =
                `${formatNumber(voltageDrop)} V`;


            let percentageText =
                "Not calculated";


            if (
                systemVoltage !== null
            ) {

                const percentage = dropCalculation.percentage;


                percentageText =
                    `${formatNumber(percentage, 3)} %`;
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


            saveHistory("Voltage Drop", formula, resultText, captureInputs(["voltage-drop-current", "voltage-drop-resistance", "voltage-drop-system-voltage"]));
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


            saveHistory("Unit Conversion", `${value} → ${unit}`, resultText, captureInputs(["converter-type", "converter-value"]));
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


const themeToggle =
    document.getElementById(
        "theme-toggle"
    );


const themeIcon =
    document.querySelector(
        "#theme-toggle .theme-icon"
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


    if (themeIcon) {

        themeIcon.innerHTML = darkMode
            ? `
                <circle
                    cx="12"
                    cy="12"
                    r="4"
                ></circle>

                <path
                    d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41
                    M17.66 17.66l1.41 1.41M2 12h2M20 12h2
                    M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                ></path>
            `
            : `
                <path
                    d="M21 12.79A9 9 0 1 1 11.21 3
                    7 7 0 0 0 21 12.79z"
                ></path>
            `;
    }
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


displayHistory();
updatePowerMode();
updateThemeIcon();

/* AC impedance: series RLC model */
const calculateAcImpedance = document.getElementById("calculate-ac-impedance");
if (calculateAcImpedance) {
    calculateAcImpedance.addEventListener("click", () => {
        clearMessage("ac-impedance-message");
        hideResult("ac-impedance-result");
        const resistance = getNumber("ac-resistance");
        const inductance = getNumber("ac-inductance");
        const capacitance = getNumber("ac-capacitance");
        const frequency = getNumber("ac-frequency");
        if (resistance === null || inductance === null || capacitance === null || frequency === null) {
            showMessage("ac-impedance-message", "Enter resistance, inductance, capacitance, and frequency. Use 0 to exclude L or C.", "error");
            return;
        }
        try {
            const result = EngineeringCore.acImpedance(resistance, inductance, capacitance, frequency);
            document.getElementById("ac-xl-result").textContent = formatNumber(result.inductiveReactance) + " Ω";
            document.getElementById("ac-xc-result").textContent = capacitance === 0 ? "Excluded" : formatNumber(result.capacitiveReactance) + " Ω";
            document.getElementById("ac-x-result").textContent = formatNumber(result.netReactance) + " Ω";
            document.getElementById("ac-z-result").textContent = formatNumber(result.impedanceMagnitude) + " Ω";
            document.getElementById("ac-theta-result").textContent = formatNumber(result.phaseAngleDegrees) + "°";
            document.getElementById("ac-impedance-formula").textContent =
                "X = XL − XC = " + formatNumber(result.inductiveReactance) + " − " +
                (capacitance === 0 ? "0" : formatNumber(result.capacitiveReactance)) +
                " = " + formatNumber(result.netReactance) + " Ω; Z = " +
                formatNumber(result.impedanceMagnitude) + " Ω";
            showResult("ac-impedance-result");
            saveHistory("AC Impedance", "Z = √(R² + (XL − XC)²)", "Z = " + formatNumber(result.impedanceMagnitude) + " Ω | θ = " + formatNumber(result.phaseAngleDegrees) + "°",
                captureInputs(["ac-resistance", "ac-inductance", "ac-capacitance", "ac-frequency"]));
        } catch (error) {
            showMessage("ac-impedance-message", error.message || "Check the entered values.", "error");
        }
    });
}
const resetAcImpedance = document.getElementById("reset-ac-impedance");
if (resetAcImpedance) resetAcImpedance.addEventListener("click", () => {
    ["ac-resistance", "ac-inductance", "ac-capacitance", "ac-frequency"].forEach(id => { document.getElementById(id).value = ""; });
    clearMessage("ac-impedance-message");
    hideResult("ac-impedance-result");
});

/* Series and parallel resistor network calculator */
const networkList = document.getElementById("network-resistor-list");
const networkAddButton = document.getElementById("network-add-resistor");
const networkRemoveButton = document.getElementById("network-remove-resistor");
const networkCountLabel = document.getElementById("network-resistor-count");
function setNetworkResistorCount(count, values = null) {
    if (!networkList) return;
    count = Math.max(2, Math.min(30, Math.floor(Number(count) || 2)));
    const previous = Array.from(networkList.querySelectorAll(".network-resistance-input")).map(input => input.value);
    const selectedValues = values || previous;
    networkList.innerHTML = "";
    for (let i = 0; i < count; i++) {
        const group = document.createElement("div");
        group.className = "input-group network-resistor-input";
        const label = document.createElement("label");
        label.htmlFor = "network-r" + (i + 1);
        label.textContent = "Resistor R" + (i + 1) + " (Ω)";
        const input = document.createElement("input");
        input.type = "number"; input.id = label.htmlFor; input.className = "network-resistance-input";
        input.min = "0"; input.step = "any"; input.inputMode = "decimal";
        input.placeholder = "e.g. " + (10 * (i + 1));
        input.value = selectedValues[i] ?? "";
        group.append(label, input);
        networkList.appendChild(group);
    }
    if (networkCountLabel) networkCountLabel.textContent = count + " resistors · minimum 2 · maximum 30";
    if (networkAddButton) networkAddButton.disabled = count >= 30;
    if (networkRemoveButton) networkRemoveButton.disabled = count <= 2;
}
window.setNetworkResistorCount = setNetworkResistorCount;
if (networkAddButton) networkAddButton.addEventListener("click", () => {
    const inputs = Array.from(networkList.querySelectorAll(".network-resistance-input"));
    if (inputs.length >= 30) return;
    const values = inputs.map(input => input.value);
    values.push("");
    setNetworkResistorCount(values.length, values);
});
if (networkRemoveButton) networkRemoveButton.addEventListener("click", () => {
    const inputs = Array.from(networkList.querySelectorAll(".network-resistance-input"));
    if (inputs.length <= 2) return;
    const values = inputs.slice(0, -1).map(input => input.value);
    setNetworkResistorCount(values.length, values);
});
const calculateResistorNetwork = document.getElementById("calculate-resistor-network");
if (calculateResistorNetwork) {
    calculateResistorNetwork.addEventListener("click", () => {
        clearMessage("network-message");
        hideResult("resistor-network-result");
        const type = document.getElementById("network-type").value;
        const resistorInputs = Array.from(document.querySelectorAll("#network-resistor-list .network-resistance-input"));
        const resistances = resistorInputs.map(input => input.value.trim() === "" ? null : Number(input.value));
        const voltage = getNumber("network-voltage");
        if (resistances.length < 2) { showMessage("network-message", "Add at least two resistors.", "error"); return; }
        if (resistances.some(value => value === null || !Number.isFinite(value))) { showMessage("network-message", "Enter a valid resistance for every resistor.", "error"); return; }
        if (resistances.some(value => value <= 0)) { showMessage("network-message", "Each resistor must be greater than zero.", "error"); return; }
        if (voltage !== null && voltage < 0) { showMessage("network-message", "Supply voltage cannot be negative.", "error"); return; }
        try {
            const result = EngineeringCore.resistorNetwork(type, resistances, voltage);
            document.getElementById("network-equivalent-result").textContent = formatNumber(result.equivalentResistance) + " Ω";
            document.getElementById("network-total-current-result").textContent = result.totalCurrent === null ? "Enter supply voltage" : formatNumber(result.totalCurrent) + " A";
            document.getElementById("network-branch-results").innerHTML = result.branches.map((branch, index) =>
                '<div class="network-branch-row"><strong>R' + (index + 1) + ' · ' + formatNumber(branch.resistance) + ' Ω</strong>' +
                '<span>' + (branch.voltage === null ? "Voltage: —" : "Voltage: " + formatNumber(branch.voltage) + " V") + '</span>' +
                '<span>' + (branch.current === null ? "Current: —" : "Current: " + formatNumber(branch.current) + " A") + '</span></div>'
            ).join("");
            document.getElementById("network-result-formula").textContent = type === "series"
                ? "RT = " + resistances.map((value, index) => "R" + (index + 1)).join(" + ") + " = " + resistances.map(formatNumber).join(" + ") + " = " + formatNumber(result.equivalentResistance) + " Ω"
                : "1 / RT = " + resistances.map((value, index) => "1 / R" + (index + 1)).join(" + ") + "; RT = " + formatNumber(result.equivalentResistance) + " Ω";
            showResult("resistor-network-result");
            const inputIds = ["network-type", ...resistorInputs.map(input => input.id), "network-voltage"];
            saveHistory("Series & Parallel Circuits", type + " network: " + resistances.map((value, i) => "R" + (i + 1) + "=" + formatNumber(value) + " Ω").join(", "),
                "RT = " + formatNumber(result.equivalentResistance) + " Ω" + (result.totalCurrent === null ? "" : " | I = " + formatNumber(result.totalCurrent) + " A"),
                captureInputs(inputIds));
        } catch (error) { showMessage("network-message", error.message || "Check the entered values.", "error"); }
    });
}
const resetResistorNetwork = document.getElementById("reset-resistor-network");
if (resetResistorNetwork) resetResistorNetwork.addEventListener("click", () => {
    document.getElementById("network-type").value = "series";
    setNetworkResistorCount(2, ["", ""]);
    document.getElementById("network-voltage").value = "";
    clearMessage("network-message");
    hideResult("resistor-network-result");
});
setNetworkResistorCount(3, ["10", "20", "30"]);

/* Step-by-step worked solutions */
(function(){
const fmt=n=>Number.isFinite(n)?Number(n.toFixed(3)).toLocaleString("en-US",{maximumFractionDigits:3}):"—";
const get=id=>{const e=document.getElementById(id);if(!e||e.value.trim()==="")return null;const n=Number(e.value);return Number.isFinite(n)?n:null;};
const frac=(numerator,denominator)=>'<span class="math-fraction" role="math" aria-label="'+String(numerator)+' divided by '+String(denominator)+'"><span class="math-numerator">'+numerator+'</span><span class="math-denominator">'+denominator+'</span></span>';
const eq=s=>'<p class="solution-equation">'+s+'</p>';
const step=(title,body)=>'<section class="solution-step"><h4>'+title+'</h4>'+body+'</section>';
const calc=(title,formula,sub,result)=>step(title,eq(formula)+eq(sub)+'<p class="solution-final">'+result+'</p>');
const builders={
"ohms-result":()=>{const v=get("voltage"),i=get("current"),r=get("resistance");if([v,i,r].filter(x=>x!==null).length!==2)return[];if(v===null)return[calc("Step 1 — State the formula","V = I × R","V = "+fmt(i)+" A × "+fmt(r)+" Ω","V = "+fmt(i*r)+" V")];if(i===null){if(r===0)return[];return[calc("Step 1 — State the formula","I = "+frac("V","R"),"I = "+frac(fmt(v)+" V",fmt(r)+" Ω"),"I = "+fmt(v/r)+" A")];}if(i===0)return[];return[calc("Step 1 — State the formula","R = "+frac("V","I"),"R = "+frac(fmt(v)+" V",fmt(i)+" A"),"R = "+fmt(v/i)+" Ω")];},
"power-result":()=>{const mode=document.getElementById("power-mode").value,v=get("power-voltage"),i=get("power-current"),pf=get("power-pf");if(v===null||i===null)return[];if(mode==="dc")return[calc("Calculate DC power","P = V × I","P = "+fmt(v)+" V × "+fmt(i)+" A","P = "+fmt(v*i)+" W")];if(mode==="single-phase"){if(pf===null)return[];return[calc("Calculate real power","P = V × I × PF","P = "+fmt(v)+" V × "+fmt(i)+" A × "+fmt(pf),"P = "+fmt(v*i*pf)+" W")];}return[calc("Calculate apparent power","S = V × I","S = "+fmt(v)+" V × "+fmt(i)+" A","S = "+fmt(v*i)+" VA")];},
"energy-result":()=>{const p=get("energy-power"),t=get("energy-time"),r=get("energy-rate");if(p===null||t===null||r===null)return[];return[calc("Calculate energy","E = P × t","E = "+fmt(p)+" kW × "+fmt(t)+" h","E = "+fmt(p*t)+" kWh"),calc("Calculate cost","Cost = E × rate","Cost = "+fmt(p*t)+" kWh × ₱"+fmt(r)+"/kWh","Cost = ₱"+fmt(p*t*r))];},
"triangle-result":()=>{const t1=document.getElementById("triangle-input-1").value,t2=document.getElementById("triangle-input-2").value,v1=get("triangle-value-1"),v2=get("triangle-value-2");if(v1===null||v2===null)return[];const val={[t1]:v1,[t2]:v2};const computed=calculatePowerTriangleValues(t1,v1,t2,v2),P=computed.P,Q=computed.Q,S=computed.S,PF=computed.PF,theta=computed.theta;const steps=[step("Given values","<p>"+({P:"Real power (P)",Q:"Reactive power (Q)",S:"Apparent power (S)",PF:"Power factor (PF)",Theta:"Phase angle (θ)"})[t1]+" = "+fmt(v1)+(t1==="PF"?"":" "+({P:"W",Q:"VAR",S:"VA",Theta:"°"})[t1])+"</p><p>"+({P:"Real power (P)",Q:"Reactive power (Q)",S:"Apparent power (S)",PF:"Power factor (PF)",Theta:"Phase angle (θ)"})[t2]+" = "+fmt(v2)+(t2==="PF"?"":" "+({P:"W",Q:"VAR",S:"VA",Theta:"°"})[t2])+"</p>")];const rad=x=>x*Math.PI/180;const add=(title,formula,sub,result)=>steps.push(calc(title,formula,sub,result));if(val.P!==undefined&&val.PF!==undefined){add("Calculate apparent power","S = "+frac("P","PF"),"S = "+frac(fmt(val.P)+" W",fmt(val.PF)),"S = "+fmt(S)+" VA");add("Calculate reactive power","Q = √(S² − P²)","Q = √(("+fmt(S)+" VA)² − ("+fmt(P)+" W)²)","Q = "+fmt(Q)+" VAR");add("Calculate phase angle","θ = cos⁻¹(PF)","θ = cos⁻¹("+fmt(PF)+")","θ = "+fmt(theta)+"°");}else if(val.P!==undefined&&val.S!==undefined){add("Calculate reactive power","Q = √(S² − P²)","Q = √(("+fmt(val.S)+" VA)² − ("+fmt(val.P)+" W)²)","Q = "+fmt(Q)+" VAR");add("Calculate power factor","PF = "+frac("P","S"),"PF = "+frac(fmt(val.P)+" W",fmt(val.S)+" VA"),"PF = "+fmt(PF));add("Calculate phase angle","θ = cos⁻¹(PF)","θ = cos⁻¹("+fmt(PF)+")","θ = "+fmt(theta)+"°");}else if(val.P!==undefined&&val.Q!==undefined){add("Calculate apparent power","S = √(P² + Q²)","S = √(("+fmt(val.P)+" W)² + ("+fmt(val.Q)+" VAR)²)","S = "+fmt(S)+" VA");add("Calculate power factor","PF = "+frac("P","S"),"PF = "+frac(fmt(val.P)+" W",fmt(S)+" VA"),"PF = "+fmt(PF));add("Calculate phase angle","θ = cos⁻¹(PF)","θ = cos⁻¹("+fmt(PF)+")","θ = "+fmt(theta)+"°");}else if(val.Q!==undefined&&val.S!==undefined){add("Calculate real power","P = √(S² − Q²)","P = √(("+fmt(val.S)+" VA)² − ("+fmt(val.Q)+" VAR)²)","P = "+fmt(P)+" W");add("Calculate power factor","PF = "+frac("P","S"),"PF = "+frac(fmt(P)+" W",fmt(val.S)+" VA"),"PF = "+fmt(PF));add("Calculate phase angle","θ = cos⁻¹(PF)","θ = cos⁻¹("+fmt(PF)+")","θ = "+fmt(theta)+"°");}else if(val.S!==undefined&&val.PF!==undefined){add("Calculate real power","P = S × PF","P = "+fmt(val.S)+" VA × "+fmt(val.PF),"P = "+fmt(P)+" W");add("Calculate reactive power","Q = S × √(1 − PF²)","Q = "+fmt(val.S)+" VA × √(1 − "+fmt(val.PF)+"²)","Q = "+fmt(Q)+" VAR");add("Calculate phase angle","θ = cos⁻¹(PF)","θ = cos⁻¹("+fmt(val.PF)+")","θ = "+fmt(theta)+"°");}else if(val.Q!==undefined&&val.PF!==undefined){add("Calculate apparent power","S = "+frac("Q","√(1 − PF²)"),"S = "+frac(fmt(val.Q)+" VAR","√(1 − "+fmt(val.PF)+"²)"),"S = "+fmt(S)+" VA");add("Calculate real power","P = S × PF","P = "+fmt(S)+" VA × "+fmt(val.PF),"P = "+fmt(P)+" W");add("Calculate phase angle","θ = cos⁻¹(PF)","θ = cos⁻¹("+fmt(val.PF)+")","θ = "+fmt(theta)+"°");}else if(val.P!==undefined&&val.Theta!==undefined){add("Calculate apparent power","S = "+frac("P","cos(θ)"),"S = "+frac(fmt(val.P)+" W","cos("+fmt(val.Theta)+"°)"),"S = "+fmt(S)+" VA");add("Calculate reactive power","Q = P × tan(θ)","Q = "+fmt(val.P)+" W × tan("+fmt(val.Theta)+"°)","Q = "+fmt(Q)+" VAR");add("Calculate power factor","PF = cos(θ)","PF = cos("+fmt(val.Theta)+"°)","PF = "+fmt(PF));}else if(val.S!==undefined&&val.Theta!==undefined){add("Calculate real power","P = S × cos(θ)","P = "+fmt(val.S)+" VA × cos("+fmt(val.Theta)+"°)","P = "+fmt(P)+" W");add("Calculate reactive power","Q = S × sin(θ)","Q = "+fmt(val.S)+" VA × sin("+fmt(val.Theta)+"°)","Q = "+fmt(Q)+" VAR");add("Calculate power factor","PF = cos(θ)","PF = cos("+fmt(val.Theta)+"°)","PF = "+fmt(PF));}else if(val.Q!==undefined&&val.Theta!==undefined){add("Calculate real power","P = "+frac("Q","tan(θ)"),"P = "+frac(fmt(val.Q)+" VAR","tan("+fmt(val.Theta)+"°)"),"P = "+fmt(P)+" W");add("Calculate apparent power","S = "+frac("Q","sin(θ)"),"S = "+frac(fmt(val.Q)+" VAR","sin("+fmt(val.Theta)+"°)"),"S = "+fmt(S)+" VA");add("Calculate power factor","PF = cos(θ)","PF = cos("+fmt(val.Theta)+"°)","PF = "+fmt(PF));}else{return[];}return steps;},"three-phase-result":()=>{const v=get("three-phase-voltage"),i=get("three-phase-current"),pf=get("three-phase-pf");if(v===null||i===null||pf===null)return[];const p=Math.sqrt(3)*v*i*pf;return[calc("Calculate real power","P = √3 × VL × IL × PF","P = √3 × "+fmt(v)+" V × "+fmt(i)+" A × "+fmt(pf),"P = "+fmt(p)+" W"),calc("Convert to kilowatts","P(kW) = P(W) / 1,000","P = "+fmt(p)+" / 1,000","P = "+fmt(p/1000)+" kW")];},
"transformer-result":()=>{const v1=get("transformer-v1"),n1=get("transformer-n1"),n2=get("transformer-n2"),i1=get("transformer-primary-current");if(v1===null||n1===null||n2===null||n1===0||n2===0)return[];const out=[calc("Step 1 — Find secondary voltage","V₂ / V₁ = N₂ / N₁","V₂ = V₁ × (N₂ / N₁) = "+fmt(v1)+" V × ("+fmt(n2)+" / "+fmt(n1)+")","V₂ = "+fmt(v1*n2/n1)+" V")];if(i1!==null)out.push(calc("Step 2 — Find secondary current (ideal transformer)","I₂ / I₁ = N₁ / N₂","I₂ = I₁ × (N₁ / N₂) = "+fmt(i1)+" A × ("+fmt(n1)+" / "+fmt(n2)+")","I₂ = "+fmt(i1*n1/n2)+" A"));out.push(step("Assumption","<p>Assumes an ideal transformer. Winding losses, magnetizing current, and voltage regulation are not included.</p>"));return out;},
"voltage-drop-result":()=>{const i=get("voltage-drop-current"),r=get("voltage-drop-resistance"),v=get("voltage-drop-system-voltage");if(i===null||r===null)return[];const d=i*r,out=[calc("Step 1 — Calculate voltage drop","V_D = I × R","V_D = "+fmt(i)+" A × "+fmt(r)+" Ω","V_D = "+fmt(d)+" V")];if(v!==null&&v>0)out.push(calc("Step 2 — Calculate percentage voltage drop","V_D% = "+frac("V_D","V_S")+" × 100","V_D% = "+frac(fmt(d)+" V",fmt(v)+" V")+" × 100","V_D% = "+fmt(d/v*100)+" %"));out.push(step("Note","<p>This solution uses the resistance value entered. For a real installation, conductor length, material, temperature, reactance, and circuit configuration may affect the voltage drop.</p>"));return out;},
"ac-impedance-result":()=>{
const r=get("ac-resistance"),l=get("ac-inductance"),c=get("ac-capacitance"),f=get("ac-frequency");
if(r===null||l===null||c===null||f===null||f<=0)return[];
const inductanceH=l/1000,capacitanceF=c/1e6,xl=2*Math.PI*f*inductanceH,xc=c>0?1/(2*Math.PI*f*capacitanceF):null,x=xl-(xc===null?0:xc),z=Math.hypot(r,x),theta=Math.atan2(x,r)*180/Math.PI;
const out=[calc("Step 1 — Calculate inductive reactance","X_L = 2πfL","X_L = 2π × "+fmt(f)+" Hz × "+fmt(l)+" mH × 10⁻³","X_L = "+fmt(xl)+" Ω")];
if(c>0)out.push(step("Step 2 — Calculate capacitive reactance",eq("X_C = "+frac("1","2πfC"))+eq("X_C = "+frac("1","2π × "+fmt(f)+" × "+fmt(c)+" × 10⁻⁶"))+eq("X_C = "+fmt(xc)+" Ω")));
else out.push(step("Step 2 — Capacitive reactance","<p>Capacitance is 0, so the capacitive branch is excluded and X_C is treated as 0 Ω for this model.</p>"));
out.push(calc("Step 3 — Find net reactance","X = X_L − X_C","X = "+fmt(xl)+" − "+fmt(xc===null?0:xc),"X = "+fmt(x)+" Ω"));
out.push(calc("Step 4 — Find impedance magnitude","Z = √(R² + X²)","Z = √("+fmt(r)+"² + "+fmt(x)+"²)","Z = "+fmt(z)+" Ω"));
out.push(step("Step 5 — Find phase angle",eq("θ = tan⁻¹("+frac("X","R")+")")+eq("θ = tan⁻¹("+frac(fmt(x),fmt(r))+")")+"<p class=\"solution-final\">θ = "+fmt(theta)+"°</p>"));
out.push(step("Interpretation","<p>"+(x>0?"Net inductive: current lags voltage.":x<0?"Net capacitive: current leads voltage.":"Resistive: voltage and current are in phase.")+"</p>"));
return out;},
"resistor-network-result":()=>{
const type=document.getElementById("network-type").value,inputs=Array.from(document.querySelectorAll("#network-resistor-list .network-resistance-input")),rs=inputs.map(input=>input.value.trim()===""?null:Number(input.value)),v=get("network-voltage");
if(rs.length<2||rs.some(x=>x===null||!Number.isFinite(x)||x<=0))return[];
const result=EngineeringCore.resistorNetwork(type,rs,v),out=[];
if(type==="series")out.push(calc("Step 1 — Calculate equivalent resistance","R_T = R_1 + R_2 + ⋯ + R_n","R_T = "+rs.map(fmt).join(" Ω + ")+" Ω","R_T = "+fmt(result.equivalentResistance)+" Ω"));
else{const reciprocalSum=rs.map((value,index)=>frac("1","R_"+(index+1))).join(" + ");out.push(step("Step 1 — State the parallel formula",eq("R_T = "+frac("1",reciprocalSum))));out.push(step("Step 2 — Substitute resistor values",eq("R_T = "+frac("1",rs.map(value=>frac("1",fmt(value)+" Ω")).join(" + ")))));out.push(calc("Step 3 — Calculate equivalent resistance","R_T = parallel equivalent resistance","R_T = "+rs.map(value=>fmt(value)+" Ω").join(" ∥ "),"R_T = "+fmt(result.equivalentResistance)+" Ω"));}
if(v!==null){out.push(step("Step 4 — Calculate total current",eq("I_T = "+frac("V_S","R_T"))+eq("I_T = "+frac(fmt(v)+" V",fmt(result.equivalentResistance)+" Ω"))+"<p class=\"solution-final\">I_T = "+fmt(result.totalCurrent)+" A</p>"));rs.forEach((value,index)=>{const branch=result.branches[index];out.push(step("Branch R_"+(index+1),eq("R_"+(index+1)+" = "+fmt(value)+" Ω")+"<p>"+(type==="series"?"Same current flows through each series resistor. Voltage drop V_"+(index+1)+" = "+fmt(branch.voltage)+" V.":"Same voltage appears across each parallel branch. Branch current I_"+(index+1)+" = "+fmt(branch.current)+" A.")+"</p>"));});}
else out.push(step("Optional next step","<p>Enter a supply voltage to calculate total current and each resistor's voltage drop or branch current.</p>"));
return out;},
"converter-result":()=>{const type=document.getElementById("converter-type").value,x=get("converter-value"),m={"w-kw":[1000,"W","kW",0],"kw-w":[1000,"kW","W",1],"wh-kwh":[1000,"Wh","kWh",0],"kwh-wh":[1000,"kWh","Wh",1],"va-kva":[1000,"VA","kVA",0],"kva-va":[1000,"kVA","VA",1],"v-kv":[1000,"V","kV",0],"kv-v":[1000,"kV","V",1],"a-ma":[1000,"A","mA",1],"ma-a":[1000,"mA","A",0],"ohm-kohm":[1000,"Ω","kΩ",0],"kohm-ohm":[1000,"kΩ","Ω",1]}[type];if(x===null||!m)return[];const n=m[3]?x*m[0]:x/m[0];return[calc("Apply conversion",m[2]+" = "+m[1]+" "+(m[3]?"×":"÷")+" 1,000",m[2]+" = "+fmt(x)+" "+(m[3]?"×":"÷")+" 1,000",fmt(n)+" "+m[2])];}
};
const ids={"ohms-result":"calculate-ohms","power-result":"calculate-power","energy-result":"calculate-energy","triangle-result":"calculate-triangle","three-phase-result":"calculate-three-phase","transformer-result":"calculate-transformer","voltage-drop-result":"calculate-voltage-drop","converter-result":"calculate-conversion","ac-impedance-result":"calculate-ac-impedance","resistor-network-result":"calculate-resistor-network"};
document.querySelectorAll(".worked-solution").forEach(d=>{const panel=d.closest(".result-panel"),content=d.querySelector(".solution-content"),button=document.getElementById(ids[panel.id]);if(button)button.addEventListener("click",()=>{if(panel.classList.contains("hidden"))return;const items=builders[panel.id]();content.innerHTML=items.length?items.join(""):'<p class="solution-placeholder">A worked solution is not available for these inputs.</p>';d.open=items.length>0;});});})();



/* Visual aids for calculators where a physical circuit or relationship is easier to understand visually. */
(function initCalculatorDiagrams() {
    const diagrams = {
        "ohms-law": {
            title: "Basic circuit showing voltage, current, and resistance",
            description: "A voltage source drives current through a resistor. Ohm's law relates these quantities.",
            svg: '<svg viewBox="0 0 560 170" role="img" aria-label="A closed circuit with a battery, current arrow, and resistor"><path class="diagram-wire" d="M92 48 H220 M310 48 H468 V132 H92 V48"/><path class="diagram-wire" d="M220 48 l10 -12 l12 24 l12 -24 l12 24 l12 -24 l12 12"/><path class="diagram-wire" d="M92 75 V95 M78 95 H106 M83 105 H101 M92 105 V132"/><path class="diagram-current" d="M130 35 H185"/><path class="diagram-arrow" d="M177 29 L187 35 L177 41"/><text x="155" y="24" class="diagram-label">I</text><text x="265" y="25" class="diagram-label">R</text><text x="52" y="89" class="diagram-label">V</text><text x="280" y="157" class="diagram-note">V = I × R</text></svg>'
        },
        "electrical-power": {
            title: "Electrical power in a load",
            description: "Power is transferred to a load when voltage is applied and current flows through it.",
            svg: '<svg viewBox="0 0 560 150" role="img" aria-label="Voltage source connected to a load with current flowing through the circuit"><path class="diagram-wire" d="M100 42 H220 M320 42 H460 V112 H100 V42"/><circle class="diagram-symbol" cx="100" cy="77" r="24"/><path class="diagram-wire" d="M90 77 H110 M100 67 V87"/><rect class="diagram-symbol" x="220" y="25" width="100" height="34" rx="5"/><path class="diagram-current" d="M135 29 H185"/><path class="diagram-arrow" d="M177 23 L187 29 L177 35"/><text x="158" y="20" class="diagram-label">I</text><text x="270" y="47" text-anchor="middle" class="diagram-label">Load</text><text x="270" y="81" text-anchor="middle" class="diagram-note">P = V × I</text><text x="58" y="121" class="diagram-label">Source</text></svg>'
        },
        "three-phase": {
            title: "Three-phase voltage waveforms",
            description: "The three phase voltages have the same frequency and are separated by 120 electrical degrees.",
            svg: '<svg viewBox="0 0 560 190" role="img" aria-label="Three sinusoidal voltage waveforms separated by 120 degrees"><path class="diagram-axis" d="M44 90 H520 M44 24 V160"/><path class="diagram-phase-a" d="M44 90 C70 90 78 34 112 34 S154 146 188 146 S230 34 264 34 S306 146 340 146 S382 34 416 34 S458 146 492 146 S512 90 520 90"/><path class="diagram-phase-b" d="M44 42 C70 42 82 120 116 120 S158 42 192 42 S234 120 268 120 S310 42 344 42 S386 120 420 120 S462 42 496 42"/><path class="diagram-phase-c" d="M44 138 C70 138 82 60 116 60 S158 138 192 138 S234 60 268 60 S310 138 344 138 S386 60 420 60 S462 138 496 138"/><text x="480" y="22" class="diagram-label">A</text><text x="480" y="42" class="diagram-label">B</text><text x="480" y="62" class="diagram-label">C</text><text x="280" y="181" text-anchor="middle" class="diagram-note">120° phase separation</text></svg>'
        },
        "transformer": {
            title: "Transformer primary and secondary windings",
            description: "An alternating current in the primary winding creates changing magnetic flux in the core, inducing voltage in the secondary winding.",
            svg: '<svg viewBox="0 0 560 170" role="img" aria-label="Transformer with primary winding, magnetic core, and secondary winding"><path class="diagram-wire" d="M50 40 H100 M50 130 H100 M460 40 H510 M460 130 H510"/><path class="diagram-wire" d="M100 40 c-28 0 -28 22 0 22 c-28 0 -28 22 0 22 c-28 0 -28 22 0 22 c-28 0 -28 22 0 22"/><path class="diagram-wire" d="M460 40 c28 0 28 22 0 22 c28 0 28 22 0 22 c28 0 28 22 0 22 c28 0 28 22 0 22"/><path class="diagram-core" d="M245 24 V146 M260 24 V146 M300 24 V146 M315 24 V146"/><text x="150" y="24" text-anchor="middle" class="diagram-label">Primary (N₁)</text><text x="410" y="24" text-anchor="middle" class="diagram-label">Secondary (N₂)</text><text x="280" y="162" text-anchor="middle" class="diagram-note">V₁ / V₂ = N₁ / N₂</text></svg>'
        },
        "voltage-drop": {
            title: "Voltage drop along a conductor",
            description: "Current flowing through conductor resistance causes the load voltage to be lower than the source voltage.",
            svg: '<svg viewBox="0 0 560 170" role="img" aria-label="Source connected to a load through a resistive conductor with voltage drop"><circle class="diagram-symbol" cx="70" cy="85" r="28"/><path class="diagram-wire" d="M70 57 V30 H180 M70 113 V140 H470 V105 M470 65 V30 H390"/><path class="diagram-wire" d="M180 30 l10 -10 l10 20 l10 -20 l10 20 l10 -20 l10 10 H390"/><rect class="diagram-symbol" x="445" y="65" width="50" height="40" rx="4"/><path class="diagram-current" d="M120 18 H165"/><path class="diagram-arrow" d="M157 12 L167 18 L157 24"/><text x="142" y="12" class="diagram-label">I</text><text x="275" y="18" class="diagram-label">Conductor resistance</text><text x="470" y="90" text-anchor="middle" class="diagram-label">Load</text><text x="70" y="90" text-anchor="middle" class="diagram-label">Vₛ</text><text x="280" y="162" text-anchor="middle" class="diagram-note">Vdrop = I × Rwire</text></svg>'
        },
        "ac-impedance": {
            title: "Series RLC circuit",
            description: "Resistance, inductance, and capacitance are connected in series in an AC circuit.",
            svg: '<svg viewBox="0 0 560 160" role="img" aria-label="Series circuit containing a voltage source, resistor, inductor, and capacitor"><path class="diagram-wire" d="M76 42 H135 M183 42 H235 M307 42 H350 M364 42 H500 V120 H76 V106 M76 56 V42"/><circle class="diagram-symbol" cx="76" cy="81" r="25"/><path class="diagram-wire" d="M135 42 l8 -10 l8 20 l8 -20 l8 20 l8 -20 l8 10"/><path class="diagram-wire" d="M235 42 c0 -24 18 -24 18 0 c0 -24 18 -24 18 0 c0 -24 18 -24 18 0 c0 -24 18 -24 18 0"/><path class="diagram-wire" d="M350 28 V56 M364 28 V56"/><text x="185" y="22" text-anchor="middle" class="diagram-label">R</text><text x="320" y="22" text-anchor="middle" class="diagram-label">L</text><text x="407" y="22" text-anchor="middle" class="diagram-label">C</text><text x="76" y="85" text-anchor="middle" class="diagram-label">~</text><text x="280" y="147" text-anchor="middle" class="diagram-note">Z = √(R² + (XL − XC)²)</text></svg>'
        }
    };

    Object.entries(diagrams).forEach(([id, diagram]) => {
        const card = document.getElementById(id);
        if (!card || card.querySelector(".calculator-diagram")) return;
        const figure = document.createElement("figure");
        figure.className = "calculator-diagram";
        figure.innerHTML = '<figcaption>' + diagram.title + '</figcaption>' + diagram.svg + '<p>' + diagram.description + '</p>';
        const description = card.querySelector(".calculator-description");
        if (description) description.insertAdjacentElement("afterend", figure);
        else card.querySelector(".calculator-header")?.insertAdjacentElement("afterend", figure);
    });

    const networkCard = document.getElementById("resistor-network");
    const typeSelect = document.getElementById("network-type");
    const networkList = document.getElementById("network-resistor-list");
    if (networkCard && typeSelect && networkList) {
        const figure = document.createElement("figure");
        figure.className = "calculator-diagram network-diagram";
        figure.innerHTML = '<figcaption>Resistor connection</figcaption><svg viewBox="0 0 560 150" role="img" aria-label="Resistor circuit diagram"></svg><p class="network-diagram-caption"></p>';
        const formula = networkCard.querySelector(".formula-box");
        if (formula) formula.insertAdjacentElement("afterend", figure);
        const renderNetwork = () => {
            const count = Math.max(2, Math.min(30, networkList.querySelectorAll("input").length || 3));
            const parallel = typeSelect.value === "parallel";
            let svg = '<path class="diagram-wire" d="M40 25 H520 M40 125 H520"/>';
            if (parallel) {
                const width = Math.min(480 / count, 80);
                const start = 40;
                for (let i = 0; i < count; i++) {
                    const x = start + (i + 0.5) * 480 / count;
                    svg += '<path class="diagram-wire" d="M' + x + ' 25 V48 M' + x + ' 88 V125"/><rect class="diagram-symbol" x="' + (x - width * .36) + '" y="48" width="' + (width * .72) + '" height="40" rx="3"/>' + (count <= 12 ? '<text x="' + x + '" y="72" text-anchor="middle" class="diagram-label">R' + (i + 1) + '</text>' : '');
                }
                figure.querySelector("svg").setAttribute("aria-label", "Parallel circuit with " + count + " resistor branches");
                figure.querySelector(".network-diagram-caption").textContent = "Each resistor is connected across the same two nodes; branch voltage is equal.";
            } else {
                const gap = 480 / count;
                svg = '<path class="diagram-wire" d="M40 75 H' + (40 + gap * .18) + '"/>';
                for (let i = 0; i < count; i++) {
                    const x = 40 + gap * (i + .18);
                    const w = gap * .62;
                    svg += '<rect class="diagram-symbol" x="' + x + '" y="57" width="' + w + '" height="36" rx="3"/>' + (count <= 12 ? '<text x="' + (x + w / 2) + '" y="79" text-anchor="middle" class="diagram-label">R' + (i + 1) + '</text>' : '') + '<path class="diagram-wire" d="M' + (x + w) + ' 75 H' + (40 + gap * (i + 1)) + '"/>';
                }
                svg += '<circle class="diagram-symbol" cx="40" cy="75" r="3"/><circle class="diagram-symbol" cx="520" cy="75" r="3"/>';
                figure.querySelector("svg").setAttribute("aria-label", "Series circuit with " + count + " resistors");
                figure.querySelector(".network-diagram-caption").textContent = "The same current flows through each resistor; voltage drops add together.";
            }
            figure.querySelector("svg").innerHTML = svg;
        };
        typeSelect.addEventListener("change", renderNetwork);
        networkList.addEventListener("input", renderNetwork);
        networkList.addEventListener("click", renderNetwork);
        renderNetwork();
    }
})();


/* Direction-aware sticky header only. Mobile navigation is owned by mobile-navigation.js. */
(() => {
    const header = document.querySelector(".site-header");
    if (!header) return;
    let lastY = window.scrollY;
    let ticking = false;
    window.addEventListener("scroll", () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const y = window.scrollY;
            const delta = y - lastY;
            if (document.body.classList.contains("mobile-sidebar-open") || y < 80 || delta < -5) {
                header.classList.remove("header-hidden");
            } else if (delta > 5 && y > 140) {
                header.classList.add("header-hidden");
            }
            lastY = y;
            ticking = false;
        });
    }, { passive: true });
})();


/* Render division in displayed equations as stacked fractions, never inline slashes. */
(() => {
    const formulaSelector = [
        ".result-formula",
        "[id$='-result-formula']",
        "[id$='-formula']",
        ".solution-equation",
        ".solution-final"
    ].join(",");
    const operand = String.raw`(?:\([^()]*\)|[A-Za-zΑ-ω0-9₀-₉θΘ²³√_%.,₱]+)`;
    const divisionPattern = new RegExp("(" + operand + ")\\s*\\/\\s*(" + operand + ")", "g");

    function escapeHTML(value) {
        return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;")
            .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }

    function formatFormula(element) {
        if (!(element instanceof Element) || !element.matches(formulaSelector)) return;
        const original = element.textContent || "";
        if (!original.includes("/") || element.dataset.fractionSource === original) return;
        let formatted = original;
        // Several passes allow fractions nested in parentheses to be rendered first.
        for (let pass = 0; pass < 4; pass++) {
            const next = formatted.replace(divisionPattern, (match, numerator, denominator) =>
                '<span class="math-fraction" role="math" aria-label="' +
                escapeHTML(numerator.trim() + " divided by " + denominator.trim()) +
                '"><span class="math-numerator">' + escapeHTML(numerator.trim()) +
                '</span><span class="math-denominator">' + escapeHTML(denominator.trim()) +
                '</span></span>');
            if (next === formatted) break;
            formatted = next;
        }
        if (formatted !== original) {
            element.innerHTML = formatted;
            element.dataset.fractionSource = original;
        }
    }

    function scan(root) {
        if (root instanceof Element) formatFormula(root);
        if (root && root.querySelectorAll) root.querySelectorAll(formulaSelector).forEach(formatFormula);
    }

    scan(document);
    const observer = new MutationObserver(records => {
        records.forEach(record => {
            if (record.type === "characterData") scan(record.target.parentElement);
            record.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) scan(node);
            });
            if (record.type === "childList" && record.target instanceof Element) {
                const parent = record.target.closest(formulaSelector);
                if (parent && !parent.querySelector(".math-fraction")) {
                    delete parent.dataset.fractionSource;
                    formatFormula(parent);
                }
            }
        });
    });
    observer.observe(document.body, { childList: true, characterData: true, subtree: true });
})();
