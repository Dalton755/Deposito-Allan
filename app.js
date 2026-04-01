:root {
  --bg: #ececec;
  --paper: #ffffff;
  --ink: #111827;
  --muted: #6b7280;
  --line: #2f5f86;
  --line-soft: #a7bccf;
  --accent: #174f82;
  --accent-2: #0a6ea8;
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  font-family: Inter, system-ui, sans-serif;
  color: var(--ink);
  background: var(--bg);
}

button, input, select {
  font: inherit;
}

.hidden {
  display: none !important;
}

.muted {
  color: var(--muted);
  font-size: 0.92rem;
  line-height: 1.45;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 20px 28px;
  background: #fff;
  border-bottom: 1px solid #d7d7d7;
  position: sticky;
  top: 0;
  z-index: 20;
}

.topbar h1 {
  margin: 0;
  font-size: 1.35rem;
}

.topbar p {
  margin: 4px 0 0;
  color: var(--muted);
}

.top-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.icon-button {
  width: 46px;
  min-width: 46px;
  height: 46px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.main-nav {
  display: flex;
  gap: 10px;
  padding: 16px 24px 0;
  flex-wrap: wrap;
}

.nav-btn {
  border: 0;
  border-radius: 12px;
  padding: 12px 16px;
  font-weight: 700;
  cursor: pointer;
  background: #edf3f8;
  color: var(--ink);
}

.nav-btn.active {
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  color: #fff;
  outline: 2px solid #9ec9ec;
}

.page {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 24px;
  padding: 24px;
  align-items: start;
}

.side-panel {
  display: grid;
  gap: 16px;
}

.card {
  background: #fff;
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 10px 28px rgba(17, 24, 39, 0.06);
}

.card h2 {
  margin: 0 0 12px;
  font-size: 1.02rem;
}

.compact {
  padding: 16px;
}

.mode-buttons,
.credit-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.grand-total {
  font-size: 2rem;
  font-weight: 800;
  color: var(--accent);
}

.receipt-wrap {
  display: flex;
  justify-content: center;
}

.receipt {
  width: min(980px, 100%);
  background: var(--paper);
  border-radius: 28px;
  padding: 28px 30px 22px;
  box-shadow: 0 26px 60px rgba(17, 24, 39, 0.12);
}

.receipt-header {
  display: flex;
  gap: 18px;
  align-items: center;
  margin-bottom: 22px;
}

.logo {
  width: 96px;
  height: 96px;
  border-radius: 999px;
  object-fit: cover;
  border: 4px solid #f0f0f0;
  background: #fff;
}

.store-title-block h2 {
  margin: 0 0 6px;
  font-size: 1.45rem;
}

.store-title-block p {
  margin: 0;
  color: var(--muted);
}

.receipt-meta-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 18px;
  margin-bottom: 18px;
}

.receipt-meta-grid.single {
  grid-template-columns: 1fr;
}

.field-group {
  display: grid;
  gap: 8px;
}

.field-group label {
  font-weight: 800;
  letter-spacing: 0.04em;
  font-size: 0.92rem;
}

.field-box,
.field-group input,
.field-group select {
  min-height: 46px;
  border: 1px solid #d9e4ef;
  background: #eef5fb;
  border-radius: 12px;
  padding: 12px 14px;
}

.field-box {
  display: flex;
  align-items: center;
  font-weight: 600;
}

.table-scroll {
  overflow-x: auto;
}

.receipt-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.receipt-table th,
.receipt-table td {
  border: 1.6px solid var(--line);
  padding: 10px 10px;
  vertical-align: middle;
}

.receipt-table th {
  text-align: center;
  font-size: 0.95rem;
  background: #fff;
}

.receipt-table td:last-child,
.receipt-table th:last-child {
  border-color: transparent;
  background: transparent;
  width: 42px;
}

.receipt-table input {
  width: 100%;
  border: 0;
  outline: none;
  background: transparent;
  padding: 2px;
}

.receipt-table .qty-input {
  text-align: center;
}

.receipt-table .money-input {
  text-align: right;
}

.line-total {
  font-weight: 700;
  text-align: right;
}

.remove-row {
  border: 0;
  background: transparent;
  color: #a11d1d;
  font-weight: 700;
  cursor: pointer;
}

.add-row {
  margin-top: 8px;
}

.receipt-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-top: 22px;
  border-top: 1px dashed #cfd8df;
  padding-top: 18px;
}

.footer-label {
  color: var(--muted);
  margin-right: 8px;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

button {
  border: 0;
  border-radius: 12px;
  padding: 12px 16px;
  font-weight: 700;
  cursor: pointer;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  color: #fff;
}

button.secondary {
  background: #edf3f8;
  color: var(--ink);
}

button.ghost {
  background: transparent;
  color: var(--muted);
}

button.active {
  outline: 2px solid #9ec9ec;
}

.dialog-form {
  min-width: min(92vw, 420px);
  display: grid;
  gap: 14px;
}

.dialog-form h3 {
  margin: 0;
}

.dialog-form label {
  display: grid;
  gap: 6px;
  font-weight: 600;
}

.dialog-form input,
.dialog-form select {
  min-height: 44px;
  border-radius: 12px;
  border: 1px solid #d4dbe2;
  padding: 10px 12px;
}

menu {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 0;
  margin: 6px 0 0;
}

.stack-menu {
  flex-direction: column;
}

dialog {
  border: 0;
  border-radius: 20px;
  padding: 22px;
  box-shadow: 0 26px 60px rgba(17, 24, 39, 0.2);
}

dialog::backdrop {
  background: rgba(17, 24, 39, 0.42);
}

.view-panel {
  padding: 24px;
}

.view-card {
  background: #fff;
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 10px 28px rgba(17, 24, 39, 0.06);
  max-width: 1000px;
  margin: 0 auto;
}

@media (max-width: 980px) {
  .page {
    grid-template-columns: 1fr;
  }

  .receipt {
    padding: 22px 18px;
  }

  .receipt-meta-grid {
    grid-template-columns: 1fr;
  }

  .receipt-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .topbar {
    padding: 18px 18px;
  }

  .main-nav {
    padding: 14px 18px 0;
  }
}
