import { describe, it, expect } from "vitest";
import { effectivePrice, discountPercent, installments } from "./pricing";

describe("pricing rules", () => {
  it("promo price applies only inside its date window", () => {
    const p = { price: 100, promo_price: 75, promo_start: "2026-01-01", promo_end: "2026-01-31" };
    expect(effectivePrice(p, new Date("2026-01-15"))).toBe(75);
    expect(effectivePrice(p, new Date("2026-02-15"))).toBe(100);
  });
  it("discount badge shows percentage off", () => {
    expect(discountPercent({ price: 100, promo_price: 75 })).toBe(25);
  });
  it("installments respect max count and minimum value", () => {
    expect(installments(90, 3, 20)).toEqual({ count: 3, value: 30 });
    expect(installments(50, 3, 20)).toEqual({ count: 2, value: 25 });
    expect(installments(30, 3, 20)).toBeNull();
  });
});
