import { useState, useEffect, useRef } from "react";

const GIFTS = [
  {
    id: 1,
    name: "Rose Petal Candle Set",
    price: 85,
    category: "Candles",
    emoji: "🕯️",
    description: "Hand-poured soy candles with dried rose petals and oud essence.",
    tag: "Bestseller",
  },
  {
    id: 2,
    name: "Silk Ribbon Gift Box",
    price: 120,
    category: "Gift Sets",
    emoji: "🎁",
    description: "Luxurious curated box wrapped in gold-trimmed silk ribbon.",
    tag: "New",
  },
  {
    id: 3,
    name: "Oud & Amber Perfume",
    price: 210,
    category: "Fragrance",
    emoji: "🌸",
    description: "A rare blend of oud wood, amber, and white musk. 50ml.",
    tag: "Exclusive",
  },
  {
    id: 4,
    name: "Gold Leaf Tea Collection",
    price: 65,
    category: "Food & Drink",
    emoji: "🍵",
    description: "12 artisan teas in a hand-painted lacquer box.",
    tag: null,
  },
  {
    id: 5,
    name: "Crystal Perfume Bottle",
    price: 155,
    category: "Fragrance",
    emoji: "💎",
    description: "Handcrafted Bohemian crystal bottle, refillable, engraved.",
    tag: "Exclusive",
  },
  {
    id: 6,
    name: "Velvet Jewelry Pouch",
    price: 45,
    category: "Accessories",
    emoji: "👜",
    description: "Deep plum velvet drawstring pouch with embroidered initials.",
    tag: null,
  },
  {
    id: 7,
    name: "Artisan Date Box",
    price: 78,
    category: "Food & Drink",
    emoji: "🌙",
    description: "Premium Medjool dates stuffed with pistachio, almond & saffron.",
    tag: "Bestseller",
  },
  {
    id: 8,
    name: "Pearl & Gold Bracelet",
    price: 195,
    category: "Accessories",
    emoji: "✨",
    description: "Freshwater pearls on an 18k gold-plated chain. Adjustable.",
    tag: "New",
  },
  {
    id: 9,
    name: "Saffron & Rose Face Oil",
    price: 92,
    category: "Beauty",
    emoji: "🌹",
    description: "Cold-pressed face oil infused with saffron, rose and vitamin E.",
    tag: null,
  },
];

const CATEGORIES = ["All", "Candles", "Gift Sets", "Fragrance", "Food & Drink", "Accessories", "Beauty"];

