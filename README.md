 Calculator Web Application 

This repository contains the implementation of Task 2 for the CodeAlfa Web Development Internship. It is a functional calculator built using standard HTML5, CSS3, and JavaScript.

## Project Overview

The objective of this task is to create a functional calculator with an intuitive user interface, accurate arithmetic handling, and real-time result updates.

### Implemented Features

1. Arithmetic Operations:
   - Addition (+)
   - Subtraction (-)
   - Multiplication (×)
   - Division (÷)

2. Display Screen:
   - Main input and result display
   - Expression trail showing active operation and previous operand
   - Real-time result preview as numbers are typed

3. Editing and Controls:
   - Clear All (AC)
   - Delete single character (DEL)
   - Sign toggle (+/-)
   - Percentage calculation (%)

4. Robust Arithmetic:
   - Floating-point precision correction (e.g. 0.1 + 0.2 equals 0.3)
   - Division by zero error handling (displays "Cannot divide by 0")

5. Keyboard Support:
   - Number keys: 0-9
   - Operator keys: +, -, *, /
   - Equals: Enter or =
   - Clear: Escape or C
   - Backspace: DEL
   - Percentage: %

6. Calculation History:
   - History panel to track previous calculations
   - Click any past result to reuse it in current calculations
   - Clear history button

## File Structure

- index.html: Semantic structure and keypad buttons
- styles.css: Clean layout, grid styling, and responsive design
- script.js: Calculator state machine, input handling, and math logic
- README.md: Documentation and instructions

## How to Run

1. Clone or download this project folder.
2. Open index.html directly in any modern web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari).
3. Alternatively, run a local web server:
   ```bash
   python3 -m http.server 3000
   ```
   and navigate to http://localhost:3000 in your browser.

## Technologies Used

- HTML5
- CSS3 (Flexbox, CSS Grid)
- Vanilla JavaScript (ES6)
