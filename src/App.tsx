import { useState, useEffect } from "react";
import { Routes, Route, NavLink, Link, useLocation } from "react-router";
import {
  ShoppingBag,
  MapPin,
  Menu as MenuIcon,
  X,
  ArrowUpRight,
} from "lucide-react";
import { useApp } from "./context/AppContext";
import { DEMO } from "./services/api";
import { Guard, Empty } from "./components/Shared";
import Menu from "./pages/Menu";
import Auth from "./pages/Auth";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Manage from "./pages/Manage";
import Profile from "./pages/Profile";
import Payments from "./pages/Payments";
export default function App() {
  const { user, setUser, cart, notice } = useApp(),
    location = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <>
      <div className="topline">
        <span>Local flavours. Everyday favourites.</span>
        <span>
          <MapPin size={12} /> A taste of Sri Lanka
        </span>
      </div>
      <header>
        <div className="nav-inner">
          <Link to="/" className="brand">
            <span className="brand-icon">c.</span>
            <span>
              ceylon<span className="brand-light">bites</span>
              <small>GOOD FOOD, CLOSER.</small>
            </span>
          </Link>
          <nav className={open ? "nav-links open" : "nav-links"}>
            <NavLink to="/" end>
              Our menu
            </NavLink>
            <NavLink to="/orders">My orders</NavLink>
            {user && <NavLink to="/payments">Payments</NavLink>}
            {user?.role === "ADMIN" && (
              <NavLink to="/manage">Manage menu</NavLink>
            )}
          </nav>
          <div className="nav-actions">
            {user ? (
              <div className="account-actions">
                <Link to="/profile">Hi, {user.name.split(" ")[0]}</Link>
                <button onClick={() => setUser(null)}>Sign out</button>
              </div>
            ) : (
              <Link className="signin" to="/sign-in">
                Sign in <ArrowUpRight size={15} />
              </Link>
            )}
            <Link
              to="/cart"
              className="cart-link"
              aria-label={
                "Cart with " +
                cart.reduce((s, i) => s + i.quantity, 0) +
                " items"
              }
            >
              <ShoppingBag size={18} />
              <span>Cart</span>
              <b>{cart.reduce((s, i) => s + i.quantity, 0)}</b>
            </Link>
            <button
              className="mobile-toggle icon-button"
              onClick={() => setOpen(!open)}
              aria-label="Toggle navigation"
              aria-expanded={open}
            >
              {open ? <X /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>
      {DEMO && (
        <div className="demo-strip">
          <span className="dot" /> Coursework demo <span>·</span> Sample menu,
          simulated orders & payments. No real deliveries.
        </div>
      )}
      <main>
        <Routes>
          <Route path="/" element={<Menu />} />
          <Route path="/foods" element={<Menu />} />
          <Route path="/categories" element={<Menu />} />
          <Route path="/sign-in" element={<Auth key="login" />} />
          <Route path="/sign-up" element={<Auth key="signup" signup />} />
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/checkout"
            element={
              <Guard>
                <Cart checkout />
              </Guard>
            }
          />
          <Route
            path="/orders"
            element={
              <Guard>
                <Orders />
              </Guard>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <Guard>
                <Orders />
              </Guard>
            }
          />
          <Route
            path="/payments"
            element={
              <Guard>
                <Payments />
              </Guard>
            }
          />
          <Route
            path="/profile"
            element={
              <Guard>
                <Profile />
              </Guard>
            }
          />
          <Route
            path="/manage"
            element={
              <Guard admin>
                <Manage />
              </Guard>
            }
          />
          <Route
            path="*"
            element={
              <Empty
                title="A little off the menu"
                text="We could not find that page. Let’s get you back to something good."
              />
            }
          />
        </Routes>
      </main>
      <footer>
        <Link className="brand footer-brand" to="/">
          ceylon<span className="brand-light">bites</span>
        </Link>
        <span>Good food brings us together.</span>
        <small>
          © {new Date().getFullYear()} Ceylon Bites · Coursework project
        </small>
      </footer>
      {notice && (
        <div className="toast-message" role="status">
          {notice}
        </div>
      )}
    </>
  );
}
