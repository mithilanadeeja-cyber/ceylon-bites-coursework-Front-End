import axios from "axios";
import type { User, Food, Category, Order, CartItem } from "../types";
import { service as demo } from "./demoApi";
export const DEMO = import.meta.env.VITE_DEMO_MODE === "true";
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 15000,
});
let accessToken: string | null = null;
export function setToken(token: string | null) {
  accessToken = token;
}
api.interceptors.request.use((c) => {
  if (accessToken) c.headers.Authorization = `Bearer ${accessToken}`;
  return c;
});
api.interceptors.response.use(
  (r) => r,
  (e) => {
    if (e.response?.status === 401 && !e.config?.url?.startsWith("/auth/")) {
      setToken(null);
      window.dispatchEvent(new Event("auth-expired"));
    }
    return Promise.reject(e);
  },
);
export const errorMessage = (e: unknown) =>
  axios.isAxiosError(e)
    ? typeof e.response?.data?.message === "string"
      ? e.response.data.message
      : e.message
    : e instanceof Error
      ? e.message
      : "Something went wrong. Please try again.";
type WireFood = Omit<Food, "available"> & {
  status: "AVAILABLE" | "OUT_OF_STOCK";
};
type WireCart = { items: { food: WireFood; quantity: number }[] };
type WireOrder = {
  id: string;
  userId: string;
  items: {
    foodId: string;
    foodName: string;
    image: string;
    unitPrice: number;
    quantity: number;
  }[];
  total: number;
  address: string;
  phone: string;
  status: "PLACED" | "PREPARING" | "DELIVERED" | "CANCELLED";
  paymentMethod: "CASH_ON_DELIVERY";
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED";
  paymentId: string;
  createdAt: string;
};
export type PaymentRecord = {
  id: string;
  orderId: string;
  amount: number;
  method: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  createdAt: string;
};
export const foodFromWire = (f: WireFood): Food => ({
  ...f,
  available: f.status === "AVAILABLE",
});
const statusLabels = {
  PLACED: "Placed",
  PREPARING: "Preparing",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
} as const;
export const orderFromWire = (o: WireOrder): Order => ({
  ...o,
  status: statusLabels[o.status],
  paymentMethod: "Cash on delivery",
  paymentStatus: o.paymentStatus,
  items: o.items.map((i) => ({
    food: {
      id: i.foodId,
      name: i.foodName,
      image: i.image,
      price: i.unitPrice,
      description: "",
      categoryId: "",
      vegetarian: false,
      available: true,
    },
    quantity: i.quantity,
  })),
});
const foodInput = (f: Food) => ({
  name: f.name,
  description: f.description,
  price: f.price,
  categoryId: f.categoryId,
  image: f.image,
  vegetarian: f.vegetarian,
  status: f.available ? "AVAILABLE" : "OUT_OF_STOCK",
});
const mapCart = (c: WireCart): CartItem[] =>
  c.items.map((i) => ({ food: foodFromWire(i.food), quantity: i.quantity }));
export const service = {
  async login(email: string, password: string): Promise<User> {
    if (DEMO) return demo.login(email, password);
    const { data } = await api.post("/auth/login", { email, password });
    setToken(data.accessToken);
    return data.user;
  },
  async signup(name: string, email: string, password: string): Promise<User> {
    return DEMO
      ? demo.signup(name, email, password)
      : (await api.post("/auth/register", { name, email, password })).data;
  },
  async foods(): Promise<Food[]> {
    return DEMO
      ? demo.foods()
      : (await api.get<WireFood[]>("/foods")).data.map(foodFromWire);
  },
  async categories(): Promise<Category[]> {
    return DEMO ? demo.categories() : (await api.get("/categories")).data;
  },
  async saveCategory(c: Category, existing: boolean) {
    if (DEMO) return demo.saveCategory(c, existing);
    return (
      existing
        ? await api.put("/categories/" + c.id, { name: c.name })
        : await api.post("/categories", { name: c.name })
    ).data;
  },
  async deleteCategory(id: string) {
    if (DEMO) return demo.deleteCategory(id);
    await api.delete("/categories/" + id);
  },
  async saveFood(f: Food, existing: boolean) {
    if (DEMO) return demo.saveFood(f, existing);
    return (
      existing
        ? await api.put("/foods/" + f.id, foodInput(f))
        : await api.post("/foods", foodInput(f))
    ).data;
  },
  async deleteFood(id: string) {
    if (DEMO) return demo.deleteFood(id);
    await api.delete("/foods/" + id);
  },
  async cart(): Promise<CartItem[]> {
    return mapCart((await api.get<WireCart>("/cart")).data);
  },
  async addCart(foodId: string, quantity: number) {
    return mapCart(
      (await api.post<WireCart>("/cart/items", { foodId, quantity })).data,
    );
  },
  async updateCart(foodId: string, quantity: number) {
    return mapCart(
      (await api.put<WireCart>("/cart/items/" + foodId, { quantity })).data,
    );
  },
  async removeCart(foodId: string) {
    return mapCart((await api.delete<WireCart>("/cart/items/" + foodId)).data);
  },
  async orders(user: User): Promise<Order[]> {
    return DEMO
      ? demo.orders(user)
      : (
          await api.get<WireOrder[]>(
            user.role === "ADMIN" ? "/admin/orders" : "/orders",
          )
        ).data.map(orderFromWire);
  },
  async placeOrder(order: Order): Promise<Order> {
    if (DEMO) return demo.placeOrder(order);
    const { data } = await api.post<WireOrder>(
      "/orders",
      {
        address: order.address,
        phone: order.phone,
        paymentMethod: "CASH_ON_DELIVERY",
      },
      { headers: { "Idempotency-Key": order.id } },
    );
    return orderFromWire(data);
  },
  async updateOrder(order: Order) {
    if (DEMO) return demo.updateOrder(order);
    await api.put("/orders/" + order.id + "/status", {
      status: order.status.toUpperCase(),
    });
  },
  async cancelOrder(id: string) {
    return orderFromWire(
      (await api.put<WireOrder>("/orders/" + id + "/cancel")).data,
    );
  },
  async payments(): Promise<PaymentRecord[]> {
    return (await api.get("/payments")).data;
  },
  async updatePayment(id: string, status: PaymentRecord["status"]) {
    return (await api.put("/payments/" + id + "/status", { status })).data;
  },
  async profile(user: User): Promise<User> {
    return DEMO
      ? demo.profile(user)
      : (await api.put("/users/me", { name: user.name })).data;
  },
};
