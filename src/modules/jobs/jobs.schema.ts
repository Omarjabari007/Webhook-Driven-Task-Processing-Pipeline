import { z } from "zod";

export const jobIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});