export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
};

export type Address = {
  id: string;
  fullName: string;
  phone: string;
  country: string;
  city: string;
  street: string;
  postalCode: string;
  isDefault?: boolean;
};

export type UpdateUserProfilePayload = {
  name: string;
  email: string;
  phone?: string;
};

export type AddAddressPayload = {
  fullName: string;
  phone: string;
  country: string;
  city: string;
  street: string;
  postalCode: string;
};

export type UpdateAddressPayload = AddAddressPayload & {
  id: string;
};
