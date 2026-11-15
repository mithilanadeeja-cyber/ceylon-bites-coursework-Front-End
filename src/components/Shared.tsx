import { useEffect, useState, type ReactNode } from "react";
import { Navigate, Link, useLocation } from "react-router";
import { Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { useApp } from "../context/AppContext";
import { errorMessage } from "../services/api";
export const money = (n: number) => "Rs. " + n.toLocaleString("en-LK");
export const photo = (id: string) =>
  id.startsWith("https://")
    ? id
    : `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;
export function useLoad<T>(loader: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    loader()
      .then((d) => {
        if (active) setData(d);
      })
      .catch((e) => {
        if (active) setError(errorMessage(e));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [...deps, version]);
  return { data, error, loading, reload: () => setVersion((v) => v + 1) };
}
export function LoadState({
  loading,
  error,
  retry,
}: {
  loading: boolean;
  error: string;
  retry: () => void;
}) {
  return loading ? (
    <div className="empty" role="status">
      Preparing something good…
    </div>
  ) : error ? (
    <div className="alert alert-danger" role="alert">
      {error}{" "}
      <button onClick={retry} className="btn btn-outline-danger ms-2">
        Try again
      </button>
    </div>
  ) : null;
}
export function Guard({
  children,
  admin = false,
}: {
  children: ReactNode;
  admin?: boolean;
}) {
  const { user } = useApp(),
    location = useLocation();
  if (!user)
    return (
      <Navigate to="/sign-in" state={{ from: location.pathname }} replace />
    );
  return admin && user.role !== "ADMIN" ? (
    <div className="empty">
      <h2>Access restricted</h2>
      <p>This page is for restaurant administrators.</p>
      <Link to="/">Back to menu</Link>
    </div>
  ) : (
    children
  );
}
export function Quantity({
  value,
  onChange,
}: {
  value: number;
  onChange: (d: number) => void;
}) {
  return (
    <div className="quantity">
      <button aria-label="Decrease quantity" onClick={() => onChange(-1)}>
        <Minus size={14} />
      </button>
      <span>{value}</span>
      <button
        aria-label="Increase quantity"
        disabled={value >= 20}
        onClick={() => onChange(1)}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
export function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty">
      <ShoppingBag size={42} />
      <h2>{title}</h2>
      <p>{text}</p>
      <Link className="btn btn-primary" to="/">
        Explore the menu <ArrowRight size={16} />
      </Link>
    </div>
  );
}
