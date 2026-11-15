import { useState } from "react";
import { Link } from "react-router";
import { service, errorMessage, DEMO } from "../services/api";
import { useLoad, LoadState, Empty, money } from "../components/Shared";
import { useApp } from "../context/AppContext";
import Orders from "./Orders";
export default function Payments() {
  if (DEMO) return <Orders payments />;
  return <RealPayments />;
}
function RealPayments() {
  const { user, notify } = useApp(),
    load = useLoad(() => service.payments());
  const [busy, setBusy] = useState("");
  async function update(id: string, status: "COMPLETED" | "FAILED") {
    setBusy(id);
    try {
      await service.updatePayment(id, status);
      notify("Payment record updated");
      load.reload();
    } catch (e) {
      notify(errorMessage(e));
    } finally {
      setBusy("");
    }
  }
  return (
    <section className="page-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow muted">CASH ON DELIVERY</span>
          <h1>Payment records</h1>
          <p>
            {user?.role === "ADMIN"
              ? "Record cash collection after the order is delivered."
              : "Your payment is due when your order is delivered."}
          </p>
        </div>
        <button className="btn btn-outline-secondary" onClick={load.reload}>
          Refresh
        </button>
      </div>
      <LoadState {...load} retry={load.reload} />
      {!load.loading && !load.error && !load.data?.length && (
        <Empty
          title="No payments yet"
          text="Place an order to create a payment record."
        />
      )}
      <div className="order-list">
        {load.data?.map((p) => (
          <article className="panel order-card" key={p.id}>
            <div>
              <h3>Payment #{p.id.slice(0, 8).toUpperCase()}</h3>
              <p>{new Date(p.createdAt).toLocaleString()} · Cash on delivery</p>
            </div>
            <strong>{money(p.amount)}</strong>
            <span className="status">{p.status}</span>
            <Link to={"/orders/" + p.orderId}>View order →</Link>
            {user?.role === "ADMIN" && p.status === "PENDING" && (
              <div>
                <button
                  className="btn btn-sm btn-primary me-2"
                  disabled={!!busy}
                  onClick={() => update(p.id, "COMPLETED")}
                >
                  Confirm cash received
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  disabled={!!busy}
                  onClick={() => update(p.id, "FAILED")}
                >
                  Mark failed
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
