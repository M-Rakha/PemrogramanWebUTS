/* app.js - central logic for the UTS Toko Buku Online app
   Features: login/register, greeting, render catalog, search, filter,
   cart management (localStorage), checkout (orders), tracking lookup,
   simple chat simulation, notifications, reviews (localStorage).
*/

// ---------- Helpers ----------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const rupiahToNumber = (s) => Number((s||'').replace(/[^0-9]/g,'')) || 0;
const formatRupiah = (num) => {
  if (!num) return "Rp0";
  return "Rp " + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

// ---------- Persistence ----------
const storage = {
  set(key, val){ localStorage.setItem(key, JSON.stringify(val)); },
  get(key){ const v=localStorage.getItem(key); return v?JSON.parse(v):null; },
  remove(key){ localStorage.removeItem(key); }
};

// ---------- Auth / Login / Register ----------
document.addEventListener("DOMContentLoaded", () => {
  // Show logged user name where necessary
  const name = storage.get("user")?.nama;
  if (name && $("#welcomeText")) $("#welcomeText").textContent = `Halo, ${name}!`;

  // Login page handlers
  const loginForm = $("#loginForm");
  if (loginForm) {
    // open modals
    $("#openRegister").onclick = () => $("#modalRegister").classList.add("show");
    $("#openForgot").onclick = () => $("#modalForgot").classList.add("show");
    $$(".modal [data-close]").forEach(b => b.onclick = () => b.closest(".modal").classList.remove("show"));

    $("#btnRegister").onclick = () => {
      const nama = $("#regName").value.trim();
      const email = $("#regEmail").value.trim();
      const pw = $("#regPassword").value.trim();
      if (!nama || !email || !pw) return alert("Isi semua field pendaftaran!");
      // add to local storage users (simulate)
      const users = storage.get("users") || dataPengguna.slice();
      users.push({ id: Date.now(), nama, email, password: pw, role: "User" });
      storage.set("users", users);
      alert("Pendaftaran berhasil! Silakan login.");
      $("#modalRegister").classList.remove("show");
    };

    $("#btnForgot").onclick = () => {
      const e = $("#forgotEmail").value.trim();
      if (!e) return alert("Masukkan email untuk reset.");
      alert("Link reset password sudah dikirim (simulasi).");
      $("#modalForgot").classList.remove("show");
    };

    $("#loginBtn").onclick = (ev) => {
      ev.preventDefault();
      const email = $("#email").value.trim();
      const pw = $("#password").value.trim();
      const users = storage.get("users") || dataPengguna.slice();
      const u = users.find(x => x.email === email && x.password === pw);
      if (!u) return alert("Email/password salah!");
      storage.set("user", { id: u.id, nama: u.nama, email: u.email, role: u.role });
      // set notif example
      storage.set("notifications", [{ id:1, text: "Selamat datang "+u.nama, read:false }]);
      window.location.href = "dashboard.html";
    };
  }

  // Dashboard greeting and shader
  if ($("#greeting")) {
    const hour = new Date().getHours();
    const waktu = hour < 12 ? "Pagi" : hour < 18 ? "Siang" : "Malam";
    const user = storage.get("user");
    $("#greeting").textContent = `Selamat ${waktu}, ${user ? user.nama : "Pengunjung"} 👋`;
    if (user && $("#welcomeText")) $("#welcomeText").textContent = `Akses cepat: cek stok, pesanan, dan tracking.`;
  }

  // Notification bell
  const notif = storage.get("notifications") || [];
  if ($("#notifCount")) $("#notifCount").textContent = notif.filter(n=>!n.read).length;

  // Chat widget
  const chatWidget = $("#chatWidget");
  if (chatWidget) {
    $("#chatToggle").onclick = () => chatWidget.classList.toggle("closed");
    $("#chatSend").onclick = () => {
      const v = $("#chatInput").value.trim(); if (!v) return;
      const cb = $("#chatBody");
      const p = document.createElement("div"); p.textContent = "Anda: "+v; cb.appendChild(p);
      $("#chatInput").value = "";
      setTimeout(()=>{ const a = document.createElement("div"); a.textContent = "Admin: Terima kasih, pesan Anda kami terima."; cb.appendChild(a); cb.scrollTop = cb.scrollHeight; }, 700);
    };
    $("#chatToggle").onclick = ()=> chatWidget.classList.toggle("closed");
    // open by default minimized
    if (chatWidget.classList.contains("closed")) {}
  }

  // Catalog page (stok.html)
  if ($("#catalog")) {
    renderCatalog(dataKatalogBuku);
    // search
    $("#searchBox").addEventListener("input", (e) => {
      renderCatalog(dataKatalogBuku, e.target.value, $("#filterType")?.value);
    });
    // filter
    if ($("#filterType")) $("#filterType").addEventListener("change", (e)=> renderCatalog(dataKatalogBuku, $("#searchBox").value, e.target.value));
    // open add modal
    $("#btnAddBook").onclick = () => $("#modalAdd").classList.add("show");
    // manual add
    $("#m_addBtn").onclick = () => {
      const kode = $("#m_kode").value.trim(); const nama = $("#m_nama").value.trim();
      const penulis = $("#m_penulis")? $("#m_penulis").value.trim() : "Unknown";
      const jenis = $("#m_jenis").value.trim() || "Umum";
      const edisi = $("#m_edisi").value.trim() || "1";
      const stok = Number($("#m_stok").value) || 0;
      const harga = $("#m_harga").value.trim() || "Rp0";
      const cover = $("#m_cover").value.trim() || "img/default.jpg";
      if (!kode || !nama) return alert("Kode & Nama wajib diisi.");
      const buku = { kodeBarang: kode, namaBarang: nama, penulis, jenisBarang: jenis, edisi, stok, harga, cover };
      dataKatalogBuku.push(buku); renderCatalog(dataKatalogBuku);
      $("#modalAdd").classList.remove("show");
      alert("Buku berhasil ditambahkan (sementara di memory).");
      // optionally persist to localStorage
      storage.set("catalog", dataKatalogBuku);
    };
  }

  // Cart behaviors (global)
  initCart();

  // Checkout page
  if ($("#checkoutItems")) {
    renderCheckout();
    $("#placeOrder").onclick = placeOrder;
  }

  // Tracking page
  if ($("#btnTrack")) {
    $("#btnTrack").onclick = () => {
      const id = $("#trackId").value.trim();
      const r = $("#trackResult");
      if (!id) return r.innerHTML = `<p class="muted">Masukkan nomor DO.</p>`;
      const d = dataTracking[id];
      if (!d) return r.innerHTML = `<p class="muted">Nomor order tidak ditemukan.</p>`;
      r.innerHTML = `<h4>${d.nama} — ${d.status}</h4>
        <p>Ekspedisi: ${d.ekspedisi} | Tgl: ${d.tanggalKirim} | Total: ${d.total}</p>
        <ul>${d.perjalanan.map(p=>`<li>${p.waktu} — ${p.keterangan}</li>`).join("")}</ul>`;
    };
  }

  // Orders modal
  if ($("#openOrders")) {
    $("#openOrders").onclick = () => {
      const list = $("#ordersList");
      const orders = storage.get("orders") || [];
      if (!orders.length) list.innerHTML = "<p class='muted'>Belum ada pesanan.</p>";
      else list.innerHTML = orders.map(o => `<div class='card'><strong>DO: ${o.id}</strong><p>${o.date}</p><p>${o.total}</p></div>`).join("");
      $("#modalOrders").classList.add("show");
    };
  }

}); // DOMContentLoaded end

// ---------- Render catalog ----------
function renderCatalog(items, q="", type=""){
  const catalog = $("#catalog");
  if (!catalog) return;
  const filtered = items.filter(b => {
    const matchQ = q ? (b.namaBarang+ " "+(b.penulis||"")).toLowerCase().includes(q.toLowerCase()) : true;
    const matchType = type ? (b.jenisBarang === type) : true;
    return matchQ && matchType;
  });
  catalog.innerHTML = filtered.map(b => `
    <div class="book-card">
      <img src="${b.cover || 'img/default.jpg'}" alt="${b.namaBarang}" />
      <h4>${b.namaBarang}</h4>
      <div class="book-meta">${b.penulis || ''} • ${b.jenisBarang} • Edisi ${b.edisi}</div>
      <div style="display:flex; gap:8px; margin-top:8px; align-items:center">
        <div style="font-weight:bold; color:var(--primary)">${b.harga}</div>
        <div class="muted">Stok: ${b.stok}</div>
      </div>
      <div style="margin-top:auto; display:flex; gap:8px">
        <button class="btn" onclick="addToCart('${b.kodeBarang}')">Tambah ke Keranjang</button>
        <button class="btn ghost" onclick="openDetail('${b.kodeBarang}')">Detail</button>
      </div>
    </div>
  `).join("");
}

// ---------- Detail modal (simple) ----------
window.openDetail = (kode) => {
  const b = dataKatalogBuku.find(x=>x.kodeBarang===kode);
  if(!b) return alert("Buku tidak ditemukan");
  const html = `<div style="display:flex;gap:12px">
    <img src="${b.cover}" style="width:140px;height:180px;object-fit:cover;border-radius:8px" />
    <div>
      <h3>${b.namaBarang}</h3>
      <p class="muted">${b.penulis || ''}</p>
      <p>${b.jenisBarang} • Edisi ${b.edisi}</p>
      <p><strong>${b.harga}</strong></p>
      <p>Stok: ${b.stok}</p>
      <div style="margin-top:10px">
        <button class="btn primary" onclick="addToCart('${b.kodeBarang}')">Tambah ke Keranjang</button>
      </div>
    </div></div>`;
  const modal = document.createElement("div");
  modal.className = "modal show"; modal.innerHTML = `<div class="modal-card">${html}<div style="text-align:right;margin-top:12px"><button class="btn" data-close>Close</button></div></div>`;
  document.body.appendChild(modal);
  modal.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>modal.remove());
};

