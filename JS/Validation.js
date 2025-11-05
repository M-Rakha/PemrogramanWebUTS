// === VALIDATION.JS ===
// Script login untuk Toko Buku Online

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");

  if (!loginBtn) return; // berhenti kalau tombol tidak ada

  loginBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // Validasi input kosong
    if (!email || !password) {
      alert("⚠️ Silakan isi email dan password terlebih dahulu!");
      return;
    }

    // === DATA LOGIN SEDERHANA ===
    const users = [
      { email: "rina@gmail.com", password: "rina123", nama: "Rina Wulandari" },
      { email: "budi@gmail.com", password: "budi123", nama: "Budi Santoso" },
      { email: "admin@tokobuku.com", password: "admin123", nama: "Administrator" }
    ];

    // Cek apakah cocok
    const foundUser = users.find(
      (user) => user.email === email && user.password === password
    );

    if (foundUser) {
      alert(`✅ Selamat datang, ${foundUser.nama}!`);
      // simpan ke sessionStorage agar bisa dibaca di halaman lain
      sessionStorage.setItem("userLogin", foundUser.nama);
      // pindah ke dashboard
      window.location.href = "dashboard.html";
    } else {
      alert("❌ Email atau password salah!");
    }
  });
});