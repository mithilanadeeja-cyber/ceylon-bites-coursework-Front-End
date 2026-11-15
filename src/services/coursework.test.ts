import { describe, it, expect, beforeEach, vi } from "vitest";
import { changeQuantity, subtotal, deliveryFee, type Order } from "../types";
import { foods } from "./seed";
import { service } from "./demoApi";
const memory = new Map<string, string>();
vi.stubGlobal("localStorage", {
  getItem: (k: string) => memory.get(k) ?? null,
  setItem: (k: string, v: string) => memory.set(k, v),
  removeItem: (k: string) => memory.delete(k),
});
beforeEach(() => memory.clear());
describe("Cart calculations", () => {
  it("combines repeated dishes and calculates totals", () => {
    let cart = changeQuantity([], foods[0], 1);
    cart = changeQuantity(cart, foods[0], 1);
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(2);
    expect(subtotal(cart)).toBe(2500);
    expect(deliveryFee(cart)).toBe(250);
  });
  it("removes zero quantities and limits quantity to 20", () => {
    expect(
      changeQuantity([{ food: foods[0], quantity: 1 }], foods[0], -1),
    ).toEqual([]);
    expect(
      changeQuantity([{ food: foods[0], quantity: 20 }], foods[0], 1)[0]
        .quantity,
    ).toBe(20);
    expect(deliveryFee([])).toBe(0);
  });
});
describe("Demo authentication and data", () => {
  it("rejects invalid credentials", async () => {
    await expect(service.login("customer@demo.test", "bad")).rejects.toThrow();
  });
  it("registers a customer and rejects duplicate emails", async () => {
    const u = await service.signup(
      "Test Customer",
      "test@example.com",
      "Test1234!",
    );
    expect(u.role).toBe("CUSTOMER");
    expect((await service.login("test@example.com", "Test1234!")).id).toBe(
      u.id,
    );
    await expect(
      service.signup("Duplicate", "test@example.com", "Test1234!"),
    ).rejects.toThrow();
  });
  it("scopes order history and permits admin tracking", async () => {
    const customer = await service.login("customer@demo.test", "Demo123!");
    const admin = await service.login("admin@demo.test", "Demo123!");
    const order: Order = {
      id: "test-order",
      userId: customer.id,
      items: [{ food: foods[0], quantity: 1 }],
      total: 1500,
      address: "Test address only",
      phone: "0700000000",
      status: "Placed",
      paymentMethod: "Cash on delivery",
      paymentStatus: "Due on delivery",
      createdAt: new Date().toISOString(),
    };
    await service.placeOrder(order);
    expect(await service.orders({ ...customer, id: "another-user" })).toEqual(
      [],
    );
    await service.updateOrder({ ...order, status: "Preparing" });
    expect((await service.orders(customer))[0].status).toBe("Preparing");
    expect(await service.orders(admin)).toHaveLength(1);
  });
  it("supports category create/update/delete and blocks deleting an occupied category", async () => {
    await service.saveCategory({ id: "new", name: "Desserts" }, false);
    await service.saveCategory({ id: "new", name: "Sweets" }, true);
    expect((await service.categories()).find((c) => c.id === "new")?.name).toBe(
      "Sweets",
    );
    await service.deleteCategory("new");
    expect((await service.categories()).some((c) => c.id === "new")).toBe(
      false,
    );
    await expect(service.deleteCategory("rice")).rejects.toThrow();
  });
});
