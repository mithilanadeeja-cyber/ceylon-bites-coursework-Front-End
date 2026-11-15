import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router";
import type { User, CartItem, Food } from "../types";
import { changeQuantity } from "../types";
import { DEMO, setToken, service, errorMessage } from "../services/api";
type State = {
  user: User | null;
  setUser: (u: User | null) => void;
  cart: CartItem[];
  change: (f: Food, d: number) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clear: () => void;
  notice: string;
  notify: (s: string) => void;
  cartBusy: boolean;
  cartError: string;
  refreshCart: () => Promise<void>;
};
const Context = createContext<State | null>(null);
export function AppProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, updateUser] = useState<User | null>(() => {
      try {
        return DEMO
          ? JSON.parse(sessionStorage.getItem("cb:user") || "null")
          : null;
      } catch {
        return null;
      }
    }),
    [cart, setCart] = useState<CartItem[]>([]),
    [notice, notify] = useState(""),
    [cartBusy, setBusy] = useState(false),
    [cartError, setError] = useState("");
  const lock = useRef(false);
  const currentUser = useRef(user);
  currentUser.current = user;
  const cartRef = useRef(cart);
  cartRef.current = cart;
  useEffect(() => {
    if (notice) {
      const id = setTimeout(() => notify(""), 4200);
      return () => clearTimeout(id);
    }
  }, [notice]);
  const setUser = (u: User | null) => {
    if (!u || (user && user.id !== u.id)) setCart([]);
    updateUser(u);
    if (DEMO) sessionStorage.setItem("cb:user", JSON.stringify(u));
    if (!u) setToken(null);
  };
  async function refreshCart() {
    if (DEMO || !currentUser.current) return;
    const id = currentUser.current.id;
    setBusy(true);
    setError("");
    try {
      const items = await service.cart();
      if (currentUser.current?.id === id) setCart(items);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (!DEMO && user) void refreshCart();
  }, [user?.id]);
  useEffect(() => {
    const expired = () => {
      updateUser(null);
      setCart([]);
      notify("Your session expired. Please sign in again.");
      navigate("/sign-in");
    };
    window.addEventListener("auth-expired", expired);
    return () => window.removeEventListener("auth-expired", expired);
  }, [navigate]);
  async function change(f: Food, d: number) {
    if (DEMO) {
      setCart((c) => changeQuantity(c, f, d));
      if (d > 0) notify(f.name + " added to your cart");
      return;
    }
    if (!user) {
      notify("Sign in to save dishes to your cart.");
      navigate("/sign-in");
      return;
    }
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    const id = user.id;
    try {
      const old = cartRef.current.find((i) => i.food.id === f.id);
      const n = (old?.quantity ?? 0) + d;
      if (n > 20) return;
      const items =
        n <= 0
          ? await service.removeCart(f.id)
          : old
            ? await service.updateCart(f.id, n)
            : await service.addCart(f.id, n);
      if (currentUser.current?.id === id) setCart(items);
      if (d > 0) notify("Cart updated");
    } catch (e) {
      setError(errorMessage(e));
      notify(errorMessage(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function remove(id: string) {
    if (DEMO) {
      setCart((c) => c.filter((i) => i.food.id !== id));
      return;
    }
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      setCart(await service.removeCart(id));
      setError("");
    } catch (e) {
      setError(errorMessage(e));
      notify(errorMessage(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <Context.Provider
      value={{
        user,
        setUser,
        cart,
        change,
        remove,
        clear: () => setCart([]),
        notice,
        notify,
        cartBusy,
        cartError,
        refreshCart,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useApp() {
  const c = useContext(Context);
  if (!c) throw Error("Missing provider");
  return c;
}
