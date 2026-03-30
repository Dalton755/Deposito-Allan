const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
const DEFAULT_PAYMENT_TYPES = ['DIN', 'DEB', 'PIX', 'CRED'];
const REGISTROS_HEADERS = ['Número Pedido', 'Data', 'Nome', 'Quantidade de itens', 'Descrição', 'Valor total', 'Total Unitario', 'Tipo Pagamento'];
const FIADO_HEADERS = ['Número Pedido', 'Data', 'Nome', 'Quantidade de itens', 'Descrição', 'Valor total', 'Total Unitario', 'Valor pago', 'Valor em aberto', 'Última atualização', 'Itens Detalhados'];
const CONFIG_DEFAULT_ROWS = [['Tipos', 'Produtos'], ['DIN', 'Sifão'], ['DEB', 'FITA ISOLANTE'], ['PIX', 'GARFO ROLO'], ['CRED', 'PARAFUSO']];

const state = {
  mode: 'sale',
  sheetConnected: false,
  products: [],
  paymentTypes: [...DEFAULT_PAYMENT_TYPES],
  openCredits: [],
  currentCreditRow: null,
  currentCreditPaid: 0,
  nextOrderNumber: 1,
  googleApisLoaded: false,
  gisLoaded: false,
  gapiInitialized: false,
  tokenClient: null,
  settings: loadSettings(),
};

const els = {
  statusText: document.getElementById('statusText'),
  orderNumber: document.getElementById('orderNumber'),
  currentDateTime: document.getElementById('currentDateTime'),
  customerName: document.getElementById('customerName'),
  itemsBody: document.getElementById('itemsBody'),
  grandTotalDisplay: document.getElementById('grandTotalDisplay'),
  itemsCountDisplay: document.getElementById('itemsCountDisplay'),
  currentModeText: document.getElementById('currentModeText'),
  productsList: document.getElementById('productsList'),
  openClientsSelect: document.getElementById('openClientsSelect'),
  creditPanel: document.getElementById('creditPanel'),
  saleModeBtn: document.getElementById('saleModeBtn'),
  creditModeBtn: document.getElementById('creditModeBtn'),
  saveCreditBtn: document.getElementById('saveCreditBtn'),
  submitSaleBtn: document.getElementById('submitSaleBtn'),
  loadCreditBtn: document.getElementById('loadCreditBtn'),
  receiveCreditBtn: document.getElementById('receiveCreditBtn'),
  connectBtn: document.getElementById('connectBtn'),
  disconnectBtn: document.getElementById('disconnectBtn'),
  settingsBtn: document.getElementById('settingsBtn'),
  newSaleBtn: document.getElementById('newSaleBtn'),
  addRowBtn: document.getElementById('addRowBtn'),
  shopName: document.getElementById('shopName'),
  settingsDialog: document.getElementById('settingsDialog'),
  settingsForm: document.getElementById('settingsForm'),
  shopNameInput: document.getElementById('shopNameInput'),
  apiKeyInput: document.getElementById('apiKeyInput'),
  clientIdInput: document.getElementById('clientIdInput'),
  spreadsheetIdInput: document.getElementById('spreadsheetIdInput'),
  decisionDialog: document.getElementById('decisionDialog'),
  paidDecisionBtn: document.getElementById('paidDecisionBtn'),
  creditDecisionBtn: document.getElementById('creditDecisionBtn'),
  cancelDecisionBtn: document.getElementById('cancelDecisionBtn'),
  paymentDialog: document.getElementById('paymentDialog'),
  paymentForm: document.getElementById('paymentForm'),
  paymentTypeSelect: document.getElementById('paymentTypeSelect'),
  partialDialog: document.getElementById('partialDialog'),
  partialForm: document.getElementById('partialForm'),
  partialAmountInput: document.getElementById('partialAmountInput'),
};

window.gapiLoaded = () => { state.googleApisLoaded = true; };
window.gisLoaded = () => { state.gisLoaded = true; };

init();

function init() {
  bindEvents();
  applySettingsToUi();
  resetForm();
  updateAuthUi();

  setTimeout(async () => {
    try {
      if (state.settings.apiKey && state.settings.clientId && state.settings.spreadsheetId) {
        await initGoogleClientIfNeeded();
        restoreSessionIfPossible();
      }
    } catch (error) {
      console.error(error);
    }
  }, 1200);
}

