
const products = CONFIG.PRODUCTS.map(p => ({ ...p }));
let cart = [];
let orders = JSON.parse(localStorage.getItem("smilecare_orders") || "[]");

const $ = id => document.getElementById(id);
const money = n => "฿" + Number(n).toLocaleString("th-TH");

function saveOrders() {
  localStorage.setItem("smilecare_orders", JSON.stringify(orders));
}

function renderProducts() {
  $("productGrid").innerHTML = products.map(p => `
    <article class="product-card">
      <div class="product-visual ${p.type}">
        <div class="mini-tube ${p.type}">
          <strong>smilecare</strong><small>${p.type === "mint" ? "FRESH MINT" : "HERBAL CARE"}</small>
        </div>
      </div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <div class="product-bottom">
          <div><div class="price">${money(p.price)}</div><div class="stock">คงเหลือ ${p.stock} ชิ้น</div></div>
          <button class="add-btn" onclick="addToCart('${p.id}')"
            ${p.stock <= 0 ? "disabled" : ""}>เพิ่มลงตะกร้า</button>
        </div>
      </div>
    </article>
  `).join("");
}

function addToCart(id) {
  const p = products.find(x => x.id === id);
  const item = cart.find(x => x.id === id);
  if (!p || (item?.qty || 0) >= p.stock) {
    alert("สินค้าไม่เพียงพอ");
    return;
  }
  if (item) item.qty++;
  else cart.push({ id, qty: 1 });
  renderCart();
}

function changeQty(id, amount) {
  const item = cart.find(x => x.id === id);
  const p = products.find(x => x.id === id);
  if (!item || !p) return;
  const next = item.qty + amount;
  if (next <= 0) cart = cart.filter(x => x.id !== id);
  else if (next <= p.stock) item.qty = next;
  else alert("สินค้าในสต็อกไม่เพียงพอ");
  renderCart();
}

function renderCart() {
  const count = cart.reduce((s, x) => s + x.qty, 0);
  const total = cart.reduce((s, x) => {
    const p = products.find(p => p.id === x.id);
    return s + (p ? p.price * x.qty : 0);
  }, 0);
  $("cartCount").textContent = count;
  $("cartTotal").textContent = money(total);

  $("cartItems").innerHTML = cart.length ? cart.map(x => {
    const p = products.find(p => p.id === x.id);
    return `<div class="cart-row">
      <div><strong>${p.name}</strong><small>${money(p.price)} × ${x.qty}</small></div>
      <div class="quantity">
        <button onclick="changeQty('${x.id}',-1)">−</button>
        <span>${x.qty}</span>
        <button onclick="changeQty('${x.id}',1)">+</button>
      </div>
    </div>`;
  }).join("") : '<div class="empty-state">ยังไม่มีสินค้าในตะกร้า</div>';
}

function openCart() {
  $("cartDrawer").classList.add("open");
  $("cartOverlay").classList.add("show");
}
function closeCart() {
  $("cartDrawer").classList.remove("open");
  $("cartOverlay").classList.remove("show");
}
function showModal(id) {
  $(id).classList.add("show");
}
function closeModal(id) {
  $(id).classList.remove("show");
}

$("cartOpen").addEventListener("click", openCart);
$("cartClose").addEventListener("click", closeCart);
$("cartOverlay").addEventListener("click", closeCart);

$("checkoutOpen").addEventListener("click", () => {
  if (!cart.length) return alert("กรุณาเลือกสินค้าก่อน");
  closeCart();
  const total = cart.reduce((s, x) => {
    const p = products.find(p => p.id === x.id);
    return s + p.price * x.qty;
  }, 0);
  $("checkoutSummary").textContent = "ยอดชำระทั้งหมด " + money(total);
  showModal("checkoutModal");
});

document.querySelectorAll("[data-close]").forEach(btn => {
  btn.addEventListener("click", () => closeModal(btn.dataset.close));
});