export default function App() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [addedId, setAddedId] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const filtered = GIFTS.filter((g) => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || g.category === activeCategory;
    return matchSearch && matchCat;
  });

  const cartCount = cart.reduce((a, b) => a + b.qty, 0);
  const cartTotal = cart.reduce((a, b) => a + b.price * b.qty, 0);

  const addToCart = (gift) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === gift.id);
      if (existing) return prev.map((c) => c.id === gift.id ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...gift, qty: 1 }];
    });
    setAddedId(gift.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((c) => c.id !== id));

  return (
    <div style={styles.root}>
      {/* Navbar */}
      <nav style={styles.nav}>
        <span style={styles.logo}>DON TROVE</span>
        <div style={styles.navRight}>
          <button style={styles.navLink} onClick={() => window.scrollTo({ top: 400, behavior: "smooth" })}>
            SHOP
          </button>
          <button style={styles.navLink} onClick={() => setCartOpen(true)}>MY CART</button>
          <button style={styles.cartBtn} onClick={() => setCartOpen(true)}>
            <span>🛒</span>
            <span>CART {cartCount > 0 && `(${cartCount})`}</span>
          </button>
        </div>
      </nav>

      {/* Hero */}
      <header ref={heroRef} style={styles.hero}>
        <div style={styles.heroBg} />
        <div style={styles.heroContent}>
          <p style={{ ...styles.heroTag, opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(10px)", transition: "all 0.6s ease 0.1s" }}>
            ✦ CURATED WITH LOVE
          </p>
          <h1 style={{ ...styles.heroTitle, opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(20px)", transition: "all 0.7s ease 0.2s" }}>
            Le Tresor De Misfah.
          </h1>
          <p style={{ ...styles.heroSub, opacity: loaded ? 1 : 0, transform: loaded ? "none" : "translateY(20px)", transition: "all 0.7s ease 0.35s" }}>
            Gifts as rare and radiant as the ones you cherish.
          </p>
        </div>
      </header>

      {/* Search */}
      <div style={styles.searchBar}>
        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            style={styles.searchInput}
            placeholder="Search gifts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Collection */}
      <main style={styles.main}>
        <div style={styles.collectionHeader}>
          <h2 style={styles.collectionTitle}>Our Collection</h2>
          <p style={styles.collectionSub}>Each gift is carefully selected to delight the ones you love</p>
        </div>

        {/* Category Filter */}
        <div style={styles.filters}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              style={{ ...styles.filterBtn, ...(activeCategory === cat ? styles.filterBtnActive : {}) }}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div style={styles.grid}>
          {filtered.length === 0 ? (
            <div style={styles.empty}>
              <p>No gifts found. Try a different search.</p>
            </div>
          ) : (
            filtered.map((gift, i) => (
              <div
                key={gift.id}
                style={{
                  ...styles.card,
                  opacity: loaded ? 1 : 0,
                  transform: loaded ? "none" : "translateY(24px)",
                  transition: `all 0.5s ease ${0.1 + i * 0.07}s`,
                }}
              >
                {gift.tag && (
                  <span style={{ ...styles.tag, ...(gift.tag === "Exclusive" ? styles.tagExclusive : gift.tag === "New" ? styles.tagNew : {}) }}>
                    {gift.tag}
                  </span>
                )}
                <div style={styles.cardEmoji}>{gift.emoji}</div>
                <div style={styles.cardCategory}>{gift.category}</div>
                <h3 style={styles.cardName}>{gift.name}</h3>
                <p style={styles.cardDesc}>{gift.description}</p>
                <div style={styles.cardFooter}>
                  <span style={styles.cardPrice}>SAR {gift.price}</span>
                  <button
                    style={{ ...styles.addBtn, ...(addedId === gift.id ? styles.addBtnAdded : {}) }}
                    onClick={() => addToCart(gift)}
                  >
                    {addedId === gift.id ? "✓ Added" : "+ Add to Cart"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <span style={styles.footerLogo}>DON TROVE</span>
        <p style={styles.footerText}>Le Tresor De Misfah — Curated with love, delivered with care.</p>
        <p style={styles.footerCopy}>© {new Date().getFullYear()} Don Trove. All rights reserved.</p>
      </footer>

      {/* Cart Sidebar */}
      {cartOpen && (
        <div style={styles.cartOverlay} onClick={() => setCartOpen(false)}>
          <div style={styles.cartSidebar} onClick={(e) => e.stopPropagation()}>
            <div style={styles.cartHeader}>
              <h2 style={styles.cartTitle}>My Cart</h2>
              <button style={styles.closeBtn} onClick={() => setCartOpen(false)}>✕</button>
            </div>
            {cart.length === 0 ? (
              <div style={styles.cartEmpty}>
                <p>🛒</p>
                <p>Your cart is empty.</p>
                <button style={styles.shopNowBtn} onClick={() => setCartOpen(false)}>Shop Now</button>
              </div>
            ) : (
              <>
                <div style={styles.cartItems}>
                  {cart.map((item) => (
                    <div key={item.id} style={styles.cartItem}>
                      <span style={styles.cartEmoji}>{item.emoji}</span>
                      <div style={styles.cartItemInfo}>
                        <p style={styles.cartItemName}>{item.name}</p>
                        <p style={styles.cartItemPrice}>SAR {item.price} × {item.qty}</p>
                      </div>
                      <button style={styles.removeBtn} onClick={() => removeFromCart(item.id)}>✕</button>
                    </div>
                  ))}
                </div>
                <div style={styles.cartFooter}>
                  <div style={styles.cartTotal}>
                    <span>Total</span>
                    <span style={{ fontWeight: 700 }}>SAR {cartTotal}</span>
                  </div>
                  <button style={styles.checkoutBtn}>Proceed to Checkout</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  root: {
    fontFamily: "'Cormorant Garamond', 'Georgia', serif",
    background: "#f8f6f2",
    minHeight: "100vh",
    color: "#2d1f3d",
  },
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 40px",
    height: 60,
    background: "#1a0a2e",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  logo: {
    color: "#fff",
    fontSize: 18,
    fontWeight: 400,
    letterSpacing: "0.35em",
    fontFamily: "'Cormorant Garamond', serif",
  },
  navRight: { display: "flex", alignItems: "center", gap: 24 },
  navLink: {
    background: "none",
    border: "none",
    color: "#d4b8e0",
    fontSize: 12,
    letterSpacing: "0.15em",
    cursor: "pointer",
    padding: "6px 12px",
    fontFamily: "'Cormorant Garamond', serif",
  },
  cartBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#c9a84c",
    color: "#1a0a2e",
    border: "none",
    borderRadius: 20,
    padding: "7px 18px",
    fontSize: 12,
    letterSpacing: "0.1em",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'Cormorant Garamond', serif",
  },
  hero: {
    position: "relative",
    minHeight: 320,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  heroBg: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(135deg, #3b0f6e 0%, #6d28d9 55%, #c084fc 100%)",
  },
  heroContent: {
    position: "relative",
    textAlign: "center",
    padding: "60px 20px 70px",
    zIndex: 2,
  },
  heroTag: {
    color: "#c9a84c",
    fontSize: 12,
    letterSpacing: "0.35em",
    marginBottom: 16,
    display: "block",
    fontFamily: "'Cormorant Garamond', serif",
  },
  heroTitle: {
    color: "#fff",
    fontSize: "clamp(36px, 6vw, 68px)",
    fontWeight: 400,
    margin: "0 0 18px",
    fontFamily: "'Cormorant Garamond', serif",
    lineHeight: 1.15,
  },
  heroSub: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
    fontStyle: "italic",
    fontFamily: "'Cormorant Garamond', serif",
  },
  searchBar: {
    background: "#fff",
    padding: "20px 40px",
    display: "flex",
    justifyContent: "center",
    borderBottom: "1px solid #ede8f5",
    boxShadow: "0 2px 12px rgba(109,40,217,0.06)",
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    background: "#f5f0fb",
    borderRadius: 30,
    padding: "10px 20px",
    width: "100%",
    maxWidth: 520,
    border: "1px solid #e0d5f5",
  },
  searchIcon: { marginRight: 10, fontSize: 16, opacity: 0.5 },
  searchInput: {
    background: "none",
    border: "none",
    outline: "none",
    fontSize: 15,
    color: "#3b0f6e",
    width: "100%",
    fontFamily: "'Cormorant Garamond', serif",
  },
  main: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "50px 24px 80px",
  },
  collectionHeader: { textAlign: "center", marginBottom: 36 },
  collectionTitle: {
    fontSize: "clamp(28px, 4vw, 42px)",
    fontWeight: 400,
    color: "#2d1f3d",
    marginBottom: 10,
    fontFamily: "'Cormorant Garamond', serif",
  },
  collectionSub: {
    fontSize: 15,
    color: "#7c6d8a",
    fontStyle: "italic",
    fontFamily: "'Cormorant Garamond', serif",
  },
  filters: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    marginBottom: 40,
  },
  filterBtn: {
    background: "none",
    border: "1px solid #d5c8e8",
    borderRadius: 20,
    padding: "7px 18px",
    fontSize: 13,
    color: "#7c6d8a",
    cursor: "pointer",
    fontFamily: "'Cormorant Garamond', serif",
    transition: "all 0.2s ease",
    letterSpacing: "0.05em",
  },
  filterBtnActive: {
    background: "#3b0f6e",
    borderColor: "#3b0f6e",
    color: "#fff",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 28,
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: 28,
    position: "relative",
    border: "1px solid #ede8f5",
    boxShadow: "0 2px 16px rgba(59,15,110,0.05)",
    display: "flex",
    flexDirection: "column",
    transition: "all 0.5s ease",
  },
  tag: {
    position: "absolute",
    top: 18,
    right: 18,
    background: "#c9a84c",
    color: "#1a0a2e",
    fontSize: 11,
    fontWeight: 700,
    borderRadius: 10,
    padding: "3px 10px",
    letterSpacing: "0.08em",
    fontFamily: "'Cormorant Garamond', serif",
  },
  tagExclusive: { background: "#3b0f6e", color: "#fff" },
  tagNew: { background: "#7c3aed", color: "#fff" },
  cardEmoji: { fontSize: 38, marginBottom: 14 },
  cardCategory: {
    fontSize: 11,
    letterSpacing: "0.2em",
    color: "#9d8ab5",
    marginBottom: 8,
    textTransform: "uppercase",
    fontFamily: "'Cormorant Garamond', serif",
  },
  cardName: {
    fontSize: 20,
    fontWeight: 600,
    color: "#2d1f3d",
    margin: "0 0 10px",
    fontFamily: "'Cormorant Garamond', serif",
  },
  cardDesc: {
    fontSize: 14,
    color: "#7c6d8a",
    lineHeight: 1.6,
    flex: 1,
    marginBottom: 18,
    fontFamily: "'Cormorant Garamond', serif",
    fontStyle: "italic",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
  },
  cardPrice: {
    fontSize: 20,
    fontWeight: 700,
    color: "#3b0f6e",
    fontFamily: "'Cormorant Garamond', serif",
  },
  addBtn: {
    background: "#3b0f6e",
    color: "#fff",
    border: "none",
    borderRadius: 20,
    padding: "8px 16px",
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "'Cormorant Garamond', serif",
    letterSpacing: "0.04em",
    transition: "all 0.25s ease",
  },
  addBtnAdded: {
    background: "#16a34a",
  },
  empty: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "60px 20px",
    color: "#9d8ab5",
    fontSize: 16,
    fontStyle: "italic",
    fontFamily: "'Cormorant Garamond', serif",
  },
  footer: {
    background: "#1a0a2e",
    textAlign: "center",
    padding: "40px 24px",
    color: "#d4b8e0",
  },
  footerLogo: {
    display: "block",
    fontSize: 18,
    letterSpacing: "0.35em",
    color: "#c9a84c",
    marginBottom: 12,
    fontFamily: "'Cormorant Garamond', serif",
  },
  footerText: {
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 8,
    fontFamily: "'Cormorant Garamond', serif",
    opacity: 0.7,
  },
  footerCopy: {
    fontSize: 12,
    opacity: 0.4,
    fontFamily: "'Cormorant Garamond', serif",
  },
  cartOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(26,10,46,0.45)",
    zIndex: 200,
    display: "flex",
    justifyContent: "flex-end",
  },
  cartSidebar: {
    width: "100%",
    maxWidth: 400,
    background: "#fff",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    boxShadow: "-4px 0 30px rgba(59,15,110,0.15)",
  },
  cartHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px 28px",
    borderBottom: "1px solid #ede8f5",
    background: "#1a0a2e",
  },
  cartTitle: {
    color: "#fff",
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 24,
    fontWeight: 400,
    margin: 0,
    letterSpacing: "0.1em",
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#d4b8e0",
    fontSize: 18,
    cursor: "pointer",
  },
  cartEmpty: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    color: "#9d8ab5",
    fontSize: 16,
    fontFamily: "'Cormorant Garamond', serif",
    fontStyle: "italic",
  },
  shopNowBtn: {
    marginTop: 10,
    background: "#3b0f6e",
    color: "#fff",
    border: "none",
    borderRadius: 20,
    padding: "10px 24px",
    fontSize: 14,
    cursor: "pointer",
    fontFamily: "'Cormorant Garamond', serif",
    letterSpacing: "0.08em",
  },
  cartItems: { flex: 1, overflowY: "auto", padding: "16px 28px" },
  cartItem: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "14px 0",
    borderBottom: "1px solid #f0eaf8",
  },
  cartEmoji: { fontSize: 28 },
  cartItemInfo: { flex: 1 },
  cartItemName: {
    fontSize: 15,
    fontFamily: "'Cormorant Garamond', serif",
    color: "#2d1f3d",
    margin: "0 0 4px",
  },
  cartItemPrice: {
    fontSize: 13,
    color: "#9d8ab5",
    fontFamily: "'Cormorant Garamond', serif",
    margin: 0,
  },
  removeBtn: {
    background: "none",
    border: "none",
    color: "#c4b5d4",
    cursor: "pointer",
    fontSize: 14,
  },
  cartFooter: {
    padding: "20px 28px",
    borderTop: "1px solid #ede8f5",
  },
  cartTotal: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 18,
    fontFamily: "'Cormorant Garamond', serif",
    color: "#2d1f3d",
    marginBottom: 16,
  },
  checkoutBtn: {
    width: "100%",
    background: "#c9a84c",
    color: "#1a0a2e",
    border: "none",
    borderRadius: 24,
    padding: "14px",
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: "0.1em",
    cursor: "pointer",
    fontFamily: "'Cormorant Garamond', serif",
  },
};
