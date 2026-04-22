let deferredPrompt = null;

document.addEventListener("DOMContentLoaded", async () => {
  registrarSW();
  prepararInstalacao();
  restaurarTema();
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
  if(!installBtn) return;

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

function toggleAccordion(button){
  const item = button.closest(".accordion-item");
  item.classList.toggle("open");
}

function abrirSecao(id){
  const target = document.getElementById(id);
  if(!target) return;

  if(!target.classList.contains("open")){
    target.classList.add("open");
  }

  target.scrollIntoView({ behavior: "smooth", block: "start" });
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
        <button class="btn btn-secondary" onclick="lerTexto(${JSON.stringify(item.nome)})">Ouvir</button>
        <button class="btn btn-primary" onclick="verRespostaProtegida(${item.id}, 'estrutura')">Ver resposta</button>
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

  grid.innerHTML = "";

  data.forEach((item) => {
    const card = document.createElement("div");
    card.className = "item-card";
    card.innerHTML = `
      <h3>Questão ${item.id}</h3>
      <p>${item.pergunta}</p>

      <textarea placeholder="Escreva sua resposta..."></textarea>

      <div class="card-actions">
        <button class="btn btn-secondary" onclick="lerTexto(${JSON.stringify(item.pergunta)})">Ouvir</button>
        <button class="btn btn-primary" onclick="verRespostaProtegida(${item.id}, 'questao')">Ver resposta</button>
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
      limparViewer();
      return;
    }

    const urls = files.map(file => URL.createObjectURL(file));

    urls.forEach((url, index) => {
      const wrapper = document.createElement("div");
      wrapper.className = "preview-item";
      wrapper.innerHTML = `
        <img src="${url}" alt="Foto ${index + 1}">
      `;
      preview.appendChild(wrapper);
    });

    carregarFotosNoViewer(urls);
  }

  if(inputArquivos){
    inputArquivos.addEventListener("change", () => {
      processarArquivos(inputArquivos.files);
    });
  }

  if(inputCamera){
    inputCamera.addEventListener("change", () => {
      processarArquivos(inputCamera.files);
    });
  }
}
