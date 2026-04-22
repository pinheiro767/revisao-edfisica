let deferredPrompt = null;

document.addEventListener("DOMContentLoaded", async () => {
  restaurarTema();
  prepararAbas();
  prepararInstalacao();
  registrarSW();
  await carregarEstruturas();
  await carregarQuestoes();
  prepararUploadFotos();
  if (window.lucide) lucide.createIcons();
});

function registrarSW(){
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
  }
}

function prepararInstalacao(){
  const installBtn = document.getElementById("installBtn");
  if(!installBtn) return;

  installBtn.style.display = "none";

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = "inline-flex";
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
  localStorage.setItem(
    "theme",
    document.body.classList.contains("light") ? "light" : "dark"
  );
}

function restaurarTema(){
  const t = localStorage.getItem("theme");
  if(t === "light"){
    document.body.classList.add("light");
  }
}

function prepararAbas(){
  const botoes = document.querySelectorAll(".tab-btn");
  const paineis = document.querySelectorAll(".tab-panel");

  botoes.forEach(btn => {
    btn.addEventListener("click", () => {
      const alvo = btn.dataset.tab;

      botoes.forEach(b => b.classList.remove("active"));
      paineis.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      document.getElementById(alvo).classList.add("active");

      if (window.lucide) lucide.createIcons();
    });
  });
}

async function carregarEstruturas(){
  const r = await fetch("/api/estruturas");
  const data = await r.json();
  const grid = document.getElementById("estruturasGrid");
  grid.innerHTML = "";

  data.forEach((item) => {
    const card = document.createElement("div");
    card.className = "item-card";
    card.innerHTML = `
      <h3>Estrutura ${item.id}</h3>
      <p><strong>${item.nome}</strong></p>
      <p class="small">${item.instrucao || "Observe a peça e registre sua identificação."}</p>

      <textarea placeholder="Anote o que você observou na peça..."></textarea>

      <label class="checkbox-row">
        <input type="checkbox" />
        Identifiquei esta estrutura
      </label>

      <div class="card-actions">
        <button class="btn btn-secondary" onclick="lerTexto(${JSON.stringify(item.nome)})">
          <i data-lucide="volume-2"></i>
          Ouvir
        </button>
        <button class="btn btn-primary" onclick="verRespostaProtegida(${item.id}, 'estrutura')">
          <i data-lucide="lock"></i>
          Ver resposta
        </button>
      </div>

      <div id="resp-estrutura-${item.id}" class="resposta" style="display:none"></div>
    `;
    grid.appendChild(card);
  });

  if (window.lucide) lucide.createIcons();
}

async function carregarQuestoes(){
  const r = await fetch("/api/questoes");
  const data = await r.json();
  const grid = document.getElementById("questoesGrid");
  grid.innerHTML = "";

  data.forEach((item) => {
    const card = document.createElement("div");
    card.className = "item-card";
    card.innerHTML = `
      <h3>Questão ${item.id}</h3>
      <p>${item.pergunta}</p>

      <textarea placeholder="Escreva sua resposta..."></textarea>

      <div class="card-actions">
        <button class="btn btn-secondary" onclick="lerTexto(${JSON.stringify(item.pergunta)})">
          <i data-lucide="volume-2"></i>
          Ouvir
        </button>
        <button class="btn btn-primary" onclick="verRespostaProtegida(${item.id}, 'questao')">
          <i data-lucide="lock"></i>
          Ver resposta
        </button>
      </div>

      <div id="resp-questao-${item.id}" class="resposta" style="display:none"></div>
    `;
    grid.appendChild(card);
  });

  if (window.lucide) lucide.createIcons();
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

function lerTexto(texto){
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = "pt-BR";
    utterance.rate = 0.95;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }
}

function gerarPDF(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Revisão de Anatomia Humana", 10, 14);
  doc.setFontSize(11);
  doc.text("Exportação simples do aplicativo.", 10, 24);

  doc.save("revisao-anatomia.pdf");
}

function prepararUploadFotos(){
  const inputArquivos = document.getElementById("fotoUpload");
  const inputCamera = document.getElementById("cameraInput");
  const preview = document.getElementById("previewFotos");

  function processarArquivos(fileList){
    const files = [...fileList].slice(0, 3);
    preview.innerHTML = "";

    if(files.length === 0){
      if (window.limparViewer) limparViewer();
      return;
    }

    const urls = files.map(file => URL.createObjectURL(file));

    urls.forEach((url, index) => {
      const wrapper = document.createElement("div");
      wrapper.className = "preview-item";
      wrapper.innerHTML = `<img src="${url}" alt="Foto ${index + 1}">`;
      preview.appendChild(wrapper);
    });

    if (window.carregarFotosNoViewer) {
      carregarFotosNoViewer(urls);
    }
  }

  if(inputArquivos){
    inputArquivos.addEventListener("change", () => processarArquivos(inputArquivos.files));
  }

  if(inputCamera){
    inputCamera.addEventListener("change", () => processarArquivos(inputCamera.files));
  }
}
