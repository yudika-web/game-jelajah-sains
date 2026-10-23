import * as THREE from 'three';
import { createCharacter, type CharacterKind, type CharacterRig } from './engine/character';
import './characterGallery.css';

document.querySelector('#gallery')!.innerHTML = `
  <header><a href="/">← Kembali ke Kota Sains</a><span>JELAJAH <b>SAINS</b></span><small>GALERI KARAKTER</small></header>
  <main>
    <div class="gallery-title"><div><p>KENALI PENJELAJAHMU</p><h1>Satu karakter. Tiga sudut pandang.</h1></div>
    <label>Karakter<select id="gallery-character"><option value="explorer">Penjelajah muda</option><option value="nara">Bu Nara</option><option value="wira">Pak Wira</option></select></label></div>
    <p class="gallery-description">Periksa bentuk kepala, wajah, rambut, pakaian, dan ransel dari setiap sisi.</p>
    <section id="model-stage" aria-label="Model karakter dari depan, samping, dan belakang"><canvas id="model-canvas"></canvas>
      <div class="view-labels"><span>DEPAN</span><span>SAMPING</span><span>BELAKANG</span></div>
    </section>
    <div class="gallery-footer"><span>Pose diam · model 3D yang sama pada ketiga tampilan</span><button id="gallery-detail" aria-pressed="false">Lihat wajah & rambut</button></div>
    <p class="gallery-note">Gunakan tombol untuk berganti antara tampilan seluruh tubuh dan detail wajah. Galeri tidak mengubah progres penyelidikan.</p>
  </main>`;

const canvas = document.querySelector<HTMLCanvasElement>('#model-canvas')!;
const stage = document.querySelector<HTMLElement>('#model-stage')!;
const detailButton = document.querySelector<HTMLButtonElement>('#gallery-detail')!;
const selector = document.querySelector<HTMLSelectElement>('#gallery-character')!;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#faf7ef');
scene.add(new THREE.HemisphereLight('#fffaf0', '#b7a996', 2));
const key = new THREE.DirectionalLight('#fff4df', 2.7); key.position.set(-3, 6, 5); scene.add(key);
const fill = new THREE.DirectionalLight('#dcebf5', .7); fill.position.set(5, 3, -3); scene.add(fill);
const cameras = [0, Math.PI / 2, Math.PI].map(yaw => {
  const c = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 30);
  c.position.set(Math.sin(yaw) * 9, 1.5, Math.cos(yaw) * 9);
  return c;
});
let rig: CharacterRig, detail = false;
function selectCharacter(kind: CharacterKind) {
  if (rig) {
    scene.remove(rig.root);
    rig.root.traverse(child => { if (child instanceof THREE.Mesh && !child.userData.sharedGeometry) child.geometry.dispose(); });
  }
  rig = createCharacter(kind);
  // Anatomical rest pose, without the animator or movement state changing the silhouette.
  rig.leftArm.shoulder.rotation.z = -.10; rig.rightArm.shoulder.rotation.z = .10;
  rig.leftArm.elbow.rotation.x = rig.rightArm.elbow.rotation.x = -.13;
  rig.leftLeg.hip.rotation.x = rig.rightLeg.hip.rotation.x = -.025;
  rig.leftLeg.knee.rotation.x = rig.rightLeg.knee.rotation.x = .055;
  rig.leftLeg.ankle.rotation.x = rig.rightLeg.ankle.rotation.x = -.03;
  scene.add(rig.root); canvas.dataset.character = kind;
}
try {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1;
  selectCharacter('explorer');
  function draw() {
    const width = stage.clientWidth, height = stage.clientHeight;
    renderer.setSize(width, height, false); renderer.setScissorTest(true);
    const column = width / 3;
    const halfHeight = Math.max(detail ? .76 : 1.72, (detail ? .68 : .88) / (column / height));
    const center = detail ? 2.30 : 1.48;
    for (let i = 0; i < 3; i++) {
      const camera = cameras[i]; const yaw = i * Math.PI / 2;
      const aspect = column / height;
      camera.left = -halfHeight * aspect; camera.right = halfHeight * aspect;
      camera.top = halfHeight; camera.bottom = -halfHeight;
      camera.position.set(Math.sin(yaw) * 9, center + .14, Math.cos(yaw) * 9);
      camera.lookAt(0, center, 0); camera.updateProjectionMatrix();
      renderer.setViewport(i * column, 0, column, height); renderer.setScissor(i * column, 0, column, height);
      renderer.render(scene, camera);
    }
    canvas.dataset.ready = 'true'; canvas.dataset.detail = String(detail);
  }
  selector.onchange = () => { selectCharacter(selector.value as CharacterKind); draw(); };
  detailButton.onclick = () => {
    detail = !detail; detailButton.setAttribute('aria-pressed', String(detail));
    detailButton.textContent = detail ? 'Lihat seluruh tubuh' : 'Lihat wajah & rambut'; draw();
  };
  new ResizeObserver(draw).observe(stage);
  draw();
} catch {
  stage.innerHTML = '<p class="gallery-error">Galeri 3D memerlukan WebGL 2. Aktifkan akselerasi grafis atau coba browser lain. Progres permainan tetap tersimpan.</p>';
}
