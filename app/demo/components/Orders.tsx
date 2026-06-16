"use client";

import { useState } from "react";
import type { CartItem, Order, Product } from "./data";

type Props = {
  cartItems: CartItem[];
  onUpdateCart: (items: CartItem[]) => void;
  orders: Order[];
  onAddOrder: (order: Order) => void;
  addToast: (type: "success" | "error" | "warning" | "info", message: string) => void;
  isOpen: boolean;
  onClose: () => void;
};

function randomId() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function formatDate(date: Date) {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear();
  const h = date.getHours().toString().padStart(2, "0");
  const min = date.getMinutes().toString().padStart(2, "0");
  return `${d}/${m}/${y} ${h}:${min}`;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function hoursAgo(n: number) {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d;
}

const FAKE_PRODUCTS: Record<string, Product> = {
  bolo: {
    id: 3,
    name: "Bolo de Cenoura",
    price: 45,
    category: "Bolos & Tortas",
    stock: 6,
    available: true,
    description: "",
    color: "#E85D26",
    image: "https://picsum.photos/seed/carrot-cake/400/300",
  },
  pao: {
    id: 6,
    name: "Pão de Queijo (10 un)",
    price: 18,
    category: "Pães & Croissants",
    stock: 30,
    available: true,
    description: "",
    color: "#D4A837",
    image: "https://picsum.photos/seed/cheese-bread-rolls/400/300",
  },
  kit: {
    id: 4,
    name: "Kit Festa (6 un)",
    price: 42,
    category: "Kits & Combos",
    stock: 12,
    available: true,
    description: "",
    color: "#5B57E8",
    image: "https://picsum.photos/seed/party-food-platter/400/300",
  },
  croissant: {
    id: 2,
    name: "Croissant de Presunto",
    price: 12,
    category: "Pães & Croissants",
    stock: 18,
    available: true,
    description: "",
    color: "#C2783A",
    image: "https://picsum.photos/seed/croissant-ham/400/300",
  },
  cafe: {
    id: 5,
    name: "Café Especial 250g",
    price: 7,
    category: "Bebidas",
    stock: 0,
    available: false,
    description: "",
    color: "#6B4423",
    image: "https://picsum.photos/seed/specialty-coffee/400/300",
  },
};

const INITIAL_ORDERS: Order[] = [
  {
    id: "1041",
    customer: "Juliana Ferreira",
    status: "delivered",
    date: daysAgo(3),
    discount: 0,
    total: 81,
    items: [
      { product: FAKE_PRODUCTS.bolo, qty: 1 },
      { product: FAKE_PRODUCTS.pao, qty: 2 },
    ],
  },
  {
    id: "1042",
    customer: "Ana Paula",
    status: "preparing",
    date: hoursAgo(2),
    discount: 0,
    total: 66,
    items: [
      { product: FAKE_PRODUCTS.kit, qty: 1 },
      { product: FAKE_PRODUCTS.croissant, qty: 2 },
    ],
  },
  {
    id: "1043",
    customer: "Ricardo Almeida",
    status: "cancelled",
    date: daysAgo(7),
    discount: 0,
    total: 21,
    items: [{ product: FAKE_PRODUCTS.cafe, qty: 3 }],
  },
];

function statusConfig(status: Order["status"]) {
  switch (status) {
    case "delivered":
      return {
        label: "Entregue",
        icon: "ti-circle-check",
        color: "#10B981",
        bg: "rgba(16,185,129,0.15)",
      };
    case "preparing":
      return {
        label: "Em preparo",
        icon: "ti-clock",
        color: "#EF9F27",
        bg: "rgba(239,159,39,0.15)",
      };
    case "cancelled":
      return {
        label: "Cancelado",
        icon: "ti-circle-x",
        color: "#EF4444",
        bg: "rgba(239,68,68,0.15)",
      };
  }
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = statusConfig(order.status);

  return (
    <div
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 16px",
          cursor: "pointer",
        }}
        onClick={() => setExpanded((v) => !v)}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>
              #{order.id}
            </span>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{order.customer}</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 2 }}>
            {formatDate(order.date)}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span style={{ fontWeight: 800, fontSize: 15, color: "var(--text)" }}>
            R${order.total.toFixed(2).replace(".", ",")}
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              fontWeight: 600,
              color: cfg.color,
              background: cfg.bg,
              borderRadius: 999,
              padding: "3px 10px",
            }}
          >
            <i className={`ti ${cfg.icon}`} style={{ fontSize: 13 }} />
            {cfg.label}
          </span>
          <i
            className={`ti ${expanded ? "ti-chevron-up" : "ti-chevron-down"}`}
            style={{ fontSize: 16, color: "var(--text-faint)" }}
          />
        </div>
      </div>

      {/* Expanded items */}
      {expanded && (
        <div
          style={{
            borderTop: "1px solid var(--border)",
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {order.items.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: 13,
              }}
            >
              <span style={{ color: "var(--text-muted)" }}>
                {item.product.name}{" "}
                <span style={{ color: "var(--text-faint)" }}>× {item.qty}</span>
              </span>
              <div style={{ display: "flex", gap: 12, color: "var(--text-muted)" }}>
                <span>R${item.product.price.toFixed(2).replace(".", ",")} un</span>
                <span style={{ fontWeight: 600, color: "var(--text)" }}>
                  R${(item.product.price * item.qty).toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>
          ))}

          {order.discount > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
                paddingTop: 8,
                borderTop: "1px solid var(--border)",
              }}
            >
              <span style={{ color: "#10B981" }}>Desconto aplicado</span>
              <span style={{ color: "#10B981", fontWeight: 600 }}>
                -R${order.discount.toFixed(2).replace(".", ",")}
              </span>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 14,
              fontWeight: 700,
              paddingTop: 8,
              borderTop: "1px solid var(--border)",
              color: "var(--text)",
            }}
          >
            <span>Total</span>
            <span>R${order.total.toFixed(2).replace(".", ",")}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Orders({
  cartItems,
  onUpdateCart,
  orders,
  onAddOrder,
  addToast,
  isOpen,
  onClose,
}: Props) {
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponError, setCouponError] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0
  );
  const discountAmount = appliedDiscount > 0 ? subtotal * appliedDiscount : 0;
  const total = subtotal - discountAmount;

  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === "FROPTY10") {
      setAppliedDiscount(0.1);
      setCouponApplied(true);
      setCouponError("");
      addToast("success", "Cupom FROPTY10 aplicado! 10% de desconto.");
    } else {
      setCouponError("Cupom inválido");
      setCouponApplied(false);
      setAppliedDiscount(0);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setAppliedDiscount(0);
    setCouponApplied(false);
    setCouponError("");
  };

  const handleUpdateQty = (product: Product, delta: number) => {
    const updated = cartItems
      .map((item) =>
        item.product.id === product.id
          ? { ...item, qty: item.qty + delta }
          : item
      )
      .filter((item) => item.qty > 0);
    onUpdateCart(updated);
  };

  const handleRemoveItem = (product: Product) => {
    onUpdateCart(cartItems.filter((item) => item.product.id !== product.id));
  };

  const handleCheckout = () => {
    const orderId = randomId();
    const order: Order = {
      id: orderId,
      items: [...cartItems],
      total,
      discount: discountAmount,
      status: "preparing",
      date: new Date(),
      customer: "Visitante",
    };
    onAddOrder(order);
    onUpdateCart([]);
    setCouponCode("");
    setAppliedDiscount(0);
    setCouponApplied(false);
    setCouponError("");
    addToast("success", `Pedido #${orderId} realizado com sucesso!`);
    onClose();
  };

  // Combine seed orders + runtime orders for display
  const [seedOrders] = useState<Order[]>(() => INITIAL_ORDERS);
  const allOrders = [...orders, ...seedOrders];

  return (
    <>
      {/* Drawer overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 499,
          }}
        />
      )}

      {/* Cart Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: isOpen ? 0 : -400,
          width: "min(360px, 100vw)",
          height: "100vh",
          background: "var(--surface)",
          borderLeft: "1px solid var(--border)",
          zIndex: 500,
          transition: "right 0.3s ease",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Drawer header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 20px",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <i className="ti ti-shopping-cart" style={{ fontSize: 20, color: "var(--primary)" }} />
            <span style={{ fontWeight: 800, fontSize: 17, color: "var(--text)" }}>Carrinho</span>
            {cartItems.length > 0 && (
              <span
                style={{
                  background: "var(--primary)",
                  color: "#fff",
                  borderRadius: 999,
                  padding: "2px 8px",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {cartItems.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "var(--surface-2)",
              border: "none",
              borderRadius: 8,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-muted)",
              fontSize: 16,
            }}
          >
            <i className="ti ti-x" />
          </button>
        </div>

        {/* Cart items */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "12px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {cartItems.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                height: "100%",
                padding: "40px 0",
              }}
            >
              <i
                className="ti ti-shopping-cart-off"
                style={{ fontSize: 48, color: "var(--text-faint)" }}
              />
              <span style={{ color: "var(--text-muted)", fontSize: 14 }}>
                Seu carrinho está vazio
              </span>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.product.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "var(--card-bg)",
                  border: "1px solid var(--card-border)",
                  borderRadius: 10,
                  padding: "10px 12px",
                }}
              >
                {/* Color dot */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: `linear-gradient(135deg, ${item.product.color}cc, ${item.product.color}55)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontSize: 13,
                    fontWeight: 800,
                    color: "rgba(255,255,255,0.9)",
                  }}
                >
                  {item.product.name.charAt(0)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.product.name}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    R${item.product.price.toFixed(2).replace(".", ",")} un
                  </div>
                </div>

                {/* Qty stepper */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    flexShrink: 0,
                  }}
                >
                  <button
                    onClick={() => handleUpdateQty(item.product, -1)}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      border: "1px solid var(--border)",
                      background: "var(--surface-2)",
                      color: "var(--text-muted)",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    -
                  </button>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--text)",
                      minWidth: 18,
                      textAlign: "center",
                    }}
                  >
                    {item.qty}
                  </span>
                  <button
                    onClick={() => handleUpdateQty(item.product, 1)}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      border: "1px solid var(--border)",
                      background: "var(--surface-2)",
                      color: "var(--text-muted)",
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    +
                  </button>
                </div>

                {/* Item total */}
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--primary)",
                    minWidth: 50,
                    textAlign: "right",
                    flexShrink: 0,
                  }}
                >
                  R${(item.product.price * item.qty).toFixed(2).replace(".", ",")}
                </span>

                {/* Trash */}
                <button
                  onClick={() => handleRemoveItem(item.product)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#EF4444",
                    fontSize: 16,
                    padding: 2,
                    display: "flex",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <i className="ti ti-trash" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Bottom area: coupon + summary + checkout */}
        {cartItems.length > 0 && (
          <div
            style={{
              borderTop: "1px solid var(--border)",
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              flexShrink: 0,
            }}
          >
            {/* Coupon */}
            {couponApplied ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "rgba(16,185,129,0.1)",
                  border: "1px solid rgba(16,185,129,0.3)",
                  borderRadius: 8,
                  padding: "8px 12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <i className="ti ti-tag" style={{ color: "#10B981", fontSize: 14 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#10B981" }}>
                    FROPTY10 — 10% de desconto
                  </span>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#10B981",
                    fontSize: 14,
                  }}
                >
                  <i className="ti ti-x" />
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      setCouponError("");
                    }}
                    placeholder="Código de cupom"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      background: "var(--input-bg)",
                      border: `1px solid ${couponError ? "#EF4444" : "var(--border)"}`,
                      borderRadius: 8,
                      padding: "8px 10px",
                      fontSize: 13,
                      color: "var(--text)",
                      outline: "none",
                    }}
                  />
                  {couponError && (
                    <span style={{ fontSize: 11, color: "#EF4444" }}>{couponError}</span>
                  )}
                </div>
                <button
                  onClick={handleApplyCoupon}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--surface-2)",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  Aplicar
                </button>
              </div>
            )}

            {/* Summary */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--text-muted)" }}>Subtotal</span>
                <span style={{ color: "var(--text)" }}>
                  R${subtotal.toFixed(2).replace(".", ",")}
                </span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "#10B981" }}>Desconto (10%)</span>
                  <span style={{ color: "#10B981", fontWeight: 600 }}>
                    -R${discountAmount.toFixed(2).replace(".", ",")}
                  </span>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 18,
                  fontWeight: 800,
                  paddingTop: 8,
                  borderTop: "1px solid var(--border)",
                  color: "var(--text)",
                }}
              >
                <span>Total</span>
                <span>R${total.toFixed(2).replace(".", ",")}</span>
              </div>
            </div>

            {/* Checkout button */}
            <button
              onClick={handleCheckout}
              style={{
                width: "100%",
                padding: "13px 0",
                borderRadius: 10,
                border: "none",
                background: "var(--primary)",
                color: "#fff",
                fontWeight: 800,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              Finalizar pedido
            </button>
          </div>
        )}
      </div>

      {/* Orders History */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", margin: 0 }}>
            Histórico de Pedidos
          </h2>
          <span
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 999,
              padding: "2px 10px",
              fontSize: 13,
              fontWeight: 700,
              color: "var(--text-muted)",
            }}
          >
            {allOrders.length}
          </span>
        </div>

        {allOrders.length === 0 ? (
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
              className="ti ti-shopping-bag"
              style={{ fontSize: 48, color: "var(--text-faint)" }}
            />
            <span style={{ fontSize: 15, color: "var(--text-muted)" }}>
              Nenhum pedido ainda
            </span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {allOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
