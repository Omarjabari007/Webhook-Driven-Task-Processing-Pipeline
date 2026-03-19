import {z} from "zod"

export const webhookSchema = z.object({
    params: z.object({
        sourcePath: z.string().min(1)
    }),
    body: z.any()
});