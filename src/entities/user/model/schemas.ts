import { z } from "zod";

const optionalPhoneSchema = z
  .string()
  .trim()
  .refine((value) => value === "" || /^[+()\d\s-]{7,20}$/.test(value), {
    message: "Введите корректный номер телефона",
  })
  .transform((value) => (value === "" ? undefined : value));

const requiredPhoneSchema = z
  .string()
  .trim()
  .min(1, "Телефон обязателен")
  .regex(/^[+()\d\s-]{7,20}$/, "Введите корректный номер телефона");

export const updateUserProfileSchema = z.object({
  name: z.string().trim().min(1, "Имя обязательно"),
  email: z
    .string()
    .trim()
    .min(1, "Электронная почта обязательна")
    .email("Введите корректный адрес электронной почты"),
  phone: optionalPhoneSchema.optional(),
});

export const addressSchema = z.object({
  fullName: z.string().trim().min(1, "Имя получателя обязательно"),
  phone: requiredPhoneSchema,
  country: z.string().trim().min(1, "Страна обязательна"),
  city: z.string().trim().min(1, "Город обязателен"),
  street: z.string().trim().min(1, "Улица обязательна"),
  postalCode: z.string().trim().min(1, "Почтовый индекс обязателен"),
});

export type UpdateUserProfileFormValues = z.input<
  typeof updateUserProfileSchema
>;
export type AddressFormValues = z.input<typeof addressSchema>;