function bindEvents() {
  els.settingsBtn.addEventListener('click', openSettingsDialog);
  els.connectBtn.addEventListener('click', connectSheets);
  els.disconnectBtn.addEventListener('click', disconnectSheets);
  els.saleModeBtn.addEventListener('click', () => switchMode('sale'));
  els.creditModeBtn.addEventListener('click', () => switchMode('credit'));
  els.addRowBtn.addEventListener('click', () => addItemRow());
  els.submitSaleBtn.addEventListener('click', handleSubmit);
  els.saveCreditBtn.addEventListener('click', handleSaveCredit);
  els.newSaleBtn.addEventListener('click', resetForm);
  els.loadCreditBtn.addEventListener('click', handleLoadCredit);
  els.receiveCreditBtn.addEventListener('click', handleReceiveCredit);
  els.settingsForm.addEventListener('submit', handleSettingsSave);
  els.paidDecisionBtn.addEventListener('click', async () => {
    els.decisionDialog.close();
    const paymentType = await askPaymentType();
    if (paymentType) await registerPaidSale(paymentType);
  });
  els.creditDecisionBtn.addEventListener('click', async () => {
  els.decisionDialog.close();
  await saveCreditDirectly();
});
  els.cancelDecisionBtn.addEventListener('click', () => els.decisionDialog.close());
}

function loadSettings() {
  return {
    shopName: localStorage.getItem('deposito.shopName') || 'UNIVERSO DE DIVERSIDADES',
    apiKey: localStorage.getItem('deposito.apiKey') || '',
    clientId: localStorage.getItem('deposito.clientId') || '',
    spreadsheetId: localStorage.getItem('deposito.spreadsheetId') || '',
  };
}

function applySettingsToUi() {
  els.shopName.textContent = state.settings.shopName || 'UNIVERSO DE DIVERSIDADES';
  els.shopNameInput.value = state.settings.shopName || '';
  els.apiKeyInput.value = state.settings.apiKey || '';
  els.clientIdInput.value = state.settings.clientId || '';
  els.spreadsheetIdInput.value = state.settings.spreadsheetId || '';
}

function openSettingsDialog() {
  applySettingsToUi();
  els.settingsDialog.showModal();
}

function handleSettingsSave(event) {
  event.preventDefault();

  const shopName = els.shopNameInput.value.trim();
  const apiKey = els.apiKeyInput.value.trim();
  const clientId = els.clientIdInput.value.trim();
  const spreadsheetId = els.spreadsheetIdInput.value.trim();

  localStorage.setItem('deposito.shopName', shopName);
  localStorage.setItem('deposito.apiKey', apiKey);
  localStorage.setItem('deposito.clientId', clientId);
  localStorage.setItem('deposito.spreadsheetId', spreadsheetId);

  state.settings = loadSettings();
  applySettingsToUi();
  els.settingsDialog.close();

  setStatus('Configuração salva.');
}

function updateAuthUi() {
  if (state.sheetConnected) {
    els.connectBtn.classList.add('hidden');
    els.disconnectBtn.classList.remove('hidden');
  } else {
    els.connectBtn.classList.remove('hidden');
    els.disconnectBtn.classList.add('hidden');
  }
}

function restoreSessionIfPossible() {
  try {
    const token = gapi.client.getToken();

    if (token && token.access_token) {
      state.sheetConnected = true;
      updateAuthUi();
      setStatus('Sessão ativa.');
    } else {
      state.sheetConnected = false;
      updateAuthUi();
    }
  } catch (error) {
    console.error(error);
    state.sheetConnected = false;
    updateAuthUi();
  }
}

async function connectSheets() {
  try {
    if (!state.settings.apiKey || !state.settings.clientId || !state.settings.spreadsheetId) {
      openSettingsDialog();
      setStatus('Preencha API Key, Client ID e Spreadsheet ID antes de conectar.');
      return;
    }

    await initGoogleClientIfNeeded();
    await requestToken();
    await bootstrapSpreadsheet();

    state.sheetConnected = true;
    updateAuthUi();

    setStatus('Login realizado e planilha conectada com sucesso.');
  } catch (error) {
    console.error(error);
    setStatus('Não foi possível conectar. Verifique as credenciais e as permissões da planilha.');
  }
}

function disconnectSheets() {
  const token = gapi.client.getToken();

  if (token) {
    google.accounts.oauth2.revoke(token.access_token);
  }

  gapi.client.setToken('');
  state.sheetConnected = false;
  updateAuthUi();

  setStatus('Sessão encerrada.');
}

