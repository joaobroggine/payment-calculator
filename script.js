(function () {
  const PRICE = 39.99;

  const primaryEl = document.getElementById('primary-display');
  const secondaryEl = document.getElementById('secondary-display');
  const historyPanel = document.getElementById('history-panel');
  const historyList = document.getElementById('history-list');
  const historyToggle = document.getElementById('history-toggle');
  const historyClear = document.getElementById('history-clear');
  const themeToggle = document.getElementById('theme-toggle');
  const memoryIndicator = document.getElementById('memory-indicator');

  // Paywall elements
  const payBackdrop = document.getElementById('paywall-backdrop');
  const payClose = document.getElementById('pay-close');
  const payAmount = document.getElementById('pay-amount');
  const payForm = document.getElementById('pay-form');
  const paySubmit = document.getElementById('pay-submit');
  const brandIndicator = document.getElementById('brand-indicator');
  const toast = document.getElementById('toast');

  const inputBrand = () => payForm.querySelector('input[name="brand"]:checked');
  const nameInput = document.getElementById('card-name');
  const numberInput = document.getElementById('card-number');
  const expiryInput = document.getElementById('card-expiry');
  const cvvInput = document.getElementById('card-cvv');

  // Estado da calculadora
  let tokens = [];          // Ex.: [12.5, '+', 3]
  let current = '0';        // Entrada atual (string)
  let lastWasEquals = false;
  let memory = null;
  let history = [];

  // Resultado pendente (aguarda pagamento)
  let pendingCalc = null;

  // Persistência de tema
  const savedTheme = localStorage.getItem('calc-theme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }

  themeToggle.addEventListener('click', () => {
    const now = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', now);
    localStorage.setItem('calc-theme', now);
  });

  historyToggle.addEventListener('click', () => {
    historyPanel.hidden = !historyPanel.hidden;
  });

  historyClear.addEventListener('click', () => {
    history = [];
    renderHistory();
  });

  function setMemoryIndicator() {
    if (memory !== null) memoryIndicator.classList.add('visible');
    else memoryIndicator.classList.remove('visible');
  }

  // Helpers de formatação e cálculo
  const OP_MAP = { add: '+', subtract: '-', multiply: '*', divide: '/' };
  const OP_SYM = { '+': '+', '-': '−', '*': '×', '/': '÷' };

  function safeNumber(n) {
    return Object.is(n, -0) ? 0 : n;
  }

  function formatNumber(n) {
    if (!isFinite(n)) return 'Erro';
    const abs = Math.abs(n);
    if (abs >= 1e12 || (abs !== 0 && abs < 1e-9)) {
      return n.toExponential(10).replace('e', 'e');
    }
    const rounded = Math.round(n * 1e12) / 1e12;
    return rounded.toLocaleString('pt-BR', { maximumFractionDigits: 12 });
  }

  function parseCurrent() {
    const s = current.replace(',', '.');
    const n = Number(s);
    return n;
  }

  function renderDisplays() {
    // Primário
    let toShow;
    if (current === '' || current === '-') {
      toShow = current || '0';
    } else {
      const val = Number(current.replace(',', '.'));
      toShow = isNaN(val) ? 'Erro' : formatNumber(val);
    }
    primaryEl.textContent = toShow;

    // Secundário: tokens + current (se aplicável)
    const parts = [];
    for (const t of tokens) {
      if (typeof t === 'number') parts.push(formatNumber(t));
      else parts.push(OP_SYM[t] || t);
    }
    if (!lastWasEquals && current !== '' && current !== '0') {
      parts.push(current);
    }
    secondaryEl.textContent = parts.join(' ');
  }

  function pushCurrentIfNeeded() {
    if (current !== '' && current !== '-' && current !== null) {
      const val = parseCurrent();
      if (!isNaN(val)) tokens.push(safeNumber(val));
      current = '';
    }
  }

  function replaceLastOperator(op) {
    if (tokens.length && typeof tokens[tokens.length - 1] === 'string') {
      tokens[tokens.length - 1] = op;
      return true;
    }
    return false;
  }

  function shuntingYardEval(ts) {
    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };
    const output = [];
    const ops = [];
    for (const t of ts) {
      if (typeof t === 'number') {
        output.push(t);
      } else if (t in precedence) {
        while (ops.length && precedence[ops[ops.length - 1]] >= precedence[t]) {
          output.push(ops.pop());
        }
        ops.push(t);
      }
    }
    while (ops.length) output.push(ops.pop());

    const stack = [];
    for (const x of output) {
      if (typeof x === 'number') stack.push(x);
      else {
        const b = stack.pop();
        const a = stack.pop();
        let r = 0;
        switch (x) {
          case '+': r = a + b; break;
          case '-': r = a - b; break;
          case '*': r = a * b; break;
          case '/': r = b === 0 ? Infinity : a / b; break;
        }
        stack.push(r);
      }
    }
    return stack.pop() ?? 0;
  }

  function evaluateNow(includeCurrent = true) {
    const ts = tokens.slice();
    if (includeCurrent && current !== '' && current !== '-') {
      const val = parseCurrent();
      if (!isNaN(val)) ts.push(safeNumber(val));
    }
    if (typeof ts[ts.length - 1] === 'string') ts.pop();
    if (!ts.length) return 0;
    const res = shuntingYardEval(ts);
    return safeNumber(res);
  }

  function expressionToString(includeCurrent = true) {
    const parts = [];
    for (const t of tokens) {
      if (typeof t === 'number') parts.push(formatNumber(t));
      else parts.push(OP_SYM[t] || t);
    }
    if (includeCurrent && current !== '' && current !== '-') {
      parts.push(current);
    }
    return parts.join(' ');
  }

  // Interações
  function inputDigit(d) {
    if (lastWasEquals) {
      tokens = [];
      current = '0';
      lastWasEquals = false;
    }
    if (current === '0') current = String(d);
    else current += String(d);
    renderDisplays();
  }

  function inputDecimal() {
    if (lastWasEquals) {
      tokens = [];
      current = '0';
      lastWasEquals = false;
    }
    if (!current.includes(','))
      current = (current || '0') + ',';
    renderDisplays();
  }

  function inputOperator(opKey) {
    const op = OP_MAP[opKey];
    if (lastWasEquals) {
      lastWasEquals = false;
    }
    if (current === '-' || current === '') {
      if (!replaceLastOperator(op)) {
        if (!tokens.length) tokens.push(0);
        tokens.push(op);
      }
      renderDisplays();
      return;
    }
    pushCurrentIfNeeded();
    if (!replaceLastOperator(op)) {
      tokens.push(op);
    }
    renderDisplays();
  }

  function actionPercent() {
    const b = parseCurrent();
    if (tokens.length >= 2 && typeof tokens[tokens.length - 1] === 'string') {
      const op = tokens[tokens.length - 1];
      const a = tokens[tokens.length - 2];
      if (typeof a === 'number') {
        const p = a * (isNaN(b) ? 0 : b) / 100;
        current = String(p).replace('.', ',');
      }
    } else if (current !== '' && current !== '-') {
      const p = (isNaN(b) ? 0 : b) / 100;
      current = String(p).replace('.', ',');
    }
    renderDisplays();
  }

  function actionUnary(fn) {
    const val = parseCurrent();
    if (isNaN(val)) return;
    let result = val;
    switch (fn) {
      case 'reciprocal':
        if (val === 0) { primaryEl.textContent = 'Erro'; return; }
        result = 1 / val; break;
      case 'square': result = val * val; break;
      case 'sqrt':
        if (val < 0) { primaryEl.textContent = 'Erro'; return; }
        result = Math.sqrt(val); break;
      case 'negate': result = -val; break;
    }
    current = String(result).replace('.', ',');
    renderDisplays();
  }

  function actionCE() {
    current = '0';
    lastWasEquals = false;
    renderDisplays();
  }

  function actionClear() {
    tokens = [];
    current = '0';
    lastWasEquals = false;
    renderDisplays();
  }

  function actionBackspace() {
    if (lastWasEquals) {
      actionCE();
      return;
    }
    if (current.length > 1) {
      current = current.slice(0, -1);
      if (current === '-0') current = '0';
    } else {
      current = '0';
    }
    renderDisplays();
  }

  function actionEquals() {
    const exprStr = expressionToString(true);
    const result = evaluateNow(true);

    if (!isFinite(result) || isNaN(result)) {
      primaryEl.textContent = 'Erro';
      lastWasEquals = true;
      return;
    }

    // Abre paywall e só aplica resultado após "pagamento"
    openPaywall(exprStr, result);
  }

  // Memória
  function memoryOp(op) {
    const val = parseCurrent();
    switch (op) {
      case 'MC': memory = null; break;
      case 'MR':
        if (memory !== null) {
          current = String(memory).replace('.', ',');
          lastWasEquals = false;
        }
        break;
      case 'M+': memory = (memory ?? 0) + (isNaN(val) ? 0 : val); break;
      case 'M-': memory = (memory ?? 0) - (isNaN(val) ? 0 : val); break;
      case 'MS': memory = isNaN(val) ? 0 : val; break;
    }
    setMemoryIndicator();
    renderDisplays();
  }

  // Histórico
  function addToHistory(expr, resultText, resultNumber) {
    history.unshift({ expr, resultText, resultNumber });
    if (history.length > 50) history.pop();
    renderHistory();
  }

  function renderHistory() {
    historyList.innerHTML = '';
    for (const item of history) {
      const li = document.createElement('li');
      li.className = 'history-item';
      const expr = document.createElement('div');
      expr.className = 'expr';
      expr.textContent = item.expr;
      const res = document.createElement('div');
      res.className = 'result';
      res.textContent = item.resultText;
      const reuse = document.createElement('button');
      reuse.className = 'ghost small';
      reuse.textContent = 'Usar';
      reuse.title = 'Usar resultado';
      reuse.addEventListener('click', () => {
        tokens = [];
        current = String(item.resultNumber).replace('.', ',');
        lastWasEquals = false;
        renderDisplays();
      });

      li.appendChild(expr);
      li.appendChild(res);
      li.appendChild(reuse);
      historyList.appendChild(li);
    }
  }

  // Mapeamento de botões
  document.querySelectorAll('[data-digit]').forEach(btn => {
    btn.addEventListener('click', () => inputDigit(btn.dataset.digit));
  });
  document.querySelectorAll('[data-operator]').forEach(btn => {
    btn.addEventListener('click', () => inputOperator(btn.dataset.operator));
  });
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const a = btn.dataset.action;
      if (a === 'decimal') inputDecimal();
      else if (a === 'percent') actionPercent();
      else if (a === 'reciprocal') actionUnary('reciprocal');
      else if (a === 'square') actionUnary('square');
      else if (a === 'sqrt') actionUnary('sqrt');
      else if (a === 'negate') actionUnary('negate');
      else if (a === 'ce') actionCE();
      else if (a === 'clear') actionClear();
      else if (a === 'backspace') actionBackspace();
      else if (a === 'equals') actionEquals();
    });
  });
  document.querySelectorAll('[data-memory]').forEach(btn => {
    btn.addEventListener('click', () => memoryOp(btn.dataset.memory));
  });

  // Teclado
  window.addEventListener('keydown', (e) => {
    // atalhos
    if (e.ctrlKey && (e.key === 't' || e.key === 'T')) {
      e.preventDefault(); themeToggle.click(); return;
    }
    if (e.ctrlKey && (e.key === 'h' || e.key === 'H')) {
      e.preventDefault(); historyToggle.click(); return;
    }

    // Se o paywall está aberto, Enter tenta pagar e Esc fecha
    if (payBackdrop.classList.contains('open')) {
      if (e.key === 'Enter') { e.preventDefault(); trySubmitPayment(); }
      if (e.key === 'Escape') { e.preventDefault(); closePaywall(); }
      return;
    }

    if (/\d/.test(e.key)) { inputDigit(e.key); return; }
    if (e.key === '.' || e.key === ',') { inputDecimal(); return; }
    if (e.key === '+') { inputOperator('add'); return; }
    if (e.key === '-') { inputOperator('subtract'); return; }
    if (e.key === '*' || e.key.toLowerCase() === 'x') { inputOperator('multiply'); return; }
    if (e.key === '/' || e.key === '÷') { inputOperator('divide'); return; }
    if (e.key === '%') { actionPercent(); return; }
    if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); actionEquals(); return; }
    if (e.key === 'Backspace') { actionBackspace(); return; }
    if (e.key === 'Delete' || e.key === 'Escape') { actionClear(); return; }
  });

  // ===== Paywall: lógica e validação =====
  function openPaywall(exprStr, resultNumber) {
    // Guarda cálculo pendente
    pendingCalc = { exprStr, resultNumber };

    // Reseta formulário
    payAmount.textContent = PRICE.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    paySubmit.disabled = true;
    paySubmit.classList.remove('loading');
    nameInput.value = '';
    numberInput.value = '';
    expiryInput.value = '';
    cvvInput.value = '';
    brandIndicator.textContent = '•••';
    payForm.querySelectorAll('input[name="brand"]').forEach(r => r.checked = false);

    // Abre modal
    payBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => nameInput.focus(), 50);
  }

  function closePaywall() {
    payBackdrop.classList.remove('open');
    document.body.style.overflow = '';
    pendingCalc = null;
  }

  function finalizePaymentAndShowResult() {
    if (!pendingCalc) return;
    const { exprStr, resultNumber } = pendingCalc;

    // Atualiza histórico e mostra resultado
    addToHistory(`${exprStr} =`, formatNumber(resultNumber), resultNumber);
    tokens = [];
    current = String(resultNumber).replace('.', ',');
    lastWasEquals = true;
    renderDisplays();

    showToast('Pagamento aprovado! Resultado desbloqueado.');
    pendingCalc = null;
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2200);
  }

  // Detecção de bandeira simples
  function detectBrand(digits) {
    if (/^4\d{0,}$/.test(digits)) return 'visa';
    if (/^(5[1-5]|2[2-7])\d{0,}$/.test(digits)) return 'mastercard';
    if (/^3[47]\d{0,}$/.test(digits)) return 'amex';
    return '';
  }

  function formatCardNumber(digits, brand) {
    let parts = [];
    if (brand === 'amex') {
      // 4-6-5
      parts = [digits.slice(0,4), digits.slice(4,10), digits.slice(10,15)].filter(Boolean);
    } else {
      // 4-4-4-4
      parts = [digits.slice(0,4), digits.slice(4,8), digits.slice(8,12), digits.slice(12,16), digits.slice(16,19)].filter(Boolean);
    }
    return parts.join(' ');
  }

  function luhnCheck(digits) {
    let sum = 0, alt = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let n = parseInt(digits[i], 10);
      if (alt) { n *= 2; if (n > 9) n -= 9; }
      sum += n; alt = !alt;
    }
    return (sum % 10) === 0;
  }

  function expiryValid(mmYY) {
    const m = mmYY.match(/^(\d{2})\/(\d{2})$/);
    if (!m) return false;
    let [_, MM, YY] = m;
    const month = parseInt(MM, 10);
    if (month < 1 || month > 12) return false;
    const now = new Date();
    const year = 2000 + parseInt(YY, 10);
    const lastOfMonth = new Date(year, month, 0); // último dia do mês
    return lastOfMonth >= new Date(now.getFullYear(), now.getMonth(), 1);
  }

  function validateForm() {
    const nameOk = nameInput.value.trim().length >= 3;

    const digits = numberInput.value.replace(/\D/g, '').slice(0,19);
    const brand = detectBrand(digits);
    const brandSelected = inputBrand()?.value || '';
    // auto-seleciona a detectada se nada escolhido
    if (!brandSelected && brand) {
      payForm.querySelector(`input[name="brand"][value="${brand}"]`)?.click();
    }

    const targetBrand = inputBrand()?.value || brand;
    const numberLenOk = targetBrand === 'amex' ? digits.length === 15 : (digits.length === 16 || digits.length === 19 || digits.length === 13 || digits.length === 18);
    const luhnOk = digits.length >= 13 && luhnCheck(digits);

    const expiryOk = expiryValid(expiryInput.value);
    const cvvLen = (targetBrand === 'amex') ? 4 : 3;
    const cvvOk = new RegExp(`^\\d{${cvvLen}}$`).test(cvvInput.value);

    const allOk = nameOk && numberLenOk && luhnOk && expiryOk && cvvOk;
    paySubmit.disabled = !allOk;
  }

  function maskAndDetectNumber() {
    let digits = numberInput.value.replace(/\D/g, '').slice(0,19);
    const brand = detectBrand(digits);
    numberInput.value = formatCardNumber(digits, brand);
    brandIndicator.textContent = brand ? brand.toUpperCase() : '•••';

    // Ajusta placeholder do CVV conforme bandeira
    cvvInput.placeholder = brand === 'amex' ? '••••' : '•••';
  }

  function maskExpiry() {
    let v = expiryInput.value.replace(/\D/g, '').slice(0,4);
    if (v.length >= 3) v = v.slice(0,2) + '/' + v.slice(2);
    expiryInput.value = v;
  }

  // Eventos do paywall
  payClose.addEventListener('click', closePaywall);
  payBackdrop.addEventListener('click', (e) => { if (e.target === payBackdrop) closePaywall(); });

  nameInput.addEventListener('input', validateForm);
  numberInput.addEventListener('input', () => { maskAndDetectNumber(); validateForm(); });
  expiryInput.addEventListener('input', () => { maskExpiry(); validateForm(); });
  cvvInput.addEventListener('input', validateForm);
  payForm.querySelectorAll('input[name="brand"]').forEach(r => r.addenough = r.addEventListener('change', validateForm));

  function trySubmitPayment() {
    if (paySubmit.disabled) return;
    paySubmit.classList.add('loading');
    // Simula processamento
    setTimeout(() => {
      paySubmit.classList.remove('loading');
      closePaywall();
      finalizePaymentAndShowResult();
    }, 1100);
  }

  payForm.addEventListener('submit', (e) => {
    e.preventDefault();
    trySubmitPayment();
  });

  // Inicializa
  setMemoryIndicator();
  renderDisplays();

  // Exibe valor no botão
  paySubmit.querySelector('.btn-text').textContent = `Pagar R$ ${PRICE.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
})();