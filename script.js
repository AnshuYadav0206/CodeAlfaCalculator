document.addEventListener('DOMContentLoaded', () => {
  const expressionDisplay = document.getElementById('expressionDisplay');
  const currentDisplay = document.getElementById('currentDisplay');
  const previewDisplay = document.getElementById('previewDisplay');
  const historyToggleBtn = document.getElementById('historyToggleBtn');
  const historyContainer = document.getElementById('historyContainer');
  const historyList = document.getElementById('historyList');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const keypad = document.querySelector('.keypad');

  let currentInput = '0';
  let previousInput = '';
  let activeOperator = null;
  let resetNext = false;
  let isErrorState = false;
  let calculationHistory = [];

  try {
    const saved = localStorage.getItem('calc_history');
    if (saved) {
      calculationHistory = JSON.parse(saved);
    }
  } catch (e) {
    calculationHistory = [];
  }

  renderHistory();
  updateDisplay();

  keypad.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.dataset.action;
    const value = btn.dataset.value;
    handleAction(action, value);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === '/' || e.key === ' ') {
      e.preventDefault();
    }

    let matchedBtn = null;

    if (e.key >= '0' && e.key <= '9') {
      handleAction('number', e.key);
      matchedBtn = document.querySelector(`[data-key="${e.key}"]`);
    } else if (e.key === '.') {
      handleAction('decimal', '.');
      matchedBtn = document.querySelector('[data-key="."]');
    } else if (e.key === '+' || e.key === '-') {
      handleAction('operator', e.key);
      matchedBtn = document.querySelector(`[data-key="${e.key}"]`);
    } else if (e.key === '*' || e.key === 'x' || e.key === 'X') {
      handleAction('operator', '*');
      matchedBtn = document.querySelector('[data-key="*"]');
    } else if (e.key === '/') {
      handleAction('operator', '/');
      matchedBtn = document.querySelector('[data-key="/"]');
    } else if (e.key === 'Enter' || e.key === '=') {
      e.preventDefault();
      handleAction('equals');
      matchedBtn = document.querySelector('[data-key="Enter"]');
    } else if (e.key === 'Backspace') {
      handleAction('delete');
      matchedBtn = document.querySelector('[data-key="Backspace"]');
    } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
      handleAction('clear');
      matchedBtn = document.querySelector('[data-key="Escape"]');
    } else if (e.key === '%') {
      handleAction('percent');
      matchedBtn = document.querySelector('[data-key="%"]');
    }

    if (matchedBtn) {
      matchedBtn.classList.add('is-active');
      setTimeout(() => matchedBtn.classList.remove('is-active'), 120);
    }
  });

  function handleAction(action, value) {
    if (isErrorState && action !== 'clear') {
      clearAll();
    }

    switch (action) {
      case 'number':
        appendNumber(value);
        break;
      case 'decimal':
        appendDecimal();
        break;
      case 'operator':
        setOperator(value);
        break;
      case 'equals':
        calculateFinal();
        break;
      case 'delete':
        deleteLastDigit();
        break;
      case 'clear':
        clearAll();
        break;
      case 'percent':
        applyPercentage();
        break;
      case 'negate':
        toggleSign();
        break;
    }

    updateDisplay();
  }

  function appendNumber(num) {
    if (resetNext) {
      currentInput = '';
      resetNext = false;
    }

    if (currentInput.replace(/[^0-9]/g, '').length >= 14) {
      return;
    }

    if (currentInput === '0') {
      currentInput = num;
    } else {
      currentInput += num;
    }
  }

  function appendDecimal() {
    if (resetNext) {
      currentInput = '0';
      resetNext = false;
    }

    if (!currentInput.includes('.')) {
      currentInput += '.';
    }
  }

  function deleteLastDigit() {
    if (resetNext) return;

    if (currentInput.length <= 1 || (currentInput.length === 2 && currentInput.startsWith('-'))) {
      currentInput = '0';
    } else {
      currentInput = currentInput.slice(0, -1);
    }
  }

  function clearAll() {
    currentInput = '0';
    previousInput = '';
    activeOperator = null;
    resetNext = false;
    isErrorState = false;
  }

  function toggleSign() {
    if (currentInput === '0' || currentInput === '') return;
    if (currentInput.startsWith('-')) {
      currentInput = currentInput.substring(1);
    } else {
      currentInput = '-' + currentInput;
    }
  }

  function applyPercentage() {
    const val = parseFloat(currentInput);
    if (isNaN(val)) return;

    if (previousInput !== '' && activeOperator) {
      const prev = parseFloat(previousInput);
      if (!isNaN(prev) && (activeOperator === '+' || activeOperator === '-')) {
        currentInput = roundPrecision((prev * val) / 100).toString();
        return;
      }
    }

    currentInput = roundPrecision(val / 100).toString();
  }

  function setOperator(op) {
    if (currentInput === '' && previousInput === '') return;

    if (previousInput !== '' && currentInput === '') {
      activeOperator = op;
      return;
    }

    if (previousInput !== '') {
      const res = executeMath(previousInput, currentInput, activeOperator);
      if (res === 'Error') {
        showError('Cannot divide by 0');
        return;
      }
      previousInput = res.toString();
    } else {
      previousInput = currentInput;
    }

    activeOperator = op;
    resetNext = true;
    currentInput = '';
  }

  function calculateFinal() {
    if (!activeOperator || previousInput === '') return;

    const secondOperand = currentInput === '' ? previousInput : currentInput;
    const res = executeMath(previousInput, secondOperand, activeOperator);

    if (res === 'Error') {
      showError('Cannot divide by 0');
      return;
    }

    const symbolMap = { '/': '÷', '*': '×', '-': '-', '+': '+' };
    const exprText = `${previousInput} ${symbolMap[activeOperator] || activeOperator} ${secondOperand}`;
    saveHistory(exprText, res.toString());

    currentInput = res.toString();
    previousInput = '';
    activeOperator = null;
    resetNext = true;
  }

  function executeMath(a, b, op) {
    const numA = parseFloat(a);
    const numB = parseFloat(b);

    if (isNaN(numA) || isNaN(numB)) return '0';

    let result = 0;
    switch (op) {
      case '+':
        result = numA + numB;
        break;
      case '-':
        result = numA - numB;
        break;
      case '*':
        result = numA * numB;
        break;
      case '/':
        if (numB === 0) return 'Error';
        result = numA / numB;
        break;
      default:
        return numB;
    }

    return roundPrecision(result);
  }

  function roundPrecision(val) {
    if (!isFinite(val)) return 'Error';
    return parseFloat(Number(val).toPrecision(12));
  }

  function showError(msg) {
    isErrorState = true;
    currentInput = msg;
    previousInput = '';
    activeOperator = null;
    previewDisplay.textContent = '';
  }

  function updateDisplay() {
    if (isErrorState) {
      currentDisplay.textContent = currentInput;
      currentDisplay.classList.add('error-text');
      expressionDisplay.textContent = '';
      previewDisplay.textContent = '';
      highlightOperator(null);
      return;
    }

    currentDisplay.classList.remove('error-text');

    if (currentInput === '' && previousInput !== '') {
      currentDisplay.textContent = '0';
    } else {
      currentDisplay.textContent = formatWithCommas(currentInput);
    }

    const symbolMap = { '/': '÷', '*': '×', '-': '-', '+': '+' };
    if (activeOperator && previousInput !== '') {
      expressionDisplay.textContent = `${formatWithCommas(previousInput)} ${symbolMap[activeOperator] || activeOperator}`;
    } else {
      expressionDisplay.textContent = '';
    }

    if (activeOperator && previousInput !== '' && currentInput !== '' && !resetNext) {
      const live = executeMath(previousInput, currentInput, activeOperator);
      if (live === 'Error') {
        previewDisplay.textContent = 'Result: Cannot divide by 0';
      } else {
        previewDisplay.textContent = `Result: ${formatWithCommas(live.toString())}`;
      }
    } else {
      previewDisplay.textContent = '';
    }

    highlightOperator(activeOperator);
  }

  function highlightOperator(op) {
    const operatorBtns = document.querySelectorAll('.btn-operator');
    operatorBtns.forEach((btn) => {
      if (btn.dataset.value === op) {
        btn.classList.add('operator-active');
      } else {
        btn.classList.remove('operator-active');
      }
    });
  }

  function formatWithCommas(numStr) {
    if (!numStr) return '';
    if (numStr === '-') return '-';

    const parts = numStr.toString().split('.');
    const integerPart = parseFloat(parts[0]);
    const decimalPart = parts[1];

    let formattedInt = '';
    if (isNaN(integerPart)) {
      formattedInt = parts[0] === '-' ? '-' : '';
    } else {
      formattedInt = integerPart.toLocaleString('en-US');
    }

    if (decimalPart !== undefined) {
      return `${formattedInt}.${decimalPart}`;
    }
    return formattedInt;
  }

  function saveHistory(expr, result) {
    calculationHistory.unshift({ expr, result, id: Date.now() });
    if (calculationHistory.length > 20) {
      calculationHistory.pop();
    }
    try {
      localStorage.setItem('calc_history', JSON.stringify(calculationHistory));
    } catch (e) {}
    renderHistory();
  }

  function renderHistory() {
    if (!historyList) return;

    if (calculationHistory.length === 0) {
      historyList.innerHTML = '<div class="history-placeholder">No recent calculations</div>';
      return;
    }

    historyList.innerHTML = calculationHistory
      .map(
        (item) => `
        <div class="history-row" data-val="${item.result}">
          <span class="history-expr">${item.expr} =</span>
          <span class="history-res">${item.result}</span>
        </div>
      `
      )
      .join('');

    const rows = historyList.querySelectorAll('.history-row');
    rows.forEach((row) => {
      row.addEventListener('click', () => {
        const val = row.getAttribute('data-val');
        currentInput = val;
        resetNext = true;
        updateDisplay();
      });
    });
  }

  historyToggleBtn.addEventListener('click', () => {
    historyContainer.classList.toggle('show');
    if (historyContainer.classList.contains('show')) {
      historyToggleBtn.textContent = 'Hide History';
    } else {
      historyToggleBtn.textContent = 'History';
    }
  });

  clearHistoryBtn.addEventListener('click', () => {
    calculationHistory = [];
    try {
      localStorage.removeItem('calc_history');
    } catch (e) {}
    renderHistory();
  });
});
