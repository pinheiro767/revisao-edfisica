let scene, camera, renderer, group;
let viewerContainer;
let isDragging = false;
let lastX = 0;
let autoRotate = true;

function iniciarViewer3D() {
  viewerContainer = document.getElementById("viewer3d");
  if (!viewerContainer) return;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    55,
    viewerContainer.clientWidth / viewerContainer.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 6);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });

  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);

  viewerContainer.innerHTML = "";
  viewerContainer.appendChild(renderer.domElement);

  group = new THREE.Group();
  scene.add(group);

  const ambient = new THREE.AmbientLight(0xffffff, 1.15);
  scene.add(ambient);

  const directional = new THREE.DirectionalLight(0xffffff, 1);
  directional.position.set(3, 2, 5);
  scene.add(directional);

  const bgPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 12),
    new THREE.MeshBasicMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.4
    })
  );
  bgPlane.position.z = -5;
  scene.add(bgPlane);

  renderer.domElement.addEventListener("pointerdown", onPointerDown);
  renderer.domElement.addEventListener("pointermove", onPointerMove);
  renderer.domElement.addEventListener("pointerup", onPointerUp);
  renderer.domElement.addEventListener("pointerleave", onPointerUp);
  renderer.domElement.addEventListener("wheel", onWheel, { passive: false });

  window.addEventListener("resize", onResize);

  animate();
}

function onResize() {
  if (!viewerContainer || !camera || !renderer) return;

  const width = viewerContainer.clientWidth;
  const height = viewerContainer.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function onPointerDown(e) {
  isDragging = true;
  lastX = e.clientX;
  autoRotate = false;
}

function onPointerMove(e) {
  if (!isDragging || !group) return;

  const delta = e.clientX - lastX;
  group.rotation.y += delta * 0.01;
  lastX = e.clientX;
}

function onPointerUp() {
  isDragging = false;
}

function onWheel(e) {
  e.preventDefault();

  camera.position.z += e.deltaY * 0.003;
  if (camera.position.z < 3) camera.position.z = 3;
  if (camera.position.z > 10) camera.position.z = 10;
}

function limparViewer() {
  if (!group) return;

  while (group.children.length > 0) {
    const obj = group.children[0];

    if (obj.material) {
      if (obj.material.map) obj.material.map.dispose();
      obj.material.dispose();
    }

    if (obj.geometry) obj.geometry.dispose();

    group.remove(obj);
  }
}

function carregarFotosNoViewer(urls) {
  limparViewer();

  if (!urls || urls.length === 0) return;

  const loader = new THREE.TextureLoader();
  const imagens = urls.slice(0, 3);

  imagens.forEach((url, index) => {
    loader.load(
      url,
      (texture) => {
        const imgW = texture.image.width;
        const imgH = texture.image.height;

        const ratio = imgW / imgH;

        // mantém proporção real da imagem
        let width = 2.6;
        let height = width / ratio;

        // evita imagem alta/larga demais
        if (height > 3.4) {
          height = 3.4;
          width = height * ratio;
        }

        if (width > 4.2) {
          width = 4.2;
          height = width / ratio;
        }

        const geometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          side: THREE.DoubleSide
        });

        const plane = new THREE.Mesh(geometry, material);

        // 1 imagem
        if (imagens.length === 1) {
          plane.position.set(0, 0, 0);
          plane.rotation.y = 0.55;
          plane.rotation.x = -0.05;
        }

        // 2 imagens
        if (imagens.length === 2) {
          const config = [
            { x: -1.0, z: -0.7, ry: 0.42 },
            { x: 1.0, z: 0.5, ry: -0.42 }
          ];
          plane.position.set(config[index].x, 0, config[index].z);
          plane.rotation.y = config[index].ry;
        }

        // 3 imagens
        if (imagens.length === 3) {
          const config = [
            { x: -1.3, z: -1.0, ry: 0.48 },
            { x: 0, z: 0.25, ry: 0.0 },
            { x: 1.3, z: -1.0, ry: -0.48 }
          ];
          plane.position.set(config[index].x, 0, config[index].z);
          plane.rotation.y = config[index].ry;
        }

        group.add(plane);

        // força visual inicial mais clara
        group.rotation.y = 0.2;
        autoRotate = true;
      },
      undefined,
      (error) => {
        console.error("Erro ao carregar textura:", error);
      }
    );
  });
}

function girarEsquerda() {
  if (!group) return;
  group.rotation.y -= 0.35;
}

function girarDireita() {
  if (!group) return;
  group.rotation.y += 0.35;
}

function alternarRotacao() {
  autoRotate = !autoRotate;
}

function animate() {
  requestAnimationFrame(animate);

  if (group && autoRotate && !isDragging) {
    group.rotation.y += 0.01;
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

document.addEventListener("DOMContentLoaded", iniciarViewer3D);
