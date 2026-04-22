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
    60,
    viewerContainer.clientWidth / viewerContainer.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 5);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio || 1);

  viewerContainer.innerHTML = "";
  viewerContainer.appendChild(renderer.domElement);

  group = new THREE.Group();
  scene.add(group);

  const ambient = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambient);

  const directional = new THREE.DirectionalLight(0xffffff, 1);
  directional.position.set(2, 2, 4);
  scene.add(directional);

  const fundo = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 10),
    new THREE.MeshBasicMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.45
    })
  );
  fundo.position.z = -4;
  scene.add(fundo);

  renderer.domElement.addEventListener("pointerdown", onPointerDown);
  renderer.domElement.addEventListener("pointermove", onPointerMove);
  renderer.domElement.addEventListener("pointerup", onPointerUp);
  renderer.domElement.addEventListener("pointerleave", onPointerUp);
  renderer.domElement.addEventListener("wheel", onWheel, { passive: false });

  animate();
  window.addEventListener("resize", onResize);
}

function onResize() {
  if (!viewerContainer || !camera || !renderer) return;
  camera.aspect = viewerContainer.clientWidth / viewerContainer.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);
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
  camera.position.z = Math.min(Math.max(camera.position.z, 2.5), 10);
}

function limparViewer() {
  if (!group) return;
  while (group.children.length) {
    const obj = group.children[0];
    if (obj.material && obj.material.map) obj.material.map.dispose();
    if (obj.material) obj.material.dispose();
    if (obj.geometry) obj.geometry.dispose();
    group.remove(obj);
  }
}

function carregarFotosNoViewer(urls) {
  limparViewer();

  if (!urls || urls.length === 0) return;

  const loader = new THREE.TextureLoader();
  const limited = urls.slice(0, 3);

  limited.forEach((url, index) => {
    loader.load(url, (texture) => {
      const imgWidth = texture.image.width;
      const imgHeight = texture.image.height;
      const ratio = imgWidth / imgHeight;

      let width = 2.4;
      let height = width / ratio;

      if (height > 3.2) {
        height = 3.2;
        width = height * ratio;
      }

      const geometry = new THREE.PlaneGeometry(width, height);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide
      });

      const plane = new THREE.Mesh(geometry, material);

      // CASO 1 FOTO
      if (limited.length === 1) {
        plane.position.set(0, 0, 0);
        plane.rotation.y = 0.45;   // inclinação visível
        plane.rotation.x = -0.08;
      }

      // CASO 2 FOTOS
      if (limited.length === 2) {
        const positions = [
          { x: -0.9, z: -0.6, ry: 0.35 },
          { x: 0.9, z: 0.4, ry: -0.35 }
        ];
        plane.position.set(
          positions[index].x,
          0,
          positions[index].z
        );
        plane.rotation.y = positions[index].ry;
      }

      // CASO 3 FOTOS
      if (limited.length === 3) {
        const positions = [
          { x: -1.2, z: -0.9, ry: 0.42 },
          { x: 0, z: 0.2, ry: 0 },
          { x: 1.2, z: -0.9, ry: -0.42 }
        ];
        plane.position.set(
          positions[index].x,
          0,
          positions[index].z
        );
        plane.rotation.y = positions[index].ry;
      }

      group.add(plane);
    });
  });

  group.rotation.y = 0;
  autoRotate = true;
}

function girarEsquerda() {
  if (!group) return;
  group.rotation.y -= 0.3;
}

function girarDireita() {
  if (!group) return;
  group.rotation.y += 0.3;
}

function alternarRotacao() {
  autoRotate = !autoRotate;
}

function animate() {
  requestAnimationFrame(animate);

  if (group && autoRotate && !isDragging) {
    group.rotation.y += 0.008; // mais perceptível
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

document.addEventListener("DOMContentLoaded", iniciarViewer3D);