async function initGoogleClientIfNeeded() {
  if (!state.googleApisLoaded || !state.gisLoaded) {
    throw new Error('Scripts do Google ainda não carregaram.');
  }

  if (!state.gapiInitialized) {
    await new Promise((resolve) => gapi.load('client', resolve));
    await gapi.client.init({
      apiKey: state.settings.apiKey,
      discoveryDocs: [DISCOVERY_DOC],
    });
    state.gapiInitialized = true;
  }

  if (!state.tokenClient) {
    state.tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: state.settings.clientId,
      scope: SCOPES,
      callback: '',
    });
  }
}

async function requestToken() {
  await new Promise((resolve, reject) => {
    state.tokenClient.callback = (resp) => {
      if (resp && resp.error) {
        reject(resp);
        return;
      }
      resolve(resp);
    };

    const existing = gapi.client.getToken();
    state.tokenClient.requestAccessToken({ prompt: existing ? '' : 'consent' });
  });
}

async function bootstrapSpreadsheet() {
  await ensureSheetExists('Registros');
  await ensureSheetExists('Fiado');
  await ensureSheetExists('Config');
  await ensureHeaders('Registros', REGISTROS_HEADERS);
  await ensureHeaders('Fiado', FIADO_HEADERS);
  await ensureConfigDefaults();
  await loadConfigData();
  await refreshOpenCredits();
  state.nextOrderNumber = await getNextOrderNumber();
  refreshMeta();
}

async function ensureSheetExists(title) {
  const meta = await gapi.client.sheets.spreadsheets.get({
    spreadsheetId: state.settings.spreadsheetId,
  });

  const exists = meta.result.sheets.some((sheet) => sheet.properties.title === title);
  if (exists) return;

  await gapi.client.sheets.spreadsheets.batchUpdate({
    spreadsheetId: state.settings.spreadsheetId,
    resource: {
      requests: [
        {
          addSheet: {
            properties: { title },
          },
        },
      ],
    },
  });
}

async function ensureHeaders(sheetName, headers) {
  const range = `${sheetName}!A1:${columnLetter(headers.length)}1`;
  const res = await getValues(range);
  const current = res[0] || [];
  const needsUpdate = headers.some((header, index) => current[index] !== header);

  if (needsUpdate) {
    await updateValues(range, [headers]);
  }
}

async function ensureConfigDefaults() {
  const existing = await getValues('Config!A1:B5');
  if (!existing.length || !existing[0]?.length) {
    await updateValues('Config!A1:B5', CONFIG_DEFAULT_ROWS);
  }
}

async function loadConfigData() {
  const rows = await getValues('Config!A:B');

  const paymentTypes = rows
    .slice(1)
    .map((row) => String(row[0] || '').trim())
    .filter(Boolean);

  const products = rows
    .slice(1)
    .map((row) => String(row[1] || '').trim())
    .filter(Boolean);

  state.paymentTypes = paymentTypes.length ? paymentTypes : [...DEFAULT_PAYMENT_TYPES];
  state.products = products;

  fillProductDatalist();
  fillPaymentOptions();
}

function fillProductDatalist() {
  els.productsList.innerHTML = '';

  state.products.forEach((product) => {
    const option = document.createElement('option');
    option.value = product;
    els.productsList.appendChild(option);
  });
}

function fillPaymentOptions() {
  els.paymentTypeSelect.innerHTML = '';

  state.paymentTypes.forEach((type) => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type;
    els.paymentTypeSelect.appendChild(option);
  });
}

async function refreshOpenCredits() {
  const rows = await getValues('Fiado!A:K');

  state.openCredits = rows
    .slice(1)
    .map((row, index) => ({ rowNumber: index + 2, row }))
    .filter(({ row }) => String(row[2] || '').trim() && Number(row[8] || 0) > 0)
    .map(({ rowNumber, row }) => ({
      rowNumber,
      order: row[0],
      date: row[1],
      customer: row[2],
      qty: Number(row[3] || 0),
      description: row[4] || '',
      total: Number(row[5] || 0),
      totalUnit: Number(row[6] || 0),
      paid: Number(row[7] || 0),
      due: Number(row[8] || 0),
      updatedAt: row[9] || '',
      items: parseStoredItems(row[10]),
    }));

  renderOpenClients();
}

