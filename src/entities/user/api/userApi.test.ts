import { beforeEach, describe, expect, it } from "vitest";
import {
  addAddress,
  getCurrentUser,
  getUserAddresses,
  removeAddress,
  updateAddress,
  updateUserProfile,
} from "./userApi";
import { setMockAddresses, setMockCurrentUser } from "@/shared/api/mock-data";
import type { Address, User } from "../model/types";

const user: User = {
  id: "user-test",
  name: "Test User",
  email: "test@example.com",
  phone: "+1 555 123 4567",
};

const address: Address = {
  id: "addr-test",
  fullName: "Test User",
  phone: "+1 555 123 4567",
  country: "United States",
  city: "New York",
  street: "5th Avenue 1",
  postalCode: "10001",
  isDefault: true,
};

beforeEach(() => {
  setMockCurrentUser(user);
  setMockAddresses([address]);
});

describe("user API", () => {
  it("updates the current user profile", async () => {
    await updateUserProfile({
      name: "Updated User",
      email: "updated@example.com",
      phone: undefined,
    });

    await expect(getCurrentUser()).resolves.toMatchObject({
      id: user.id,
      name: "Updated User",
      email: "updated@example.com",
      phone: undefined,
    });
  });

  it("adds an address", async () => {
    const createdAddress = await addAddress({
      fullName: "Second User",
      phone: "+1 555 987 6543",
      country: "United States",
      city: "Boston",
      street: "Market Street 2",
      postalCode: "02108",
    });

    await expect(getUserAddresses()).resolves.toContainEqual(createdAddress);
  });

  it("marks the first added address as default", async () => {
    setMockAddresses([]);

    const createdAddress = await addAddress({
      fullName: "First User",
      phone: "+1 555 987 6543",
      country: "United States",
      city: "Boston",
      street: "Market Street 2",
      postalCode: "02108",
    });

    expect(createdAddress.isDefault).toBe(true);
  });

  it("updates an address", async () => {
    await updateAddress({
      id: address.id,
      fullName: "Updated Recipient",
      phone: address.phone,
      country: address.country,
      city: "Chicago",
      street: address.street,
      postalCode: address.postalCode,
    });

    await expect(getUserAddresses()).resolves.toContainEqual({
      ...address,
      fullName: "Updated Recipient",
      city: "Chicago",
    });
  });

  it("rejects update for an unknown address", async () => {
    await expect(
      updateAddress({
        id: "missing-address",
        fullName: "Missing User",
        phone: "+1 555 111 2222",
        country: "United States",
        city: "Chicago",
        street: "Unknown Street",
        postalCode: "60601",
      }),
    ).rejects.toThrow("Адрес не найден");
  });

  it("removes an address", async () => {
    await removeAddress(address.id);

    await expect(getUserAddresses()).resolves.toEqual([]);
  });
});
