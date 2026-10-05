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
 const bx=55,by=305,maxW=400,maxH=250,m=Math.max(P,Q,1),scale=Math.min(maxW/m,maxH/m);
 const w=P*scale,h=Q*scale,tx=bx+w,ty=by-h,mx=bx+w/2;
 setTriangle("triangle-p-line",{x1:bx,y1:by,x2:tx,y2:by});
 setTriangle("triangle-q-line",{x1:tx,y1:by,x2:tx,y2:ty});
 setTriangle("triangle-s-line",{x1:bx,y1:by,x2:tx,y2:ty});
 const r=Math.max(16,Math.min(34,Math.min(Math.max(w,16),Math.max(h,16))*.3)),rad=theta*Math.PI/180;
 setTriangle("triangle-angle-arc",{d:`M ${bx+r} ${by} A ${r} ${r} 0 0 0 ${bx+r*Math.cos(rad)} ${by-r*Math.sin(rad)}`});
 setTriangle("triangle-right-angle",{d:`M ${tx-12} ${by} L ${tx-12} ${by-12} L ${tx} ${by-12}`});
 setTriangle("triangle-p-label",{x:mx,y:by+28});
 setTriangle("triangle-q-label",{x:tx+42,y:Math.max(ty+h/2,85)});
 const sx=bx+w*.55,sy=by-h*.55-8;
 setTriangle("triangle-s-label",{x:sx,y:sy,transform:`rotate(${-theta} ${sx} ${sy})`});
 setTriangle("triangle-angle-label",{x:bx+r*1.45,y:by-r*.22});
 const pValueY=by+48,qValueY=Math.max(ty+h/2+20,105),sValueX=bx+w*.55,sValueY=by-h*.55+12;
 setTriangle("triangle-p-value",{x:mx,y:pValueY});
 setTriangle("triangle-q-value",{x:tx+42,y:qValueY});
 setTriangle("triangle-s-value",{x:sValueX,y:sValueY,transform:"rotate("+(-theta)+" "+sValueX+" "+sValueY+")"});
 setTriangle("triangle-theta-value",{x:bx+r*1.45,y:by-r*.22+20});
 const d=document.getElementById("power-triangle-svg-desc");
 if(d)d.textContent=`Power triangle showing ${formatNumber(P)} W real power, ${formatNumber(Q)} VAR reactive power, and a phase angle of ${formatNumber(theta,2)} degrees.`;
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
  document.getElementById("triangle-result-pf").textContent=formatNumber(v.PF,4);
  document.getElementById("triangle-result-theta").textContent=`${formatNumber(v.theta,2)}°`;
  document.getElementById("triangle-p-value").textContent=`P = ${formatNumber(v.P)} W`;
  document.getElementById("triangle-q-value").textContent=`Q = ${formatNumber(v.Q)} VAR`;
  document.getElementById("triangle-s-value").textContent=`S = ${formatNumber(v.S)} VA`;
  document.getElementById("triangle-theta-value").textContent=`θ = ${formatNumber(v.theta,2)}°`;
  document.getElementById("triangle-result-formula").textContent="S² = P² + Q² | PF = P / S | θ = cos⁻¹(PF)";
  renderPowerTriangle(v.P,v.Q,v.theta);showResult("triangle-result");
  saveHistory("Power Triangle",`${t1} = ${v1} | ${t2} = ${v2}`,`P = ${formatNumber(v.P)} W | Q = ${formatNumber(v.Q)} VAR | S = ${formatNumber(v.S)} VA | PF = ${formatNumber(v.PF,4)} | θ = ${formatNumber(v.theta,2)}°`);
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