// ---------- CART ----------
function initCart(){
  const cart = storage.get("cart") || [];
  updateCartCount(cart.length);
  // cart panel toggles
  if ($("#viewCart")) $("#viewCart").onclick = () => $("#cartPanel").classList.toggle("closed");
  if ($("#closeCart")) $("#closeCart").onclick = () => $("#cartPanel").classList.add("closed");
  renderCartItems();
}

function updateCartCount(count){
  if ($("#cartCount")) $("#cartCount").textContent = count;
  storage.set("cartCount", count);
}

function addToCart(kode){
  const book = dataKatalogBuku.find(b=>b.kodeBarang===kode);
  if(!book) return alert("Buku tidak ditemukan");
  const cart = storage.get("cart") || [];
  const exist = cart.find(c=>c.kodeBarang===kode);
  if(exist){
    exist.qty += 1;
  } else {
    cart.push({ kodeBarang: kode, nama: book.namaBarang, harga: book.harga, cover: book.cover, qty:1 });
  }
  storage.set("cart", cart);
  updateCartCount(cart.length);
  renderCartItems();
  alert(`"${book.namaBarang}" ditambahkan ke keranjang`);
}

function renderCartItems(){
  const itemsWrap = $("#cartItems");
  if (!itemsWrap) {
    // also render for checkout page
    if ($("#checkoutItems")) {
      const cart = storage.get("cart") || [];
      $("#checkoutItems").innerHTML = cart.map(c => `<div class="card">${c.nama} x${c.qty} — ${c.harga}</div>`).join("") || "<p class='muted'>Keranjang kosong.</p>";
      $("#checkoutTotal").textContent = formatRupiah( (storage.get("cart")||[]).reduce((s,i)=> s + rupiahToNumber(i.harga)*i.qty ,0) );
    }
    return;
  }
  const cart = storage.get("cart") || [];
  itemsWrap.innerHTML = cart.map(c => `
    <div class="cart-item">
      <img src="${c.cover || 'img/default.jpg'}" />
      <div style="flex:1">
        <strong>${c.nama}</strong>
        <div class="muted">${c.harga} • qty: ${c.qty}</div>
      </div>
      <div style="display:flex; flex-direction:column; gap:6px;">
        <button class="btn tiny" onclick="changeQty('${c.kodeBarang}',1)">+</button>
        <button class="btn tiny" onclick="changeQty('${c.kodeBarang}',-1)">-</button>
        <button class="btn tiny ghost" onclick="removeCart('${c.kodeBarang}')">Hapus</button>
      </div>
    </div>
  `).join("") || "<p class='muted'>Keranjang kosong.</p>";
  // total
  const total = cart.reduce((s,i)=> s + rupiahToNumber(i.harga)*i.qty, 0);
  if ($("#cartTotal")) $("#cartTotal").textContent = formatRupiah(total);
  if ($("#cartCount")) $("#cartCount").textContent = cart.length;
  if ($("#checkoutTotal")) $("#checkoutTotal").textContent = formatRupiah(total);
  if ($("#checkoutItems")) $("#checkoutItems").innerHTML = cart.map(c=>`<div class='card'>${c.nama} x${c.qty} — ${c.harga}</div>`).join("") || "<p class='muted'>Keranjang kosong.</p>";
}