function renderOpenClients() {
  els.openClientsSelect.innerHTML = '<option value="__novo__">Novo cliente</option>';

  state.openCredits.forEach((credit) => {
    const option = document.createElement('option');
    option.value = String(credit.rowNumber);
    option.textContent = `${credit.customer} — ${formatCurrency(credit.due)}`;
    els.openClientsSelect.appendChild(option);
  });
}

async function getNextOrderNumber() {
  const registros = await getValues('Registros!A2:A');
  const fiado = await getValues('Fiado!A2:A');

  const maxRegistro = Math.max(0, ...registros.flat().map((v) => Number(v) || 0));
  const maxFiado = Math.max(0, ...fiado.flat().map((v) => Number(v) || 0));

  return Math.max(maxRegistro, maxFiado) + 1;
}

function refreshMeta() {
  els.orderNumber.textContent = state.currentCreditRow
    ? (findCurrentCredit()?.order || state.nextOrderNumber)
    : state.nextOrderNumber;

  els.currentDateTime.textContent = formatDateTimeDisplay(new Date());
  els.currentModeText.textContent = state.mode === 'sale' ? 'Venda' : 'Fiado';
}

function resetForm() {
  state.mode = 'sale';
  state.currentCreditRow = null;
  state.currentCreditPaid = 0;
  els.customerName.value = '';
  els.itemsBody.innerHTML = '';

  for (let i = 0; i < 6; i += 1) {
    addItemRow();
  }

  switchMode('sale');
  refreshMeta();
  recalcTotals();
}

function switchMode(mode) {
  state.mode = mode;
  els.creditPanel.classList.toggle('hidden', mode !== 'credit');
  els.saveCreditBtn.classList.toggle('hidden', mode !== 'credit');
  els.submitSaleBtn.classList.toggle('hidden', mode !== 'sale');
  els.saleModeBtn.classList.toggle('active', mode === 'sale');
  els.creditModeBtn.classList.toggle('active', mode === 'credit');
  els.saleModeBtn.classList.toggle('secondary', mode !== 'sale');
  els.creditModeBtn.classList.toggle('secondary', mode !== 'credit');
  refreshMeta();
}

function addItemRow(item = {}) {
  const tr = document.createElement('tr');

  tr.innerHTML = `
    <td><input class="qty-input" type="number" min="0" step="1" value="${item.qty ?? ''}" /></td>
    <td><input class="desc-input" type="text" list="productsList" value="${escapeHtml(item.desc || '')}" placeholder="Descrição" /></td>
    <td><input class="money-input unit-input" type="number" min="0" step="0.01" value="${item.unit ?? ''}" placeholder="0,00" /></td>
    <td class="line-total">R$ 0,00</td>
    <td><button type="button" class="remove-row">×</button></td>
  `;

  const inputs = tr.querySelectorAll('input');
  inputs.forEach((input) => input.addEventListener('input', recalcTotals));

  tr.querySelector('.remove-row').addEventListener('click', () => {
    if (els.itemsBody.children.length <= 1) return;
    tr.remove();
    recalcTotals();
  });

  els.itemsBody.appendChild(tr);
}

function recalcTotals() {
  const rows = [...els.itemsBody.querySelectorAll('tr')];
  let grandTotal = 0;
  let itemsCount = 0;

  rows.forEach((row) => {
    const qty = Number(row.querySelector('.qty-input').value || 0);
    const unit = Number(row.querySelector('.unit-input').value || 0);
    const total = qty * unit;

    row.querySelector('.line-total').textContent = formatCurrency(total);
    grandTotal += total;
    itemsCount += qty;
  });

  els.grandTotalDisplay.textContent = formatCurrency(grandTotal);
  els.itemsCountDisplay.textContent = `${itemsCount} item(ns)`;
}

function collectItems() {
  const rows = [...els.itemsBody.querySelectorAll('tr')];

  const items = rows
    .map((row) => ({
      qty: Number(row.querySelector('.qty-input').value || 0),
      desc: row.querySelector('.desc-input').value.trim(),
      unit: Number(row.querySelector('.unit-input').value || 0),
    }))
    .filter((item) => item.qty || item.desc || item.unit);

  if (!items.length) {
    throw new Error('Adicione pelo menos um item.');
  }

  items.forEach((item) => {
    if (!item.qty || !item.desc || item.unit < 0) {
      throw new Error('Preencha quantidade, descrição e valor unitário de todos os itens usados.');
    }
  });

  return items;
}

