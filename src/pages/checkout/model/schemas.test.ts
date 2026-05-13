import { describe, expect, it } from "vitest";
import { checkoutSchema } from "./schemas";

describe("checkout schema", () => {
  it("accepts a valid checkout payload", () => {
    expect(
      checkoutSchema.parse({
        addressId: "addr-1",
        paymentMethod: "card_on_delivery",
        comment: "Leave at reception",
      }),
    ).toEqual({
      addressId: "addr-1",
      paymentMethod: "card_on_delivery",
      comment: "Leave at reception",
    });
  });

  it("requires an address", () => {
    const result = checkoutSchema.safeParse({
      addressId: "",
      paymentMethod: "card_on_delivery",
      comment: "",
    });

    expect(result.success).toBe(false);
  });

  it("requires a known payment method", () => {
    const result = checkoutSchema.safeParse({
      addressId: "addr-1",
      paymentMethod: "crypto",
      comment: "",
    });

    expect(result.success).toBe(false);
  });

  it("normalizes an empty optional comment to undefined", () => {
    expect(
      checkoutSchema.parse({
        addressId: "addr-1",
        paymentMethod: "cash_on_delivery",
        comment: "",
      }),
    ).toEqual({
      addressId: "addr-1",
      paymentMethod: "cash_on_delivery",
      comment: undefined,
    });
  });
});
