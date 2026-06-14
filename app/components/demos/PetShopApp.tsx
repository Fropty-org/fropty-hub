"use client";

import { useState, useEffect } from "react";
import { Toast, type ToastState } from "./Toast";

const CATEGORIES = ["Ração", "Brinquedos", "Higiene", "Acessórios"];

const PRODUCTS = [
  { name: "Ração Premium", brand: "Royal Canin", price: "R$ 89", emoji: "🐾", cat: "Ração" },
  { name: "Bola Interativa", brand: "Kong", price: "R$ 34", emoji: "🎾", cat: "Brinquedos" },
  { name: "Shampoo Pet", brand: "Petlove", price: "R$ 22", emoji: "🧴", cat: "Higiene" },
  { name: "Coleira Ajustável", brand: "Furacão Pet", price: "R$ 45", emoji: "🔗", cat: "Acessórios" },
];

export function PetShopApp() {
  const [activeTab, setActiveTab] = useState(0);
  const [cart, setCart] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<ToastState>({ visible: false, message: "" });

  const showToast = (msg: string, color?: string) => {
    setToast({ visible: true, message: msg, color });
    setTimeout(() => setToast({ visible: false, message: "" }), 2000);
  };

  const addToCart = (name: string) => {
    setCart(prev => new Set([...prev, name]));
    showToast(`${name} adicionado!`, "#10b981");
  };

  useEffect(() => {
    const seq: [number, () => void][] = [
      [1500, () => setActiveTab(1)],
      [3000, () => setActiveTab(0)],
      [4200, () => { setCart(prev => new Set([...prev, "Ração Premium"])); setToast({ visible: true, message: "Ração Premium adicionado!", color: "#10b981" }); setTimeout(() => setToast({ visible: false, message: "" }), 2000); }],
      [6500, () => { setCart(prev => new Set([...prev, "Bola Interativa"])); setToast({ visible: true, message: "Bola Interativa adicionado!", color: "#10b981" }); setTimeout(() => setToast({ visible: false, message: "" }), 2000); }],
      [9000, () => { setCart(new Set()); setActiveTab(0); }],
    ];
    const timers = seq.map(([d, fn]) => setTimeout(fn, d));
    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = activeTab === 0 ? PRODUCTS : PRODUCTS.filter(p => p.cat === CATEGORIES[activeTab]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", fontFamily: "system-ui, sans-serif", position: "relative", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{ background: "#fff", padding: "10px 14px 8px", borderBottom: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>🐾 Pet Shop Vida Animal</div>
            <div style={{ fontSize: 9, color: "#94a3b8" }}>Delivery em até 2h</div>
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 20 }}>🛒</div>
            {cart.size > 0 && (
              <div style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%", background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#fff" }}>{cart.size}</div>
            )}
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div style={{ padding: "8px 12px", background: "#fff" }}>
        <div style={{ background: "#f1f5f9", borderRadius: 8, padding: "7px 12px", fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 6 }}>
          <span>🔍</span> Buscar produtos...
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "0 12px" }}>
        {["Todos", ...CATEGORIES].map((cat, i) => (
          <button key={cat} onClick={() => setActiveTab(i)} style={{ flex: 1, padding: "7px 0", background: "none", border: "none", borderBottom: `2px solid ${activeTab === i ? "#10b981" : "transparent"}`, color: activeTab === i ? "#10b981" : "#94a3b8", fontSize: 9, fontWeight: activeTab === i ? 700 : 400, cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap" }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Products */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {(filtered.length > 0 ? filtered : PRODUCTS).map((p, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "10px", border: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ width: "100%", height: 50, background: "#f8fafc", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{p.emoji}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>{p.name}</div>
              <div style={{ fontSize: 9, color: "#94a3b8" }}>{p.brand}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#10b981" }}>{p.price}</span>
                <button onClick={() => addToCart(p.name)} style={{ background: cart.has(p.name) ? "#d1fae5" : "#10b981", border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 10, fontWeight: 700, color: cart.has(p.name) ? "#059669" : "#fff", cursor: "pointer", transition: "all 0.2s" }}>
                  {cart.has(p.name) ? "✓" : "+ Carrinho"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{ height: 50, background: "#fff", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-around", flexShrink: 0 }}>
        {([["🏠","Início"],["🛍️","Produtos"],["❤️","Favoritos"],["👤","Conta"]] as [string,string][]).map(([icon, label]) => (
          <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <span style={{ fontSize: 16 }}>{icon}</span>
            <span style={{ fontSize: 8, color: "#94a3b8" }}>{label}</span>
          </div>
        ))}
      </div>

      <Toast visible={toast.visible} message={toast.message} color={toast.color} />
    </div>
  );
}
