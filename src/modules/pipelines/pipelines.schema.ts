import {z} from "zod"

export const PipelineCreationSchema = z.object({
    body: z.object({
    name: z.string().min(3),
    sourcePath: z.string().min(1),
    actionType: z.literal("aoe4_match_summary"),
    config: z.object({
        apiUrl: z.string().url()
    }).optional() 
})
})

export const pipelineIdSchema = z.object({
    id: z.string().uuid()
})