$("checkoutForm").addEventListener("submit", async event => {
  event.preventDefault();
  if (!cart.length) return alert("ไม่มีสินค้าในตะกร้า");

  for (const item of cart) {
    const p = products.find(x => x.id === item.id);
    if (!p || p.stock < item.qty) {
      alert("สินค้า " + (p?.name || "") + " มีไม่เพียงพอ");
      return;
    }
  }

  const form = new FormData(event.target);
  const items = cart.map(x => {
    const p = products.find(p => p.id === x.id);
    return {
      sku: p.id,
      name: p.name,
      price: p.price,
      quantity: x.qty,
      subtotal: p.price * x.qty
    };
  });

  const order = {
    orderId: "SC" + Date.now(),
    date: new Date().toISOString(),
    customer: form.get("customer"),
    phone: form.get("phone"),
    address: form.get("address"),
    note: form.get("note"),
    items,
    total: items.reduce((s, x) => s + x.subtotal, 0),
    status: "รอดำเนินการ"
  };

  orders.unshift(order);
  items.forEach(item => {
    const p = products.find(p => p.id === item.sku);
    p.stock -= item.quantity;
  });

  saveOrders();

  if (CONFIG.GOOGLE_SCRIPT_URL) {
    try {
      await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(order)
      });
    } catch (error) {
      console.error("ส่งข้อมูลไป Google Sheets ไม่สำเร็จ", error);
    }
  }

  $("successOrderId").textContent = order.orderId;
  closeModal("checkoutModal");
  showModal("successModal");
  cart = [];
  event.target.reset();
  renderProducts();
  renderCart();
});

$("adminOpen").addEventListener("click", () => {
  renderAdminOrders();
  showModal("adminModal");
});

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    $("adminOrders").classList.toggle("hidden", tab.dataset.tab !== "orders");
    $("adminProducts").classList.toggle("hidden", tab.dataset.tab !== "products");
    if (tab.dataset.tab === "products") renderAdminProducts();
    else renderAdminOrders();
  });
});

function renderAdminOrders() {
  $("adminOrders").innerHTML = orders.length ? orders.map(o => `
    <div class="admin-order">
      <h3>${o.orderId} · ${money(o.total)}</h3>
      <p>ลูกค้า: ${o.customer} | โทร: ${o.phone}</p>
      <p>ที่อยู่: ${o.address}</p>
      <p>สินค้า: ${o.items.map(i => `${i.name} × ${i.quantity}`).join(", ")}</p>
      <p>วันที่: ${new Date(o.date).toLocaleString("th-TH")}</p>
      <label>สถานะ:
        <select onchange="updateStatus('${o.orderId}', this.value)">
          ${["รอดำเนินการ","กำลังแพ็ก","จัดส่งแล้ว","ยกเลิก"].map(s =>
            `<option ${o.status === s ? "selected" : ""}>${s}</option>`
          ).join("")}
        </select>
      </label>
      <button onclick="printOrder('${o.orderId}')">พิมพ์ใบจัดส่ง</button>
    </div>
  `).join("") : '<div class="empty-state">ยังไม่มีคำสั่งซื้อ</div>';
}

function updateStatus(id, status) {
  const order = orders.find(o => o.orderId === id);
  if (!order) return;
  order.status = status;
  saveOrders();
  renderAdminOrders();
}

function renderAdminProducts() {
  $("adminProducts").innerHTML = products.map(p => `
    <div class="admin-product">
      <div><strong>${p.name}</strong><br><small>${p.id} · ${money(p.price)}</small></div>
      <div class="stock-edit">
        <span>สต็อก</span>
        <input type="number" min="0" id="stock-${p.id}" value="${p.stock}">
        <button onclick="updateStock('${p.id}')">บันทึก</button>
      </div>
    </div>
  `).join("");
}

function updateStock(id) {
  const p = products.find(p => p.id === id);
  const value = Number($("stock-" + id).value);
  if (!p || !Number.isInteger(value) || value < 0) return alert("กรุณากรอกจำนวนที่ถูกต้อง");
  p.stock = value;
  renderProducts();
  renderAdminProducts();
  alert("บันทึกสต็อกแล้ว");
}

function printOrder(id) {
  const o = orders.find(x => x.orderId === id);
  if (!o) return;
  const w = window.open("", "_blank");
  w.document.write(`
    <html><head><title>ใบจัดส่ง ${o.orderId}</title>
    <style>body{font-family:Arial,sans-serif;padding:35px;max-width:700px;margin:auto}
    h1{font-size:22px} .line{border-bottom:1px solid #aaa;padding:12px 0}
    </style></head><body>
    <h1>SMILECARE · SHIPPING LABEL</h1>
    <h2>ผู้รับ: ${o.customer}</h2>
    <div class="line">โทรศัพท์: ${o.phone}</div>
    <div class="line">ที่อยู่: ${o.address}</div>
    <div class="line">เลขคำสั่งซื้อ: ${o.orderId}</div>
    <div class="line">สินค้า: ${o.items.map(i => `${i.name} × ${i.quantity}`).join(", ")}</div>
    <div class="line">ยอดรวม: ${money(o.total)}</div>
    <script>window.onload=()=>window.print()<\/script>
    </body></html>
  `);
  w.document.close();
}

renderProducts();
renderCart();
