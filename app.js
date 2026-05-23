import { useState, useEffect, useRef } from "react";

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwdLxaq6fbvbTM2yNtUl0mOaodAUebJZZBdFxFaVbiXXhP3vept-ojDtcZJMkLFUwfJ1Q/exec";

// ─── Checkout Modal ───────────────────────────────────────────────────────────
function CheckoutModal({ cart, total, onClose, onSuccess }) {
  const [form, setForm] = useState({
    senderName: "", phone: "", email: "", recipientName: "",
    deliveryAddress: "", deliveryDate: "", occasion: "", giftMessage: "",
    giftWrap: false, paymentMethod: "Cash on Delivery",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const DELIVERY_FEE = 200;
  const GIFT_WRAP_FEE = 150;
  const grandTotal = total + DELIVERY_FEE + (form.giftWrap ? GIFT_WRAP_FEE : 0);

  const handleSubmit = async () => {
    if (!form.senderName || !form.phone || !form.recipientName || !form.deliveryAddress || !form.deliveryDate) {
      setError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const itemsSummary = cart.map(c => `${c.Name} x${c.qty}`).join(", ");
      const orderRef = "ORD-" + Date.now();
      const params = new URLSearchParams({
        action: "addOrder",
        orderRef,
        dateTime: new Date().toLocaleString(),
        senderName: form.senderName,
        phone: form.phone,
        email: form.email,
        recipientName: form.recipientName,
        deliveryAddress: form.deliveryAddress,
        deliveryDate: form.deliveryDate,
        occasion: form.occasion,
        giftMessage: form.giftMessage,
        items: itemsSummary,
        subtotal: total,
        giftWrap: form.giftWrap ? GIFT_WRAP_FEE : 0,
        deliveryFee: DELIVERY_FEE,
        total: grandTotal,
        paymentMethod: form.paymentMethod,
      });
      await fetch(`${SCRIPT_URL}?${params.toString()}`);
      onSuccess(orderRef);
    } catch (e) {
      setError("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <div style={S.modalHeader}>
          <h2 style={S.modalTitle}>Complete Your Order</h2>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={S.modalBody}>
          <p style={S.sectionLabel}>Sender Details</p>
          <div style={S.row2}>
            <Field label="Your Name *" value={form.senderName} onChange={v => set("senderName", v)} />
            <Field label="Phone *" value={form.phone} onChange={v => set("phone", v)} />
          </div>
          <Field label="Email" value={form.email} onChange={v => set("email", v)} />

          <p style={{ ...S.sectionLabel, marginTop: 20 }}>Recipient Details</p>
          <Field label="Recipient Name *" value={form.recipientName} onChange={v => set("recipientName", v)} />
          <Field label="Delivery Address *" value={form.deliveryAddress} onChange={v => set("deliveryAddress", v)} textarea />
          <div style={S.row2}>
            <Field label="Delivery Date *" type="date" value={form.deliveryDate} onChange={v => set("deliveryDate", v)} />
            <Field label="Occasion" value={form.occasion} onChange={v => set("occasion", v)} />
          </div>
          <Field label="Gift Message" value={form.giftMessage} onChange={v => set("giftMessage", v)} textarea />

          <p style={{ ...S.sectionLabel, marginTop: 20 }}>Extras & Payment</p>
          <label style={S.checkRow}>
            <input type="checkbox" checked={form.giftWrap} onChange={e => set("giftWrap", e.target.checked)} />
            <span>Gift Wrapping (+PKR {GIFT_WRAP_FEE})</span>
          </label>
          <div style={S.selectWrap}>
            <label style={S.fieldLabel}>Payment Method</label>
            <select style={S.select} value={form.paymentMethod} onChange={e => set("paymentMethod", e.target.value)}>
              <option>Cash on Delivery</option>
              <option>Bank Transfer</option>
              <option>JazzCash</option>
              <option>EasyPaisa</option>
            </select>
          </div>

          <div style={S.summary}>
            <div style={S.summaryRow}><span>Subtotal</span><span>PKR {total}</span></div>
            <div style={S.summaryRow}><span>Gift Wrap</span><span>PKR {form.giftWrap ? GIFT_WRAP_FEE : 0}</span></div>
            <div style={S.summaryRow}><span>Delivery Fee</span><span>PKR {DELIVERY_FEE}</span></div>
            <div style={{ ...S.summaryRow, fontWeight: 700, fontSize: 18, color: "#3b0f6e" }}>
              <span>Total</span><span>PKR {grandTotal}</span>
            </div>
          </div>

          {error && <p style={S.error}>{error}</p>}
          <button style={S.submitBtn} onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, textarea, type = "text" }) {
  const inputStyle = { ...S.input, ...(textarea ? { height: 70, resize: "vertical" } : {}) };
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={S.fieldLabel}>{label}</label>
      {textarea
        ? <textarea style={inputStyle} value={value} onChange={e => onChange(e.target.value)} />
        : <input style={S.input} type={type} value={value} onChange={e => onChange(e.target.value)} />}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const [addedId, setAddedId] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 200);
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await fetch(`${SCRIPT_URL}?action=getProducts`);
      const data = await res.json();
      // Filter only Active products
      const active = (data.products || data).filter(p =>
        String(p.Active).toLowerCase() === "true" || String(p.Active).toLowerCase() === "yes" || p.Active === true
      );
      setProducts(active);
    } catch (e) {
      setFetchError("Unable to load products. Please try again.");
    }
    setLoading(false);
  };

  const categories = ["All", ...Array.from(new Set(products.map(p => p.Category).filter(Boolean)))];

  const filtered = products.filter(p => {
    const matchSearch = p.Name?.toLowerCase().includes(search.toLowerCase()) ||
      p.Description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || p.Category === activeCategory;
    return matchSearch && matchCat;
  });

  const cartCount = cart.reduce((a, b) => a + b.qty, 0);
  const cartTotal = cart.reduce((a, b) => a + Number(b.Price) * b.qty, 0);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(c => c.Name === product.Name);
      if (existing) return prev.map(c => c.Name === product.Name ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...product, qty: 1 }];
    });
    setAddedId(product.Name);
    setTimeout(() => setAddedId(null), 1200);
  };

  const removeFromCart = (name) => setCart(prev => prev.filter(c => c.Name !== name));
  const updateQty = (name, delta) => setCart(prev =>
    prev.map(c => c.Name === name ? { ...c, qty: Math.max(1, c.qty + delta) } : c)
  );

  const handleOrderSuccess = (ref) => {
    setCart([]);
    setCartOpen(false);
    setCheckoutOpen(false);
    setSuccessOrder(ref);
  };

  return (
    <div style={S.root}>
      {/* Navbar */}
      <nav style={S.nav}>
        <span style={S.logo}>DON TROVE</span>
        <div style={S.navRight}>
          <button style={S.navLink} onClick={() => window.scrollTo({ top: 420, behavior: "smooth" })}>SHOP</button>
          <button style={S.navLink} onClick={() => setCartOpen(true)}>MY CART</button>
          <button style={S.cartBtn} onClick={() => setCartOpen(true)}>
            🛒 CART {cartCount > 0 && `(${cartCount})`}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <header style={S.hero}>
        <div style={S.heroBg} />
        <div style={S.heroContent}>
          <p style={{ ...S.heroTag, opacity: loaded ? 1 : 0, transition: "all 0.6s ease 0.1s" }}>✦ CURATED WITH LOVE</p>
          <h1 style={{ ...S.heroTitle, opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(20px)", transition: "all 0.7s ease 0.2s" }}>
            Le Tresor De Misfah.
          </h1>
          <p style={{ ...S.heroSub, opacity: loaded ? 1 : 0, transition: "all 0.7s ease 0.35s" }}>
            Gifts as rare and radiant as the ones you cherish.
          </p>
        </div>
      </header>

      {/* Search */}
      <div style={S.searchBar}>
        <div style={S.searchWrap}>
          <span style={{ marginRight: 10, opacity: 0.5 }}>🔍</span>
          <input style={S.searchInput} placeholder="Search gifts..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Collection */}
      <main style={S.main}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h2 style={S.collectionTitle}>Our Collection</h2>
          <p style={S.collectionSub}>Each gift is carefully selected to delight the ones you love</p>
        </div>

        {/* Filters */}
        {!loading && !fetchError && (
          <div style={S.filters}>
            {categories.map(cat => (
              <button key={cat} style={{ ...S.filterBtn, ...(activeCategory === cat ? S.filterBtnActive : {}) }}
                onClick={() => setActiveCategory(cat)}>{cat}</button>
            ))}
          </div>
        )}

        {/* States */}
        {loading && (
          <div style={S.stateBox}>
            <div style={S.spinner} />
            <p style={S.stateText}>Loading beautiful gifts...</p>
          </div>
        )}
        {fetchError && (
          <div style={S.stateBox}>
            <p style={{ color: "#c0392b", fontFamily: "'Cormorant Garamond', serif", fontSize: 16 }}>{fetchError}</p>
            <button style={S.retryBtn} onClick={fetchProducts}>Try Again</button>
          </div>
        )}

        {/* Grid */}
        {!loading && !fetchError && (
          <div style={S.grid}>
            {filtered.length === 0 ? (
              <p style={{ gridColumn: "1/-1", textAlign: "center", color: "#9d8ab5", fontStyle: "italic", fontFamily: "'Cormorant Garamond', serif", padding: 60 }}>
                No gifts found.
              </p>
            ) : filtered.map((product, i) => (
              <div key={product.Name + i} style={{
                ...S.card,
                opacity: loaded ? 1 : 0,
                transform: loaded ? "none" : "translateY(24px)",
                transition: `all 0.5s ease ${0.05 + i * 0.06}s`,
              }}>
                {product["Image URL"] ? (
                  <div style={S.imgWrap}>
                    <img src={product["Image URL"]} alt={product.Name} style={S.img}
                      onError={e => { e.target.style.display = "none"; }} />
                  </div>
                ) : (
                  <div style={S.imgPlaceholder}>🎁</div>
                )}
                <div style={{ padding: "18px 20px 20px" }}>
                  {product.Category && <div style={S.cardCategory}>{product.Category}</div>}
                  <h3 style={S.cardName}>{product.Name}</h3>
                  {product.Description && <p style={S.cardDesc}>{product.Description}</p>}
                  <div style={S.cardFooter}>
                    <span style={S.cardPrice}>PKR {Number(product.Price).toLocaleString()}</span>
                    <button
                      style={{ ...S.addBtn, ...(addedId === product.Name ? S.addBtnAdded : {}) }}
                      onClick={() => addToCart(product)}
                    >
                      {addedId === product.Name ? "✓ Added" : "+ Add to Cart"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={S.footer}>
        <span style={S.footerLogo}>DON TROVE</span>
        <p style={S.footerText}>Le Tresor De Misfah — Curated with love, delivered with care.</p>
        <p style={S.footerCopy}>© {new Date().getFullYear()} Don Trove. All rights reserved.</p>
      </footer>

      {/* Cart Sidebar */}
      {cartOpen && (
        <div style={S.cartOverlay} onClick={() => setCartOpen(false)}>
          <div style={S.cartSidebar} onClick={e => e.stopPropagation()}>
            <div style={S.cartHeader}>
              <h2 style={S.cartTitle}>My Cart</h2>
              <button style={S.closeBtn} onClick={() => setCartOpen(false)}>✕</button>
            </div>
            {cart.length === 0 ? (
              <div style={S.cartEmpty}>
                <p style={{ fontSize: 36 }}>🛒</p>
                <p>Your cart is empty.</p>
                <button style={S.shopNowBtn} onClick={() => setCartOpen(false)}>Shop Now</button>
              </div>
            ) : (
              <>
                <div style={S.cartItems}>
                  {cart.map(item => (
                    <div key={item.Name} style={S.cartItem}>
                      {item["Image URL"]
                        ? <img src={item["Image URL"]} alt={item.Name} style={S.cartThumb} onError={e => e.target.style.display = "none"} />
                        : <span style={{ fontSize: 28 }}>🎁</span>}
                      <div style={{ flex: 1 }}>
                        <p style={S.cartItemName}>{item.Name}</p>
                        <p style={S.cartItemPrice}>PKR {Number(item.Price).toLocaleString()}</p>
                        <div style={S.qtyRow}>
                          <button style={S.qtyBtn} onClick={() => updateQty(item.Name, -1)}>−</button>
                          <span style={S.qtyNum}>{item.qty}</span>
                          <button style={S.qtyBtn} onClick={() => updateQty(item.Name, 1)}>+</button>
                        </div>
                      </div>
                      <button style={S.removeBtn} onClick={() => removeFromCart(item.Name)}>✕</button>
                    </div>
                  ))}
                </div>
                <div style={S.cartFooter}>
                  <div style={S.cartTotal}>
                    <span>Subtotal</span>
                    <span style={{ fontWeight: 700 }}>PKR {cartTotal.toLocaleString()}</span>
                  </div>
                  <button style={S.checkoutBtn} onClick={() => { setCartOpen(false); setCheckoutOpen(true); }}>
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutOpen && (
        <CheckoutModal
          cart={cart}
          total={cartTotal}
          onClose={() => setCheckoutOpen(false)}
          onSuccess={handleOrderSuccess}
        />
      )}

      {/* Success Modal */}
      {successOrder && (
        <div style={S.overlay} onClick={() => setSuccessOrder(null)}>
          <div style={{ ...S.modal, maxWidth: 440, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🎁</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, color: "#3b0f6e", marginBottom: 10 }}>
              Order Placed!
            </h2>
            <p style={{ color: "#7c6d8a", fontFamily: "'Cormorant Garamond', serif", fontSize: 15, marginBottom: 8 }}>
              Thank you for your order. We'll be in touch soon.
            </p>
            <p style={{ color: "#9d8ab5", fontSize: 13, fontFamily: "'Cormorant Garamond', serif", marginBottom: 24 }}>
              Order Reference: <strong>{successOrder}</strong>
            </p>
            <button style={S.submitBtn} onClick={() => setSuccessOrder(null)}>Continue Shopping</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  root: { fontFamily: "'Cormorant Garamond', 'Georgia', serif", background: "#f8f6f2", minHeight: "100vh", color: "#2d1f3d" },
  nav: { position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", height: 60, background: "#1a0a2e", borderBottom: "1px solid rgba(255,255,255,0.08)" },
  logo: { color: "#fff", fontSize: 18, fontWeight: 400, letterSpacing: "0.35em", fontFamily: "'Cormorant Garamond', serif" },
  navRight: { display: "flex", alignItems: "center", gap: 24 },
  navLink: { background: "none", border: "none", color: "#d4b8e0", fontSize: 12, letterSpacing: "0.15em", cursor: "pointer", padding: "6px 12px", fontFamily: "'Cormorant Garamond', serif" },
  cartBtn: { display: "flex", alignItems: "center", gap: 6, background: "#c9a84c", color: "#1a0a2e", border: "none", borderRadius: 20, padding: "7px 18px", fontSize: 12, letterSpacing: "0.1em", fontWeight: 700, cursor: "pointer", fontFamily: "'Cormorant Garamond', serif" },
  hero: { position: "relative", minHeight: 320, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  heroBg: { position: "absolute", inset: 0, background: "linear-gradient(135deg, #3b0f6e 0%, #6d28d9 55%, #c084fc 100%)" },
  heroContent: { position: "relative", textAlign: "center", padding: "60px 20px 70px", zIndex: 2 },
  heroTag: { color: "#c9a84c", fontSize: 12, letterSpacing: "0.35em", marginBottom: 16, display: "block" },
  heroTitle: { color: "#fff", fontSize: "clamp(36px, 6vw, 68px)", fontWeight: 400, margin: "0 0 18px", lineHeight: 1.15 },
  heroSub: { color: "rgba(255,255,255,0.7)", fontSize: 16, fontStyle: "italic" },
  searchBar: { background: "#fff", padding: "20px 40px", display: "flex", justifyContent: "center", borderBottom: "1px solid #ede8f5", boxShadow: "0 2px 12px rgba(109,40,217,0.06)" },
  searchWrap: { display: "flex", alignItems: "center", background: "#f5f0fb", borderRadius: 30, padding: "10px 20px", width: "100%", maxWidth: 520, border: "1px solid #e0d5f5" },
  searchInput: { background: "none", border: "none", outline: "none", fontSize: 15, color: "#3b0f6e", width: "100%", fontFamily: "'Cormorant Garamond', serif" },
  main: { maxWidth: 1200, margin: "0 auto", padding: "50px 24px 80px" },
  collectionTitle: { fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 400, color: "#2d1f3d", marginBottom: 10 },
  collectionSub: { fontSize: 15, color: "#7c6d8a", fontStyle: "italic" },
  filters: { display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 40 },
  filterBtn: { background: "none", border: "1px solid #d5c8e8", borderRadius: 20, padding: "7px 18px", fontSize: 13, color: "#7c6d8a", cursor: "pointer", fontFamily: "'Cormorant Garamond', serif", transition: "all 0.2s ease" },
  filterBtnActive: { background: "#3b0f6e", borderColor: "#3b0f6e", color: "#fff" },
  stateBox: { textAlign: "center", padding: "60px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 },
  spinner: { width: 36, height: 36, border: "3px solid #e0d5f5", borderTop: "3px solid #6d28d9", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  stateText: { color: "#9d8ab5", fontStyle: "italic", fontSize: 16 },
  retryBtn: { background: "#3b0f6e", color: "#fff", border: "none", borderRadius: 20, padding: "9px 22px", fontSize: 14, cursor: "pointer", fontFamily: "'Cormorant Garamond', serif" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 28 },
  card: { background: "#fff", borderRadius: 16, overflow: "hidden", border: "1px solid #ede8f5", boxShadow: "0 2px 16px rgba(59,15,110,0.05)", display: "flex", flexDirection: "column" },
  imgWrap: { width: "100%", height: 200, overflow: "hidden", background: "#f5f0fb" },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  imgPlaceholder: { height: 140, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, background: "#f5f0fb" },
  cardCategory: { fontSize: 11, letterSpacing: "0.2em", color: "#9d8ab5", marginBottom: 8, textTransform: "uppercase" },
  cardName: { fontSize: 20, fontWeight: 600, color: "#2d1f3d", margin: "0 0 10px" },
  cardDesc: { fontSize: 14, color: "#7c6d8a", lineHeight: 1.6, flex: 1, marginBottom: 18, fontStyle: "italic" },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" },
  cardPrice: { fontSize: 20, fontWeight: 700, color: "#3b0f6e" },
  addBtn: { background: "#3b0f6e", color: "#fff", border: "none", borderRadius: 20, padding: "8px 16px", fontSize: 13, cursor: "pointer", fontFamily: "'Cormorant Garamond', serif", transition: "all 0.25s ease" },
  addBtnAdded: { background: "#16a34a" },
  footer: { background: "#1a0a2e", textAlign: "center", padding: "40px 24px", color: "#d4b8e0" },
  footerLogo: { display: "block", fontSize: 18, letterSpacing: "0.35em", color: "#c9a84c", marginBottom: 12 },
  footerText: { fontSize: 14, fontStyle: "italic", marginBottom: 8, opacity: 0.7 },
  footerCopy: { fontSize: 12, opacity: 0.4 },
  cartOverlay: { position: "fixed", inset: 0, background: "rgba(26,10,46,0.45)", zIndex: 200, display: "flex", justifyContent: "flex-end" },
  cartSidebar: { width: "100%", maxWidth: 420, background: "#fff", height: "100%", display: "flex", flexDirection: "column", boxShadow: "-4px 0 30px rgba(59,15,110,0.15)" },
  cartHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 28px", borderBottom: "1px solid #ede8f5", background: "#1a0a2e" },
  cartTitle: { color: "#fff", fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 400, margin: 0, letterSpacing: "0.1em" },
  closeBtn: { background: "none", border: "none", color: "#d4b8e0", fontSize: 18, cursor: "pointer" },
  cartEmpty: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: "#9d8ab5", fontSize: 16, fontStyle: "italic" },
  shopNowBtn: { marginTop: 10, background: "#3b0f6e", color: "#fff", border: "none", borderRadius: 20, padding: "10px 24px", fontSize: 14, cursor: "pointer", fontFamily: "'Cormorant Garamond', serif" },
  cartItems: { flex: 1, overflowY: "auto", padding: "16px 28px" },
  cartItem: { display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: "1px solid #f0eaf8" },
  cartThumb: { width: 52, height: 52, objectFit: "cover", borderRadius: 8, background: "#f5f0fb" },
  cartItemName: { fontSize: 15, color: "#2d1f3d", margin: "0 0 4px" },
  cartItemPrice: { fontSize: 13, color: "#9d8ab5", margin: "0 0 6px" },
  qtyRow: { display: "flex", alignItems: "center", gap: 8 },
  qtyBtn: { background: "#f0eaf8", border: "none", borderRadius: 8, width: 26, height: 26, cursor: "pointer", fontSize: 16, color: "#3b0f6e", display: "flex", alignItems: "center", justifyContent: "center" },
  qtyNum: { fontSize: 15, fontWeight: 600, color: "#2d1f3d", minWidth: 20, textAlign: "center" },
  removeBtn: { background: "none", border: "none", color: "#c4b5d4", cursor: "pointer", fontSize: 14 },
  cartFooter: { padding: "20px 28px", borderTop: "1px solid #ede8f5" },
  cartTotal: { display: "flex", justifyContent: "space-between", fontSize: 18, color: "#2d1f3d", marginBottom: 16 },
  checkoutBtn: { width: "100%", background: "#c9a84c", color: "#1a0a2e", border: "none", borderRadius: 24, padding: "14px", fontSize: 15, fontWeight: 700, letterSpacing: "0.1em", cursor: "pointer", fontFamily: "'Cormorant Garamond', serif" },
  overlay: { position: "fixed", inset: 0, background: "rgba(26,10,46,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
  modal: { background: "#fff", borderRadius: 20, width: "100%", maxWidth: 560, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(59,15,110,0.2)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px 28px", borderBottom: "1px solid #ede8f5", background: "#1a0a2e", borderRadius: "20px 20px 0 0" },
  modalTitle: { color: "#fff", fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, margin: 0, letterSpacing: "0.1em" },
  modalBody: { overflowY: "auto", padding: "24px 28px" },
  sectionLabel: { fontSize: 12, letterSpacing: "0.2em", color: "#9d8ab5", textTransform: "uppercase", marginBottom: 14, marginTop: 0 },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  fieldLabel: { display: "block", fontSize: 12, color: "#7c6d8a", letterSpacing: "0.08em", marginBottom: 5, fontFamily: "'Cormorant Garamond', serif" },
  input: { width: "100%", padding: "9px 14px", border: "1px solid #ddd5f0", borderRadius: 10, fontSize: 14, fontFamily: "'Cormorant Garamond', serif", color: "#2d1f3d", outline: "none", boxSizing: "border-box", background: "#faf8fd" },
  checkRow: { display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontFamily: "'Cormorant Garamond', serif", color: "#2d1f3d", marginBottom: 14, cursor: "pointer" },
  selectWrap: { marginBottom: 16 },
  select: { width: "100%", padding: "9px 14px", border: "1px solid #ddd5f0", borderRadius: 10, fontSize: 14, fontFamily: "'Cormorant Garamond', serif", color: "#2d1f3d", background: "#faf8fd", outline: "none" },
  summary: { background: "#f8f5fc", borderRadius: 12, padding: "16px 20px", marginBottom: 20, marginTop: 8 },
  summaryRow: { display: "flex", justifyContent: "space-between", fontSize: 15, fontFamily: "'Cormorant Garamond', serif", color: "#2d1f3d", marginBottom: 8 },
  error: { color: "#c0392b", fontSize: 13, fontFamily: "'Cormorant Garamond', serif", marginBottom: 12 },
  submitBtn: { width: "100%", background: "#c9a84c", color: "#1a0a2e", border: "none", borderRadius: 24, padding: "14px", fontSize: 15, fontWeight: 700, letterSpacing: "0.1em", cursor: "pointer", fontFamily: "'Cormorant Garamond', serif" },
};

// Add spinner keyframes
const style = document.createElement("style");
style.innerHTML = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(style);
