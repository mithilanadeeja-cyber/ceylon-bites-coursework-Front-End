import axios from "axios";
import type { User, Food, Category, Order } from "../types";
import { foods as initialFoods, categories as initialCategories } from "./seed";
export const DEMO = true;
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  timeout: 10000,
});
let accessToken: string | null = null;
export const setToken = (token: string | null) => {
  accessToken = token;
};
api.interceptors.request.use((c) => {
  if (accessToken) c.headers.Authorization = `Bearer ${accessToken}`;
  return c;
});
export const errorMessage = (e: unknown) =>
  axios.isAxiosError(e)
    ? typeof e.response?.data?.message === "string"
      ? e.response.data.message
      : e.message
    : e instanceof Error
      ? e.message
      : "Something went wrong. Please try again.";
function read<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem("cb:" + key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  localStorage.setItem("cb:" + key, JSON.stringify(value));
}
async function result<T>(value: T) {
  await new Promise((r) => setTimeout(r, 180));
  return value;
}
type Account = User & { hash: string };
async function hash(value: string) {
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(bytes))
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("");
}
const strip = ({ hash: _, ...u }: Account): User => u;
export const service = {
  async login(email: string, password: string): Promise<User> {
    if (!DEMO) {
      const { data } = await api.post("/auth/login", { email, password });
      setToken(data.accessToken);
      return data.user;
    }
    if (email === "customer@demo.test" && password === "Demo123!")
      return result({
        id: "demo-customer",
        name: "Alex Perera",
        email,
        role: "CUSTOMER",
      });
    if (email === "admin@demo.test" && password === "Demo123!")
      return result({
        id: "demo-admin",
        name: "Restaurant Admin",
        email,
        role: "ADMIN",
      });
    const a = read<Account[]>("accounts", []).find((a) => a.email === email);
    if (!a || a.hash !== (await hash(password)))
      throw new Error("Email or password is incorrect.");
    return result(strip(a));
  },
  async signup(name: string, email: string, password: string): Promise<User> {
    if (!DEMO)
      return (await api.post("/auth/register", { name, email, password })).data;
    const all = read<Account[]>("accounts", []);
    if (all.some((a) => a.email === email) || email.endsWith("@demo.test"))
      throw new Error("This email is already registered or reserved.");
    const a: Account = {
      id: crypto.randomUUID(),
      name,
      email,
      role: "CUSTOMER",
      hash: await hash(password),
    };
    write("accounts", [...all, a]);
    return result(strip(a));
  },
  async foods(): Promise<Food[]> {
    return DEMO
      ? result(read("foods", initialFoods))
      : (await api.get("/foods")).data;
  },
  async categories(): Promise<Category[]> {
    return DEMO
      ? result(read("categories", initialCategories))
      : (await api.get("/categories")).data;
  },
  async saveCategory(c: Category, existing: boolean) {
    if (!DEMO)
      return (
        existing
          ? await api.put("/categories/" + c.id, c)
          : await api.post("/categories", c)
      ).data;
    const all = read<Category[]>("categories", initialCategories);
    write(
      "categories",
      existing ? all.map((x) => (x.id === c.id ? c : x)) : [...all, c],
    );
  },
  async deleteCategory(id: string) {
    if (!DEMO) {
      await api.delete("/categories/" + id);
      return;
    }
    if (read<Food[]>("foods", initialFoods).some((f) => f.categoryId === id))
      throw new Error(
        "Move or remove foods in this category before deleting it.",
      );
    write(
      "categories",
      read<Category[]>("categories", initialCategories).filter(
        (c) => c.id !== id,
      ),
    );
  },
  async saveFood(f: Food, existing: boolean) {
    if (!DEMO)
      return (
        existing
          ? await api.put("/foods/" + f.id, f)
          : await api.post("/foods", f)
      ).data;
    const all = read<Food[]>("foods", initialFoods);
    write(
      "foods",
      existing ? all.map((x) => (x.id === f.id ? f : x)) : [...all, f],
    );
  },
  async deleteFood(id: string) {
    if (!DEMO) {
      await api.delete("/foods/" + id);
      return;
    }
    write(
      "foods",
      read<Food[]>("foods", initialFoods).filter((f) => f.id !== id),
    );
  },
  async orders(user: User): Promise<Order[]> {
    return DEMO
      ? result(
          read<Order[]>("orders", []).filter(
            (o) => user.role === "ADMIN" || o.userId === user.id,
          ),
        )
      : (await api.get(user.role === "ADMIN" ? "/admin/orders" : "/orders"))
          .data;
  },
  async placeOrder(order: Order): Promise<Order> {
    if (!DEMO)
      return (
        await api.post("/orders", {
          items: order.items.map((i) => ({
            foodId: i.food.id,
            quantity: i.quantity,
          })),
          address: order.address,
          phone: order.phone,
          paymentMethod: order.paymentMethod,
        })
      ).data;
    write("orders", [order, ...read<Order[]>("orders", [])]);
    return result(order);
  },
  async updateOrder(order: Order) {
    if (!DEMO) {
      await api.put("/orders/" + order.id + "/status", {
        status: order.status,
      });
      return;
    }
    write(
      "orders",
      read<Order[]>("orders", []).map((o) => (o.id === order.id ? order : o)),
    );
  },
  async profile(user: User) {
    if (!DEMO) return (await api.put("/users/me", { name: user.name })).data;
    const all = read<Account[]>("accounts", []);
    write(
      "accounts",
      all.map((a) => (a.id === user.id ? { ...a, name: user.name } : a)),
    );
    return result(user);
  },
};
