# Maze3D

Maze3D adalah aplikasi web visualisasi maze 3D menggunakan [Three.js](https://threejs.org/) dan [Vite](https://vitejs.dev/) sebagai bundler/development server.

## Cara Instalasi & Menjalankan

1. **Clone repository ini** (atau download source code).
2. **Install Three.js:**
   ```
   npm install --save three
   ```
3. **Install Vite (dev dependency):**
   ```
   npm install --save-dev vite
   ```
4. **Jalankan development server:**
   ```
   npx vite
   ```
   atau
   ```
   npm run dev
   ```
5. **Buka browser dan akses**:  
   ```
   http://localhost:5173/maze.html
   ```

## Struktur Folder

- `src/` : Source code utama (JavaScript, CSS)
- `public/` : Asset statis (gambar, tekstur, favicon)
- `maze.html` : Entry point aplikasi

## Teknologi

- [Three.js](https://threejs.org/) untuk grafis 3D
- [Vite](https://vitejs.dev/) untuk pengembangan dan bundling

## Catatan

- Pastikan semua asset gambar/tekstur berada di folder `public/`.
- Jangan buka file HTML langsung (file://), gunakan server Vite.