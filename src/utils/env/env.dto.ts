import { z } from "zod";

export const envDTO = z.object({
  SOCKET_COUNT: z.number().positive()
});