window.changeQty = function(kode, delta){
  const cart = storage.get("cart") || [];
  const item = cart.find(i=>i.kodeBarang===kode);
  if(!item) return;
  item.qty = Math.max(0, item.qty + delta);
  if (item.qty === 0) storage.set("cart", cart.filter(i=>i.kodeBarang!==kode));
  else storage.set("cart", cart);
  renderCartItems();
};

window.removeCart = function(kode){
  const cart = (storage.get("cart")||[]).filter(i=>i.kodeBarang!==kode);
  storage.set("cart", cart);
  renderCartItems();
};

// ---------- Checkout / Orders ----------
function renderCheckout(){
  renderCartItems();
  // prefill user
  const u = storage.get("user");
  if (u) {
    if ($("#c_nama")) $("#c_nama").value = u.nama;
    if ($("#c_email")) $("#c_email").value = u.email;
  }
}

function placeOrder(){
  const cart = storage.get("cart")||[];
  if (!cart.length) return alert("Keranjang kosong.");
  const nama = $("#c_nama").value.trim(); const email = $("#c_email").value.trim(); const alamat = $("#c_alamat").value.trim(); const metode = $("#c_pembayaran").value;
  if (!nama || !email || !alamat) return alert("Isi data pengiriman lengkap.");
  const total = formatRupiah(cart.reduce((s,i)=> s + rupiahToNumber(i.harga)*i.qty, 0));
  const order = { id: 'DO'+Date.now(), date: new Date().toLocaleString(), items: cart, total, pengiriman:{nama, email, alamat, metode} };
  const orders = storage.get("orders") || [];
  orders.push(order);
  storage.set("orders", orders);
  // clear cart
  storage.set("cart", []);
  renderCartItems();
  alert(`Pesanan berhasil! Nomor DO: ${order.id}`);
  // add notification
  const nots = storage.get("notifications") || [];
  nots.push({ id: Date.now(), text: `Pesanan ${order.id} diterima`, read:false });
  storage.set("notifications", nots);
  // redirect to dashboard
  window.location.href = "dashboard.html";
}

// ---------- Tracking quick util ----------
/* handled in DOMContentLoaded */