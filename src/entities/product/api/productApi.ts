import { mockRequest } from "@/shared/api/client";
import { mockProducts } from "@/shared/api/mock-data";

export function getProducts() {
  return mockRequest(mockProducts);
}
