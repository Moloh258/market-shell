import { assertFound, mockRequest } from "@/shared/api/client";
import {
  mockAddresses,
  mockCurrentUser,
  setMockAddresses,
  setMockCurrentUser,
} from "@/shared/api/mock-data";
import type {
  AddAddressPayload,
  Address,
  UpdateAddressPayload,
  UpdateUserProfilePayload,
  User,
} from "../model/types";

function createAddressId(): string {
  return `addr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function getCurrentUser(): Promise<User> {
  return mockRequest(mockCurrentUser);
}

export function getUserAddresses(): Promise<Address[]> {
  return mockRequest(mockAddresses);
}

export async function updateUserProfile(
  payload: UpdateUserProfilePayload,
): Promise<User> {
  const updatedUser: User = {
    ...mockCurrentUser,
    ...payload,
  };

  setMockCurrentUser(updatedUser);
  return mockRequest(updatedUser);
}

export async function addAddress(
  payload: AddAddressPayload,
): Promise<Address> {
  const address: Address = {
    id: createAddressId(),
    ...payload,
    isDefault: mockAddresses.length === 0,
  };

  setMockAddresses([...mockAddresses, address]);
  return mockRequest(address);
}

export async function updateAddress(
  payload: UpdateAddressPayload,
): Promise<Address> {
  const existingAddress = assertFound(
    mockAddresses.find((address) => address.id === payload.id),
    "Адрес не найден",
  );
  const updatedAddress: Address = {
    ...existingAddress,
    ...payload,
  };

  setMockAddresses(
    mockAddresses.map((address) =>
      address.id === payload.id ? updatedAddress : address,
    ),
  );

  return mockRequest(updatedAddress);
}

export async function removeAddress(addressId: string): Promise<void> {
  setMockAddresses(mockAddresses.filter((address) => address.id !== addressId));
  await mockRequest(undefined);
}
