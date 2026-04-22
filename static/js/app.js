let deferredPrompt = null;

document.addEventListener("DOMContentLoaded", async () => {
  registrarSW();
  prepararInstalacao();
  await carregarEstruturas();
  await carregarQuestoes();
  prepararUploadFotos();
});

function registrarSW(){
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
  }
}

function prepararInstalacao(){
  const installBtn = document.getElementById("installBtn");
  installBtn.style.display = "none";

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = "inline-block";
  });

  installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.style.display = "none";
  });
}

function toggleTheme(){
  document.body.classList.toggle("light");
  localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark");
}

(function restaurarTema(){
  const t = localStorage.getItem("theme");
  if(t === "light") document.body.classList.add("light");
})();

async function carregarEstruturas(){
  const r = await fetch("/api/estruturas");
  const data = await r.json();
  const grid = document.getElementById("estruturasGrid");

  data.forEach((item) => {
    const card = document.createElement("div");
    card.className = "item-card";
    card.innerHTML = `
      <h3>Estrutura ${item.id}</h3>
      <p><strong>${item.nome}</strong></p>
      <p class="small">${item.instrucao || ""}</p>
      <button onclick="lerTexto(${JSON.stringify(item.nome)})">Ouvir</button>
      <textarea placeholder="Anote o que você observou na peça..."></textarea>
      <label class="small"><input type="checkbox" /> Identifiquei esta estrutura</label>
      <div style="margin-top:10px">
        <button onclick="verRespostaProtegida(${item.id}, 'estrutura')">Ver resposta</button>
      </div>
      <div id="resp-estrutura-${item.id}" class="resposta" style="display:none"></div>
    `;
    grid.appendChild(card);
  });
}

async function carregarQuestoes(){
  const r = await fetch("/api/questoes");
  const data = await r.json();
  const grid = document.getElementById("questoesGrid");

  data.forEach((item) => {
    const card = document.createElement("div");
    card.className = "item-card";
    card.innerHTML = `
      <h3>Questão ${item.id}</h3>
      <p>${item.pergunta}</p>
      <button onclick="lerTexto(${JSON.stringify(item.pergunta)})">Ouvir</button>
      <textarea placeholder="Escreva sua resposta..."></textarea>
      <div style="margin-top:10px">
        <button onclick="verRespostaProtegida(${item.id}, 'questao')">Ver resposta</button>
      </div>
      <div id="resp-questao-${item.id}" class="resposta" style="display:none"></div>
    `;
    grid.appendChild(card);
  });
}

async function verRespostaProtegida(id, tipo){
  const senha = prompt("Digite a senha da professora:");
  if (senha !== "Pinheiro") {
    alert("Senha incorreta.");
    return;
  }

  if(tipo === "questao"){
    const r = await fetch("/api/questoes");
    const data = await r.json();
    const item = data.find(x => x.id === id);
    const alvo = document.getElementById(`resp-questao-${id}`);
    alvo.style.display = "block";
    alvo.innerHTML = `<strong>Resposta esperada:</strong> ${item.resposta}`;
  } else {
    const r = await fetch("/api/estruturas");
    const data = await r.json();
    const item = data.find(x => x.id === id);
    const alvo = document.getElementById(`resp-estrutura-${id}`);
    alvo.style.display = "block";
    alvo.innerHTML = `<strong>Resposta esperada:</strong> ${item.resposta}`;
  }
}

function gerarPDF(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Revisão de Anatomia Humana", 10, 10);
  doc.text("Anotações do aluno exportadas pelo aplicativo.", 10, 20);
  doc.save("revisao-anatomia.pdf");
}

function prepararUploadFotos(){
  const input = document.getElementById("fotoUpload");
  const preview = document.getElementById("previewFotos");

  input.addEventListener("change", () => {
    preview.innerHTML = "";
    [...input.files].slice(0,3).forEach(file => {
      const url = URL.createObjectURL(file);
      const img = document.createElement("img");
      img.src = url;
      preview.appendChild(img);
    });
  });
}

function abrirCamera(){
  alert("No celular, toque em 'escolher arquivo' e selecione câmera, se o navegador permitir.");
}