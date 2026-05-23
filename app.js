import { useState, useEffect } from "react";

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwdLxaq6fbvbTM2yNtUl0mOaodAUebJZZBdFxFaVbiXXhP3vept-ojDtcZJMkLFUwfJ1Q/exec";
const DELIVERY_FEE = 200;
const GIFT_WRAP_FEE = 300;

// ─── Field Component ──────────────────────────────────────────────────────────
function Field({ label, value, onChange, textarea, type = "text" }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={S.fieldLabel}>{label}</label>
      {textarea
        ? <textarea style={{ ...S.input, height: 72, resize: "vertical" }} value={value} onChange={e => onChange(e.target.value)} />
        : <input style={S.input} type={type} value={value} onChange={e => onChange(e.target.value)} />}
    </div>
  );
}

// ─── Checkout View ────────────────────────────────────────────────────────────
function CheckoutView({ cart, giftWrap, onBack, onSuccess }) {
  const subtotal   = cart.reduce((a, b) => a + Number(b.price) * b.qty, 0);
  const wrapFee    = giftWrap ? GIFT_WRAP_FEE : 0;
  const grandTotal = subtotal + DELIVERY_FEE + wrapFee;

  const [form, setForm] = useState({
    senderName: "", phone: "", email: "", recipientName: "",
    address: "", deliveryDate: "", occasion: "", giftMessage: "",
    paymentMethod: "Cash on Delivery",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const PAYMENT_OPTS = [
    { icon: "💵", label: "Cash on Delivery" },
    { icon: "📱", label: "EasyPaisa" },
    { icon: "🏦", label: "JazzCash" },
    { icon: "🔁", label: "Bank Transfer" },
  ];

  const handleSubmit = async () => {
    if (!form.senderName || !form.phone || !form.recipientName || !form.address || !form.deliveryDate) {
      setError("Please fill in all required fields marked with *");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const orderRef = "DT-" + Date.now();
      const payload = {
        orderRef,
        dateTime:      new Date().toLocaleString(),
        senderName:    form.senderName,
        phone:         form.phone,
        email:         form.email,
        recipientName: form.recipientName,
        address:       form.address,
        deliveryDate:  form.deliveryDate,
        occasion:      form.occasion,
        giftMessage:   form.giftMessage,
        items:         cart.map(c => `${c.name} x${c.qty}`).join(", "),
        subtotal,
        giftWrap:      wrapFee,
        deliveryFee:   DELIVERY_FEE,
        total:         grandTotal,
        paymentMethod: form.paymentMethod,
      };
      await fetch(SCRIPT_URL, {
        method: "POST",
        body:   JSON.stringify(payload),
      });
      onSuccess(orderRef);
    } catch (e) {
      setError("Something went wrong. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <div style={S.checkoutGrid}>
      {/* ── Left: Form ── */}
      <div>
        {/* Sender */}
        <div style={S.formSection}>
          <div style={S.formSectionTitle}><span style={S.formIcon}>👤</span> Your Information</div>
          <div style={S.row2}>
            <Field label="Your Name *" value={form.senderName} onChange={v => set("senderName", v)} />
            <Field label="Phone *" value={form.phone} onChange={v => set("phone", v)} />
          </div>
          <Field label="Email" value={form.email} onChange={v => set("email", v)} />
        </div>

        {/* Recipient */}
        <div style={S.formSection}>
          <div style={S.formSectionTitle}><span style={S.formIcon}>🎁</span> Recipient Details</div>
          <div style={S.row2}>
            <Field label="Recipient Name *" value={form.recipientName} onChange={v => set("recipientName", v)} />
            <div style={{ marginBottom: 14 }}>
              <label style={S.fieldLabel}>Occasion</label>
              <select style={S.input} value={form.occasion} onChange={e => set("occasion", e.target.value)}>
                <option value="">Select occasion</option>
                {["Birthday","Anniversary","Wedding","Baby Shower","Graduation","Eid","Just Because","Other"].map(o => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>
          <Field label="Delivery Address *" value={form.address} onChange={v => set("address", v)} textarea />
          <div style={S.row2}>
            <Field label="Preferred Delivery Date *" type="date" value={form.deliveryDate} onChange={v => set("deliveryDate", v)} />
            <Field label="Gift Message" value={form.giftMessage} onChange={v => set("giftMessage", v)} />
          </div>
        </div>

        {/* Payment */}
        <div style={S.formSection}>
          <div style={S.formSectionTitle}><span style={S.formIcon}>💳</span> Payment Method</div>
          <div style={S.paymentGrid}>
            {PAYMENT_OPTS.map(opt => (
              <div key={opt.label}
                style={{ ...S.paymentOpt, ...(form.paymentMethod === opt.label ? S.paymentOptSelected : {}) }}
                onClick={() => set("paymentMethod", opt.label)}>
                <span style={{ fontSize: 24, display: "block", marginBottom: 6 }}>{opt.icon}</span>
                <span style={{ fontSize: 12, color: "#7A6890", fontWeight: 500 }}>{opt.label}</span>
              </div>
            ))}
          </div>
        </div>

        {error && <p style={S.errorMsg}>{error}</p>}
        <button style={{ ...S.placeOrderBtn, opacity: submitting ? 0.6 : 1 }} onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Placing Order…" : "✦ Confirm & Place Order"}
        </button>
      </div>

      {/* ── Right: Summary ── */}
      <div style={S.checkoutSummary}>
        <div style={S.summaryTitle}>Your Order</div>
        {cart.map(item => (
          <div key={item.name} style={S.checkoutItemRow}>
            <div>
              <div style={{ fontSize: 14, color: "#1A0630" }}>{item.name}</div>
              <div style={{ fontSize: 12, color: "#7A6890" }}>×{item.qty}</div>
            </div>
            <div style={{ fontWeight: 600, color: "#4B1A8C", fontSize: 14 }}>
              PKR {(Number(item.price) * item.qty).toLocaleString()}
            </div>
          </div>
        ))}
        <div style={{ borderTop: "1px solid #F3EBF9", marginTop: 12, paddingTop: 14 }}>
          <div style={S.summaryRow}><span>Subtotal</span><span>PKR {subtotal.toLocaleString()}</span></div>
          <div style={S.summaryRow}><span>Gift Wrap</span><span>{wrapFee ? `PKR ${wrapFee}` : "—"}</span></div>
          <div style={S.summaryRow}><span>Delivery</span><span>PKR {DELIVERY_FEE}</span></div>
          <div style={{ ...S.summaryRow, fontWeight: 700, fontSize: 16, color: "#2D0A4E", marginTop: 8 }}>
            <span>Total</span><span>PKR {grandTotal.toLocaleString()}</span>
          </div>
        </div>
        <button style={S.backBtn} onClick={onBack}>← Back to Cart</button>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [products,      setProducts]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [fetchError,    setFetchError]    = useState("");
  const [search,        setSearch]        = useState("");
  const [activeCategory,setActiveCategory]= useState("All");
  const [cart,          setCart]          = useState([]);
  const [view,          setView]          = useState("shop"); // shop | cart | checkout | success
  const [giftWrap,      setGiftWrap]      = useState(false);
  const [successRef,    setSuccessRef]    = useState("");
  const [addedName,     setAddedName]     = useState(null);
  const [loaded,        setLoaded]        = useState(false);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 200);
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res  = await fetch(`${SCRIPT_URL}?t=${Date.now()}`);
      const data = await res.json();
      // Script returns array of {name, price, description, imageUrl, category}
      const arr = Array.isArray(data) ? data : (data.products || []);
      setProducts(arr);
    } catch (e) {
      setFetchError("Unable to load products. Please check your connection and try again.");
    }
    setLoading(false);
  };

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
    const matchCat    = activeCategory === "All" || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  const cartCount   = cart.reduce((a, b) => a + b.qty, 0);
  const cartSubtotal= cart.reduce((a, b) => a + Number(b.price) * b.qty, 0);
  const wrapFee     = giftWrap ? GIFT_WRAP_FEE : 0;
  const cartTotal   = cartSubtotal + DELIVERY_FEE + wrapFee;

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(c => c.name === product.name);
      if (existing) return prev.map(c => c.name === product.name ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...product, qty: 1 }];
    });
    setAddedName(product.name);
    setTimeout(() => setAddedName(null), 1200);
  };

  const removeFromCart = (name) => setCart(prev => prev.filter(c => c.name !== name));
  const updateQty      = (name, delta) => setCart(prev =>
    prev.map(c => c.name === name ? { ...c, qty: Math.max(1, c.qty + delta) } : c)
  );

  const handleOrderSuccess = (ref) => {
    setCart([]);
    setGiftWrap(false);
    setSuccessRef(ref);
    setView("success");
  };

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div style={S.root}>

      {/* ── Header ── */}
      <header style={S.header}>
        <a style={S.brand} onClick={() => setView("shop")} href="#">
          <span style={{ color: "#EDE8DC", fontStyle: "italic" }}>Don</span> Trove
        </a>
        <nav style={S.headerNav}>
          <button style={{ ...S.navBtn, ...(view === "shop" ? S.navBtnActive : {}) }} onClick={() => setView("shop")}>Shop</button>
          <button style={S.navBtn} onClick={() => setView("cart")}>My Cart</button>
          <button style={S.cartNavBtn} onClick={() => setView("cart")}>
            🛍️ Cart
            {cartCount > 0 && <span style={S.cartBadge}>{cartCount}</span>}
          </button>
        </nav>
      </header>

      {/* ── Hero (only on shop view) ── */}
      {view === "shop" && (
        <div style={S.hero}>
          <div style={S.heroOrb1} /><div style={S.heroOrb2} />
          <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
            <div style={S.heroTag}>✦ Curated with love</div>
            <h1 style={{ ...S.heroTitle, opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(20px)", transition: "all 0.7s ease 0.2s" }}>
              Le Tresor De Misfah.
            </h1>
            <p style={{ ...S.heroSub, opacity: loaded ? 1 : 0, transition: "all 0.7s ease 0.35s" }}>
              Gifts as rare and radiant as the ones you cherish.
            </p>
          </div>
        </div>
      )}

      {/* ── Search + Category Tabs (shop only) ── */}
      {view === "shop" && (
        <div style={S.tabsWrap}>
          <div style={S.searchWrap}>
            <svg width="15" height="15" fill="none" stroke="#7B3FC4" strokeWidth="2" viewBox="0 0 24 24" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input style={S.searchInput} placeholder="Search gifts…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={S.tabsRow}>
            {categories.map(cat => (
              <button key={cat} style={{ ...S.tab, ...(activeCategory === cat ? S.tabActive : {}) }}
                onClick={() => setActiveCategory(cat)}>{cat}</button>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          SHOP VIEW
      ══════════════════════════════════════════════════ */}
      {view === "shop" && (
        <div style={S.viewWrap}>
          <p style={S.sectionTitle}>Our Collection</p>
          <p style={S.sectionSub}>Each gift is carefully selected to delight the ones you love</p>

          {loading && (
            <div style={S.stateBox}>
              <div style={S.spinner} />
              <p style={{ color: "#7A6890", marginTop: 14 }}>Loading beautiful gifts…</p>
            </div>
          )}
          {fetchError && (
            <div style={S.stateBox}>
              <p style={{ color: "#c0392b", marginBottom: 14 }}>{fetchError}</p>
              <button style={S.retryBtn} onClick={fetchProducts}>Try Again</button>
            </div>
          )}
          {!loading && !fetchError && (
            <>
              {filtered.length > 0 && (
                <p style={S.resultsMeta}>Showing <strong>{filtered.length}</strong> gift{filtered.length !== 1 ? "s" : ""}</p>
              )}
              <div style={S.grid}>
                {filtered.length === 0 ? (
                  <p style={{ gridColumn: "1/-1", textAlign: "center", color: "#7A6890", padding: "60px 20px", fontStyle: "italic" }}>
                    No gifts match your search.
                  </p>
                ) : filtered.map((product, i) => (
                  <div key={product.name + i} style={{
                    ...S.card,
                    opacity: loaded ? 1 : 0,
                    transform: loaded ? "none" : "translateY(24px)",
                    transition: `opacity 0.5s ease ${0.05 + i * 0.06}s, transform 0.5s ease ${0.05 + i * 0.06}s`,
                  }}>
                    <div style={S.cardImgWrap}>
                      {product.imageUrl
                        ? <img src={product.imageUrl} alt={product.name} style={S.cardImg} onError={e => { e.target.style.display = "none"; }} />
                        : <div style={S.cardImgPlaceholder}>🎁</div>}
                    </div>
                    <div style={{ padding: "18px 20px 20px" }}>
                      {product.category && <div style={S.cardCategory}>{product.category}</div>}
                      <h3 style={S.cardName}>{product.name}</h3>
                      {product.description && (
                        <p style={S.cardDesc}>{product.description}</p>
                      )}
                      <div style={S.cardFooter}>
                        <span style={S.cardPrice}>PKR {Number(product.price).toLocaleString()}</span>
                        <button
                          style={{ ...S.addBtn, ...(addedName === product.name ? S.addBtnAdded : {}) }}
                          onClick={() => addToCart(product)}
                        >
                          {addedName === product.name ? "✓ Added" : "+ Add to Cart"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          CART VIEW
      ══════════════════════════════════════════════════ */}
      {view === "cart" && (
        <div style={S.viewWrap}>
          <p style={S.sectionTitle}>Your Cart</p>
          <p style={S.sectionSub}>Review your selections before proceeding</p>

          {cart.length === 0 ? (
            <div style={S.stateBox}>
              <span style={{ fontSize: 56 }}>🛍️</span>
              <p style={{ color: "#7A6890", marginTop: 14, fontSize: 16 }}>Your cart is empty.</p>
              <button style={S.retryBtn} onClick={() => setView("shop")}>Browse Gifts</button>
            </div>
          ) : (
            <div style={S.cartLayout}>
              {/* Cart items */}
              <div>
                {cart.map(item => (
                  <div key={item.name} style={S.cartItem}>
                    <div style={S.cartItemImg}>
                      {item.imageUrl
                        ? <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                        : "🎁"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={S.cartItemName}>{item.name}</div>
                      <div style={S.cartItemPrice}>PKR {Number(item.price).toLocaleString()} each</div>
                      <div style={S.qtyRow}>
                        <button style={S.qtyBtn} onClick={() => updateQty(item.name, -1)}>−</button>
                        <span style={S.qtyNum}>{item.qty}</span>
                        <button style={S.qtyBtn} onClick={() => updateQty(item.name, 1)}>+</button>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700, color: "#4B1A8C", marginBottom: 8 }}>
                        PKR {(Number(item.price) * item.qty).toLocaleString()}
                      </div>
                      <button style={S.removeBtn} onClick={() => removeFromCart(item.name)}>✕ Remove</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div style={S.orderSummary}>
                <div style={S.summaryTitle}>Order Summary</div>
                <div style={S.summaryRow}><span>Subtotal</span><span>PKR {cartSubtotal.toLocaleString()}</span></div>
                <div style={{ ...S.wrapOption }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14 }}>
                    <input type="checkbox" checked={giftWrap} onChange={e => setGiftWrap(e.target.checked)}
                      style={{ accentColor: "#7B3FC4", width: 16, height: 16 }} />
                    🎁 Premium Gift Wrapping — PKR {GIFT_WRAP_FEE}
                  </label>
                </div>
                <div style={S.summaryRow}><span>Delivery Fee</span><span>PKR {DELIVERY_FEE}</span></div>
                <div style={{ ...S.summaryRow, ...S.summaryTotal }}>
                  <span>Total</span><span>PKR {cartTotal.toLocaleString()}</span>
                </div>
                <button style={S.checkoutBtn} onClick={() => setView("checkout")}>
                  Place Order →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          CHECKOUT VIEW
      ══════════════════════════════════════════════════ */}
      {view === "checkout" && (
        <div style={S.viewWrap}>
          <p style={S.sectionTitle}>Order Details</p>
          <p style={S.sectionSub}>Tell us where to send your thoughtful gift</p>
          <CheckoutView
            cart={cart}
            giftWrap={giftWrap}
            onBack={() => setView("cart")}
            onSuccess={handleOrderSuccess}
          />
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          SUCCESS VIEW
      ══════════════════════════════════════════════════ */}
      {view === "success" && (
        <div style={S.viewWrap}>
          <div style={S.successView}>
            <div style={S.successIcon}>✦</div>
            <h2 style={S.successTitle}>Order Placed!</h2>
            <p style={{ color: "#7A6890", marginBottom: 6 }}>Thank you for shopping with Don Trove.</p>
            <p style={{ color: "#7A6890", marginBottom: 12 }}>Your reference number is:</p>
            <div style={S.orderRefBadge}>{successRef}</div>
            <p style={S.successNote}>
              We'll contact you shortly to confirm your order. Expect your gift to arrive beautifully wrapped and right on time. 💜
            </p>
            <button style={S.backShopBtn} onClick={() => setView("shop")}>Continue Shopping</button>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer style={S.footer}>
        <span style={S.footerLogo}><span style={{ fontStyle: "italic" }}>Don</span> Trove</span>
        <p style={S.footerText}>Le Tresor De Misfah — Curated with love, delivered with care.</p>
        <p style={S.footerCopy}>© {new Date().getFullYear()} Don Trove. All rights reserved.</p>
      </footer>

    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  root: { fontFamily: "'DM Sans', sans-serif", background: "#FAF6FF", minHeight: "100vh", color: "#1A0630", paddingTop: 68 },

  // Header
  header:       { position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(45,10,78,0.96)", backdropFilter: "blur(18px)", borderBottom: "1px solid rgba(196,168,232,0.18)", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 },
  brand:        { fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", fontWeight: 300, letterSpacing: "0.18em", color: "#F5F0E8", textTransform: "uppercase", textDecoration: "none", cursor: "pointer" },
  headerNav:    { display: "flex", alignItems: "center", gap: 8 },
  navBtn:       { background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "#F5F0E8", padding: "8px 18px", borderRadius: 40, transition: "all 0.25s" },
  navBtnActive: { background: "rgba(245,240,232,0.15)" },
  cartNavBtn:   { position: "relative", background: "#C9A84C", color: "#2D0A4E", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", padding: "8px 22px 8px 18px", borderRadius: 40 },
  cartBadge:    { position: "absolute", top: -5, right: -5, background: "#7B3FC4", color: "#fff", borderRadius: "50%", width: 19, height: 19, fontSize: "0.68rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" },

  // Hero
  hero:         { background: "linear-gradient(135deg, #2D0A4E 0%, #4B1A8C 60%, #7B3FC4 100%)", position: "relative", overflow: "hidden", padding: "90px 24px 80px", textAlign: "center" },
  heroOrb1:     { position: "absolute", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, #7B3FC4, transparent 70%)", filter: "blur(70px)", opacity: 0.35, top: -160, left: -120, pointerEvents: "none" },
  heroOrb2:     { position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, #C9A84C, transparent 70%)", filter: "blur(70px)", opacity: 0.35, bottom: -120, right: -80, pointerEvents: "none" },
  heroTag:      { display: "inline-block", fontSize: "0.78rem", fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "#E8C97A", marginBottom: 18 },
  heroTitle:    { fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.4rem, 6vw, 4.2rem)", fontWeight: 300, color: "#F5F0E8", letterSpacing: "0.04em", lineHeight: 1.1, marginBottom: 16, margin: "0 0 16px" },
  heroSub:      { fontSize: "1rem", color: "#EDE8DC", opacity: 0.85, maxWidth: 480, margin: "0 auto" },

  // Tabs / Search
  tabsWrap:     { display: "flex", flexDirection: "column", alignItems: "center", gap: 12, background: "#fff", padding: "16px 24px", borderBottom: "1px solid rgba(123,63,196,0.12)", position: "sticky", top: 68, zIndex: 80, boxShadow: "0 2px 20px rgba(45,10,78,0.06)" },
  searchWrap:   { position: "relative", width: "100%", maxWidth: 440 },
  searchInput:  { width: "100%", padding: "10px 16px 10px 42px", border: "1.5px solid #E8DDF5", borderRadius: 40, fontFamily: "'DM Sans', sans-serif", fontSize: "0.88rem", color: "#1A0630", background: "#F3EBF9", outline: "none" },
  tabsRow:      { display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 },
  tab:          { background: "none", border: "1.5px solid transparent", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7A6890", padding: "9px 26px", borderRadius: 40, transition: "all 0.2s" },
  tabActive:    { background: "#4B1A8C", color: "#fff", borderColor: "#4B1A8C", boxShadow: "0 4px 16px rgba(75,26,140,0.3)" },

  // Main view wrapper
  viewWrap:     { maxWidth: 1180, margin: "0 auto", padding: "40px 24px 80px" },
  sectionTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: 400, color: "#2D0A4E", textAlign: "center", marginBottom: 8, letterSpacing: "0.03em" },
  sectionSub:   { textAlign: "center", color: "#7A6890", fontSize: "0.88rem", marginBottom: 36 },
  resultsMeta:  { textAlign: "center", fontSize: "0.8rem", color: "#7A6890", marginBottom: 24 },

  // States
  stateBox:     { textAlign: "center", padding: "80px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 },
  spinner:      { width: 44, height: 44, borderRadius: "50%", border: "3px solid #F3EBF9", borderTop: "3px solid #4B1A8C", animation: "spin 1s linear infinite" },
  retryBtn:     { background: "#4B1A8C", color: "#fff", border: "none", borderRadius: 40, padding: "11px 28px", fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, letterSpacing: "0.08em" },

  // Product Grid
  grid:         { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 28 },
  card:         { background: "#fff", borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 32px rgba(75,26,140,0.13)", border: "1px solid rgba(123,63,196,0.08)", display: "flex", flexDirection: "column" },
  cardImgWrap:  { width: "100%", height: 220, overflow: "hidden", background: "linear-gradient(135deg,#F0E8F8,#E8D8F5)" },
  cardImg:      { width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" },
  cardImgPlaceholder: { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, color: "#C4A8E8" },
  cardCategory: { fontSize: 11, letterSpacing: "0.18em", color: "#7A6890", marginBottom: 6, textTransform: "uppercase" },
  cardName:     { fontFamily: "'Cormorant Garamond', serif", fontSize: "1.22rem", fontWeight: 600, color: "#2D0A4E", marginBottom: 6, margin: "0 0 6px" },
  cardDesc:     { fontSize: "0.82rem", color: "#7A6890", lineHeight: 1.5, marginBottom: 14, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  cardFooter:   { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" },
  cardPrice:    { fontFamily: "'Cormorant Garamond', serif", fontSize: "1.35rem", fontWeight: 600, color: "#4B1A8C" },
  addBtn:       { background: "linear-gradient(135deg,#4B1A8C,#7B3FC4)", color: "#fff", border: "none", cursor: "pointer", padding: "9px 20px", borderRadius: 30, fontSize: "0.8rem", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", transition: "all 0.2s", boxShadow: "0 3px 12px rgba(75,26,140,0.3)" },
  addBtnAdded:  { background: "linear-gradient(135deg,#1A7A4A,#27ae60)" },

  // Cart
  cartLayout:   { display: "grid", gridTemplateColumns: "1fr 340px", gap: 32 },
  cartItem:     { display: "flex", gap: 16, alignItems: "flex-start", background: "#fff", borderRadius: 14, padding: 16, marginBottom: 14, boxShadow: "0 4px 32px rgba(75,26,140,0.13)", border: "1px solid rgba(123,63,196,0.07)" },
  cartItemImg:  { width: 72, height: 72, borderRadius: 10, background: "linear-gradient(135deg,#F0E8F8,#E8D8F5)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", color: "#C4A8E8", overflow: "hidden" },
  cartItemName: { fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", fontWeight: 600, color: "#2D0A4E", marginBottom: 3 },
  cartItemPrice:{ fontSize: "0.85rem", color: "#7A6890", marginBottom: 8 },
  qtyRow:       { display: "flex", alignItems: "center", gap: 10 },
  qtyBtn:       { width: 28, height: 28, borderRadius: "50%", border: "1.5px solid #C4A8E8", background: "none", cursor: "pointer", fontSize: "1rem", color: "#4B1A8C", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.2s" },
  qtyNum:       { fontWeight: 600, fontSize: "0.95rem", minWidth: 20, textAlign: "center" },
  removeBtn:    { background: "none", border: "none", cursor: "pointer", color: "#C4A8E8", fontSize: "0.78rem", letterSpacing: "0.05em" },

  // Order Summary (cart sidebar)
  orderSummary: { background: "#fff", borderRadius: 18, padding: 26, boxShadow: "0 4px 32px rgba(75,26,140,0.13)", border: "1px solid rgba(123,63,196,0.08)", position: "sticky", top: 138, height: "fit-content" },
  summaryTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 600, color: "#2D0A4E", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid #F3EBF9" },
  summaryRow:   { display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: "0.9rem" },
  summaryTotal: { borderTop: "1px solid #F3EBF9", paddingTop: 12, marginTop: 12, fontWeight: 700, fontSize: "1.05rem", color: "#2D0A4E" },
  wrapOption:   { margin: "16px 0", padding: 14, background: "#F3EBF9", borderRadius: 10 },
  checkoutBtn:  { width: "100%", padding: 14, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#2D0A4E,#4B1A8C)", color: "#fff", borderRadius: 40, fontSize: "0.9rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 18, transition: "0.25s", boxShadow: "0 6px 24px rgba(45,10,78,0.35)", fontFamily: "'DM Sans', sans-serif" },

  // Checkout form
  checkoutGrid:    { display: "grid", gridTemplateColumns: "1fr 360px", gap: 32 },
  formSection:     { background: "#fff", borderRadius: 18, padding: 28, boxShadow: "0 4px 32px rgba(75,26,140,0.13)", marginBottom: 20, border: "1px solid rgba(123,63,196,0.07)" },
  formSectionTitle:{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem", fontWeight: 600, color: "#2D0A4E", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 },
  formIcon:        { width: 30, height: 30, background: "#F3EBF9", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" },
  row2:            { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  fieldLabel:      { display: "block", fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7A6890", marginBottom: 6 },
  input:           { width: "100%", padding: "11px 14px", border: "1.5px solid #E8DDF5", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontSize: "0.92rem", color: "#1A0630", background: "#FAF6FF", outline: "none", boxSizing: "border-box" },
  paymentGrid:     { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  paymentOpt:      { border: "1.5px solid #E8DDF5", borderRadius: 12, padding: 14, cursor: "pointer", transition: "0.2s", textAlign: "center" },
  paymentOptSelected: { borderColor: "#4B1A8C", background: "#F3EBF9" },
  placeOrderBtn:   { width: "100%", padding: 16, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#C9A84C,#A07020)", color: "#2D0A4E", borderRadius: 40, fontSize: "0.95rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 8, transition: "0.25s", boxShadow: "0 6px 24px rgba(201,168,76,0.4)", fontFamily: "'DM Sans', sans-serif" },
  errorMsg:        { color: "#c0392b", fontSize: 13, marginBottom: 12, padding: "10px 14px", background: "#FEF0F0", borderRadius: 8 },
  backBtn:         { width: "100%", marginTop: 16, padding: "10px 0", border: "1.5px solid #E8DDF5", borderRadius: 40, background: "none", cursor: "pointer", color: "#7A6890", fontSize: 13, fontFamily: "'DM Sans', sans-serif" },

  // Checkout summary sidebar
  checkoutSummary: { background: "#fff", borderRadius: 18, padding: 26, boxShadow: "0 4px 32px rgba(75,26,140,0.13)", border: "1px solid rgba(123,63,196,0.08)", position: "sticky", top: 138 },
  checkoutItemRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F3EBF9" },

  // Success
  successView:   { textAlign: "center", padding: "60px 24px" },
  successIcon:   { width: 100, height: 100, borderRadius: "50%", background: "linear-gradient(135deg,#4B1A8C,#7B3FC4)", margin: "0 auto 28px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", boxShadow: "0 8px 32px rgba(75,26,140,0.4)" },
  successTitle:  { fontFamily: "'Cormorant Garamond', serif", fontSize: "2.2rem", fontWeight: 400, color: "#2D0A4E", marginBottom: 12 },
  orderRefBadge: { display: "inline-block", background: "#F3EBF9", border: "1px solid #C4A8E8", color: "#4B1A8C", padding: "8px 24px", borderRadius: 40, fontWeight: 600, fontSize: "1.05rem", margin: "16px 0 28px", fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.08em" },
  successNote:   { color: "#7A6890", fontSize: "0.88rem", maxWidth: 400, margin: "0 auto 28px" },
  backShopBtn:   { background: "linear-gradient(135deg,#4B1A8C,#7B3FC4)", color: "#fff", border: "none", padding: "12px 36px", borderRadius: 40, cursor: "pointer", fontSize: "0.9rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", boxShadow: "0 4px 18px rgba(75,26,140,0.35)", fontFamily: "'DM Sans', sans-serif" },

  // Footer
  footer:       { background: "#2D0A4E", textAlign: "center", padding: "40px 24px", color: "#C4A8E8" },
  footerLogo:   { display: "block", fontFamily: "'Cormorant Garamond', serif", fontSize: 22, letterSpacing: "0.2em", color: "#E8C97A", marginBottom: 12, textTransform: "uppercase" },
  footerText:   { fontSize: 14, fontStyle: "italic", marginBottom: 8, opacity: 0.7 },
  footerCopy:   { fontSize: 12, opacity: 0.4 },
};

// Inject keyframes
if (typeof document !== "undefined") {
  const s = document.createElement("style");
  s.innerHTML = `
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
  `;
  document.head.appendChild(s);
}