function buildRecordFromForm() {
  const items = collectItems();
  const customer = els.customerName.value.trim() || 'CLIENTE';
  const quantity = items.reduce((sum, item) => sum + item.qty, 0);
  const description = items.map((item) => `${item.qty}x ${item.desc}`).join(' | ');
  const total = items.reduce((sum, item) => sum + item.qty * item.unit, 0);
  const totalUnit = items.reduce((sum, item) => sum + item.unit, 0);

  return { items, customer, quantity, description, total, totalUnit };
}

function handleSubmit() {
  if (!state.sheetConnected) {
    setStatus('Faça login primeiro.');
    return;
  }

  try {
    buildRecordFromForm();
    els.decisionDialog.showModal();
  } catch (error) {
    setStatus(error.message);
  }
}

async function registerPaidSale(paymentType) {
  try {
    const record = buildRecordFromForm();

    const row = [
      state.nextOrderNumber,
      formatDateTimeStorage(new Date()),
      record.customer,
      record.quantity,
      record.description,
      record.total,
      record.totalUnit,
      paymentType,
    ];

    await appendValues('Registros!A:H', [row]);
    state.nextOrderNumber += 1;

    setStatus(`Venda registrada com pagamento ${paymentType}.`);
    resetForm();
  } catch (error) {
    console.error(error);
    setStatus(error.message || 'Erro ao registrar venda.');
  }
}

async function handleSaveCredit() {
  if (!state.sheetConnected) {
    setStatus('Faça login primeiro.');
    return;
  }

  try {
    const record = buildRecordFromForm();
    const now = formatDateTimeStorage(new Date());

    let orderNumber = state.nextOrderNumber;
    let paidAlready = 0;
    let targetRow = null;

    if (state.currentCreditRow) {
      const current = findCurrentCredit();
      targetRow = current.rowNumber;
      orderNumber = current.order;
      paidAlready = current.paid;
    }

    const due = Math.max(record.total - paidAlready, 0);

    const row = [
      orderNumber,
      now,
      record.customer,
      record.quantity,
      record.description,
      record.total,
      record.totalUnit,
      paidAlready,
      due,
      now,
      JSON.stringify(record.items),
    ];

    if (targetRow) {
      await updateValues(`Fiado!A${targetRow}:K${targetRow}`, [row]);
      setStatus('Fiado atualizado com sucesso.');
    } else {
      await appendValues('Fiado!A:K', [row]);
      state.nextOrderNumber += 1;
      setStatus('Fiado salvo com sucesso.');
    }

    await refreshOpenCredits();
    resetForm();
  } catch (error) {
    console.error(error);
    setStatus(error.message || 'Erro ao salvar fiado.');
  }
}

function handleLoadCredit() {
  const value = els.openClientsSelect.value;

  if (value === '__novo__') {
    state.currentCreditRow = null;
    state.currentCreditPaid = 0;
    els.customerName.value = '';
    els.itemsBody.innerHTML = '';
    addItemRow();
    recalcTotals();
    setStatus('Novo fiado selecionado.');
    return;
  }

  const credit = state.openCredits.find((item) => String(item.rowNumber) === value);
  if (!credit) return;

  loadCreditIntoForm(credit);
}

function loadCreditIntoForm(credit) {
  state.currentCreditRow = credit.rowNumber;
  state.currentCreditPaid = credit.paid;
  els.customerName.value = credit.customer;
  els.itemsBody.innerHTML = '';

  const items = credit.items.length ? credit.items : parseDescriptionFallback(credit.description);

  if (!items.length) {
    addItemRow();
  }

  items.forEach((item) => addItemRow(item));

  switchMode('credit');
  recalcTotals();
  setStatus(`Cliente ${credit.customer} carregado. Saldo em aberto: ${formatCurrency(credit.due)}.`);
}

