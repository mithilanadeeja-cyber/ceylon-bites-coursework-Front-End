import { describe, it, expect } from "vitest";
import { foodFromWire, orderFromWire } from "./api";
describe("Spring Boot API mapping", () => {
  it("maps exact backend food statuses", () => {
    const food = {
      id: "f",
      name: "Rice",
      description: "Rice",
      price: 1000,
      categoryId: "c",
      image: "photo",
      vegetarian: false,
      status: "OUT_OF_STOCK" as const,
    };
    expect(foodFromWire(food).available).toBe(false);
    expect(foodFromWire({ ...food, status: "AVAILABLE" }).available).toBe(true);
  });
  it("preserves historic prices and maps order/payment data", () => {
    const o = orderFromWire({
      id: "o",
      userId: "u",
      items: [
        {
          foodId: "f",
          foodName: "Historic dish",
          image: "photo",
          unitPrice: 800,
          quantity: 2,
        },
      ],
      total: 1850,
      address: "Test address",
      phone: "0700000000",
      status: "PREPARING",
      paymentMethod: "CASH_ON_DELIVERY",
      paymentStatus: "PENDING",
      paymentId: "p",
      createdAt: "2026-11-15T10:00:00Z",
    });
    expect(o.status).toBe("Preparing");
    expect(o.items[0].food.price).toBe(800);
    expect(o.paymentId).toBe("p");
    expect(o.paymentStatus).toBe("PENDING");
  });
});
