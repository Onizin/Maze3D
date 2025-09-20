
import * as THREE from 'three';
// Tidak perlu loader karakter

const app = document.querySelector('#app');
app.innerHTML = '';

const loadingDiv = document.createElement('div');
loadingDiv.id = 'loading';
loadingDiv.textContent = 'Loading Three.js...';
document.body.appendChild(loadingDiv);

// Hilangkan scroll dan margin pada body & html
document.documentElement.style.height = '100%';
document.body.style.height = '100%';
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';

const WORLD_SIZE = 300;

// Maze layout (1 = wall, 0 = path)
const MAZE_SIZE = 15;
const CELL_SIZE = WORLD_SIZE / MAZE_SIZE;
const maze = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
  [1,0,1,0,1,0,1,1,1,0,1,0,1,0,1],
  [1,0,1,0,0,0,0,1,0,0,1,0,1,0,1],
  [1,0,1,1,1,1,0,1,1,1,1,0,1,0,1],
  [1,0,0,0,0,1,0,0,0,0,0,0,1,0,1],
  [1,0,1,1,0,1,1,1,1,1,1,0,1,0,1],
  [1,0,0,1,0,0,0,0,0,0,1,0,0,0,1],
  [1,0,1,1,1,1,1,1,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,1,0,1],
  [1,0,1,1,1,1,0,1,1,1,1,0,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,0,1,1,0,1,1,1,1,0,1,1,1,0,1],
  [1,0,0,1,0,0,0,0,1,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

function initScene() {
    // Scene setup
    const scene = new THREE.Scene();
    // Langit biru cerah seperti siang hari
    scene.background = new THREE.Color(0x87ceeb); // sky blue

    // Tambahkan tembok hitam di keempat sisi dunia
    const textureLoader = new THREE.TextureLoader();
    const bricksTexture = textureLoader.load('/assets/terrain/bricks.jpg');
    bricksTexture.wrapS = THREE.RepeatWrapping;
    bricksTexture.wrapT = THREE.RepeatWrapping;
    bricksTexture.repeat.set(20, 1); // Lebih besar, gambar brick tidak terlalu kecil

    const wallMaterial = new THREE.MeshLambertMaterial({ map: bricksTexture });
    const wallThickness = 2;
    const wallHeight = 10;
    // Wall depan
    const wallFront = new THREE.Mesh(
      new THREE.BoxGeometry(WORLD_SIZE, wallHeight, wallThickness), wallMaterial);
    wallFront.position.set(0, wallHeight/2, -WORLD_SIZE/2);
    scene.add(wallFront);
    // Wall belakang
    const wallBack = new THREE.Mesh(
      new THREE.BoxGeometry(WORLD_SIZE, wallHeight, wallThickness), wallMaterial);
    wallBack.position.set(0, wallHeight/2, WORLD_SIZE/2);
    scene.add(wallBack);
    // Wall kiri
    const wallLeft = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, wallHeight, WORLD_SIZE), wallMaterial);
    wallLeft.position.set(-WORLD_SIZE/2, wallHeight/2, 0);
    scene.add(wallLeft);
    // Wall kanan
    const wallRight = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, wallHeight, WORLD_SIZE), wallMaterial);
    wallRight.position.set(WORLD_SIZE/2, wallHeight/2, 0);
    scene.add(wallRight);


    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 5);

    // Renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    loadingDiv.style.display = 'none';

    // Ground dengan tekstur terrain grass1-albedo-512, diperlebar 3x
    const groundGeometry = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE);
    const grassTexture = textureLoader.load('/assets/terrain/grass1-albedo-512.jpg');
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(60, 60);
    const groundMaterial = new THREE.MeshLambertMaterial({ map: grassTexture });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // Lighting (siang hari)
    // Ambient light terang
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    // Directional light sebagai matahari, warna sedikit kekuningan
    const sunLight = new THREE.DirectionalLight(0xfff2b0, 1.1);
    sunLight.position.set(60, 120, 40); // tinggi dan miring seperti matahari siang
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 300;
    sunLight.shadow.camera.left = -150;
    sunLight.shadow.camera.right = 150;
    sunLight.shadow.camera.top = 150;
    sunLight.shadow.camera.bottom = -150;
    scene.add(sunLight);

    // First person: tidak ada karakter, kamera langsung dikontrol

    // ...kode pohon dihapus sementara...

    // First person camera controls
    let yaw = 0; // rotasi pada sumbu Y (horizontal)
    let isRightMouseDown = false;
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('mousedown', (event) => {
      if (event.button === 2) {
        isRightMouseDown = true;
        document.body.style.cursor = 'none';
      }
    });
    document.addEventListener('mouseup', (event) => {
      if (event.button === 2) {
        isRightMouseDown = false;
        document.body.style.cursor = 'auto';
      }
    });
    document.addEventListener('mousemove', (event) => {
      if (isRightMouseDown) {
        // Pergerakan mouse kanan/kiri mengubah yaw (rotasi sumbu Y)
        yaw -= event.movementX * 0.002;
        // Tidak ada pitch, hanya yaw
      }
    });

    // First person movement
    const keys = {};
    document.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
    document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

    let cameraPosition = new THREE.Vector3(0, 2, 0);

    // Jump variables
    let velocityY = 0;
    let isJumping = false;
    const GRAVITY = -0.015;
    const JUMP_STRENGTH = 0.32;
    const GROUND_Y = 2; // ketinggian kamera di atas tanah

    // Tambahkan canvas minimap di pojok kanan atas
    const minimapSize = 180;
    const minimapCanvas = document.createElement('canvas');
    minimapCanvas.width = minimapSize;
    minimapCanvas.height = minimapSize;
    minimapCanvas.style.position = 'fixed';
    minimapCanvas.style.top = '16px';
    minimapCanvas.style.right = '16px';
    minimapCanvas.style.background = 'rgba(255,255,255,0.8)';
    minimapCanvas.style.border = '2px solid #333';
    minimapCanvas.style.zIndex = '100';
    document.body.appendChild(minimapCanvas);
    const minimapCtx = minimapCanvas.getContext('2d');

    // Data portofolio: sinkron dengan index.html
    const portfolioItems = [
      { name: 'Tentang Saya', desc: 'Full Stack Developer & Deep Learning Developer. Membuat solusi digital inovatif dengan teknologi terkini.', i: 1, j: 1, type: 'box' },
      { name: 'Skill', desc: 'HTML5, CSS3, JavaScript, Laravel, PHP, MySQL, REST API, Python, TensorFlow, OpenCV, CNN, Git, Terminal.', i: 3, j: 4, type: 'box' },
      { name: 'Saku Note', desc: 'Aplikasi manajemen keuangan untuk pencatatan pengeluaran dan pemasukan, analisis, dan laporan bulanan.', i: 7, j: 2, type: 'sphere', project: 'saku-note' },
      { name: 'Chatbot Kanzoo Interior', desc: 'AI-powered chatbot untuk konsultasi desain interior dan layanan pelanggan.', i: 11, j: 5, type: 'sphere', project: 'chatbot-kanzoo' },
      { name: 'Kontak', desc: 'Email: wold.rapi@gmail.com | LinkedIn: wahyu-ismaya-cipta-mahardhika | Surabaya, Indonesia.', i: 13, j: 12, type: 'box' }
    ];

    // Tambahkan portofolio items di dunia 3D
    const portfolioMeshes = [];
    const boxSize = CELL_SIZE * 0.7;
    const sphereRadius = CELL_SIZE * 0.18; // Ukuran bola basket, lebih kecil
    portfolioItems.forEach(item => {
        const x = -WORLD_SIZE/2 + CELL_SIZE/2 + item.j * CELL_SIZE;
        const z = -WORLD_SIZE/2 + CELL_SIZE/2 + item.i * CELL_SIZE;
        let mesh;
        if (item.type === 'box') {
            // Box dengan teks di depan & belakang
            function createPortfolioCanvas(item) {
                const canvas = document.createElement('canvas');
                canvas.width = 256;
                canvas.height = 256;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#2a7';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 22px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';
                ctx.fillText(item.name, 128, 32);
                ctx.font = '16px Arial';
                ctx.textBaseline = 'top';
                ctx.fillText(item.desc, 128, 70, 220);
                return new THREE.CanvasTexture(canvas);
            }
            const frontTexture = createPortfolioCanvas(item);
            const backTexture = createPortfolioCanvas(item);
            const boxGeometry = new THREE.BoxGeometry(boxSize, boxSize * 0.6, boxSize * 0.1);
            const boxMaterial = [
                new THREE.MeshStandardMaterial({ color: 0x2a7 }), // right
                new THREE.MeshStandardMaterial({ color: 0x2a7 }), // left
                new THREE.MeshStandardMaterial({ color: 0x2a7 }), // top
                new THREE.MeshStandardMaterial({ color: 0x2a7 }), // bottom
                new THREE.MeshStandardMaterial({ map: frontTexture }), // front
                new THREE.MeshStandardMaterial({ map: backTexture })  // back
            ];
            mesh = new THREE.Mesh(boxGeometry, boxMaterial);
            mesh.position.set(x, 2.5, z);
        } else if (item.type === 'sphere') {
            // Bola untuk project, warna berbeda
            const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 24, 24);
            const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x2196f3, emissive: 0x113366, emissiveIntensity: 0.7 });
            mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
            mesh.position.set(x, 2.5, z);
        }
        mesh.castShadow = true;
        mesh.userData = { ...item };
        scene.add(mesh);
        portfolioMeshes.push(mesh);
    });

    // --- Tambahkan awan di langit ---
    const cloudGroup = new THREE.Group();
    const cloudColor = 0xfafaff; // putih kebiruan, cocok untuk langit siang
    const cloudMaterial = new THREE.MeshLambertMaterial({ color: cloudColor, transparent: true, opacity: 0.82 });

    function createCloud(x, y, z, scaleX, scaleY, scaleZ) {
        const cloud = new THREE.Mesh(
            new THREE.SphereGeometry(1, 16, 12),
            cloudMaterial.clone()
        );
        cloud.position.set(x, y, z);
        cloud.scale.set(scaleX, scaleY, scaleZ);
        cloud.castShadow = false;
        cloud.receiveShadow = false;
        return cloud;
    }

    // Buat beberapa awan dengan posisi dan ukuran acak di atas maze
    for (let i = 0; i < 7; i++) {
        const x = Math.random() * WORLD_SIZE - WORLD_SIZE/2;
        const z = Math.random() * WORLD_SIZE - WORLD_SIZE/2;
        const y = wallHeight + 18 + Math.random() * 8; // di atas tembok
        const scaleX = 5 + Math.random() * 4;
        const scaleY = 2.2 + Math.random() * 1.2;
        const scaleZ = 2.8 + Math.random() * 2.2;
        const cloud = createCloud(x, y, z, scaleX, scaleY, scaleZ);
        cloud.userData = {
            speed: 0.04 + Math.random() * 0.03,
            dir: Math.random() > 0.5 ? 1 : -1
        };
        cloudGroup.add(cloud);
    }
    scene.add(cloudGroup);

    // Popup 3D project (canvas overlay)
    const popupDiv = document.createElement('div');
    popupDiv.style.position = 'fixed';
    popupDiv.style.left = '50%';
    popupDiv.style.top = '50%';
    popupDiv.style.transform = 'translate(-50%, -50%)';
    popupDiv.style.background = 'rgba(255,255,255,0.98)';
    popupDiv.style.border = '3px solid #2196f3';
    popupDiv.style.borderRadius = '16px';
    popupDiv.style.boxShadow = '0 8px 32px rgba(0,0,0,0.18)';
    popupDiv.style.padding = '32px 32px 24px 32px';
    popupDiv.style.zIndex = '999';
    popupDiv.style.display = 'none';
    popupDiv.style.minWidth = '340px';
    popupDiv.style.maxWidth = '90vw';
    popupDiv.style.maxHeight = '80vh';
    popupDiv.style.overflowY = 'auto';
    document.body.appendChild(popupDiv);

    function showProjectPopup(project) {
        let html = '';
        if (project === 'saku-note') {
            html = `
                <h2 style="color:#2196f3;margin-bottom:8px;">Saku Note</h2>
                <p style="font-size:17px;">Aplikasi manajemen keuangan untuk pencatatan pengeluaran dan pemasukan, analisis, dan laporan bulanan.</p>
            
                <ul style="margin:12px 0 0 0;padding-left:18px;">
                    <li>Laravel, PHP, MySQL, Bootstrap, Chart.js</li>
                    <li>Dashboard transaksi, analisis, laporan PDF</li>
                </ul>
                <a href="https://github.com/Onizin/SakuNote" target="_blank" style="display:inline-block;margin-top:16px;color:#fff;background:#2196f3;padding:8px 18px;border-radius:6px;text-decoration:none;font-weight:bold;">
                    <i class="fab fa-github"></i> View on GitHub
                </a>
                <button id="closePopupBtn" style="float:right;margin-top:-8px;font-size:22px;background:none;border:none;color:#2196f3;cursor:pointer;">&times;</button>
            `;
        } else if (project === 'chatbot-kanzoo') {
            html = `
                <h2 style="color:#2196f3;margin-bottom:8px;">Chatbot Kanzoo Interior</h2>
                <p style="font-size:17px;">AI-powered chatbot untuk konsultasi desain interior dan layanan pelanggan.</p>
                
                <ul style="margin:12px 0 0 0;padding-left:18px;">
                    <li>Python, TensorFlow, NLP, Flask</li>
                    <li>Natural language understanding, product info, learning capability</li>
                </ul>
                <a href="https://github.com/Onizin/Chatbot-Neural-Network" target="_blank" style="display:inline-block;margin-top:16px;color:#fff;background:#2196f3;padding:8px 18px;border-radius:6px;text-decoration:none;font-weight:bold;">
                    <i class="fab fa-github"></i> View on GitHub
                </a>
                <button id="closePopupBtn" style="float:right;margin-top:-8px;font-size:22px;background:none;border:none;color:#2196f3;cursor:pointer;">&times;</button>
            `;
        }
        popupDiv.innerHTML = html;
        popupDiv.style.display = 'block';
        document.getElementById('closePopupBtn').onclick = () => popupDiv.style.display = 'none';
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') popupDiv.style.display = 'none';
    });

    // Tooltip portofolio di dunia 3D (bukan minimap)
    const worldTooltipDiv = document.createElement('div');
    worldTooltipDiv.style.position = 'fixed';
    worldTooltipDiv.style.background = '#fff';
    worldTooltipDiv.style.border = '1px solid #333';
    worldTooltipDiv.style.padding = '8px 16px';
    worldTooltipDiv.style.borderRadius = '8px';
    worldTooltipDiv.style.fontSize = '16px';
    worldTooltipDiv.style.pointerEvents = 'none';
    worldTooltipDiv.style.zIndex = '102';
    worldTooltipDiv.style.display = 'none';
    document.body.appendChild(worldTooltipDiv);

    function drawMinimap(playerX, playerZ, playerYaw) {
        // Bersihkan canvas
        minimapCtx.clearRect(0, 0, minimapSize, minimapSize);

        // Skala maze ke minimap
        const padding = 10;
        const cellPx = (minimapSize - 2 * padding) / MAZE_SIZE;

        // Gambar maze
        minimapCtx.save();
        minimapCtx.translate(padding, padding);
        for (let i = 0; i < MAZE_SIZE; i++) {
            for (let j = 0; j < MAZE_SIZE; j++) {
                if (maze[i][j] === 1) {
                    minimapCtx.fillStyle = '#444';
                    minimapCtx.fillRect(j * cellPx, i * cellPx, cellPx, cellPx);
                }
            }
        }

        // Gambar player
        // Konversi world position ke maze grid
        const mazeX = ((playerX + WORLD_SIZE/2) / CELL_SIZE);
        const mazeZ = ((playerZ + WORLD_SIZE/2) / CELL_SIZE);

        minimapCtx.save();
        minimapCtx.translate(mazeX * cellPx, mazeZ * cellPx);
        // Gambar lingkaran player
        minimapCtx.beginPath();
        minimapCtx.arc(0, 0, cellPx * 0.35, 0, 2 * Math.PI);
        minimapCtx.fillStyle = '#e22';
        minimapCtx.fill();
        minimapCtx.restore();

        // Gambar titik portofolio
        portfolioItems.forEach(item => {
            minimapCtx.save();
            minimapCtx.beginPath();
            minimapCtx.arc(item.j * cellPx + cellPx/2, item.i * cellPx + cellPx/2, cellPx * 0.22, 0, 2 * Math.PI);
            minimapCtx.fillStyle = '#2a7'; // warna hijau untuk portofolio
            minimapCtx.fill();
            minimapCtx.restore();
        });

        minimapCtx.restore();
    }

    // Tooltip portofolio di minimap
    const tooltipDiv = document.createElement('div');
    tooltipDiv.style.position = 'fixed';
    tooltipDiv.style.background = '#fff';
    tooltipDiv.style.border = '1px solid #333';
    tooltipDiv.style.padding = '6px 12px';
    tooltipDiv.style.borderRadius = '6px';
    tooltipDiv.style.fontSize = '14px';
    tooltipDiv.style.pointerEvents = 'none';
    tooltipDiv.style.zIndex = '101';
    tooltipDiv.style.display = 'none';
    document.body.appendChild(tooltipDiv);

    minimapCanvas.addEventListener('mousemove', function(e) {
        const rect = minimapCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const padding = 10;
        const cellPx = (minimapSize - 2 * padding) / MAZE_SIZE;
        let found = null;
        portfolioItems.forEach(item => {
            const px = padding + item.j * cellPx + cellPx/2;
            const py = padding + item.i * cellPx + cellPx/2;
            const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
            if (dist < cellPx * 0.25) found = item;
        });
        if (found) {
            tooltipDiv.textContent = found.name + ': ' + found.desc;
            tooltipDiv.style.left = (e.clientX + 12) + 'px';
            tooltipDiv.style.top = (e.clientY + 12) + 'px';
            tooltipDiv.style.display = 'block';
        } else {
            tooltipDiv.style.display = 'none';
        }
    });

    // Animation loop
    function animate() {
      // Movement logic
      let moveSpeed = 0.2;
      if (keys['shift']) moveSpeed = 0.45; // Sprint jika shift ditekan

      let forward = 0, right = 0;
      if (keys['w']) forward += 1;
      if (keys['s']) forward -= 1;
      if (keys['d']) right += 1;
      if (keys['a']) right -= 1;

      // Jump logic
      if (keys[' '] && !isJumping && Math.abs(cameraPosition.y - GROUND_Y) < 0.01) {
        velocityY = JUMP_STRENGTH;
        isJumping = true;
      }

      // Calculate direction based on yaw
      const direction = new THREE.Vector3();
      direction.x = Math.sin(yaw) * forward - Math.cos(yaw) * right;
      direction.z = Math.cos(yaw) * forward + Math.sin(yaw) * right;
      direction.normalize();

      // Collision radius (jarak aman dari tembok, dalam satuan world)
      const COLLISION_RADIUS = 0.4;

      // Cek collision sebelum update posisi kamera
      let nextX = cameraPosition.x + direction.x * moveSpeed;
      let nextZ = cameraPosition.z + direction.z * moveSpeed;

      function isNearWall(x, z) {
        const offsets = [
          [COLLISION_RADIUS, 0],
          [-COLLISION_RADIUS, 0],
          [0, COLLISION_RADIUS],
          [0, -COLLISION_RADIUS]
        ];
        for (let k = 0; k < offsets.length; k++) {
          const ox = x + offsets[k][0];
          const oz = z + offsets[k][1];
          const mazeI = Math.floor((oz + WORLD_SIZE/2) / CELL_SIZE);
          const mazeJ = Math.floor((ox + WORLD_SIZE/2) / CELL_SIZE);
          if (
            mazeI >= 0 && mazeI < MAZE_SIZE &&
            mazeJ >= 0 && mazeJ < MAZE_SIZE &&
            maze[mazeI][mazeJ] === 1
          ) {
            return true;
          }
        }
        return false;
      }

      if (!isNearWall(nextX, nextZ)) {
        cameraPosition.x = nextX;
        cameraPosition.z = nextZ;
      }
      // Clamp camera position within world bounds
      const halfSize = WORLD_SIZE / 2 - 2;
      cameraPosition.x = Math.max(-halfSize, Math.min(halfSize, cameraPosition.x));
      cameraPosition.z = Math.max(-halfSize, Math.min(halfSize, cameraPosition.z));

      // Jump & gravity update
      cameraPosition.y += velocityY;
      velocityY += GRAVITY;

      // Cek apakah sudah di tanah
      if (cameraPosition.y <= GROUND_Y) {
        cameraPosition.y = GROUND_Y;
        velocityY = 0;
        isJumping = false;
      }

      // Update camera position and look direction
      camera.position.copy(cameraPosition);
      const lookAt = new THREE.Vector3(
        cameraPosition.x + Math.sin(yaw),
        cameraPosition.y,
        cameraPosition.z + Math.cos(yaw)
      );
      camera.lookAt(lookAt);

      // Update minimap
      drawMinimap(cameraPosition.x, cameraPosition.z, yaw);

      // Cek apakah dekat dengan portofolio item
      let foundNear = null;
      for (let mesh of portfolioMeshes) {
        const dist = cameraPosition.distanceTo(mesh.position);
        if (dist < 2.2) {
          foundNear = mesh;
          break;
        }
      }
      if (foundNear) {
        if (foundNear.userData.type === 'sphere') {
          worldTooltipDiv.textContent = `Tekan [E] untuk melihat detail "${foundNear.userData.name}"`;
        } else {
          worldTooltipDiv.textContent = foundNear.userData.name + ': ' + foundNear.userData.desc;
        }
        worldTooltipDiv.style.left = (window.innerWidth/2 - 120) + 'px';
        worldTooltipDiv.style.top = (window.innerHeight - 80) + 'px';
        worldTooltipDiv.style.display = 'block';
      } else {
        worldTooltipDiv.style.display = 'none';
      }

      // Animasi rotasi box portofolio
      portfolioMeshes.forEach(mesh => {
        if (mesh.userData.type === 'box') {
          mesh.rotation.y += 0.02; // Pastikan box berputar
        }
        if (mesh.userData.type === 'sphere') {
          mesh.rotation.y += 0.04;
        }
      });

      // Animasi awan bergerak pelan di langit
      cloudGroup.children.forEach(cloud => {
        cloud.position.x += cloud.userData.speed * cloud.userData.dir;
        // Jika awan keluar dari area, reset ke sisi lain
        if (cloud.position.x > WORLD_SIZE/2 + 20) cloud.position.x = -WORLD_SIZE/2 - 20;
        if (cloud.position.x < -WORLD_SIZE/2 - 20) cloud.position.x = WORLD_SIZE/2 + 20;
      });

      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }

    // Interaksi: tekan E untuk popup project jika dekat bola project
    document.addEventListener('keydown', function(e) {
      if (e.key.toLowerCase() === 'e' && worldTooltipDiv.style.display === 'block') {
        let foundNear = null;
        for (let mesh of portfolioMeshes) {
          const dist = cameraPosition.distanceTo(mesh.position);
          if (dist < 2.2 && mesh.userData.type === 'sphere') {
            foundNear = mesh;
            break;
          }
        }
        if (foundNear && foundNear.userData.project) {
          showProjectPopup(foundNear.userData.project);
        }
      }
    });

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();

    // Tambahkan tembok maze di dalam dunia
    for (let i = 0; i < MAZE_SIZE; i++) {
      for (let j = 0; j < MAZE_SIZE; j++) {
        if (maze[i][j] === 1) {
          // Posisi tengah dunia = (0,0), maze di tengah
          const x = -WORLD_SIZE/2 + CELL_SIZE/2 + j * CELL_SIZE;
          const z = -WORLD_SIZE/2 + CELL_SIZE/2 + i * CELL_SIZE;
          // Hindari overlap dengan border (border sudah di luar maze)
          // Tembok maze lebih pendek dari border agar mudah navigasi
          const mazeWall = new THREE.Mesh(
            new THREE.BoxGeometry(CELL_SIZE, wallHeight, CELL_SIZE), wallMaterial
          );
          mazeWall.position.set(x, wallHeight/2, z);
          mazeWall.castShadow = true;
          scene.add(mazeWall);
        }
      }
    }
}

initScene();
          scene.add(mazeWall);


initScene();
