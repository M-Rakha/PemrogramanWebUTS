// Greeting di dashboard
const greet = document.getElementById("greeting");
if (greet) {
  const user = JSON.parse(localStorage.getItem("userLogin"));
  const hour = new Date().getHours();
  let waktu =
    hour < 12 ? "pagi" : hour < 18 ? "siang" : "malam";
  greet.textContent = `Selamat ${waktu}, ${user ? user.nama : "Pengunjung"} 👋`;
}

// ===== STOK PAGE =====
const tbody = document.querySelector("#tabelStok tbody");
if (tbody && typeof dataKatalogBuku !== "undefined") {
  dataKatalogBuku.forEach(buku => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${buku.kodeBarang}</td>
      <td>${buku.namaBarang}</td>
      <td>${buku.jenisBarang}</td>
      <td>${buku.edisi}</td>
      <td>${buku.stok}</td>
      <td>${buku.harga}</td>`;
    tbody.appendChild(row);
  });

  document.getElementById("tambahBtn").addEventListener("click", () => {
    const kode = document.getElementById("kodeBarang").value.trim();
    const nama = document.getElementById("namaBarang").value.trim();
    const jenis = document.getElementById("jenisBarang").value.trim();
    const edisi = document.getElementById("edisi").value.trim();
    const stok = document.getElementById("stok").value.trim();
    const harga = document.getElementById("harga").value.trim();
    if (!kode || !nama) return alert("Lengkapi semua kolom!");
    const row = document.createElement("tr");
    row.innerHTML = `<td>${kode}</td><td>${nama}</td><td>${jenis}</td><td>${edisi}</td><td>${stok}</td><td>${harga}</td>`;
    tbody.appendChild(row);
    alert("Buku baru berhasil ditambahkan!");
  });
}

// ===== TRACKING PAGE =====
const btnCari = document.getElementById("btnCari");
if (btnCari) {
  btnCari.addEventListener("click", () => {
    const id = document.getElementById("orderId").value.trim();
    const box = document.getElementById("trackingResult");
    const data = dataTracking[id];
    if (!data) {
      box.innerHTML = "<p>Nomor order tidak ditemukan!</p>";
      return;
    }
    let perjalanan = data.perjalanan.map(p => `<li>${p.waktu} - ${p.keterangan}</li>`).join("");
    box.innerHTML = `
      <h3>Nama Pemesan: ${data.nama}</h3>
      <p>Status: <b>${data.status}</b></p>
      <p>Ekspedisi: ${data.ekspedisi}</p>
      <p>Tanggal Kirim: ${data.tanggalKirim}</p>
      <p>Total: ${data.total}</p>
      <ul>${perjalanan}</ul>`;
  });
}