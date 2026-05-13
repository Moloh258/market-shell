import { z } from "zod";
import type { PaymentMethod } from "@/entities/order/model/types";

export const paymentMethods = [
  "card_on_delivery",
  "cash_on_delivery",
] as const satisfies readonly PaymentMethod[];

export const checkoutSchema = z.object({
  addressId: z.string().min(1, "Выберите адрес доставки"),
  paymentMethod: z.enum(paymentMethods, {
    message: "Выберите способ оплаты",
  }),
  comment: z
    .string()
    .trim()
    .max(500, "Комментарий должен быть не длиннее 500 символов")
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
});

export type CheckoutFormValues = z.input<typeof checkoutSchema>;
export type CheckoutPayload = z.output<typeof checkoutSchema>;
