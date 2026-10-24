import * as THREE from 'three';
import { createCharacter, type CharacterKind, type CharacterRig } from './engine/character';
import './characterGallery.css';
import { playerVariant } from './engine/characterConfig';

document.querySelector('#gallery')!.innerHTML = `
  <header><a href="/">← Kembali ke Kota Sains</a><span>JELAJAH <b>SAINS</b></span><small>GALERI KARAKTER</small></header>
  <main>
    <div class="gallery-title"><div><p>KENALI PENJELAJAHMU</p><h1>Satu karakter. Tiga sudut pandang.</h1></div>
    <label>Karakter<select id="gallery-character"><option value="explorer">Siswa penjelajah</option><option value="explorerGirl">Siswi penjelajah</option><option value="nara">Bu Nara</option><option value="wira">Pak Wira</option><option value="sari">Bu Sari</option><option value="damar">Pak Damar</option><option value="lestari">Kak Lestari</option><option value="bima">Kak Bima</option></select></label></div>
    <p class="gallery-description">Periksa bentuk kepala, wajah, rambut, pakaian, dan ransel dari setiap sisi.</p>
    <section id="model-stage" aria-label="Model karakter dari depan, samping, dan belakang"><canvas id="model-canvas"></canvas>
      <div class="view-labels"><span>DEPAN</span><span>SAMPING</span><span>BELAKANG</span></div>
    </section>
    <div class="gallery-footer"><span>Pose diam · model 3D yang sama pada ketiga tampilan</span><button id="gallery-detail" aria-pressed="false">Lihat wajah & rambut</button></div>
    <p class="gallery-note">Gunakan tombol untuk berganti antara tampilan seluruh tubuh dan detail wajah. Galeri tidak mengubah progres penyelidikan.</p>
  </main>`;

document.querySelector<HTMLAnchorElement>('header a')!.href='/'+location.search;
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
  // The same neutral factory pose and uniform scale as gameplay.
  scene.add(rig.root); selector.value=kind; canvas.dataset.character = kind;
}
try {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1;
  selectCharacter(playerVariant(new URLSearchParams(location.search).get('avatar')));
  function draw() {
    const width = stage.clientWidth, height = stage.clientHeight;
    renderer.setSize(width, height, false); renderer.setScissorTest(true);
    const column = width / 3;
    const compare = new URLSearchParams(location.search).get('framing')==='compare';
    const halfHeight = compare&&!detail ? Math.max(1.72,.88/(column/height)) : Math.max(detail?rig.dimensions.headHeight*.85:rig.dimensions.height*.58,(detail?.30:.56)/(column/height));
    const center = compare&&!detail ? 1.48 : detail ? rig.dimensions.headCenter : rig.dimensions.groundY+rig.dimensions.height/2;
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
    document.querySelector('.gallery-footer > span')!.textContent=`Pose netral · tinggi ${rig.dimensions.height.toFixed(2)} unit · skala ${rig.dimensions.scale.toFixed(4)} · model permainan yang sama`;
    canvas.dataset.height=rig.dimensions.height.toFixed(3);canvas.dataset.scale=rig.visual.scale.y.toFixed(6);
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
