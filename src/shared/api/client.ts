import { ApiError } from "./errors";

const MOCK_LATENCY_MS = 200;

export async function mockRequest<TData>(data: TData): Promise<TData> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
  return structuredClone(data);
}

export function assertFound<TData>(
  data: TData | undefined,
  message = "Ресурс не найден",
): TData {
  if (!data) {
    throw new ApiError(message, 404);
  }

  return data;
}
