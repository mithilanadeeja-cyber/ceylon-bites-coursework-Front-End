import { Link, useNavigate } from "react-router";
import { useState, useRef, type FormEvent } from "react";
import { Trash2, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { useApp } from "../context/AppContext";
import { subtotal, deliveryFee, type Order } from "../types";
import { Empty, money, photo, Quantity } from "../components/Shared";
import { service, DEMO, errorMessage } from "../services/api";
export default function Cart({ checkout = false }: { checkout?: boolean }) {
  const {
      cart,
      change,
      remove,
      clear,
      user,
      notify,
      cartBusy,
      cartError,
      refreshCart,
    } = useApp(),
    navigate = useNavigate();
  const [address, setAddress] = useState(""),
    [phone, setPhone] = useState(""),
    [method, setMethod] = useState<Order["paymentMethod"]>("Cash on delivery"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const requestKey = useRef(crypto.randomUUID());
  const total = subtotal(cart) + deliveryFee(cart);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!user || busy || cartBusy) return;
    setBusy(true);
    setError("");
    try {
      const current = await service.foods();
      if (
        cart.some(
          (i) =>
            !current.some(
              (f) =>
                f.id === i.food.id && f.available && f.price === i.food.price,
            ),
        )
      )
        throw new Error(
          "A menu item has changed. Please update your cart before ordering.",
        );
      const order: Order = {
        id: requestKey.current,
        userId: user.id,
        items: cart,
        total,
        address: address.trim(),
        phone,
        status: "Placed",
        paymentMethod: method,
        paymentStatus:
          method === "Demo card"
            ? "Simulated payment — no charge"
            : "Due on delivery",
        createdAt: new Date().toISOString(),
      };
      const placed = await service.placeOrder(order);
      clear();
      notify("Your order has been placed");
      navigate("/orders/" + placed.id);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  if (cartBusy && !cart.length)
    return <div className="empty">Loading your saved cart…</div>;
  if (cartError && !cart.length)
    return (
      <div className="empty">
        <p role="alert">{cartError}</p>
        <button className="btn btn-primary" onClick={refreshCart}>
          Retry cart
        </button>
      </div>
    );
  if (!cart.length)
    return (
      <Empty
        title="Your next favourite is waiting"
        text="Add a little something from the menu to start your order."
      />
    );
  return (
    <section className="page-section">
      <Link className="back-link" to="/">
        <ArrowLeft size={16} /> Back to menu
      </Link>
      <div className="section-heading">
        <div>
          <span className="eyebrow muted">A LITTLE HAPPINESS TO GO</span>
          <h1>
            {checkout ? "Almost at your doorstep" : "Your bag of good things"}
          </h1>
          <p>
            {cart.reduce((n, i) => n + i.quantity, 0)} items, freshly prepared
            for you.
          </p>
        </div>
      </div>
      {!DEMO && (
        <div className="mb-3">
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={cartBusy}
            onClick={refreshCart}
          >
            Refresh saved cart
          </button>
          {cartError && (
            <p role="alert" className="text-danger mt-2">
              {cartError}
            </p>
          )}
        </div>
      )}
      <div className="checkout-grid">
        <div>
          {cart.map((i) => (
            <article className="cart-row" key={i.food.id}>
              <img src={photo(i.food.image)} alt={i.food.name} />
              <div className="cart-info">
                <h3>{i.food.name}</h3>
                <p>{money(i.food.price)} each</p>
                <Quantity
                  value={i.quantity}
                  onChange={(d) => change(i.food, d)}
                />
              </div>
              <strong>{money(i.food.price * i.quantity)}</strong>
              <button
                className="icon-button"
                aria-label={"Remove " + i.food.name}
                onClick={() => remove(i.food.id)}
              >
                <Trash2 size={18} />
              </button>
            </article>
          ))}
          {checkout && (
            <form id="checkout" className="panel mt-4" onSubmit={submit}>
              <h2>Delivery details</h2>
              <label className="field">
                Delivery address
                <textarea
                  className="form-control"
                  required
                  minLength={10}
                  maxLength={300}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House number, street, city"
                />
              </label>
              <label className="field">
                Phone number
                <input
                  className="form-control"
                  type="tel"
                  required
                  pattern="[+0-9 ()-]{9,20}"
                  title="Enter a phone number with 9–20 characters"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>
              <label className="field">
                Payment method
                <select
                  className="form-select"
                  value={method}
                  onChange={(e) =>
                    setMethod(e.target.value as Order["paymentMethod"])
                  }
                >
                  <option>Cash on delivery</option>
                  {DEMO && <option>Demo card</option>}
                </select>
              </label>
              {method === "Demo card" && (
                <p className="alert alert-info">
                  Simulated payment only. No card details are collected and no
                  money is charged.
                </p>
              )}
              {error && (
                <p className="alert alert-danger" role="alert">
                  {error}
                </p>
              )}
            </form>
          )}
        </div>
        <aside className="panel order-summary">
          <h2>Order summary</h2>
          <div>
            <span>Subtotal</span>
            <strong>{money(subtotal(cart))}</strong>
          </div>
          <div>
            <span>Delivery</span>
            <strong>{money(deliveryFee(cart))}</strong>
          </div>
          <hr />
          <div className="total">
            <span>Total</span>
            <strong>{money(total)}</strong>
          </div>
          {checkout ? (
            <button
              form="checkout"
              className="btn btn-primary w-100"
              disabled={busy || cartBusy}
            >
              {busy ? "Placing your order…" : "Place order"}{" "}
              <ArrowRight size={16} />
            </button>
          ) : (
            <Link className="btn btn-primary w-100" to="/checkout">
              Continue to checkout <ArrowRight size={16} />
            </Link>
          )}
          <p className="summary-note">
            <ShieldCheck size={16} />{" "}
            {DEMO
              ? "Demo order · no real delivery"
              : "Cash on delivery · payment collected after delivery"}
          </p>
        </aside>
      </div>
    </section>
  );
}
