export type User = {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
};
export type Category = { id: string; name: string };
export type Food = {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image: string;
  vegetarian: boolean;
  available: boolean;
};
export type CartItem = { food: Food; quantity: number };
export type Order = {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  address: string;
  phone: string;
  status: "Placed" | "Preparing" | "Delivered" | "Cancelled";
  paymentMethod: "Cash on delivery" | "Demo card";
  paymentStatus: string;
  paymentId?: string;
  createdAt: string;
};
export const subtotal = (items: CartItem[]) =>
  items.reduce((s, i) => s + i.food.price * i.quantity, 0);
export const deliveryFee = (items: CartItem[]) => (items.length ? 250 : 0);
export function changeQuantity(
  items: CartItem[],
  food: Food,
  delta: number,
): CartItem[] {
  const old = items.find((i) => i.food.id === food.id);
  const quantity = (old?.quantity ?? 0) + delta;
  if (quantity <= 0) return items.filter((i) => i.food.id !== food.id);
  if (quantity > 20) return items;
  return old
    ? items.map((i) => (i.food.id === food.id ? { ...i, quantity } : i))
    : [...items, { food, quantity }];
}
