let conectado = false;

document.getElementById("connectBtn").onclick = conectar;
document.getElementById("disconnectBtn").onclick = sair;

function conectar() {
  conectado = true;
  document.getElementById("connectBtn").classList.add("hidden");
  document.getElementById("disconnectBtn").classList.remove("hidden");
  alert("Logado!");
}

function sair() {
  conectado = false;
  document.getElementById("connectBtn").classList.remove("hidden");
  document.getElementById("disconnectBtn").classList.add("hidden");
}

document.getElementById("addRowBtn").onclick = () => {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input></td>
    <td><input></td>
    <td><input></td>
    <td>R$ 0</td>
    <td><button onclick="this.parentNode.parentNode.remove()">x</button></td>
  `;
  document.getElementById("itemsBody").appendChild(tr);
};

document.getElementById("submitSaleBtn").onclick = () => {
  if (!conectado) {
    alert("Faça login primeiro");
    return;
  }

  const pago = confirm("Foi pago?");
  if (!pago) {
    salvarFiado();
  } else {
    alert("Venda registrada");
  }
};

function salvarFiado() {
  alert("Fiado salvo!");
}

document.getElementById("navVenda").onclick = () => trocar("pageVenda");
document.getElementById("navRelatorio").onclick = () => trocar("pageRelatorio");
document.getElementById("navCaixa").onclick = () => trocar("pageCaixa");

function trocar(pagina) {
  document.querySelectorAll("section").forEach(s => s.classList.add("hidden"));
  document.getElementById(pagina).classList.remove("hidden");
}
