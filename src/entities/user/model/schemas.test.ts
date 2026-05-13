import { describe, expect, it } from "vitest";
import { addressSchema, updateUserProfileSchema } from "./schemas";

describe("user validation schemas", () => {
  it("accepts a valid profile payload", () => {
    expect(
      updateUserProfileSchema.parse({
        name: "Danil",
        email: "danil@example.com",
        phone: "+7 999 123-45-67",
      }),
    ).toEqual({
      name: "Danil",
      email: "danil@example.com",
      phone: "+7 999 123-45-67",
    });
  });

  it("rejects invalid profile values", () => {
    const result = updateUserProfileSchema.safeParse({
      name: "",
      email: "not-email",
      phone: "12",
    });

    expect(result.success).toBe(false);
  });

  it("normalizes an empty optional phone to undefined", () => {
    expect(
      updateUserProfileSchema.parse({
        name: "Danil",
        email: "danil@example.com",
        phone: "",
      }),
    ).toEqual({
      name: "Danil",
      email: "danil@example.com",
      phone: undefined,
    });
  });

  it("requires address fields", () => {
    const result = addressSchema.safeParse({
      fullName: "",
      phone: "",
      country: "",
      city: "",
      street: "",
      postalCode: "",
    });

    expect(result.success).toBe(false);
  });

  it("accepts a valid address payload", () => {
    expect(
      addressSchema.parse({
        fullName: "Danil Marketplace",
        phone: "+7 999 123-45-67",
        country: "Russia",
        city: "Moscow",
        street: "Tverskaya Street 1",
        postalCode: "125009",
      }),
    ).toEqual({
      fullName: "Danil Marketplace",
      phone: "+7 999 123-45-67",
      country: "Russia",
      city: "Moscow",
      street: "Tverskaya Street 1",
      postalCode: "125009",
    });
  });
});
