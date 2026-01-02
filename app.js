here// عدّل بيانات التواصل هنا
const WHATSAPP_NUMBER = "9647726744162"; // مثال: 9647xxxxxxxxx بدون +
const TELEGRAM_USERNAME = "Neeeee"; // بدون @

const currency = (n) => `${n.toLocaleString("ar-IQ")} د.ع`;

const products = [
  { id: "p1", title: "منتج 1", desc: "وصف مختصر للمنتج.", price: 10000 },
  { id: "p2", title: "منتج 2", desc: "وصف مختصر للمنتج.", price: 15000 },
  { id: "p3", title: "منتج 3", desc: "وصف مختصر للمنتج.", price: 20000 },
  { id: "p4", title: "منتج 4", desc: "وصف مختصر للمنتج.", price: 25000 },
  { id: "p5", title: "منتج 5", desc: "وصف مختصر للمنتج.", price: 30000 },
];

const els = {
  grid: document.getElementById("productGrid"),
  search: document.getElementById("search"),
  resultCount: document.getElementById("resultCount"),
  cartDrawer: document.getElementById("cartDrawer"),
  openCart: document.getElementById("openCart"),
  closeCart: document.getElementById("closeCart"),
  backdrop: document.getElementById("backdrop"),
  cartItems: document.getElementById("cartItems"),
  cartTotal: document.getElementById("cartTotal"),
  cartCount: document.getElementById("cartCount"),
  notes: document.getElementById("notes"),
  clearCart: document.getElementById("clearCart"),
  copyOrder: document.getElementById("copyOrder"),
  sendWhatsApp: document.getElementById("sendWhatsApp"),
  sendTelegram: document.getElementById("sendTelegram"),
  sendWhatsApp2: document.getElementById("sendWhatsApp2"),
  sendTelegram2: document.getElementById("sendTelegram2"),
  scrollToProducts: document.getElementById("scrollToProducts"),
};

let cart = JSON.parse(localStorage.getItem("cart") || "{}"); // {id: qty}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function cartCount() {
  return Object.values(cart).reduce((a, b) => a + b, 0);
}

function cartTotal() {
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = products.find(x => x.id === id);
    return sum + (p ? p.price * qty : 0);
  }, 0);
}

function renderProducts(list) {
  els.grid.innerHTML = "";
  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "card product";
    card.innerHTML = `
      <div class="product__img" aria-hidden="true"></div>
      <div class="product__title">${p.title}</div>
      <div class="product__desc">${p.desc}</div>
      <div class="product__row">
        <div class="price">${currency(p.price)}</div>
        <button class="btn btn--primary" data-add="${p.id}">إضافة للسلة</button>
      </div>
    `;
    els.grid.appendChild(card);
  });

  els.resultCount.textContent = `${list.length} منتج`;
}

function renderCart() {
  const items = Object.entries(cart)
    .map(([id, qty]) => {
      const p = products.find(x => x.id === id);
      if (!p) return "";
      const line = p.price * qty;
      return `
        <div class="cartItem">
          <div>
            <div class="cartItem__title">${p.title}</div>
            <div class="muted small">${currency(p.price)} لكل قطعة</div>
            <div class="muted small">الإجمالي: ${currency(line)}</div>
          </div>
          <div class="qty">
            <button data-dec="${id}">-</button>
            <div>${qty}</div>
            <button data-inc="${id}">+</button>
          </div>
        </div>
      `;
    })
    .join("");

  els.cartItems.innerHTML = items || `<div class="muted">السلة فارغة.</div>`;
  els.cartTotal.textContent = currency(cartTotal());
  els.cartCount.textContent = cartCount();
}

function openCart() {
  els.cartDrawer.setAttribute("aria-hidden", "false");
  renderCart();
}
function closeCart() {
  els.cartDrawer.setAttribute("aria-hidden", "true");
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  renderCart();
}
function inc(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  renderCart();
}
function dec(id) {
  cart[id] = (cart[id] || 0) - 1;
  if (cart[id] <= 0) delete cart[id];
  saveCart();
  renderCart();
}

function buildOrderText() {
  const lines = [];
  lines.push("طلب جديد");
  lines.push("--------------------");

  Object.entries(cart).forEach(([id, qty]) => {
    const p = products.find(x => x.id === id);
    if (!p) return;
    lines.push(`- ${p.title} × ${qty} = ${currency(p.price * qty)}`);
  });

  lines.push("--------------------");
  lines.push(`المجموع: ${currency(cartTotal())}`);

  const notes = (els.notes.value || "").trim();
  if (notes) {
    lines.push("");
    lines.push("ملاحظات:");
    lines.push(notes);
  }

  return lines.join("\n");
}

function sendWhatsApp() {
  if (cartCount() === 0) return alert("السلة فارغة.");
  const text = encodeURIComponent(buildOrderText());
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
  window.open(url, "_blank");
}
function sendTelegram() {
  if (cartCount() === 0) return alert("السلة فارغة.");
  const text = encodeURIComponent(buildOrderText());
  const url = `https://t.me/${TELEGRAM_USERNAME}?text=${text}`;
  window.open(url, "_blank");
}

els.grid.addEventListener("click", (e) => {
  const id = e.target?.dataset?.add;
  if (id) addToCart(id);
});

els.cartItems.addEventListener("click", (e) => {
  const incId = e.target?.dataset?.inc;
  const decId = e.target?.dataset?.dec;
  if (incId) inc(incId);
  if (decId) dec(decId);
});

els.openCart.addEventListener("click", openCart);
els.closeCart.addEventListener("click", closeCart);
els.backdrop.addEventListener("click", closeCart);

els.clearCart.addEventListener("click", () => {
  cart = {};
  saveCart();
  renderCart();
});

els.copyOrder.addEventListener("click", async () => {
  if (cartCount() === 0) return alert("السلة فارغة.");
  const text = buildOrderText();
  try {
    await navigator.clipboard.writeText(text);
    alert("تم نسخ نص الطلب ✅");
  } catch {
    alert("تعذر النسخ. انسخ يدويًا:\n\n" + text);
  }
});

els.sendWhatsApp.addEventListener("click", sendWhatsApp);
els.sendTelegram.addEventListener("click", sendTelegram);
els.sendWhatsApp2.addEventListener("click", sendWhatsApp);
els.sendTelegram2.addEventListener("click", sendTelegram);

els.scrollToProducts.addEventListener("click", () => {
  document.getElementById("products").scrollIntoView({ behavior: "smooth" });
});

// بحث
els.search.addEventListener("input", () => {
  const q = els.search.value.trim().toLowerCase();
  const filtered = products.filter(p =>
    (p.title + " " + p.desc).toLowerCase().includes(q)
  );
  renderProducts(filtered);
});

// تشغيل أولي
renderProducts(products);
renderCart();
