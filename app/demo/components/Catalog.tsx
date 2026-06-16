"use client";

import { useState, useEffect, useCallback } from "react";
import type { Product, CartItem } from "./data";
import { INITIAL_PRODUCTS } from "./data";

type Props = {
  cartItems: CartItem[];
  onAddToCart: (product: Product) => void;
  addToast: (type: "success" | "error" | "warning" | "info", message: string) => void;
};

function SkeletonCard() {
  return (
    <div
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          height: 140,
          background: "var(--surface-2)",
          animation: "pulse 1.4s ease-in-out infinite",
        }}
      />
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ height: 14, borderRadius: 6, background: "var(--surface-2)", width: "70%", animation: "pulse 1.4s ease-in-out infinite" }} />
        <div style={{ height: 12, borderRadius: 6, background: "var(--surface-2)", width: "40%", animation: "pulse 1.4s ease-in-out infinite" }} />
        <div style={{ height: 20, borderRadius: 6, background: "var(--surface-2)", width: "50%", animation: "pulse 1.4s ease-in-out infinite" }} />
        <div style={{ height: 32, borderRadius: 8, background: "var(--surface-2)", animation: "pulse 1.4s ease-in-out infinite" }} />
      </div>
    </div>
  );
}

function ProductCard({
  product,
  onAddToCart,
  addToast,
  onToggleAvailable,
  onClick,
}: {
  product: Product;
  onAddToCart: (product: Product) => void;
  addToast: (type: "success" | "error" | "warning" | "info", message: string) => void;
  onToggleAvailable: (id: number) => void;
  onClick: () => void;
}) {
  const [animating, setAnimating] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock === 0 || !product.available) return;
    setAnimating(true);
    setTimeout(() => setAnimating(false), 200);
    onAddToCart(product);
    addToast("success", `${product.name} adicionado ao carrinho!`);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleAvailable(product.id);
  };

  const stockBadge = () => {
    if (product.stock === 0) return { label: "Esgotado", color: "#EF4444", bg: "rgba(239,68,68,0.12)" };
    if (product.stock < 5) return { label: "Estoque baixo", color: "#EF9F27", bg: "rgba(239,159,39,0.12)" };
    return { label: "Em estoque", color: "#10B981", bg: "rgba(16,185,129,0.12)" };
  };

  const badge = stockBadge();
  const disabled = product.stock === 0 || !product.available;

  // Initials from product name
  const initials = product.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        borderRadius: 12,
        overflow: "hidden",
        cursor: "pointer",
        transition: "box-shadow 0.2s, transform 0.15s",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.25)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* Image area */}
      <div
        style={{
          width: "100%",
          height: 140,
          borderRadius: "10px 10px 0 0",
          overflow: "hidden",
          position: "relative",
          background: `${product.color}22`,
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          loading="lazy"
        />
        {!product.available && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 13, background: "rgba(0,0,0,0.6)", padding: "4px 12px", borderRadius: 20 }}>Indisponível</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", lineHeight: 1.3 }}>
            {product.name}
          </span>
          <span
            style={{
              fontSize: 10,
              background: "var(--surface)",
              borderRadius: 999,
              padding: "2px 8px",
              color: "var(--text-muted)",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {product.category}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: "var(--primary)" }}>
            R${product.price.toFixed(2).replace(".", ",")}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: badge.color,
              background: badge.bg,
              borderRadius: 999,
              padding: "2px 8px",
            }}
          >
            {badge.label}
          </span>
        </div>

        {/* Availability toggle */}
        <div
          onClick={handleToggle}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            marginTop: 2,
          }}
        >
          <div
            style={{
              width: 30,
              height: 16,
              borderRadius: 999,
              background: product.available ? "#10B981" : "var(--surface-2)",
              position: "relative",
              transition: "background 0.2s",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: "#fff",
                position: "absolute",
                top: 2,
                left: product.available ? 16 : 2,
                transition: "left 0.2s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
              }}
            />
          </div>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {product.available ? "Disponível" : "Pausado"}
          </span>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Add to cart button */}
        <button
          onClick={handleAddToCart}
          disabled={disabled}
          style={{
            width: "100%",
            padding: "9px 0",
            borderRadius: 10,
            border: "none",
            background: disabled ? "var(--surface-2)" : "var(--primary)",
            color: disabled ? "var(--text-faint)" : "#fff",
            fontWeight: 700,
            fontSize: 13,
            cursor: disabled ? "not-allowed" : "pointer",
            transform: animating ? "scale(0.95)" : "scale(1)",
            transition: "transform 0.15s, background 0.2s",
            marginTop: 4,
          }}
        >
          {product.stock === 0
            ? "Esgotado"
            : !product.available
            ? "Indisponível"
            : "Adicionar ao carrinho"}
        </button>
      </div>
    </div>
  );
}