async function handleReceiveCredit() {
  if (!state.currentCreditRow) {
    setStatus('Carregue um cliente de fiado primeiro.');
    return;
  }

  const credit = findCurrentCredit();

  if (!credit) {
    setStatus('Cliente fiado não encontrado.');
    return;
  }

  const full = window.confirm(`O cliente ${credit.customer} pagou o valor todo?\nOK = valor total | Cancelar = parcial`);

  if (full) {
    const paymentType = await askPaymentType();
    if (!paymentType) return;

    try {
      const row = [
        state.nextOrderNumber,
        formatDateTimeStorage(new Date()),
        credit.customer,
        credit.qty,
        `FIADO QUITADO | ${credit.description}`,
        credit.due,
        credit.totalUnit,
        paymentType,
      ];

      await appendValues('Registros!A:H', [row]);
      await clearValues(`Fiado!A${credit.rowNumber}:K${credit.rowNumber}`);
      state.nextOrderNumber += 1;
      await refreshOpenCredits();
      resetForm();

      setStatus(`Fiado quitado e registrado com pagamento ${paymentType}.`);
    } catch (error) {
      console.error(error);
      setStatus('Erro ao quitar fiado.');
    }

    return;
  }

  els.partialAmountInput.value = '';
  els.partialDialog.showModal();

  const choice = await waitDialog(els.partialDialog, els.partialForm);
  if (choice !== 'confirm') return;

  const amount = Number(els.partialAmountInput.value || 0);

  if (!amount || amount <= 0 || amount > credit.due) {
    setStatus('Informe um valor parcial válido.');
    return;
  }

  try {
    const updatedPaid = credit.paid + amount;
    const updatedDue = credit.due - amount;

    const updatedRow = [[
      credit.order,
      credit.date,
      credit.customer,
      credit.qty,
      credit.description,
      credit.total,
      credit.totalUnit,
      updatedPaid,
      updatedDue,
      formatDateTimeStorage(new Date()),
      JSON.stringify(credit.items),
    ]];

    await updateValues(`Fiado!A${credit.rowNumber}:K${credit.rowNumber}`, updatedRow);
    await refreshOpenCredits();

    const refreshed = state.openCredits.find((item) => item.rowNumber === credit.rowNumber);
    if (refreshed) {
      loadCreditIntoForm(refreshed);
    }

    setStatus(`Pagamento parcial registrado. Saldo restante: ${formatCurrency(updatedDue)}.`);
  } catch (error) {
    console.error(error);
    setStatus('Erro ao registrar pagamento parcial.');
  }
}

function findCurrentCredit() {
  return state.openCredits.find((item) => item.rowNumber === state.currentCreditRow) || null;
}

async function askPaymentType() {
  fillPaymentOptions();
  els.paymentDialog.showModal();

  const choice = await waitDialog(els.paymentDialog, els.paymentForm);
  if (choice !== 'confirm') return null;

  return els.paymentTypeSelect.value;
}

function waitDialog(dialog, form) {
  return new Promise((resolve) => {
    const handler = (event) => {
      event.preventDefault();
      const submitter = event.submitter;
      dialog.close(submitter?.value || 'cancel');
    };

    const closeHandler = () => {
      form.removeEventListener('submit', handler);
      dialog.removeEventListener('close', closeHandler);
      resolve(dialog.returnValue || 'cancel');
    };

    form.addEventListener('submit', handler);
    dialog.addEventListener('close', closeHandler);
  });
}

async function getValues(range) {
  const res = await gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: state.settings.spreadsheetId,
    range,
  });

  return res.result.values || [];
}

async function appendValues(range, values) {
  await gapi.client.sheets.spreadsheets.values.append(
    {
      spreadsheetId: state.settings.spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
    },
    { values }
  );
}

async function updateValues(range, values) {
  await gapi.client.sheets.spreadsheets.values.update(
    {
      spreadsheetId: state.settings.spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
    },
    { values }
  );
}

async function clearValues(range) {
  await gapi.client.sheets.spreadsheets.values.clear(
    {
      spreadsheetId: state.settings.spreadsheetId,
      range,
    },
    {}
  );
}

function setStatus(message) {
  els.statusText.textContent = message;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0));
}

function formatDateTimeDisplay(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatDateTimeStorage(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function parseStoredItems(raw) {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item) => ({
      qty: Number(item.qty || 0),
      desc: item.desc || '',
      unit: Number(item.unit || 0),
    }));
  } catch {
    return [];
  }
}

function parseDescriptionFallback(description) {
  return String(description || '')
    .split('|')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const match = part.match(/^(\d+)x\s+(.*)$/i);
      return {
        qty: Number(match?.[1] || 1),
        desc: match?.[2] || part,
        unit: '',
      };
    });
}

function columnLetter(index) {
  let letter = '';
  let temp = index;

  while (temp > 0) {
    const mod = (temp - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    temp = Math.floor((temp - mod) / 26);
  }

  return letter;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
