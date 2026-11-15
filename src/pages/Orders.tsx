import { Link, useParams } from "react-router";
import { RefreshCw, Check, Package } from "lucide-react";
import { useApp } from "../context/AppContext";
import { service, errorMessage } from "../services/api";
import { useLoad, LoadState, Empty, money } from "../components/Shared";
import type { Order } from "../types";
export default function Orders({ payments = false }: { payments?: boolean }) {
  const { user, notify } = useApp(),
    { id } = useParams();
  const load = useLoad(() => service.orders(user!), [user?.id]);
  const order = load.data?.find((o) => o.id === id);
  async function update(o: Order, status: Order["status"]) {
    try {
      await service.updateOrder({ ...o, status });
      load.reload();
      notify("Order status updated");
    } catch (e) {
      notify(errorMessage(e));
    }
  }
  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow muted">FROM OUR KITCHEN TO YOUR TABLE</span>
          <h1>
            {payments
              ? "Payment history"
              : id
                ? "Your order"
                : user?.role === "ADMIN"
                  ? "All orders"
                  : "Your orders"}
          </h1>
        </div>
        <button className="btn btn-outline-secondary" onClick={load.reload}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>
      <LoadState {...load} retry={load.reload} />
      {!load.loading &&
        !load.error &&
        (id ? (
          order ? (
            <div className="panel">
              <div className="order-top">
                <h2>Order #{order.id.slice(0, 8).toUpperCase()}</h2>
                <span className="status">{order.status}</span>
              </div>
              <p>{new Date(order.createdAt).toLocaleString()}</p>
              {order.status !== "Cancelled" && (
                <div className="progress-steps">
                  {["Placed", "Preparing", "Delivered"].map((s, i) => (
                    <div
                      key={s}
                      className={
                        i <=
                        ["Placed", "Preparing", "Delivered"].indexOf(
                          order.status,
                        )
                          ? "done"
                          : ""
                      }
                    >
                      <span>
                        <Check size={16} />
                      </span>
                      {s}
                    </div>
                  ))}
                </div>
              )}
              {order.items.map((i) => (
                <div className="receipt-row" key={i.food.id}>
                  <span>
                    {i.quantity} × {i.food.name}
                  </span>
                  <strong>{money(i.food.price * i.quantity)}</strong>
                </div>
              ))}
              <div className="receipt-row">
                <span>Total including delivery</span>
                <strong>{money(order.total)}</strong>
              </div>
              <hr />
              <p>
                <strong>Delivery to:</strong> {order.address}
              </p>
              <p>
                <strong>Phone:</strong> {order.phone}
              </p>
              <p>
                <strong>Payment:</strong> {order.paymentMethod} ·{" "}
                {order.paymentStatus}
              </p>
              <Link to="/orders">View all orders</Link>
            </div>
          ) : (
            <Empty
              title="Order not found"
              text="This order is not available for your account."
            />
          )
        ) : load.data?.length ? (
          <div className="order-list">
            {load.data.map((o) => (
              <article key={o.id} className="panel order-card">
                <Package size={28} />
                <div>
                  <h3>Order #{o.id.slice(0, 8).toUpperCase()}</h3>
                  <p>
                    {new Date(o.createdAt).toLocaleDateString()} ·{" "}
                    {o.items.reduce((s, i) => s + i.quantity, 0)} items
                  </p>
                  {payments && (
                    <small>
                      {o.paymentMethod} · {o.paymentStatus}
                    </small>
                  )}
                </div>
                <strong>{money(o.total)}</strong>
                <span className="status">{o.status}</span>
                {user?.role === "ADMIN" && (
                  <select
                    aria-label="Update order status"
                    className="form-select status-select"
                    value={o.status}
                    onChange={(e) =>
                      update(o, e.target.value as Order["status"])
                    }
                  >
                    {["Placed", "Preparing", "Delivered", "Cancelled"].map(
                      (s) => (
                        <option key={s}>{s}</option>
                      ),
                    )}
                  </select>
                )}
                <Link to={"/orders/" + o.id}>View details →</Link>
              </article>
            ))}
          </div>
        ) : (
          <Empty
            title={
              payments ? "No payments yet" : "Your story starts with a meal"
            }
            text="Once you place an order, you will find it here."
          />
        ))}
    </section>
  );
}
