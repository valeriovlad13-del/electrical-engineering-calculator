# Electrical Engineering Calculator

A browser-based electrical engineering calculator designed for students,
engineers, and anyone who needs quick and simple electrical
calculations.

The application provides common electrical engineering formulas, unit
conversions, calculation history, input validation, and a responsive
interface that works on desktop, tablet, and mobile devices.

## Live Demo

**Vercel:** https://electrical-engineering-calculator-rho.vercel.app

## Features

### Electrical Calculators

-   **Ohm's Law**
    -   Voltage: `V = I × R`
    -   Current: `I = V / R`
    -   Resistance: `R = V / I`
-   **Electrical Power**
    -   DC power: `P = V × I`
    -   Single-phase AC power: `P = V × I × PF`
    -   Apparent power: `S = V × I`
-   **Energy Consumption**
    -   Energy: `E = P × t`
    -   Electricity cost estimation
    -   Editable electricity rate
-   **Power Triangle**
    -   `S² = P² + Q²`
    -   Calculate real power, reactive power, and apparent power
    -   Calculate power factor and phase angle
    -   Supports combinations using P, Q, S, PF, or phase angle
    -   Visual power triangle diagram with calculated values
-   **Three-Phase Power**
    -   `P = √3 × VL × IL × PF`
-   **Transformer**
    -   Voltage relationship: `V1 / V2 = N1 / N2`
    -   Ideal transformer current relationship
-   **Voltage Drop**
    -   Basic voltage drop: `VD = I × R`
    -   Optional percentage voltage drop
-   **Unit Converter**
    -   W ↔ kW
    -   Wh ↔ kWh
    -   VA ↔ kVA
    -   V ↔ kV
    -   A ↔ mA
    -   Ω ↔ kΩ

## Additional Features

-   Responsive desktop, tablet, and mobile layout
-   Dark mode with persistent theme preference
-   Quick navigation menu
-   Formula and variable explanations
-   Calculation history using browser `localStorage`
-   Input validation and error messages
-   Reset buttons for each calculator
-   SVG-based calculator icons
-   Dynamic power triangle visualization
-   No backend or database required

## Technologies Used

-   HTML5
-   CSS3
-   JavaScript
-   Browser Local Storage
-   Git & GitHub
-   Vercel

## Project Structure

``` text
electrical-engineering-calculator/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

## How to Run Locally

### 1. Clone the repository

``` bash
git clone https://github.com/valeriovlad13-del/electrical-engineering-calculator.git
```

### 2. Open the project

``` bash
cd electrical-engineering-calculator
```

### 3. Start a local server

If Python is installed:

``` bash
python3 -m http.server 8000
```

Then open:

``` text
http://localhost:8000
```

You can also open `index.html` directly in a browser, although using a
local server is recommended during development.

## Example Calculations

### Ohm's Law

A 12 V source is connected to a 6 Ω resistor.

``` text
I = V / R
I = 12 / 6
I = 2.000 A
```

### Single-Phase Power

A 230 V load draws 10 A at a power factor of 0.8.

``` text
P = V × I × PF
P = 230 × 10 × 0.8
P = 1,840.000 W
```

### Energy Consumption

A 2 kW appliance operates for 5 hours.

``` text
E = P × t
E = 2 × 5
E = 10.000 kWh
```

At an electricity rate of ₱10.659/kWh:

``` text
Cost = 10 × ₱10.659
Cost = ₱106.590
```

### Power Triangle

A load has 1,840 W of real power and 1,380 VAR of reactive power.

``` text
S = √(P² + Q²)
S = √(1,840² + 1,380²)
S = 2,300.000 VA

PF = P / S
PF = 0.800

θ = cos⁻¹(PF)
θ = 36.870°
```

### Three-Phase Power

A three-phase load operates at 400 V, 10 A, and 0.8 power factor.

``` text
P = √3 × VL × IL × PF

P = √3 × 400 × 10 × 0.8

P ≈ 5,542.563 W
P ≈ 5.543 kW
```

## Engineering Notes

This project is intended as an educational and practical calculation
tool.

The voltage-drop calculator uses the basic relationship:

``` text
VD = I × R
```

It does not perform a complete electrical installation or
conductor-sizing calculation. Actual electrical design may require
additional factors such as:

-   Conductor material
-   Conductor size
-   Conductor length
-   Temperature
-   AC impedance
-   Reactance
-   Installation method
-   Circuit configuration
-   Applicable electrical codes and standards

Always verify calculations against appropriate engineering references,
manufacturer data, and applicable electrical codes before using them for
an actual installation or engineering design.

## Data and Privacy

The application does not require a backend or user account.

Calculation history is stored locally in the user's browser using
`localStorage`.

Clearing the browser's site data will also remove the stored calculation
history.

## Purpose

This project was created as part of my engineering and computer science
portfolio to demonstrate the application of:

-   Electrical engineering principles
-   Mathematical calculations
-   JavaScript programming
-   Front-end web development
-   Responsive UI/UX design
-   Data persistence using browser storage
-   Engineering-oriented software development

It represents the combination of my background in **Electrical
Engineering** and my continuing studies in **Computer Science**.

## Future Improvements

Possible future enhancements include:

-   More electrical engineering formulas
-   Resistor and capacitor calculations
-   Series and parallel circuit calculations
-   Motor calculations
-   Cable/conductor calculations
-   More advanced voltage-drop calculations
-   Exporting calculation history
-   Calculation sharing
-   Additional unit conversions
-   Improved accessibility
-   Automated testing

## Author

**Blademir Rubia**

Electrical Engineer \| Computer Science

GitHub: https://github.com/valeriovlad13-del

LinkedIn: https://www.linkedin.com/in/blademir-rubia-12305426a

Portfolio: https://engineerxcscience-portfolio.vercel.app

## License

This project is intended for educational and portfolio purposes.