function ProductModal({
  product,
  onClose,
  onAddToCart,
  addToast,
}: {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  addToast: (type: "success" | "error" | "warning" | "info", message: string) => void;
}) {
  const disabled = product.stock === 0 || !product.available;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleAdd = () => {
    if (disabled) return;
    onAddToCart(product);
    addToast("success", `${product.name} adicionado ao carrinho!`);
    onClose();
  };

  const initials = product.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        zIndex: 800,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 480,
          width: "100%",
          background: "var(--surface)",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
      >
        {/* Product image */}
        <div style={{ height: 160, overflow: "hidden", position: "relative", background: `${product.color}22` }}>
          <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
        {/* Content */}
        <div style={{ padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", margin: 0 }}>
              {product.name}
            </h2>
            <span
              style={{
                fontSize: 11,
                background: "var(--surface-2)",
                borderRadius: 999,
                padding: "3px 10px",
                color: "var(--text-muted)",
                whiteSpace: "nowrap",
              }}
            >
              {product.category}
            </span>
          </div>

          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, margin: "0 0 16px" }}>
            {product.description}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: "var(--primary)" }}>
              R${product.price.toFixed(2).replace(".", ",")}
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color:
                  product.stock === 0
                    ? "#EF4444"
                    : product.stock < 5
                    ? "#EF9F27"
                    : "#10B981",
                background:
                  product.stock === 0
                    ? "rgba(239,68,68,0.12)"
                    : product.stock < 5
                    ? "rgba(239,159,39,0.12)"
                    : "rgba(16,185,129,0.12)",
                borderRadius: 999,
                padding: "3px 10px",
              }}
            >
              {product.stock === 0
                ? "Esgotado"
                : product.stock < 5
                ? `Estoque baixo (${product.stock} un)`
                : `${product.stock} em estoque`}
            </span>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handleAdd}
              disabled={disabled}
              style={{
                flex: 1,
                padding: "11px 0",
                borderRadius: 10,
                border: "none",
                background: disabled ? "var(--surface-2)" : "var(--primary)",
                color: disabled ? "var(--text-faint)" : "#fff",
                fontWeight: 700,
                fontSize: 14,
                cursor: disabled ? "not-allowed" : "pointer",
              }}
            >
              {disabled ? "Indisponível" : "Adicionar ao carrinho"}
            </button>
            <button
              onClick={onClose}
              style={{
                padding: "11px 20px",
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--text-muted)",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Catalog({ cartItems, onAddToCart, addToast }: Props) {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  const categories = ["Todos", ...Array.from(new Set(products.map((p) => p.category)))];

  const filtered = products.filter((p) => {
    const matchesSearch =
      search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "Todos" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleToggleAvailable = useCallback((id: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, available: !p.available } : p))
    );
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {/* Search */}
      <div style={{ position: "relative" }}>
        <i
          className="ti ti-search"
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-faint)",
            fontSize: 16,
            pointerEvents: "none",
          }}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar produtos..."
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: "var(--input-bg)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: "10px 14px 10px 38px",
            fontSize: 14,
            color: "var(--text)",
            outline: "none",
          }}
        />
      </div>

      {/* Category tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 2,
          scrollbarWidth: "none",
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              border: "none",
              background: activeCategory === cat ? "var(--primary)" : "var(--surface)",
              color: activeCategory === cat ? "#fff" : "var(--text-muted)",
              fontWeight: activeCategory === cat ? 700 : 500,
              fontSize: 13,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "background 0.15s, color 0.15s",
              flexShrink: 0,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            padding: "64px 0",
          }}
        >
          <i
            className="ti ti-search"
            style={{ fontSize: 48, color: "var(--text-faint)" }}
          />
          <span style={{ fontSize: 16, color: "var(--text-muted)", fontWeight: 500 }}>
            Nenhum produto encontrado
          </span>
          <button
            onClick={() => {
              setSearch("");
              setActiveCategory("Todos");
            }}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-muted)",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              addToast={addToast}
              onToggleAvailable={handleToggleAvailable}
              onClick={() => setSelectedProduct(product)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={onAddToCart}
          addToast={addToast}
        />
      )}
    </div>
  );
}
