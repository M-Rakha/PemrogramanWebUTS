document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.querySelector("#tabelStok tbody");
  const inputCover = document.getElementById("coverInput");
  const preview = document.getElementById("preview");

  // === TAMPILKAN DATA DARI data.js ===
  dataKatalogBuku.forEach((buku) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><img src="${buku.cover}" alt="${buku.namaBarang}" class="cover"></td>
      <td>${buku.kodeBarang}</td>
      <td>${buku.namaBarang}</td>
      <td>${buku.jenisBarang}</td>
      <td>${buku.edisi}</td>
      <td>${buku.stok}</td>
      <td>${buku.harga}</td>
    `;
    tbody.appendChild(row);
  });

  // === PREVIEW GAMBAR ===
  inputCover.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        preview.src = e.target.result;
        preview.style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  });

  // === TAMBAH DATA BARU ===
  document.getElementById("tambahBtn").addEventListener("click", () => {
    const kode = document.getElementById("kodeBarang").value.trim();
    const nama = document.getElementById("namaBarang").value.trim();
    const jenis = document.getElementById("jenisBarang").value.trim();
    const edisi = document.getElementById("edisi").value.trim();
    const stok = document.getElementById("stok").value.trim();
    const harga = document.getElementById("harga").value.trim();

    if (!kode || !nama || !jenis || !stok || !harga) {
      alert("⚠️ Semua kolom wajib diisi!");
      return;
    }

    // Ambil gambar dari preview jika ada
    const coverSrc = preview.src || "img/default.jpg";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td><img src="${coverSrc}" alt="${nama}" class="cover"></td>
      <td>${kode}</td>
      <td>${nama}</td>
      <td>${jenis}</td>
      <td>${edisi}</td>
      <td>${stok}</td>
      <td>${harga}</td>
    `;
    tbody.appendChild(row);

    alert(`📖 Buku "${nama}" berhasil ditambahkan!`);

    // reset form
    document.querySelectorAll("input").forEach((i) => (i.value = ""));
    preview.style.display = "none";
  });
});