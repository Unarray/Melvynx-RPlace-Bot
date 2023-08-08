import { z } from "zod";

export const envDTO = z.object({
  SOCKET_COUNT: z.string().regex(/^\d+$/).transform(Number)
});