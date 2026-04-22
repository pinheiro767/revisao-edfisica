let scene, camera, renderer, group;
let viewerContainer;
let isDragging = false;
let lastX = 0;

function iniciarViewer3D(){
  viewerContainer = document.getElementById("viewer3d");
  if(!viewerContainer) return;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    60,
    viewerContainer.clientWidth / viewerContainer.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 4.5;

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio || 1);

  viewerContainer.innerHTML = "";
  viewerContainer.appendChild(renderer.domElement);

  group = new THREE.Group();
  scene.add(group);

  const light1 = new THREE.DirectionalLight(0xffffff, 1.1);
  light1.position.set(2, 2, 3);
  scene.add(light1);

  const light2 = new THREE.AmbientLight(0xffffff, 0.9);
  scene.add(light2);

  const fundo = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 8),
    new THREE.MeshBasicMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.35
    })
  );
  fundo.position.z = -2.8;
  scene.add(fundo);

  renderer.domElement.addEventListener("pointerdown", onPointerDown);
  renderer.domElement.addEventListener("pointermove", onPointerMove);
  renderer.domElement.addEventListener("pointerup", onPointerUp);
  renderer.domElement.addEventListener("pointerleave", onPointerUp);
  renderer.domElement.addEventListener("wheel", onWheel, { passive: false });

  animate();
  window.addEventListener("resize", onResize);
}

function onResize(){
  if(!viewerContainer || !camera || !renderer) return;
  camera.aspect = viewerContainer.clientWidth / viewerContainer.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);
}

function onPointerDown(e){
  isDragging = true;
  lastX = e.clientX;
}

function onPointerMove(e){
  if(!isDragging || !group) return;
  const delta = e.clientX - lastX;
  group.rotation.y += delta * 0.01;
  lastX = e.clientX;
}

function onPointerUp(){
  isDragging = false;
}

function onWheel(e){
  e.preventDefault();
  camera.position.z += e.deltaY * 0.002;
  camera.position.z = Math.min(Math.max(camera.position.z, 2.2), 8);
}

function limparViewer(){
  if(!group) return;
  while(group.children.length){
    const obj = group.children[0];
    if(obj.material && obj.material.map){
      obj.material.map.dispose();
    }
    if(obj.material) obj.material.dispose();
    if(obj.geometry) obj.geometry.dispose();
    group.remove(obj);
  }
}

function carregarFotosNoViewer(urls){
  limparViewer();

  if(!urls || urls.length === 0) return;

  const loader = new THREE.TextureLoader();
  const limited = urls.slice(0, 3);

  limited.forEach((url, index) => {
    loader.load(url, (texture) => {
      const ratio = texture.image.width / texture.image.height;
      const width = ratio >= 1 ? 2.2 : 1.6;
      const height = width / ratio;

      const geometry = new THREE.PlaneGeometry(width, height);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide
      });

      const plane = new THREE.Mesh(geometry, material);

      if(limited.length === 1){
        plane.position.set(0, 0, 0);
      } else if(limited.length === 2){
        plane.position.set(index === 0 ? -0.55 : 0.55, 0, index === 0 ? -0.35 : 0.35);
        plane.rotation.y = index === 0 ? 0.18 : -0.18;
      } else {
        const positions = [
          { x: -0.9, z: -0.5, ry: 0.24 },
          { x: 0, z: 0.1, ry: 0 },
          { x: 0.9, z: -0.5, ry: -0.24 }
        ];
        plane.position.set(positions[index].x, 0, positions[index].z);
        plane.rotation.y = positions[index].ry;
      }

      group.add(plane);
    });
  });
}

function animate(){
  requestAnimationFrame(animate);
  if(group && !isDragging){
    group.rotation.y += 0.0025;
  }
  if(renderer && scene && camera){
    renderer.render(scene, camera);
  }
}

document.addEventListener("DOMContentLoaded", iniciarViewer3D);
